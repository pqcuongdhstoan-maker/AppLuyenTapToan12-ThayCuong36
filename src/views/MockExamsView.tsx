import React from 'react';
import { FileCheck, Sparkles, Clock, Award, Play, CheckCircle, ShieldCheck } from 'lucide-react';
import { User, Lesson } from '../types';

interface MockExamsViewProps {
  currentUser: User;
  onStartExam: (lesson: Lesson) => void;
}

export const MockExamsView: React.FC<MockExamsViewProps> = ({
  currentUser,
  onStartExam
}) => {
  const mockExams: Array<{
    id: string;
    title: string;
    description: string;
    timeMinutes: number;
    part1: number;
    part2: number;
    part3: number;
    part4: number;
    badge: string;
    level: string;
    lessonId: string;
  }> = [
    {
      id: 'mock_1',
      title: 'Đề kiểm tra Giữa học kì I – Toán 12',
      description: 'Khảo sát hàm số, cực trị, tiệm cận, GTLN/GTNN và vectơ không gian',
      timeMinutes: 90,
      part1: 12,
      part2: 4,
      part3: 6,
      part4: 2,
      badge: 'GIỮA HỌC KÌ I',
      level: 'Chuẩn cấu trúc Bộ GD&ĐT',
      lessonId: 'lesson_1'
    },
    {
      id: 'mock_2',
      title: 'Đề kiểm tra Cuối học kì I – Toán 12',
      description: 'Tổng hợp toàn bộ kiến thức Học kì I: Hàm số, Tọa độ không gian & Số đặc trưng mẫu số liệu',
      timeMinutes: 90,
      part1: 12,
      part2: 4,
      part3: 6,
      part4: 2,
      badge: 'CUỐI HỌC KÌ I',
      level: 'Chuẩn cấu trúc Bộ GD&ĐT',
      lessonId: 'lesson_1'
    },
    {
      id: 'mock_3',
      title: 'Đề kiểm tra Giữa học kì II – Toán 12',
      description: 'Nguyên hàm, Tích phân và Phương pháp tọa độ trong không gian Oxyz',
      timeMinutes: 90,
      part1: 12,
      part2: 4,
      part3: 6,
      part4: 2,
      badge: 'GIỮA HỌC KÌ II',
      level: 'Chuẩn cấu trúc Bộ GD&ĐT',
      lessonId: 'lesson_11'
    },
    {
      id: 'mock_4',
      title: 'Đề thi thử Tốt nghiệp THPT 2026 – Chuẩn Bộ GD&ĐT',
      description: 'Đầy đủ 4 phần theo ma trận đề thi chính thức: Hàm số, Oxyz, Tích phân, Thống kê & Xác suất có điều kiện',
      timeMinutes: 90,
      part1: 12,
      part2: 4,
      part3: 6,
      part4: 2,
      badge: 'ĐỀ THI THỬ THPT QG',
      level: 'Mức độ Phân hóa cao',
      lessonId: 'lesson_1'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PHÒNG THI THỬ TRỰC TUYẾN • THPT ĐỨC HÒA</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
          Đề Kiểm Tra Định Kỳ & Đề Thi Thử Tốt Nghiệp THPT
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Hệ thống đề thi chuẩn định dạng CT GDPT 2018 gồm 4 phần: Trắc nghiệm 4 lựa chọn (Phần I), Trắc nghiệm Đúng/Sai (Phần II), Trả lời ngắn (Phần III) và Tự luận (Phần IV). Tự động kích hoạt Chế độ kiểm tra nghiêm túc (Focus Exam Mode).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockExams.map((mock) => (
          <div
            key={mock.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100">
                  {mock.badge}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {mock.timeMinutes} phút
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                {mock.title}
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {mock.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-4 gap-2 text-center text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">Phần I</span>
                  <strong className="text-slate-800 font-bold">{mock.part1}</strong> câu
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phần II</span>
                  <strong className="text-slate-800 font-bold">{mock.part2}</strong> câu
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phần III</span>
                  <strong className="text-slate-800 font-bold">{mock.part3}</strong> câu
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phần IV</span>
                  <strong className="text-slate-800 font-bold">{mock.part4}</strong> câu
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onStartExam({
                  id: mock.lessonId,
                  number: 1,
                  title: mock.title,
                  chapterNumber: 1,
                  chapterTitle: 'ĐỀ THI TỔNG HỢP',
                  semester: 1,
                  examId: 'exam_lesson_1'
                });
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              BẮT ĐẦU VÀO PHÒNG THI THỬ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockExamsView;
