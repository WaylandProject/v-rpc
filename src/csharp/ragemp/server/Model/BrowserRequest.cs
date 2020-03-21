using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.Model
{
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
}
