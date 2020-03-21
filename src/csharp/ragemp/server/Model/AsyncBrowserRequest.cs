using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.RageMP.Server.Model
{
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
}
