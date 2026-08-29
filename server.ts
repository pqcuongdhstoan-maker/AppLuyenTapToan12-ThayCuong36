import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize GoogleGenAI client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not set yet. AI features will respond with a friendly configuration notice.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Luyện tập Toán 12 - KNTT',
    teacher: 'GV. Phan Quốc Cường',
    timestamp: new Date().toISOString()
  });
});

// Gemini AI for Teacher (Generate questions, alternate values, error analysis, essay rubric advice)
app.post('/api/gemini/teacher-assist', async (req, res) => {
  try {
    const { action, topic, difficulty, questionData, essayContent, studentErrorData } = req.body;
    const ai = getAiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        message: 'Chưa cấu hình GEMINI_API_KEY trong Settings > Secrets. Vui lòng thêm khóa để kích hoạt AI.',
        result: null
      });
    }

    let prompt = '';
    const systemInstruction = `Bạn là Chuyên gia Khảo thí và Giáo viên Toán 12 xuất sắc của Trường THPT Đức Hòa, theo đúng Chương trình GDPT 2018 bộ sách Kết nối tri thức với cuộc sống.
Mọi công thức toán học bạn xuất ra PHẢI được định dạng chuẩn LaTeX kẹp giữa dấu $...$ (nội dòng) hoặc $$...$$ (khối). Trả về câu trả lời bằng tiếng Việt sư phạm, chính xác tuyệt đối, mạch lạc, dễ hiểu.`;

    if (action === 'GENERATE_QUESTIONS') {
      prompt = `Hãy tạo 3 câu hỏi Toán 12 về chuyên đề "${topic || 'Khảo sát hàm số và đạo hàm'}" với mức độ ${difficulty || 'THÔNG HIỂU'}.
Gồm:
- 1 câu Trắc nghiệm nhiều lựa chọn 4 phương án A, B, C, D có đáp án đúng và lời giải chi tiết.
- 1 câu Trắc nghiệm Đúng/Sai gồm 4 ý a), b), c), d) có lời giải chi tiết cho từng ý.
- 1 câu Trả lời ngắn có kết quả số cụ thể và lời giải.`;
    } else if (action === 'GENERATE_SIMILAR') {
      prompt = `Cho câu hỏi gốc sau đây:\n${JSON.stringify(questionData)}\nHãy tạo một câu hỏi TƯƠNG TỰ (đổi số liệu hoặc thay đổi hàm số nhưng cùng dạng toán và phương pháp giải), kèm đáp án đúng và lời giải chi tiết chuẩn LaTeX.`;
    } else if (action === 'ANALYZE_QUESTION_ERRORS') {
      prompt = `Phân tích câu hỏi sau đây để xem có lỗi sai đề, đáp án mâu thuẫn hay công thức bất thường không:\n${JSON.stringify(questionData)}\nHãy đưa ra nhận xét chi tiết và đề xuất phương án chuẩn hóa.`;
    } else if (action === 'ASSIST_ESSAY_GRADING') {
      prompt = `Đề bài và barem tự luận:\n${JSON.stringify(questionData)}\n\nBài làm của học sinh:\n${essayContent}\n\nHãy gợi ý điểm số (trên thang điểm ${questionData?.points || 1.5}) và nhận xét chi tiết, chỉ ra các bước đúng, bước thiếu hoặc sai sót của học sinh.`;
    } else if (action === 'GENERATE_FULL_EXAM_JSON') {
      const { lessonTitle, chapterTitle, mcqCount = 10, tfCount = 2, saCount = 3, essayCount = 1, difficultyLevel = 'THONG_HIEU' } = req.body;
      prompt = `Bạn là Chuyên gia Khảo thí môn Toán 12 theo Chương trình GDPT 2018 bộ sách Kết nối tri thức với cuộc sống.
Hãy tạo một bộ đề thi hoàn chỉnh cho bài học: "${lessonTitle || 'Khảo sát hàm số'}" (thuộc chương "${chapterTitle || 'Ứng dụng đạo hàm'}").
Mức độ đề: ${difficultyLevel}.
Yêu cầu số lượng câu:
- Phần I (MULTIPLE_CHOICE): ${mcqCount} câu trắc nghiệm 4 lựa chọn A, B, C, D (0.25đ/câu).
- Phần II (TRUE_FALSE): ${tfCount} câu trắc nghiệm Đúng/Sai, mỗi câu có 4 ý a, b, c, d (1.0đ/câu).
- Phần III (SHORT_ANSWER): ${saCount} câu trả lời ngắn (0.5đ/câu, kết quả là số hoặc phân số).
- Phần IV (ESSAY): ${essayCount} câu tự luận toán thực tế hoặc vận dụng kèm barem điểm (1.5đ/câu).

MỌI CÔNG THỨC TOÁN BẮT BUỘC ĐƯỢC ĐỊNH DẠNG CHUẨN LATEX kẹp giữa dấu $...$ (nội dòng) hoặc $$...$$ (khối).
Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ (không thêm bất kỳ văn bản giải thích nào ngoài khối JSON), theo đúng cấu trúc:
{
  "title": "Luyện tập: ${lessonTitle}",
  "questions": [
    {
      "id": "ai_q_1_1",
      "part": 1,
      "questionNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "difficulty": "THONG_HIEU",
      "points": 0.25,
      "content": "Nội dung câu hỏi chứa LaTeX $f(x)$...",
      "options": [
        {"id": "A", "content": "Phương án A $...$"},
        {"id": "B", "content": "Phương án B $...$"},
        {"id": "C", "content": "Phương án C $...$"},
        {"id": "D", "content": "Phương án D $...$"}
      ],
      "correctOption": "A",
      "solution": "Lời giải chi tiết $...$"
    },
    {
      "id": "ai_q_2_1",
      "part": 2,
      "questionNumber": 2,
      "type": "TRUE_FALSE",
      "difficulty": "THONG_HIEU",
      "points": 1.0,
      "content": "Cho hàm số $...$",
      "trueFalseItems": [
        {"id": "a", "content": "Mệnh đề a $...$", "correctAnswer": true, "explanation": "Giải thích $...$"},
        {"id": "b", "content": "Mệnh đề b $...$", "correctAnswer": false, "explanation": "Giải thích $...$"},
        {"id": "c", "content": "Mệnh đề c $...$", "correctAnswer": true, "explanation": "Giải thích $...$"},
        {"id": "d", "content": "Mệnh đề d $...$", "correctAnswer": false, "explanation": "Giải thích $...$"}
      ],
      "solution": "Lời giải chi tiết $...$"
    },
    {
      "id": "ai_q_3_1",
      "part": 3,
      "questionNumber": 3,
      "type": "SHORT_ANSWER",
      "difficulty": "VAN_DUNG",
      "points": 0.5,
      "content": "Nội dung câu hỏi trả lời ngắn $...$",
      "shortAnswerConfig": {
        "correctAnswers": ["3", "3.0", "3,0"]
      },
      "solution": "Lời giải chi tiết $...$"
    },
    {
      "id": "ai_q_4_1",
      "part": 4,
      "questionNumber": 4,
      "type": "ESSAY",
      "difficulty": "VAN_DUNG",
      "points": 1.5,
      "content": "Nội dung bài toán tự luận thực tế...",
      "essayGuide": "Barem điểm...",
      "solution": "Lời giải chi tiết..."
    }
  ]
}`;
    } else {
      prompt = req.body.prompt || 'Hãy phân tích kiến thức Toán 12 theo CT GDPT 2018.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      result: response.text
    });
  } catch (error: any) {
    console.error('Teacher Assist AI error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý yêu cầu AI từ máy chủ'
    });
  }
});

