using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using GTANetworkAPI;
using Newtonsoft.Json;
using VRPC.Model.Server;

namespace VRPC
{
    /// <summary>
    /// Represents the serverside implementation of the v-rpc framework.
    /// </summary>
    public class Server : Script
    {
        private static readonly Dictionary<int, Action<Result>> pendingRequests = new Dictionary<int, Action<Result>>();
        private static readonly object pendingRequestsLock = new object();
        private static readonly Dictionary<string, Action<Client, dynamic>> asyncProcedures = new Dictionary<string, Action<Client, dynamic>>();
        private static readonly object asyncProceduresLock = new object();
        private static readonly Dictionary<string, Func<Client, dynamic, dynamic>> syncProcedures = new Dictionary<string, Func<Client, dynamic, dynamic>>();
        private static readonly object syncProceduresLock = new object();

        [RemoteEvent("vrpc:nr")]
        private void EventNoReply(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            var request = JsonConvert.DeserializeObject<AsyncRequest<dynamic>>(requestStr);
            if (request == null) return;

            lock (asyncProceduresLock)
            {
                if (!asyncProcedures.TryGetValue(request.Name, out Action<Client, dynamic> action)) return;
                Task.Run(() => {
                    action(player, request.Arguments);
                }).ConfigureAwait(false);
                return;
            }
        }

        [RemoteEvent("vrpc:rtb")]
        private void EventReplyToBrowser(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            var request = JsonConvert.DeserializeObject<BrowserRequest<dynamic>>(requestStr);
            if (request == null) return;

            lock (syncProceduresLock)
            {
                if (!syncProcedures.TryGetValue(request.Name, out Func<Client, dynamic, dynamic> func)) return;

                // detach from RageMP server API
                Task.Run(async () => {
                    Task<BrowserResult> t = new Task<BrowserResult>(() => new BrowserResult(request.Name, request.Id, request.BrowserId, request.Source, func(player, request.Arguments)));

                    // send to browser proxy
                    player.TriggerEvent("vrpc:rsb", JsonConvert.SerializeObject(await t));
                }).ConfigureAwait(false);
            }
        }

        [RemoteEvent("vrpc:rtc")]
        private void EventReplyToClient(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var requestStr = (string)args[0];

            var request = JsonConvert.DeserializeObject<Request<dynamic>>(requestStr);
            if (request == null) return;

            lock (syncProceduresLock)
            {
                if (!syncProcedures.TryGetValue(request.Name, out Func<Client, dynamic, dynamic> func)) return;

                Task.Run(async () => {
                    Task<Result> t = new Task<Result>(() => new Result(request.Name, request.Id, request.Source, func(player, request.Arguments)));
                    t.Start();

                    player.TriggerEvent("vrpc:rfs", JsonConvert.SerializeObject(await t));
                }).ConfigureAwait(false);
            }
        }

        [RemoteEvent("vrpc:rfb")]
        private void EventReceiveFromBrowser(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var resultStr = (string)args[0];

            var result = JsonConvert.DeserializeObject<Result>(resultStr);
            if (result == null) return;

            lock (pendingRequestsLock)
            {
                if (!pendingRequests.TryGetValue(result.Id, out Action<Result> action)) return;

                action(result);
            }
        }

        [RemoteEvent("vrpc:rfc")]
        private void EventReceiveFromClient(Client player, object[] args)
        {
            if (args.Length != 1) return;

            var resultStr = (string)args[0];

            var result = JsonConvert.DeserializeObject<Result>(resultStr);
            if (result == null) return;

            lock (pendingRequestsLock)
            {
                if (!pendingRequests.TryGetValue(result.Id, out Action<Result> action)) return;

                action(result);
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

                asyncProcedures.Add(name, (player, args) => action(player, (TArgs)args));
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

                syncProcedures.Add(name, (player, args) => {
                    return func(player, (TArgs)args);
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
                pendingRequests[requestId] = (Result result) => completionSource.SetResult((TResult)result.Data);
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
                pendingRequests[requestId] = (Result result) => completionSource.SetResult((TResult)result.Data);
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
