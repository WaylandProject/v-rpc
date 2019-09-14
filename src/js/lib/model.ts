
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
export interface BrowserRequest {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Args: any;
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
export interface BrowserResult {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Result: any;
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
export interface AsyncBrowserRequest {
  Name: string;
  BrowserId: number;
  Args: any;
}

/**
 * Represents a pending Promise resolve action.
 * 
 * This action resolves a Promise connected to it!
 */
export type ResolveAction = (result: any) => void;
