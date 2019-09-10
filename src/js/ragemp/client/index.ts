import { RPCResult, Action } from '../../lib/model';
import BrowserRegistry from '../../lib/browserRegistry';

// tslint:disable-next-line: no-empty-interface
declare interface BrowserMp {
  execute(code: string): void;
}
declare var mp: any;


const browserRegistry = new BrowserRegistry<BrowserMp>();

// setup event listeners for the RageMP client
mp.events.add('browserCreated', (b: BrowserMp) => {
  const uid = browserRegistry.register(b);
  b.execute(`window.vrpc = {}; window.vrpc.uid = ${uid};`);
});

export function RegisterAsnycCall(name: string, method: Action): void {}

export function RegisterSyncCall(name: string, method: Action): void {}

export function CallServerAsync(name: string, args: any): void {}

export function CallBrowserAsync(name: string, browserId: number, args: any): void {}

export function CallServerSync(name: string, args: any): Promise<RPCResult> {
    return new Promise(() => null);
}

export function CallBrowserSync(name: string, browserId: number, args: any): Promise<RPCResult> {
    return new Promise(() => null);
}

export default {
  RegisterAsnycCall,
  RegisterSyncCall,
  CallServerAsync,
  CallBrowserAsync,
  CallServerSync,
  CallBrowserSync
};
