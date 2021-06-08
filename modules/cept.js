class CeptAttr {
  constructor(attr) {
    this.char = " "
    this.bg = Cept.COLOR_TRANSPARENT;
    this.fg = Cept.COLOR_WHITE;
    this.conceal = false;
    this.flashf = 0;
    this.flashi = false;
    this.flashp = 0;
    this.flashr = false;
    this.inv = false;
    this.marked = false;
    this.protected = false;
    this.size = Cept.SIZE_NORMAL;
    this.underline = false;
    if (attr !== undefined)
      Object.assign(this, attr);
  }

  equals(b) {
    return this.char == b.char
      && this.equalsAttrs(b);
  }

  equalsAttrs(b) {
    return this.bg == b.bg
    && this.fg == b.fg
    && this.conceal == b.conceal
    && this.flashf == b.flashf
    && this.flashi == b.flashi
    && this.flashp == b.flashp
    && this.flashr == b.flashr
    && this.inv == b.inv
    && this.marked == b.marked
    && this.protected == b.protected
    && this.size == b.size
    && this.underline == b.underline
  }
}

class CeptScreenRow {
  constructor(colsOrRow) {
    if (colsOrRow instanceof CeptScreenRow) {
      this.attr = [];
      this.bg = colsOrRow.bg;
      this.cols = colsOrRow.cols;
      for (var x = 0; x < this.cols; x++) {
        this.attr[x] = new CeptAttr(colsOrRow.attr[x]);
      }
    } else {
      this.attr = [];
      this.bg = Cept.COLOR_TRANSPARENT;
      this.cols = colsOrRow;
      for (var x = 0; x < this.cols; x++) {
        this.attr[x] = new CeptAttr();
      }
    }
  }

