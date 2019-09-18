using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using GTANetworkAPI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using VRPC.Model.Server;

namespace VRPC
{
    /// <summary>
    /// Represents the serverside implementation of the v-rpc framework.
    /// </summary>
    public class Server : Script
    {
        private static readonly bool EnableDebug = IsDebugEnvironment();
        private static readonly Dictionary<int, Action<JObject>> pendingRequests = new Dictionary<int, Action<JObject>>();
        private static readonly object pendingRequestsLock = new object();
        private static readonly Dictionary<string, Action<Client, JObject>> asyncProcedures = new Dictionary<string, Action<Client, JObject>>();
        private static readonly object asyncProceduresLock = new object();
        private static readonly Dictionary<string, Action<Client, JObject>> syncProcedures = new Dictionary<string, Action<Client, JObject>>();
        private static readonly object syncProceduresLock = new object();

        private static bool IsDebugEnvironment()
        {
            try
            {
                var env = Environment.GetEnvironmentVariable("VRPC_DEBUG");

                if (!bool.TryParse(env, out bool isDebug)) return false;

                return isDebug;
            } catch (Exception)
            {
                return false;
            }
        }

        [RemoteEvent("vrpc:nr")]
        private void EventNoReply(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            JObject requestObject;

            try
            {
                requestObject = JObject.Parse(requestStr);
            }
            catch (Exception e)
            {
                if (EnableDebug)
                    Console.WriteLine($"[VRPC] no reply request could not be parsed:\n${e.ToString()}");
                return;
            }

            if (requestObject == null) return;
            if (requestObject["Name"] == null) return;

            lock (asyncProceduresLock)
            {
                if (!asyncProcedures.TryGetValue((string)requestObject["Name"], out Action<Client, JObject> action)) return;

                action(player, requestObject);
            }
        }

        [RemoteEvent("vrpc:rtb")]
        private void EventReplyToBrowser(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            JObject requestObject;

            try
            {
                requestObject = JObject.Parse(requestStr);
            }
            catch (Exception e)
            {
                if (EnableDebug)
                    Console.WriteLine($"[VRPC] browser request could not be parsed:\n${e.ToString()}");
                return;
            }

            if (requestObject == null) return;
            if (requestObject["Name"] == null) return;

            lock (syncProceduresLock)
            {
                if (!syncProcedures.TryGetValue((string)requestObject["Name"], out Action<Client, JObject> action)) return;

                // detach from RageMP server API
                Task.Run(() => action(player, requestObject)).ConfigureAwait(false);
            }
        }

        [RemoteEvent("vrpc:rtc")]
        private void EventReplyToClient(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            JObject requestObject;

            try
            {
                requestObject = JObject.Parse(requestStr);
            } catch (Exception e)
            {
                if (EnableDebug)
                    Console.WriteLine($"[VRPC] client request could not be parsed:\n${e.ToString()}");
                return;
            }

            if (requestObject == null) return;
            if (requestObject["Name"] == null) return;

            lock (syncProceduresLock)
            {
                if (!syncProcedures.TryGetValue((string)requestObject["Name"], out Action<Client, JObject> action)) return;

                Task.Run(() => action(player, requestObject)).ConfigureAwait(false);
            }
        }

        [RemoteEvent("vrpc:rfb")]
        private void EventReceiveFromBrowser(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var resultStr = (string)args[0];

            JObject resultObject;

            try
            {
                resultObject = JObject.Parse(resultStr);
            } catch (Exception e)
            {
                if (EnableDebug)
                    Console.WriteLine($"[VRPC] browser result could not be parsed:\n{e.ToString()}");
                return;
            }

            if (resultObject["Id"] == null) return;

            lock (pendingRequestsLock)
            {
                if (!pendingRequests.TryGetValue((int)resultObject["Id"], out Action<JObject> action)) return;

                action(resultObject);
            }
        }

