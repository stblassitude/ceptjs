import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';


class CeptDecoderState {
  constructor(o) {
    if (o !== undefined) {
      this.c1 = o.c1;
      this.charset = [
        o.charset[0],
        o.charset[1]
      ];
      this.clutIndex = o.clutIndex;
      this.gset = [
        o.gset[0],
        o.gset[1],
        o.gset[2],
        o.gset[3],
        o.gset[4]
      ];
      this.lastCharset = o.lastCharset;
      this.mosaicHold = o.mosaicHold;
      this.mosaicChar = o.mosaicChar;
    } else {
      this.c1 = CeptInputState.C1_SERIAL;
      this.charset = [0, 2];
      this.clutIndex = 0; // index offset for CLUT in use, ie. 8 for the second CLUT
      this.gset = [ // designation of code sets into G sets
        CeptInputState.CS_PRIMARY,
        CeptInputState.CS_MOSAIC_2,
        CeptInputState.CS_SUPPLEMENTARY,
        CeptInputState.CS_MOSAIC_3,
        CeptInputState.CS_MOSAIC_1, // we cheat by using this position for the L set by setting inUseCodeTable[0] = 4
      ];
      this.lastCharset = -1; // which G set to switch back to when returning from the L set
      this.mosaicHold = false; // in serial C1, print last mosaic instead of space
      this.mosaicChar = " "; // if holdMosaic, print this when processing C1
    }
  }
}

export default class CeptInputState {
  static STATE_INITIAL = 0;
  static STATE_RPT = 1;
  static STATE_ESC = 2;
  static STATE_APA = 3;
  static STATE_CSI = 4;
  static STATE_VPDE_TFI = 5;
  static STATE_VPDE_DEFINE_DRCS = 6;
  static STATE_VPDE_DEFINE_COLOR = 7;
  static STATE_VPDE_DEFINE_FORMAT = 8;
  static STATE_VPDE_TIMING = 9;
  static STATE_VPDE_RESET = 10;
  static STATE_VPDE_UNKNOWN = 11;

  static STATE_ESC_INITIAL = 0;
  static STATE_ESC_SUPP_CTRL = 1;
  static STATE_ESC_DESIGNATION_GC = 2;
  static STATE_ESC_DESIGNATION_GC_EXT = 3;
  static STATE_ESC_FSFR_B0 = 4;
  static STATE_ESC_FSFR_SCREEN = 5;
  static STATE_ESC_FSFR_ROW = 6;

  static STATE_VPDE = 0;
  static STATE_APA_B1 = 1;
  static STATE_APA_B2 = 2;
  static STATE_APA_B3 = 3;

  static STATE_VPDE_DEFINE_DRCS_INITIAL = 0;
  static STATE_VPDE_DEFINE_DRCS_HEADER = 1;
  static STATE_VPDE_DEFINE_DRCS_PATTERN = 2;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_F = 3;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC1_PARAMS = 4;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC2_PARAMS = 5;
  static STATE_VPDE_DEFINE_DRCS_HEADER_IDC_SDC2_Q = 6;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM = 7;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM_ST = 8;
  static STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SSA = 9;

  static STATE_VPDE_DEFINE_FORMAT_INITIAL = 0;
  static STATE_VPDE_DEFINE_FORMAT_PARAMS = 1;
  static STATE_VPDE_DEFINE_FORMAT_WRAP = 1;

  static STATE_VPDE_RESET_INITIAL = 0;
  static STATE_VPDE_RESET_PARAM = 1;

  static SINGLE_SHIFT_NONE = 0;
  static SINGLE_SHIFT_G2 = 2;
  static SINGLE_SHIFT_G3 = 3;

  static C1_SERIAL = 0;
  static C1_PARALLEL = 1;

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
    this.bytes = [];
    this.state = CeptInputState.STATE_INITIAL;
    this.vdpeState = CeptInputState.STATE_VPDE;
    this.escState = CeptInputState.STATE_ESC_INITIAL;
    this.vpdeFormatState = CeptInputState.STATE_VPDE_DEFINE_FORMAT_INITIAL;
    this.vpdeResetState = CeptInputState.STATE_VPDE_RESET_INITIAL;

    this.combining = ""; // saved unicode combining char
    this.lastChar = ""; // last unicode character printed for RPT
    this.singleShift = CeptInputState.SINGLE_SHIFT_NONE;

    this.savedState = undefined;

    this.drcsDefinition = {
      repertory: 0,
      delete: false,
      char: 0x40,
      pixelWidth: 12,
      pixelHeight: 10,
      cellWidth: 1,
      cellHeight: 1,
      bpp: 1,
      codingType: 0,
      codingSubType: 0,
      setAttr: 0,
    }

    this._paramsInit();
    this.debugBytes = [];
    this.debugSymbols = [];

