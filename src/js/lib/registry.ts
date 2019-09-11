import { AsyncAction, SyncAction } from './model';

class Registry {
  private readonly asyncRegistry = new Map<string, AsyncAction>();
  private readonly syncRegistry = new Map<string, SyncAction>();

  constructor() {}

  public registerAsyncProcedure(name: string, method: AsyncAction): void {
    if (this.asyncRegistry.has(name)) {
      return;
    }

    this.asyncRegistry.set(name, method);
  }

  public registerSyncProcedure(name: string, method: SyncAction): void {
    if (this.syncRegistry.has(name)) {
      return;
    }

    this.syncRegistry.set(name, method);
  }

  public unregisterAsyncProcedure(name: string): void {
    this.asyncRegistry.delete(name);
  }

  public unregisterSyncProcedure(name: string): void {
    this.syncRegistry.delete(name);
  }

  public getAsyncProcedure(name: string): AsyncAction | undefined {
    return this.asyncRegistry.get(name);
  }

  public getSyncProcedure(name: string): SyncAction | undefined {
    return this.syncRegistry.get(name);
  }
}

export default Registry;
