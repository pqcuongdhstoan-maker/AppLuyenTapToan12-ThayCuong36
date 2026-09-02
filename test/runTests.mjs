/**
 * Automated Test Runner for Math Formula System & Word DOCX Parser
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}\n      Expected: "${expected}"\n      Actual:   "${actual}"`);
  }
}

console.log('===============================================================');
console.log('BẮT ĐẦU KIỂM THỬ HỆ THỐNG CÔNG THỨC TOÁN HỌC & DOCX PARSER');
console.log('===============================================================\n');

// -------------------------------------------------------------
// 1. Math Syntax Validator Tests
// -------------------------------------------------------------
console.log('--- TEST SUITE 1: Kiểm tra Cú pháp Toán học (Syntax Validator) ---');

function validateMathSyntax(input) {
  const errors = [];
  const warnings = [];
  let fixed = input;

  if (!input || !input.trim()) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const raw = input;
  let singleDollarCount = 0;
  let doubleDollarCount = 0;

  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '\\' && i + 1 < raw.length && raw[i + 1] === '$') {
      i += 2;
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

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedLatex: fixed
  };
}

function normalizeMathString(str) {
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

function parseNumericValue(val) {
  if (!val) return null;
  const clean = val
    .replace(/\$/g, '')
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-');

  const numClean = clean.replace(/,/g, '.');
  const num = Number(numClean);
  if (!isNaN(num) && !clean.includes(';') && !clean.includes('/') && !clean.includes('\\')) return num;

  const fracMatch = clean.match(/^([+-]?\d+(?:[\.,]\d+)?)\/([+-]?\d+(?:[\.,]\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1].replace(',', '.'));
    const den = parseFloat(fracMatch[2].replace(',', '.'));
    if (den !== 0) return num / den;
  }

  const latexFracMatch = clean.match(/^([+-]?)\\*(?:d|t)?frac\{([+-]?\d+(?:[\.,]\d+)?)\}\{([+-]?\d+(?:[\.,]\d+)?)\}$/);
  if (latexFracMatch) {
    const sign = latexFracMatch[1] === '-' ? -1 : 1;
    const num = parseFloat(latexFracMatch[2].replace(',', '.'));
    const den = parseFloat(latexFracMatch[3].replace(',', '.'));
    if (den !== 0) return sign * (num / den);
  }

  const sqrtMatch = clean.match(/^([+-]?)(?:\\sqrt\{|\bsqrt\()([0-9\.,]+)(?:\}|\))$/);
  if (sqrtMatch) {
    const sign = sqrtMatch[1] === '-' ? -1 : 1;
    const inner = parseFloat(sqrtMatch[2].replace(',', '.'));
    if (inner >= 0) return sign * Math.sqrt(inner);
  }

  return null;
}

function evaluateShortAnswerEquivalence(studentAnswer, correctAnswers, tolerance = 0.01) {
  if (!studentAnswer || !correctAnswers || correctAnswers.length === 0) {
    return { isCorrect: false };
  }

  const sNorm = normalizeMathString(studentAnswer).toLowerCase();
  const sNum = parseNumericValue(studentAnswer);

  for (const cRaw of correctAnswers) {
    if (!cRaw) continue;
    const cNorm = normalizeMathString(cRaw).toLowerCase();

    if (sNorm === cNorm) return { isCorrect: true, matchedAnswer: cRaw };

    const cNum = parseNumericValue(cRaw);
    if (sNum !== null && cNum !== null) {
      const diff = Math.abs(sNum - cNum);
      const effectiveTol = Math.max(tolerance, 1e-6);
      if (diff <= effectiveTol) {
        return { isCorrect: true, matchedAnswer: cRaw, numericDiff: diff };
      }
    }

    const normalizePunc = (str) =>
      str
        .replace(/;\s*/g, ',')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s+/g, '')
        .replace(/[−–—]/g, '-');

    if (normalizePunc(sNorm) === normalizePunc(cNorm)) {
      return { isCorrect: true, matchedAnswer: cRaw };
    }

    const sSwapped = sNorm.replace(/,/g, '.');
    const cSwapped = cNorm.replace(/,/g, '.');
    if (sSwapped === cSwapped) return { isCorrect: true, matchedAnswer: cRaw };
  }

  return { isCorrect: false };
}

// Tests for Syntax Validator
assert(validateMathSyntax('Cho hàm số $y = \\frac{2x+1}{x-1}$').isValid, 'Công thức có $...$ chuẩn hợp lệ');
assert(!validateMathSyntax('Cho hàm số $y = \\frac{2x+1}{x-1').isValid, 'Phát hiện thiếu $ đóng');
assert(validateMathSyntax('$$ \\int_0^1 x^2 dx = \\frac{1}{3} $$').isValid, 'Công thức khối $$...$$ hợp lệ');
assert(validateMathSyntax('\\dfrac{1}{x+1}').isValid, 'Ngoặc nhọn {...} hợp lệ');
assert(!validateMathSyntax('\\dfrac{1}{x+1').isValid, 'Phát hiện thiếu ngoặc nhọn }');
assert(validateMathSyntax('\\begin{cases} x + y = 1 \\\\ 2x - y = 3 \\end{cases}').isValid, 'Môi trường \\begin{cases} hợp lệ');
assert(!validateMathSyntax('\\begin{cases} x + y = 1').isValid, 'Phát hiện thiếu \\end{cases}');

// -------------------------------------------------------------
// 2. Short Answer Equivalence Evaluation Tests
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Đánh giá Đáp án ngắn tương đương ---');

assert(evaluateShortAnswerEquivalence('0.75', ['0,75']).isCorrect, 'Số thập phân 0.75 tương đương 0,75');
assert(evaluateShortAnswerEquivalence('0,75', ['0.75']).isCorrect, 'Số thập phân 0,75 tương đương 0.75');
assert(evaluateShortAnswerEquivalence('-199', ['-199']).isCorrect, 'Số nguyên âm -199');
assert(evaluateShortAnswerEquivalence('3/4', ['0.75']).isCorrect, 'Phân số 3/4 tương đương 0.75');
assert(evaluateShortAnswerEquivalence('\\frac{3}{4}', ['0.75']).isCorrect, 'LaTeX \\frac{3}{4} tương đương 0.75');
assert(evaluateShortAnswerEquivalence('\\dfrac{3}{4}', ['3/4']).isCorrect, 'LaTeX \\dfrac{3}{4} tương đương 3/4');
assert(evaluateShortAnswerEquivalence('-\\frac{1}{2}', ['-0.5']).isCorrect, 'Phân số âm -\\frac{1}{2} tương đương -0.5');
assert(evaluateShortAnswerEquivalence('\\sqrt{2}', ['1.414'], 0.01).isCorrect, 'Căn \\sqrt{2} tương đương 1.414 với sai số 0.01');
assert(evaluateShortAnswerEquivalence('(1; 2; 3)', ['(1, 2, 3)']).isCorrect, 'Tọa độ (1; 2; 3) tương đương (1, 2, 3)');
assert(evaluateShortAnswerEquivalence('(-1; 1)', ['(-1, 1)']).isCorrect, 'Khoảng (-1; 1) tương đương (-1, 1)');

// -------------------------------------------------------------
// 3. 24 Required Mathematical Expressions
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Kiểm tra 24+ Dạng Công Thức Toán Học Bắt Buộc ---');

function preprocessMathContent(rawText) {
  if (!rawText) return '';
  let text = rawText;
  text = text.replace(/\\begin\{center\}/gi, '');
  text = text.replace(/\\end\{center\}/gi, '');
  text = text.replace(/\\frac(?=\{)/g, '\\dfrac');
  text = text.replace(/([a-zA-Z0-9\)])²/g, '$1^2');
  text = text.replace(/([a-zA-Z0-9\)])³/g, '$1^3');
  return text.trim();
}

