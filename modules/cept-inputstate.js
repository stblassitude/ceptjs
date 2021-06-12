import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';


export default class CeptInputState {
  static STATE_INITIAL = 0;
  static STATE_RPT = 1;
  static STATE_ESC = 2;
  static STATE_APA = 3;
  static STATE_COMBINING = 4;
  static STATE_CSI = 5;
  static STATE_GENERAL_DISPLAY_RESET = 6;

  static STATE_ESC_INITIAL = 0;
  static STATE_ESC_SUPP_CTRL = 1;
  static STATE_ESC_DESIGNATION_GC = 2;
  static STATE_ESC_DESIGNATION_GC_EXT = 3;
  static STATE_ESC_FSFR_B0 = 4;
  static STATE_ESC_FSFR_SCREEN = 5;
  static STATE_ESC_FSFR_ROW = 6;

  static STATE_APA_B0 = 0;
  static STATE_APA_B1 = 1;
  static STATE_APA_B2 = 2;
  static STATE_APA_B3 = 3;

  static SUPPCTRL_NONE = 0;
  static SUPPCTRL_SER = 1;
  static SUPPCTRL_PAR = 2;

  static SINGLE_SHIFT_NONE = 0;
  static SINGLE_SHIFT_G2 = 2;
  static SINGLE_SHIFT_G3 = 3;

  static C1_NONE = 0;
  static C1_SERIAL = 1;
  static C1_PARALLEL = 2;

  static CS_PRIMARY = 0;
  static CS_SUPPLEMENTARY = 1;
  static CS_GREEK = 2;
  static CS_MOSAIC_1 = 3;
  static CS_MOSAIC_2 = 4;
  static CS_MOSAIC_3 = 5;

  static CODESETS = [
    CeptCodeSets.PRIMARY,
    CeptCodeSets.SUPPLEMENTARY,
    CeptCodeSets.GREEK,
    CeptCodeSets.SUPP_MOSAIC_1,
    CeptCodeSets.SUPP_MOSAIC_2,
    CeptCodeSets.SUPP_MOSAIC_3,
  ];

  constructor(cept) {
    this.cept = cept;
    this.reset();
  }

  reset() {
    this.state = CeptInputState.STATE_INITIAL;
    this.apaState = CeptInputState.STATE_APA_B0;
    this.escState = CeptInputState.STATE_ESC_INITIAL;
    this.lastChar = 0;
    this.apax = 0;
    this.apay = 0;
    this.suppCtrl = CeptInputState.SUPPCTRL_NONE;
    this.singleShift = CeptInputState.SINGLE_SHIFT_NONE;
    // default code sets, see section 3.1.4
    this.inUseCodeTable = [ 0, 2 ];
    this.lastCodeTable = -1;  // which G set to switch back to when returning from the L set
    this.gSet = [ // designation of code sets into G sets
      CeptInputState.CS_PRIMARY,
      CeptInputState.CS_MOSAIC_2,
      CeptInputState.CS_SUPPLEMENTARY,
      CeptInputState.CS_MOSAIC_3,
      CeptInputState.CS_MOSAIC_1, // we cheat by using this position for the L set by setting inUseCodeTable[0] = 4
    ];
    this.clutIndex = 0; // index offset for CLUT in use, ie. 8 for the second CLUT
    this.combining = ""; // saved unicode combining char
    this.c1 = CeptInputState.C1_SERIAL;
    this.holdMosaic = false; // in serial C1, print last mosaic instead of space
    this.lastMosaic = " "; // if holdMosaic, print this when processing C1
  }

  /**
   * Decode character byte c from the sets currently in effect, taking
   * combining characters into account. When encountering a combining character
   * as the beginning of a combining pair, save it and return -1.
   * FIXME: we need to check if the combining pair is valid, and emit two
   * single spacing characters instead if not.
   */
  getUnicodeChar(c) {
    let lr = c >> 7;
    let g = this.gSet[this.inUseCodeTable[lr]];
    c = c & 0x7f;
    if (c < 0x20)
      return -1;
    c -= 0x20; // codeset arrays start at 0x20
    if (g == CeptInputState.CS_SUPPLEMENTARY && c >= 0x20 && c <= 0x2f) {
      // combining diacritical
      if (this.combining != "") {
        // last byte was combining already, emit standalone spacing character and save current combining
        let u = "\u00a0" + this.combining;
        this.combining = CeptInputState.CODESETS[g][c];
        return u;
      }
      this.combining = CeptInputState.CODESETS[g][c];
      return -1;
    }
    if (this.combining != "") {
      let u = CeptInputState.CODESETS[g][c] + this.combining;
      this.combining = "";
      return u;
    }
    return CeptInputState.CODESETS[g][c];
  }

