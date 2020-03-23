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
        public bool IsSyncRequest { get; }

        public MiddlewareRequest(Client client, string name, bool isSync)
        {
            Client = client;
            Name = name;
            IsSyncRequest = isSync;
        }
    }
}
