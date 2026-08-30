/**
 * MTEF (MathType Equation Format) Binary Decoder to LaTeX
 * Decodes MathType 3.x, 5.x, 6.x binary streams from Word oleObject.bin into clean LaTeX strings.
 */

// MathType symbol font character code mappings to LaTeX
const SYMBOL_FONT_MAP: { [code: number]: string } = {
  0x20: ' ',
  0x21: '!',
  0x22: '\\forall',
  0x23: '#',
  0x24: '\\exists',
  0x25: '%',
  0x26: '&',
  0x27: '\\ni',
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
  0x40: '\\cong',
  0x41: 'A',
  0x42: 'B',
  0x43: 'C',
  0x44: 'D',
  0x45: 'E',
  0x46: 'F',
  0x47: 'G',
  0x48: 'H',
  0x49: 'I',
  0x4A: 'J',
  0x4B: 'K',
  0x4C: 'L',
  0x4D: 'M',
  0x4E: 'N',
  0x4F: 'O',
  0x50: 'P',
  0x51: 'Q',
  0x52: 'R',
  0x53: 'S',
  0x54: 'T',
  0x55: 'U',
  0x56: 'V',
  0x57: 'W',
  0x58: 'X',
  0x59: 'Y',
  0x5A: 'Z',
  0x5B: '[',
  0x5C: '\\therefore',
  0x5D: ']',
  0x5E: '\\perp',
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
  0x6F: 'o',
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
  0x7B: '{',
  0x7C: '|',
  0x7D: '}',
  0x7E: '\\sim',
  0xA0: ' ',
  0xA1: '\\Upsilon',
  0xA2: '\\prime',
  0xA3: '\\le',
  0xA4: '/',
  0xA5: '\\infty',
  0xA6: 'f',
  0xA7: '\\clubsuit',
  0xA8: '\\diamondsuit',
  0xA9: '\\heartsuit',
  0xAA: '\\spadesuit',
  0xAB: '\\leftrightarrow',
  0xAC: '\\leftarrow',
  0xAD: '\\uparrow',
  0xAE: '\\rightarrow',
  0xAF: '\\downarrow',
  0xB0: '^\\circ',
  0xB1: '\\pm',
  0xB2: '\\prime\\prime',
  0xB3: '\\ge',
  0xB4: '\\times',
  0xB5: '\\propto',
  0xB6: '\\partial',
  0xB7: '\\bullet',
  0xB8: '\\div',
  0xB9: '\\neq',
  0xBA: '\\equiv',
  0xBB: '\\approx',
  0xBC: '\\dots',
  0xBD: '|',
  0xBE: '-',
  0xBF: '\\hookleftarrow',
  0xC0: '\\aleph',
  0xC1: '\\Im',
  0xC2: '\\Re',
  0xC3: '\\wp',
  0xC4: '\\otimes',
  0xC5: '\\oplus',
  0xC6: '\\emptyset',
  0xC7: '\\cap',
  0xC8: '\\cup',
  0xC9: '\\supset',
  0xCA: '\\supseteq',
  0xCB: '\\not\\subset',
  0xCC: '\\subset',
  0xCD: '\\subseteq',
  0xCE: '\\in',
  0xCF: '\\notin',
  0xD0: '\\angle',
  0xD1: '\\nabla',
  0xD2: '\\circledR',
  0xD3: '\\copyright',
  0xD4: '\\trade',
  0xD5: '\\prod',
  0xD6: '\\sqrt',
  0xD7: '\\cdot',
  0xD8: '\\neg',
  0xD9: '\\wedge',
  0xDA: '\\vee',
  0xDB: '\\Leftrightarrow',
  0xDC: '\\Leftarrow',
  0xDD: '\\Uparrow',
  0xDE: '\\Rightarrow',
  0xDF: '\\Downarrow',
  0xE0: '\\diamond',
  0xE1: '\\langle',
  0xE2: '\\mathbb{R}',
  0xE3: '\\mathbb{C}',
  0xE4: '\\mathbb{N}',
  0xE5: '\\sum',
  0xE6: '(',
  0xE7: '\\vert',
  0xE8: '[',
  0xE9: '\\{',
  0xEA: '\\vert',
  0xEB: '|',
  0xEC: '|',
  0xED: '|',
  0xEE: '|',
  0xEF: '|',
  0xF1: '\\rangle',
  0xF2: '\\int',
  0xF3: '|',
  0xF4: '|',
  0xF5: '|',
  0xF6: ')',
  0xF7: '|',
  0xF8: ']',
  0xF9: '\\}',
  0xFA: '|'
};

