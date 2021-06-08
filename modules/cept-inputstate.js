import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';


export default class CeptInputState {
  static STATE_FIRST = 0;
  static STATE_RPT = 1;
  static STATE_ESC1 = 100;
  static STATE_ESC22 = 101;
  static STATE_APA1 = 200;
  static STATE_APA2 = 201;
  static STATE_APA3 = 202;
  static STATE_APA4 = 203;

  static SUPPCTRL_NONE = 0;
  static SUPPCTRL_SER = 1;
  static SUPPCTRL_PAR = 2;

  constructor (cept) {
    this.cept = cept;
    this.state = CeptInputState.STATE_FIRST;
    this.lastChar = 0;
    this.apax = 0;
    this.apay = 0;
    this.suppCtrl = CeptInputState.SUPPCTRL_NONE;
  }

  nextByte(b) {
    switch(this.state) {
      case CeptInputState.STATE_FIRST:
        return this.stateFirst(b);
        break;
      case CeptInputState.STATE_RPT:
        for (var i = b & 0x3f; i--; )
          this.cept.writeCharacter(this.lastCharacter);
        this.state = CeptInputState.STATE_FIRST;
        break;
      case CeptInputState.STATE_ESC1:
        if (b >= 0x40 && b <= 0x5f) {
          this.state = CeptInputState.STATE_FIRST;
          this.CSI(b + 0x40);
        } else if (b == 0x22) {
          this.state = CeptInputState.STATE_ESC22;
        }
      case CeptInputState.STATE_ESC22:
        switch (b) {
          case 0x40:  // Serial Supplementary Control Function Set
            break;
          case 0x41:  // Parallel Supplementary Control Function Set
            break;
          default:
            this.state = CeptInputState.STATE_FIRST;
        }
        break;
      case CeptInputState.STATE_APA1:
        this.apax = 0;
        if (this.cept.screen.rows > 63 || this.cept.screen.cols > 63) {
          this.apay = (b & 0x3f) << 6;
          this.state = CeptInputState.STATE_APA2;
        } else {
          this.apay = b & 0x3f;
          this.state = CeptInputState.STATE_APA4;
        }
        break;
      case CeptInputState.STATE_APA2:
        this.apay += b & 0x3f;
        this.state = CeptInputState.STATE_APA3;
        break;
      case CeptInputState.STATE_APA3:
        this.apax = (b & 0x3f) << 6;
        this.state = CeptInputState.STATE_APA4;
        break;
      case CeptInputState.STATE_APA4:
        this.apax += b & 0x3f;
        this.state = CeptInputState.STATE_FIRST;
        this.cept.move(this.apax, this.apay);
        break;
      default:
        this.state = CeptInputState.STATE_FIRST;
    }
  }

  stateFirst(b) {
    if (b < 0x20 || (b >= 0x80 && (b < 0xa0))) {
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
          break;
        case 0x1b: // ESC
          this.state = CeptInputState.STATE_ESC;
          break;
        case 0x1d: // SS3
          break;
        case 0x1e: // APH
        this.cept.move(0, 0);
          break;
        case 0x1f: // APA
        this.state = CeptInputState.STATE_APA1;
          break;
      }
    } else {
      this.cept.writeCharacter(b);
      this.lastCharacter = b;
    }
  }
}
