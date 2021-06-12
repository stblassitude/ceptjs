import Cept from './modules/cept.js';
import Serial from './modules/websocketserial.js';

window.addEventListener('DOMContentLoaded', (event) => {
  let cept = new Cept("#screen");
  let ws = new Serial(cept);
  
  // document.getElementById("charsAndColors").addEventListener("click", function(ev) {
  //   ceptTest.charsAndColors();
  // });
  // document.getElementById("attrs").addEventListener("click", function(ev) {
  //   ceptTest.attrs();
  // });
  // document.getElementById("charsetAlpha").addEventListener("click", function(ev) {
  //   ceptTest.charsetAlpha();
  // });
  // document.getElementById("charsetMosaic").addEventListener("click", function(ev) {
  //   ceptTest.charsetMosaic();
  // });
  // document.getElementById("bytestream").addEventListener("click", function(ev) {
  //   ceptTest.bytestream();
  // });
  // document.getElementById("reveal").addEventListener("click", function(ev) {
  //   cept.revealed = !cept.revealed;
  //   cept.updateScreen();
  // });
});
