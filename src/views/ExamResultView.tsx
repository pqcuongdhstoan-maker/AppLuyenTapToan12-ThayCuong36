import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Attempt, Exam, QuestionType, Question } from '../types';
import { storageService } from '../services/storageService';
import { MathRenderer } from '../components/math/MathRenderer';
import { AiLearningDoctor } from '../components/ai/AiLearningDoctor';
import { exportExamToDocx } from '../services/docxExporter';
import { geminiService } from '../services/geminiService';
import { FileDown, Printer } from 'lucide-react';

interface ExamResultViewProps {
  attempt: Attempt;
  onRetake: () => void;
  onBackToLessons: () => void;
  onViewAllResults: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  onRetake,
  onBackToLessons,
  onViewAllResults
}) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [aiExplanationMap, setAiExplanationMap] = useState<{ [qId: string]: string }>({});
  const [aiLoadingMap, setAiLoadingMap] = useState<{ [qId: string]: boolean }>({});
  const [expandedSolutions, setExpandedSolutions] = useState<{ [qId: string]: boolean }>({});

  useEffect(() => {
    const loadedExam = storageService.getExamById(attempt.examId);
    if (loadedExam) {
      setExam(loadedExam);
    }

    // Trigger confetti if score is high (>= 7.5)
    if ((attempt.score || 0) >= 7.5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [attempt]);

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleAskAiExplanation = async (q: Question) => {
    setAiLoadingMap((prev) => ({ ...prev, [q.id]: true }));
    const systemInstruction = `Bạn là Trợ lý AI Khảo thí môn Toán 12 Trường THPT Đức Hòa (GV. Phan Quốc Cường).
Học sinh đã thi xong và muốn xem giải thích chi tiết.
Hãy giải thích đầy đủ các bước giải, chỉ ra công thức áp dụng, mẹo làm bài nhanh, và phân tích tại sao các phương án khác lại sai.
MỌI CÔNG THỨC TOÁN PHẢI ĐỊNH DẠNG LATEX kẹp giữa $...$ hoặc $$...$$.`;

    const prompt = `Câu hỏi: ${q.content}
${q.options ? `Các phương án: ${q.options.map(o => `${o.id}. ${o.content}`).join(' | ')}` : ''}
Đáp án đúng: ${q.correctOption || 'Xem lời giải'}
Lời giải chuẩn: ${q.solution || ''}

Yêu cầu: Hãy giải thích chi tiết, cặn kẽ và trực quan cho học sinh hiểu sâu bản chất câu hỏi này.`;

    try {
      const response = await geminiService.generateContent(prompt, systemInstruction);
      if (response.success && response.text) {
        setAiExplanationMap((prev) => ({ ...prev, [q.id]: response.text! }));
      } else {
        setAiExplanationMap((prev) => ({
          ...prev,
          [q.id]: response.error || 'Chưa thể kết nối AI. Vui lòng nhấn nút "Lấy API key" trên thanh điều hướng để cài đặt khóa cá nhân.'
        }));
      }
    } catch (e: any) {
      setAiExplanationMap((prev) => ({ ...prev, [q.id]: `Lỗi AI: ${e.message || 'Lỗi mạng'}` }));
    } finally {
      setAiLoadingMap((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const questions = exam?.questions || [];
  const score = attempt.score ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Result Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          KẾT QUẢ BÀI LUYỆN TẬP TOÁN THPT
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
          {attempt.lessonTitle}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Học sinh: <strong>{attempt.studentName}</strong> (Lớp {attempt.className}) • Thời gian làm bài: {Math.round((attempt.timeSpentSeconds || 0) / 60)} phút
        </p>

        {/* Big Score Display */}
        <div className="inline-flex items-baseline gap-2 px-8 py-4 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-100/80 mb-6">
          <span className="text-5xl sm:text-6xl font-black text-indigo-700">
            {score.toFixed(2)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-slate-400">/ 10 điểm</span>
        </div>

        {/* 4-Part Sub-score breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phần I: TN 4 Lựa chọn</span>
            <strong className="text-indigo-700 text-sm">{attempt.part1Score ?? 0} đ</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phần II: Đúng / Sai</span>
            <strong className="text-indigo-700 text-sm">{attempt.part2Score ?? 0} đ</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phần III: Trả lời ngắn</span>
            <strong className="text-indigo-700 text-sm">{attempt.part3Score ?? 0} đ</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phần IV: Tự luận</span>
            <strong className="text-indigo-700 text-sm">
              {attempt.part4Status === 'PENDING_GRADING' ? (
                <span className="text-orange-500 text-xs font-semibold">Chờ GV chấm</span>
              ) : (
                `${attempt.part4Score ?? 0} đ`
              )}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRetake}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            LÀM LẠI BÀI THI
          </button>
          
          {exam && (
            <button
              onClick={() => exportExamToDocx(exam)}
              className="py-2.5 px-5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              TẢI ĐỀ THI & LỜI GIẢI (.DOC)
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            IN BẢNG ĐIỂM
          </button>

          <button
            onClick={onBackToLessons}
            className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            DANH SÁCH BÀI HỌC
          </button>
        </div>
      </div>

      {/* AI LEARNING DOCTOR (Chẩn đoán lỗi sai & Bài tập bù đắp) */}
      <AiLearningDoctor attempt={attempt} examQuestions={questions} />

      {/* Detailed Question Review List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" />
          <span>CHI TIẾT BÀI LÀM & LỜI GIẢI TOÁN 12</span>
        </h3>

        {questions.map((q, idx) => {
          const userAns = attempt.answers[q.id];
          const isSolutionOpen = expandedSolutions[q.id];
          const aiExp = aiExplanationMap[q.id];
          const isAiLoading = aiLoadingMap[q.id];

          let isCorrect = false;
          if (q.part === 1) {
            isCorrect = userAns?.selectedOption === q.correctOption;
          } else if (q.part === 3 && q.shortAnswerConfig) {
            const userVal = userAns?.shortAnswer?.trim().toLowerCase().replace(/\s+/g, '');
            isCorrect = q.shortAnswerConfig.correctAnswers.some(ans => {
              const norm = ans.trim().toLowerCase().replace(/\s+/g, '');
              return norm === userVal;
            });
          }

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-800">
                    CÂU {q.questionNumber}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {q.part === 1 && 'Trắc nghiệm 4 lựa chọn'}
                    {q.part === 2 && 'Trắc nghiệm Đúng / Sai'}
                    {q.part === 3 && 'Trả lời ngắn'}
                    {q.part === 4 && 'Tự luận'}
                  </span>
                </div>

                {/* Question Result indicator */}
                {q.part === 1 && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+{q.points}đ)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Sai (0đ)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Content */}
              <div className="text-sm text-slate-900 leading-relaxed">
                <MathRenderer content={q.content} />
              </div>

              {/* User Answer vs Correct Answer Display */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                {q.part === 1 && (
                  <>
                    <div className="text-slate-700">
                      Đáp án bạn chọn: <strong>{userAns?.selectedOption || '(Chưa chọn)'}</strong>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      Đáp án đúng: <strong>{q.correctOption}</strong>
                    </div>
                  </>
                )}

                {q.part === 2 && q.trueFalseItems && (
                  <div className="space-y-1">
                    <div className="font-bold text-slate-700 mb-1">Kết quả từng ý:</div>
                    {q.trueFalseItems.map(item => {
                      const userChoice = userAns?.trueFalseAnswers?.[item.id];
                      const itemCorrect = userChoice === item.correctAnswer;
                      return (
                        <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-700">Ý {item.id}): <strong>{item.correctAnswer ? 'ĐÚNG' : 'SAI'}</strong></span>
                          <span className={itemCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600'}>
                            Bạn chọn: {userChoice !== undefined ? (userChoice ? 'ĐÚNG' : 'SAI') : 'Chưa chọn'} ({itemCorrect ? '✓' : '✕'})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.part === 3 && (
                  <>
                    <div className="text-slate-700">
                      Kết quả của bạn: <strong>{userAns?.shortAnswer || '(Chưa nhập)'}</strong>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      Đáp án chuẩn: <strong>{q.shortAnswerConfig?.correctAnswers.join(' hoặc ')}</strong>
                    </div>
                  </>
                )}

                {q.part === 4 && (
                  <div className="space-y-2">
                    <div className="text-slate-700">
                      <strong>Bài làm của học sinh:</strong>
                      <p className="mt-1 p-2 bg-white rounded border border-slate-200">{userAns?.essayText || '(Chưa trình bày)'}</p>
                    </div>
                    {attempt.essayGrading?.[q.id] && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                        <div className="font-bold">Nhận xét của Giáo viên ({attempt.essayGrading[q.id].gradedBy}):</div>
                        <div>Điểm: <strong>{attempt.essayGrading[q.id].points} / {q.points} đ</strong></div>
                        <div>Góp ý: {attempt.essayGrading[q.id].feedback}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Solution Toggle & AI Explanation Action */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => toggleSolution(q.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{isSolutionOpen ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                </button>

                <button
                  onClick={() => handleAskAiExplanation(q)}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAiLoading ? 'AI đang phân tích...' : '✨ Hỏi AI giải thích'}</span>
                </button>
              </div>

              {/* Step-by-step Official LaTeX Solution */}
              {isSolutionOpen && q.solution && (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-slate-800 leading-relaxed animate-in fade-in">
                  <div className="font-extrabold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>LỜI GIẢI CHI TIẾT CHUẨN:</span>
                  </div>
                  <MathRenderer content={q.solution} />
                </div>
              )}

              {/* AI Explanation Box */}
              {aiExp && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 leading-relaxed animate-in fade-in">
                  <div className="font-extrabold text-purple-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>HƯỚNG DẪN TƯ DUY TỪ TRỢ LÝ AI:</span>
                  </div>
                  <MathRenderer content={aiExp} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamResultView;
