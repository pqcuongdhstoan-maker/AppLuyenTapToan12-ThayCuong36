import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Clock,
  RotateCcw,
  Search,
  Eye,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { User, Attempt, AttemptStatus } from '../types';
import { storageService } from '../services/storageService';

interface StudentResultsViewProps {
  currentUser: User;
  onReviewAttempt: (attempt: Attempt) => void;
  onRetakeLesson: (lessonId: string) => void;
}

export const StudentResultsView: React.FC<StudentResultsViewProps> = ({
  currentUser,
  onReviewAttempt,
  onRetakeLesson
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const attempts = storageService.getAttemptsByStudent(currentUser.id);
  const progress = storageService.getStudentProgress(currentUser.id);

  const filteredAttempts = attempts.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.lessonTitle.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Điểm cao nhất</div>
            <div className="text-2xl font-black text-slate-900">{progress.highestScore || 0}/10</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Điểm trung bình</div>
            <div className="text-2xl font-black text-slate-900">{progress.averageScore || 0}/10</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Tổng lượt thi</div>
            <div className="text-2xl font-black text-slate-900">{progress.totalAttempts || 0} bài</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Thời gian ôn tập</div>
            <div className="text-2xl font-black text-slate-900">{progress.totalStudyTimeMinutes || 0} phút</div>
          </div>
        </div>
      </div>

      {/* History Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Lịch sử làm bài thi của học sinh: {currentUser.fullName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách toàn bộ các bài tự luyện và kiểm tra thử đã thực hiện
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Bài học / Đề thi</th>
                <th className="px-4 py-3">Ngày làm</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Phần I (TN)</th>
                <th className="px-4 py-3">Phần II (Đ/S)</th>
                <th className="px-4 py-3">Phần III (TLN)</th>
                <th className="px-4 py-3">Phần IV (TL)</th>
                <th className="px-4 py-3">Tổng điểm</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAttempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">{att.lessonTitle}</div>
                    <div className="text-[10px] text-slate-400">Phiên bản đề: v{att.examVersion} • Lần {att.attemptNumber}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(att.startedAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                    {Math.round((att.timeSpentSeconds || 0) / 60)} phút
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {att.part1Score !== undefined ? `${att.part1Score}đ` : '--'}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {att.part2Score !== undefined ? `${att.part2Score}đ` : '--'}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {att.part3Score !== undefined ? `${att.part3Score}đ` : '--'}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {att.part4Score !== undefined ? `${att.part4Score}đ` : (
                      att.part4Status === 'PENDING_GRADING' ? <span className="text-orange-500 text-[10px]">Chờ chấm</span> : '--'
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-sm rounded-xl border border-indigo-100">
                      {att.score !== undefined ? `${att.score.toFixed(2)}` : '--'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => onReviewAttempt(att)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-600 font-bold border border-slate-200 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem lại
                    </button>
                    <button
                      onClick={() => onRetakeLesson(att.lessonId)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Làm lại
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAttempts.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Chưa có bài thi nào được hoàn thành. Hãy chọn một bài học để bắt đầu luyện tập!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResultsView;
