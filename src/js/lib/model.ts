
export type Action = (name: string, args: any) => void;

export enum Source {
  Client = 0,
  Cef = 1,
  Server = 2
}

export interface RPCRequest {
  Name: string;
  Source: Source;
  Id: number;
  Args: any;
}

export interface RPCBrowserRequest {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Args: any;
}

export interface RPCResult {
  Name: string;
  Source: Source;
  Id: number;
  Result: any;
}

export interface RPCBrowserResult {
  Name: string;
  Source: Source;
  BrowserId: number;
  Id: number;
  Result: any;
}
