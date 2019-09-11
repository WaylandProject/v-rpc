import BrowserRegistry from '../../lib/browserRegistry';
import { Result, AsyncRequest, Request, BrowserRequest, BrowserResult } from '../../lib/model';
import { Event } from '../../lib/events';

// tslint:disable-next-line: no-empty-interface
declare interface BrowserMp {
  execute(code: string): void;
}
declare var mp: any;


const browserRegistry = new BrowserRegistry<BrowserMp>();

// register all browser that were added before this script was initialized
mp.browsers.forEach((browser: BrowserMp) => {
  browserRegistry.register(browser);
});

// setup event listeners for the RageMP client
mp.events.add('browserCreated', (b: BrowserMp) => {
  const uid = browserRegistry.register(b);
  b.execute(`window.vrpc = {}; window.vrpc.uid = ${uid};`);
});



type AsyncAction = (args: any) => void;

const asyncRegistry: Map<string, AsyncAction> = new Map();

export function RegisterAsnycProcedure(name: string, method: AsyncAction): void {
  asyncRegistry.set(name, method);
}

type SyncAction = (args: any) => any;

const syncRegistry: Map<string, SyncAction> = new Map();

export function RegisterSyncProcedure(name: string, method: SyncAction): void {
  syncRegistry.set(name, method);
}

mp.events.add(Event.Noreply, (request: AsyncRequest) => {
  const action = asyncRegistry.get(request.Name);
  if (action === undefined) {
    return;
  }

  action(request.Args);
});

// the reply event is actually only called by the server
mp.events.add(Event.Client.ReplyToServer, (requestStr: string) => {
  const request = JSON.parse(requestStr) as Request;
  if (request === undefined) {
    return;
  }

  const action = syncRegistry.get(request.Name);
  if (action === undefined) {
    return;
  }

  const result: Result = {
    Name: request.Name,
    Id: request.Id,
    Source: request.Source,
    Result: action(request.Args)
  };

  mp.events.callRemote(Event.Server.ReceiveFromClient, JSON.stringify(result));
});

mp.events.add(Event.Client.ReplyToBrowser, (requestStr: string) => {
  const request = JSON.parse(requestStr) as BrowserRequest;
  if (request === undefined) {
    return;
  }

  const action = syncRegistry.get(request.Name);
  if (action === undefined) {
    return;
  }

  const result: Result = {
    Name: request.Name,
    Source: request.Source,
    Id: request.Id,
    Result: action(request.Args)
  };

  const browser = browserRegistry.getBrowser(request.BrowserId);
  if (browser === undefined) {
    return;
  }

  browser.execute(`window.vrpc.callback(${JSON.stringify(result)});`);
});

mp.events.add(Event.Client.RedirectBrowserToServer, (requestStr: string) => {
  mp.events.callRemote(Event.Server.ReplyToBrowser, requestStr);
});

mp.events.add(Event.Client.RedirectServerToBrowser, (browserResultStr: string) => {
  const browserResult = JSON.parse(browserResultStr) as BrowserResult;
  if (browserResult === undefined) {
    return;
  }

  const browser = browserRegistry.getBrowser(browserResult.BrowserId);
  if (browser === undefined) {
    return;
  }

  const result: Result = {
    Name: browserResult.Name,
    Source: browserResult.Source,
    Id: browserResult.Id,
    Result: browserResult.Result
  };

  browser.execute(`window.vrpc.callback(${JSON.stringify(result)});`);
});

export function CallServerAsync(name: string, args: any): void {}

export function CallBrowserAsync(name: string, browserId: number, args: any): void {}

export function CallServerSync(name: string, args: any): Promise<Result> {
    return new Promise(() => null);
}

export function CallBrowserSync(name: string, browserId: number, args: any): Promise<Result> {
    return new Promise(() => null);
}

export default {
  RegisterAsnycProcedure,
  RegisterSyncProcedure,
  CallServerAsync,
  CallBrowserAsync,
  CallServerSync,
  CallBrowserSync
};
