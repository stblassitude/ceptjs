import Cept from './modules/cept.js';
import CeptTest from './modules/cept-test.js';

window.addEventListener('DOMContentLoaded', (event) => {
  let cept = new Cept("#screen", {
    log: document.getElementById("log"),
  });
  let ceptTest = new CeptTest(cept);

  document.getElementById("charsAndColors").addEventListener("click", function(ev) {
    ceptTest.charsAndColors();
  });
  document.getElementById("attrs").addEventListener("click", function(ev) {
    ceptTest.attrs();
  });
  document.getElementById("charsetAlpha").addEventListener("click", function(ev) {
    ceptTest.charsetAlpha();
  });
  document.getElementById("charsetMosaic").addEventListener("click", function(ev) {
    ceptTest.charsetMosaic();
  });
  document.getElementById("bytestream").addEventListener("click", function(ev) {
    ceptTest.bytestream();
  });
  document.getElementById("reveal").addEventListener("click", function(ev) {
    cept.revealed = !cept.revealed;
    cept.updateScreen();
  });
});
