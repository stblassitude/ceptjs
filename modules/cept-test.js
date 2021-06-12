import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';

export default class CeptTest {

  constructor(cept) {
    this.cept = cept;
  }

  charsAndColors() {
    this.cept.screenColor = Cept.COLOR_BLACK;
    this.cept.clearScreen();
    for (var y = 0; y < this.cept.rows; y++) {
      this.cept.screen.rows[y].bg = y % 32;
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].bg = (this.cept.rows+x-y) % 32;
        this.cept.screen.rows[y].attr[x].char = String.fromCharCode(64+x+y);
      }
    }
    for (var y = 10; y < 12; y++) {
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].flashf = 1;
        this.cept.screen.rows[y].attr[x].flashp = y-10;
        this.cept.screen.rows[y].attr[x].flashi = x >= 20;
        this.cept.screen.rows[y].attr[x].flashr = ~~(x / 10) % 2 == 1;
      }
    }
    for (var y = 12; y < 15; y++) {
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].flashf = 2;
        this.cept.screen.rows[y].attr[x].flashp = y-12;
        this.cept.screen.rows[y].attr[x].flashi = x >= 20;
        this.cept.screen.rows[y].attr[x].flashr = ~~(x / 10 ) % 2 == 1;
      }
    }
    this.cept.updateScreen();
  }

  attrs() {
    var y;
    this.cept.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.cept.bgColor = Cept.COLOR_TRANSPARENT;
    this.cept.clearScreen();
    this.cept.resetAttr();
    this.cept.move(0, 1);
    this.cept.color = Cept.COLOR_YELLOW;
    this.cept.size = Cept.SIZE_DOUBLE_SIZE;
    this.cept.writeUnicode("Attribute Test");

    y = 1;

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Flash");
    this.cept.move(20, y);
    this.cept.flashMode = Cept.FLASH_MODE_FLASH;
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.writeUnicode("Normal");
    this.cept.move(30, y);
    this.cept.flashInverted = true;
    this.cept.writeUnicode("Inverted");

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Reduced Intensity");
    this.cept.move(20, y);
    this.cept.flashReducedIntensity = true;
    this.cept.flashMode = Cept.FLASH_MODE_FLASH;
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.writeUnicode("Normal");
    this.cept.move(30, y);
    this.cept.flashInverted = true;
    this.cept.writeUnicode("Inverted");

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Fast");
    this.cept.flashMode = Cept.FLASH_MODE_FAST;
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.move(25, y);
    this.cept.flashPhase = 0;
    this.cept.writeUnicode("One");
    this.cept.move(30, y);
    this.cept.flashPhase = 1;
    this.cept.writeUnicode("Two");
    this.cept.move(35, y);
    this.cept.flashPhase = 2;
    this.cept.writeUnicode("Three");

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Fast/RI");
    this.cept.move(10, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.flashMode = Cept.FLASH_MODE_FAST;
    this.cept.flashReducedIntensity = true;
    this.cept.move(25, y);
    this.cept.flashPhase = 0;
    this.cept.writeUnicode("One");
    this.cept.move(30, y);
    this.cept.flashPhase = 1;
    this.cept.writeUnicode("Two");
    this.cept.move(35, y);
    this.cept.flashPhase = 2;
    this.cept.writeUnicode("Three");

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Fast/RI/Inverted");
    this.cept.move(10, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.flashMode = Cept.FLASH_MODE_FAST;
    this.cept.flashInverted = true;
    this.cept.flashReducedIntensity = true;
    this.cept.move(25, y);
    this.cept.flashPhase = 0;
    this.cept.writeUnicode("One");
    this.cept.move(30, y);
    this.cept.flashPhase = 1;
    this.cept.writeUnicode("Two");
    this.cept.move(35, y);
    this.cept.flashPhase = 2;
    this.cept.writeUnicode("Three");

    y += 1;
    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Decoration");
    this.cept.move(20, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.underlined = true;
    this.cept.writeUnicode("Under");
    this.cept.move(30, y);
    this.cept.underlined = false;
    this.cept.inverted = true;
    this.cept.writeUnicode("Inverted");

    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Concealed");
    this.cept.move(20, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.writeUnicode("Normal");
    this.cept.move(30, y);
    this.cept.concealed = true;
    this.cept.writeUnicode("Concealed");

    y += 1;
    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Width");
    this.cept.move(20, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.writeUnicode("Normal");
    this.cept.move(30, y);
    this.cept.resetAttr();
    this.cept.color = Cept.COLOR_RED;
    this.cept.writeUnicode("hhiiddee");
    this.cept.move(30, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.color = Cept.COLOR_WHITE;
    this.cept.size = Cept.SIZE_DOUBLE_WIDTH;
    this.cept.writeUnicode("Doubl");

    y += 1;
    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Height");
    this.cept.move(20, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_ABOVE;
    this.cept.writeUnicode("DH/A");
    this.cept.move(20, y-1);
    this.cept.resetAttr();
    this.cept.color = Cept.COLOR_RED;
    this.cept.writeUnicode("hid");
    this.cept.move(30, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.color = Cept.COLOR_WHITE;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.cept.writeUnicode("DH/B");
    this.cept.move(30, y+1);
    this.cept.resetAttr();
    this.cept.color = Cept.COLOR_RED;
    this.cept.writeUnicode("hid");

    y += 1;
    y += 1;
    this.cept.resetAttr();
    this.cept.move(0, y);
    this.cept.writeUnicode("Size");
    this.cept.move(20, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.color = Cept.COLOR_WHITE;
    this.cept.size = Cept.SIZE_DOUBLE_SIZE;
    this.cept.writeUnicode("Doubl");
    this.cept.move(20, y-1);
    // y += 1;
    this.cept.resetAttr();
    this.cept.color = Cept.COLOR_RED;
    this.cept.writeUnicode("hide");

    this.cept.move(0, 24);
    this.cept.cursorVisible = true;

    this.cept.updateScreen();
  }

  charsetAlpha() {
    var x;
    this.cept.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.cept.bgColor = Cept.COLOR_TRANSPARENT;
    this.cept.clearScreen();
    this.cept.resetAttr();
    this.cept.move(0, 1);
    this.cept.screen.rows[1].bg = Cept.COLOR_BLUE;
    this.cept.screen.rows[2].bg = Cept.COLOR_BLUE;
    this.cept.color = Cept.COLOR_YELLOW;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.cept.writeUnicode("Charset Alpha Numerical");
    this.cept.resetAttr();

    for (var j = 0; j < 16; j++) {
      this.cept.move(0, 7+j);
      this.cept.writeUnicode((" " + j).slice(-2));
    }

    x = 3;
    this.cept.move(x, 4);
    this.cept.writeUnicode("Primary");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.PRIMARY[i*16+j]);
      }
    }

    x = 16;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Supplem.");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.SUPPLEMENTARY[i*16+j]);
      }
    }

    x = 29;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Greek");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.GREEK[i*16+j]);
      }
    }
  }

  charsetMosaic() {
    var x;
    this.cept.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.cept.bgColor = Cept.COLOR_TRANSPARENT;
    this.cept.clearScreen();
    this.cept.resetAttr();
    this.cept.move(0, 1);
    this.cept.screen.rows[1].bg = Cept.COLOR_BLUE;
    this.cept.screen.rows[2].bg = Cept.COLOR_BLUE;
    this.cept.color = Cept.COLOR_YELLOW;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.cept.writeUnicode("Charset Mosaic");
    this.cept.resetAttr();

    for (var j = 0; j < 16; j++) {
      this.cept.move(0, 7+j);
      this.cept.writeUnicode((" " + j).slice(-2));
    }

    x = 4;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 1");
    for (var i = 0; i < 2; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_1[i*16+j]);
      }
    }
    for (var i = 4; i < 6; i++) {
      this.cept.move(x - 4 + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x - 4 + 2*i, 7+j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_1[i*16+j]);
      }
    }

    x += 2*4 + 1;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 2");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_2[i*16+j]);
      }
    }

    x += 2*6 + 1;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 3");
    for (var i = 0; i < 4; i++) {
      this.cept.move(x + 2*i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i+4));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2*i, 7+j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_3[(i+2)*16+j]);
      }
    }
  }

  bytestream() {
    var x;
    this.cept.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.cept.bgColor = Cept.COLOR_TRANSPARENT;
    this.cept.clearScreen();
    this.cept.resetAttr();
    this.cept.move(0, 1);
    this.cept.screen.rows[1].bg = Cept.COLOR_BLUE;
    this.cept.screen.rows[2].bg = Cept.COLOR_BLUE;
    this.cept.color = Cept.COLOR_YELLOW;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.cept.writeUnicode("Receiving bytes");
    this.cept.resetAttr();

    this.cept.move(0, 5);
    let bytes = [];
    bytes = [
      0x41, 0x42, 0xad, 0x41,
      0x0d, 0x0a,
      0x61, // a
      0x12, 0x45, // RPT 5
      0x62, // b
      0x1f, 0x47, 0x54, // APA 7, 20
      0x63, // c
      0x1f, 0x48, 0x41, // APA 8, 1
      0x1b, 0x22, 0x41, // ESC 2/2 4/1, switch to parallel C1
      0x81, 0x92, // RDF, GRB
      0x64, // "d"
      0x1f, 0x49, 0x41, // APA 9, 1
      0x1b, 0x23, 0x21, 0x53, // full row attribute yellow background
      0x80, 0x93, // BKF, YLB
      0x66, 0x12, 0x45, // "e" RPT 5
      0x0d, 0x0a,
      0x1b, 0x22, 0x40, // ESC 2/2 4/0, switch to serial C1
      0x84, 0x08, 0x9d, 0x08, 0x83, 0x08, // ANB, APB, NBD, APB, ANY, APB
      0x67, // "f"
      0x20, 0xc8, 0x75, // SPC, umlaut, "u"
    ];
    let i = 0;
    i = window.setInterval(e => {
      if (bytes.length > 0) {
        this.cept.nextByte(bytes.shift());
      } else {
        window.clearInterval(i);
     }
   }, 100);

  }
}