        [RemoteEvent("vrpc:rfc")]
        private void EventReceiveFromClient(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var resultStr = (string)args[0];

            JObject resultObject;

            try
            {
                resultObject = JObject.Parse(resultStr);
            }
            catch (Exception e)
            {
                if (EnableDebug)
                    Console.WriteLine($"[VRPC] client result could not be parsed:\n{e.ToString()}");
                return;
            }

            if (resultObject["Id"] == null) return;

            lock (pendingRequestsLock)
            {
                if (!pendingRequests.TryGetValue((int)resultObject["Id"], out Action<JObject> action)) return;

                action(resultObject);
            }
        }

        /// <summary>
        /// Registers a new asynchronous procedure
        /// </summary>
        /// <typeparam name="TArgs">Action argument type</typeparam>
        /// <param name="name">The name of the procedure</param>
        /// <param name="action">The method of the procedure</param>
        public static void RegisterAsyncProcedure<TArgs>(string name, Action<Client, TArgs> action)
        {
            lock (asyncProceduresLock) {
                if (asyncProcedures.ContainsKey(name)) return;

                asyncProcedures.Add(name, (player, requestObject) => {
                    AsyncRequest<TArgs> request;

                    try
                    {
                        request = requestObject.ToObject<AsyncRequest<TArgs>>();
                    } catch (Exception e)
                    {
                        if (EnableDebug)
                            Console.WriteLine($"[VRPC] the async procedure arguments of '{requestObject["Name"]}' could not be parsed:\n{e.ToString()}");
                        return;
                    }

                    Task.Run(() => action(player, request.Arguments)).ConfigureAwait(false);
                });
            }
        }

        /// <summary>
        /// Registers a new synchronous procedure
        /// </summary>
        /// <typeparam name="TArgs">Action argument type</typeparam>
        /// <typeparam name="TResult">Action result type</typeparam>
        /// <param name="name">The name of the procedure</param>
        /// <param name="func">The method of the procedure</param>
        public static void RegisterSyncProcedure<TArgs, TResult>(string name, Func<Client, TArgs, TResult> func)
        {
            lock (syncProceduresLock)
            {
                if (syncProcedures.ContainsKey(name)) return;

                syncProcedures.Add(name, async (player, requestObject) => {
                    // check whether its a browser or client request
                    if (requestObject["BrowserId"] == null)
                    {
                        Request<TArgs> request;

                        try
                        {
                            request = requestObject.ToObject<Request<TArgs>>();
                        }
                        catch (Exception e)
                        {
                            if (EnableDebug)
                                Console.WriteLine($"[VRPC] the sync procedure arguments of '{requestObject["Name"]}' could not be parsed:\n{e.ToString()}");
                            return;
                        }

                        Task<Result<TResult>> t = new Task<Result<TResult>>(() => new Result<TResult>(request.Name, request.Id, request.Source, func(player, request.Arguments)));
                        t.Start();
                        player.TriggerEvent("vrpc:rfs", JsonConvert.SerializeObject(await t));
                    } else
                    {
                        BrowserRequest<TArgs> request;

                        try
                        {
                            request = requestObject.ToObject<BrowserRequest<TArgs>>();
                        }
                        catch (Exception e)
                        {
                            if (EnableDebug)
                                Console.WriteLine($"[VRPC] the sync procedure arguments of '{requestObject["Name"]}' could not be parsed:\n{e.ToString()}");
                            return;
                        }

                        Task<BrowserResult<TResult>> t = new Task<BrowserResult<TResult>>(() => new BrowserResult<TResult>(request.Name, request.Id, request.BrowserId, request.Source, func(player, request.Arguments)));
                        t.Start();
                        player.TriggerEvent("vrpc:rsb", JsonConvert.SerializeObject(await t));
                    }
                });
            }
        }

        /// <summary>
        /// Calls an asynchronous procedure on a player
        /// </summary>
        /// <typeparam name="TArgs">The argument type</typeparam>
        /// <param name="player">The player to call the procedure on</param>
        /// <param name="name">The name of the procedure</param>
        /// <param name="args">The arguments to pass</param>
        public static void CallClientAsync<TArgs>(Client player, string name, TArgs args)
        {
            player.TriggerEvent("vrpc:nr", JsonConvert.SerializeObject(new AsyncRequest<TArgs>(name, args)));
        }

