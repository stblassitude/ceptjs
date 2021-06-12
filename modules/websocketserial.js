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

    this.btxSocket = new WebSocket(websocket_uri);
    this.btxSocket.binaryType = "arraybuffer";

    this.btxSocket.onopen = () => {
    }

    this.btxSocket.onmessage = (event) => {
      var data = event.data
      if (event.data instanceof ArrayBuffer) {
        data = new Uint8Array(event.data)
        for (let b of data) {
          this.cept.nextByte(b);
        }
        // console.log("received " + data)
      } else {
        console.log("received data in unsupported format: " + data);
      }
    }
  }

  send(b) {
    var ab = new ArrayBuffer(1)
    var abv = new Uint8Array(ab)
    abv[0] = b; // c.charCodeAt(0)
    this.btxSocket.send(ab);
  }
}