  writeCharacter(c) {
    let u = this.getUnicodeChar(c);
    if (u != -1) {
      this.lastChar = u;
      this.cept.write(this.lastChar);
      switch (this.gSet[this.inUseCodeTable[c >> 7]]) {
        case CeptInputState.CS_MOSAIC_1:
        case CeptInputState.CS_MOSAIC_2:
        case CeptInputState.CS_MOSAIC_3:
          this.lastMosaic = u;
      }
    }
  }

  nextByte(b) {
    switch(this.state) {
      case CeptInputState.STATE_INITIAL:
        return this.handleInitial(b);
        break;
      case CeptInputState.STATE_RPT:
        for (var i = b & 0x3f; i--; )
          this.cept.write(this.lastChar);
        this.state = CeptInputState.STATE_INITIAL;
        break;
      case CeptInputState.STATE_ESC:
        return this.handleEsc(b);
        break;
      case CeptInputState.STATE_APA:
        return this.handleApa(b);
        break;
      case CeptInputState.STATE_COMBINING:
        // b + this.combining
        this.state = CeptInputState.STATE_INITIAL;
        break;
      case CeptInputState.STATE_CSI:
        return this.handleCsi(b);
        break;
      case CeptInputState.STATE_GENERAL_DISPLAY_RESET:
        this.cept.reset();
        this.reset();
        if (b == 0x41) {
          this.c1 = CeptInputState.C1_SERIAL;
        } else if (b == 0x42) {
          this.c1 = CeptInputState.C1_PARALLEL;
        }
      default:
        this.state = CeptInputState.STATE_INITIAL;
    }
  }

  handleInitial(b) {
    if (b < 0x20) {
      switch(b) {
        case 0x08: // APB
          this.cept.moveLeft();
          // FIXME: when changing lines, deactivateL
          break;
        case 0x09: // APF
          this.cept.moveRight();
          // FIXME: when changing lines, deactivateL
          break;
        case 0x0a: // APD
          this.cept.moveDown();
          this.deactivateL();
          break;
        case 0x0b: // APU
          this.cept.moveUp();
          this.deactivateL();
          break;
        case 0x0c: // CS
          this.cept.clearScreen();
          break;
        case 0x0d: // APR
          this.cept.moveReturn();
          this.deactivateL();
          break;
        case 0x0e: // SO
          this.cept.inUseCodeTable[0] = 2;
          this.deactivateL();
          break;
        case 0x0f: // SI
          this.cept.inUseCodeTable[0] = 0;
          this.deactivateL();
          break;
        case 0x11: // CON
          break;
        case 0x12: // RPT
          this.state = CeptInputState.STATE_RPT;
          break;
        case 0x14: // COF
          break;
        case 0x18: // CAN
          for (let x = this.cept.cursor.x; x < this.cept.cols; x++) {
            this.cept.screen.rows[this.cept.cursor.y].attr[x].char = " ";
          }
          break;
        case 0x19: // SS2
          this.cept.inUseCodeTable[0] = CeptInputState.SINGLE_SHIFT_G2;
          this.deactivateL();
          break;
        case 0x1b: // ESC
          this.state = CeptInputState.STATE_ESC;
          this.escState = CeptInputState.STATE_ESC_INITIAL;
          break;
        case 0x1d: // SS3
          this.cept.inUseCodeTable[0] = CeptInputState.SINGLE_SHIFT_G3;
          this.deactivateL();
          break;
        case 0x1e: // APH
          this.cept.move(0, 0);
          this.deactivateL();
          break;
        case 0x1f: // APA or US
          this.state = CeptInputState.STATE_APA;
          this.apaState = CeptInputState.STATE_APA_B0;
          break;
      }
    } else if (b >= 0x80 && (b < 0xa0)) {
      this.handleC1(b);
    } else {
      if (this.singleShift != CeptInputState.SINGLE_SHIFT_NONE) {
        let lastSet = this.cept.inUseCodeTable[0];
        this.inUseCodeTable[0] = this.singleShift;
        this.writeCharacter(b);
        this.inUseCodeTable[0] = lastSet;
      } else {
        this.writeCharacter(b);
      }
    }
  }