  equals(b) {
    if (this.bg != b.bg
      || this.cols != b.cols
      || this.attr.length != b.attr.length) {
        return false;
      }
    for (var i=0; i < this.attr.length; i++) {
      if (!this.attr[i].equals(b.attr[i])) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Constants for character encodings.
 */
class CeptCodeSets {
  /** Primary Set of Graphic Characters, 2/0 to 7/15 */
  static PRIMARY = [
    " ", "!", "\"", "#", "\u00a4", "%", "&", "/",
    "(", ")", "*", "+", ",", "-", ".", "/",
    "0", "1", "2", "3", "4", "5", "6", "7",
    "8", "9", ":", ";", "<", "=", ">", "?",
    "@", "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W",
    "X", "Y", "Z", "[", "\\", "]", "^", "_",
    "`", "a", "b", "c", "d", "e", "f", "g",
    "h", "i", "j", "k", "l", "m", "n", "o",
    "p", "q", "r", "s", "t", "u", "v", "w",
    "x", "y", "z", "{", "|", "}", "\u00af", "\u25a0" // 7/14 could also be \u0203e
  ]

  /** Supplementary Set of Graphic Characters, 2/0 to 7/15 */
  static SUPPLEMENTARY = [
    // 2/0-2/7
    " ", "¡", "ç", "£", "$", "¥", "#", "§",
    // 2/8-2/15
    "\u00a4", "‘", "“", "«", "\u2190", "\u2191", "\u2192", "\u2193",
    // 3/0-3/7
    "°", "\u00b1", "\u00b2", "\u00b3", "\u00d7", "\u00b5", "\u00b6", "\u00b7",
    // 3/8-3/15
    "\u00f7", "’", "”", "»", "\u00bc", "\u00bd", "\u00be", "\u00bf",
    // 4/0-4/7: combining diacritical marks, need special handling in the code
    "\u0308\u0301", "\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0306", "\u0307",
    // 4/8-4/15
    "\u0308", " ", "\u030a", "\u0327", "\u0332", "\u030b", "\u0328", "\u030c",
    // 5/0-5/7: 5/1 unclear; 5/5 "musical symbol" is shown as an eight note in the standard, so use that
    "\u2014", " ", "\u00ae", "\u00a9", "\u2122", "\u266a", " ", " ",
    // 5/8-5/15
    " ", " ", " ", " ", "\u215b", "\u215c", "\u215d", "\u215e",
    // 6/0-6/7: 6/0 is Ohm, 6/5 is undefined, 6/7 is L with middle dot
    "Ω", "Æ", "Ð", "ª", "Ħ", " ", "Ĳ", "Ŀ",
    // 6/8-6/15: 6/8 is L stroke, 6/12 is thorn, 6/13 is T stroke, 6/14 is eng, 6/15 is n acute
    "Ł", "Ø", "Œ", "º", "Þ", "Ŧ", "Ŋ", "ń",
    // 7/0-7/7: 7/0 is "kra", 7/5 is i without dot, 7/7 is l with middle dot
    "ĸ", "æ", "đ", "ð", "ħ", "ı", "ĳ", "ŀ",
    // 7/8-7/15: 7/8 is l stroke,
    "ł", "ø", "œ", "ß", "þ", "ŧ", "ŋ", "\u25a0"
  ]

  /** First Supplementary Set of Mosaic Characters, 2/0 to 7/15 */
  static SUPP_MOSAIC_1 = [
    // 2/0-2/7
    " ", "\u{1fb00}", "\u{1fb01}", "\u{1fb02}", "\u{1fb03}", "\u{1fb04}", "\u{1fb05}", "\u{1fb06}",
    // 2/8-2/15
    "\u{1fb07}", "\u{1fb08}", "\u{1fb09}", "\u{1fb0a}", "\u{1fb0b}", "\u{1fb0c}", "\u{1fb0d}", "\u{1fb0e}",
    // 3/0-3/7
    "\u{1fb0f}", "\u{1fb10}", "\u{1fb11}", "\u{1fb12}", "\u{1fb13}", "\u258c", "\u{1fb14}", "\u{1fb15}",
    // 3/8-3/15
    "\u{1fb16}", "\u{1fb17}", "\u{1fb18}", "\u{1fb19}", "\u{1fb1a}", "\u{1fb1b}", "\u{1fb1c}", "\u{1fb1d}",
    // 4/0-5/15
    "@", "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W",
    "X", "Y", "Z", "[", "\\", "]", "^", "_",
    // 6/0-6/7
    "\u{1fb1e}", "\u{1fb1f}", "\u{1fb20}", "\u{1fb21}", "\u{1fb22}", "\u{1fb23}", "\u{1fb24}", "\u{1fb25}",
    // 6/8-6/15
    "\u{1fb26}", "\u{1fb27}", "\u2590", "\u{1fb28}", "\u{1fb29}", "\u{1fb2a}", "\u{1fb2b}", "\u{1fb2c}",
    // 7/0-7/7
    "\u{1fb2d}", "\u{1fb2e}", "\u{1fb2f}", "\u{1fb30}", "\u{1fb31}", "\u{1fb32}", "\u{1fb33}", "\u{1fb34}",
    // 7/8-7/15
    "\u{1fb35}", "\u{1fb36}", "\u{1fb37}", "\u{1fb38}", "\u{1fb39}", "\u{1fb3a}", "\u{1fb3b}", "\u2588"
  ]

  /** Second Supplementary Set of Mosaic Characters, 2/0 to 7/15 */
  static SUPP_MOSAIC_2 = [
    // 2/0-2/7
    " ", "\u{1fb00}", "\u{1fb01}", "\u{1fb02}", "\u{1fb03}", "\u{1fb04}", "\u{1fb05}", "\u{1fb06}",
    // 2/8-2/15
    "\u{1fb07}", "\u{1fb08}", "\u{1fb09}", "\u{1fb0a}", "\u{1fb0b}", "\u{1fb0c}", "\u{1fb0d}", "\u{1fb0e}",
    // 3/0-3/7
    "\u{1fb0f}", "\u{1fb10}", "\u{1fb11}", "\u{1fb12}", "\u{1fb13}", "\u258c", "\u{1fb14}", "\u{1fb15}",
    // 3/8-3/15
    "\u{1fb16}", "\u{1fb17}", "\u{1fb18}", "\u{1fb19}", "\u{1fb1a}", "\u{1fb1b}", "\u{1fb1c}", "\u{1fb1d}",
    // 4/0-4/7
    "\u{1fb3c}", "\u{1fb3d}", "\u{1fb3e}", "\u{1fb3f}", "\u{1fb40}", "\u25e6", "\u{1fb41}", "\u{1fb42}",
    // 4/8-4/15
    "\u{1fb43}", "\u{1fb44}", "\u{1fb45}", "\u{1fb46}", "\u{1fb68}", "\u{1fb69}", "\u{1fb70}", "\u2592",
    // 5/0-5/7
    "\u{1fb47}", "\u{1fb48}", "\u{1fb49}", "\u{1fb4a}", "\u{1fb4b}", "\u25e2", "\u{1fb4c}", "\u{1fb4d}",
    // 5/0-5/15
    "\u{1fb4e}", "\u{1fb4f}", "\u{1fb50}", "\u{1fb51}", "\u{1fb6a}", "\u{1fb6b}", "\u{1fb75}", "\u2588",
    // 6/0-6/7
    "\u{1fb1e}", "\u{1fb1f}", "\u{1fb20}", "\u{1fb21}", "\u{1fb22}", "\u{1fb23}", "\u{1fb24}", "\u{1fb25}",
    // 6/8-6/15
    "\u{1fb26}", "\u{1fb27}", "\u2590", "\u{1fb28}", "\u{1fb29}", "\u{1fb2a}", "\u{1fb2b}", "\u{1fb2c}",
    // 7/0-7/7
    "\u{1fb2d}", "\u{1fb2e}", "\u{1fb2f}", "\u{1fb30}", "\u{1fb31}", "\u{1fb32}", "\u{1fb33}", "\u{1fb34}",
    // 7/8-7/15
    "\u{1fb35}", "\u{1fb36}", "\u{1fb37}", "\u{1fb38}", "\u{1fb39}", "\u{1fb3a}", "\u{1fb3b}", "\u2588"
  ]

  /** Third Supplementary Set of Mosaic Characters, 2/0 to 7/15 */
  static SUPP_MOSAIC_3 = [
    // 2/0-2/7
    " ", " ", " ", " ", " ", " ", " ", " ",
    // 2/8-2/15
    " ", " ", " ", " ", " ", " ", " ", " ",
    // 3/0-3/7
    " ", " ", " ", " ", " ", " ", " ", " ",
    // 3/0-3/15
    " ", " ", " ", " ", " ", " ", " ", " ",
    // 4/0-4/7
    "\u2537", "\u252f", "\u251d", "\u2525", "\u{1fba4}", "\u{1fba5}", "\u{1fba6}", "\u{1fba7}",
    // 4/7-4/15
    "\u{1fba0}", "\u{1fba1}", "\u{1fba2}", "\u{1fba3}", "\u253f", "\u2022", "\u25cf", "\u25cb",
    // 5/0-5/7
    "\u2502", "\u2500", "\u250c", "\u2510", "\u2514", "\u2518", "\u251c", "\u2524",
    // 5/0-5/15
    "\u252c", "\u2524", "\u253c", "\u2b62", "\u2b60", "\u2b61", "\u2b63", " ",
    // 6/0-6/7
    "\u{1fb52}", "\u{1fb53}", "\u{1fb54}", "\u{1fb55}", "\u{1fb56}", "\u25e5", "\u{1fb57}", "\u{1fb58}",
    // 6/8-6/15
    "\u{1fb59}", "\u{1fb5a}", "\u{1fb5b}", "\u{1fb5c}", "\u{1fb6c}", "\u{1fb6d}", " ", " ",
    // 7/0-7/7
    "\u{1fb5d}", "\u{1fb5e}", "\u{1fb5f}", "\u{1fb60}", "\u{1fb61}", "\u25e4", "\u{1fb62}", "\u{1fb63}",
    // 7/8-7/15
    "\u{1fb64}", "\u{1fb65}", "\u{1fb66}", "\u{1fb67}", "\u{1fb6e}", "\u{1fb6f}", " ", " "
  ]

  /** The Greek Primary Set of Graphic Characters, 2/0 to 7/15 */
  static GREEK = [
    " ", "!", "\"", "#", "\u00a4", "%", "&", "/",
    "(", ")", "*", "+", ",", "-", ".", "/",
    "0", "1", "2", "3", "4", "5", "6", "7",
    "8", "9", ":", ";", "<", "=", ">", "?",
    // 4/0-4/7
    "@", "\u0391", "\u0392", "\u0393", "\u0394", "\u0395", "\u0396", "\u0397",
    // 4/7-4/15
    "\u0398", "\u0399", "\u039a", "\u039b", "\u039c", "\u039d", "\u039e", "\u039f",
    // 5/0-5/7
    "\u03a0", "\u03a1", "\u03a3", "\u03a3", "\u03a4", "\u03a5", "\u03a6", "\u03a7",
    // 5/8-5/15
    "\u03a8", "\u03a9", " ", "[", "\\", "]", "^", "_",
    // 6/0-6/7
    "`", "\u03b1", "\u03b2", "\u03b3", "\u03b4", "\u03b5", "\u03b6", "\u03b7",
    // 6/8-6/15
    "\u03b8", "\u03b9", "\u03ba", "\u03bb", "\u03bc", "\u03bd", "\u03be", "\u03bf",
    // 7/0-7/7
    "\u03c0", "\u03c1", "\u03c3", "\u03c3", "\u03c4", "\u03c5", "\u03c6", "\u03c7",
    // 7/8-7/15
    "\u03c8", "\u03c9", " ", "{", "|", "}", "\u00af", "\u25a0"
  ]
}

export default class Cept {
  static COLOR_BLACK = 0;
  static COLOR_RED = 1;
  static COLOR_GREEN = 2;
  static COLOR_YELLOW = 3;
  static COLOR_BLUE = 4;
  static COLOR_MAGENTA = 5;
  static COLOR_CYAN = 6;
  static COLOR_WHITE = 7;
  static COLOR_TRANSPARENT = 8;
  static COLOR_REDUCED_INTENSITY_RED = 9;
  static COLOR_REDUCED_INTENSITY_GREEN = 10;
  static COLOR_REDUCED_INTENSITY_YELLOW = 11;
  static COLOR_REDUCED_INTENSITY_BLUE = 12;
  static COLOR_REDUCED_INTENSITY_MAGENTA = 13;
  static COLOR_REDUCED_INTENSITY_CYAN = 14;
  static COLOR_GREY = 15;

  static FLASH_MODE_STEADY = 0;
  static FLASH_MODE_FLASH = 1;
  static FLASH_MODE_FAST = 2;

  static SIZE_NORMAL = 0;
  static SIZE_DOUBLE_WIDTH = 1;
  static SIZE_DOUBLE_HEIGHT_ABOVE = 2;
  static SIZE_DOUBLE_HEIGHT_BELOW = 3;
  static SIZE_DOUBLE_SIZE_ABOVE = 4;
  static SIZE_DOUBLE_SIZE_BELOW = 5;

  constructor(selector, options={}) {
    this.elements = {};
    if (selector instanceof HTMLElement) {
      this.elements.container = selector;
    } else if (selector instanceof String) {
      this.elements.container = document.querySelector(selector);
      if (this.elements.container === null) {
        throw "Unable to find element matching " + selector;
      }
    } else {
      throw "Need to specify element or selector";
    }

    this.rows = 25;
    this.cols = 40;

    this.cursor = { x: 0, y: 0, visible: false };
    this.attr = new CeptAttr();
    this.reveal = false;

    this.clut = []
    this.resetClut();

    this.flashp = 0;
    this.forcedUpdate = true;

    this.id = this._randomId();

    this.screen = {}
    this.screen.rows = []
    this.screen.lastrows = []
    this.screen.bg = Cept.COLOR_BLACK;
    this.screen.attr = [];
    for (var y = 0; y < this.rows; y++) {
      this.screen.attr[y] = [];
      this.screen.rows[y] = new CeptScreenRow(this.cols);
      this.screen.lastrows[y] = new CeptScreenRow(this.cols);
    }

    this.elements.screen = document.createElement("div");
    this.elements.screen.id = "cept-screen-" + this.id;
    this.elements.screen.className = "cept-screen";
    this.elements.container.appendChild(this.elements.screen);

    var sheet = document.createElement("style");
    sheet.title = this.elements.screen.id;
    this.elements.container.appendChild(sheet);
    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].title === this.elements.screen.id)
        this.elements.sheet = document.styleSheets[i]
    }
    this._updateStyleSheet();

    this.elements.above = document.createElement("div");
    this.elements.above.className = "cept-above"
    this.elements.below = document.createElement("div");
    this.elements.below.className = "cept-below";
    this.screenColor = 0;

    this.elements.row = [];
    this.elements.screen.appendChild(this.elements.above);
    for (var y = 0; y < this.rows; y++) {
      this.elements.row[y] = document.createElement("div");
      this.elements.row[y].className = "cept-row";
      this.elements.screen.appendChild(this.elements.row[y]);
      this._updateRow(y);
    }
    this.elements.screen.appendChild(this.elements.below);

    this.clear(10, 10, 20, 5);

    // do this last so no interval is running unless initialization was successful
    window.setInterval(this._flashInterval.bind(this), 1000/6);
  }

