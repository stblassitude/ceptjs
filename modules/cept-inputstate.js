import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';


export default class CeptInputState {
  static STATE_IDLE = 0;
  static STATE_RPT = 1;
  static STATE_ESC = 2;
  static STATE_APA = 3;

  static STATE_ESC_IDLE = 0;
  static STATE_ESC_SUPP_CTRL = 1;

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

  constructor (cept) {
    this.cept = cept;
    this.state = CeptInputState.STATE_IDLE;
    this.apaState = CeptInputState.STATE_APA_B0;
    this.escState = CeptInputState.STATE_ESC_IDLE;
    this.lastChar = 0;
    this.apax = 0;
    this.apay = 0;
    this.suppCtrl = CeptInputState.SUPPCTRL_NONE;
    this.singleShift = CeptInputState.SINGLE_SHIFT_NONE;
  }

  nextByte(b) {
    switch(this.state) {
      case CeptInputState.STATE_IDLE:
        return this.handleIdle(b);
        break;
      case CeptInputState.STATE_RPT:
        for (var i = b & 0x3f; i--; )
          this.cept.writeCharacter(this.lastCharacter);
        this.state = CeptInputState.STATE_IDLE;
        break;
      case CeptInputState.STATE_ESC:
        return this.handleEsc(b);
        break;
      case CeptInputState.STATE_APA:
        return this.handleApa(b);
        break;
      default:
        this.state = CeptInputState.STATE_IDLE;
    }
  }

  handleIdle(b) {
    if (b < 0x20) {
      switch(b) {
        case 0x08: // APB
          this.cept.moveLeft();
          break;
        case 0x09: // APF
          this.cept.moveRight();
          break;
        case 0x0a: // APD
          this.cept.moveDown();
          break;
        case 0x0b: // APU
          this.cept.moveUp();
          break;
        case 0x0c: // CS
          this.cept.clearScreen();
          break;
        case 0x0d: // APR
          this.cept.moveReturn();
          break;
        case 0x0e: // SO
          this.cept.inUseCodeTable[0] = 2;
          break;
        case 0x0f: // SI
          this.cept.inUseCodeTable[0] = 0;
          break;
        case 0x11: // CON
          break;
        case 0x12: // RPT
          this.state = CeptInputState.STATE_RPT;
          break;
        case 0x14: // COF
          break;
        case 0x18: // CAN
          break;
        case 0x19: // SS2
          this.cept.inUseCodeTable[0] = CeptInputState.SINGLE_SHIFT_G2;
          break;
        case 0x1b: // ESC
          this.state = CeptInputState.STATE_ESC;
          break;
        case 0x1d: // SS3
          this.cept.inUseCodeTable[0] = CeptInputState.SINGLE_SHIFT_G3;
          break;
        case 0x1e: // APH
        this.cept.move(0, 0);
          break;
        case 0x1f: // APA
          this.state = CeptInputState.STATE_APA;
          this.apaState = CeptInputState.STATE_APA_B0;
          break;
      }
    } else if (b >= 0x80 && (b < 0xa0)) {
      this.CSI(b);
    } else {
      if (this.singleShift != CeptInputState.SINGLE_SHIFT_NONE) {
        let lastSet = this.cept.inUseCodeTable[0];
        this.cept.inUseCodeTable[0] = this.singleShift;
        this.cept.writeCharacter(b);
        this.cept.inUseCodeTable[0] = lastSet;
      } else {
        this.cept.writeCharacter(b);
      }
      this.lastCharacter = b;
    }
  }

  handleEsc(b) {
    switch (this.escState) {
      case CeptInputState.STATE_ESC_IDLE:
        if (b >= 0x40 && b <= 0x5f) {
          this.state = CeptInputState.STATE_IDLE;
          this.CSI(b + 0x40);
        } else if (b == 0x22) {
          this.state = CeptInputState.STATE_ESC_SUPP_CTRL;
        }
      case CeptInputState.STATE_ESC_SUPP_CTRL:
        switch (b) {
          case 0x40:  // Serial Supplementary Control Function Set
            break;
          case 0x41:  // Parallel Supplementary Control Function Set
            break;
          default:
            this.state = CeptInputState.STATE_IDLE;
        }
        break;
      default:
        this.state = CeptInputState.STATE_IDLE;
        this.apaState = CeptInputState.STATE_APA_B0;
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
        this.state = CeptInputState.STATE_IDLE;
        this.apaState = CeptInputState.STATE_APA_B0;
        this.cept.move(this.apax-1, this.apay-1);
        break;
      default:
        this.state = CeptInputState.STATE_IDLE;
        this.apaState = CeptInputState.STATE_APA_B0;
    }
  }
}
