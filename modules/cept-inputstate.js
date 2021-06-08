import Cept from './cept.js';
import CeptCodeSets from './cept-codesets.js';


export default class CeptInputState {
  static STATE_FIRST = 0;

  constructor (cept) {
    this.cept = cept;
    this.state = CeptInputState.STATE_FIRST;
  }

  nextByte(b) {
    switch(this.state) {
      case CeptInputState.STATE_FIRST:
        return this.stateFirst(b);
    }
  }

  stateFirst(b) {
    if (b < 0x20) {

    } else if (b >= 0x80 && (b < 0xa0)) {

    } else {
      this.cept.writeCharacter(b);
    }
  }
}