  _randomId() {
    var id;

    do {
      id = btoa(Math.random()).substr(10, 5);
    } while (document.getElementById("cept-screen-" + id) != null);

    return id;
  }

  /**
   * Only color index 8 is ever going to be transparent, and only if defined as black.
   */
  _isTransparent(c) {
    return c === Cept.COLOR_TRANSPARENT && this._rgba_from_clut(c) == "rgba(0,0,0,0)";
  }

  /**
   * We need to emulate the transparent foreground color by finding the first non-transparent color.
   */
  _effectiveColor(c, row) {
    if (!this._isTransparent(c))
      return c;
    if (!this._isTransparent(row.bg))
      return row.bg;
    if (!this._isTransparent(this.screen.bg))
      return this.screen.bg;
    return [0,0,0,1];
  }

  /**
   * Create a span element for the given attributes and text.
   */
  _spanForAttr(attr, text) {
    var s = document.createElement("span");
    s.classList.add("cept-span", this._bgClass(attr.bg), this._fgClass(attr.fg));
    s.classList.toggle("cept-ul", attr.underline);
    s.classList.toggle("cept-dw", attr.size == Cept.SIZE_DOUBLE_WIDTH);
    s.classList.toggle("cept-dha", attr.size == Cept.SIZE_DOUBLE_HEIGHT_ABOVE);
    s.classList.toggle("cept-dhb", attr.size == Cept.SIZE_DOUBLE_HEIGHT_BELOW);
    s.classList.toggle("cept-dsa", attr.size == Cept.SIZE_DOUBLE_SIZE_ABOVE);
    s.classList.toggle("cept-dsb", attr.size == Cept.SIZE_DOUBLE_SIZE_BELOW);

    var t = document.createTextNode(text);
    s.appendChild(t);
    return s;
  }