  handleEsc(b) {
    switch (this.escState) {
      case CeptInputState.STATE_ESC_INITIAL:
        if (b >= 0x40 && b <= 0x5f) {
          this.state = CeptInputState.STATE_INITIAL;
          this.handleC1(b + 0x40);
        } else if (b == 0x22) {
          this.escState = CeptInputState.STATE_ESC_SUPP_CTRL;
        } else if (b == 0x23) {
          this.escState = CeptInputState.STATE_ESC_FSFR_B0;
        } else if (b >= 0x28 && b <= 0x2b) {
          this.escState = CeptInputState.STATE_ESC_DESIGNATION_GC;
          this.gsDesignation = b - 0x28;
        } else {
          this.state = CeptInputState.STATE_INITIAL;
        }
        break;
      case CeptInputState.STATE_ESC_SUPP_CTRL:
        switch (b) {
          case 0x40:  // Serial Supplementary Control Function Set, 3.3.1
            this.c1 = CeptInputState.C1_SERIAL;
            break;
          case 0x41:  // Parallel Supplementary Control Function Set, 3.3.2
            this.c1 = CeptInputState.C1_PARALLEL;
            this.deactivateL();
            break;
        }
        this.state = CeptInputState.STATE_INITIAL;
        break;
      case CeptInputState.STATE_ESC_FSFR_B0:
        switch (b) {
          case 0x20: // Full Screen Attributes, 2.5.2
            this.escState = CeptInputState.STATE_ESC_FSFR_SCREEN;
            break;
          case 0x21: // Full Row Attributes, 2.5.2
            this.escState = CeptInputState.STATE_ESC_FSFR_ROW;
            break;
        }
        break;
      case CeptInputState.STATE_ESC_FSFR_SCREEN:
        if (b >= 0x50 && b <= 0x57) {
          this.cept.screenColor = b - 0x40 + this.clutIndex;
        }
        this.state = CeptInputState.STATE_INITIAL;
        break;
      case CeptInputState.STATE_ESC_FSFR_ROW:
        if (b >= 0x50 && b <= 0x57) {
          this.cept.screen.rows[this.cept.cursor.y].bg = b - 0x40 + this.clutIndex;
        }
        for (let x = 0; x < this.cept.cols; x++) {
          let attr = this.cept.screen.rows[this.cept.cursor.y].attr[x];
          attr.marked = false;
          this.applyParallelSuppCtrl(b, attr);
        }
        this.state = CeptInputState.STATE_INITIAL;
        break;
      case CeptInputState.STATE_ESC_DESIGNATION_GC:
        switch (b) {
          case 0x21:
            this.escState = CeptInputState.STATE_ESC_DESIGNATION_GC_EXT;
            break;
          case 0x40:
            this.gSet[this.gsDesignation] = CeptInputState.CS_PRIMARY;
            this.state = CeptInputState.STATE_INITIAL;
            break;
          case 0x63:
            this.gSet[this.gsDesignation] = CeptInputState.CS_MOSAIC_2;
            this.state = CeptInputState.STATE_INITIAL;
            break;
          case 0x62:
            this.gSet[this.gsDesignation] = CeptInputState.CS_SUPPLEMENTARY;
            this.state = CeptInputState.STATE_INITIAL;
            break;
          case 0x64:
            this.gSet[this.gsDesignation] = CeptInputState.CS_MOSAIC_3;
            this.state = CeptInputState.STATE_INITIAL;
            break;
          default:
            this.state = CeptInputState.STATE_INITIAL;
        }
        break;
      case CeptInputState.STATE_ESC_DESIGNATION_GC_EXT:
        switch (b) {
          case 0x40:
            this.gSet[this.gsDesignation] = CeptInputState.GREEK;
            this.state = CeptInputState.STATE_INITIAL;
            break;
          default:
            this.state = CeptInputState.STATE_INITIAL;
        }
        break;
      default:
        this.state = CeptInputState.STATE_INITIAL;
        this.apaState = CeptInputState.STATE_APA_B0;
    }
  }

