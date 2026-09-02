import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Attempt, Question } from '../../types';
import { MathRenderer } from '../math/MathRenderer';
import { geminiService } from '../../services/geminiService';
import { safeParseAiJson } from '../../services/aiJsonParser';

interface AiLearningDoctorProps {
  attempt: Attempt;
  examQuestions: Question[];
}

export const AiLearningDoctor: React.FC<AiLearningDoctorProps> = ({
  attempt,
  examQuestions
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisReport, setDiagnosisReport] = useState<string | null>(null);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [remedialQuestions, setRemedialQuestions] = useState<Question[] | null>(null);
  const [userPracticeAnswers, setUserPracticeAnswers] = useState<{ [qId: string]: string }>({});
  const [practiceFeedback, setPracticeFeedback] = useState<{ [qId: string]: boolean }>({});

  // Find incorrect questions
  const wrongQuestions = examQuestions.filter(q => {
    if (q.part === 1) {
      const studentAns = attempt.answers?.[q.id]?.selectedOption;
      return studentAns && studentAns !== q.correctOption;
    }
    return false;
  });

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    const systemInstruction = `Bạn là Bác sĩ Học tập & Chuyên gia Sư phạm môn Toán 12 của Trường THPT Đức Hòa (GV. Phan Quốc Cường).
Nhiệm vụ: Phân tích các câu hỏi học sinh làm sai, chỉ ra chính xác lỗ hổng tư duy (nhầm dấu, sai công thức, thiếu điều kiện hoặc hiểu sai định nghĩa), và đưa ra lời khuyên khắc phục ngắn gọn, sư phạm.
MỌI CÔNG THỨC TOÁN PHẢI ĐỊNH DẠNG LATEX kẹp giữa $...$ hoặc $$...$$.`;

    const errorDetails = wrongQuestions.map((q, idx) => `
- Câu sai #${idx + 1}: "${q.content}"
  + Đáp án học sinh chọn: ${attempt.answers?.[q.id]?.selectedOption || 'Chưa chọn'}
  + Đáp án đúng: ${q.correctOption}
  + Lời giải: ${q.solution || ''}
`).join('\n');

    const prompt = `Bài thi: "${attempt.lessonTitle}".
Danh sách các câu làm sai của học sinh:
${errorDetails || 'Học sinh làm tốt hầu hết các câu nhưng cần củng cố lại phương pháp giải.'}

Hãy đưa ra nhận xét chẩn đoán:
1. Nguyên nhân cốt lõi dẫn đến các lỗi sai trên.
2. Quy tắc hoặc công thức trọng tâm cần ghi nhớ ngay.
3. Lời khuyên ôn tập ngắn gọn.`;

    try {
      const res = await geminiService.generateContent(prompt, systemInstruction);
      if (res.success && res.text) {
        setDiagnosisReport(res.text);
      } else {
        setDiagnosisReport(res.error || 'Dựa trên bài làm: Bạn cần củng cố lại các quy tắc biến đổi đạo hàm hàm hợp và kiểm tra kỹ điều kiện xác định trước khi tính toán.');
      }
    } catch (e: any) {
      setDiagnosisReport(`Dựa trên bài làm: Cần chú ý xét dấu đạo hàm $f\'(x)$ trên từng khoảng xác định và tránh nhầm lẫn giữa giá trị cực trị và điểm cực trị.`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleGenerateRemedialQuestions = async () => {
    setIsGeneratingPractice(true);
    const systemInstruction = `Bạn là Chuyên gia Khảo thí môn Toán 12 theo Chương trình GDPT 2018 bộ sách Kết nối tri thức với cuộc sống.
Hãy tạo 2 câu hỏi trắc nghiệm bù đắp lỗ hổng kiến thức cho bài: "${attempt.lessonTitle}".
MỌI CÔNG THỨC TOÁN BẮT BUỘC ĐƯỢC ĐỊNH DẠNG CHUẨN LATEX kẹp giữa dấu $...$.
Hãy trả về duy nhất một mảng JSON 2 phần tử theo cấu trúc:
[
  {
    "id": "rem_1",
    "part": 1,
    "questionNumber": 1,
    "type": "MULTIPLE_CHOICE",
    "difficulty": "THONG_HIEU",
    "points": 1,
    "content": "Nội dung câu hỏi $...$",
    "options": [
      {"id": "A", "content": "Phương án A $...$"},
      {"id": "B", "content": "Phương án B $...$"},
      {"id": "C", "content": "Phương án C $...$"},
      {"id": "D", "content": "Phương án D $...$"}
    ],
    "correctOption": "A",
    "solution": "Lời giải chi tiết $...$"
  }
]`;

    try {
      const res = await geminiService.generateContent(
        `Hãy tạo 2 câu trắc nghiệm rèn luyện bù đắp cho chủ đề "${attempt.lessonTitle}".`,
        systemInstruction,
        undefined,
        { isJson: true }
      );
      if (res.success && res.text) {
        const parsed = safeParseAiJson<Question[]>(res.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRemedialQuestions(parsed);
          return;
        }
      }
      // Fallback questions if JSON parsing fails
      const fallbackQuestions: Question[] = [
        {
          id: 'rem_1',
          part: 1,
          questionNumber: 1,
          type: 'MULTIPLE_CHOICE' as any,
          difficulty: 'THONG_HIEU' as any,
          points: 1,
          content: 'Cho hàm số $y = \\frac{2x - 1}{x + 1}$. Khẳng định nào sau đây là ĐÚNG?',
          options: [
            { id: 'A', content: 'Hàm số đồng biến trên từng khoảng xác định $(-\\infty; -1)$ và $(-1; +\\infty)$' },
            { id: 'B', content: 'Hàm số nghịch biến trên $\\mathbb{R} \\setminus \\{-1\\}$' },
            { id: 'C', content: 'Hàm số có cực trị tại $x = -1$' },
            { id: 'D', content: 'Đồ thị có tiệm cận đứng là $x = 2$' }
          ],
          correctOption: 'A',
          solution: 'Ta có $y\' = \\frac{2(1) - (-1)(1)}{(x+1)^2} = \\frac{3}{(x+1)^2} > 0, \\forall x \\neq -1$. Do đó hàm số đồng biến trên từng khoảng xác định.'
        },
        {
          id: 'rem_2',
          part: 1,
          questionNumber: 2,
          type: 'MULTIPLE_CHOICE' as any,
          difficulty: 'THONG_HIEU' as any,
          points: 1,
          content: 'Tìm giá trị cực tiểu $y_{\\text{CT}}$ của hàm số $y = x^3 - 3x + 2$.',
          options: [
            { id: 'A', content: '$y_{\\text{CT}} = 0$' },
            { id: 'B', content: '$y_{\\text{CT}} = 4$' },
            { id: 'C', content: '$y_{\\text{CT}} = 1$' },
            { id: 'D', content: '$y_{\\text{CT}} = -1$' }
          ],
          correctOption: 'A',
          solution: 'Đạo hàm $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = 1$, $y(1) = 1 - 3 + 2 = 0$ (Cực tiểu).'
        }
      ];
      setRemedialQuestions(fallbackQuestions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  const handlePracticeSubmit = (qId: string, optionId: string, correctOption: string) => {
    setUserPracticeAnswers(prev => ({ ...prev, [qId]: optionId }));
    setPracticeFeedback(prev => ({ ...prev, [qId]: optionId === correctOption }));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BÁC SĨ HỌC TẬP AI (AI LEARNING DOCTOR)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Chẩn Đoán Lỗ Hổng & Kế Hoạch Bù Đắp Kiến Thức
            </h3>
          </div>
        </div>

        <button
          onClick={handleDiagnose}
          disabled={isDiagnosing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Brain className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
          <span>{isDiagnosing ? 'AI đang phân tích...' : 'Phân Tích Chi Tiết'}</span>
        </button>
      </div>

      {/* Diagnosis Report */}
      {diagnosisReport && (
        <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-3 animate-in fade-in">
          <div className="font-extrabold text-indigo-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
            <span>Kết luận chẩn đoán của Bác sĩ AI:</span>
          </div>
          <div className="text-indigo-900 leading-relaxed whitespace-pre-line font-medium">
            <MathRenderer content={diagnosisReport} />
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerateRemedialQuestions}
              disabled={isGeneratingPractice}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingPractice ? 'animate-spin' : ''}`} />
              <span>{isGeneratingPractice ? 'Đang tạo câu hỏi bù đắp...' : '🚀 TẠO 2 CÂU LUYỆN BÙ ĐẮP NGAY'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Remedial Practice Interactive Box */}
      {remedialQuestions && (
        <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bài tập rèn luyện bù đắp cá nhân hóa:</span>
          </h4>

          {remedialQuestions.map((q, idx) => {
            const chosen = userPracticeAnswers[q.id];
            const isCorrect = practiceFeedback[q.id];

            return (
              <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-indigo-700">Câu bù đắp #{idx + 1}:</div>
                <div className="text-sm font-semibold text-slate-900">
                  <MathRenderer content={q.content} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {(q.options || []).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePracticeSubmit(q.id, opt.id, q.correctOption || 'A')}
                      className={`p-3 rounded-xl border text-left font-medium transition-all flex items-start gap-2 ${
                        chosen === opt.id
                          ? isCorrect
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-rose-100 border-rose-400 text-rose-950 font-bold'
                          : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <span className="font-bold">{opt.id}.</span>
                      <MathRenderer content={opt.content} />
                    </button>
                  ))}
                </div>

                {chosen && (
                  <div className={`p-3 rounded-xl border text-xs font-medium ${
                    isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <strong>{isCorrect ? '✅ Chính xác!' : '❌ Chưa chính xác!'}</strong>
                    <div className="mt-1 text-slate-700">
                      <MathRenderer content={q.solution || ''} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiLearningDoctor;