  /**
   * Create a list of spans for the different formatting on a row. Returns
   * the (potentially unchanged) row, and updates the spans array.
   */
  _createUpdatedRow(row) {
    var spans = [];
    var lastAttr = new CeptAttr(row.attr[0]);
    var nextAttr = new CeptAttr();
    var text = "";
    for (var x = 0; x < this.cols; x++) {
      Object.assign(nextAttr, row.attr[x]);
      if ((nextAttr.flashf == 1 && (~~(this.flashp / 3) != nextAttr.flashp ^ nextAttr.flashi))
          || (nextAttr.flashf == 2 && (~~(this.flashp / 2) != nextAttr.flashp) ^ nextAttr.flashi)) {
         // flash between palette 0/1 or 2/3, "reduced intensity flash"
        nextAttr.fg = nextAttr.flashr ? nextAttr.fg ^ 8 : nextAttr.bg;
      }
      if (nextAttr.inv) {
        var temp = nextAttr.fg;
        nextAttr.fg = nextAttr.bg;
        nextAttr.bg = temp;
      }
      if (nextAttr.conceal && !this.reveal) {
        // nextAttr.fg = nextAttr.bg;
        nextAttr.char = " ";
      }
      nextAttr.fg = this._effectiveColor(nextAttr.fg, row);
      Object.assign(row.attr[x], nextAttr);
      // if not the same as before, emit span and start a new one
      if (!lastAttr.equalsAttrs(nextAttr)) {
        if (text != "") {
          spans.push(this._spanForAttr(lastAttr, text));
        }
        Object.assign(lastAttr, nextAttr);
        text = "";
      }
      text += nextAttr.char;
    }
    spans.push(this._spanForAttr(lastAttr, text));
    return spans;
  }

