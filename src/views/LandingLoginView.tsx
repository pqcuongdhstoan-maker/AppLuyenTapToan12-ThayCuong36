import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { AuthModal } from '../components/auth/AuthModal';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LandingLoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingLoginView: React.FC<LandingLoginViewProps> = ({ onLoginSuccess }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const allUsers = storageService.getUsers();
  const sampleStudent = allUsers.find(u => u.role === UserRole.STUDENT) || allUsers[2];
  const sampleTeacher = allUsers.find(u => u.role === UserRole.TEACHER) || allUsers[1];
  const sampleAdmin = allUsers.find(u => u.role === UserRole.ADMIN) || allUsers[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginId.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập, Email hoặc Tên học sinh.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập Mật khẩu.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = storageService.login(loginId.trim(), password);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    }, 250);
  };

  const handleQuickLogin = (userToLogin: User) => {
    setLoginId(userToLogin.username || userToLogin.email);
    setPassword(userToLogin.password || '123');
    storageService.setCurrentUser(userToLogin);
    onLoginSuccess(userToLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-100/60 to-rose-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Blur Bubbles */}
      <div className="absolute top-12 left-12 w-72 h-72 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-300/80 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in duration-300 backdrop-blur-xs">
        
        {/* Cute Mascot / Avatar Top */}
        <div className="flex flex-col items-center justify-center mb-5 text-center">
          <div className="relative mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 p-1 shadow-lg shadow-amber-300/50 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              {/* Cute Owl / Bear Mascot */}
              <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                🐻
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            <span>Xin chào bạn yêu!</span>
            <span className="text-amber-500 animate-bounce">✨</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Hệ thống Tự Luyện Toán 12 – Thầy Phan Quốc Cường
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username / Identifier Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Tên học sinh / Tài khoản đăng nhập:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Nhập tên bé, tài khoản hoặc email..."
                className="w-full px-4 py-3.5 rounded-2xl bg-amber-50/50 border-2 border-amber-300 text-slate-900 font-semibold placeholder:text-amber-700/40 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-200/50 transition-all text-sm"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500 text-base pointer-events-none">
                ✏️
              </span>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Mật khẩu:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Nhập mật khẩu (mặc định: 123)..."
                className="w-full px-4 py-3.5 rounded-2xl bg-amber-50/50 border-2 border-amber-300 text-slate-900 font-semibold placeholder:text-amber-700/40 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-200/50 transition-all text-sm pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white font-black text-base shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin text-xl">⏳</span>
            ) : (
              <>
                <span>Vào học nào!</span>
                <span className="text-xl">🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors inline-flex items-center gap-1"
          >
            <span>Chưa có tài khoản?</span>
            <span className="text-amber-600 font-black underline">Đăng ký học sinh mới</span>
          </button>
        </div>

        {/* Fast Test Login Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            ⚡ Đăng nhập nhanh để trải nghiệm:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* Student Quick Button */}
            {sampleStudent && (
              <button
                type="button"
                onClick={() => handleQuickLogin(sampleStudent)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-center transition-all group cursor-pointer"
                title={`Đăng nhập nhanh với quyền Học sinh: ${sampleStudent.fullName}`}
              >
                <div className="text-base group-hover:scale-110 transition-transform">🎓</div>
                <div className="text-[11px] font-black text-slate-800 mt-0.5 truncate">{sampleStudent.fullName}</div>
                <div className="text-[9px] text-slate-500 font-medium">Học sinh</div>
              </button>
            )}

            {/* Teacher Quick Button */}
            {sampleTeacher && (
              <button
                type="button"
                onClick={() => handleQuickLogin(sampleTeacher)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group cursor-pointer"
                title={`Đăng nhập nhanh với quyền Giáo viên: ${sampleTeacher.fullName}`}
              >
                <div className="text-base group-hover:scale-110 transition-transform">👩‍🏫</div>
                <div className="text-[11px] font-black text-slate-800 mt-0.5 truncate">{sampleTeacher.fullName}</div>
                <div className="text-[9px] text-blue-600 font-medium">Giáo viên</div>
              </button>
            )}

            {/* Admin Quick Button */}
            {sampleAdmin && (
              <button
                type="button"
                onClick={() => handleQuickLogin(sampleAdmin)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-center transition-all group cursor-pointer"
                title={`Đăng nhập nhanh với quyền Quản trị: ${sampleAdmin.fullName}`}
              >
                <div className="text-base group-hover:scale-110 transition-transform">👨‍🏫</div>
                <div className="text-[11px] font-black text-slate-800 mt-0.5 truncate">Thầy Cường</div>
                <div className="text-[9px] text-purple-600 font-medium">Quản trị</div>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <span>📚 App Luyện Tập Toán 12</span>
          <span>•</span>
          <span>Thầy Phan Quốc Cường</span>
        </div>
      </div>

      {/* Register Modal Popup */}
      <AuthModal
        isOpen={showRegisterModal}
        initialTab="register"
        currentUser={sampleStudent}
        onUserChange={(newUser) => {
          setShowRegisterModal(false);
          onLoginSuccess(newUser);
        }}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
};