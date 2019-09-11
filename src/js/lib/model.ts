
export type Action = (name: string, args: any) => void;

export enum Source {
  Client = 0,
  Cef = 1,
  Server = 2
}

export interface Request {
  Name: string;
  Source: Source;
  Id: number;
  Args: any;
}

export interface BrowserRequest {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Args: any;
}

export interface Result {
  Name: string;
  Source: Source;
  Id: number;
  Result: any;
}

export interface BrowserResult {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Result: any;
}

export interface AsyncRequest {
  Name: string;
  Args: any;
}