  /**
   * Put spaces into positions where double wide/height/size characters are
   */
  _blankOutDoubles(row, y) {
    for (var x = 0; x < this.cols-1; x++) {
      if (row.attr[x].size == Cept.SIZE_DOUBLE_WIDTH) {
        row.attr[x+1].char = " "
      }
    }
    if (y > 0) {
      for (var x = 0; x < this.cols; x++) {
        var size = this.screen.rows[y-1].attr[x].size;
        if (size == Cept.SIZE_DOUBLE_SIZE_BELOW) {
          row.attr[x].char = " ";
          row.attr[x+1].char = " ";
        } else if (size == Cept.SIZE_DOUBLE_HEIGHT_BELOW) {
          row.attr[x].char = " ";
        }
      }
    }
    if (y < this.rows-1) {
      for (var x = 0; x < this.cols; x++) {
        var size = this.screen.rows[y+1].attr[x].size;
        if (size == Cept.SIZE_DOUBLE_SIZE_ABOVE) {
          row.attr[x].char = " ";
          row.attr[x+1].char = " ";
        } else if (size == Cept.SIZE_DOUBLE_HEIGHT_ABOVE) {
          row.attr[x].char = " ";
        }
      }
    }
  }

  /**
   * (Re-)Create the DOM for one row.
   */
  _updateRow(y) {
    this.elements.row[y].className = "cept-row " + this._bgClass(this.screen.rows[y].bg);

    var spans = [];
    var row = new CeptScreenRow(this.screen.rows[y]);
    this._blankOutDoubles(row, y);
    if (this.cursor.visible && y == this.cursor.y && ~~(this.flashp % 2) == 0)
      row.attr[this.cursor.x].bg = Cept.COLOR_GREY;
    var spans = this._createUpdatedRow(row)
    if (this.forcedUpdate || !this.screen.lastrows[y].equals(row)) {
      // only if the new row differs from the last one replace the elements
      this.elements.row[y].replaceChildren(...spans);
      this.screen.lastrows[y] = row;
    }
  }

  /**
   * Return a CSS RGBA() definition for a color lookup table entry.
   */
  _rgba_from_clut(i) {
    return "rgba(" + this.clut[i][0] + "," + this.clut[i][1] + "," + this.clut[i][2] + "," + this.clut[i][3] + ")";
  }

  _flashInterval() {
    this.flashp = (this.flashp + 1) % 6;
    this.updateScreen();
  }

  _bgClass(i) {
    return "cept-bg-" + this.id + "-" + i;
  }

  _fgClass(i) {
    return "cept-fg-" + this.id + "-" + i;
  }

  _updateStyleSheet() {
    for (var i = 0; i < 32; i++) {
      if (this.elements.sheet.cssRules.length > i)
        this.elements.sheet.deleteRule(i);
      this.elements.sheet.insertRule("." + this._fgClass(i) + " { color: " + this._rgba_from_clut(i) + "}", i);
    }
    for (var i = 0; i < 32; i++) {
      if (this.elements.sheet.cssRules.length > i+32)
        this.elements.sheet.deleteRule(i+32);
      this.elements.sheet.insertRule("." + this._bgClass(i) + " { background-color: " + this._rgba_from_clut(i) + "}", i);
    }
  }

