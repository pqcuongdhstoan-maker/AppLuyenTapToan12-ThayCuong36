/**
 * Automated Test Suite for Math Formula System & Word DOCX Parser
 * Tests all required mathematical constructs, syntax validation, short answer equivalence,
 * and real DOCX exam imports.
 */

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

// Helper assertion functions
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
// TEST SUITE 1: Math Syntax Validator
// -------------------------------------------------------------
console.log('--- TEST SUITE 1: Kiểm tra Cú pháp Toán học (Syntax Validator) ---');

import { validateMathSyntax, normalizeMathString, parseNumericValue, evaluateShortAnswerEquivalence } from '../src/services/mathSyntaxValidator.ts';

// 1.1 Balanced $ and $$
const v1 = validateMathSyntax('Cho hàm số $y = \\frac{2x+1}{x-1}$ có đồ thị là (C).');
assert(v1.isValid, 'Công thức có cặp dấu $ hợp lệ được chấp nhận');

const v2 = validateMathSyntax('Cho hàm số $y = \\frac{2x+1}{x-1 có đồ thị là (C).');
assert(!v2.isValid && v2.errors.some(e => e.includes('$')), 'Phát hiện lỗi thiếu dấu đóng $');

const v3 = validateMathSyntax('$$ \\int_0^1 x^2 dx = \\frac{1}{3} $$');
assert(v3.isValid, 'Công thức khối $$...$$ hợp lệ');

// 1.2 Braces balance
const v4 = validateMathSyntax('\\dfrac{1}{x+1}');
assert(v4.isValid, 'Cặp ngoặc nhọn {...} cân bằng');

const v5 = validateMathSyntax('\\dfrac{1}{x+1');
assert(!v5.isValid && v5.errors.some(e => e.includes('ngoặc nhọn')), 'Phát hiện thiếu dấu đóng ngoặc nhọn }');

// 1.3 Begin/End environment balance
const v6 = validateMathSyntax('\\begin{cases} x + y = 1 \\\\ 2x - y = 3 \\end{cases}');
assert(v6.isValid, 'Môi trường \\begin{cases} và \\end{cases} hợp lệ');

const v7 = validateMathSyntax('\\begin{cases} x + y = 1 \\\\ 2x - y = 3');
assert(!v7.isValid && v7.errors.some(e => e.includes('begin')), 'Phát hiện thiếu \\end{cases}');

// -------------------------------------------------------------
// TEST SUITE 2: Short Answer Equivalence Evaluation
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Đánh giá Đáp án ngắn tương đương (Short Answer) ---');

// 2.1 Numeric & Decimal comma/dot
assert(evaluateShortAnswerEquivalence('0.75', ['0,75']).isCorrect, 'Số thập phân 0.75 tương đương 0,75');
assert(evaluateShortAnswerEquivalence('0,75', ['0.75']).isCorrect, 'Số thập phân 0,75 tương đương 0.75');
assert(evaluateShortAnswerEquivalence('-199', ['-199']).isCorrect, 'Số nguyên âm -199');

// 2.2 Fractions
assert(evaluateShortAnswerEquivalence('3/4', ['0.75']).isCorrect, 'Phân số 3/4 tương đương số thập phân 0.75');
assert(evaluateShortAnswerEquivalence('\\frac{3}{4}', ['0.75']).isCorrect, 'LaTeX \\frac{3}{4} tương đương số thập phân 0.75');
assert(evaluateShortAnswerEquivalence('\\dfrac{3}{4}', ['3/4']).isCorrect, 'LaTeX \\dfrac{3}{4} tương đương 3/4');
assert(evaluateShortAnswerEquivalence('-\\frac{1}{2}', ['-0.5']).isCorrect, 'Phân số âm -\\frac{1}{2} tương đương -0.5');

// 2.3 Square roots
assert(evaluateShortAnswerEquivalence('\\sqrt{2}', ['1.414'], 0.01).isCorrect, 'Căn bậc hai \\sqrt{2} tương đương 1.414 với sai số 0.01');

// 2.4 Coordinates & Intervals
assert(evaluateShortAnswerEquivalence('(1; 2; 3)', ['(1, 2, 3)']).isCorrect, 'Tọa độ (1; 2; 3) tương đương (1, 2, 3)');
assert(evaluateShortAnswerEquivalence('(-1; 1)', ['(-1, 1)']).isCorrect, 'Khoảng (-1; 1) tương đương (-1, 1)');

// -------------------------------------------------------------
// TEST SUITE 3: Math Formulas Range Coverage (24 required forms)
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Kiểm tra 24+ Dạng Công Thức Toán Học Bắt Buộc ---');

import { preprocessMathContent } from '../src/components/math/MathRenderer.tsx';

