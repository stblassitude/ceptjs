import Cept from './modules/cept.js';

window.addEventListener('DOMContentLoaded', (event) => {
  // var c = cept.init("#screen");
  var c = new Cept(document.querySelector("#screen"));

  document.getElementById("test1").addEventListener("click", function(ev) {
    c.testPattern1();
  });
  document.getElementById("test2").addEventListener("click", function(ev) {
    c.testPattern2();
  });
  document.getElementById("charsetAlpha").addEventListener("click", function(ev) {
    c.charsetAlpha();
  });
  document.getElementById("charsetMosaic").addEventListener("click", function(ev) {
    c.charsetMosaic();
  });
  document.getElementById("reveal").addEventListener("click", function(ev) {
    c.revealed = !c.revealed;
    c.updateScreen();
  });
});
