
# RageMP TS Implementation

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

#### Browser (Cef)

If you want to include this library in your browser HTML page, then you have to include the browser file into your html (see releases for browser file):

```html
<html>
    <head>
        <script type="text/javascript" src="vrpc-browser.js"></script>
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

## Documentation

There is no such as a Markdown documentation yet. Just look into the source files and check the descriptions of the exported functions.

[Server](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/server/index.ts)

[Client](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/client/index.ts)

[Cef](https://github.com/eisengrind/v-rpc/blob/master/src/js/ragemp/cef/index.ts)