  _limitCursor() {
    this.cursor.x %= this.cols;
    if (this.cursor.x < 0)
      this.cursor.x = this.cols - this.cursor.x;
    this.cursor.y %= this.rows;
    if (this.cursor.y < 0)
      this.cursor.y = this.rows - this.cursor.y;
  }

  resetClut() {
    this.clut = [
      [0, 0, 0, 1],
      [255, 0, 0, 1],
      [0, 255, 0, 1],
      [255, 255, 0, 1],
      [0, 0, 255, 1],
      [255, 0, 255, 1],
      [0, 255, 255, 1],
      [255, 255, 255, 1],

      [0, 0, 0, 0],
      [128, 0, 0, 1],
      [0, 128, 0, 1],
      [128, 128, 0, 1],
      [0, 0, 128, 1],
      [128, 0, 128, 1],
      [0, 128, 128, 1],
      [128, 128, 128, 1],

      [0, 0, 0, 1],
      [255, 0, 0, 1],
      [0, 255, 0, 1],
      [255, 255, 0, 1],
      [0, 0, 255, 1],
      [255, 0, 255, 1],
      [0, 255, 255, 1],
      [255, 255, 255, 1],

      [0, 0, 0, 1],
      [255, 0, 0, 1],
      [0, 255, 0, 1],
      [255, 255, 0, 1],
      [0, 0, 255, 1],
      [255, 0, 255, 1],
      [0, 255, 255, 1],
      [255, 255, 255, 1],
    ];
  }

  get bgColor() {
    return this.attr.bg;
  }

  set bgColor(c) {
    this.attr.bg = c;
  }

  get color() {
    return this.attr.fg;
  }

  set color(c) {
    this.attr.fg = c;
  }

  get concealed() {
    return this.attr.conceal;
  }

  set concealed(c) {
    this.attr.conceal = c;
  }

  get cursorVisible() {
    return this.cursor.visible;
  }

  set cursorVisible(c) {
    this.cursor.visible = c;
  }

  get flashMode() {
    return this.attr.flashf;
  }

  set flashMode(f) {
    this.attr.flashf = f;
  }

  get flashInverted() {
    return this.attr.flashi;
  }

  set flashInverted(i) {
    this.attr.flashi = i;
  }

  get flashReducedIntensity() {
    return this.attr.flashr;
  }

  set flashReducedIntensity(r) {
    this.attr.flashr = r;
  }

  get flashPhase() {
    return this.attr.flashp;
  }

  set flashPhase(p) {
    this.attr.flashp = p;
  }

  get inverted() {
    return this.attr.inv;
  }

  set inverted(i) {
    this.attr.inv = i;
  }

  get revealed() {
    return this.reveal;
  }

  set revealed(r) {
    this.reveal = r;
  }

  get screenColor() {
    return this.screen.bg;
  }

  set screenColor(c) {
    this.screen.bg = c;
    for (var y = 0; y < this.rows; y++) {
      this.screen.rows[y].bg = c;
    }
  }

  get size() {
    return this.attr.size;
  }

  set size(s) {
    this.attr.size = s;
  }

  get underlined() {
    return this.attr.underline;
  }

  set underlined(u) {
    this.attr.underline = u;
  }

  clear(x0, y0, w, h) {
    this.fill(x0, y0, w, h, " ");
  }

  clearScreen() {
    this.clear(0, 0, this.cols, this.rows);
    for (var y = 0; y < this.rows; y++) {
      this.screen.rows[y].bg = this.screenColor;
    }
  }