  handlseCsi(b) {
    switch (b) {
      default:
        this.state = STATE_INITIAL;
    }
  }

  handleC1(b) {
    if (b >= 0x80 && b <= 0x9f) {
      // supplementary control function, 3.3
      b -= 0x40; // C1 is defined as 4/0 to 5/15
      if (this.c1 == CeptInputState.C1_SERIAL) {
        if (b == 0x5e) {
          this.holdMosaic = true;
        } else if (b == 0x5f) {
          this.holdMosaic = false;
        } else {
          // apply from current position to the next marker or end of the line
          this.applySerialSuppCtrl(b, this.cept.attr);
          let attr = this.cept.screen.rows[this.cept.cursor.y].attr[this.cept.cursor.x];
          this.applySerialSuppCtrl(b, attr);
          attr.marked = true;
          attr.char = this.holdMosaic ? this.lastMosaic : " ";
          if (++this.cept.cursor.x < this.cept.cols) {
            for (var x = this.cept.cursor.x; x < this.cept.cols; x++) {
              let attr = this.cept.screen.rows[this.cept.cursor.y].attr[x];
              if (attr.marked)
                break;
              this.applySerialSuppCtrl(b, attr);
            }
          }
        }
        this.cept._limitCursor();
      } else if (this.c1 == CeptInputState.C1_PARALLEL) {
        this.applyParallelSuppCtrl(b, this.cept.attr);
      }
    } else switch (b) {
      case 0x42: // STC Serial Control Stop Conceal, 3.5.1
        this.cept.serialControl(attr => {
          attr.concealed = false;
        })
        break;
      default:
        break;
    }
  }

  /**
   * Handle Active Position Address. See 3.2.1. The new position will be
   * expressed as two bytes if the screen is smaller than 63 rows and columns,
   * or four bytes if either dimension is larger. The numbers are 1-based
   * (upper-left hand corner is [1,1]).
   */
  handleApa(b) {
    switch(this.apaState) {
      case CeptInputState.STATE_APA_B0:
        if (b == 0x2f) { // US 2/15
          this.state = CeptInputState.STATE_GENERAL_DISPLAY_RESET;
          break;
        }
        this.apax = 0;
        if (this.cept.screen.rows > 63 || this.cept.screen.cols > 63) {
          this.apay = (b & 0x3f) << 6;
          this.apaState = CeptInputState.STATE_APA_B1;
        } else {
          this.apay = b & 0x3f;
          this.apaState = CeptInputState.STATE_APA_B3;
        }
        break;
      case CeptInputState.STATE_APA_B1:
        this.apay += b & 0x3f;
        this.apaState = CeptInputState.STATE_APA_B2;
        break;
      case CeptInputState.STATE_APA_B2:
        this.apax = (b & 0x3f) << 6;
        this.apaState = CeptInputState.STATE_APA_B3;
        break;
      case CeptInputState.STATE_APA_B3:
        this.apax += b & 0x3f;
        this.state = CeptInputState.STATE_INITIAL;
        this.apaState = CeptInputState.STATE_APA_B0;
        this.cept.move(this.apax-1, this.apay-1);
        // FIXME: only if actually moving to a different line?
        this.deactivateL();
        break;
      default:
        this.state = CeptInputState.STATE_INITIAL;
        this.apaState = CeptInputState.STATE_APA_B0;
    }
  }

