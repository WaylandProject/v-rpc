using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.Model
{
    public class BrowserResult<TData>
    {
        public string Name { get; private set; }
        public int Id { get; private set; }
        public int BrowserId { get; private set; }
        public Source Source { get; private set; }
        [JsonProperty("Result")]
        public TData Data { get; private set; }

        public BrowserResult(string name, int id, int browserId, Source source, TData data)
        {
            Name = name;
            Id = id;
            BrowserId = browserId;
            Source = source;
            Data = data;
        }
    }
}
