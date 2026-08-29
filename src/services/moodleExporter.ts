import { Exam, Question, Lesson, QuestionType } from '../types';

/**
 * Export questions to Moodle Aiken Format (Standard plain text format for MCQ import)
 */
export function exportToMoodleAiken(exam: Exam): void {
  const mcqQuestions = exam.questions.filter(q => q.part === 1 && q.options && q.options.length > 0);
  
  if (mcqQuestions.length === 0) {
    alert('Đề thi không có câu hỏi trắc nghiệm Phần I nào để xuất định dạng Aiken.');
    return;
  }

  let textContent = '';

  mcqQuestions.forEach((q, idx) => {
    // Question text (clean single line or multiline)
    textContent += `${q.content.replace(/\r?\n/g, ' ')}\n`;
    
    // Options
    q.options?.forEach(opt => {
      textContent += `${opt.id}. ${opt.content.replace(/\r?\n/g, ' ')}\n`;
    });

    // Correct Answer
    textContent += `ANSWER: ${q.correctOption || 'A'}\n\n`;
  });

  const blob = new Blob(['\ufeff', textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Moodle_Aiken_${exam.title.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full exam to Moodle XML Format (Supports MCQ, True/False, Short Answer, Essay with LaTeX)
 */
export function exportToMoodleXml(exam: Exam, lesson?: Lesson): void {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
  
  // Category question
  xml += `  <question type="category">\n    <category>\n      <text>$course$/Toan12/${lesson ? `Bai_${lesson.number}` : 'LuyenTap'}</text>\n    </category>\n  </question>\n\n`;

  exam.questions.forEach((q, idx) => {
    const qName = `Câu ${idx + 1} - Phần ${q.part} - ${exam.title}`;
    const safeContent = escapeXml(q.content);
    const safeSolution = escapeXml(q.solution || q.essayGuide || '');

    if (q.part === 1) {
      // Multiple Choice
      xml += `  <question type="multichoice">\n`;
      xml += `    <name><text>${qName}</text></name>\n`;
      xml += `    <questiontext format="html"><text><![CDATA[<p>${safeContent}</p>]]></text></questiontext>\n`;
      xml += `    <generalfeedback format="html"><text><![CDATA[<p><strong>Lời giải:</strong> ${safeSolution}</p>]]></text></generalfeedback>\n`;
      xml += `    <defaultgrade>${q.points || 0.25}</defaultgrade>\n`;
      xml += `    <single>true</single>\n`;
      xml += `    <shuffleanswers>true</shuffleanswers>\n`;
      xml += `    <answernumbering>abc</answernumbering>\n`;

      q.options?.forEach(opt => {
        const isCorrect = opt.id === q.correctOption;
        const fraction = isCorrect ? '100' : '0';
        xml += `    <answer fraction="${fraction}" format="html">\n`;
        xml += `      <text><![CDATA[${escapeXml(opt.content)}]]></text>\n`;
        xml += `    </answer>\n`;
      });

      xml += `  </question>\n\n`;
    } else if (q.part === 2) {
      // True / False items export as multi-subquestions or matching
      (q.trueFalseItems || []).forEach(item => {
        xml += `  <question type="truefalse">\n`;
        xml += `    <name><text>${qName} - Ý ${item.id}</text></name>\n`;
        xml += `    <questiontext format="html"><text><![CDATA[<p>${safeContent}<br><strong>Ý ${item.id}):</strong> ${escapeXml(item.content)}</p>]]></text></questiontext>\n`;
        xml += `    <generalfeedback format="html"><text><![CDATA[<p>${safeSolution}</p>]]></text></generalfeedback>\n`;
        xml += `    <defaultgrade>0.25</defaultgrade>\n`;
        xml += `    <answer fraction="${item.correctAnswer ? '100' : '0'}"><text>true</text></answer>\n`;
        xml += `    <answer fraction="${!item.correctAnswer ? '100' : '0'}"><text>false</text></answer>\n`;
        xml += `  </question>\n\n`;
      });
    } else if (q.part === 3) {
      // Short Answer
      const primaryAns = q.shortAnswerConfig?.correctAnswers?.[0] || '0';
      xml += `  <question type="shortanswer">\n`;
      xml += `    <name><text>${qName}</text></name>\n`;
      xml += `    <questiontext format="html"><text><![CDATA[<p>${safeContent}</p>]]></text></questiontext>\n`;
      xml += `    <generalfeedback format="html"><text><![CDATA[<p><strong>Lời giải:</strong> ${safeSolution}</p>]]></text></generalfeedback>\n`;
      xml += `    <defaultgrade>${q.points || 0.5}</defaultgrade>\n`;
      (q.shortAnswerConfig?.correctAnswers || [primaryAns]).forEach(ans => {
        xml += `    <answer fraction="100">\n      <text>${escapeXml(ans)}</text>\n    </answer>\n`;
      });
      xml += `  </question>\n\n`;
    } else {
      // Essay
      xml += `  <question type="essay">\n`;
      xml += `    <name><text>${qName}</text></name>\n`;
      xml += `    <questiontext format="html"><text><![CDATA[<p>${safeContent}</p>]]></text></questiontext>\n`;
      xml += `    <generalfeedback format="html"><text><![CDATA[<p><strong>Hướng dẫn chấm:</strong> ${safeSolution}</p>]]></text></generalfeedback>\n`;
      xml += `    <defaultgrade>${q.points || 1.5}</defaultgrade>\n`;
      xml += `    <responseformat>editor</responseformat>\n`;
      xml += `  </question>\n\n`;
    }
  });

  xml += `</quiz>`;

  const blob = new Blob(['\ufeff', xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Moodle_XML_${exam.title.replace(/\s+/g, '_')}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
