using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.Model
{
    public class Result<TData>
    {
        public string Name { get; private set; }
        public int Id { get; private set; }
        public Source Source { get; private set; }
        [JsonProperty("Result")]
        public TData Data { get; private set; }

        public Result(string name, int id, Source source, TData data)
        {
            Name = name;
            Id = id;
            Source = source;
            Data = data;
        }
    }
}
