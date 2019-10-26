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
  try {
    const request = JSON.parse(requestStr) as AsyncRequest;

    controller.noReply(request, (args: any) => {
      return {
        Player: player,
        Args: args
      } as ServerArgs;
    });
  } catch {
    return;
  }
});

mp.events.add(Event.Server.ReplyToBrowser, (player: PlayerMp, requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as BrowserRequest;

    controller.reply(request, (result: Result) => {
      const browserResult = result as BrowserResult;
      browserResult.BrowserId = request.BrowserId;

      player.call(Event.Client.RedirectServerToBrowser, [JSON.stringify(browserResult)]);
    }, (args: any) => {
      return {
        Player: player,
        Args: args
      } as ServerArgs;
    });
  } catch {
    return;
  }
});

mp.events.add(Event.Server.ReplyToClient, (player: PlayerMp, requestStr: string) => {
  try {
    const request = JSON.parse(requestStr) as Request;

    controller.reply(request, (result: Result) => player.call(Event.Client.ReceiveFromServer, [JSON.stringify(result)]), (args: any) => {
      return {
        Player: player,
        Args: args
      } as ServerArgs;
    });
  } catch {
    return;
  }
});

mp.events.add(Event.Server.ReceiveFromBrowser, (player: PlayerMp, resultStr: string) => {
  try {
    const result = JSON.parse(resultStr) as Result;

    controller.receive(result);
  } catch {
    return;
  }
});

mp.events.add(Event.Server.ReceiveFromClient, (player: PlayerMp, resultStr: string) => {
  try {
    const result = JSON.parse(resultStr) as Result;

    controller.receive(result);
  } catch {
    return;
  }
});

/**
 * Represents an asynchronous server action
 *
 * @remarks
 * This action is used to pass the player object from the base event to the base action.
 */
type AsyncServerAction = (player: PlayerMp, args: any) => void;

/**
 * Register an asynchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerAsyncProcedure(name: string, method: AsyncServerAction): void {
  registry.registerAsyncProcedure(name, (args: ServerArgs) => method(args.Player, args.Args));
}

/**
 * Represents an synchronous server action
 *
 * @remarks
 * This action is used to pass the player object from the base event to the base action.
 */
type SyncServerAction = (player: PlayerMp, args: any) => void;

/**
 * Register a synchronous procedure
 *
 * @param name The name of the procedure
 * @param method The procedure method
 */
export function registerSyncProcedure(name: string, method: SyncServerAction): void {
  registry.registerSyncProcedure(name, (args: ServerArgs) => method(args.Player, args.Args));
}

/**
 * Call an asynchronous procedure on the client
 *
 * @param player The player to call the procedure on
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 */
export function callClientAsync<TArgs>(player: PlayerMp, name: string, args: TArgs): void {
  controller.callAsync<TArgs>(name, args, (request) => player.call(Event.Noreply, [JSON.stringify(request)]));
}

/**
 * Call an asynchronous procedure in the browser
 *
 * @param player The player to call the procedure on
 * @param name The name of the procedure
 * @param browserId The id of the browser
 * @param args The arguments to pass to the procedure
 */
export function callBrowserAsync<TArgs>(player: PlayerMp, name: string, browserId: number, args: TArgs): void {
  controller.callAsync<TArgs>(name, args, (request) => {
    const browserRequest = request as AsyncBrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectNoreplyToBrowser, [JSON.stringify(browserRequest)]);
  });
}

/**
 * Call a synchronous procedure on the client
 *
 * @param player The player to call the procedure on
 * @param name The name of the procedure
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callClientSync<TArgs, TResult>(player: PlayerMp, name: string, args: TArgs,
                                               timeout: number = DEFAULT_TIMEOUT): Promise<TResult> {
  return controller.callSync<TArgs, TResult>(name, args, timeout, Source.Server, (request) =>
    player.call(Event.Client.ReplyToServer, [JSON.stringify(request)]));
}

/**
 * Call a synchronous procedure in the browser
 *
 * @param player The player to call the procedure on
 * @param name The name of the procedure
 * @param browserId The id of the browser
 * @param args The arguments to pass to the procedure
 * @param timeout The maximum waiting time for the call
 */
export function callBrowserSync<TArgs, TResult>(player: PlayerMp, name: string, browserId: number, args: TArgs,
                                                timeout: number = DEFAULT_TIMEOUT): Promise<TResult> {
  return controller.callSync<TArgs, TResult>(name, args, timeout, Source.Server, (request) => {
    const browserRequest = request as BrowserRequest;
    browserRequest.BrowserId = browserId;

    player.call(Event.Client.RedirectServerToBrowser, [JSON.stringify(browserRequest)]);
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