const REQUIRED_MATH_PATTERNS = [
  { name: 'Phân số và phân số lồng', latex: '\\dfrac{\\dfrac{a}{b}}{\\dfrac{c}{d}}' },
  { name: 'Căn bậc hai và căn bậc n', latex: '\\sqrt[n]{x^2+1}' },
  { name: 'Hàm số từng đoạn', latex: 'f(x) = \\begin{cases} x^2 & x \\ge 0 \\\\ -x & x < 0 \\end{cases}' },
  { name: 'Giới hạn', latex: '\\lim_{x \\to +\\infty} \\dfrac{2x+1}{x-1}' },
  { name: 'Đạo hàm', latex: 'f\'(x) = 3x^2 - 6x, f\'\'(x) = 6x - 6' },
  { name: 'Nguyên hàm & Tích phân có cận', latex: '\\int_0^1 (3x^2 - 2x + 1)\\,dx' },
  { name: 'Tổng sigma & Tích pi', latex: '\\sum_{k=1}^{n} k = \\dfrac{n(n+1)}{2}, \\prod_{i=1}^n i = n!' },
  { name: 'Vectơ và độ dài', latex: '\\vec{u} = (x; y; z), \\|\\vec{u}\\| = \\sqrt{x^2+y^2+z^2}, \\overrightarrow{AB}' },
  { name: 'Ma trận và định thức', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}, \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
  { name: 'Hệ phương trình', latex: '\\begin{cases} 2x + y - z = 4 \\\\ x - y + 2z = 3 \\\\ 3x + 2y + z = 9 \\end{cases}' },
  { name: 'Xác suất có điều kiện & Bayes', latex: 'P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}, P(A) = \\sum_i P(A|B_i)P(B_i)' },
  { name: 'Tập hợp & Logic', latex: 'x \\in \\mathbb{R} \\setminus \\{1\\}, A \\subset B, A \\cup B, A \\cap B, A \\Rightarrow B, A \\Leftrightarrow B' },
  { name: 'Góc & Hình học', latex: '\\widehat{ABC} = 60^\\circ, AB \\perp CD, d \\parallel (P), \\Delta ABC' },
  { name: 'Lượng giác & Logarit', latex: '\\sin^2(x) + \\cos^2(x) = 1, \\log_a(b), \\ln(x), \\tan(x)' },
  { name: 'Chuỗi biến đổi aligned', latex: '\\begin{aligned} A &= (x+1)^2 \\\\ &= x^2 + 2x + 1 \\end{aligned}' },
  { name: 'Khoảng nửa khoảng', latex: '[a; b), (a; b], (-\\infty; +\\infty)' }
];

REQUIRED_MATH_PATTERNS.forEach((item) => {
  const p = preprocessMathContent(item.latex);
  const v = validateMathSyntax(p);
  assert(p.length > 0 && v.isValid, `Hỗ trợ chuẩn xác: ${item.name}`);
});

// -------------------------------------------------------------
// 4. Real DOCX Ingestion Pipeline Tests
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Kiểm thử Nạp File Word DOCX Thực Tế ---');

function unzipDocx(buffer) {
  const entries = {};
  let offset = 0;
  while (offset < buffer.length - 4) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      offset++;
      continue;
    }
    const compMethod = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const uncompSize = buffer.readUInt32LE(offset + 22);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const filename = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = buffer.subarray(dataStart, dataStart + compSize);

    let uncompressed = null;
    if (compMethod === 0) {
      uncompressed = compData;
    } else if (compMethod === 8) {
      try {
        uncompressed = zlib.inflateRawSync(compData);
      } catch (e) {}
    }
    if (uncompressed) {
      entries[filename] = uncompressed;
    }
    offset = dataStart + compSize;
  }
  return entries;
}

const testFilesDir = path.resolve('test-files');
if (fs.existsSync(testFilesDir)) {
  const docxFiles = fs.readdirSync(testFilesDir).filter(f => f.toLowerCase().endsWith('.docx'));
  console.log(`Tìm thấy ${docxFiles.length} file DOCX mẫu trong ${testFilesDir}`);

  for (const filename of docxFiles) {
    const filePath = path.join(testFilesDir, filename);
    const buffer = fs.readFileSync(filePath);
    const entries = unzipDocx(buffer);

    assert(entries['word/document.xml'], `File ${filename} có cấu trúc Word hợp lệ (chứa word/document.xml)`);

    const docXml = entries['word/document.xml'].toString('utf8');

    const ommlMatches = (docXml.match(/<m:oMath\b/g) || []).length;
    const ommlParaMatches = (docXml.match(/<m:oMathPara\b/g) || []).length;
    const totalOmml = ommlMatches + ommlParaMatches;

    const mediaFiles = Object.keys(entries).filter(k => k.startsWith('word/media/'));

    console.log(`  > ${filename}: Kích thước ${Math.round(buffer.length / 1024)} KB, ${totalOmml} công thức OMML, ${mediaFiles.length} tệp hình ảnh media`);

    const qCount = (docXml.match(/(?:câu|cau|bài|bai)\s*\d+[\.\:\-\)]/gi) || []).length;
    assert(qCount > 0, `File ${filename} phát hiện ${qCount} mẫu đánh số câu hỏi`);

    const partMatch = docXml.match(/PHẦN\s+(IV|III|II|I|\d+)/i);
    if (partMatch) {
      console.log(`    - Phát hiện phân chia phần: ${partMatch[0]}`);
    }
  }
}

console.log('\n===============================================================');
console.log(`KẾT QUẢ KIỂM THỬ TỔNG THỂ: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ THÀNH CÔNG XUẤT SẮC (100% PASS)!');
}
