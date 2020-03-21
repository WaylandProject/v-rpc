import Registry from './registry';
import IdGenerator from './idGenerator';
import {
  AsyncRequest,
  Request,
  Source,
  ResolveAction,
  AsyncMiddlewareAction,
  SyncMiddlewareAction,
  Result
} from './model';

/**
 * Represents the controller to reply to incoming requests and sending async/sync requests
 */
class Controller extends IdGenerator {
  private readonly pendingRequests = new Map<number, ResolveAction>();
  
  private asyncMiddleware: AsyncMiddlewareAction = (_: AsyncRequest, next: () => void) => next();
  private syncMiddleware: SyncMiddlewareAction = (_: Request, next: () => void) => next();

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

    this.asyncMiddleware(request, () => action(argsOverwrite(request.Args)));
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

    let result: any = null;

    this.syncMiddleware(request, () => result = action(argsOverwrite(request.Args)));

    callback({
      Name: request.Name,
      Source: request.Source,
      Id: request.Id,
      Result: result
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
   * @param timeout The timeout to wait for the callback to return
   * @param source The sender source of the rpc
   * @param call The callback function that executes the sync callback to a specific destination.
   * @param args The arguments to pass to the sync request
   * 
   * @returns A promise that will be triggered when the callback was received
   */
  public callSync<TArgs, TResult>(name: string, timeout: number, source: Source, call: (request: Request) => void, args?: TArgs): Promise<TResult> {
    let requestId = this.generateId();
    while (this.pendingRequests.has(requestId))
      requestId = this.generateId();

    const promise = new Promise<TResult>((resolve, reject) => {
      this.pendingRequests.set(requestId, resolve);

      setTimeout(() => reject('The request has timed out.'), timeout);
    });

    // start the promise timer after the method call
    setTimeout(() => {
      promise.then(() => this.pendingRequests.delete(requestId))
             .catch(() => this.pendingRequests.delete(requestId));

      call({
        Name: name,
        Id: requestId,
        Source: source,
        Args: args
      });
    }, 0);

    return promise;
  }

  /**
   * Creates a new asynchronous call.
   *
   * @param name The rpc name
   * @param call The callback function that executes the async callback to a specific destination.
   * @param args The arguments to pass to the async request
   */
  public callAsync<TArgs>(name: string, call: (request: AsyncRequest) => void, args?: TArgs): void {
    call({
      Name: name,
      Args: args
    });
  }

  public registerAsyncMiddleware(mwAction: AsyncMiddlewareAction): void {
    const curAsyncMW = this.asyncMiddleware;
    this.asyncMiddleware = (req: AsyncRequest, next: () => void) => curAsyncMW(req, () => mwAction(req, next));
  }

  public registerSyncMiddleware(mwAction: SyncMiddlewareAction): void {
    const curSyncMW = this.syncMiddleware;
    this.syncMiddleware = (req: Request, next: () => void) => curSyncMW(req, () => mwAction(req, next));
  }
}

export default Controller;