// Unicode common math symbols to LaTeX
const UNICODE_MAP: { [code: number]: string } = {
  0x211D: '\\mathbb{R}',
  0x2124: '\\mathbb{Z}',
  0x2115: '\\mathbb{N}',
  0x211A: '\\mathbb{Q}',
  0x2102: '\\mathbb{C}',
  0x221E: '\\infty',
  0x2264: '\\le',
  0x2265: '\\ge',
  0x2260: '\\neq',
  0x2208: '\\in',
  0x2209: '\\notin',
  0x2282: '\\subset',
  0x2283: '\\supset',
  0x222A: '\\cup',
  0x2229: '\\cap',
  0x2205: '\\emptyset',
  0x00B1: '\\pm',
  0x2213: '\\mp',
  0x2248: '\\approx',
  0x2261: '\\equiv',
  0x2192: '\\to',
  0x21D2: '\\Rightarrow',
  0x21D4: '\\Leftrightarrow',
  0x222B: '\\int',
  0x2211: '\\sum',
  0x2206: '\\Delta',
  0x03C0: '\\pi',
  0x03B1: '\\alpha',
  0x03B2: '\\beta',
  0x03B3: '\\gamma',
  0x03B8: '\\theta',
  0x03BB: '\\lambda',
  0x221A: '\\sqrt',
  0x2236: ':',
  0x22EF: '\\dots',
  0x2026: '\\dots',
  0x2235: '\\because',
  0x2234: '\\therefore'
};

export class MtefDecoder {
  private bytes: Uint8Array;
  private pos: number = 0;
  private fontList: string[] = [];

