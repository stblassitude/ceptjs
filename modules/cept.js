import CeptCodeSets from './cept-codesets.js';
import CeptInputState from './cept-inputstate.js'

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
    // FIXME: we need an attr for full row attributes like double height
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
  static SIZE_DOUBLE_SIZE = 4;

  constructor(selector, options={}) {
    this.elements = {};
    if (selector instanceof HTMLElement) {
      this.elements.container = selector;
    } else if (typeof selector === "string") {
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

    this.inputstate = new CeptInputState(this);

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
    s.classList.toggle("cept-ds", attr.size == Cept.SIZE_DOUBLE_SIZE);

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
        if (size == Cept.SIZE_DOUBLE_HEIGHT_BELOW) {
          row.attr[x].char = " ";
        }
      }
    }
    if (y < this.rows-1) {
      for (var x = 0; x < this.cols; x++) {
        var size = this.screen.rows[y+1].attr[x].size;
        if (size == Cept.SIZE_DOUBLE_SIZE) {
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
    this.attr.flashp = p % 3;
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

  /**
   * Reset display state. See 3.1 General Display Reset
   */
  reset() {

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

  serialControl(f) {
    for (var x = this.cursor.x; x < this.screen.cols; x++) {
      let attr = this.screen.rows[this.cursor.y].attr[x];
      if (attr.marked)
        break;
      f(attr);
    }
    this.screen.rows[this.cursor.y].attr[this.cursor.x].marked = true;
    this.moveRight();
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

  write(c, serial) {
    // if it is a stand-alone combining diacritical mark, add a space
    if (c.charCodeAt(0) >= 0x300 && c.charCodeAt(0) <= 0x36f) {
      // c = "\u25cc" + c; // small dotted circle
      c = "\u00a0" + c;
    }
    var x = this.cursor.x;
    var y = this.cursor.y;
    if (!serial)
      Object.assign(this.screen.rows[y].attr[x], this.attr);
    this.screen.rows[y].attr[x].char = c;
    x += 1;
    if (this.attr.size == Cept.SIZE_DOUBLE_WIDTH
        || this.attr.size == Cept.SIZE_DOUBLE_SIZE)
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

  nextByte(b) {
    this.inputstate.nextByte(b);
  }
}
