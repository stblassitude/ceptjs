export default class Keyboard {
  constructor(serial) {
    const codes = {
    "ini": 0x13,
    "ter": 0x1c,
    "dct": 0x1d,
    "1": 0x31,
    "2": 0x32,
    "3": 0x33,
    "4": 0x34,
    "5": 0x35,
    "6": 0x36,
    "7": 0x37,
    "8": 0x38,
    "9": 0x39,
    "0": 0x30,
  }

  this.serial = serial;

  for (let i of Object.keys(codes)) {
    var e = document.getElementById("keyboard-" + i)
    e.addEventListener("click", function(event) {
      this.serial.send(codes[i])
    })
  }
  }
}
