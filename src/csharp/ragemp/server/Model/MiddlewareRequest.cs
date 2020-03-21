using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.RageMP.Server.Model
{
    public class MiddlewareRequest
    {
        public Client Client { get; }
        public string Name { get; }
        public int Id { get; }
        public Source Source { get; }
        public bool IsSyncRequest { get; }

        public MiddlewareRequest(Client client, string name, int id, Source source, bool isSync)
        {
            Client = client;
            Name = name;
            Id = id;
            Source = source;
            IsSyncRequest = isSync;
        }
    }
}
