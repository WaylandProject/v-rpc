
export interface IEventListeners {
  SetupReply(): void;
  SetupCallback(): void;
  SetupReplyProxy(): void;
  SetupCallbackProxy(): void;
}

class RPCRegistry {
  constructor(eventListeners: IEventListeners) {
    eventListeners.SetupReply();
    eventListeners.SetupCallback();
    eventListeners.SetupReplyProxy();
    eventListeners.SetupCallbackProxy();
  }
}

export default RPCRegistry;
