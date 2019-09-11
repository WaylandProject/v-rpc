
export namespace Event {
  export const Noreply = 'vrpc:nr';

  export namespace Client {
    export const ReplyToBrowser = 'vrpc:rtb';
    export const ReplyToServer = 'vrpc:rts';
    export const ReceiveFromBrowser = 'vrpc:rfb';
    export const ReceiveFromServer = 'vrpc:rfs';
    export const RedirectBrowserToServer = 'vrpc:rbs';
    export const RedirectServerToBrowser = 'vrpc:rsb';
  }

  export namespace Server {
    export const ReplyToBrowser = 'vrpc:rtb';
    export const ReplyToClient = 'vrpc:rtc';
    export const ReceiveFromBrowser = 'vrpc:rfb';
    export const ReceiveFromClient = 'vrpc:rfc';
  }
}
