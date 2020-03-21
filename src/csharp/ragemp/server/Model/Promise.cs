using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace VRPC.RageMP.Server.Model
{
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
}
