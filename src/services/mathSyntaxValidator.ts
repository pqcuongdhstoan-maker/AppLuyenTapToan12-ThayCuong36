/**
 * Math Syntax Validator & Algebraic / Numeric Equivalence Engine
 * Validates LaTeX formulas, detects syntax errors, checks delimiter balance,
 * and accurately grades short mathematical answers.
 */

export interface MathSyntaxCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedLatex?: string;
}

/**
 * Validates a single LaTeX formula or text block containing math delimiters ($...$ or $$...$$)
 */
export function validateMathSyntax(input: string): MathSyntaxCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fixed = input;

  if (!input || !input.trim()) {
    return { isValid: true, errors: [], warnings: [] };
  }

  // 1. Check delimiter pairs $ and $$
  const raw = input;
  let singleDollarCount = 0;
  let doubleDollarCount = 0;

  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '\\' && i + 1 < raw.length && raw[i + 1] === '$') {
      i += 2; // Escaped dollar sign
      continue;
    }
    if (raw[i] === '$') {
      if (i + 1 < raw.length && raw[i + 1] === '$') {
        doubleDollarCount++;
        i += 2;
      } else {
        singleDollarCount++;
        i += 1;
      }
    } else {
      i++;
    }
  }

  if (singleDollarCount % 2 !== 0) {
    errors.push('Thiếu dấu đóng hoặc mở công thức nội dòng ($).');
  }
  if (doubleDollarCount % 2 !== 0) {
    errors.push('Thiếu dấu đóng hoặc mở công thức khối ($$).');
  }

  // 2. Check LaTeX curly braces balance {...}
  let braceDepth = 0;
  for (let j = 0; j < raw.length; j++) {
    if (raw[j] === '\\' && j + 1 < raw.length && (raw[j + 1] === '{' || raw[j + 1] === '}')) {
      j++;
      continue;
    }
    if (raw[j] === '{') braceDepth++;
    if (raw[j] === '}') braceDepth--;
    if (braceDepth < 0) {
      errors.push('Thừa dấu đóng ngoặc nhọn "}" trong công thức.');
      break;
    }
  }
  if (braceDepth > 0) {
    errors.push(`Thiếu ${braceDepth} dấu đóng ngoặc nhọn "}" trong công thức.`);
  }

  // 3. Check \\begin{...} and \\end{...} environments
  const beginMatches = Array.from(raw.matchAll(/\\begin\{([a-zA-Z0-9*]+)\}/g)).map(m => m[1]);
  const endMatches = Array.from(raw.matchAll(/\\end\{([a-zA-Z0-9*]+)\}/g)).map(m => m[1]);

  if (beginMatches.length !== endMatches.length) {
    errors.push(`Số lượng \\begin (${beginMatches.length}) không khớp với \\end (${endMatches.length}).`);
  } else {
    for (let k = 0; k < beginMatches.length; k++) {
      if (!endMatches.includes(beginMatches[k])) {
        errors.push(`Môi trường \\begin{${beginMatches[k]}} chưa có \\end{${beginMatches[k]}} tương ứng.`);
      }
    }
  }

  // 4. Check \\left and \\right matching
  const leftCount = (raw.match(/\\left\b/g) || []).length;
  const rightCount = (raw.match(/\\right\b/g) || []).length;
  if (leftCount !== rightCount) {
    warnings.push(`Số lượng \\left (${leftCount}) và \\right (${rightCount}) không cân bằng. Hãy kiểm tra các cặp ngoặc tự co giãn.`);
  }

  // 5. Check empty formulas
  if (/\$\s*\$/.test(raw) || /\$\$\s*\$\$/.test(raw)) {
    warnings.push('Phát hiện công thức toán rỗng ($$ hoặc $$$$).');
  }

  // 6. Check common syntax typos
  if (/\\frac\s*\{[^{}]*\}\s*$/.test(raw) || /\\dfrac\s*\{[^{}]*\}\s*$/.test(raw)) {
    errors.push('Phân số \\frac hoặc \\dfrac thiếu mẫu số {mẫu}.');
  }

  // Auto-clean common minor issues in fixedLatex
  fixed = fixed
    .replace(/==+/g, '=')
    .replace(/--+/g, '-')
    .replace(/\+\++/g, '+')
    .replace(/(\\infty)+/g, '\\infty')
    .replace(/f\(\(x/g, 'f(x)')
    .replace(/f'\(\(x/g, "f'(x)");

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedLatex: fixed
  };
}

/**
 * Normalizes a math string for robust comparison:
 * - Stems whitespaces, removes outer delimiters $, $$
 * - Replaces unicode minuses
 * - Standardizes fractions \frac and \dfrac to division or simplified format
 */
export function normalizeMathString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/^\$\$?|\$\$?$/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\bm\{([^}]+)\}/g, '$1')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, '; ')
    .replace(/\\quad|\\qquad/g, ' ')
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses numeric value from a string (supports fractions e.g. "3/4", "-1/2", decimals "0.75", "0,75", square roots "\sqrt{2}")
 */
