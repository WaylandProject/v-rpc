using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace VRPC.Model
{
    public interface IServerArguments
    {
        Client Player { get; }
        dynamic Arguments { get; }
    }
}
