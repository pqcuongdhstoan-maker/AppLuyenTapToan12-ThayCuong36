import React from 'react';
import { Sparkles, Trophy, CheckCircle2, Flame, Award, ArrowRight } from 'lucide-react';
import { User, StudentProgressSummary } from '../../types';

interface HeroBannerProps {
  currentUser: User;
  progress: StudentProgressSummary;
  onExploreClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentUser,
  progress,
  onExploreClick
}) => {
  const percentage = progress.completionRatePercentage || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl p-6 sm:p-8 mb-8">
      {/* Subtle decorative background shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Greeting & Info */}
        <div className="lg:col-span-8 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-indigo-100 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>✨ TOÁN THPT • CT GDPT 2018</span>
          </div>

          {/* Dynamic Greeting */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Chào {currentUser.fullName} {currentUser.className ? `(${currentUser.className})` : ''}! 👋
          </h2>

          {/* Subtitle description */}
          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl leading-relaxed">
            Hệ thống tự luyện TOÁN THPT với đầy đủ 4 dạng đề thi: Trắc nghiệm nhiều lựa chọn, Đúng/Sai, Trả lời ngắn và Tự luận theo chuẩn cấu trúc Bộ GD&ĐT.
          </p>

          {/* Quick Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Điểm cao nhất: <strong>{progress.highestScore || 0}/10</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Số lượt làm: <strong>{progress.totalAttempts || 0}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tỉ lệ hoàn thành: <strong>{percentage}%</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Yearly Progress Card */}
        <div className="lg:col-span-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  TIẾN ĐỘ NĂM HỌC
                </span>
              </div>
              <span className="text-xl font-extrabold text-white">
                {percentage}%
              </span>
            </div>

            {/* Big Progress Numbers */}
            <div className="mb-3">
              <div className="text-2xl font-black text-white">
                {progress.completedLessons}/{progress.totalLessons} bài hoàn thành
              </div>
              <div className="text-xs text-indigo-200">
                {progress.inProgressLessons > 0 && `${progress.inProgressLessons} bài đang làm dở • `}
                {progress.notStartedLessons} bài chưa bắt đầu
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/15 mb-3">
              <div
                className="h-full bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${Math.max(5, percentage)}%` }}
              />
            </div>

            {onExploreClick && (
              <button
                onClick={onExploreClick}
                className="w-full mt-2 py-2 px-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 group"
              >
                <span>Tiếp tục học ngay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