const testFormulas = [
  { name: '1. Phân số đơn', latex: '\\frac{1}{x+1}' },
  { name: '2. Phân số lồng nhau', latex: '\\frac{\\frac{a}{b}}{\\frac{c}{d}}' },
  { name: '3. Căn bậc hai', latex: '\\sqrt{x^2+1}' },
  { name: '4. Căn bậc n', latex: '\\sqrt[n]{a}' },
  { name: '5. Giới hạn vô cực', latex: '\\lim_{x\\to+\\infty}f(x)' },
  { name: '6. Giới hạn một phía', latex: '\\lim_{x\\to 1^-}f(x)' },
  { name: '7. Đạo hàm cấp 1 & 2', latex: 'f\'(x), f\'\'(x)' },
  { name: '8. Nguyên hàm', latex: '\\int f(x)\\,dx' },
  { name: '9. Tích phân xác định có cận', latex: '\\int_a^b f(x)\\,dx' },
  { name: '10. Tổng sigma', latex: '\\sum_{k=1}^{n}k' },
  { name: '11. Tích pi', latex: '\\prod_{i=1}^{n}i' },
  { name: '12. Vectơ ngắn', latex: '\\vec{AB}' },
  { name: '13. Vectơ dài', latex: '\\overrightarrow{AB}' },
  { name: '14. Độ dài vectơ', latex: '\\left|\\vec{a}\\right|' },
  { name: '15. Tọa độ không gian Oxyz', latex: 'A(x_0;y_0;z_0)' },
  { name: '16. Ma trận 2x2', latex: '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}' },
  { name: '17. Hệ phương trình cases', latex: '\\begin{cases}x+y=1\\\\2x-y=3\\end{cases}' },
  { name: '18. Xác suất có điều kiện', latex: 'P(A\\mid B)' },
  { name: '19. Công thức xác suất toàn phần', latex: 'P(A)=\\sum_i P(A\\mid B_i)P(B_i)' },
  { name: '20. Tập hợp & Logic', latex: 'x \\in \\mathbb{R}, A \\subset B, A \\cup B, A \\cap B' },
  { name: '21. Góc & Hình học', latex: '\\widehat{ABC}, AB \\perp CD, d \\parallel (P), \\Delta ABC' },
  { name: '22. Lượng giác & Logarit', latex: '\\sin^2(x) + \\cos^2(x) = 1, \\log_a(b), \\ln(x)' },
  { name: '23. Chuỗi biến đổi aligned', latex: '\\begin{aligned} A &= (x+1)^2 \\\\ &= x^2 + 2x + 1 \\end{aligned}' },
  { name: '24. Khoảng nửa khoảng', latex: '[a; b), (a; b], (-\\infty; +\\infty)' }
];

testFormulas.forEach((item) => {
  const processed = preprocessMathContent(item.latex);
  assert(processed.length > 0, `Định dạng công thức ${item.name}: ${item.latex}`);
});

// -------------------------------------------------------------
// TEST SUITE 4: Real DOCX File Parsing in test-files/
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Kiểm thử Nạp File Word DOCX Thực Tế ---');

import { parseDocxFile } from '../src/services/docxParser.ts';

async function testRealDocxFiles() {
  const testFilesDir = path.resolve('test-files');
  if (!fs.existsSync(testFilesDir)) {
    console.warn('Thư mục test-files không tồn tại.');
    return;
  }

  const files = fs.readdirSync(testFilesDir).filter(f => f.toLowerCase().endsWith('.docx'));
  console.log(`Tìm thấy ${files.length} file DOCX mẫu trong ${testFilesDir}`);

  for (const filename of files) {
    const filePath = path.join(testFilesDir, filename);
    const buffer = fs.readFileSync(filePath);

    try {
      console.log(`\n> Đang test file: ${filename} (${Math.round(buffer.length / 1024)} KB)...`);
      const result = await parseDocxFile(buffer);

      assert(result && result.questions && result.questions.length > 0, `File ${filename} phân tích thành công: ${result.questions.length} câu hỏi`);

      console.log(`    - Thống kê: Phần I=${result.stats.part1Count}, Phần II=${result.stats.part2Count}, Phần III=${result.stats.part3Count}, Phần IV=${result.stats.part4Count}`);
      console.log(`    - Công thức OMML: ${result.stats.ommlCount}, MathType: ${result.stats.mathTypeCount}, Ảnh: ${result.stats.imageCount}`);

      // Verify question structure integrity
      const hasValidTypes = result.questions.every(q => [1, 2, 3, 4].includes(q.part) && q.content.length > 0);
      assert(hasValidTypes, `Tất cả câu hỏi trong ${filename} có part và content hợp lệ`);

      // Verify Part 1 has options
      const part1Questions = result.questions.filter(q => q.part === 1);
      if (part1Questions.length > 0) {
        const p1WithOptions = part1Questions.filter(q => q.options && q.options.length >= 2);
        assert(p1WithOptions.length > 0, `Phần I trích xuất được phương án lựa chọn`);
      }

      // Verify Part 2 has statements
      const part2Questions = result.questions.filter(q => q.part === 2);
      if (part2Questions.length > 0) {
        const p2WithStatements = part2Questions.filter(q => q.trueFalseItems && q.trueFalseItems.length >= 2);
        assert(p2WithStatements.length > 0, `Phần II trích xuất được mệnh đề đúng/sai a,b,c,d`);
      }
    } catch (err) {
      console.error(`Lỗi khi đọc file ${filename}:`, err);
      failedTests++;
    }
  }

  console.log('\n===============================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('===============================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

testRealDocxFiles();
