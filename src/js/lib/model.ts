
/**
 * Represents an asynchronous action saved in the registry
 */
export type AsyncAction = (args: any) => void;

/**
 * Represents a synchronous action saved in the registry.
 */
export type SyncAction = (args: any) => any;

/**
 * Represents the source of a request
 */
export enum Source {
  Client = 0,
  Cef = 1,
  Server = 2
}

/**
 * Represents a synchronous request
 */
export interface Request {
  Name: string;
  Source: Source;
  Id: number;
  Args: any;
}

/**
 * Represents a synchronous browser request
 */
export interface BrowserRequest extends Request {
  BrowserId: number;
}

/**
 * Represents a synchronous result
 */
export interface Result {
  Name: string;
  Source: Source;
  Id: number;
  Result: any;
}

/**
 * Represents a synchronous browser result
 */
export interface BrowserResult extends Result {
  BrowserId: number;
}

/**
 * Represents an asynchronous request
 */
export interface AsyncRequest {
  Name: string;
  Args: any;
}

/**
 * Represents an asynchronous browser request
 */
export interface AsyncBrowserRequest extends AsyncRequest {
  BrowserId: number;
}

/**
 * Represents a pending Promise resolve action.
 * 
 * This action resolves a Promise connected to it!
 */
export type ResolveAction = (result: any) => void;

/**
 * Represents an async middleware.
 */
export type AsyncMiddlewareAction = (req: AsyncRequest, next: () => void) => void;

/**
 * Represents a sync middleware.
 */
export type SyncMiddlewareAction = (req: Request, next: () => void) => void;
