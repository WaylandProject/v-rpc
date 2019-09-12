import Controller from '../../lib/controller';
import Registry from '../../lib/registry';
import { Result, BrowserRequest, Request, Source, AsyncAction, AsyncRequest, SyncAction } from '../../lib/model';
import { Event } from '../../lib/events';

declare let window: any;

const registry = new Registry();
const controller = new Controller(registry);

const DEFAULT_TIMEOUT = 1000;

window.vrpc = window.vrpc || {};

if (window.vrpc.vrpc === undefined) {
  window.vrpc = {};
}

window.vrpc.noreply = (request: AsyncRequest) => controller.noReply(request);

window.vrpc.creply = (request: Request) =>
  controller.reply(request, (result: Result) => mp.trigger(Event.Client.ReceiveFromBrowser, JSON.stringify(result)));

window.vrpc.sreply = (request: Request) =>
  controller.reply(request, (result: Result) => mp.trigger(Event.Client.RedirectBrowserToServer, JSON.stringify(result)));

window.vrpc.ccallback = (result: Result) => {
  controller.receive(result);
};

window.vrpc.scallback = (result: Result) => {
  controller.receive(result);
};

/**
 * Register an asynchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerAsyncProcedure(name: string, method: AsyncAction): void {
  registry.registerAsyncProcedure(name, method);
}

/**
 * Register a synchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerSyncProcedure(name: string, method: SyncAction): void {
  registry.registerSyncProcedure(name, method);
}

/**
 * Call an asynchronous procedure on the client
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 */
export function callClientAsync(name: string, args: any): void {
  controller.callAsync(name, args, (request) => mp.trigger(Event.Noreply, JSON.stringify(request)));
}

/**
 * Call an asynchronous procedure on the server
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 */
export function callServerAsync(name: string, args: any): void {
  controller.callAsync(name, args, (request) => mp.trigger(Event.Client.RedirectBrowserToServer, JSON.stringify(request)));
}

/**
 * Call a synchronous procedure on the client
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callClientSync(name: string, args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Cef, (request) =>
    mp.trigger(Event.Client.ReplyToBrowser, JSON.stringify(request)));
}

/**
 * Call a synchronous procedure on the server
 *
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callServerSync(name: string, args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  if (window.vrpc.uid === undefined) {
    return null;
  }

  return controller.callSync(name, args, timeout, Source.Cef, (request) =>
    mp.trigger(Event.Client.RedirectBrowserToServer, JSON.stringify({
      Name: request.Name,
      Id: request.Id,
      BrowserId: window.vrpc.uid as number,
      Source: Source.Cef,
      Args: request.Args,
    } as BrowserRequest)));
}

export default {
  registerAsyncProcedure,
  registerSyncProcedure,
  callClientAsync,
  callClientSync,
  callServerAsync,
  callServerSync
};
