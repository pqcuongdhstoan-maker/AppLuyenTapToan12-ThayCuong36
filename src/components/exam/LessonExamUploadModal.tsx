import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Code,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Copy,
  Check,
  Play,
  Clock,
  Layers,
  ChevronRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { Lesson, Exam, Question, QuestionType, DifficultyLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { parseDocxFile, DocxParsedExam } from '../../services/docxParser';
import { geminiService } from '../../services/geminiService';

interface LessonExamUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onPreviewParsed: (parsed: DocxParsedExam, lesson: Lesson) => void;
}

export const LessonExamUploadModal: React.FC<LessonExamUploadModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onPreviewParsed
}) => {
  const [activeTab, setActiveTab] = useState<'word' | 'json' | 'ai'>('word');
  
  // Word state
  const [isProcessingWord, setIsProcessingWord] = useState(false);
  const [wordDragActive, setWordDragActive] = useState(false);
  const [wordError, setWordError] = useState<string | null>(null);

  // JSON state
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // AI state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>(DifficultyLevel.THONG_HIEU);
  const [aiMcqCount, setAiMcqCount] = useState<number>(10);
  const [aiTfCount, setAiTfCount] = useState<number>(2);
  const [aiSaCount, setAiSaCount] = useState<number>(3);
  const [aiEssayCount, setAiEssayCount] = useState<number>(1);
  const [aiError, setAiError] = useState<string | null>(null);

  const wordFileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentExam = storageService.getExamByLessonId(lesson.id);

  // 1. Handle Word (.docx) Import
  const handleWordFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setWordError('Vui lòng chọn tệp định dạng Microsoft Word (.docx)');
      return;
    }

    setIsProcessingWord(true);
    setWordError(null);

    try {
      const parsed = await parseDocxFile(file);
      setIsProcessingWord(false);
      onPreviewParsed(parsed, lesson);
    } catch (e: any) {
      console.error('Parse Word error:', e);
      setWordError(`Lỗi khi đọc file Word: ${e.message || 'Cấu trúc file không tương thích'}`);
      setIsProcessingWord(false);
    }
  };

  // 2. Handle JSON Import
  const handleJsonFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      validateAndProcessJson(content);
    };
    reader.readAsText(file);
  };

  const validateAndProcessJson = (rawJson: string) => {
    setJsonError(null);
    try {
      const data = JSON.parse(rawJson);
      let questions: Question[] = [];
      let title = `Luyện tập: ${lesson.title}`;

      if (Array.isArray(data)) {
        questions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        questions = data.questions;
        if (data.title) title = data.title;
      } else {
        throw new Error('Dữ liệu JSON phải chứa mảng "questions" hoặc là mảng các câu hỏi Question[].');
      }

      if (questions.length === 0) {
        throw new Error('Mảng câu hỏi trong file JSON đang trống.');
      }

      // Standardize questions
      const standardizedQuestions = questions.map((q, idx) => ({
        ...q,
        id: q.id || `json_q_${q.part || 1}_${idx + 1}_${Date.now()}`,
        questionNumber: q.questionNumber || idx + 1,
        part: (q.part || 1) as (1 | 2 | 3 | 4),
        type: q.type || (q.part === 2 ? QuestionType.TRUE_FALSE : q.part === 3 ? QuestionType.SHORT_ANSWER : q.part === 4 ? QuestionType.ESSAY : QuestionType.MULTIPLE_CHOICE),
        points: q.points ?? (q.part === 2 ? 1.0 : q.part === 3 ? 0.5 : q.part === 4 ? 1.5 : 0.25)
      }));

      const parsed: DocxParsedExam = {
        title,
        questions: standardizedQuestions,
        rawText: rawJson,
        warnings: [],
        hasUnconfidentFormulas: false
      };

      onPreviewParsed(parsed, lesson);
    } catch (e: any) {
      setJsonError(`Lỗi định dạng JSON: ${e.message}`);
    }
  };

  // Sample JSON Template
  const sampleJsonTemplate = JSON.stringify(
    {
      title: `Luyện tập: ${lesson.title}`,
      questions: [
        {
          part: 1,
          questionNumber: 1,
          type: 'MULTIPLE_CHOICE',
          difficulty: 'THONG_HIEU',
          points: 0.25,
          content: 'Cho hàm số $y = f(x)$ có đạo hàm $f\'(x) = x^2 - 1$. Tìm các khoảng đồng biến.',
          options: [
            { id: 'A', content: '$(-\\infty; -1)$ và $(1; +\\infty)$' },
            { id: 'B', content: '$(-1; 1)$' },
            { id: 'C', content: '$(-\\infty; 1)$' },
            { id: 'D', content: '$(0; +\\infty)$' }
          ],
          correctOption: 'A',
          solution: 'Cho $f\'(x) > 0 \\Leftrightarrow x^2 - 1 > 0 \\Leftrightarrow x < -1$ hoặc $x > 1$.'
        },
        {
          part: 2,
          questionNumber: 2,
          type: 'TRUE_FALSE',
          difficulty: 'THONG_HIEU',
          points: 1.0,
          content: 'Cho hàm số $y = x^3 - 3x + 2$. Xét tính đúng/sai của các mệnh đề sau:',
          trueFalseItems: [
            { id: 'a', content: 'Hàm số đồng biến trên $(1; +\\infty)$', correctAnswer: true },
            { id: 'b', content: 'Hàm số nghịch biến trên $(-1; 1)$', correctAnswer: true },
            { id: 'c', content: 'Điểm cực đại là $M(-1; 0)$', correctAnswer: false },
            { id: 'd', content: 'Giá trị cực tiểu là $y = 0$', correctAnswer: true }
          ],
          solution: 'Đạo hàm $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.'
        },
        {
          part: 3,
          questionNumber: 3,
          type: 'SHORT_ANSWER',
          difficulty: 'VAN_DUNG',
          points: 0.5,
          content: 'Tính giá trị cực đại của hàm số $y = -x^3 + 3x + 1$.',
          shortAnswerConfig: { correctAnswers: ['3', '3.0'] },
          solution: 'Tại $x = 1$, $y_{\\text{CĐ}} = 3$.'
        },
        {
          part: 4,
          questionNumber: 4,
          type: 'ESSAY',
          difficulty: 'VAN_DUNG',
          points: 1.5,
          content: 'Một doanh nghiệp sản xuất sản phẩm với chi phí trung bình $C(x) = x + \\frac{100}{x}$. Tìm số sản phẩm $x$ để chi phí là thấp nhất.',
          essayGuide: 'Tính đạo hàm $C\'(x) = 1 - 100/x^2 = 0 \\Rightarrow x = 10$.',
          solution: 'Doanh nghiệp cần sản xuất 10 sản phẩm.'
        }
      ]
    },
    null,
    2
  );

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  // 3. Handle AI Generator
  const handleGenerateAiExam = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    const systemInstruction = `Bạn là Chuyên gia Khảo thí môn Toán 12 theo Chương trình GDPT 2018 bộ sách Kết nối tri thức với cuộc sống.
MỌI CÔNG THỨC TOÁN BẮT BUỘC ĐƯỢC ĐỊNH DẠNG CHUẨN LATEX kẹp giữa dấu $...$ (nội dòng) hoặc $$...$$ (khối).
Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ (không thêm bất kỳ văn bản giải thích nào ngoài khối JSON), theo đúng cấu trúc:
{
  "title": "Luyện tập: ${lesson.title}",
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
        "correctAnswers": ["3", "3.0"]
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

    const prompt = `Hãy tạo một bộ đề thi hoàn chỉnh cho bài học: "${lesson.title}" (thuộc chương "${lesson.chapterTitle}").
