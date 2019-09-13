
# RageMP C# Implementation

This is the C# implementation of v-rpc (currently only serverside).

## Installation

To install the C# implementation in your VS project, you have to install [our NuGet Package](https://www.nuget.org/packages/Eisengrind.VRPC.RageMP.Server).

After you have installed the package, you have to either add the following entry to your resource `meta.xml` (requiring the option `<CopyLocalLockFileAssemblies>true</CopyLocalLockFileAssemblies>` to be enabled in your project file, aswell as building your project instead of letting the RageMP server compile the source files)

```xml
<script src="vrpcserver.dll" />
```

or you can simply inherit the `Server` class in **only one** of your classes

```cs
namespace SomeNamespace {
    public class SomeClass : VRPC.Server {}
}
```
. This step is needed to setup the event listeners for the vrpc specification to work. If you choose to inherit the VRPC class into **one** of your classes, you can continue working like you were working with inheriting from `Script`, as `VRPC.Server` is inheriting from `Script` aswell.

## Usage

### Server

Once you've installed the v-rpc package, you are ready to get started with the UI of the `VRPC.Server` class.

You can simply call the static methods available on the `VRPC.Server` class:

```cs
using GTANetworkAPI;

namespace SomeNamespace {
    public class SomeClass : VRPC.Server {
        public SomeClass() {
            VRPC.Server.RegisterAsyncCall<int>("myFineTestProcedure", (Client player, int myNumberArgument) => {
                Console.WriteLine($"here is my fine number {myNumberArgument} !");
            });
        }
    }
}
```
