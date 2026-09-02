import fs from 'fs';
import zlib from 'zlib';

function unzip(buffer) {
  const entries = {};
  let offset = 0;
  while (offset < buffer.length - 4) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) { offset++; continue; }
    const compMethod = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const filename = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = buffer.subarray(dataStart, dataStart + compSize);
    let uncompressed = null;
    if (compMethod === 0) uncompressed = compData;
    else if (compMethod === 8) {
      try { uncompressed = zlib.inflateRawSync(compData); } catch (e) {}
    }
    if (uncompressed) entries[filename] = uncompressed;
    offset = dataStart + compSize;
  }
  return entries;
}

const UNICODE_MAP = {
  0x211D: '\\mathbb{R}',
  0x2124: '\\mathbb{Z}',
  0x2115: '\\mathbb{N}',
  0x211A: '\\mathbb{Q}',
  0x2102: '\\mathbb{C}',
  0x221E: '+\\infty',
  0x2212: '-',
  0x2208: '\\in ',
  0x2209: '\\notin ',
  0x2264: '\\le ',
  0x2265: '\\ge ',
  0x2260: '\\neq ',
  0x2248: '\\approx ',
  0x2261: '\\equiv ',
  0x2192: '\\to ',
  0x21D2: '\\Rightarrow ',
  0x21D4: '\\Leftrightarrow ',
  0x222B: '\\int ',
  0x2211: '\\sum ',
  0x2206: '\\Delta ',
  0x2032: "'",
  0x2033: "''",
  0x00B1: '\\pm ',
  0x222A: '\\cup ',
  0x2229: '\\cap ',
  0x2205: '\\emptyset '
};

const SYMBOL_MAP = {
  0x20: ' ',
  0x21: '!',
  0x22: '\\forall ',
  0x23: '#',
  0x24: '\\exists ',
  0x25: '%',
  0x26: '&',
  0x27: "'",
  0x28: '(',
  0x29: ')',
  0x2A: '*',
  0x2B: '+',
  0x2C: ',',
  0x2D: '-',
  0x2E: '.',
  0x2F: '/',
  0x3A: ':',
  0x3B: ';',
  0x3C: '<',
  0x3D: '=',
  0x3E: '>',
  0x3F: '?',
  0x40: '\\cong ',
  0x5B: '[',
  0x5C: '\\therefore ',
  0x5D: ']',
  0x5E: '\\perp ',
  0x5F: '_',
  0x60: '\\overline',
  0x61: '\\alpha',
  0x62: '\\beta',
  0x63: '\\chi',
  0x64: '\\delta',
  0x65: '\\epsilon',
  0x66: '\\phi',
  0x67: '\\gamma',
  0x68: '\\eta',
  0x69: '\\iota',
  0x6A: '\\varphi',
  0x6B: '\\kappa',
  0x6C: '\\lambda',
  0x6D: '\\mu',
  0x6E: '\\nu',
  0x70: '\\pi',
  0x71: '\\theta',
  0x72: '\\rho',
  0x73: '\\sigma',
  0x74: '\\tau',
  0x75: '\\upsilon',
  0x76: '\\varpi',
  0x77: '\\omega',
  0x78: '\\xi',
  0x79: '\\psi',
  0x7A: '\\zeta',
  0x7B: '\\{',
  0x7C: '|',
  0x7D: '\\}',
  0x7E: '\\sim',
  0xA0: ' ',
  0xA2: "'",
  0xA3: '\\le ',
  0xA4: '/',
  0xA5: '+\\infty',
  0xAB: '\\leftrightarrow',
  0xAC: '\\leftarrow',
  0xAD: '\\uparrow',
  0xAE: '\\rightarrow',
  0xAF: '\\downarrow',
  0xB0: '^\\circ',
  0xB1: '\\pm ',
  0xB2: "''",
  0xB3: '\\ge ',
  0xB4: '\\times ',
  0xB5: '\\propto ',
  0xB6: '\\partial ',
  0xB7: '\\bullet ',
  0xB8: '\\div ',
  0xB9: '\\neq ',
  0xBA: '\\equiv ',
  0xBB: '\\approx ',
  0xBC: '\\dots ',
  0xBE: '-',
  0xC0: '\\aleph',
  0xC6: '\\emptyset ',
  0xC7: '\\cap ',
  0xC8: '\\cup ',
  0xC9: '\\supset ',
  0xCA: '\\supseteq ',
  0xCC: '\\subset ',
  0xCD: '\\subseteq ',
  0xCE: '\\in ',
  0xCF: '\\notin ',
  0xD0: '\\angle ',
  0xD1: '\\nabla ',
  0xD5: '\\prod ',
  0xD6: '\\sqrt',
  0xD7: '\\cdot ',
  0xD8: '\\neg ',
  0xD9: '\\wedge ',
  0xDA: '\\vee ',
  0xDB: '\\Leftrightarrow ',
  0xDC: '\\Leftarrow ',
  0xDD: '\\Uparrow ',
  0xDE: '\\Rightarrow ',
  0xDF: '\\Downarrow ',
  0xE0: '\\diamond ',
  0xE1: '\\langle ',
  0xE2: '\\mathbb{R}',
  0xE3: '\\mathbb{C}',
  0xE4: '\\mathbb{N}',
  0xE5: '\\sum ',
  0xE6: '(',
  0xE7: '|',
  0xE8: '[',
  0xE9: '\\{',
  0xF1: '\\rangle ',
  0xF2: '\\int ',
  0xF6: ')',
  0xF8: ']',
  0xF9: '\\}'
};

