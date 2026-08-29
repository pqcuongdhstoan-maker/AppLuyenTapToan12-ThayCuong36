import { Lesson, Exam } from '../types';

/**
 * Exports a beautiful PowerPoint-compatible HTML presentation package / slide deck
 * containing lecture summary, key formulas, and practice quiz questions.
 */
export function exportLessonToPptx(lesson: Lesson, exam?: Exam): void {
  const examQuestions = exam?.questions || [];
  const mcqQuestions = examQuestions.filter(q => q.part === 1).slice(0, 5);

  const pptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bài giảng: Bài ${lesson.number} - ${lesson.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .slide-deck {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      padding: 40px 20px;
    }
    .slide {
      width: 960px;
      height: 540px;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      box-sizing: border-box;
      padding: 45px 55px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
    }
    .slide::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: 0;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(255,255,255,0.15);
      padding-bottom: 12px;
    }
    .school-tag {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #a5b4fc;
      text-transform: uppercase;
    }
    .curriculum-tag {
      background: rgba(255,255,255,0.15);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .slide-title {
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      margin: 15px 0 10px 0;
    }
    .slide-body {
      flex: 1;
      font-size: 17px;
      line-height: 1.6;
      color: #e0e7ff;
    }
    .highlight-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 16px 20px;
      margin: 10px 0;
    }
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 10px;
    }
    .btn-print {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4f46e5;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
    }
    @media print {
      body { background: transparent; }
      .btn-print { display: none; }
      .slide-deck { padding: 0; gap: 0; }
      .slide { box-shadow: none; border-radius: 0; width: 100vw; height: 100vh; }
    }
  </style>
</head>
<body>

  <button class="btn-print" onclick="window.print()">🖨️ In Slide / Lưu PDF</button>

  <div class="slide-deck">

    <!-- Slide 1: Cover Title -->
    <div class="slide" style="justify-content: center; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%);">
      <div class="school-tag" style="margin-bottom: 10px;">TRƯỜNG THPT ĐỨC HÒA • TỔ TOÁN</div>
      <h1 style="font-size: 42px; font-weight: 900; margin: 0 0 15px 0; color: #fff;">
        BÀI ${lesson.number}: ${lesson.title.toUpperCase()}
      </h1>
      <div style="font-size: 20px; color: #c7d2fe; margin-bottom: 30px;">
        Chương ${lesson.chapterNumber}: ${lesson.chapterTitle} • Học kỳ ${lesson.semester}
      </div>
      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 15px; background: rgba(255,255,255,0.1); padding: 10px 25px; border-radius: 30px; margin: 0 auto;">
        <span>📚 CT GDPT 2018</span>
        <span>•</span>
        <span>GV. Phan Quốc Cường</span>
      </div>
    </div>

    <!-- Slide 2: Lesson Core Knowledge -->
    <div class="slide">
      <div class="slide-header">
        <span class="school-tag">BÀI ${lesson.number} • TỔNG QUAN KIẾN THỨC</span>
        <span class="curriculum-tag">TOÁN 12 - KNTT</span>
      </div>
      <div>
        <h2 class="slide-title">1. Trọng tâm lý thuyết & Công thức cốt lõi</h2>
      </div>
      <div class="slide-body">
        <div class="highlight-card">
          <strong style="color: #fbbf24; font-size: 18px;">💡 Mục tiêu bài học:</strong>
          <p style="margin: 6px 0 0 0;">
            - Nắm vững các khái niệm, định nghĩa và định lý cơ bản của ${lesson.title}.<br>
            - Vận dụng linh hoạt các bước giải toán theo cấu trúc 4 phần đề thi của Bộ GD&ĐT.<br>
            - Phân tích và giải quyết các bài toán liên môn và thực tiễn đời sống.
          </p>
        </div>
        <div class="highlight-card" style="margin-top: 15px; border-color: rgba(99, 102, 241, 0.4);">
          <strong style="color: #818cf8; font-size: 18px;">📌 Dạng toán tiêu biểu:</strong>
          <p style="margin: 6px 0 0 0;">
            - Dạng 1: Trắc nghiệm nhận biết và thông hiểu định lý, công thức.<br>
            - Dạng 2: Xét tính Đúng/Sai của các mệnh đề liên quan.<br>
            - Dạng 3: Tính toán đáp số thực tế (Trả lời ngắn).<br>
            - Dạng 4: Lập luận toán học và giải bài toán vận dụng cao (Tự luận).
          </p>
        </div>
      </div>
      <div class="slide-footer">
        <span>Toán 12 - Kết nối tri thức</span>
        <span>Slide 2/4</span>
      </div>
    </div>

    <!-- Slide 3: Example Question 1 -->
    ${mcqQuestions[0] ? `
    <div class="slide">
      <div class="slide-header">
        <span class="school-tag">VÍ DỤ MINH HỌA • PHẦN I</span>
        <span class="curriculum-tag">CÂU HỎI TRẮC NGHIỆM</span>
      </div>
      <div>
        <h2 class="slide-title">2. Câu hỏi ví dụ minh họa trên lớp</h2>
      </div>
      <div class="slide-body">
        <div class="highlight-card" style="font-size: 18px; color: #fff; margin-bottom: 20px;">
          <strong>Câu hỏi:</strong> ${mcqQuestions[0].content}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${(mcqQuestions[0].options || []).map(opt => `
            <div style="background: ${opt.id === mcqQuestions[0].correctOption ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${opt.id === mcqQuestions[0].correctOption ? '#10b981' : 'rgba(255,255,255,0.1)'}; padding: 12px 18px; border-radius: 12px;">
              <strong style="color: ${opt.id === mcqQuestions[0].correctOption ? '#34d399' : '#a5b4fc'};">${opt.id}.</strong> ${opt.content}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="slide-footer">
        <span>Đáp án đúng: Phương án ${mcqQuestions[0].correctOption}</span>
        <span>Slide 3/4</span>
      </div>
    </div>
    ` : ''}

    <!-- Slide 4: Summary & Homework -->
    <div class="slide" style="background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);">
      <div class="slide-header">
        <span class="school-tag">TỔNG KẾT & DẶN DÒ</span>
        <span class="curriculum-tag">THPT ĐỨC HÒA</span>
      </div>
      <div>
        <h2 class="slide-title">3. Nhiệm vụ tự học & Luyện tập</h2>
      </div>
      <div class="slide-body">
        <div class="highlight-card" style="margin-bottom: 15px;">
          <strong style="color: #38bdf8;">📝 Luyện tập trực tuyến:</strong>
          <p style="margin: 6px 0 0 0;">
            1. Đăng nhập ứng dụng <strong>Luyện tập Toán 12 - KNTT</strong> trên máy tính/điện thoại.<br>
            2. Hoàn thành đề luyện tập <strong>Bài ${lesson.number}: ${lesson.title}</strong> (Đủ 4 phần thi).<br>
            3. Theo dõi bảng điểm và xem giải thích chi tiết của Giáo viên & AI.
          </p>
        </div>
        <div class="highlight-card" style="border-color: rgba(234, 179, 8, 0.3);">
          <strong style="color: #facc15;">🌟 Chúc các em học tập và rèn luyện đạt kết quả cao nhất!</strong>
        </div>
      </div>
      <div class="slide-footer">
        <span>GV. Phan Quốc Cường • Trường THPT Đức Hòa</span>
        <span>Slide 4/4</span>
      </div>
    </div>

  </div>

</body>
</html>
`;

  const blob = new Blob(['\ufeff', pptHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bai_Giang_Slide_Bai_${lesson.number}_${lesson.title.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