        /// <summary>
        /// Calls a synchronous procedure on a player
        /// </summary>
        /// <typeparam name="TArgs">The argument type</typeparam>
        /// <typeparam name="TResult">The result type</typeparam>
        /// <param name="player">The player to call the procedure on</param>
        /// <param name="name">The name of the procedure</param>
        /// <param name="args">The arguments to pass</param>
        /// <returns>Returns a promise-like type to attach callback listeners</returns>
        public static Promise<TResult> CallClientSync<TArgs, TResult>(Client player, string name, TArgs args)
        {
            var requestId = GenerateId();

            var completionSource = new TaskCompletionSource<TResult>();
            lock (pendingRequestsLock)
            {
                pendingRequests[requestId] = (JObject resultObject) =>
                {
                    if (resultObject["BrowserId"] != null) return;

                    Result<TResult> result;

                    try
                    {
                        result = resultObject.ToObject<Result<TResult>>();
                    } catch (Exception e)
                    {
                        if (EnableDebug)
                            Console.WriteLine($"[VRPC] the pending client result data of '{resultObject["Name"]}' could not be parsed:\n{e.ToString()}");
                        return;
                    }

                    completionSource.SetResult(result.Data);
                };
            }

            var promise = new Promise<TResult>(completionSource, () => player.TriggerEvent("vrpc:rts", JsonConvert.SerializeObject(new Request<TArgs>(name, requestId, Source.Server, args))));

            promise.OnComplete += () =>
            {
                lock (pendingRequestsLock) { pendingRequests.Remove(requestId); }
            };

            return promise;
        }

        /// <summary>
        /// Calls a asynchronous procedure in a browser
        /// </summary>
        /// <typeparam name="TArgs">The argument type</typeparam>
        /// <param name="player">The player to call the procedure on</param>
        /// <param name="name">The name of the procedure</param>
        /// <param name="browserId">The browser id of the target browser</param>
        /// <param name="args">The arguments to pass</param>
        public static void CallBrowserAsync<TArgs>(Client player, string name, int browserId, TArgs args)
        {
            player.TriggerEvent("vrpc:rnb", JsonConvert.SerializeObject(new AsyncBrowserRequest<TArgs>(name, browserId, args)));
        }

        /// <summary>
        /// Calls a synchronous procedure in a browser
        /// </summary>
        /// <typeparam name="TArgs">The argument type</typeparam>
        /// <typeparam name="TResult">The result type</typeparam>
        /// <param name="player">The player to call the procedure on</param>
        /// <param name="name">The name of the procedure</param>
        /// <param name="browserId">The browser id of the target browser</param>
        /// <param name="args">The arguments to pass</param>
        /// <returns>Returns a promise-like type to attach callback listeners</returns>
        public static Promise<TResult> CallBrowserSync<TArgs, TResult>(Client player, string name, int browserId, TArgs args)
        {
            var requestId = GenerateId();

            var completionSource = new TaskCompletionSource<TResult>();

            lock (pendingRequestsLock)
            {
                pendingRequests[requestId] = (JObject resultObject) =>
                {
                    if (resultObject["BrowserId"] == null) return;

                    Result<TResult> result;

                    try
                    {
                        result = result = resultObject.ToObject<Result<TResult>>(); ;
                    }
                    catch (Exception e)
                    {
                        if (EnableDebug)
                            Console.WriteLine($"[VRPC] the pending browser result data of '{resultObject["Name"]}' could not be parsed:\n{e.ToString()}");
                        return;
                    }

                    completionSource.SetResult(result.Data);
                };
            }

            var promise = new Promise<TResult>(completionSource, () => player.TriggerEvent("vrpc:rsb", JsonConvert.SerializeObject(new BrowserRequest<TArgs>(name, requestId, browserId, Source.Server, args))));

            promise.OnComplete += () =>
            {
                lock (pendingRequestsLock) { pendingRequests.Remove(requestId); }
            };

            return promise;
        }

        private static int GenerateId()
        {
            Random random = new Random();
            return Int32.MaxValue - random.Next(Int32.MaxValue) - random.Next(Int32.MaxValue);
        }
    }
}
