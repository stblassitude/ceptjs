(function() {

  class CeptAttr {
    constructor(attr) {
      this.bg = Cept.COLOR_TRANSPARENT;
      this.fg = Cept.COLOR_WHITE;
      this.flashf = 0;
      this.flashi = false;
      this.flashp = 0;
      this.flashr = false;
      this.inv = false;
      this.underline = false;
      if (attr !== undefined)
        Object.assign(this, attr);
    }

    equals(b) {
      return this.bg == b.bg
        && this.fg == b.fg
        && this.flashf == b.flashf
        && this.flashi == b.flashi
        && this.flashp == b.flashp
        && this.flashr == b.flashr
        && this.inv == b.inv
        && this.underline == b.underline;
    }
  }

  class CeptScreenRow {
    constructor(colsOrRow) {
      if (colsOrRow instanceof CeptScreenRow) {
        this.attr = [];
        this.bg = colsOrRow.bg;
        this.cols = colsOrRow.cols;
        this.text = colsOrRow.text;
        for (var x = 0; x < this.cols; x++) {
          this.attr[x] = new CeptAttr(colsOrRow.attr[x]);
        }
      } else {
        this.attr = [];
        this.bg = Cept.COLOR_TRANSPARENT;
        this.cols = colsOrRow;
        this.text = "\u00A0".repeat(this.cols);
        for (var x = 0; x < this.cols; x++) {
          this.attr[x] = new CeptAttr();
        }
      }
    }

    equals(b) {
      if (this.text != b.text
        || this.bg != b.bg
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

  class Cept {
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

    constructor(selector, options={}) {
      this.rows = 25;
      this.cols = 40;

      this.cursor = { x: 0, y: 0};
      this.attr = new CeptAttr();

      this.clut = []
      this.resetClut();

      this.flashp = 0;
      window.setInterval(this._flashInterval.bind(this), 1000/6);
      this.forcedUpdate = true;

      this.screen = {}
      this.screen.rows = []
      this.screen.lastrows = []
      this.screen.bg = Cept.COLOR_BLACK;
      this.screen.attr = [];
      this.screen.text = []
      for (var y = 0; y < this.rows; y++) {
        this.screen.text[y] = ".".repeat(this.cols);
        this.screen.attr[y] = [];
        this.screen.rows[y] = new CeptScreenRow(this.cols);
        this.screen.lastrows[y] = new CeptScreenRow(this.cols);
      }

      this.elements = {};
      this.elements.container = document.querySelector(selector);
      if (this.elements.container === null) {
        console.log("Unable to find element matching " + selector);
        return;
      }
      this.elements.screen = document.createElement("div");
      this.elements.container.appendChild(this.elements.screen);
      this.elements.screen.style.width = "fit-content";
      this.elements.screen.style.padding = "20px 0";
      this.elements.screen.style.fontFamily = "Courier, monospace";
      this.elements.screen.style.transform = "scale(1.8, 1)";
      this.elements.screen.style.transformOrigin = "left";
      this.setScreenColor();

      this.elements.row = [];
      for (var y = 0; y < this.rows; y++) {
        this.elements.row[y] = document.createElement("div");
        this.elements.row[y].style.padding = "0 20px";
        this.elements.screen.appendChild(this.elements.row[y]);
        this._updateRow(y);
      }

      this.clear(10, 10, 20, 5);
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
      s.style.backgroundColor = this._rgba_from_clut(attr.bg);
      s.style.color = this._rgba_from_clut(attr.fg);
      if (attr.underline)
        s.style.textDecoration = "underline";
      var t = document.createTextNode(text);
      s.appendChild(t);
      return s;
      spans.push(s);
    }

    /**
     * Create a list of spans for the different formatting on a row. Returns
     * the (potentially unchanged) row, and updates the spans array.
     */
    _createUpdatedRow(row, spans) {
      var updatedRow = new CeptScreenRow(row);
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
        nextAttr.fg = this._effectiveColor(nextAttr.fg, row);
        Object.assign(updatedRow.attr[x], nextAttr);
        // if not the same as before, emit span and start a new one
        if (!lastAttr.equals(nextAttr)) {
          if (text != "") {
            spans.push(this._spanForAttr(lastAttr, text));
          }
          Object.assign(lastAttr, nextAttr);
          text = "";
        }
        text += row.text.substr(x, 1);
      }
      spans.push(this._spanForAttr(lastAttr, text));
      return updatedRow;
    }

    /**
     * (Re-)Create the DOM for one row.
     */
    _updateRow(y) {
      this.elements.row[y].style.backgroundColor = this._rgba_from_clut(this.screen.rows[y].bg)

      var spans = [];
      var updatedRow = this._createUpdatedRow(this.screen.rows[y], spans)
      if (this.forcedUpdate || !this.screen.lastrows[y].equals(updatedRow)) {
        // only if the new row differs from the last one replace the elements
        this.elements.row[y].replaceChildren(...spans);
        this.screen.lastrows[y] = updatedRow;
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

    get color() {
      return this.attr.fg;
    }

    set color(c) {
      this.attr.fg = c;
    }

    get bgColor() {
      return this.attr.bg;
    }

    set bgColor(c) {
      this.attr.bg = c;
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

    get screenColor() {
      return this.screen.bg;
    }

    set screenColor(c) {
      this.setScreenColor(c)
    }

    get underlined() {
      return this.attr.underline;
    }

    set underlined(u) {
      this.attr.underline = u;
    }

    setScreenColor(c) {
      if (c !== undefined)
        this.screen.bg = c;
      this.elements.screen.style.backgroundColor = this._rgba_from_clut(this.screen.bg);
    }

    clear(x0, y0, w, h) {
      this.fill(x0, y0, w, h, "\u00A0");
    }

    clearScreen() {
      this.clear(0, 0, this.cols, this.rows);
      for (var y = 0; y < this.rows; y++) {
        this.screen.rows[y].bg = Cept.COLOR_TRANSPARENT;
      }
    }

    fill(x0, y0, w, h, c) {
      var x1 = x0 + w;
      var y1 = y0 + h;
      for (var y = y0; y < y1; y++) {
        this.screen.rows[y].text = this.screen.rows[y].text.substr(0, x0)
          + c.repeat(w)
          + this.screen.rows[y].text.substr(x1);
        for (var x = x0; x < x1; x++) {
          this.screen.rows[y].attr[x] = new CeptAttr();
        }
        this._updateRow(y);
      }
    }

    move(x, y) {
      this.cursor.x = x;
      this.cursor.y = y;
    }

    resetAttr() {
      this.flashMode = Cept.FLASH_MODE_STEADY;
      this.flashInverted = false;
      this.flashReducedIntensity = false;
      this.flashPhase = 0;
      this.inverted = false;
      this.underlined = false;
    }

    updateScreen(force) {
      if (force)
        this.forcedUpdate = true;
      for (var y = 0; y < this.rows; y++) {
        this._updateRow(y);
      }
      this.forcedUpdate = false;
    }

    write(t) {
      for (var i = 0; i < t.length; i++) {
        var x = this.cursor.x;
        var y = this.cursor.y;
        var r = this.screen.rows[this.cursor.y].text;
        this.screen.rows[y].text = r.substr(0, x) + t[i] + r.substr(x+1, this.cols-x);
        Object.assign(this.screen.rows[y].attr[x], this.attr);
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
    }

    testPattern1() {
      this.screenColor = Cept.COLOR_BLACK;
      this.clearScreen();
      for (var y = 0; y < this.rows; y++) {
        this.screen.rows[y].bg = y % 32;
        var t = ""
        for (var x = 0; x < this.cols; x++) {
          t += String.fromCharCode(64+x+y);
          this.screen.rows[y].attr[x].bg = (this.rows+x-y) % 32;
        }
        this.screen.rows[y].text = t;
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
      this.setScreenColor(Cept.COLOR_REDUCED_INTENSITY_BLUE);
      this.bgColor = Cept.COLOR_TRANSPARENT;
      this.clearScreen();
      this.resetAttr();
      this.move(0, 0);
      this.color = Cept.COLOR_WHITE;
      this.write("Attribute Test");

      y = 1;

      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Flash");
      this.move(20, y);
      this.flashMode = Cept.FLASH_MODE_FLASH;
      this.write("Normal");
      this.move(30, y);
      this.flashInverted = true;
      this.write("Inverted");

      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Reduced Intensity");
      this.move(20, y);
      this.flashReducedIntensity = true;
      this.flashMode = Cept.FLASH_MODE_FLASH;
      this.write("Normal");
      this.move(30, y);
      this.flashInverted = true;
      this.write("Inverted");

      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Fast");
      this.flashMode = Cept.FLASH_MODE_FAST;
      this.move(25, y);
      this.flashPhase = 0;
      this.write("One");
      this.move(30, y);
      this.flashPhase = 1;
      this.write("Two");
      this.move(35, y);
      this.flashPhase = 2;
      this.write("Three");

      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Fast/RI");
      this.move(10, y);
      this.flashMode = Cept.FLASH_MODE_FAST;
      this.flashReducedIntensity = true;
      this.move(25, y);
      this.flashPhase = 0;
      this.write("One");
      this.move(30, y);
      this.flashPhase = 1;
      this.write("Two");
      this.move(35, y);
      this.flashPhase = 2;
      this.write("Three");

      y += 1;
      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Decoration");
      this.move(20, y);
      this.underlined = true;
      this.write("Under");
      this.move(30, y);
      this.underlined = false;
      this.inverted = true;
      this.write("Inverted");

      this.updateScreen();
    }
  }

  var cept = {
    init: function(selector, options={}) {
      return new Cept(selector, options);
    }
  }
  window.cept = cept;
})();