  fill(x0, y0, w, h, c) {
    var x1 = x0 + w;
    var y1 = y0 + h;
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        this.screen.rows[y].attr[x] = new CeptAttr();
        this.screen.rows[y].attr[x].char = c;
      }
      this._updateRow(y);
    }
  }

  move(x, y) {
    this.cursor.x = x;
    this.cursor.y = y;
    this._limitCursor();
  }

  moveUp() {
    this.cursor.y--;
    this._limitCursor();
  }

  moveDown() {
    this.cursor.y++;
    this._limitCursor();
  }

  moveLeft() {
    this.cursor.x--;
    this._limitCursor();
  }

  moveRight() {
    this.cursor.x++;
    this._limitCursor();
  }

  moveReturn() {
    this.cursor.x = 0;
    this._limitCursor();
  }

  resetAttr() {
    Object.assign(this.attr, new CeptAttr);
  }

  updateScreen(force) {
    this.elements.above.className = "cept-above " + this._bgClass(this.screen.bg);
    this.elements.below.className = "cept-below " + this._bgClass(this.screen.bg);
    if (force)
      this.forcedUpdate = true;
    for (var y = 0; y < this.rows; y++) {
      this._updateRow(y);
    }
    this.forcedUpdate = false;
  }

  write(c) {
    // if it is a stand-alone combining diacritical mark, add a space
    if (c.charCodeAt(0) >= 0x300 && c.charCodeAt(0) <= 0x36f) {
      // c = "\u25cc" + c; // small dotted circle
      c = "\u00a0" + c;
    }
    var x = this.cursor.x;
    var y = this.cursor.y;
    Object.assign(this.screen.rows[y].attr[x], this.attr);
    this.screen.rows[y].attr[x].char = c;
    x += 1;
    if (this.attr.size == Cept.SIZE_DOUBLE_WIDTH
        || this.attr.size == Cept.SIZE_DOUBLE_SIZE_ABOVE
        || this.attr.size == Cept.SIZE_DOUBLE_SIZE_BELOW)
      x += 1;
    if (x >= this.cols) {
      x = 0;
      y += 1;
      if (y >= this.rows)
        y = 0;
    }
    this.cursor.x = x;
    this.cursor.y = y;
  }

  writeUnicode(t) {
    t = t.normalize();
    for (let c of t) {
      this.write(c)
    }
  }

  testPattern1() {
    this.screenColor = Cept.COLOR_BLACK;
    this.clearScreen();
    for (var y = 0; y < this.rows; y++) {
      this.screen.rows[y].bg = y % 32;
      for (var x = 0; x < this.cols; x++) {
        this.screen.rows[y].attr[x].bg = (this.rows+x-y) % 32;
        this.screen.rows[y].attr[x].char = String.fromCharCode(64+x+y);
      }
    }
    for (var y = 10; y < 12; y++) {
      for (var x = 0; x < this.cols; x++) {
        this.screen.rows[y].attr[x].flashf = 1;
        this.screen.rows[y].attr[x].flashp = y-10;
        this.screen.rows[y].attr[x].flashi = x >= 20;
        this.screen.rows[y].attr[x].flashr = ~~(x / 10) % 2 == 1;
      }
    }
    for (var y = 12; y < 15; y++) {
      for (var x = 0; x < this.cols; x++) {
        this.screen.rows[y].attr[x].flashf = 2;
        this.screen.rows[y].attr[x].flashp = y-12;
        this.screen.rows[y].attr[x].flashi = x >= 20;
        this.screen.rows[y].attr[x].flashr = ~~(x / 10 ) % 2 == 1;
      }
    }
    this.updateScreen();
  }

  testPattern2() {
    var y;
    this.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.bgColor = Cept.COLOR_TRANSPARENT;
    this.clearScreen();
    this.resetAttr();
    this.move(0, 0);
    this.color = Cept.COLOR_YELLOW;
    this.size = Cept.SIZE_DOUBLE_SIZE_BELOW;
    this.writeUnicode("Attribute Test");

    y = 1;

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Flash");
    this.move(20, y);
    this.flashMode = Cept.FLASH_MODE_FLASH;
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.writeUnicode("Normal");
    this.move(30, y);
    this.flashInverted = true;
    this.writeUnicode("Inverted");

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Reduced Intensity");
    this.move(20, y);
    this.flashReducedIntensity = true;
    this.flashMode = Cept.FLASH_MODE_FLASH;
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.writeUnicode("Normal");
    this.move(30, y);
    this.flashInverted = true;
    this.writeUnicode("Inverted");

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Fast");
    this.flashMode = Cept.FLASH_MODE_FAST;
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.move(25, y);
    this.flashPhase = 0;
    this.writeUnicode("One");
    this.move(30, y);
    this.flashPhase = 1;
    this.writeUnicode("Two");
    this.move(35, y);
    this.flashPhase = 2;
    this.writeUnicode("Three");

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Fast/RI");
    this.move(10, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.flashMode = Cept.FLASH_MODE_FAST;
    this.flashReducedIntensity = true;
    this.move(25, y);
    this.flashPhase = 0;
    this.writeUnicode("One");
    this.move(30, y);
    this.flashPhase = 1;
    this.writeUnicode("Two");
    this.move(35, y);
    this.flashPhase = 2;
    this.writeUnicode("Three");

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Fast/RI/Inverted");
    this.move(10, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.flashMode = Cept.FLASH_MODE_FAST;
    this.flashInverted = true;
    this.flashReducedIntensity = true;
    this.move(25, y);
    this.flashPhase = 0;
    this.writeUnicode("One");
    this.move(30, y);
    this.flashPhase = 1;
    this.writeUnicode("Two");
    this.move(35, y);
    this.flashPhase = 2;
    this.writeUnicode("Three");

    y += 1;
    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Decoration");
    this.move(20, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.underlined = true;
    this.writeUnicode("Under");
    this.move(30, y);
    this.underlined = false;
    this.inverted = true;
    this.writeUnicode("Inverted");

    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Concealed");
    this.move(20, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.writeUnicode("Normal");
    this.move(30, y);
    this.concealed = true;
    this.writeUnicode("Concealed");

    y += 1;
    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Width");
    this.move(20, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.writeUnicode("Normal");
    this.move(30, y);
    this.resetAttr();
    this.color = Cept.COLOR_RED;
    this.writeUnicode("hhiiddee");
    this.move(30, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.color = Cept.COLOR_WHITE;
    this.size = Cept.SIZE_DOUBLE_WIDTH;
    this.writeUnicode("Doubl");

    y += 1;
    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Height");
    this.move(20, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.size = Cept.SIZE_DOUBLE_HEIGHT_ABOVE;
    this.writeUnicode("DH/A");
    this.move(20, y-1);
    this.resetAttr();
    this.color = Cept.COLOR_RED;
    this.writeUnicode("hid");
    this.move(30, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.color = Cept.COLOR_WHITE;
    this.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.writeUnicode("DH/B");
    this.move(30, y+1);
    this.resetAttr();
    this.color = Cept.COLOR_RED;
    this.writeUnicode("hid");

    y += 1;
    y += 1;
    this.resetAttr();
    this.move(0, y);
    this.writeUnicode("Size");
    this.move(20, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.color = Cept.COLOR_WHITE;
    this.size = Cept.SIZE_DOUBLE_SIZE_ABOVE;
    this.writeUnicode("DS/A");
    this.move(20, y-1);
    // y += 1;
    this.resetAttr();
    this.color = Cept.COLOR_RED;
    this.writeUnicode("hide");
    this.move(30, y);
    this.bgColor = Cept.COLOR_REDUCED_INTENSITY_GREEN;
    this.color = Cept.COLOR_WHITE;
    this.size = Cept.SIZE_DOUBLE_SIZE_BELOW;
    this.writeUnicode("DS/B");
    this.move(30, y+1);
    y += 1;
    this.resetAttr();
    this.color = Cept.COLOR_RED;
    this.writeUnicode("hide");

    this.move(0, 24);
    this.cursorVisible = true;

    this.updateScreen();
  }

  charsetAlpha() {
    var x;
    this.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.bgColor = Cept.COLOR_TRANSPARENT;
    this.clearScreen();
    this.resetAttr();
    this.move(0, 1);
    this.screen.rows[1].bg = Cept.COLOR_BLUE;
    this.screen.rows[2].bg = Cept.COLOR_BLUE;
    this.color = Cept.COLOR_YELLOW;
    this.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.writeUnicode("Charset Alpha Numerical");
    this.resetAttr();

    for (var j = 0; j < 16; j++) {
      this.move(0, 7+j);
      this.writeUnicode((" " + j).slice(-2));
    }

    x = 3;
    this.move(x, 4);
    this.writeUnicode("Primary");
    for (var i = 0; i < 6; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.PRIMARY[i*16+j]);
      }
    }

    x = 16;
    this.move(x, 4);
    this.resetAttr();
    this.writeUnicode("Supplem.");
    for (var i = 0; i < 6; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.SUPPLEMENTARY[i*16+j]);
      }
    }

    x = 29;
    this.move(x, 4);
    this.resetAttr();
    this.writeUnicode("Greek");
    for (var i = 0; i < 6; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.GREEK[i*16+j]);
      }
    }
  }

  charsetMosaic() {
    var x;
    this.screenColor = Cept.COLOR_REDUCED_INTENSITY_BLUE;
    this.bgColor = Cept.COLOR_TRANSPARENT;
    this.clearScreen();
    this.resetAttr();
    this.move(0, 1);
    this.screen.rows[1].bg = Cept.COLOR_BLUE;
    this.screen.rows[2].bg = Cept.COLOR_BLUE;
    this.color = Cept.COLOR_YELLOW;
    this.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
    this.writeUnicode("Charset Mosaic");
    this.resetAttr();

    for (var j = 0; j < 16; j++) {
      this.move(0, 7+j);
      this.writeUnicode((" " + j).slice(-2));
    }

    x = 4;
    this.move(x, 4);
    this.resetAttr();
    this.writeUnicode("Mosaic 1");
    for (var i = 0; i < 2; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.SUPP_MOSAIC_1[i*16+j]);
      }
    }
    for (var i = 4; i < 6; i++) {
      this.move(x - 4 + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x - 4 + 2*i, 7+j);
        this.write(CeptCodeSets.SUPP_MOSAIC_1[i*16+j]);
      }
    }

    x += 2*4 + 1;
    this.move(x, 4);
    this.resetAttr();
    this.writeUnicode("Mosaic 2");
    for (var i = 0; i < 6; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+2));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.SUPP_MOSAIC_2[i*16+j]);
      }
    }

    x += 2*6 + 1;
    this.move(x, 4);
    this.resetAttr();
    this.writeUnicode("Mosaic 3");
    for (var i = 0; i < 4; i++) {
      this.move(x + 2*i, 5);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.writeUnicode("" + (i+4));
      this.bgColor = Cept.COLOR_GREY;
      for (var j = 0; j < 16; j++) {
        this.move(x + 2*i, 7+j);
        this.write(CeptCodeSets.SUPP_MOSAIC_3[(i+2)*16+j]);
      }
    }
  }
}
