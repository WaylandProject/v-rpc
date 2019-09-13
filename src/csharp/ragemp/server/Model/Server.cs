using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using GTANetworkAPI;
using Newtonsoft.Json;

namespace VRPC.Model.Server
{
    public interface IServerArguments
    {
        Client Player { get; }
        dynamic Arguments { get; }
    }

    public enum Source
    {
        Client,
        Cef,
        Server
    }

    public class Request<T>
    {
        public string Name { get; protected set; }
        public int Id { get; protected set; }
        public Source Source { get; protected set; }
        [JsonProperty("Args")]
        public T Arguments { get; protected set; }

        public Request(string name, int id, Source source, T arguments)
        {
            Name = name;
            Id = id;
            Source = source;
            Arguments = arguments;
        }
    }

    public class BrowserRequest<T>
    {
        public string Name { get; protected set; }
        public int Id { get; protected set; }
        public Source Source { get; protected set; }
        [JsonProperty("Args")]
        public T Arguments { get; protected set; }
        public int BrowserId { get; private set; }

        public BrowserRequest(string name, int id, int browserId, Source source, T arguments)
        {
            Name = name;
            Id = id;
            Source = source;
            Arguments = arguments;
            BrowserId = browserId;
        }
    }

    public class AsyncRequest<T>
    {
        public string Name { get; private set; }
        [JsonProperty("Args")]
        public T Arguments { get; private set; }

        public AsyncRequest(string name, T args)
        {
            Name = name;
            Arguments = args;
        }
    }

    public class AsyncBrowserRequest<T>
    {
        public string Name { get; private set; }
        public int BrowserId { get; private set; }
        [JsonProperty("Args")]
        public T Arguments { get; private set; }

        public AsyncBrowserRequest(string name, int browserId, T args)
        {
            Name = name;
            BrowserId = browserId;
            Arguments = args;
        }
    }

    public class Promise<T>
    {
        public delegate void Listener();
        public delegate void ArgsListener(T result);

        /// <summary>
        /// Event that is executed when a sychronous call completed.
        /// 
        /// This event will be executed regardless of whether a request was successful or timed out. No result is returned.
        /// </summary>
        public event Listener OnComplete;

        /// <summary>
        /// Event that is executed when a synchronous call timed out.
        /// </summary>
        public event Listener OnTimeout;

        /// <summary>
        /// Event that is executed when a synchronous call returned sucessful.
        /// </summary>
        public event ArgsListener OnSuccessful;

        private bool isStarted = false;
        private TaskCompletionSource<T> completionSource;

        public TimeSpan Timeout { get; set; } = TimeSpan.FromMilliseconds(300);

        private Action startAction;

        public Promise(TaskCompletionSource<T> completionSource, Action action)
        {
            this.completionSource = completionSource;
            startAction = action;
        }

        /// <summary>
        /// Starts the execution of the call
        /// </summary>
        public async void Start()
        {
            if (isStarted)
            {
                throw new Exception("The promise was already started!");
            }
            isStarted = true;

            startAction();

            var finishedTask = await Task.WhenAny(completionSource.Task, Task.Delay(Timeout));
            if (finishedTask == completionSource.Task)
            {
                OnSuccessful(completionSource.Task.Result);
            }
            else
            {
                OnTimeout();
            }

            OnComplete();
        }
    }

    public class Result
    {
        public string Name { get; private set; }
        public int Id { get; private set; }
        public Source Source { get; private set; }
        [JsonProperty("Result")]
        public dynamic Data { get; private set; }

        public Result(string name, int id, Source source, dynamic data)
        {
            Name = name;
            Id = id;
            Source = source;
            Data = data;
        }
    }

    public class BrowserResult
    {
        public string Name { get; private set; }
        public int Id { get; private set; }
        public int BrowserId { get; private set; }
        public Source Source { get; private set; }
        [JsonProperty("Result")]
        public dynamic Data { get; private set; }

        public BrowserResult(string name, int id, int browserId, Source source, dynamic data)
        {
            Name = name;
            Id = id;
            BrowserId = browserId;
            Source = source;
            Data = data;
        }
    }
}
