import Cept from './modules/cept.js';
import Serial from './modules/websocketserial.js';
import Keyboard from './modules/keyboard.js';

window.addEventListener('DOMContentLoaded', (event) => {
  let cept = new Cept("#screen", {
    log: document.getElementById("log"),
  });
  let ws = new Serial(cept);
  let kb = new Keyboard(ws);
});