export class PreciseMtefDecoder {
  constructor(buffer) {
    this.bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    this.pos = 0;
    this.mtefVersion = 5;
  }

  decode() {
    try {
      // 1. MathType 7 TeX header
      const rawStr = this.bytesToString();
      const texMatch = rawStr.match(/TeX Input Language\x00\{([^\x00]*)\}\x00/);
      if (texMatch) {
        return this.clean(texMatch[1]);
      }

      // 2. Find MTEF header
      let mtefStart = -1;
      for (let i = 0; i < this.bytes.length - 3; i++) {
        if ((this.bytes[i] === 0x05 || this.bytes[i] === 0x03) && this.bytes[i+1] === 0x01 && this.bytes[i+2] === 0x00) {
          mtefStart = i;
          this.mtefVersion = this.bytes[i];
          break;
        }
        if (this.bytes[i] === 0x1C && this.bytes[i+1] === 0x05 && this.bytes[i+2] === 0x01) {
          mtefStart = i + 1;
          this.mtefVersion = 5;
          break;
        }
      }

      if (mtefStart === -1) return '';

      // Find the first root LINE record: 0x0A 0x01 or 0x0A 0x00 or 0x01 0x00
      let lineStart = -1;
      for (let i = mtefStart + 5; i < Math.min(mtefStart + 450, this.bytes.length - 2); i++) {
        if (this.bytes[i] === 0x0A && (this.bytes[i+1] === 0x01 || this.bytes[i+1] === 0x00 || this.bytes[i+1] === 0x02)) {
          // Check if followed by CHAR (0x02) or TMPL (0x03) or LINE (0x01)
          const nextTag = this.bytes[i+2] === 0x00 ? this.bytes[i+3] : this.bytes[i+2];
          if (nextTag === 0x02 || nextTag === 0x03 || nextTag === 0x01 || nextTag === 0x0B || nextTag === 0x0C || nextTag === 0x00) {
            lineStart = i;
            break;
          }
        }
      }

      if (lineStart === -1) {
        lineStart = mtefStart + 5;
      }

      this.pos = lineStart;
      const res = this.parseEquation();
      return this.clean(res);
    } catch (e) {
      return '';
    }
  }

  bytesToString() {
    let s = '';
    for (let i = 0; i < Math.min(this.bytes.length, 1000); i++) {
      s += String.fromCharCode(this.bytes[i]);
    }
    return s;
  }

  parseEquation() {
    let out = '';
    while (this.pos < this.bytes.length) {
      if (this.bytes[this.pos] === 0x45 && this.pos + 2 < this.bytes.length && this.bytes[this.pos + 1] === 0x00 && this.bytes[this.pos + 2] === 0x71) {
        break; // "Equation Native"
      }

      const tag = this.bytes[this.pos++];
      if (tag === 0x00) {
        // END record
        break;
      }

      if (tag === 0x01 || tag === 0x0A) {
        // LINE record
        const lineOptions = this.bytes[this.pos++];
        if (tag === 0x0A && (lineOptions === 0x01 || lineOptions === 0x02)) {
          // Advance past nudges if present
          if (this.bytes[this.pos] === 0x00) this.pos++;
        }
        out += this.parseEquation();
      } else if (tag === 0x02) {
        // CHAR record
        const options = this.bytes[this.pos++];
        let fontNum = this.bytes[this.pos++];
        let charCode = 0;
        if (this.mtefVersion >= 5) {
          const lo = this.bytes[this.pos++];
          const hi = this.bytes[this.pos++];
          charCode = lo | (hi << 8);
        } else {
          charCode = this.bytes[this.pos++];
        }
        out += this.getCharString(charCode, fontNum);
      } else if (tag === 0x03) {
        // TMPL record
        const options = this.bytes[this.pos++];
        const selector = this.bytes[this.pos++];
        const varLo = this.bytes[this.pos++];
        const varHi = this.bytes[this.pos++];
        const variation = varLo | (varHi << 8);
        out += this.getTemplateString(selector, variation);
      } else if (tag === 0x0B) {
        // SUB
        out += '_{' + this.parseEquation() + '}';
      } else if (tag === 0x0C) {
        // SUPER
        out += '^{' + this.parseEquation() + '}';
      } else if (tag === 0x04) {
        // PILE
        out += this.parseEquation();
      } else if (tag === 0x05) {
        // MATRIX
        out += this.getMatrixString();
      } else {
        // Stop on unknown tag or non-MTEF control record
        break;
      }
    }
    return out;
  }