  constructor(buffer: ArrayBuffer | Uint8Array) {
    this.bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  public decode(): string {
    try {
      this.findMtefHeader();
      if (this.pos >= this.bytes.length) {
        return '';
      }

      // Read header (version, platform, product, prodVersion, prodSubVersion)
      const mtefVer = this.readByte();
      const platform = this.readByte();
      const product = this.readByte();
      const prodVersion = this.readByte();
      const prodSubVersion = this.readByte();

      return this.parseLine();
    } catch (e) {
      console.warn('MTEF decode error:', e);
      return '';
    }
  }

  private findMtefHeader(): void {
    // In OLE DocFile or raw MTEF, search for signature
    for (let i = 0; i < this.bytes.length - 5; i++) {
      // MTEF v5 header starts with (5, 1, 1, ...) or (3, 1, 1, ...) or (5, 0, 1, ...)
      const b0 = this.bytes[i];
      const b1 = this.bytes[i + 1];
      const b2 = this.bytes[i + 2];

      if ((b0 === 5 || b0 === 3 || b0 === 2 || b0 === 1) && (b1 === 0 || b1 === 1) && (b2 === 0 || b2 === 1)) {
        this.pos = i;
        return;
      }
    }
    this.pos = this.bytes.length;
  }

  private readByte(): number {
    if (this.pos >= this.bytes.length) return 0;
    return this.bytes[this.pos++];
  }

  private readInt16(): number {
    const b0 = this.readByte();
    const b1 = this.readByte();
    return b0 | (b1 << 8);
  }

  private readNullTermString(): string {
    let s = '';
    while (this.pos < this.bytes.length) {
      const b = this.readByte();
      if (b === 0) break;
      s += String.fromCharCode(b);
    }
    return s;
  }

  private parseLine(): string {
    let result = '';

    while (this.pos < this.bytes.length) {
      const tag = this.readByte();
      if (tag === 0) {
        // END
        break;
      }

      const recType = tag & 0x0F;
      const options = tag >> 4;

      switch (recType) {
        case 1: {
          // LINE record
          if (options & 0x01) {
            this.readByte(); // nudge x
            this.readByte(); // nudge y
          }
          if (options & 0x02) {
            this.readInt16();
          }
          if (options & 0x04) {
            this.readByte();
          }
          result += this.parseLine();
          break;
        }

        case 2: {
          // CHAR record
          let fontIndex = 0;
          if (options & 0x01) {
            fontIndex = this.readByte();
          }
          const charCode = this.readByte();
          result += this.mapCharCodeToLatex(charCode, fontIndex);
          break;
        }

        case 3: {
          // TMPL (Template)
          result += this.parseTemplate(options);
          break;
        }

        case 4: {
          // PILE (vertical stack)
          result += this.parsePile();
          break;
        }

        case 5: {
          // MATRIX
          result += this.parseMatrix();
          break;
        }

        case 6: {
          // EMBEL (embellishment)
          const embelCode = this.readByte();
          if (embelCode === 1) result += '\'';
          else if (embelCode === 2) result += '\'\'';
          else if (embelCode === 3) result += '\'\'\'';
          else if (embelCode === 5) result += '\\bar';
          else if (embelCode === 6) result += '\\vec';
          else if (embelCode === 7) result += '\\hat';
          break;
        }

        case 7: {
          // RULER
          const nTabs = this.readByte();
          for (let t = 0; t < nTabs; t++) {
            this.readInt16();
            this.readByte();
          }
          break;
        }

        case 8: {
          // FONT_DEF
          const fontIdx = this.readByte();
          const fontName = this.readNullTermString();
          this.fontList[fontIdx] = fontName;
          break;
        }

        case 9: {
          // SIZE
          this.readInt16();
          break;
        }

        case 10: {
          // FULL size
          break;
        }

        case 11:
        case 12: {
          // SUB / SUB2
          break;
        }

        case 18:
        case 19: {
          // 16-bit Unicode char (ENC_CHAR_16 or CHAR_16)
          if (options & 0x01) {
            this.readByte();
          }
          const code16 = this.readInt16();
          result += this.mapUnicodeToLatex(code16);
          break;
        }

        default:
          break;
      }
    }

    return result;
  }

  private mapCharCodeToLatex(code: number, fontIndex: number): string {
    const fontName = (this.fontList[fontIndex] || '').toLowerCase();

    if (fontName.includes('symbol') || fontName.includes('mt extra')) {
      if (SYMBOL_FONT_MAP[code]) {
        return SYMBOL_FONT_MAP[code] + ' ';
      }
    }

    if (code >= 0x20 && code <= 0x7E) {
      const ch = String.fromCharCode(code);
      if (ch === '{' || ch === '}') return `\\${ch}`;
      if (ch === '_') return '\\_';
      return ch;
    }

    if (SYMBOL_FONT_MAP[code]) {
      return SYMBOL_FONT_MAP[code] + ' ';
    }

    return String.fromCharCode(code);
  }

  private mapUnicodeToLatex(code: number): string {
    if (UNICODE_MAP[code]) {
      return UNICODE_MAP[code] + ' ';
    }
    if (code >= 0x20 && code <= 0x7E) {
      return String.fromCharCode(code);
    }
    return String.fromCharCode(code);
  }

  private parseTemplate(options: number): string {
    const tmplCode = this.readByte();
    const tmplSelector = this.readByte();

    // Fraction
    if (tmplCode === 1 || tmplCode === 0) {
      const num = this.parseLine();
      const den = this.parseLine();
      return `\\dfrac{${num || '1'}}{${den || '1'}}`;
    }

    // Radical (sqrt)
    if (tmplCode === 2) {
      if (tmplSelector === 1) {
        const deg = this.parseLine();
        const body = this.parseLine();
        return `\\sqrt[${deg}]{${body}}`;
      }
      const body = this.parseLine();
      return `\\sqrt{${body}}`;
    }

    // Superscript / Subscript
    if (tmplCode === 3) {
      if (tmplSelector === 0) {
        const sub = this.parseLine();
        return `_{${sub}}`;
      }
      if (tmplSelector === 1) {
        const sup = this.parseLine();
        return `^{${sup}}`;
      }
      if (tmplSelector === 2) {
        const sub = this.parseLine();
        const sup = this.parseLine();
        return `_{${sub}}^{${sup}}`;
      }
    }

    // Delimiters / Parentheses / Brackets
    if (tmplCode === 5 || tmplCode === 6) {
      const content = this.parseLine();
      if (tmplSelector === 0) return `\\left( ${content} \\right)`;
      if (tmplSelector === 1) return `\\left[ ${content} \\right]`;
      if (tmplSelector === 2) return `\\left\\{ ${content} \\right\\}`;
      if (tmplSelector === 3) return `\\left| ${content} \\right|`;
      if (tmplSelector === 14) return `\\begin{cases} ${content} \\end{cases}`;
      return `\\left( ${content} \\right)`;
    }

    // Integrals / Sums
    if (tmplCode === 7 || tmplCode === 8) {
      let op = '\\int';
      if (tmplCode === 8) op = '\\sum';
      const sub = this.parseLine();
      const sup = this.parseLine();
      const body = this.parseLine();
      if (sub && sup) return `${op}_{${sub}}^{${sup}}{${body}}`;
      if (sub) return `${op}_{${sub}}{${body}}`;
      return `${op}{${body}}`;
    }

    // Arrows / Vectors
    if (tmplCode === 9) {
      const body = this.parseLine();
      return `\\vec{${body}}`;
    }

    const body = this.parseLine();
    return body;
  }

  private parsePile(): string {
    const lines: string[] = [];
    while (this.pos < this.bytes.length) {
      const line = this.parseLine();
      if (!line && this.bytes[this.pos - 1] === 0) break;
      if (line) lines.push(line);
    }
    return lines.join(' \\\\ ');
  }

  private parseMatrix(): string {
    const rows = this.readByte();
    const cols = this.readByte();
    const cells: string[] = [];

    for (let r = 0; r < rows; r++) {
      const rowCells: string[] = [];
      for (let c = 0; c < cols; c++) {
        rowCells.push(this.parseLine());
      }
      cells.push(rowCells.join(' & '));
    }

    return `\\begin{matrix} ${cells.join(' \\\\ ')} \\end{matrix}`;
  }
}

export function decodeMtefToLatex(buffer: ArrayBuffer | Uint8Array): string {
  const decoder = new MtefDecoder(buffer);
  let res = decoder.decode().trim();
  res = res
    .replace(/\s+/g, ' ')
    .replace(/\\mathbb\{R\}\s*\(/g, '\\mathbb{R} (')
    .replace(/\(\s*-\s*\\infty\s*;\s*([^\)]+)\)/g, '(-\\infty; $1)')
    .replace(/\(\s*([^\;]+)\s*;\s*\+\s*\\infty\s*\)/g, '($1; +\\infty)');
  return res;
}
