import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, X, ArrowRight } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetViewName: string; // 'QUẢN TRỊ GIÁO VIÊN' | 'QUẢN TRỊ HỆ THỐNG'
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  targetViewName,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    setTimeout(() => {
      const isValid = storageService.verifyAdminPassword(pin);
      if (isValid) {
        setIsVerifying(false);
        setPin('');
        onSuccess();
      } else {
        setIsVerifying(false);
        setError('Mật khẩu quản trị không chính xác! (Mặc định: 123)');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-amber-600">
              Khu vực bảo mật
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Xác thực quyền {targetViewName}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Khu vực dành riêng cho Giáo viên và Ban Quản trị. Vui lòng nhập mật khẩu hoặc mã PIN quản trị để tiếp tục.
        </p>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mật khẩu Quản trị (Admin PIN)</span>
              <span className="text-[11px] font-normal text-slate-400">Mặc định: 123</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Nhập mật khẩu quản trị..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isVerifying || !pin}
              className="flex-1 py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 hover:to-rose-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Mở Quản trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Bảo mật trường THPT Đức Hòa
          </span>
          <span className="text-slate-400">GV. Phan Quốc Cường</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthModal;