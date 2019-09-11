import BrowserRegistry from '../../lib/browserRegistry';
import {
  Result,
  AsyncRequest,
  Request,
  BrowserRequest,
  BrowserResult,
  AsyncAction,
  SyncAction,
  Source
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
  b.execute(`if (window.vrpc === undefined) { window.vrpc = {}; } window.vrpc.uid = ${uid};`);
});

export function RegisterAsnycProcedure(name: string, method: AsyncAction): void {
  registry.registerAsyncProcedure(name, method);
}

export function RegisterSyncProcedure(name: string, method: SyncAction): void {
  registry.registerSyncProcedure(name, method);
}

mp.events.add(Event.Noreply, (requestStr: string) => {
  const request = JSON.parse(requestStr) as AsyncRequest;
  if (request === undefined) {
    return;
  }

  controller.noReply(request);
});
mp.events.add(Event.Client.ReplyToServer, (requestStr: string) => {
  const request = JSON.parse(requestStr) as Request;
  if (request === undefined) {
    return;
  }

  controller.reply(request, (result) => mp.events.callRemote(Event.Server.ReceiveFromClient, JSON.stringify(result)));
});
mp.events.add(Event.Client.ReplyToBrowser, (requestStr: string) => {
  const request = JSON.parse(requestStr) as BrowserRequest;
  if (request === undefined) {
    return;
  }

  const browser = browserRegistry.getBrowser(request.BrowserId);
  if (browser === undefined) {
    return;
  }

  controller.reply(request, (result: Result) => browser.execute(`window.vrpc.ccallback(${JSON.stringify(result)});`));
});

mp.events.add(Event.Client.RedirectNoreplyToServer, (requestStr: string) => mp.events.callRemote(Event.Noreply, requestStr));
mp.events.add(Event.Client.RedirectNoreplyToBrowser, (requestStr: string) => {
  const request = JSON.parse(requestStr) as BrowserRequest;
  if (request === undefined) {
    return;
  }

  const browser = browserRegistry.getBrowser(request.BrowserId);
  if (browser === undefined) {
    return;
  }

  browser.execute(`window.vrpc.noreply(${requestStr});`);
});

mp.events.add(Event.Client.RedirectBrowserToServer, (requestStr: string) => mp.events.callRemote(Event.Server.ReplyToBrowser, requestStr));
mp.events.add(Event.Client.RedirectServerToBrowser, (browserResultStr: string) => {
  const browserResult = JSON.parse(browserResultStr) as BrowserResult;
  if (browserResult === undefined) {
    return;
  }

  const browser = browserRegistry.getBrowser(browserResult.BrowserId);
  if (browser === undefined) {
    return;
  }

  browser.execute(`window.vrpc.scallback(${browserResultStr});`);
});

mp.events.add(Event.Client.ReceiveFromServer, (resultStr: string) => {
  const result = JSON.parse(resultStr) as Result;
  if (result === undefined) {
    return;
  }

  controller.receive(result);
});
mp.events.add(Event.Client.ReceiveFromBrowser, (resultStr: string) => {
  const result = JSON.parse(resultStr) as Result;
  if (result === undefined) {
    return;
  }

  controller.receive(result);
});

export function CallServerAsync(name: string, args: any): void {
  controller.callAsync(name, args, (request) => mp.events.callRemote(Event.Noreply, JSON.stringify(request)));
}

export function CallBrowserAsync(name: string, browserOrId: number | BrowserMp, args: any): void {
  const browser = typeof browserOrId === 'number' ? browserRegistry.getBrowser(browserOrId) : browserOrId;
  if (browser === undefined) {
    return;
  }

  controller.callAsync(name, args, (request) => browser.execute(`window.vrpc.noreply(${JSON.stringify(request)});`));
}

export function CallServerSync(name: string, args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Client, (request: Request) =>
    mp.events.callRemote(Event.Server.ReplyToClient, JSON.stringify(request)));
}

export function CallBrowserSync(name: string, browserOrId: number | BrowserMp, args: any, timeout: number = 1000): Promise<Result> | null {
  const browser: BrowserMp | undefined = typeof browserOrId === 'number' ? browserRegistry.getBrowser(browserOrId) : browserOrId;
  if (browser === undefined) {
    return null;
  }

  return controller.callSync(name, args, timeout, Source.Client, (request: Request) =>
    browser.execute(`window.vrpc.creply(${JSON.stringify(request)});`));
}

export default {
  RegisterAsnycProcedure,
  RegisterSyncProcedure,
  CallServerAsync,
  CallBrowserAsync,
  CallServerSync,
  CallBrowserSync
};
