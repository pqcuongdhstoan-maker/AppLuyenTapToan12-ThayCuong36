import React, { useState } from 'react';
import {
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Layers,
  BookOpen,
  Shuffle
} from 'lucide-react';
import { MathRenderer } from '../../components/math/MathRenderer';

interface Flashcard {
  id: string;
  chapter: string;
  topic: string;
  front: string;
  back: string;
  note?: string;
}

const FORMULA_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_1',
    chapter: 'Chương 1: Ứng dụng đạo hàm',
    topic: 'Quy tắc Đạo hàm cơ bản',
    front: 'Đạo hàm của hàm hợp $y = [u(x)]^n$ và $y = \\sqrt{u(x)}$ là gì?',
    back: '$$([u(x)]^n)\' = n \\cdot [u(x)]^{n-1} \\cdot u\'(x)$$\n$$(\\sqrt{u(x)})\' = \\frac{u\'(x)}{2\\sqrt{u(x)}}$$',
    note: 'Áp dụng cho mọi $u(x) > 0$ đối với căn bậc hai.'
  },
  {
    id: 'fc_2',
    chapter: 'Chương 1: Ứng dụng đạo hàm',
    topic: 'Cực trị hàm số',
    front: 'Điều kiện đủ để $x_0$ là điểm Cực Đại của hàm số theo $f\'\'(x_0)$?',
    back: 'Nếu $\\begin{cases} f\'(x_0) = 0 \\\\ f\'\'(x_0) < 0 \\end{cases}$ thì $x_0$ là điểm CỰC ĐẠI của hàm số.',
    note: 'Nếu $f\'\'(x_0) > 0$ thì $x_0$ là điểm Cực Tiểu.'
  },
  {
    id: 'fc_3',
    chapter: 'Chương 1: Ứng dụng đạo hàm',
    topic: 'Đường Tiệm cận',
    front: 'Định nghĩa Tiệm cận xiên của đồ thị hàm số $y = f(x)$?',
    back: 'Đường thẳng $y = ax + b$ ($a \\neq 0$) là tiệm cận xiên nếu:\n$$\\lim_{x \\to +\\infty} [f(x) - (ax + b)] = 0$$ hoặc $$\\lim_{x \\to -\\infty} [f(x) - (ax + b)] = 0$$',
    note: 'Cách tìm: $a = \\lim_{x \\to \\infty} \\frac{f(x)}{x}$, $b = \\lim_{x \\to \\infty} [f(x) - ax]$.'
  },
  {
    id: 'fc_4',
    chapter: 'Chương 2: Vectơ & Không gian Oxyz',
    topic: 'Tích có hướng của 2 vectơ',
    front: 'Công thức tính tọa độ tích có hướng $[\\vec{u}, \\vec{v}]$ với $\\vec{u}(x_1, y_1, z_1), \\vec{v}(x_2, y_2, z_2)$?',
    back: '$$[\\vec{u}, \\vec{v}] = \\left( \\begin{vmatrix} y_1 & z_1 \\\\ y_2 & z_2 \\end{vmatrix}; \\begin{vmatrix} z_1 & x_1 \\\\ z_2 & x_2 \\end{vmatrix}; \\begin{vmatrix} x_1 & y_1 \\\\ x_2 & y_2 \\end{vmatrix} \\right)$$\n$$= (y_1 z_2 - y_2 z_1;\\, z_1 x_2 - z_2 x_1;\\, x_1 y_2 - x_2 y_1)$$',
    note: 'Tích có hướng vuông góc với cả $\\vec{u}$ và $\\vec{v}$.'
  },
  {
    id: 'fc_5',
    chapter: 'Chương 2: Vectơ & Không gian Oxyz',
    topic: 'Phương trình Mặt cầu',
    front: 'Phương trình mặt cầu tâm $I(a; b; c)$ bán kính $R$?',
    back: '$$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$$\nhoặc dạng khai triển: $x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0$ với $R = \\sqrt{a^2 + b^2 + c^2 - d} > 0$.',
    note: 'Tâm $I(a;b;c)$ lấy hệ số chia cho $-2$.'
  },
  {
    id: 'fc_6',
    chapter: 'Chương 4: Nguyên hàm & Tích phân',
    topic: 'Nguyên hàm từng phần',
    front: 'Công thức Nguyên hàm và Tích phân từng phần?',
    back: '$$\\int u \\, dv = u \\cdot v - \\int v \\, du$$\n$$\\int_a^b u \\, dv = (u \\cdot v)\\Big|_a^b - \\int_a^b v \\, du$$',
    note: 'Thứ tự ưu tiên đặt $u$: "Nhất log, nhì đa, tam lượng, tứ mũ".'
  },
  {
    id: 'fc_7',
    chapter: 'Chương 5: Phương pháp tọa độ Oxyz',
    topic: 'Khoảng cách từ điểm đến mặt phẳng',
    front: 'Khoảng cách từ điểm $M(x_0, y_0, z_0)$ đến mặt phẳng $(\\alpha): Ax + By + Cz + D = 0$?',
    back: '$$d(M, (\\alpha)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$',
    note: 'Tử số là giá trị tuyệt đối, mẫu số là độ dài vectơ pháp tuyến.'
  },
  {
    id: 'fc_8',
    chapter: 'Chương 6: Xác suất có điều kiện',
    topic: 'Công thức Xác suất toàn phần & Bayes',
    front: 'Công thức xác suất toàn phần và công thức Bayes?',
    back: '$$P(A) = \\sum_{i=1}^n P(B_i) \\cdot P(A|B_i)$$\n$$P(B_k|A) = \\frac{P(B_k) \\cdot P(A|B_k)}{P(A)}$$',
    note: 'Áp dụng khi $B_1, B_2, \\dots, B_n$ là một hệ đầy đủ các biến cố.'
  }
];

