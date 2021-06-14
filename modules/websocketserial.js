export default class Serial {
  constructor(cept, websocket_uri) {
    this.cept = cept;
    this.sendListeners = [];

    if (websocket_uri === undefined) {
      if (window.location.protocol === "https:") {
        websocket_uri = "wss:";
      } else {
        websocket_uri = "ws:";
      }
      websocket_uri += "//" + window.location.host;
      websocket_uri += "/btxws";
    }

    this.buffer = [];

    this.btxSocket = new WebSocket(websocket_uri);
    this.btxSocket.binaryType = "arraybuffer";

    this.btxSocket.onopen = () => {
    }

    this.btxSocket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.cept.input(...new Uint8Array(event.data));
        // for (let b of new Uint8Array(event.data)) {
        //   this.cept.input(b);
        //   this.buffer.push(b);
        // }
      } else {
        console.log("received data in unsupported format", event.data);
      }
    }

    window.setInterval((e) => {
      if (this.buffer.length > 0)
        this.cept.input(this.buffer.shift());
    }, 10);
  }

  send(b) {
    var ab = new ArrayBuffer(1)
    var abv = new Uint8Array(ab)
    abv[0] = b; // c.charCodeAt(0)
    this.btxSocket.send(ab);
  }
}
