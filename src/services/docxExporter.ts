import { Exam, Question, Lesson } from '../types';

/**
 * Clean LaTeX formulas for Word compatibility
 */
function cleanLatexForWord(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)')
    .replace(/\\vec\{([^}]+)\}/g, 'vectơ $1')
    .replace(/\\overline\{([^}]+)\}/g, '$1')
    .replace(/\\pm/g, '±')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cap/g, '∩')
    .replace(/\\cup/g, '∪')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\to/g, '→')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\left|\\right/g, '')
    .replace(/\$/g, '');
}

/**
 * Generates an official Microsoft Word (.doc / .docx compatible HTML-MIME) document
 * with official school header, student info block, formatted 4-part exam questions,
 * and comprehensive answer key / solutions at the end.
 */
export function exportExamToDocx(exam: Exam, lesson?: Lesson): void {
  const lessonNumber = lesson?.number || 1;
  const lessonTitle = lesson?.title || exam.title;

  const part1Questions = exam.questions.filter(q => q.part === 1);
  const part2Questions = exam.questions.filter(q => q.part === 2);
  const part3Questions = exam.questions.filter(q => q.part === 3);
  const part4Questions = exam.questions.filter(q => q.part === 4);

  const docHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${exam.title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 2cm 2cm 2cm 2cm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    .header-table td {
      vertical-align: top;
      padding: 2px 4px;
    }
    .school-name {
      font-size: 11pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    .exam-title-box {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    .info-box {
      border: 1px solid #000;
      padding: 8px 12px;
      margin: 12px 0 18px 0;
      font-size: 12pt;
    }
    .section-header {
      font-weight: bold;
      font-size: 13pt;
      margin-top: 16px;
      margin-bottom: 8px;
      text-transform: uppercase;
      background-color: #f0f0f0;
      padding: 4px 8px;
      border-left: 4px solid #003366;
    }
    .question-block {
      margin-bottom: 14px;
      text-align: justify;
    }
    .question-title {
      font-weight: bold;
    }
    .options-table {
      width: 100%;
      margin-top: 4px;
      margin-bottom: 6px;
    }
    .options-table td {
      width: 50%;
      padding: 2px 8px;
    }
    .true-false-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
    }
    .true-false-table th, .true-false-table td {
      border: 1px solid #888;
      padding: 5px 8px;
      font-size: 11pt;
    }
    .true-false-table th {
      background-color: #e9ecef;
      text-align: center;
    }
    .answer-key-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .answer-key-table th, .answer-key-table td {
      border: 1px solid #000;
      padding: 6px;
      text-align: center;
      font-size: 11pt;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- School & Exam Header -->
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <div class="school-name">SỞ GD&ĐT LONG AN<br><strong>TRƯỜNG THPT ĐỨC HÒA</strong></div>
        <div style="font-size: 10pt; font-style: italic;">Tổ chuyên môn Toán học</div>
        <div style="margin-top: 2px; font-weight: bold;">MÃ ĐỀ: ${lessonNumber >= 10 ? '1' + lessonNumber : '10' + lessonNumber}</div>
      </td>
      <td style="width: 55%; text-align: center;">
        <div class="exam-title-box">
          LUYỆN TẬP TOÁN 12 - KNTT<br>
          <span style="font-size: 11pt; font-weight: normal;">BÀI ${lessonNumber}: ${lessonTitle}</span>
        </div>
        <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">
          Thời gian làm bài: ${exam.settings.timeLimitMinutes || 45} phút (không kể thời gian giao đề)
        </div>
      </td>
    </tr>
  </table>

  <!-- Student Info Form -->
  <div class="info-box">
    <table style="width: 100%;">
      <tr>
        <td style="width: 60%;">Họ và tên học sinh: ................................................................</td>
        <td style="width: 40%;">Lớp: .........................</td>
      </tr>
      <tr>
        <td>Số báo danh: ............................................................................</td>
        <td>Phòng thi: .....................</td>
      </tr>
    </table>
  </div>

  <!-- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN -->
  ${part1Questions.length > 0 ? `
    <div class="section-header">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (${part1Questions.length} câu - Mỗi câu 0,25 điểm)</div>
    <p style="font-style: italic; font-size: 11pt; margin-top: 2px;">Thí sinh trả lời từ câu 1 đến câu ${part1Questions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.</p>
    
    ${part1Questions.map((q, idx) => `
      <div class="question-block">
        <span class="question-title">Câu ${idx + 1}:</span> ${cleanLatexForWord(q.content)}
        <table class="options-table">
          <tr>
            <td><strong>A.</strong> ${cleanLatexForWord(q.options?.[0]?.content || '')}</td>
            <td><strong>B.</strong> ${cleanLatexForWord(q.options?.[1]?.content || '')}</td>
          </tr>
          <tr>
            <td><strong>C.</strong> ${cleanLatexForWord(q.options?.[2]?.content || '')}</td>
            <td><strong>D.</strong> ${cleanLatexForWord(q.options?.[3]?.content || '')}</td>
          </tr>
        </table>
      </div>
    `).join('')}
  ` : ''}

  <!-- PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI -->
  ${part2Questions.length > 0 ? `
    <div class="section-header">PHẦN II. Câu trắc nghiệm đúng sai (${part2Questions.length} câu - Mỗi câu tối đa 1,0 điểm)</div>
    <p style="font-style: italic; font-size: 11pt; margin-top: 2px;">Thí sinh trả lời từ câu 1 đến câu ${part2Questions.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.</p>
    
    ${part2Questions.map((q, idx) => `
      <div class="question-block">
        <span class="question-title">Câu ${idx + 1}:</span> ${cleanLatexForWord(q.content)}
        <table class="true-false-table">
          <thead>
            <tr>
              <th style="width: 80%;">Mệnh đề</th>
              <th style="width: 10%;">Đúng</th>
              <th style="width: 10%;">Sai</th>
            </tr>
          </thead>
          <tbody>
            ${(q.trueFalseItems || []).map(item => `
              <tr>
                <td><strong>${item.id})</strong> ${cleanLatexForWord(item.content)}</td>
                <td></td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('')}
  ` : ''}

  <!-- PHẦN III: CÂU TRẢ LỜI NGẮN -->
  ${part3Questions.length > 0 ? `
    <div class="section-header">PHẦN III. Câu trắc nghiệm trả lời ngắn (${part3Questions.length} câu - Mỗi câu 0,5 điểm)</div>
    <p style="font-style: italic; font-size: 11pt; margin-top: 2px;">Thí sinh trả lời từ câu 1 đến câu ${part3Questions.length}. Điền kết quả số vào ô tương ứng.</p>
    
    ${part3Questions.map((q, idx) => `
      <div class="question-block">
        <span class="question-title">Câu ${idx + 1}:</span> ${cleanLatexForWord(q.content)}
        <div style="margin-top: 4px; font-style: italic; color: #444;">Đáp số: ................................................................</div>
      </div>
    `).join('')}
  ` : ''}

  <!-- PHẦN IV: TỰ LUẬN -->
  ${part4Questions.length > 0 ? `
    <div class="section-header">PHẦN IV. Câu hỏi tự luận (${part4Questions.length} câu - 1,5 điểm)</div>
    <p style="font-style: italic; font-size: 11pt; margin-top: 2px;">Thí sinh trình bày chi tiết các bước biến đổi và giải thích vào giấy làm bài.</p>
    
    ${part4Questions.map((q, idx) => `
      <div class="question-block">
        <span class="question-title">Câu ${idx + 1}:</span> ${cleanLatexForWord(q.content)}
      </div>
    `).join('')}
  ` : ''}

  <div style="text-align: center; margin-top: 30px; font-weight: bold;">
    ---------- HẾT ----------<br>
    <span style="font-size: 10pt; font-weight: normal; font-style: italic;">(Cán bộ coi thi không giải thích gì thêm)</span>
  </div>

  <!-- PAGE BREAK FOR ANSWER KEY & SOLUTIONS -->
  <div class="page-break"></div>

  <table class="header-table">
    <tr>
      <td style="text-align: center;">
        <div class="school-name">SỞ GD&ĐT LONG AN - TRƯỜNG THPT ĐỨC HÒA</div>
        <div class="exam-title-box" style="margin-top: 5px;">HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT</div>
        <div style="font-style: italic;">Đề luyện tập: ${lessonTitle}</div>
      </td>
    </tr>
  </table>

  <div class="section-header">BẢNG ĐÁP ÁN TỔNG HỢP</div>

  <!-- BẢNG ĐÁP ÁN PHẦN I -->
  ${part1Questions.length > 0 ? `
    <p><strong>1. Đáp án Phần I (Trắc nghiệm 4 lựa chọn):</strong></p>
    <table class="answer-key-table">
      <tr>
        ${part1Questions.map((_, idx) => `<th>Câu ${idx + 1}</th>`).join('')}
      </tr>
      <tr>
        ${part1Questions.map(q => `<td style="font-weight: bold; color: #003366;">${q.correctOption || 'A'}</td>`).join('')}
      </tr>
    </table>
  ` : ''}

  <!-- LỜI GIẢI CHI TIẾT -->
  <div class="section-header" style="margin-top: 25px;">LỜI GIẢI CHI TIẾT CÁC CÂU HỎI</div>

  ${exam.questions.map((q, idx) => `
    <div style="margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
      <div><strong>Câu ${idx + 1} (Phần ${q.part}):</strong> ${cleanLatexForWord(q.content)}</div>
      <div style="margin-top: 5px; color: #003366; background-color: #f8f9fa; padding: 6px 10px; border-left: 3px solid #28a745;">
        <strong>Lời giải / Barem:</strong><br>
        ${cleanLatexForWord(q.solution || q.essayGuide || 'Học sinh áp dụng đúng công thức và giải ra kết quả chính xác.')}
      </div>
    </div>
  `).join('')}

</body>
</html>
`;

  // Create Blob with Word MIME type and trigger instant download
  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `De_Thi_Toan12_Bai_${lessonNumber}_${exam.title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads the official Standard Word (.docx/.doc) Template
 * for teachers to write 4-part Math exams with MathType/Equation.
 */
export function downloadSampleWordTemplate(): void {
  const sampleDocHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Mẫu Soạn Đề Thi Toán 12 - Thầy Phan Quốc Cường</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 2cm 2cm 2cm 2cm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 13pt;
      line-height: 1.4;
      color: #000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .header-table td {
      vertical-align: top;
      padding: 4px;
    }
    .school-name {
      font-size: 11pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    .exam-title {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin-top: 5px;
      color: #003366;
    }
    .guide-box {
      border: 2px dashed #0066cc;
      background-color: #f0f7ff;
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 6px;
      font-size: 11.5pt;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      text-transform: uppercase;
      background-color: #e6f0fa;
      padding: 6px 10px;
      border-left: 5px solid #0055aa;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .question-box {
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px dotted #bbb;
    }
    .question-title {
      font-weight: bold;
      color: #003366;
    }
    .options-grid {
      margin: 8px 0 6px 15px;
    }
    .solution-box {
      margin-top: 6px;
      background-color: #f9f9f9;
      padding: 6px 10px;
      border-left: 3px solid #28a745;
      font-size: 12pt;
      color: #222;
    }
    .table-bt {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      margin: 10px 0;
    }
    .table-bt th, .table-bt td {
      border: 1px solid #333;
      padding: 6px 10px;
    }
  </style>
</head>
<body>

  <!-- HEADER TRƯỜNG & TÊN ĐỀ -->
  <table class="header-table">
    <tr>
      <td style="width: 45%; text-align: center;">
        <div class="school-name">HỆ THỐNG TỰ LUYỆN TOÁN 12</div>
        <div style="font-size: 11pt; font-weight: bold;">GV: PHAN QUỐC CƯỜNG</div>
        <div style="border-top: 1px solid #000; width: 60%; margin: 3px auto;"></div>
      </td>
      <td style="width: 55%; text-align: center;">
        <div class="school-name">ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN 12</div>
        <div style="font-size: 11pt; font-style: italic;">Thời gian làm bài: 45 phút (không kể phát đề)</div>
        <div style="border-top: 1px solid #000; width: 60%; margin: 3px auto;"></div>
      </td>
    </tr>
  </table>

  <div class="exam-title">MẪU SOẠN ĐỀ THI TOÁN 12 CHUẨN MATHTYPE (4 PHẦN)</div>
  <div style="text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 15px;">(Thầy/Cô chỉ cần chỉnh sửa nội dung trong file này và tải lên hệ thống)</div>

  <!-- KHUNG HƯỚNG DẪN CHO GIÁO VIÊN -->
  <div class="guide-box">
    <strong style="color: #004488; font-size: 12pt;">📌 HƯỚNG DẪN SOẠN ĐỀ BẰNG MATHTYPE / EQUATION:</strong>
    <ul style="margin: 5px 0 0 0; padding-left: 20px;">
      <li><strong>Công thức Toán:</strong> Chèn bằng <em>MathType</em> hoặc <em>Insert Equation</em> của Word như bình thường, không cần gõ code.</li>
      <li><strong>Đáp án đúng Phần I:</strong> Thêm dòng <em>"Lời giải: ... Chọn A"</em> hoặc gạch chân <u>A.</u></li>
      <li><strong>Phần II (Đúng/Sai):</strong> Ghi chữ <em>(Đúng)</em> hoặc <em>(Sai)</em> ở cuối mỗi ý a, b, c, d.</li>
      <li><strong>Phần III (Trả lời ngắn):</strong> Ghi dòng <em>"Đáp án: [số]"</em> bên dưới câu hỏi.</li>
      <li><strong>Hình vẽ / Đồ thị:</strong> Copy và Paste ảnh trực tiếp vào vị trí câu hỏi trong Word.</li>
    </ul>
  </div>

  <!-- PHẦN I -->
  <div class="section-title">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu 2)</div>

  <div class="question-box">
    <span class="question-title">Câu 1:</span> Cho hàm số y = (x^2 + 3)/(x - 1). Giá trị lớn nhất của hàm số trên đoạn [2; 4] là:
    <div class="options-grid">
      <strong>A.</strong> 7 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>B.</strong> 19/3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>C.</strong> 4 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>D.</strong> 5
    </div>
    <div class="solution-box">
      <strong>Lời giải:</strong> Ta có đạo hàm y' = (x^2 - 2x - 3)/(x - 1)^2 = 0 <=> x = 3 (thỏa mãn đoạn [2; 4]). Tính y(2) = 7, y(3) = 6, y(4) = 19/3. Vậy giá trị lớn nhất là 7. <strong>Chọn A.</strong>
    </div>
  </div>

  <div class="question-box">
    <span class="question-title">Câu 2:</span> Cho hàm số y = f(x) có bảng biến thiên như sau:
    <table class="table-bt">
      <tr style="background-color: #f2f2f2;">
        <th style="width: 15%;">x</th>
        <th>-∞</th>
        <th>-1</th>
        <th>0</th>
        <th>1</th>
        <th>+∞</th>
      </tr>
      <tr>
        <td><strong>y'</strong></td>
        <td>+</td>
        <td>0</td>
        <td>-</td>
        <td>0</td>
        <td>+</td>
      </tr>
      <tr>
        <td><strong>y</strong></td>
        <td>-∞ ↗ 5</td>
        <td>5 ↘ -2</td>
        <td>-2</td>
        <td>-2 ↗ +∞</td>
        <td>+∞</td>
      </tr>
    </table>
    Hàm số đã cho đồng biến trên khoảng nào dưới đây?
    <div class="options-grid">
      <strong>A.</strong> (-1; 1) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>B.</strong> (-∞; -1) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>C.</strong> (0; 1) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <strong>D.</strong> (-1; 0)
    </div>
    <div class="solution-box">
      <strong>Lời giải:</strong> Dựa vào bảng biến thiên, y' > 0 trên các khoảng (-∞; -1) và (1; +∞). <strong>Chọn B.</strong>
    </div>
  </div>

  <!-- PHẦN II -->
  <div class="section-title">PHẦN II. Câu trắc nghiệm Đúng / Sai (Trong mỗi ý a, b, c, d, chọn Đúng hoặc Sai)</div>

  <div class="question-box">
    <span class="question-title">Câu 3:</span> Cho hàm số bậc ba y = f(x) = x^3 - 3x^2 + 2 có đồ thị là (C). Xét tính đúng/sai của các mệnh đề sau:
    <div style="margin: 8px 0 8px 15px;">
      a) Đạo hàm của hàm số là y' = 3x^2 - 6x. <strong>(Đúng)</strong><br>
      b) Hàm số đồng biến trên khoảng (2; +∞). <strong>(Đúng)</strong><br>
      c) Giá trị cực tiểu của hàm số bằng 2. <strong>(Sai)</strong><br>
      d) Điểm cực đại của đồ thị hàm số là (0; 2). <strong>(Đúng)</strong>
    </div>
    <div class="solution-box">
      <strong>Lời giải:</strong> Ta có y' = 3x^2 - 6x = 0 <=> x = 0 hoặc x = 2. Giá trị cực tiểu là y(2) = -2 (mệnh đề c sai).
    </div>
  </div>

  <!-- PHẦN III -->
  <div class="section-title">PHẦN III. Câu trắc nghiệm Trả lời ngắn (Thí sinh điền kết quả dạng số)</div>

  <div class="question-box">
    <span class="question-title">Câu 4:</span> Tìm số điểm cực trị của đồ thị hàm số y = x^4 - 2x^2 + 2026.
    <div class="solution-box">
      <strong>Đáp án: 3</strong><br>
      <strong>Lời giải:</strong> Ta có y' = 4x^3 - 4x = 4x(x^2 - 1) = 0 có 3 nghiệm phân biệt x = 0, x = 1, x = -1. Do đó đồ thị hàm số có 3 điểm cực trị.
    </div>
  </div>

  <!-- PHẦN IV -->
  <div class="section-title">PHẦN IV. Câu hỏi Tự luận (Vận dụng toán thực tế)</div>

  <div class="question-box">
    <span class="question-title">Câu 5:</span> Một công ty sản xuất x thiết bị điện tử với tổng chi phí trung bình cho mỗi thiết bị là C(x) = x + 3600/x (nghìn đồng), với x > 0. Hỏi công ty cần sản xuất bao nhiêu thiết bị để chi phí trung bình trên mỗi thiết bị là nhỏ nhất?
    <div class="solution-box">
      <strong>Lời giải:</strong><br>
      - Xét hàm số C(x) = x + 3600/x trên (0; +∞).<br>
      - Đạo hàm: C'(x) = 1 - 3600/x^2.<br>
      - Cho C'(x) = 0 <=> x^2 = 3600 <=> x = 60 (do x > 0).<br>
      - Lập bảng biến thiên ta thấy C(x) đạt giá trị nhỏ nhất tại x = 60 thiết bị, khi đó chi phí nhỏ nhất là 120 nghìn đồng.
    </div>
  </div>

  <div style="text-align: center; margin-top: 30px; font-weight: bold;">
    ---------- HẾT ----------
  </div>

</body>
</html>
`;

  const blob = new Blob(['\ufeff', sampleDocHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mau_Soan_De_Thi_Toan12_Thpt_ThayCuong.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
