import Controller from '../../lib/controller';
import Registry from '../../lib/registry';
import { Event } from '../../lib/events';
import {
  Result,
  Source,
  BrowserRequest,
  Request,
  AsyncAction,
  AsyncRequest,
  SyncAction,
  BrowserResult,
  AsyncBrowserRequest,
  ServerArgs
} from '../../lib/model';

const registry = new Registry();
const controller = new Controller(registry);

const DEFAULT_TIMEOUT = 1000;

mp.events.add(Event.Noreply, (player: PlayerMp, requestStr: string) => {
  const request = JSON.parse(requestStr) as AsyncRequest;
  if (request === undefined) {
    return;
  }

  controller.noReply(request, (args: any) => {
    return {
      Player: player,
      Args: args
    } as ServerArgs;
  });
});

mp.events.add(Event.Server.ReplyToBrowser, (player: PlayerMp, requestStr: string) => {
  const request = JSON.parse(requestStr) as BrowserRequest;
  if (request === undefined) {
    return;
  }

  controller.reply(request, (result: Result) => {
    const browserResult = result as BrowserResult;
    browserResult.BrowserId = request.BrowserId;

    player.call(Event.Client.RedirectServerToBrowser, JSON.stringify(browserResult));
  });
});

mp.events.add(Event.Server.ReplyToClient, (player: PlayerMp, requestStr: string) => {
  const request = JSON.parse(requestStr) as Request;
  if (request === undefined) {
    return;
  }

  controller.reply(request, (result: Result) => player.call(Event.Client.ReceiveFromServer, JSON.stringify(result)));
});

mp.events.add(Event.Server.ReceiveFromBrowser, (player: PlayerMp, resultStr: string) => {
  const result = JSON.parse(resultStr) as Result;
  if (result === undefined) {
    return;
  }

  controller.receive(result);
});

mp.events.add(Event.Server.ReceiveFromClient, (player: PlayerMp, resultStr: string) => {
  const result = JSON.parse(resultStr) as Result;
  if (result === undefined) {
    return;
  }

  controller.receive(result);
});

export function RegisterAsyncProcedure(name: string, method: AsyncAction): void {
  registry.registerAsyncProcedure(name, method);
}

export function RegisterSyncProcedure(name: string, method: SyncAction): void {
  registry.registerSyncProcedure(name, method);
}

export function CallClientAsync(player: PlayerMp, name: string, args: any): void {
  controller.callAsync(name, args, (request) => player.call(Event.Noreply, JSON.stringify(request)));
}

export function CallClientSync(player: PlayerMp, name: string, args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Server, (request) =>
    player.call(Event.Client.ReplyToServer, JSON.stringify(request)));
}

export function CallBrowserAsync(player: PlayerMp, name: string, browserId: number, args: any): void {
  controller.callAsync(name, args, (request) => {
    const browserRequest = request as AsyncBrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectNoreplyToBrowser, JSON.stringify(browserRequest));
  });
}

export function CallBrowserSync(player: PlayerMp, name: string, browserId: number,
                                args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Server, (request) => {
    const browserRequest = request as BrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectServerToBrowser, JSON.stringify(browserRequest));
  });
}

export default {
  RegisterAsyncProcedure,
  RegisterSyncProcedure,
  CallClientAsync,
  CallClientSync,
  CallBrowserAsync,
  CallBrowserSync
};