Mức độ đề: ${aiDifficulty}.
Yêu cầu số lượng câu:
- Phần I (MULTIPLE_CHOICE): ${aiMcqCount} câu trắc nghiệm 4 lựa chọn A, B, C, D (0.25đ/câu).
- Phần II (TRUE_FALSE): ${aiTfCount} câu trắc nghiệm Đúng/Sai, mỗi câu có 4 ý a, b, c, d (1.0đ/câu).
- Phần III (SHORT_ANSWER): ${aiSaCount} câu trả lời ngắn (0.5đ/câu).
- Phần IV (ESSAY): ${aiEssayCount} câu tự luận toán thực tế hoặc vận dụng kèm barem điểm (1.5đ/câu).`;

    try {
      const response = await geminiService.generateContent(prompt, systemInstruction);

      if (!response.success || !response.text) {
        throw new Error(response.error || 'Mô hình AI không phản hồi');
      }

      // Parse JSON from text
      let cleanedJson = response.text.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không thể tìm thấy định dạng JSON hợp lệ trong phản hồi AI');
      }

      const examData = JSON.parse(jsonMatch[0]);
      const parsed: DocxParsedExam = {
        title: examData.title || `Luyện tập: ${lesson.title}`,
        questions: examData.questions || [],
        rawText: jsonMatch[0],
        warnings: [],
        hasUnconfidentFormulas: false
      };

      setIsGeneratingAi(false);
      onPreviewParsed(parsed, lesson);
    } catch (err: any) {
      console.error('AI generate exam error:', err);
      setAiError(`Lỗi khi tạo đề thi bằng AI: ${err.message}`);
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-indigo-600 text-white">
                BÀI {lesson.number}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Chương {lesson.chapterNumber}: {lesson.chapterTitle}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              Nạp & Cập Nhật Đề Thi: {lesson.title}
            </h3>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              {currentExam ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  Đang có phiên bản v{currentExam.currentVersion} ({currentExam.questions.length} câu hỏi)
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                  Chưa có đề thi chính thức
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs Selection */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 grid grid-cols-3 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('word')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'word'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>1. File Word (.docx)</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'json'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Code className="w-4 h-4 text-emerald-600" />
            <span>2. Tệp / Mã JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>3. Tạo bằng AI</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* --- TAB 1: WORD .DOCX --- */}
          {activeTab === 'word' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setWordDragActive(true); }}
                onDragLeave={() => setWordDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setWordDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleWordFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => wordFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  wordDragActive
                    ? 'border-indigo-600 bg-indigo-50/60'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={wordFileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleWordFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {isProcessingWord ? (
                  <div className="py-6 space-y-3">
                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-bold text-slate-800">Đang phân tích cấu trúc Word & công thức OMML...</div>
                    <div className="text-xs text-slate-400">Tự động chuyển đổi công thức sang LaTeX $...$ và tách 4 phần đề thi</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        Kéo thả file <strong>.docx</strong> vào đây hoặc click để duyệt file
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Hệ thống tự động nhận diện Phần I (A,B,C,D), Phần II (Đúng/Sai), Phần III (Trả lời ngắn) và Phần IV (Tự luận)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {wordError && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{wordError}</span>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <strong className="text-slate-800 flex items-center gap-1">
                  <Info className="w-4 h-4 text-blue-600" />
                  Quy chuẩn đề thi file Word chuẩn GDPT 2018:
                </strong>
                <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                  <li><strong>Phần I:</strong> Tiêu đề "PHẦN I", câu hỏi "Câu 1.", 4 đáp án A, B, C, D (In đậm hoặc gạch chân đáp án đúng).</li>
                  <li><strong>Phần II:</strong> Tiêu đề "PHẦN II", các ý a), b), c), d) kèm nhãn Đúng / Sai.</li>
                  <li><strong>Phần III:</strong> Tiêu đề "PHẦN III", câu hỏi yêu cầu điền kết quả số.</li>
                  <li><strong>Phần IV:</strong> Tiêu đề "PHẦN IV", câu hỏi tự luận toán thực tế hoặc vận dụng.</li>
                </ul>
              </div>
            </div>
          )}

          {/* --- TAB 2: JSON IMPORT --- */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Nhập mã JSON câu hỏi:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTemplate ? 'Đã chép mẫu' : 'Chép mẫu JSON'}</span>
                  </button>

                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleJsonFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Tải file .json</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Dán nội dung JSON câu hỏi vào đây (hoặc click 'Chép mẫu JSON' để xem cấu trúc chuẩn)..."
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />

              {jsonError && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{jsonError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => validateAndProcessJson(jsonText)}
                disabled={!jsonText.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>KIỂM TRA & XEM TRƯỚC ĐỀ THI TỪ JSON</span>
              </button>
            </div>
          )}

          {/* --- TAB 3: AI EXAM GENERATOR --- */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-purple-900">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Tự động sinh đề thi chuẩn theo CT GDPT 2018 bằng Gemini AI</span>
                </div>
                <p className="text-purple-700 text-[11px] leading-relaxed">
                  AI sẽ xây dựng toàn bộ câu hỏi cho chuyên đề <strong>"{lesson.title}"</strong> với đầy đủ 4 dạng đề thi, công thức toán chuẩn LaTeX và lời giải chi tiết từng bước.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mức độ phân hóa đề thi:
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value={DifficultyLevel.NHAN_BIET}>Cơ bản & Nhận biết</option>
                    <option value={DifficultyLevel.THONG_HIEU}>Tiêu chuẩn (Thông hiểu)</option>
                    <option value={DifficultyLevel.VAN_DUNG}>Vận dụng thực tế</option>
                    <option value={DifficultyLevel.VAN_DUNG_CAO}>Nâng cao (Phân hóa cao)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phần I: Số câu Trắc nghiệm 4 LC:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={aiMcqCount}
                    onChange={(e) => setAiMcqCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phần II: Số câu Đúng / Sai (4 ý a,b,c,d):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={aiTfCount}
                    onChange={(e) => setAiTfCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phần III: Số câu Trả lời ngắn:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={aiSaCount}
                    onChange={(e) => setAiSaCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phần IV: Số câu Tự luận bài toán thực tế:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={aiEssayCount}
                    onChange={(e) => setAiEssayCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{aiError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateAiExam}
                disabled={isGeneratingAi}
                className="w-full py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'AI đang thiết kế & giải chi tiết đề thi...' : 'TẠO BỘ ĐỀ THI BẰNG AI NGAY'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonExamUploadModal;
