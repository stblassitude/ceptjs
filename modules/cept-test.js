import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';

export default class CeptTest {

  constructor(cept) {
    this.cept = cept;
  }

  encodeString(s) {
    let r = []
    for (let c of s) {
      r.push(c.charCodeAt(0));
    }
    return r;
  }

  moveTo(y, x) {
    return [0x1f, y + 0x40, x + 0x40];
  }

  crlf() {
    return [0x0d, 0x0a];
  }

  charsAndColors() {
    this.cept.screenColor = Cept.COLOR_BLACK;
    this.cept.clearScreen();
    for (var y = 0; y < this.cept.rows; y++) {
      this.cept.screen.rows[y].bg = y % 32;
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].bg = (this.cept.rows + x - y) % 32;
        this.cept.screen.rows[y].attr[x].char = String.fromCharCode(64 + x + y);
      }
    }
    for (var y = 10; y < 12; y++) {
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].flashf = 1;
        this.cept.screen.rows[y].attr[x].flashp = y - 10;
        this.cept.screen.rows[y].attr[x].flashi = x >= 20;
        this.cept.screen.rows[y].attr[x].flashr = ~~(x / 10) % 2 == 1;
      }
    }
    for (var y = 12; y < 15; y++) {
      for (var x = 0; x < this.cept.cols; x++) {
        this.cept.screen.rows[y].attr[x].flashf = 2;
        this.cept.screen.rows[y].attr[x].flashp = y - 12;
        this.cept.screen.rows[y].attr[x].flashi = x >= 20;
        this.cept.screen.rows[y].attr[x].flashr = ~~(x / 10) % 2 == 1;
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
    this.cept.move(20, y - 1);
    this.cept.resetAttr();
    this.cept.color = Cept.COLOR_RED;
    this.cept.writeUnicode("hid");
    this.cept.move(30, y);
    this.cept.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.cept.color = Cept.COLOR_WHITE;
    this.cept.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.cept.writeUnicode("DH/B");
    this.cept.move(30, y + 1);
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
    this.cept.move(20, y - 1);
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
      this.cept.move(0, 7 + j);
      this.cept.writeUnicode((" " + j).slice(-2));
    }

    x = 3;
    this.cept.move(x, 4);
    this.cept.writeUnicode("Primary");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.PRIMARY[i * 16 + j]);
      }
    }

    x = 16;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Supplem.");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.SUPPLEMENTARY[i * 16 + j]);
      }
    }

    x = 29;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Greek");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.GREEK[i * 16 + j]);
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
      this.cept.move(0, 7 + j);
      this.cept.writeUnicode((" " + j).slice(-2));
    }

    x = 4;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 1");
    for (var i = 0; i < 2; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_1[i * 16 + j]);
      }
    }
    for (var i = 4; i < 6; i++) {
      this.cept.move(x - 4 + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x - 4 + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_1[i * 16 + j]);
      }
    }

    x += 2 * 4 + 1;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 2");
    for (var i = 0; i < 6; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 2));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_2[i * 16 + j]);
      }
    }

    x += 2 * 6 + 1;
    this.cept.move(x, 4);
    this.cept.resetAttr();
    this.cept.writeUnicode("Mosaic 3");
    for (var i = 0; i < 4; i++) {
      this.cept.move(x + 2 * i, 5);
      this.cept.bgColor = Cept.COLOR_TRANSPARENT;
      this.cept.writeUnicode("" + (i + 4));
      this.cept.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.cept.move(x + 2 * i, 7 + j);
        this.cept.write(CeptCodeSets.SUPP_MOSAIC_3[(i + 2) * 16 + j]);
      }
    }
  }

  bytestream() {
    let bytes = [];

    bytes = bytes.concat([
      0x1f, 0x2d, // US DEFINE FORMAT 40x24
      0x1f, 0x2f, 0x42, // US RESET General, parallel C1
      // 0x0c, 0x14, // CS, COF
      0x9b, 0x31, 0x40, // CT2
      0x1b, 0x23, 0x20, 0x54, // ESC 2/3 2/1 full screen BLB
      0x9b, 0x30, 0x40, // CT1
    ]);
    bytes = bytes.concat(this.encodeString("Test Pages"));
    bytes = bytes.concat(this.moveTo(1, 40 - 6));
    bytes = bytes.concat(this.encodeString("DM 0,00"));
    bytes = bytes.concat([
      0x1f, 0x2f, 0x45, 0x58, // RESET service break row 24
      0x20, 0x12, 0x5f, // space RPT 32
    ]);
    bytes = bytes.concat(this.encodeString("1234567a"));
    bytes = bytes.concat([
      0x1f, 0x2f, 0x4f, // RESET service break reset
    ]);

    bytes = bytes.concat([
      0x1b, 0x23, 0x21, 0x54, // ESC 2/3 2/1 full row BLB
      0x0a,
      0x1b, 0x23, 0x21, 0x54, // ESC 2/3 2/1 full row BLB
      0x1b, 0x23, 0x21, 0x4D, // ESC 2/3 2/1 full row DBH
      0x8d, 0x83, // DBH, YLF
    ]);
    bytes = bytes.concat(this.encodeString("Receiving Bytes"));
    bytes = bytes.concat(this.crlf());
    bytes = bytes.concat([
      0x8c, 0x87, 0x9e, 0x0a, // NSZ, WHF, TRB, APD
    ]);

    bytes = bytes.concat(this.encodeString("RPT: "));
    bytes = bytes.concat([
      0x41, 0x12, 0x45, // "a" RPT 5
    ]);
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat(this.encodeString("APA(6,20): "));
    bytes = bytes.concat(this.moveTo(6, 20));
    bytes = bytes.concat(this.encodeString("X"));
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat(this.encodeString("Combining umlaut: "));
    bytes = bytes.concat([
      0xc8, 0x75, // umlaut, "u"
    ]);
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat(this.encodeString("Parallel: "));
    bytes = bytes.concat([
      0x1b, 0x22, 0x41, // ESC 2/2 4/1, switch to parallel C1
      0x81, 0x92, // RDF, GRB
    ]);
    bytes = bytes.concat(this.encodeString("Red on Green"));
    bytes = bytes.concat([
      0x87, 0x9e, // WHF, TRB
    ]);
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat([
      0x1b, 0x23, 0x21, 0x53, // full row attribute yellow background
      0x80, 0x93, // BKF, YLB
    ]);
    bytes = bytes.concat(this.encodeString("Full row black on yellow"));
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat([
      0x1b, 0x22, 0x40, // ESC 2/2 4/0, switch to serial C1
      0x84, 0x08, 0x9d, 0x08, 0x83, 0x08, // ANB, APB, NBD, APB, ANY, APB
    ]);
    bytes = bytes.concat(this.encodeString("Serial yellow on blue"));
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat([
      0x1b, 0x22, 0x40, // ESC 2/2 4/0, switch to serial C1
      0x87, 0x08, // ANW, APB
    ]);
    bytes = bytes.concat(this.encodeString("Mosaic "));
    bytes = bytes.concat([
      0x9e, 0x97, 0x39, 0x87, // HMS, MSW, mosaic, ANW
    ]);
    bytes = bytes.concat(this.encodeString(" m. hold "));
    bytes = bytes.concat([
      0x97, 0x96, 0x93, // MSW, MSC, MSY
      0x9b, 0x31, 0x40, // CT2
      0x93, // MSY
    ]);
    bytes = bytes.concat(this.crlf());

    bytes = bytes.concat([
      0x1b, 0x22, 0x41, // ESC 2/2 4/1, switch to parallel C1
      0x9b, 0x30, 0x40, // CT1
      0x8c, 0x87, 0x9e, 0x89, // NSZ, WHF, TRB, STD
    ]);
    bytes = bytes.concat(this.encodeString("Flash: "));
    bytes = bytes.concat([
      0x88, // FSH
    ]);
    bytes = bytes.concat(this.encodeString("flash "));
    bytes = bytes.concat([
      0x9b, 0x30, 0x41, // IVF
    ]);
    bytes = bytes.concat(this.encodeString("inv. "));
    bytes = bytes.concat([
      0x9b, 0x31, 0x41, // RIF
    ]);
    bytes = bytes.concat(this.encodeString("red.int. "));
    bytes = bytes.concat([
      0x89, 0x88, // STD, FSH
      0x9b, 0x32, 0x41, // FF1
    ]);
    bytes = bytes.concat(this.encodeString("fast1 "));
    bytes = bytes.concat([
      0x9b, 0x35, 0x41, // ICF
    ]);
    bytes = bytes.concat(this.encodeString("2 "));
    bytes = bytes.concat([
      0x9b, 0x35, 0x41, // ICF
    ]);
    bytes = bytes.concat(this.encodeString("3 "));
    bytes = bytes.concat(this.crlf());
    bytes = bytes.concat([
      0x1f, 0x2f, 0x44, // Reset control and graphics set, par. C1
      0x9b, 0x30, 0x40, // CT1
      0x8c, 0x87, 0x9e, 0x89, // NSZ, WHF, TRB, STD
    ]);

    bytes = bytes.concat(this.encodeString("DRCS: "));
    bytes = bytes.concat([
      0x1f, 0x23, 0x20, // DRCS header: rep. 0, keep, #64, (12×10)px, (1×1)c, 1bpp
      0x1f, 0x23, 0x20, 0x20, 0x20, 0x51, // DRCS header: rep. 0, keep, #81, (12×10)px, (1×1)c, 1bpp
      0x1f, 0x23, 0x20, 0x43, // DRCS header: rep. 0, keep, #64, (16×10)px, (1×1)c, 1bpp
      0x1f, 0x23, 0x20, 0x20, 0x20, 0x52, 0x43, // DRCS header: rep. 0, keep, #82, (16×10)px, (1×1)c, 1bpp
      0x1f, 0x23, 0x20, 0x20, 0x20, 0x53, 0x43, 0x33, 0x3b, 0x32, // DRCS header: rep. 0, keep, #83, (16×10)px, (3×2)c, 1bpp
      0x1f, 0x23, 0x20, 0x20, 0x20, 0x54, 0x43, 0x33, 0x3b, 0x32, 0x42, // DRCS header: rep. 0, keep, #84, (16×10)px, (3×2)c, 2bpp
      0x1f, 0x23, 0x20, 0x29, 0x59, // DRCS header: rep. 1, delete, #89, (12×10)px, (1×1)c, 1bpp
      0x1f, 0x23, 0x20, // DRCS header: rep. 0, keep, #64, (12×10)px, (1×1)c, 1bpp
      0x1b, 0x2a, 0x20, 0x40, // G2 ⬅ DRCS0
      0xa0, // DRCS0, char 0
    ]);

    bytes = bytes.concat(this.moveTo(24, 1));
    bytes = bytes.concat([
      0x11, // CON
    ]);

    let i = 0;
    i = window.setInterval(e => {
      if (bytes.length > 0) {
        this.cept.input(bytes.shift());
      } else {
        window.clearInterval(i);
      }
    }, 10);

  }
}
