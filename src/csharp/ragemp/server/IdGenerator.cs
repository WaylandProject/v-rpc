using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace VRPC.RageMP.Server
{
    class IdGenerator
    {
        private int currentID = int.MinValue;

        public int Next()
        {
            return Interlocked.Increment(ref currentID);
        }
    }
}
