import BrowserRegistry from '../../lib/browserRegistry';
import {
  Result,
  AsyncRequest,
  Request,
  BrowserRequest,
  BrowserResult,
  AsyncAction,
  SyncAction,
  Source,
  AsyncMiddlewareAction,
  SyncMiddlewareAction
} from '../../lib/model';
import { Event } from '../../lib/events';
import Controller from '../../lib/controller';
import Registry from '../../lib/registry';

const browserRegistry = new BrowserRegistry<BrowserMp>();
const registry = new Registry();
const controller = new Controller(registry);
const DEFAULT_TIMEOUT = 1000;

// register all browser that were added before this script was initialized
mp.browsers.forEach((browser: BrowserMp) => {
  browserRegistry.register(browser);
});
mp.events.add('browserCreated', (b: BrowserMp) => {
  const uid = browserRegistry.register(b);
  b.execute(`if (window.vrpchandler === undefined) { window.vrpchandler = {}; } window.vrpchandler.uid = ${uid};`);
});

mp.events.add(Event.Noreply, (requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as AsyncRequest;

    controller.noReply(request);
  } catch (e) {
    return;
  }
});
mp.events.add(Event.Client.ReplyToServer, (requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as Request;

    controller.reply(request, (result) => {
      mp.events.callRemote(Event.Server.ReceiveFromClient, JSON.stringify(result));
    });
  } catch {
    return;
  }
});
mp.events.add(Event.Client.ReplyToBrowser, (requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as BrowserRequest;

    const browser = browserRegistry.getBrowser(request.BrowserId);
    if (browser === undefined) {
      return;
    }

    controller.reply(request, (result: Result) => browser.execute(`window.vrpchandler.ccallback(${JSON.stringify(result)});`));
  } catch {
    return;
  }
});

mp.events.add(Event.Client.RedirectNoreplyToServer, (requestStr: string) => mp.events.callRemote(Event.Noreply, requestStr));
mp.events.add(Event.Client.RedirectNoreplyToBrowser, (requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as BrowserRequest;

    const browser = browserRegistry.getBrowser(request.BrowserId);
    if (browser === undefined) {
      return;
    }

    browser.execute(`window.vrpchandler.noreply(${requestStr});`);
  } catch {
    return;
  }
});

mp.events.add(Event.Client.RedirectBrowserToServer, (requestStr: string) => mp.events.callRemote(Event.Server.ReplyToBrowser, requestStr));
mp.events.add(Event.Client.RedirectServerToBrowser, (browserResultStr: string) => {
  try {
    const browserResult = JSON.parse(browserResultStr) as BrowserResult;

    const browser = browserRegistry.getBrowser(browserResult.BrowserId);
    if (browser === undefined) {
      return;
    }

    browser.execute(`window.vrpchandler.scallback(${JSON.stringify({
      Name: browserResult.Name,
      Id: browserResult.Id,
      Source: browserResult.Source,
      Result: browserResult.Result
    } as Result)});`);
  } catch {
    return;
  }
});

mp.events.add(Event.Client.ReceiveFromServer, (resultStr: string) => {
  try {
    const result = JSON.parse(resultStr) as Result;

    controller.receive(result);
  } catch {
    return;
  }
});
mp.events.add(Event.Client.ReceiveFromBrowser, (resultStr: string) => {
  try {
    const result = JSON.parse(resultStr) as Result;

    controller.receive(result);
  } catch {
    return;
  }
});

/**
 * Register an asynchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerAsyncProcedure(name: string, method: AsyncAction): void {
  registry.registerAsyncProcedure(
    name,
    method
  );
}

/**
 * Register a synchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerSyncProcedure(name: string, method: SyncAction): void {
  registry.registerSyncProcedure(
    name,
    method
  );
}

/**
 * Call an asynchronous procedure on the server
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 */
export function callServerAsync<TArgs>(name: string, args?: TArgs): void {
  controller.callAsync<TArgs | undefined>(
    name,
    (request) => mp.events.callRemote(Event.Noreply, JSON.stringify(request)),
    args
  );
}

/**
 * Call an asynchronous procedure in the browser
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 */
export function callBrowserAsync<TArgs>(name: string, browserOrId: number | BrowserMp, args?: TArgs): void {
  const browser = typeof browserOrId === 'number' ? browserRegistry.getBrowser(browserOrId) : browserOrId;
  if (browser === undefined) {
    return;
  }

  controller.callAsync<TArgs | undefined>(
    name,
    (request) => browser.execute(`window.vrpchandler.noreply(${JSON.stringify(request)});`),
    args
  );
}

/**
 * Call a synchronous procedure on the server
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callServerSync<TResult, TArgs = undefined>(
  name: string,
  args?: TArgs,
  timeout: number = DEFAULT_TIMEOUT
): Promise<TResult> {
  return controller.callSync<TArgs | undefined, TResult>(
    name,
    timeout,
    Source.Client,
    (request: Request) => mp.events.callRemote(Event.Server.ReplyToClient, JSON.stringify(request)),
    args
  );
}

/**
 * Call a synchronous procedure in the browser
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callBrowserSync<TResult, TArgs = undefined>(
  name: string,
  browserOrId: number | BrowserMp,
  args: TArgs,
  timeout: number = DEFAULT_TIMEOUT
): Promise<TResult> {
  const browser: BrowserMp | undefined = typeof browserOrId === 'number' ? browserRegistry.getBrowser(browserOrId) : browserOrId;
  if (browser === undefined) {
    return new Promise<TResult>((_, r) => r('browser undefined'));
  }

  return controller.callSync<TArgs | undefined, TResult>(
    name,
    timeout,
    Source.Client,
    (request: Request) => browser.execute(`window.vrpchandler.creply(${JSON.stringify(request)});`),
    args
  );
}

/**
 * Register a middleware for async incoming requests.
 */
export function registerAsyncMiddleware(mw: AsyncMiddlewareAction): void {
  controller.registerAsyncMiddleware(mw);
}

/**
 * Register a middleware for sync incoming requests.
 */
export function registerSyncMiddleware(mw: SyncMiddlewareAction): void {
  controller.registerSyncMiddleware(mw);
}

export default {
  registerAsyncProcedure,
  registerSyncProcedure,
  callServerAsync,
  callBrowserAsync,
  callServerSync,
  callBrowserSync
};
