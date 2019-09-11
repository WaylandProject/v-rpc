import Registry from './registry';
import IdGenerator from './idGenerator';
import { AsyncRequest, Result, Request, Source, ResolveAction } from './model';

class Controller extends IdGenerator {
  private readonly pendingRequests = new Map<number, ResolveAction>();

  constructor(private readonly registry: Registry) {
    super();
  }

  public noReply(request: AsyncRequest, argsOverwrite: (args: any) => any = (v) => v): void {
    const action = this.registry.getAsyncProcedure(request.Name);
    if (action === undefined) {
      return;
    }

    action(argsOverwrite(request.Args));
  }

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

  public receive(result: Result): void {
    const resolve = this.pendingRequests.get(result.Id);
    if (resolve === undefined) {
      return;
    }

    resolve(result);
  }

  public callSync(name: string, args: any, timeout: number, source: Source, call: (request: Request) => void): Promise<Result> {
    let requestId = this.generateId();
    while (this.pendingRequests.has(requestId))
      requestId = this.generateId();

    const promise = new Promise<Result>((resolve, reject) => {
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
    }));

    return promise;
  }

  public callAsync(name: string, args: any, call: (request: AsyncRequest) => void): void {
    call({
      Name: name,
      Args: args
    });
  }
}

export default Controller;
