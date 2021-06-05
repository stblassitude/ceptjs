(function() {

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
        && this.bg == b.bg
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
        && this.underline == b.underline;
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
      window.setInterval(this._flashInterval.bind(this), 1000/6);
      this.forcedUpdate = true;

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
      this.elements.screen.className = "cept-screen"
      this.elements.container.appendChild(this.elements.screen);

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
      s.className = "cept-span"
      s.style.backgroundColor = this._rgba_from_clut(attr.bg);
      s.style.color = this._rgba_from_clut(attr.fg);
      if (attr.underline)
        s.style.textDecoration = "underline";
      if (attr.size == Cept.SIZE_DOUBLE_WIDTH) {
        s.style.transform = "scale(2,1)"
        s.style.transformOrigin = "left bottom"
      } else if (attr.size == Cept.SIZE_DOUBLE_HEIGHT_ABOVE) {
        s.style.transform = "scale(1,2)"
        s.style.transformOrigin = "left bottom"
      } else if (attr.size == Cept.SIZE_DOUBLE_HEIGHT_BELOW) {
        s.style.transform = "scale(1,2)"
        s.style.transformOrigin = "left top"
      } else if (attr.size == Cept.SIZE_DOUBLE_SIZE_ABOVE) {
        s.style.transform = "scale(2,2)"
        s.style.transformOrigin = "left bottom"
      } else if (attr.size == Cept.SIZE_DOUBLE_SIZE_BELOW) {
        s.style.transform = "scale(2,2)"
        s.style.transformOrigin = "left top"
      }
      text = text.replaceAll(" ", "\u00a0");
      var t = document.createTextNode(text);
      s.appendChild(t);
      return s;
      spans.push(s);
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
          nextAttr.fg = nextAttr.bg;
        }
        nextAttr.fg = this._effectiveColor(nextAttr.fg, row);
        Object.assign(row.attr[x], nextAttr);
        // if not the same as before, emit span and start a new one
        if (!lastAttr.equals(nextAttr)) {
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
      this.elements.row[y].style.backgroundColor = this._rgba_from_clut(this.screen.rows[y].bg)

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
      this.elements.above.style.backgroundColor = this._rgba_from_clut(this.screen.bg);
      this.elements.below.style.backgroundColor = this._rgba_from_clut(this.screen.bg);
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
      this.fill(x0, y0, w, h, "\u00A0");
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
    }

    resetAttr() {
      Object.assign(this.attr, new CeptAttr);
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
        Object.assign(this.screen.rows[y].attr[x], this.attr);
        this.screen.rows[y].attr[x].char = t[i];
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
      this.resetAttr();
      this.move(0, y);
      this.write("Fast/RI/Inverted");
      this.move(10, y);
      this.flashMode = Cept.FLASH_MODE_FAST;
      this.flashInverted = true;
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

      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Concealed");
      this.move(20, y);
      this.write("Normal");
      this.move(30, y);
      this.concealed = true;
      this.write("Concealed");

      y += 1;
      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Width");
      this.move(20, y);
      this.write("Normal");
      this.move(30, y);
      this.color = Cept.COLOR_RED;
      this.write("hhiiddee");
      this.move(30, y);
      this.color = Cept.COLOR_WHITE;
      this.size = Cept.SIZE_DOUBLE_WIDTH;
      this.write("Doub");

      y += 1;
      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Height");
      this.move(20, y);
      this.size = Cept.SIZE_DOUBLE_HEIGHT_ABOVE;
      this.write("D/A");
      this.move(20, y-1);
      this.size = Cept.SIZE_NORMAL;
      this.color = Cept.COLOR_RED;
      this.write("hid");
      this.move(30, y);
      this.color = Cept.COLOR_WHITE;
      this.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
      this.write("D/B");
      this.move(30, y+1);
      this.size = Cept.SIZE_NORMAL;
      this.color = Cept.COLOR_RED;
      this.write("hid");

      y += 1;
      y += 1;
      this.resetAttr();
      this.move(0, y);
      this.write("Size");
      this.move(20, y);
      this.color = Cept.COLOR_WHITE;
      this.size = Cept.SIZE_DOUBLE_SIZE_ABOVE;
      this.write("D/A");
      this.move(20, y-1);
      this.size = Cept.SIZE_NORMAL;
      this.color = Cept.COLOR_RED;
      this.write("hide");
      this.move(30, y);
      this.color = Cept.COLOR_WHITE;
      this.size = Cept.SIZE_DOUBLE_SIZE_BELOW;
      this.write("D/B");
      this.move(30, y+1);
      this.size = Cept.SIZE_NORMAL;
      this.color = Cept.COLOR_RED;
      this.write("hide");

      this.move(0, 24);
      this.cursorVisible = true;

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