// Gemini AI for Student (Guidance, Step-by-step hint, Math concepts, Post-submission solution explanation)
app.post('/api/gemini/student-hint', async (req, res) => {
  try {
    const { questionContent, questionType, studentQuestion, allowRevealAnswer } = req.body;
    const ai = getAiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        message: 'Chưa cấu hình GEMINI_API_KEY trong Settings > Secrets.',
        result: null
      });
    }

    let constraintInstruction = '';
    if (!allowRevealAnswer) {
      constraintInstruction = `QUY TẮC QUAN TRỌNG: Học sinh đang trong phòng làm bài/kiểm tra. Tuyệt đối KHÔNG ĐƯỢC tiết lộ đáp án trực tiếp (không nói A/B/C/D, không đưa số kết quả cuối cùng). Chỉ được nhắc lại kiến thức trọng tâm, gợi ý công thức liên quan và hướng dẫn phương pháp giải từng bước để học sinh tự tính toán.`;
    } else {
      constraintInstruction = `Học sinh đã hoàn thành bài thi. Bạn có thể giải thích chi tiết toàn bộ các bước giải, đáp án đúng và phân tích tại sao các phương án khác sai.`;
    }

    const systemInstruction = `Bạn là Trợ lý AI Học tập môn Toán 12 của Trường THPT Đức Hòa (phụ trách bởi GV. Phan Quốc Cường).
${constraintInstruction}
Mọi công thức toán học PHẢI viết chuẩn LaTeX ($...$ hoặc $$...$$). Phong cách ân cần, khuyến khích học sinh tư duy.`;

    const prompt = `Câu hỏi toán:\n${questionContent}\n\nThắc mắc của học sinh: "${studentQuestion || 'Hãy hướng dẫn em phương pháp giải câu này'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });

    res.json({
      success: true,
      result: response.text
    });
  } catch (error: any) {
    console.error('Student Hint AI error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý yêu cầu trợ lý AI'
    });
  }
});

// Google Sheets Sync Webhook Proxy (Real synchronization to user Google Apps Script / Sheets)
app.post('/api/sync/google-sheets', async (req, res) => {
  try {
    const { sheetWebhookUrl, syncPayload } = req.body;

    if (!sheetWebhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu Google Apps Script Webhook URL. Vui lòng cấu hình trong Quản trị hệ thống.'
      });
    }

    // Forward payload to Google Sheets webhook
    const response = await fetch(sheetWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncPayload)
    });

    const responseData = await response.text();

    res.json({
      success: true,
      message: 'Đã gửi dữ liệu đồng bộ thành công đến Google Sheets!',
      sheetResponse: responseData
    });
  } catch (error: any) {
    console.error('Google Sheets Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể kết nối đến Google Sheets Webhook'
    });
  }
});

// Google Sheets Online Database Class List Fetch & Parse Proxy
app.post('/api/sync/google-sheet-classes', async (req, res) => {
  try {
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu URL Google Sheet danh sách lớp học.'
      });
    }

    let fetchUrl = sheetUrl.trim();

    // Check if it's a standard Google Sheets sharing URL and convert to CSV export format
    const match = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      // Check if there is a specific gid
      const gidMatch = fetchUrl.match(/[#&?]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
      fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
    }

    console.log(`[GoogleSheetSync] Fetching online class list from: ${fetchUrl}`);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/csv, application/json, text/plain, */*'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Google Sheets trả về lỗi HTTP ${response.status} (${response.statusText}). Hãy chắc chắn link Google Sheets đã bật chia sẻ 'Bất kỳ ai có liên kết' (Anyone with link can view).`);
    }

    const contentType = response.headers.get('content-type') || '';
    const textData = await response.text();

    // 1. Check if response is JSON (e.g. from Google Apps Script Web App)
    if (contentType.includes('application/json') || textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(textData);
        let classList: any[] = [];
        if (Array.isArray(jsonData)) {
          classList = jsonData;
        } else if (Array.isArray(jsonData.classes)) {
          classList = jsonData.classes;
        } else if (Array.isArray(jsonData.data)) {
          classList = jsonData.data;
        }

        const normalizedClasses = classList.map((item: any, idx: number) => {
          const name = (item.name || item.className || item.tenLop || item.lop || `Lớp ${idx + 1}`).trim();
          const id = (item.id || item.code || item.maLop || name).trim();
          const gradeMatch = name.match(/\d+/);
          const grade = Number(item.grade || item.khoi || (gradeMatch ? parseInt(gradeMatch[0], 10) : 12));
          const studentCount = Number(item.studentCount || item.count || item.siSo || item.soHocSinh || 40);

          return {
            id,
            name,
            grade: grade >= 10 && grade <= 12 ? grade : 12,
            studentCount: studentCount > 0 ? studentCount : 40,
            syncedFromSheet: true,
            lastSyncedAt: new Date().toISOString()
          };
        });

        return res.json({
          success: true,
          classes: normalizedClasses,
          sourceType: 'JSON_APPS_SCRIPT',
          count: normalizedClasses.length,
          message: `Đồng bộ thành công ${normalizedClasses.length} lớp học từ Google Apps Script!`
        });
      } catch (jsonErr) {
        console.warn('Could not parse as JSON, proceeding with CSV parser...', jsonErr);
      }
    }

    // 2. Parse CSV format
    const lines = textData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bảng tính Google Sheet trống hoặc không có dòng dữ liệu nào.'
      });
    }

    // Parse CSV line handling quotes
    const parseCsvRow = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(c => c.replace(/^["']|["']$/g, '').trim());
    };

    const header = parseCsvRow(lines[0]).map(h => h.toLowerCase());

    const isStudentRoster = header.some(h =>
      h.includes('họ và tên') || h.includes('hoten') || h.includes('học sinh') || h.includes('student')
    );

    const classColIdx = header.findIndex(h =>
      h === 'lớp' || h === 'lop' || h.includes('tên lớp') || h.includes('tenlop') || h === 'class' || h.includes('classname')
    );
    const gradeColIdx = header.findIndex(h =>
      h === 'khối' || h === 'khoi' || h === 'grade' || h.includes('khối lớp')
    );
    const countColIdx = header.findIndex(h =>
      h.includes('sĩ số') || h.includes('siso') || h.includes('số học sinh') || h.includes('count') || h.includes('studentcount')
    );
    const idColIdx = header.findIndex(h =>
      h === 'mã lớp' || h === 'malop' || h === 'id' || h === 'classid'
    );

    const classMap = new Map<string, any>();
    let studentsFound = 0;

    if (isStudentRoster && classColIdx !== -1) {
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvRow(lines[i]);
        const className = row[classColIdx]?.trim();
        if (!className) continue;

        studentsFound++;
        const gradeMatch = className.match(/\d+/);
        const grade = gradeMatch ? parseInt(gradeMatch[0], 10) : 12;

        if (classMap.has(className)) {
          const item = classMap.get(className);
          item.studentCount += 1;
        } else {
          classMap.set(className, {
            id: className,
            name: className,
            grade: grade >= 10 && grade <= 12 ? grade : 12,
            studentCount: 1,
            syncedFromSheet: true,
            lastSyncedAt: new Date().toISOString()
          });
        }
      }
    } else {
      const effectiveClassIdx = classColIdx !== -1 ? classColIdx : (idColIdx !== -1 ? idColIdx : 0);

      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvRow(lines[i]);
        const name = row[effectiveClassIdx]?.trim();
        if (!name) continue;

        const id = idColIdx !== -1 && row[idColIdx] ? row[idColIdx].trim() : name;
        const gradeVal = gradeColIdx !== -1 ? parseInt(row[gradeColIdx], 10) : NaN;
        const gradeMatch = name.match(/\d+/);
        const grade = !isNaN(gradeVal) ? gradeVal : (gradeMatch ? parseInt(gradeMatch[0], 10) : 12);

        const countVal = countColIdx !== -1 ? parseInt(row[countColIdx], 10) : NaN;
        const studentCount = !isNaN(countVal) && countVal > 0 ? countVal : 40;

        classMap.set(id, {
          id,
          name,
          grade: grade >= 10 && grade <= 12 ? grade : 12,
          studentCount,
          syncedFromSheet: true,
          lastSyncedAt: new Date().toISOString()
        });
      }
    }

    const classesArray = Array.from(classMap.values());

    if (classesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không phân tích được danh sách lớp từ bảng tính Google Sheet. Vui lòng kiểm tra tiêu đề cột.'
      });
    }

    res.json({
      success: true,
      classes: classesArray,
      sourceType: isStudentRoster ? 'STUDENT_ROSTER_CSV' : 'CLASS_LIST_CSV',
      count: classesArray.length,
      studentsCount: studentsFound > 0 ? studentsFound : undefined,
      message: `Đồng bộ thành công ${classesArray.length} lớp học từ Google Sheets!`
    });
  } catch (error: any) {
    console.error('Google Sheets Class Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể đồng bộ danh sách lớp từ Google Sheets'
    });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hệ thống Luyện tập Toán 12 - KNTT đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
