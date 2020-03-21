using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.Model
{
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
}
