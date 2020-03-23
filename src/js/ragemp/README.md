
# RageMP JavaScript/TypeScript Implementation

This is the JavaScript implementation of v-rpc.

## Installation

To install the JS implementation on all three targets (server, client, cef), you have to install the npm package by typing

```sh
npm i @eisengrind/v-rpc
```

in your npm project.

## Usage

### JavaScript

#### Server and Client

To use the package in JavaScript, you can simply `require` the installed npm package:

```js
var vrpc = require('@eisengrind/v-rpc/ragemp/server'); // for usage on the server

/// ---

var vrpc = require('@eisengrind/v-rpc/ragemp/client'); // for usage on the client
```
##### Examples

For example, you can call the server from the client synchronous:

```js
var vrpc = require('@eisengrind/v-rpc/ragemp/client');

var promise = vrpc.callServerSync('ping', true);

promise.then(() => {
  // code that is executed when the server responded
  console.log('pong');
}).catch(() => {
  // code that is executed if there is some error, like a timeout of the request
});
```

Calling the client from the server asynchronous:

```js
var vrpc = require('@eisengrind/v-rpc/ragemp/server');

vrpc.callClientAsync('ping', true);
```

For a full overview of the exported methods of `vrpc` see **Exported methods** section of this file.

#### Browser (Cef)

If you want to include this library in your browser HTML page, then you have to include the browser file into your html (see releases for browser file):

```html
<html>
    <head>
        <script type="text/javascript" src="vrpc-browser.min.js"></script>
    </head>
    <body>
        <script>
        // use your included library - vrpc is the reserved global variable name to call methods
        vrpc.registerAsyncCall(...);
        </script>
    </body>
</html>
```

### TypeScript

Using this library in TypeScript is, at least for me, far more easy to use.
You can import the libraries on all three targets the same:

```ts
import { registerAsyncCall } from '@eisengrind/v-rpc/ragemp/server';

/// ---
import { registerAsyncCall } from '@eisengrind/v-rpc/ragemp/client';

/// ---
// aaaand, if you are using TypeScript for your browser, then you can also include this library with the same scheme
import { registerAsyncCall } from '@eisengrind/v-rpc/ragemp/cef';
```

### Exported methods

The following method signatures are written down in TypeScript type definition format. Of course this methods are usable in JavaScript.

#### Server

```ts
export declare function registerAsyncProcedure(name: string, method: AsyncServerAction): void;
export declare function registerSyncProcedure(name: string, method: SyncServerAction): void;
export declare function callClientAsync<TArgs>(player: PlayerMp, name: string, args?: TArgs): void;
export declare function callBrowserAsync<TArgs>(player: PlayerMp, name: string, browserId: number, args?: TArgs): void;
export declare function callClientSync<TResult, TArgs = undefined>(player: PlayerMp, name: string, args?: TArgs, timeout?: number): Promise<TResult>;
export declare function callBrowserSync<TResult, TArgs = undefined>(player: PlayerMp, name: string, browserId: number, args?: TArgs, timeout?: number): Promise<TResult>;
export declare function registerAsyncMiddleware(mw: AsyncMiddlewareAction): void;
export declare function registerSyncMiddleware(mw: SyncMiddlewareAction): void;
```

#### Client

```ts
export declare function registerAsyncProcedure(name: string, method: AsyncAction): void;
export declare function registerSyncProcedure(name: string, method: SyncAction): void;
export declare function callServerAsync<TArgs>(name: string, args?: TArgs): void;
export declare function callBrowserAsync<TArgs>(name: string, browserOrId: number | BrowserMp, args?: TArgs): void;
export declare function callServerSync<TResult, TArgs = undefined>(name: string, args?: TArgs, timeout?: number): Promise<TResult>;
export declare function callBrowserSync<TResult, TArgs = undefined>(name: string, browserOrId: number | BrowserMp, args: TArgs, timeout?: number): Promise<TResult>;
export declare function registerAsyncMiddleware(mw: AsyncMiddlewareAction): void;
export declare function registerSyncMiddleware(mw: SyncMiddlewareAction): void;
```

#### Browser (CEF)

```ts
export declare function registerAsyncProcedure(name: string, method: AsyncAction): void;
export declare function registerSyncProcedure(name: string, method: SyncAction): void;
export declare function callClientAsync<TArgs>(name: string, args?: TArgs): void;
export declare function callServerAsync<TArgs>(name: string, args?: TArgs): void;
export declare function callClientSync<TResult, TArgs = undefined>(name: string, args?: TArgs, timeout?: number): Promise<TResult>;
export declare function callServerSync<TResult, TArgs = undefined>(name: string, args?: TArgs, timeout?: number): Promise<TResult>;
export declare function registerAsyncMiddleware(mw: AsyncMiddlewareAction): void;
export declare function registerSyncMiddleware(mw: SyncMiddlewareAction): void;
```

## Documentation

There is no such as a Markdown documentation yet. Just look into the source files and check the descriptions of the exported functions.

[Server](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/server/index.ts)

[Client](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/client/index.ts)

[Cef](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/cef/index.ts)
