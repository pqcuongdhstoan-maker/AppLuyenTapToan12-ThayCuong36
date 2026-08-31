/**
 * MTEF (MathType Equation Format) Binary Decoder to LaTeX / MathType string
 * Decodes MathType 3.x, 5.x, 6.x, and 7.x binary streams from Word oleObject.bin into clean LaTeX strings.
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
  0xA1: '',
  0xA2: "'",
  0xA3: '\\le',
  0xA4: '/',
  0xA5: '\\infty',
  0xA6: 'f',
  0xAA: '\\spadesuit',
  0xAB: '\\leftrightarrow',
  0xAC: '\\leftarrow',
  0xAD: '\\uparrow',
  0xAE: '\\rightarrow',
  0xAF: '\\downarrow',
  0xB0: '^\\circ',
  0xB1: '\\pm',
  0xB2: "''",
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
  0xBE: '-',
  0xC0: '\\aleph',
  0xC6: '\\emptyset',
  0xC7: '\\cap',
  0xC8: '\\cup',
  0xC9: '\\supset',
  0xCA: '\\supseteq',
  0xCC: '\\subset',
  0xCD: '\\subseteq',
  0xCE: '\\in',
  0xCF: '\\notin',
  0xD0: '\\angle',
  0xD1: '\\nabla',
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
  0xE7: '|',
  0xE8: '[',
  0xE9: '\\{',
  0xF1: '\\rangle',
  0xF2: '\\int',
  0xF6: ')',
  0xF8: ']',
  0xF9: '\\}'
};

// Common 16-bit Unicode math characters
const UNICODE_MAP: { [code: number]: string } = {
  0x211D: '\\mathbb{R}',
  0x2124: '\\mathbb{Z}',
  0x2115: '\\mathbb{N}',
  0x211A: '\\mathbb{Q}',
  0x2102: '\\mathbb{C}',
  0x221E: '\\infty',
  0x2212: '-',
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
  0x2032: "'",
  0x2033: "''"
};

export class MtefDecoder {
  private bytes: Uint8Array;
  private pos: number = 0;

  constructor(buffer: ArrayBuffer | Uint8Array) {
    this.bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  public decode(): string {
    try {
      // 1. MathType 7 Embedded TeX string detection
      const rawStr = this.bytesToString();
      
      const texMatch = rawStr.match(/TeX Input Language\x00\{([^\x00]*)\}\x00/);
      if (texMatch) {
        let tex = texMatch[1].trim();
        if (tex.endsWith('.')) tex = tex.slice(0, -1).trim();
        return this.cleanLatex(tex);
      }

      // Fallback \0{...}\0 TeX match
      const genericTexMatch = rawStr.match(/\x00\{([^\x00\r\n]{2,300})\}\x00/);
      if (genericTexMatch) {
        const candidate = genericTexMatch[1].trim();
        if (
          candidate.includes('\\') ||
          candidate.includes('(') ||
          candidate.includes('=') ||
          candidate.includes('^') ||
          candidate.includes('+') ||
          candidate.includes('-')
        ) {
          let tex = candidate;
          if (tex.endsWith('.')) tex = tex.slice(0, -1).trim();
          return this.cleanLatex(tex);
        }
      }

      // 2. Binary MTEF stream decoder
      this.findMtefHeader();
      if (this.pos >= this.bytes.length) {
        return '';
      }

      const sig = this.pos;
      let lineIdx = -1;

      // First search for 0x0A 0x01 (RULER + LINE)
      for (let i = sig + 4; i < Math.min(sig + 450, this.bytes.length - 2); i++) {
        if (this.bytes[i] === 0x0A && this.bytes[i + 1] === 0x01) {
          lineIdx = i + 1; // Start after 0x0A 0x01
          break;
        }
      }

      // Fallback to 0x0A
      if (lineIdx === -1) {
        for (let i = sig + 4; i < Math.min(sig + 450, this.bytes.length - 2); i++) {
          if (this.bytes[i] === 0x0A) {
            lineIdx = i;
            break;
          }
        }
      }

      // Fallback to 0x12 0x00 (font table END record)
      if (lineIdx === -1) {
        for (let i = sig + 4; i < Math.min(sig + 450, this.bytes.length - 2); i++) {
          if (this.bytes[i] === 0x12 && this.bytes[i + 1] === 0x00) {
            lineIdx = i + 1;
            break;
          }
        }
      }

      if (lineIdx === -1) {
        return '';
      }

      this.pos = lineIdx + 1;
      return this.parseTokenStream();
    } catch (e) {
      console.warn('MTEF decode error:', e);
      return '';
    }
  }

  private bytesToString(): string {
    let s = '';
    for (let i = 0; i < this.bytes.length; i++) {
      s += String.fromCharCode(this.bytes[i]);
    }
    return s;
  }

  private findMtefHeader(): void {
    for (let i = 0; i < this.bytes.length - 4; i++) {
      if (this.bytes[i] === 0x1C && this.bytes[i + 1] === 0x05 && this.bytes[i + 2] === 0x01) {
        this.pos = i + 1;
        return;
      }
    }
    for (let i = 0; i < this.bytes.length - 2; i++) {
      if (this.bytes[i] === 0x05 && this.bytes[i + 1] === 0x01) {
        this.pos = i;
        return;
      }
      if (this.bytes[i] === 0x03 && this.bytes[i + 1] === 0x01 && this.bytes[i + 2] === 0x01) {
        this.pos = i;
        return;
      }
    }
    this.pos = this.bytes.length;
  }

  private parseTokenStream(): string {
    const tokens: string[] = [];

    while (this.pos < this.bytes.length) {
      // Check for End of stream in OLE / WMF container
      if (this.bytes[this.pos] === 0x45 && this.pos + 14 < this.bytes.length) {
        let sub = '';
        for (let k = 0; k < 15; k++) sub += String.fromCharCode(this.bytes[this.pos + k]);
        if (sub.includes('Equation Native')) break;
      }
      if (this.bytes[this.pos] === 0x53 && this.pos + 6 < this.bytes.length) {
        let sub = '';
        for (let k = 0; k < 7; k++) sub += String.fromCharCode(this.bytes[this.pos + k]);
        if (sub.includes('System')) break;
      }
      if (this.bytes[this.pos] === 0x57 && this.pos + 6 < this.bytes.length) {
        let sub = '';
        for (let k = 0; k < 7; k++) sub += String.fromCharCode(this.bytes[this.pos + k]);
        if (sub.includes('WinAll')) break;
      }
      if (this.bytes[this.pos] === 0x54 && this.pos + 14 < this.bytes.length) {
        let sub = '';
        for (let k = 0; k < 15; k++) sub += String.fromCharCode(this.bytes[this.pos + k]);
        if (sub.includes('Times New Roman')) break;
      }

      // Check 16-bit unicode markers
      if (this.pos + 1 < this.bytes.length) {
        const b0 = this.bytes[this.pos];
        const b1 = this.bytes[this.pos + 1];

        if (b0 === 0x1D && b1 === 0x21) {
          tokens.push('\\mathbb{R}');
          this.pos += 2;
          continue;
        }
        if (b0 === 0x12 && b1 === 0x22) {
          tokens.push('-');
          this.pos += 2;
          continue;
        }
        if (b0 === 0x1E && b1 === 0x22) {
          tokens.push('\\infty');
          this.pos += 2;
          continue;
        }
        if (b0 === 0x08 && b1 === 0x22) {
          tokens.push('\\in ');
          this.pos += 2;
          continue;
        }

        const code16 = b0 | (b1 << 8);
        if (UNICODE_MAP[code16]) {
          tokens.push(UNICODE_MAP[code16]);
          this.pos += 2;
          continue;
        }
      }

      const b = this.bytes[this.pos++];
      if (b === 0) continue;

      // Skip delimiter glyph indicators (0x96 0x28, 0x96 0x29) to prevent duplicate parentheses
      if (b === 0x96 && this.pos < this.bytes.length && (this.bytes[this.pos] === 0x28 || this.bytes[this.pos] === 0x29)) {
        this.pos++;
        continue;
      }

      if (b === 0x03) {
        // TMPL template tag (parentheses, interval)
        tokens.push('(');
      } else if (b === 0x27 || b === 0xA2) {
        tokens.push("'");
      } else if (b === 0xA5) {
        tokens.push('\\infty');
      } else if (b === 0xE2) {
        tokens.push('\\mathbb{R}');
      } else if (b === 0xBE) {
        tokens.push('-');
      } else if (b === 0xB1) {
        tokens.push('\\pm');
      } else if (b === 0x3D) {
        tokens.push(' = ');
      } else if (b >= 40 && b <= 59) {
        // '(', ')', '*', '+', ',', '-', '.', '/', '0'..'9', ':', ';'
        tokens.push(String.fromCharCode(b));
      } else if ((b >= 65 && b <= 90) || (b >= 97 && b <= 122)) {
        // 'A'..'Z', 'a'..'z'
        tokens.push(String.fromCharCode(b));
      } else if (SYMBOL_FONT_MAP[b]) {
        tokens.push(SYMBOL_FONT_MAP[b]);
      }
    }

    const res = tokens.join('');
    return this.cleanLatex(res);
  }

  private cleanLatex(s: string): string {
    let res = s.trim();

    // 1. Remove embedded OLE garbage and system footers
    res = res.replace(/Equation\s*Native/gi, '');
    if (res.includes('System')) res = res.substring(0, res.indexOf('System')).trim();
    if (res.includes('Times New Roman')) res = res.substring(0, res.indexOf('Times New Roman')).trim();
    if (res.includes('WinAll')) res = res.substring(0, res.indexOf('WinAll')).trim();

    // 2. Remove empty and trailing parentheses from MathType delimiters
    res = res.replace(/\(\s*\.\s*\)/g, '');
    res = res.replace(/\(\s*\)/g, '');
    res = res.replace(/\(\s*$/, '');
    res = res.replace(/\s*\.\s*$/, '');

    // 3. Fix duplicate symbols
    res = res.replace(/\s+/g, ' ');
    res = res.replace(/;\s*/g, '; ');
    res = res.replace(/--+/g, '-');
    res = res.replace(/\+\++/g, '+');
    res = res.replace(/==+/g, '=');
    res = res.replace(/=\s*=/g, '=');
    res = res.replace(/-\\infty/g, '-\\infty');
    res = res.replace(/\+\\infty/g, '+\\infty');
    res = res.replace(/(\\infty)+/g, '\\infty');
    res = res.replace(/\\left\s*\(/g, '(');
    res = res.replace(/\\right\s*\)/g, ')');

    // 4. Fix double / nested parentheses
    res = res.replace(/\(\(+/g, '(');
    res = res.replace(/\)\)+/g, ')');

    // 5. Fix function representations
    res = res.replace(/f'\s*\(+\s*x\s*\(?/g, "f'(x)");
    res = res.replace(/f\s*\(+\s*x\s*\(?/g, "f(x)");
    res = res.replace(/f\(x\(\)/g, 'f(x)');
    res = res.replace(/f'\(x\(\)/g, "f'(x)");
    res = res.replace(/f\(\(x/g, 'f(x)');
    res = res.replace(/f'\(\(x/g, "f'(x)");
    res = res.replace(/f'\s*\(\s*x\s*\)/g, "f'(x)");
    res = res.replace(/f\s*\(\s*x\s*\)/g, "f(x)");

    // 6. Clean leading =
    res = res.replace(/^\s*=\s*/, '');

    // 7. Clean sets and Greek symbols
    res = res.replace(/\\mathbb\{R\}\s*(\\Upsilon|[^\w\s\$\\\,\;\:\.\(\)\[\]\{\}\+\-\*\/\=\<\>\^])+/g, '\\mathbb{R}');
    res = res.replace(/\\Upsilon\b/g, '');
    res = res.replace(/\\mathbb\{R\}\s*\\Upsilon/g, '\\mathbb{R}');

    // 8. Ensure balanced interval parentheses (a; b)
    if (res.includes(';') && !res.startsWith('(') && !res.startsWith('[')) {
      res = '(' + res;
    }
    if (res.includes(';') && !res.endsWith(')') && !res.endsWith(']')) {
      res = res + ')';
    }

    return res.trim();
  }
}

export function decodeMtefToLatex(buffer: ArrayBuffer | Uint8Array): string {
  const decoder = new MtefDecoder(buffer);
  return decoder.decode().trim();
}