  /**
   * Apply one parallel supplementary control set attribute. See 2.3, 3.3.2 and 3.5.2
   */
  applyParallelSuppCtrl(b, attr) {
    // parallel: foreground and background
    if (b >= 0x40 && b <= 0x47) {
      // 2.3.1c
      attr.fg = b - 0x40 + this.clutIndex;
    } else if (b >= 0x50 && b <= 0x57) {
      // 2.3.2c
      attr.bg = b - 0x50 + this.clutIndex;
    } else {
      switch (b) {
        case 0x48: // FSH: flash, 2.3.5
          attr.flashf = Cept.FLASH_MODE_FLASH;
          break;
        case 0x49: // STD: steady, 2.3.5
          attr.flashf = Cept.FLASH_MODE_STEADY;
          break;
        case 0x4a: // EBX: start window/box, 2.3.8
          break;
        case 0x4b: // SBX: end window/box, 2.3.8
          break;
        case 0x4c: // NSZ: normal size, 2.3.4
          attr.size = Cept.SIZE_NORMAL;
          break;
        case 0x4d: // DBH: double height, 2.3.4
        attr.size = Cept.SIZE_DOUBLE_HEIGHT_ABOVE;
          break;
        case 0x4e: // DBW: double width, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_WIDTH;
          break;
        case 0x4f: // DBS: double size, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_SIZE;
          break;
        case 0x58: // CDY: start conceal, 2.3.6
          attr.conceal = true;
          break;
        case 0x59: // SPL: stop lining, 2.3.3
          attr.underline = false;
          break;
        case 0x5a: // STL: start lining, 2.3.3
          attr.underline = true;
          break;
        case 0x5b: // CSI
          this.state = STATE_CSI;
          break;
        case 0x5c: // NPO: normal polarity, 2.3.7
          attr.inv = false;
          break;
        case 0x5d: // IPO: inverted polarity, 2.3.7
          attr.inv = true;
          break;
        case 0x5e: // TRB: transparent background, 2.3.2
          attr.bg = 8;
          break;
        case 0x5f: // STC: stop conceal, 2.3.6
          attr.conceal = false;
          break;
      }
    }
  }

  activateL() {
    // locking shift to L
    if (this.inUseCodeTable[0] != 4) {
      this.lastCodeTable = this.inUseCodeTable[0];
      this.inUseCodeTable[0] = 4;
    }
  }

  deactivateL() {
    if (this.lastCodeTable >= 0) {
      // switch back to previously selected G0
      this.inUseCodeTable[0] = this.lastCodeTable = -1;;
      this.lastCodeTable = -1;
    }
  }

  /**
   * Apply one serial supplementary control set attribute. See 2.3 and 3.5.2
   */
  applySerialSuppCtrl(b, attr) {
    // serial: foreground, and alpha or mosaic shift
    if (b >= 0x40 && b <= 0x47) {
      attr.fg = b - 0x40 + this.clutIndex;
      this.deactivateL();
    } else if (b >= 0x50 && b <= 0x57) {
      attr.fg = b - 0x50 + this.clutIndex;
      this.activateL();
    } else {
      switch (b) {
        case 0x48: // FSH: flash, 2.3.5
          attr.flashf = Cept.FLASH_MODE_FLASH;
          break;
        case 0x49: // STD: steady, 2.3.5
          attr.flashf = Cept.FLASH_MODE_STEADY;
          break;
        case 0x4a: // EBX: start window/box, 2.3.8
          break;
        case 0x4b: // SBX: end window/box, 2.3.8
          break;
        case 0x4c: // NSZ: normal size, 2.3.4
          attr.size = Cept.SIZE_NORMAL;
          break;
        case 0x4d: // DBH: double height, 2.3.4
        attr.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
          break;
        case 0x4e: // DBW: double width, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_WIDTH;
          break;
        case 0x4f: // DBS: double size, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_SIZE;
          break;
        case 0x58: // CDY: start conceal, 2.3.6
          attr.conceal = true;
          break;
        case 0x59: // SPL: stop lining, 2.3.3
          attr.underline = false;
          break;
        case 0x5a: // STL: start lining, 2.3.3
          attr.underline = true;
          break;
        case 0x5b: // CSI
          this.state = STATE_CSI;
          break;
        case 0x5c: // BBD: black backgrund, 2.3.2
          attr.bg = 0;
          break;
        case 0x5d: // NBD: new background, 2.3.2
          attr.bg = attr.fg;
          break;
        case 0x5e: // HMS: hold mosaic, 2.2
          break;
        case 0x5f: // RMS: release mosaic, 2.2
          break;
      }
    }
  }
}