  getCharString(code, fontNum) {
    if (UNICODE_MAP[code]) return UNICODE_MAP[code];

    // Standard ASCII math
    if (code >= 0x20 && code <= 0x7E) {
      const ch = String.fromCharCode(code);
      if (ch === '<') return ' < ';
      if (ch === '>') return ' > ';
      if (ch === '=') return ' = ';
      if (ch === '+') return ' + ';
      return ch;
    }

    if (SYMBOL_MAP[code]) return SYMBOL_MAP[code];
    return '';
  }

  getTemplateString(selector, variation) {
    switch (selector) {
      case 1: // Parentheses
        return '(' + this.parseEquation() + ')';
      case 2: // Brackets
        return '[' + this.parseEquation() + ']';
      case 3: // Braces
        return '\\{' + this.parseEquation() + '\\}';
      case 4: // Bars (abs)
        return '|' + this.parseEquation() + '|';
      case 6: { // Fraction
        const num = this.parseEquation();
        const den = this.parseEquation();
        return `\\dfrac{${num}}{${den}}`;
      }
      case 10: { // Square Root
        const rad = this.parseEquation();
        return `\\sqrt{${rad}}`;
      }
      case 11: { // Nth Root
        const idx = this.parseEquation();
        const rad = this.parseEquation();
        return `\\sqrt[${idx}]{${rad}}`;
      }
      case 12: // Overbar
        return `\\overline{${this.parseEquation()}}`;
      case 13: { // Arrow / Vector
        const e = this.parseEquation();
        return e.length > 1 ? `\\overrightarrow{${e}}` : `\\vec{${e}}`;
      }
      case 15: { // Integral
        const lower = this.parseEquation();
        const upper = this.parseEquation();
        const body = this.parseEquation();
        return upper ? `\\int_{${lower}}^{${upper}}{${body}}` : `\\int{${body}}`;
      }
      case 16: { // Summation
        const lower = this.parseEquation();
        const upper = this.parseEquation();
        const body = this.parseEquation();
        return `\\sum_{${lower}}^{${upper}}{${body}}`;
      }
      case 19: { // Limit
        const lim = this.parseEquation();
        return `\\lim_{${lim}}`;
      }
      case 28: { // Cases
        const body = this.parseEquation();
        return `\\begin{cases} ${body} \\end{cases}`;
      }
      default:
        return this.parseEquation();
    }
  }

  getMatrixString() {
    const rows = this.bytes[this.pos++];
    const cols = this.bytes[this.pos++];
    const cellValues = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(this.parseEquation());
      }
      cellValues.push(row.join(' & '));
    }
    return `\\begin{pmatrix} ${cellValues.join(' \\\\ ')} \\end{pmatrix}`;
  }

  clean(s) {
    let res = s.trim();
    res = res.replace(/&\\dots\\forall/gi, '');
    res = res.replace(/\\dots\\forall/gi, '');
    res = res.replace(/\\forall\s*\\forall/gi, '\\forall ');
    res = res.replace(/&/g, ' ');
    res = res.replace(/\s+/g, ' ');
    res = res.replace(/\(\(+/g, '(');
    res = res.replace(/\)\)+/g, ')');
    res = res.replace(/\\mathbb\{R\}\s*\\mathbb\{R\}/g, '\\mathbb{R}');
    res = res.replace(/\\in\s*\\in/g, '\\in ');
    res = res.replace(/;\s*/g, '; ');
    res = res.replace(/\s*\.\s*$/, '');
    res = res.replace(/\\infty\./g, '\\infty');
    res = res.replace(/1\./g, '1');
    return res.trim();
  }
}

const buf = fs.readFileSync('test-files/TN1.docx');
const entries = unzip(buf);

console.log('--- TEST PRECISE MTEF DECODER ON TN1.docx ---');
for (let i = 1; i <= 15; i++) {
  const oleKey = `word/embeddings/oleObject${i}.bin`;
  if (entries[oleKey]) {
    const dec = new PreciseMtefDecoder(entries[oleKey]);
    console.log(`OLE [${oleKey}] -> "${dec.decode()}"`);
  }
}

for (let i = 1; i <= 15; i++) {
  const wmfKey = `word/media/image${i}.wmf`;
  if (entries[wmfKey]) {
    const dec = new PreciseMtefDecoder(entries[wmfKey]);
    console.log(`WMF [${wmfKey}] -> "${dec.decode()}"`);
  }
}