    this.reset();
  }

  _hex(b) {
    return ("0" + b.toString(16)).slice(-2);
  }

  /**
   * Start the parameter list with a single value of 0.
   */
  _paramsInit() {
    this.params = [0];
  }

  /**
   * Add digit to current parameter, or start a new parameter. To add the
   * current byte, the existing value is multiplied by 10.
   */
  _paramsAccumulate(b) {
    if (b >= 0x30 && b <= 0x39) {
      this.params[this.params.length - 1] = this.params[this.params.length - 1] * 10 + b - 0x30;
    } else if (b == 0x3b) {
      this.params.push(0);
    } else {
      return false;
    }
    return true;
  }

  _param(i, def) {
    if (this.params[i] !== undefined)
      return this.params[i];
    return def;
  }

  reset() {
    this.decoderState = new CeptDecoderState();
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
    let g = this.decoderState.gset[this.decoderState.charset[lr]];
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
      this.cept.write(this.lastChar, this.decoderState.c1 == CeptInputState.C1_SERIAL);
      this.debugSymbols.push(this.lastChar);
      switch (this.decoderState.gset[this.decoderState.charset[c >> 7]]) {
        case CeptInputState.CS_MOSAIC_1:
        case CeptInputState.CS_MOSAIC_2:
        case CeptInputState.CS_MOSAIC_3:
          this.decoderState.mosaicChar = u;
      }
    }
  }

  saveState() {
    return {
      decoder: new CeptDecoderState(this.decoderState),
      screen: this.cept.saveState(),
    }
  }

  restoreState(s) {
    this.cept.restoreState(s.screen);
    this.decoderState = new CeptDecoderState(s.decoder);
  }

  _logNextLine() {
    if (this.debugBytes.length <= 1)
      return;
    let b = this.debugBytes.pop();
    this._logFinishLine();
    this.debugBytes.push(b);
  }

  _logFinishLine() {
    let m = "<span class='hex'>";
    for (let b of this.debugBytes) {
      m += " " + this._hex(b);
    }
    m += "</span>";
    for (let b of this.debugSymbols) {
      m += "<span class='sym'>" + b + "</span>";
    }
    this.cept._log(m);
    this.debugBytes = [];
    this.debugSymbols = [];
  }

  nextStateInitial() {
    this.state = CeptInputState.STATE_INITIAL;
    this._logFinishLine();
  }

  /**
   * Processes the next received bytes. If bytes are pushed back to the FIFO
   * during processing, try and process them as well.
   */
  input(...byteArray) {
    this.bytes = this.bytes.concat(byteArray);

    while (this.bytes.length > 0) {
      let b = this.bytes.shift();
      this.debugBytes.push(b);
      this.handleByte(b);
    }
  }

  /**
   * Put a byte back into the buffer. This can be necessary when the end of a
   * sequence can only be detected by checking for an invalid byte.
   */
  unshiftByte(b) {
    this.bytes.unshift(b);
    this.debugBytes.pop();
  }

  /**
   * Process one byte.
   */
  handleByte(b) {
    switch (this.state) {
      case CeptInputState.STATE_INITIAL:
        return this.handleInitial(b);
        break;
      case CeptInputState.STATE_RPT:
        for (var i = b & 0x3f; i--;)
          this.cept.write(this.lastChar);
        this.debugSymbols.push("RPT " + (b & 0x3f));
        this.nextStateInitial();
        break;
      case CeptInputState.STATE_ESC:
        return this.handleEsc(b);
        break;
      case CeptInputState.STATE_APA:
        return this.handleVdpe(b);
        break;
      case CeptInputState.STATE_CSI:
        return this.handleCsi(b);
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS:
        this.handleVpdeDefineDrcs(b);
        break;
      case CeptInputState.STATE_VPDE_DEFINE_FORMAT:
        this.handleVpdeDefineFormat(b);
        break;
      case CeptInputState.STATE_VPDE_RESET:
        this.handleVpdeReset(b);
        break;
      case CeptInputState.STATE_VPDE_UNKNOWN:
        this.handleVdpeUnknown(b);
        break;
      default:
        this.nextStateInitial();
    }
  }

  handleInitial(b) {
    if (b < 0x20) {
      switch (b) {
        case 0x08: // APB
          this.cept.moveLeft();
          this.debugSymbols.push("APB");
          // FIXME: when changing lines, deactivateL
          this.nextStateInitial();
          break;
        case 0x09: // APF
          this.cept.moveRight();
          // FIXME: when changing lines, deactivateL
          this.debugSymbols.push("APR");
          this.nextStateInitial();
          break;
        case 0x0a: // APD
          this.cept.moveDown();
          this.debugSymbols.push("APD");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x0b: // APU
          this.cept.moveUp();
          this.debugSymbols.push("APU");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x0c: // CS
          this.cept.clearScreen();
          this.debugSymbols.push("CS");
          this.cept.move(0, 0);
          this.nextStateInitial();
          break;
        case 0x0d: // APR
          this.cept.moveReturn();
          this.debugSymbols.push("APR");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x0e: // SO
          this.decoderState.charset[0] = 1;
          this.debugSymbols.push("SO");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x0f: // SI
          this.decoderState.charset[0] = 0;
          this.debugSymbols.push("SI");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x11: // CON: cursor on
          this.cept.cursor.visible = true;
          this.debugSymbols.push("CON");
          this.nextStateInitial();
          break;
        case 0x12: // RPT
          this.state = CeptInputState.STATE_RPT;
          break;
        case 0x14: // COF: cursor off
          this.cept.cursor.visible = false;
          this.debugSymbols.push("COF");
          this.nextStateInitial();
          break;
        case 0x18: // CAN
          this.cept.fill(this.cept.cursor.x, this.cept.cursor.y, this.cept.cols - this.cept.cursor.x, 1, " ");
          this.debugSymbols.push("CAN");
          this.nextStateInitial();
          break;
        case 0x19: // SS2
          this.singleShift = CeptInputState.SINGLE_SHIFT_G2;
          this.debugSymbols.push("SS2");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x1b: // ESC
          this.state = CeptInputState.STATE_ESC;
          this.escState = CeptInputState.STATE_ESC_INITIAL;
          break;
        case 0x1d: // SS3
          this.singleShift = CeptInputState.SINGLE_SHIFT_G3;
          this.debugSymbols.push("SS3");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x1e: // APH
          this.cept.move(0, 0);
          this.debugSymbols.push("APH");
          this.deactivateL();
          this.nextStateInitial();
          break;
        case 0x1f: // APA or US
          this.state = CeptInputState.STATE_APA;
          this.vdpeState = CeptInputState.STATE_VPDE;
          this._logNextLine();
          break;
      }
    } else if (b >= 0x80 && (b < 0xa0)) {
      this.handleC1(b);
    } else {
      if (this.singleShift != CeptInputState.SINGLE_SHIFT_NONE) {
        let lastSet = this.decoderState.charset[0];
        this.decoderState.charset[0] = this.singleShift;
        this.writeCharacter(b);
        this.decoderState.charset[0] = lastSet;
        this.singleShift = CeptInputState.SINGLE_SHIFT_NONE
        this.debugSymbols.push("single shift end");
        this.nextStateInitial();
      } else {
        this.writeCharacter(b);
      }
    }
  }

  handleEsc(b) {
    switch (this.escState) {
      case CeptInputState.STATE_ESC_INITIAL:
        if (b >= 0x40 && b <= 0x5f) {
          this.nextStateInitial();
          this.handleC1(b + 0x40);
        } else if (b == 0x22) {
          this.escState = CeptInputState.STATE_ESC_SUPP_CTRL;
        } else if (b == 0x23) {
          this.escState = CeptInputState.STATE_ESC_FSFR_B0;
        } else if (b >= 0x28 && b <= 0x2b) {
          this.escState = CeptInputState.STATE_ESC_DESIGNATION_GC;
          this.gsDesignation = b - 0x28;
        } else {
          switch (b) {
            case 0x6e:
              this.decoderState.charset[0] = 2;
              this.debugSymbols.push("LS2");
              break;
            case 0x6f:
              this.decoderState.charset[0] = 3;
              this.debugSymbols.push("LS3");
              break;
            case 0x7c:
              this.decoderState.charset[1] = 3;
              this.debugSymbols.push("LS3R");
              break;
            case 0x7c:
              this.decoderState.charset[1] = 2;
              this.debugSymbols.push("LS2R");
              break;
            case 0x7c:
              this.decoderState.charset[1] = 1;
              this.debugSymbols.push("LS1R");
              break;
            default:
              this.debugSymbols.push("unknown ESC code " + b);
          }
          this.nextStateInitial();
        }
        break;
      case CeptInputState.STATE_ESC_SUPP_CTRL:
        switch (b) {
          case 0x40: // Serial Supplementary Control Function Set, 3.3.1
            this.decoderState.c1 = CeptInputState.C1_SERIAL;
            this.debugSymbols.push("C1s");
            break;
          case 0x41: // Parallel Supplementary Control Function Set, 3.3.2
            this.decoderState.c1 = CeptInputState.C1_PARALLEL;
            this.debugSymbols.push("C1p");
            this.deactivateL();
            break;
        }
        this.nextStateInitial();
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
          this.cept.screenColor = b - 0x50 + this.decoderState.clutIndex;
          this.debugSymbols.push("Full screen color " + this.cept.screenColor);
        }
        this.nextStateInitial();
        break;
      case CeptInputState.STATE_ESC_FSFR_ROW:
        if (b >= 0x50 && b <= 0x57) {
          this.cept.screen.rows[this.cept.cursor.y].bg = b - 0x50 + this.decoderState.clutIndex;
          this.debugSymbols.push("Row background color " + this.cept.screen.rows[this.cept.cursor.y].bg);
        }
        let sym;
        for (let x = 0; x < this.cept.cols; x++) {
          let attr = this.cept.screen.rows[this.cept.cursor.y].attr[x];
          attr.marked = false;
          sym = this.applyParallelSuppCtrl(b, attr);
        }
        this.debugSymbols.push("Row attr: " + sym);
        this.nextStateInitial();
        break;
      case CeptInputState.STATE_ESC_DESIGNATION_GC:
        switch (b) {
          case 0x21:
            this.escState = CeptInputState.STATE_ESC_DESIGNATION_GC_EXT;
            break;
          case 0x40:
            this.decoderState.gset[this.gsDesignation] = CeptInputState.CS_PRIMARY;
            this.debugSymbols.push("G" + this.gsDesignation + " <- primary");
            this.nextStateInitial();
            break;
          case 0x63:
            this.decoderState.gset[this.gsDesignation] = CeptInputState.CS_MOSAIC_2;
            this.debugSymbols.push("G" + this.gsDesignation + " <- mosaic 2");
            this.nextStateInitial();
            break;
          case 0x62:
            this.decoderState.gset[this.gsDesignation] = CeptInputState.CS_SUPPLEMENTARY;
            this.debugSymbols.push("G" + this.gsDesignation + " <- supplementary");
            this.nextStateInitial();
            break;
          case 0x64:
            this.decoderState.gset[this.gsDesignation] = CeptInputState.CS_MOSAIC_3;
            this.debugSymbols.push("G" + this.gsDesignation + " <- mosaic 3");
            this.nextStateInitial();
            break;
          default:
            this.nextStateInitial();
        }
        break;
      case CeptInputState.STATE_ESC_DESIGNATION_GC_EXT:
        switch (b) {
          case 0x40:
            this.decoderState.gset[this.gsDesignation] = CeptInputState.GREEK;
            this.debugSymbols.push("G" + this.gsDesignation + " <- greek");
            this.nextStateInitial();
            break;
          default:
            this.nextStateInitial();
        }
        break;
      default:
        this.nextStateInitial();
    }
  }

  handleCsi(b) {
    if (!this._paramsAccumulate(b)) {
      switch (b) {
        case 0x40: // select color table
          this.decoderState.clutIndex = this.params[0] * 8;
          this.debugSymbols.push("CT" + (this.params[0] + 1));
          break;
        case 0x41:
          switch (this.params[0]) {
            case 0: // IVF: inverted flash
              this.cept.flashInverted = true;
              this.debugSymbols.push("IVF");
              break;
            case 1: // RIF: reduced intensity flash
              this.cept.flashReducedIntensity = true;
              this.debugSymbols.push("RIF");
              break;
            case 2: // FF1: fast flash 1
              this.cept.flashMode = Cept.FLASH_MODE_FAST;
              this.cept.flashPhase = 0;
              this.debugSymbols.push("FF1");
              break;
            case 3: // FF2: fast flash 2
              this.cept.flashMode = Cept.FLASH_MODE_FAST;
              this.cept.flashPhase = 1;
              this.debugSymbols.push("FF2");
              break;
            case 4: // FF3: fast flash 3
              this.cept.flashMode = Cept.FLASH_MODE_FAST;
              this.cept.flashPhase = 2;
              this.debugSymbols.push("FF3");
              break;
            case 5: // ICF: increment flash
              this.cept.flashPhase += 1;
              this.debugSymbols.push("ICF");
              break;
            case 3: // DCF: increment flash
              this.cept.flashPhase -= 1;
              this.debugSymbols.push("DCF");
              break;
          }
          break;
        case 0x42: // STC Serial Control Stop Conceal, 3.5.1
          this.cept.serialControl(attr => {
            attr.concealed = false;
          });
          this.debugSymbols.push("STC");
          break;
        case 0x50:
          this.debugSymbols.push("PMS");
          break;
        case 0x51:
          this.debugSymbols.push("PMT");
          break;
        case 0x52:
          this.debugSymbols.push("PMi");
          break;
        case 0x53:
          this.debugSymbols.push("MMS");
          break;
        case 0x54:
          this.debugSymbols.push("MMT");
          break;
        case 0x55:
          this.debugSymbols.push("Create Scrolling Area");
          break;
        case 0x56:
          this.debugSymbols.push("Delete Scrolling Area");
          break;
        case 0x60:
          switch (this.params[0]) {
            case 0:
              this.debugSymbols.push("Scroll Up");
              break;
            case 1:
              this.debugSymbols.push("Scroll down");
              break;
            case 2:
              this.debugSymbols.push("Activate Implicit Scrolling");
              break;
            case 3:
              this.debugSymbols.push("Deactivate Implicit Scrolling");
              break;
            default:
              this.debugSymbols.push("unknown 0x60 + " + this.params[0]);
          }
          default:
            this.debugSymbols.push("unknown " + b);
            break;
      }
      this.nextStateInitial();
    }
  }

  handleC1(b) {
    if (b >= 0x80 && b <= 0x9f) {
      // supplementary control function, 3.3
      b -= 0x40; // C1 is defined as 4/0 to 5/15
      if (this.decoderState.c1 == CeptInputState.C1_SERIAL) {
        if (b == 0x5b) {
          this.state = CeptInputState.STATE_CSI;
          this._paramsInit();
        } else if (b == 0x5e) {
          this.decoderState.mosaicHold = true;
          this.debugSymbols.push("HMS");
          this.nextStateInitial();
        } else if (b == 0x5f) {
          this.decoderState.mosaicHold = false;
          this.debugSymbols.push("RMS");
          this.nextStateInitial();
        } else {
          // apply from current position to the next marker or end of the line
          let sym = this.applySerialSuppCtrl(b, this.cept.attr);
          let attr = this.cept.screen.rows[this.cept.cursor.y].attr[this.cept.cursor.x];
          this.applySerialSuppCtrl(b, attr);
          attr.marked = true;
          attr.char = this.decoderState.mosaicHold ? this.decoderState.mosaicChar : " ";
          if (++this.cept.cursor.x < this.cept.cols) {
            for (var x = this.cept.cursor.x; x < this.cept.cols; x++) {
              let attr = this.cept.screen.rows[this.cept.cursor.y].attr[x];
              if (attr.marked)
                break;
              this.applySerialSuppCtrl(b, attr);
            }
          }
          this.debugSymbols.push(sym);
          this.nextStateInitial();
        }
        this.cept._limitCursor();
      } else if (this.decoderState.c1 == CeptInputState.C1_PARALLEL) {
        if (b == 0x5b) {
          this.state = CeptInputState.STATE_CSI;
          this._paramsInit();
        } else {
          let sym = this.applyParallelSuppCtrl(b, this.cept.attr);
          this.debugSymbols.push(sym);
          this.nextStateInitial();
        }
      }
    } else switch (b) {
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
  handleVdpe(b) {
    switch (this.vdpeState) {
      case CeptInputState.STATE_VPDE:
        if (b >= 0x40 && b < 0x80) {
          this.params = [0, 0];
          if (this.cept.screen.rows > 63 || this.cept.screen.cols > 63) {
            this.params[0] = (b & 0x3f) << 6;
            this.vdpeState = CeptInputState.STATE_APA_B1;
          } else {
            this.params[0] = b & 0x3f;
            this.vdpeState = CeptInputState.STATE_APA_B3;
          }
        } else {
          switch (b) {
            // case 0x20:
            // case 0x21:
            //   break;
            case 0x23: // DRCS
              this.state = CeptInputState.STATE_VPDE_DEFINE_DRCS;
              this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_INITIAL;
              break;
            case 0x2d: // US 2/13: Define Format
              this.state = CeptInputState.STATE_VPDE_DEFINE_FORMAT;
              this.vpdeFormatState = CeptInputState.STATE_VPDE_DEFINE_FORMAT_INITIAL;
              break;
            case 0x2f: // US 2/15: Reset
              this.state = CeptInputState.STATE_VPDE_RESET;
              this.vpdeResetState = CeptInputState.STATE_VPDE_RESET_INITIAL;
              break;
            default:
              this.debugSymbols.push("Unknown VPDE " + this._hex(b));
              this.state = CeptInputState.STATE_VPDE_UNKNOWN;
          }
        }
        break;
      case CeptInputState.STATE_APA_B1:
        this.params[0] += b & 0x3f;
        this.vdpeState = CeptInputState.STATE_APA_B2;
        break;
      case CeptInputState.STATE_APA_B2:
        this.params[1] = (b & 0x3f) << 6;
        this.vdpeState = CeptInputState.STATE_APA_B3;
        break;
      case CeptInputState.STATE_APA_B3:
        this.params[1] += b & 0x3f;
        this.cept.move(this.params[1] - 1, this.params[0] - 1);
        this.debugSymbols.push("APA(" + (this.params[1]) + "," + (this.params[0]) + ")");
        // FIXME: only if actually moving to a different line?
        this.deactivateL();
        this.nextStateInitial();
        break;
      default:
        this.nextStateInitial();
    }
  }

  handleVdpeUnknown(b) {
    if (b == 0x1f) {
      this.unshiftByte(b);
      this.debugSymbols.push("skipped to next VPDE");
      this.nextStateInitial();
    }
  }

  handleVpdeDefineDrcs(b) {
    switch (this.vdpeDrcsState) {
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_INITIAL:
        switch (b) {
          case 0x20:
            this.drcsDefinition = {
              repertory: 0,
              delete: false,
              char: 0x40,
              pixelWidth: 12,
              pixelHeight: 10,
              cellWidth: 1,
              cellHeight: 1,
              bpp: 1,
              codingType: 0,
              codingSubType: 0,
              setAttr: 0,
            }
            this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER;
            break;
            // case 0x21:
            //   this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_PATTERN;
            //   break;
          default:
            this.state = CeptInputState.STATE_VPDE_UNKNOWN;
            this.debugSymbols.push("Unknown DRCS unit " + this._hex(b));
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER:
        if (b >= 0x20 && b <= 0x29) {
          // ICS F or 2/0 Fx
          this.drcsDefinition.repertory = b & 0x01;
          this.drcsDefinition.delete = b & 0x08 != 0;
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_F;
        } else if (b >= 0x30 && b <= 0x3b) {
          // collect parameter for character cell
          this._paramsInit();
          this._paramsAccumulate(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC1_PARAMS;
        } else if (this.drcsSdc(b)) {
          // state updated as side effect
        } else if (b >= 0x50 && b <= 0x5f) {
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM;
        } else {
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SSA;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_F:
        if (b == 0x20) {
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_FX;
        } else {
          // FIXME: can F be a sequence as in ISO 2375?
          this.drcsDefinition.char = b;
          this._paramsInit();
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC1_PARAMS;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_FX:
        this.drcsDefinition.char = b;
        this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC;
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC:
        if (b >= 0x30 && b <= 0x39 || b == 0x3b) {
          this._paramsInit();
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC1_PARAMS;
        } else if (this.drcsSdc(b)) {
          // state updated as side effect
        } else {
          
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC1_PARAMS:
        if (!this._paramsAccumulate(b)) {
          this.drcsDefinition.pixelWidth = this._param(0, 0) || 12; // std has no default, and parser will always have a first param
          this.drcsDefinition.pixelHeight = this._param(1, 0) || 10;
          this.drcsDefinition.cellWidth = this._param(2, 0) || 1;
          this.drcsDefinition.cellHeight = this._param(3, 0) || 1;
          this.drcsDefinition.bpp = this._param(4, 10);
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC2_PARAMS:
        if (!this._paramsAccumulate(b)) {
          this.drcsDefinition.cellWidth = this._param(0, 0) || 1;
          this.drcsDefinition.cellHeight = this._param(1, 0) || 1;
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_IDC_SDC2_Q;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_IDC_SDC2_Q:
        if (b >= 0x40 && b <= 0x4f) {
          this.drcsDefinition.bpp = b & 0x0f;
        } else {
          this.drcsDefinition.bpp = 1;
          this.unshiftByte(b);
        }
        this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM;
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM:
        if (b >= 0x50 && b <= 0x5f) {
          this.drcsDefinition.codingType = b & 0x0f;
          this.drcsDefinition.codingSubType = 0;
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM_ST;
        } else {
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SSA;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SCM_ST:
        if (b >= 0x50 && b <= 0x5f) {
          this.drcsDefinition.codingSubType = b & 0x0f;
        } else {
          this.unshiftByte(b);
          this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SSA;
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SSA:
        if (b > 0x60 && b <= 0x6f) {
          // actual effect undefined
          this.drcsDefinition.setAttr = b & 0x0f;
        } else {
          this.unshiftByte(b);
        }
        this.debugSymbols.push("DRCS header: char " + this.drcsDefinition.char +
          ", (" + this.drcsDefinition.pixelWidth + "×" + this.drcsDefinition.pixelHeight +
          ")px, (" + this.drcsDefinition.cellWidth + "×" + this.drcsDefinition.cellHeight +
          ")c, " + this.drcsDefinition.bpp + "bpp"
        );
        this.nextStateInitial();
        break;
    }
  }

  drcsSdc(b) {
    if (b >= 0x40 && b <= 0x4f) {
      switch (b & 0x0f) {
        case 0:
          this.drcsDefinition.pixelWidth = 16;
          this.drcsDefinition.pixelHeight = 24;
          break;
        case 1:
          this.drcsDefinition.pixelWidth = 16;
          this.drcsDefinition.pixelHeight = 20;
          break;
        case 2:
          this.drcsDefinition.pixelWidth = 16;
          this.drcsDefinition.pixelHeight = 12;
          break;
        case 3:
          this.drcsDefinition.pixelWidth = 16;
          this.drcsDefinition.pixelHeight = 10;
          break;
        case 4:
          this.drcsDefinition.pixelWidth = 12;
          this.drcsDefinition.pixelHeight = 24;
          break;
        case 5:
          this.drcsDefinition.pixelWidth = 12;
          this.drcsDefinition.pixelHeight = 20;
          break;
        case 6:
          this.drcsDefinition.pixelWidth = 12;
          this.drcsDefinition.pixelHeight = 12;
          break;
        case 7:
          this.drcsDefinition.pixelWidth = 12;
          this.drcsDefinition.pixelHeight = 10;
          break;
        case 8:
          this.drcsDefinition.pixelWidth = 8;
          this.drcsDefinition.pixelHeight = 12;
          break;
        case 9:
          this.drcsDefinition.pixelWidth = 8;
          this.drcsDefinition.pixelHeight = 10;
          break;
        case 10:
          this.drcsDefinition.pixelWidth = 6;
          this.drcsDefinition.pixelHeight = 12;
          break;
        case 11:
          this.drcsDefinition.pixelWidth = 6;
          this.drcsDefinition.pixelHeight = 10;
          break;
        case 12:
          this.drcsDefinition.pixelWidth = 6;
          this.drcsDefinition.pixelHeight = 5;
          break;
        case 13:
          this.drcsDefinition.pixelWidth = 4;
          this.drcsDefinition.pixelHeight = 10;
          break;
        case 14:
          this.drcsDefinition.pixelWidth = 4;
          this.drcsDefinition.pixelHeight = 5;
          break;
        case 15:
          this.drcsDefinition.pixelWidth = 6;
          this.drcsDefinition.pixelHeight = 6;
          break;
      }
      this._paramsInit();
      this.vdpeDrcsState = CeptInputState.STATE_VPDE_DEFINE_DRCS_HEADER_ICS_SDC2_PARAMS;
      return true;
    }
    return false;
  }

  /**
   * Handle VPDE Define Format. The following sequences are possible:
   * - 1f 2d: default format 40x24, wraparound on
   * - 1f 2d 70-71: default format, wraparound on/off
   * - 1f 2d 41-46: special format, wraparound on
   * - 1f 2d 41-46 70-71: special format, wraparound on/off
   * - 1f 2d 4f z 3b z 3b: custom format, wraparound on
   * - 1f 2d 4f z 3b z 3b 70-71: custom format, wraparound on/off
   * The end of the sequence can be detected by checking for US, which starts the next sequence.
   */
  handleVpdeDefineFormat(b) {
    switch (this.vpdeFormatState) {
      case CeptInputState.STATE_VPDE_DEFINE_FORMAT_INITIAL:
        if (this.handleVpdeDefineFormatSpec()) {
          this.vpdeFormatState = CeptInputState.STATE_VPDE_DEFINE_FORMAT_WRAP;
        } else if (this.handleVpdeDefineFormatWrap(b)) {
          this.cept.format(24, 40);
          this.debugSymbols.push("Define Format(40x24)");
          this.nextStateInitial();
        } else {
          this.cept.format(24, 40);
          this.debugSymbols.push("Define Format(40x24)");
          this.unshiftByte(b);
          this.nextStateInitial();
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_FORMAT_PARAMS:
        if (b >= 0x30 && b <= 0x39 || b == 0x3b) {
          this._paramsAccumulate(b);
          if (this.params.length == 3) {
            this.cept.format(this.params[1], this.params[0]);
            this.vpdeFormatState = CeptInputState.STATE_VPDE_DEFINE_FORMAT_WRAP;
          }
        } else if (this.handleVpdeDefineFormatWrap(b)) {
          this.nextStateInitial();
        } else {
          this.unshiftByte(b);
          this.nextStateInitial();
        }
        break;
      case CeptInputState.STATE_VPDE_DEFINE_FORMAT_WRAP:
        if (this.handleVpdeDefineFormatWrap(b)) {
          this.nextStateInitial();
        } else {
          this.unshiftByte(b);
          this.nextStateInitial();
        }
        break;
    }
  }

  handleVpdeDefineFormatSpec(b) {
    switch (b) {
      case 0x41:
        this.cept.format(24, 40);
        this.debugSymbols.push("Define Format(40x24)");
        break;
      case 0x42:
        this.cept.format(20, 40);
        this.debugSymbols.push("Define Format(40x20)");
        break;
      case 0x43:
        this.cept.format(24, 80);
        this.debugSymbols.push("Define Format(80x24)");
        break;
      case 0x44:
        this.cept.format(20, 80);
        this.debugSymbols.push("Define Format(80x20)");
        break;
      case 0x45:
        this.cept.format(20, 48);
        this.debugSymbols.push("Define Format(48x24)");
        break;
      case 0x46:
        this.cept.format(25, 40);
        this.debugSymbols.push("Define Format(40x25)");
        break;
      case 0x47:
        this.vpdeFormatState = CeptInputState.STATE_VPDE_DEFINE_FORMAT_PARAMS;
        this._paramsInit();
        break;
      default:
        return false;
    }
    this.wraparound = true;
    return true;
  }

  handleVpdeDefineFormatWrap(b) {
    if (b >= 0x70 && b <= 0x71) {
      this.wraparound = b == 0x70;
      return true;
    }
    return false;
  }

  handleVpdeReset(b) {
    switch (this.vpdeResetState) {
      case CeptInputState.STATE_VPDE_RESET_INITIAL:
        if (b == 0x40 || b == 0x45) {
          this.vpdeResetOp = b;
          this.vpdeResetState = CeptInputState.STATE_VPDE_RESET_PARAM;
        } else {
          switch (b) {
            case 0x41:
              this.debugSymbols.push("RESET general, serial C1");
              this.vpdeResetGeneralReset();
              this.decoderState.c1 = CeptInputState.C1_SERIAL;
              break;
            case 0x42:
              this.debugSymbols.push("RESET general, parallel C1");
              this.vpdeResetGeneralReset();
              this.decoderState.c1 = CeptInputState.C1_PARALLEL;
              break;
            case 0x43:
              this.debugSymbols.push("RESET control/graphics, C1s");
              this.vpdeResetControlGraphicsSet();
              this.decoderState.c1 = CeptInputState.C1_SERIAL;
              break;
            case 0x44:
              this.debugSymbols.push("RESET control/graphics, C1p");
              this.vpdeResetControlGraphicsSet();
              this.decoderState.c1 = CeptInputState.C1_PARALLEL;
              break;
            case 0x4f:
              this.debugSymbols.push("RESET service break reset");
              if (this.savedState !== undefined) {
                this.restoreState(this.savedState);
                this.savedState = undefined;
              }
              // FIXME: disable protected area
              break;
            default:
              this.debugSymbols.push("VPDE RESET unknown op " + b);
              break;
          }
          this.nextStateInitial();
        }
        break;
      case CeptInputState.STATE_VPDE_RESET_PARAM:
        let y = (b & 0x3f);
        let c1 = CeptInputState.C1_PARALLEL;
        switch (this.vpdeResetOp) {
          case 0x40:
            this.debugSymbols.push("RESET service break, ser. C1 at " + (b & 0x3f));
            c1 = CeptInputState.C1_SERIAL;
            break;
            // FALLTHROUGH
          case 0x45:
            this.debugSymbols.push("VPDE RESET service break, par. C1 at " + (b & 0x3f));
            c1 = CeptInputState.C1_PARALLEL;
            break;
          default:
            this.debugSymbols.push("VPDE RESET unknown code " + this._hex(b));
            this.nextStateInitial();
            return;
        }
        this.vpdeResetServiceBreakSave();
        this.decoderState.c1 = c1;
        this.nextStateInitial();
        this.cept.move(0, y);
        // this.cept.fill(0, y, this.cept.cols, 1, " "); // not called for in the standard and probably wrong
        break;
    }
  }

  vpdeResetGeneralReset() {
    this.cept.format(24, 80);
    this.vpdeResetControlGraphicsSet();
  }

  vpdeResetControlGraphicsSet() {
    this.decoderState.gset = [ // designation of code sets into G sets
      CeptInputState.CS_PRIMARY,
      CeptInputState.CS_MOSAIC_2,
      CeptInputState.CS_SUPPLEMENTARY,
      CeptInputState.CS_MOSAIC_3,
      CeptInputState.CS_MOSAIC_1, // we cheat by using this position for the L set by setting codeset[0] = 4
    ];
    this.decoderState.charset[0] = 0;
    this.decoderState.charset[1] = 2;
    this.deactivateL();
  }

  vpdeResetServiceBreakSave() {
    this.savedState = this.saveState();
    this.decoderState = new CeptDecoderState(this.decoderState);
    this.decoderState.gset[0] = CeptInputState.CS_PRIMARY;
    this.decoderState.gset[2] = CeptInputState.CS_SUPPLEMENTARY;
    this.decoderState.charset[0] = 0;
    this.decoderState.charset[1] = 2;
    this.decoderState.wraparound = false;
  }

  /**
   * Apply one parallel supplementary control set attribute. See 2.3, 3.3.2 and 3.5.2
   */
  applyParallelSuppCtrl(b, attr) {
    let sym = "unknown";
    // parallel: foreground and background
    if (b >= 0x40 && b <= 0x47) {
      // 2.3.1c
      attr.fg = b - 0x40 + this.decoderState.clutIndex;
      sym = "fg " + (b - 0x40 + this.decoderState.clutIndex);
    } else if (b >= 0x50 && b <= 0x57) {
      // 2.3.2c
      attr.bg = b - 0x50 + this.decoderState.clutIndex;
      sym = "bg " + (b - 0x40 + this.decoderState.clutIndex);
    } else {
      switch (b) {
        case 0x48: // FSH: flash, 2.3.5
          attr.flashf = Cept.FLASH_MODE_FLASH;
          attr.flashi = false;
          attr.flashp = 0;
          attr.flashr = false;
          sym = "FSH";
          break;
        case 0x49: // STD: steady, 2.3.5
          attr.flashf = Cept.FLASH_MODE_STEADY;
          attr.flashi = false;
          attr.flashp = 0;
          attr.flashr = false;
          sym = "STD";
          break;
        case 0x4a: // EBX: start window/box, 2.3.8
          sym = "EBX";
          break;
        case 0x4b: // SBX: end window/box, 2.3.8
          sym = "SBX";
          break;
        case 0x4c: // NSZ: normal size, 2.3.4
          attr.size = Cept.SIZE_NORMAL;
          sym = "NSZ";
          break;
        case 0x4d: // DBH: double height, 2.3.4
          attr.size = Cept.SIZE_DOUBLE_HEIGHT_ABOVE;
          sym = "DBH";
          break;
        case 0x4e: // DBW: double width, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_WIDTH;
          sym = "DBW";
          break;
        case 0x4f: // DBS: double size, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_SIZE;
          sym = "DBS";
          break;
        case 0x58: // CDY: start conceal, 2.3.6
          attr.conceal = true;
          sym = "CDY";
          break;
        case 0x59: // SPL: stop lining, 2.3.3
          attr.underline = false;
          sym = "SPL";
          break;
        case 0x5a: // STL: start lining, 2.3.3
          attr.underline = true;
          sym = "STL";
          break;
        case 0x5b: // CSI
          break;
        case 0x5c: // NPO: normal polarity, 2.3.7
          attr.inv = false;
          sym = "NPO";
          break;
        case 0x5d: // IPO: inverted polarity, 2.3.7
          attr.inv = true;
          sym = "IPO";
          break;
        case 0x5e: // TRB: transparent background, 2.3.2
          attr.bg = 8;
          sym = "TRB";
          break;
        case 0x5f: // STC: stop conceal, 2.3.6
          attr.conceal = false;
          sym = "STC";
          break;
      }
    }
    return sym;
  }

  activateL() {
    // locking shift to L
    if (this.decoderState.charset[0] != 4) {
      this.decoderState.lastCharset = this.decoderState.charset[0];
      this.decoderState.charset[0] = 4;
    }
  }

  deactivateL() {
    if (this.decoderState.lastCharset >= 0) {
      // switch back to previously selected G0
      this.decoderState.charset[0] = this.decoderState.lastCharset;
      this.decoderState.lastCharset = -1;
    }
  }

  /**
   * Apply one serial supplementary control set attribute. See 2.3 and 3.5.2
   */
  applySerialSuppCtrl(b, attr) {
    let sym = "unknown";
    // serial: foreground, and alpha or mosaic shift
    if (b >= 0x40 && b <= 0x47) {
      attr.fg = b - 0x40 + this.decoderState.clutIndex;
      sym = "alpha fg " + (b - 0x40 + this.decoderState.clutIndex);
      this.deactivateL();
    } else if (b >= 0x50 && b <= 0x57) {
      attr.fg = b - 0x50 + this.decoderState.clutIndex;
      sym = "mosaic fg " + (b - 0x40 + this.decoderState.clutIndex);
      this.activateL();
    } else {
      switch (b) {
        case 0x48: // FSH: flash, 2.3.5
          attr.flashf = Cept.FLASH_MODE_FLASH;
          sym = "FSH";
          break;
        case 0x49: // STD: steady, 2.3.5
          attr.flashf = Cept.FLASH_MODE_STEADY;
          sym = "STD";
          break;
        case 0x4a: // EBX: start window/box, 2.3.8
          sym = "EBX";
          break;
        case 0x4b: // SBX: end window/box, 2.3.8
          sym = "SBX";
          break;
        case 0x4c: // NSZ: normal size, 2.3.4
          attr.size = Cept.SIZE_NORMAL;
          sym = "NSZ";
          break;
        case 0x4d: // DBH: double height, 2.3.4
          attr.size = Cept.SIZE_DOUBLE_HEIGHT_BELOW;
          sym = "DBH";
          break;
        case 0x4e: // DBW: double width, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_WIDTH;
          sym = "DBH";
          break;
        case 0x4f: // DBS: double size, 2.3.5
          attr.size = Cept.SIZE_DOUBLE_SIZE;
          sym = "DBS";
          break;
        case 0x58: // CDY: start conceal, 2.3.6
          attr.conceal = true;
          sym = "CDY";
          break;
        case 0x59: // SPL: stop lining, 2.3.3
          attr.underline = false;
          sym = "SPL";
          break;
        case 0x5a: // STL: start lining, 2.3.3
          attr.underline = true;
          sym = "STL";
          break;
        case 0x5b: // CSI
          break;
        case 0x5c: // BBD: black backgrund, 2.3.2
          attr.bg = 0;
          sym = "BBD";
          break;
        case 0x5d: // NBD: new background, 2.3.2
          attr.bg = attr.fg;
          sym = "NBD";
          break;
        case 0x5e: // HMS: hold mosaic, 2.2
          break;
        case 0x5f: // RMS: release mosaic, 2.2
          break;
      }
    }
    return sym;
  }
}