export function parseNumericValue(val: string): number | null {
  if (!val) return null;
  const clean = val
    .replace(/\$/g, '')
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-');

  // Simple number e.g. -3.14 or -3,14
  const numClean = clean.replace(/,/g, '.');
  const num = Number(numClean);
  if (!isNaN(num) && !clean.includes(';') && !clean.includes('/') && !clean.includes('\\')) return num;

  // Fraction a/b or -a/b
  const fracMatch = clean.match(/^([+-]?\d+(?:[\.,]\d+)?)\/([+-]?\d+(?:[\.,]\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1].replace(',', '.'));
    const den = parseFloat(fracMatch[2].replace(',', '.'));
    if (den !== 0) return num / den;
  }

  // LaTeX fraction [+-]?\frac{a}{b} or [+-]?\dfrac{a}{b}
  const latexFracMatch = clean.match(/^([+-]?)\\*(?:d|t)?frac\{([+-]?\d+(?:[\.,]\d+)?)\}\{([+-]?\d+(?:[\.,]\d+)?)\}$/);
  if (latexFracMatch) {
    const sign = latexFracMatch[1] === '-' ? -1 : 1;
    const num = parseFloat(latexFracMatch[2].replace(',', '.'));
    const den = parseFloat(latexFracMatch[3].replace(',', '.'));
    if (den !== 0) return sign * (num / den);
  }

  // Square root \sqrt{a} or sqrt(a)
  const sqrtMatch = clean.match(/^([+-]?)(?:\\sqrt\{|\bsqrt\()([0-9\.,]+)(?:\}|\))$/);
  if (sqrtMatch) {
    const sign = sqrtMatch[1] === '-' ? -1 : 1;
    const inner = parseFloat(sqrtMatch[2].replace(',', '.'));
    if (inner >= 0) return sign * Math.sqrt(inner);
  }

  return null;
}

/**
 * Evaluates whether student's short answer matches any of the teacher's correct answers.
 */
export function evaluateShortAnswerEquivalence(
  studentAnswer: string,
  correctAnswers: string[],
  tolerance: number = 0.01
): { isCorrect: boolean; matchedAnswer?: string; numericDiff?: number } {
  if (!studentAnswer || !correctAnswers || correctAnswers.length === 0) {
    return { isCorrect: false };
  }

  const sNorm = normalizeMathString(studentAnswer).toLowerCase();
  const sNum = parseNumericValue(studentAnswer);

  for (const cRaw of correctAnswers) {
    if (!cRaw) continue;
    const cNorm = normalizeMathString(cRaw).toLowerCase();

    // 1. Direct normalized string equality
    if (sNorm === cNorm) {
      return { isCorrect: true, matchedAnswer: cRaw };
    }

    // 2. Numeric evaluation with tolerance
    const cNum = parseNumericValue(cRaw);
    if (sNum !== null && cNum !== null) {
      const diff = Math.abs(sNum - cNum);
      const effectiveTol = Math.max(tolerance, 1e-6);
      if (diff <= effectiveTol) {
        return { isCorrect: true, matchedAnswer: cRaw, numericDiff: diff };
      }
    }

    // 3. Coordinate & interval normalization: replace ; with , and remove spaces around delimiters
    const normalizePunc = (str: string) =>
      str
        .replace(/;\s*/g, ',')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s+/g, '')
        .replace(/[−–—]/g, '-');

    if (normalizePunc(sNorm) === normalizePunc(cNorm)) {
      return { isCorrect: true, matchedAnswer: cRaw };
    }

    // 4. Comma vs dot swap for single decimal numbers
    const sSwapped = sNorm.replace(/,/g, '.');
    const cSwapped = cNorm.replace(/,/g, '.');
    if (sSwapped === cSwapped) {
      return { isCorrect: true, matchedAnswer: cRaw };
    }
  }

  return { isCorrect: false };
}
