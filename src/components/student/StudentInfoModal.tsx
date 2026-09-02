import React, { useState } from 'react';
import { User, ClassInfo } from '../../types';
import { storageService } from '../../services/storageService';
import { GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentInfoModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (user: User) => void;
}

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onConfirmed
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [classes, setClasses] = useState<ClassInfo[]>(storageService.getClasses());
  const [selectedClass, setSelectedClass] = useState(currentUser.className || classes[0]?.name || '12TN1');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefreshClasses = async () => {
    setIsRefreshing(true);
    await storageService.syncClassesFromGoogleSheet();
    const latest = storageService.getClasses();
    setClasses(latest);
    if (!latest.some(c => c.name === selectedClass) && latest.length > 0) {
      setSelectedClass(latest[0].name);
    }
    setIsRefreshing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      fullName: fullName.trim(),
      className: selectedClass,
      updatedAt: new Date().toISOString()
    };

    storageService.saveUser(updatedUser);
    onConfirmed(updatedUser);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            XÁC NHẬN THÔNG TIN HỌC SINH
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng kiểm tra và xác nhận Họ tên và Lớp trước khi bắt đầu bài học TOÁN THPT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Họ và tên học sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Lớp học <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleRefreshClasses}
                disabled={isRefreshing}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>{isRefreshing ? 'Đang tải...' : '🔄 Làm mới từ Sheets'}</span>
              </button>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  Lớp {cls.name} (Khối {cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Kết quả, điểm số và nhật ký làm bài sẽ được tự động lưu theo hồ sơ của lớp bạn chọn để giáo viên phụ trách tổng hợp.</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              XÁC NHẬN & BẮT ĐẦU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentInfoModal;
