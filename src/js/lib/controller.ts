import Registry from './registry';
import IdGenerator from './idGenerator';
import { AsyncRequest, Result, Request, Source, ResolveAction } from './model';

/**
 * Represents the controller to reply to incoming requests and sending async/sync requests
 */
class Controller extends IdGenerator {
  private readonly pendingRequests = new Map<number, ResolveAction>();

  constructor(private readonly registry: Registry) {
    super();
  }

  /**
   * Executes function for a received async call.
   *
   * @param request The incoming async request
   * @param argsOverwrite An optional overwrite of the arguments to return to the async action.
   */
  public noReply(request: AsyncRequest, argsOverwrite: (args: any) => any = (v) => v): void {
    const action = this.registry.getAsyncProcedure(request.Name);
    if (action === undefined) {
      return;
    }

    action(argsOverwrite(request.Args));
  }

  /**
   * Executes the action for a sync call reply.
   *
   * @param request The incoming request parameters.
   * @param callback The callback function that executes the sync callback to a specific destination.
   * @param argsOverwrite An optional overwrite of the arguments to return to the sync reply action.
   */
  public reply(request: Request, callback: (result: Result) => void, argsOverwrite: (args: any) => any = (v) => v): void {
    const action = this.registry.getSyncProcedure(request.Name);
    if (action === undefined) {
      return;
    }

    callback({
      Name: request.Name,
      Source: request.Source,
      Id: request.Id,
      Result: action(argsOverwrite(request.Args))
    });
  }

  /**
   * Executes the action for a received sync call.
   *
   * @param result The incoming result parameters.
   */
  public receive(result: Result): void {
    const resolve = this.pendingRequests.get(result.Id);
    if (resolve === undefined) {
      return;
    }

    resolve(result.Result);
  }

  /**
   * Creates a new synchronous call.
   *
   * The returned Promise is used to wait for the callback.
   *
   * @param name The rpc name
   * @param args The arguments to pass to the sync request
   * @param timeout The timeout to wait for the callback to return
   * @param source The sender source of the rpc
   * @param call The callback function that executes the sync callback to a specific destination.
   * 
   * @returns A promise that will be triggered when the callback was received
   */
  public callSync<TArgs, TResult>(name: string, args: TArgs, timeout: number, source: Source, call: (request: Request) => void): Promise<TResult> {
    let requestId = this.generateId();
    while (this.pendingRequests.has(requestId))
      requestId = this.generateId();

    const promise = new Promise<TResult>((resolve, reject) => {
      this.pendingRequests.set(requestId, resolve);

      setTimeout(() => reject('The request has timed out.'), timeout);
    });
    promise.then(() => this.pendingRequests.delete(requestId))
           .catch(() => this.pendingRequests.delete(requestId));

    setTimeout(() => call({
      Name: name,
      Id: requestId,
      Source: source,
      Args: args
    }), 0);

    return promise;
  }

  /**
   * Creates a new asynchronous call.
   *
   * @param name The rpc name
   * @param args The arguments to pass to the async request
   * @param call The callback function that executes the async callback to a specific destination.
   */
  public callAsync<TArgs>(name: string, args: TArgs, call: (request: AsyncRequest) => void): void {
    call({
      Name: name,
      Args: args
    });
  }
}

export default Controller;
