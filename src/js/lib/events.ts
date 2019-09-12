
/**
 * Namespace for possible event name in different event frameworks of the GTAV multiplayer providers.
 */
export namespace Event {
  /**
   * Represents an asynchronous endpoint event.
   */
  export const Noreply = 'vrpc:nr';

  /**
   * Namespace for client events
   */
  export namespace Client {
    /**
     * Event to reply to the browser
     */
    export const ReplyToBrowser = 'vrpc:rtb';

    /**
     * Event to reply to the server
     */
    export const ReplyToServer = 'vrpc:rts';

    /**
     * Event to receive from the browser
     */
    export const ReceiveFromBrowser = 'vrpc:rfb';

    /**
     * Event to receive from the server
     */
    export const ReceiveFromServer = 'vrpc:rfs';

    /**
     * Event that redirects a browser async call to the server
     */
    export const RedirectNoreplyToServer = 'vrpc:rns';

    /**
     * Event that redirects a server async call to the browser
     */
    export const RedirectNoreplyToBrowser = 'vrpc:rnb';

    /**
     * Event that redirects a browser sync call to the server
     */
    export const RedirectBrowserToServer = 'vrpc:rbs';

    /**
     * Event that redirects a server sync call to the server
     */
    export const RedirectServerToBrowser = 'vrpc:rsb';
  }

  /**
   * Namespace for server events
   */
  export namespace Server {
    /**
     * Event to reply to a browser sync call
     */
    export const ReplyToBrowser = 'vrpc:rtb';
    
    /**
     * Event to reply to a client sync call
     */
    export const ReplyToClient = 'vrpc:rtc';

    /**
     * Event to receive from a browser sync call
     */
    export const ReceiveFromBrowser = 'vrpc:rfb';

    /**
     * Event to receive from a client sync call
     */
    export const ReceiveFromClient = 'vrpc:rfc';
  }
}