export const FormulaFlashcardsView: React.FC<{ onBackToLessons: () => void }> = ({ onBackToLessons }) => {
  const [cards, setCards] = useState<Flashcard[]>(FORMULA_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  const filteredCards = cards.filter(c => selectedChapter === 'all' || c.chapter.includes(selectedChapter));
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(i => (i - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleMarkMastered = (cardId: string) => {
    if (!masteredIds.includes(cardId)) {
      setMasteredIds([...masteredIds, cardId]);
    }
    handleNext();
  };

  const handleShuffle = () => {
    setCards([...cards].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-teal-700 via-emerald-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-teal-100">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>THẺ GHI NHỚ CÔNG THỨC TOÁN 12</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Flashcards Công Thức Trọng Tâm
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Phương pháp lặp lại ngắt quãng (Spaced Repetition) giúp ghi nhớ nhanh và bền vững các công thức trọng tâm.
          </p>
        </div>

        <button
          onClick={onBackToLessons}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Quay lại Luyện tập
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>Lọc theo chương:</span>
          <select
            value={selectedChapter}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="all">Tất cả các chương</option>
            <option value="Chương 1">Chương 1: Ứng dụng đạo hàm</option>
            <option value="Chương 2">Chương 2: Vectơ Oxyz</option>
            <option value="Chương 4">Chương 4: Nguyên hàm & Tích phân</option>
            <option value="Chương 6">Chương 6: Xác suất có điều kiện</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Đã thuộc: {masteredIds.length}/{cards.length} thẻ
          </span>
          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Trộn thẻ</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard View */}
      {currentCard && (
        <div className="flex flex-col items-center space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-2xl min-h-[320px] bg-white hover:bg-slate-50/60 rounded-3xl p-8 border-2 border-indigo-200 hover:border-indigo-400 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between relative group select-none"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                {currentCard.chapter}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Thẻ {currentIndex + 1} / {filteredCards.length}
              </span>
            </div>

            <div className="my-auto py-6 text-center">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                {isFlipped ? '✨ Lời Giải / Công Thức Chuẩn' : '❓ Câu Hỏi / Mệnh Đề'}
              </div>
              <div className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                <MathRenderer content={isFlipped ? currentCard.back : currentCard.front} />
              </div>
              {isFlipped && currentCard.note && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 inline-block font-medium">
                  💡 <strong>Lưu ý:</strong> {currentCard.note}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-center gap-1">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              <span>Nhấn vào thẻ để lật mặt sau</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl shadow-xs text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleMarkMastered(currentCard.id)}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ĐÃ THUỘC CÔNG THỨC</span>
            </button>

            <button
              onClick={handleNext}
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl shadow-xs text-slate-700 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaFlashcardsView;
