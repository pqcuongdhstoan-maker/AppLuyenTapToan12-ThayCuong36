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
