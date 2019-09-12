import { AsyncAction, SyncAction } from './model';

/**
 * Represents the registry for registered rpc endpoints
 */
class Registry {
  private readonly asyncRegistry: Map<string, AsyncAction>;
  private readonly syncRegistry: Map<string, SyncAction>;

  constructor() {
    this.asyncRegistry = new Map<string, AsyncAction>();
    this.syncRegistry = new Map<string, SyncAction>();
  }

  /**
   * Registers an asynchronous procedure
   *
   * @param name The name to bind to the procedure
   * @param method The procedure add
   */
  public registerAsyncProcedure(name: string, method: AsyncAction): void {
    if (this.asyncRegistry.has(name)) {
      return;
    }

    this.asyncRegistry.set(name, method);
  }

  /**
   * Registers a synchronous procedure
   *
   * @param name The name to bind to the procedure
   * @param method The procedure add
   */
  public registerSyncProcedure(name: string, method: SyncAction): void {
    if (this.syncRegistry.has(name)) {
      return;
    }

    this.syncRegistry.set(name, method);
  }

  /**
   * Unregisters the specified asynchronous procedure
   *
   * @param name The name of the asynchronous procedure
   */
  public unregisterAsyncProcedure(name: string): void {
    this.asyncRegistry.delete(name);
  }

  /**
   * Unregisters the specified synchronous procedure
   *
   * @param name The name of the synchronous procedure
   */
  public unregisterSyncProcedure(name: string): void {
    this.syncRegistry.delete(name);
  }

  /**
   * Returns an asynchronous procedure by its name
   *
   * @param name The name of the asynchronous procedure
   */
  public getAsyncProcedure(name: string): AsyncAction | undefined {
    return this.asyncRegistry.get(name);
  }

  /**
   * Returns an synchronous procedure by its name
   *
   * @param name The name of the synchronous procedure
   */
  public getSyncProcedure(name: string): SyncAction | undefined {
    return this.syncRegistry.get(name);
  }
}

export default Registry;
