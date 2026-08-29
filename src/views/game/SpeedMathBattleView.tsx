import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Award,
  Zap,
  RotateCcw,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  Play,
  Share2,
  ShieldAlert
} from 'lucide-react';
import { User, Question } from '../../types';
import { storageService } from '../../services/storageService';
import { MathRenderer } from '../../components/math/MathRenderer';

interface SpeedMathBattleViewProps {
  currentUser: User;
  onBackToLessons: () => void;
}

export const SpeedMathBattleView: React.FC<SpeedMathBattleViewProps> = ({
  currentUser,
  onBackToLessons
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Pool of fast recognition questions extracted from exams
  const allExams = storageService.getExams();
  const speedQuestions: Question[] = allExams.flatMap(e => e.questions.filter(q => q.part === 1));

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const handleStartGame = () => {
    const shuffled = [...speedQuestions].sort(() => 0.5 - Math.random());
    setShuffledQuestions(shuffled);
    setCurrentQIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleAnswer = (selectedOptionId: string) => {
    const currentQ = shuffledQuestions[currentQIndex];
    if (!currentQ) return;

    const isCorrect = selectedOptionId === (currentQ.correctOption || 'A');

    if (isCorrect) {
      const addedPoints = 100 + combo * 20;
      setScore(s => s + addedPoints);
      setCombo(c => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setFeedback('correct');
    } else {
      setCombo(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQIndex(idx => (idx + 1) % (shuffledQuestions.length || 1));
    }, 350);
  };

  const currentQ = shuffledQuestions[currentQIndex];

  // Badges calculation
  const badges = [
    { title: 'Chiến thần Tốc độ', unlocked: score >= 1000, desc: 'Đạt trên 1.000 điểm trong 60s' },
    { title: 'Combo Bất Bại', unlocked: maxCombo >= 5, desc: 'Đạt chuỗi đúng 5 câu liên tiếp' },
    { title: 'Bậc thầy Khảo sát', unlocked: score >= 500, desc: 'Vượt mốc 500 điểm phản xạ' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-100">
            <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>ĐẤU TRƯỜNG TOÁN HỌC 12 • PHẢN XẠ NHANH</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black">
            Thử Thách Tốc Độ 60 Giây
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
            Rèn luyện phản xạ tính nhanh công thức Đạo hàm, Tích phân và Hình Oxyz với chuỗi combo điểm thưởng!
          </p>
        </div>

        <button
          onClick={onBackToLessons}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Quay lại Luyện tập
        </button>
      </div>

      {/* --- IDLE STATE --- */}
      {gameState === 'idle' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-900">Luật Chơi Đấu Trường 60s</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có <strong>60 giây</strong> để giải quyết tối đa các câu hỏi trắc nghiệm Toán 12. Mỗi câu đúng cộng 100 điểm kèm điểm nhân chuỗi Combo liên tiếp!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700">
              ⚡ 60 Giây Đếm Ngược
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700">
              🔥 Combo x2, x3 Điểm
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700">
              🏅 Mở Khóa Danh Hiệu
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="py-4 px-10 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BẮT ĐẦU ĐẤU TRƯỜNG NGAY</span>
          </button>
        </div>
      )}

      {/* --- PLAYING STATE --- */}
      {gameState === 'playing' && currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Thời gian còn lại</span>
                <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Combo Multiplier */}
            {combo > 1 && (
              <div className="px-4 py-1.5 bg-linear-to-r from-amber-500 to-orange-600 text-white font-black text-xs rounded-full shadow-xs animate-bounce flex items-center gap-1">
                <Flame className="w-4 h-4 fill-white" />
                <span>COMBO x{combo}! (+{combo * 20}đ)</span>
              </div>
            )}

            {/* Live Score */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Điểm số</span>
              <span className="text-2xl font-black text-indigo-600">{score}</span>
            </div>
          </div>

          {/* Question Box */}
          <div className={`p-6 rounded-3xl border transition-all ${
            feedback === 'correct'
              ? 'bg-emerald-50 border-emerald-300'
              : feedback === 'wrong'
              ? 'bg-rose-50 border-rose-300'
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
              Câu hỏi #{currentQIndex + 1}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              <MathRenderer content={currentQ.content} />
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(currentQ.options || []).map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                className="p-4 bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-500 rounded-2xl text-left text-sm font-semibold text-slate-800 transition-all flex items-start gap-3 shadow-xs active:scale-98"
              >
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black shrink-0">
                  {opt.id}
                </span>
                <span className="pt-0.5">
                  <MathRenderer content={opt.content} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- GAMEOVER STATE --- */}
      {gameState === 'gameover' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400">Hết giờ! Kết quả Đấu trường</span>
            <h3 className="text-3xl font-black text-slate-900">{score} ĐIỂM</h3>
            <p className="text-xs text-slate-500">Chuỗi combo dài nhất: <strong>{maxCombo} câu liên tiếp</strong></p>
          </div>

          {/* Badges Earned */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 max-w-md mx-auto">
            <h4 className="text-xs font-bold uppercase text-slate-700">Huy hiệu thành tích:</h4>
            <div className="grid grid-cols-1 gap-2 text-left">
              {badges.map((b, i) => (
                <div key={i} className={`p-2.5 rounded-xl border flex items-center gap-3 text-xs ${
                  b.unlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                }`}>
                  <Award className={`w-5 h-5 ${b.unlocked ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <div>{b.title} {b.unlocked && '✨'}</div>
                    <div className="text-[10px] font-normal">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CHƠI LẠI</span>
            </button>
            <button
              onClick={onBackToLessons}
              className="py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Về Danh Sách Bài Học
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedMathBattleView;
