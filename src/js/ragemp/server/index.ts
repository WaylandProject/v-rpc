import Controller from '../../lib/controller';
import Registry from '../../lib/registry';
import { Event } from '../../lib/events';
import {
  Result,
  Source,
  BrowserRequest,
  Request,
  AsyncRequest,
  BrowserResult,
  AsyncBrowserRequest
} from '../../lib/model';

export interface ServerArgs {
  Player: PlayerMp;
  Args: any;
}

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
  }, (args: any) => {
    return {
      Player: player,
      Args: args
    } as ServerArgs;
  });
});

mp.events.add(Event.Server.ReplyToClient, (player: PlayerMp, requestStr: string) => {
  const request = JSON.parse(requestStr) as Request;
  if (request === undefined) {
    return;
  }

  controller.reply(request, (result: Result) => player.call(Event.Client.ReceiveFromServer, JSON.stringify(result)), (args: any) => {
    return {
      Player: player,
      Args: args
    } as ServerArgs;
  });
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

type AsyncServerAction = (player: PlayerMp, args: any) => void;

export function registerAsyncProcedure(name: string, method: AsyncServerAction): void {
  registry.registerAsyncProcedure(name, (args: ServerArgs) => method(args.Player, args.Args));
}

type SyncServerAction = (player: PlayerMp, args: any) => void;

export function registerSyncProcedure(name: string, method: SyncServerAction): void {
  registry.registerSyncProcedure(name, (args: ServerArgs) => method(args.Player, args.Args));
}

export function callClientAsync(player: PlayerMp, name: string, args: any): void {
  controller.callAsync(name, args, (request) => player.call(Event.Noreply, JSON.stringify(request)));
}

export function callClientSync(player: PlayerMp, name: string, args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Server, (request) =>
    player.call(Event.Client.ReplyToServer, JSON.stringify(request)));
}

export function callBrowserAsync(player: PlayerMp, name: string, browserId: number, args: any): void {
  controller.callAsync(name, args, (request) => {
    const browserRequest = request as AsyncBrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectNoreplyToBrowser, JSON.stringify(browserRequest));
  });
}

export function callBrowserSync(player: PlayerMp, name: string, browserId: number,
                                args: any, timeout: number = DEFAULT_TIMEOUT): Promise<Result> | null {
  return controller.callSync(name, args, timeout, Source.Server, (request) => {
    const browserRequest = request as BrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectServerToBrowser, JSON.stringify(browserRequest));
  });
}

export default {
  registerAsyncProcedure,
  registerSyncProcedure,
  callClientAsync,
  callClientSync,
  callBrowserAsync,
  callBrowserSync
};
