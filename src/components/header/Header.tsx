import React, { useState } from 'react';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  UserCheck,
  LogOut,
  KeyRound,
  User as UserIcon,
  ChevronDown,
  GraduationCap,
  School,
  Flame,
  Rotate3d,
  Lock,
  LogIn,
  UserPlus,
  Users,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { geminiService } from '../../services/geminiService';
import { ApiKeySettingsModal } from '../settings/ApiKeySettingsModal';
import { AdminAuthModal } from '../auth/AdminAuthModal';
import { AuthModal } from '../auth/AuthModal';
import { AccountProvisioningModal } from '../auth/AccountProvisioningModal';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onLogout?: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  onLogout,
  activeView,
  onNavigate
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [targetAdminView, setTargetAdminView] = useState<'teacher-dashboard' | 'admin-dashboard'>('teacher-dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'change-password'>('login');
  const [showProvisioningModal, setShowProvisioningModal] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(geminiService.hasApiKey());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const toolsMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    storageService.logout();
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      onUserChange(null as any);
    }
  };

  const handleAdminNavClick = (view: 'teacher-dashboard' | 'admin-dashboard') => {
    // If user is already ADMIN or authenticated in this session, navigate directly
    if (isAdminAuthenticated) {
      onNavigate(view);
      return;
    }
    // Otherwise prompt for Admin Master PIN
    setTargetAdminView(view);
    setShowAdminAuthModal(true);
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminAuthModal(false);
    onNavigate(targetAdminView);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="px-2 py-0.5 text-[10px] font-black bg-purple-100 text-purple-700 rounded-full border border-purple-200">ADMIN</span>;
      case UserRole.TEACHER:
        return <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-700 rounded-full border border-blue-200">GIÁO VIÊN</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">HỌC SINH</span>;
    }
  };

  const isTeacherOrAdmin = Boolean(
    currentUser && (
      currentUser.role === UserRole.TEACHER ||
      currentUser.role === UserRole.ADMIN ||
      String(currentUser.role) === 'TEACHER' ||
      String(currentUser.role) === 'ADMIN'
    )
  );

  const isToolActive = ['speed-battle', 'flashcards', 'interactive-grapher', 'ai-assist'].includes(activeView);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* 1. LEFT: Official School & App Branding */}
            <div
              onClick={() => onNavigate('lessons')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                <img
                  src="/logo_thpt_duchoa.png"
                  alt="Logo THPT Đức Hòa"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to stylized icon if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <School className="w-6 h-6 text-indigo-600 hidden" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                    THPT ĐỨC HÒA
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-blue-600 text-white rounded-md">
                    GDPT 2018
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  TOÁN 12 - KNTT
                </h1>
                <div className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold leading-none hidden sm:block">
                  GV. PHAN QUỐC CƯỜNG
                </div>
              </div>
            </div>

            {/* 2. MIDDLE: Scientific Grouped Navigation Menu (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {/* Nhóm 1: Luyện tập */}
              <button
                onClick={() => onNavigate('lessons')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'lessons'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Luyện tập 19 Bài
              </button>

              {/* Nhóm 2: Tiện ích & Công cụ Học tập (Dropdown) */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isToolActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Góc Trải Nghiệm
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showToolsDropdown && (
                  <div
                    onMouseLeave={() => setShowToolsDropdown(false)}
                    className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      onClick={() => { onNavigate('speed-battle'); setShowToolsDropdown(false); }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2.5 hover:bg-amber-50 ${
                        activeView === 'speed-battle' ? 'text-amber-700 bg-amber-50/50' : 'text-slate-700'
                      }`}
                    >
                      <Flame className="w-4 h-4 text-amber-500" />
                      <div>
                        <div>Đấu trường 60s</div>
                        <div className="text-[10px] text-slate-400 font-normal">Thi đấu phản xạ nhanh</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onNavigate('flashcards'); setShowToolsDropdown(false); }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2.5 hover:bg-indigo-50 ${
                        activeView === 'flashcards' ? 'text-indigo-700 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div>Thẻ Flashcards</div>
                        <div className="text-[10px] text-slate-400 font-normal">Ghi nhớ công thức cốt lõi</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onNavigate('interactive-grapher'); setShowToolsDropdown(false); }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2.5 hover:bg-teal-50 ${
                        activeView === 'interactive-grapher' ? 'text-teal-700 bg-teal-50/50' : 'text-slate-700'
                      }`}
                    >
                      <Rotate3d className="w-4 h-4 text-teal-600" />
                      <div>
                        <div>Đồ thị & Hình không gian 3D</div>
                        <div className="text-[10px] text-slate-400 font-normal">Mô phỏng trực quan Oxyz</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onNavigate('ai-assist'); setShowToolsDropdown(false); }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2.5 hover:bg-purple-50 ${
                        activeView === 'ai-assist' ? 'text-purple-700 bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <div>Gia sư AI Toán học</div>
                        <div className="text-[10px] text-slate-400 font-normal">Giải đáp bài tập từng bước</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Nhóm 3: Kết quả & Tiến trình */}
              <button
                onClick={() => onNavigate('results')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'results'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Kết quả
              </button>

              <button
                onClick={() => onNavigate('progress')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'progress'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Tiến trình
              </button>

              {/* Nhóm 4: Quản trị (Chỉ Giáo viên & Admin mới hiển thị) */}
              {isTeacherOrAdmin && (
                <>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <button
                    onClick={() => handleAdminNavClick('teacher-dashboard')}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                      activeView === 'teacher-dashboard'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-blue-50/80 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                    title="Yêu cầu Mật khẩu quản trị (Mặc định: 123)"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>QUẢN TRỊ GV</span>
                    <Lock className="w-3 h-3 text-blue-500" />
                  </button>
                </>
              )}
            </nav>

            {/* 3. RIGHT: Gemini Key & Profile Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Nút Cài đặt Gemini Key */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs border ${
                  hasApiKey
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                }`}
                title="Cài đặt Google Gemini API Key để kích hoạt AI"
              >
                <KeyRound className={`w-3.5 h-3.5 ${hasApiKey ? 'text-indigo-600' : 'text-rose-600'}`} />
                <span className="hidden sm:inline">
                  {hasApiKey ? 'Gemini Key' : 'Lấy API key'}
                </span>
                {!hasApiKey && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                )}
              </button>

              {/* Nút Hồ sơ Người Dùng & Phân Quyền */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 sm:pl-2.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1 leading-tight truncate max-w-[130px]">
                      <span>{currentUser.fullName}</span>
                      {currentUser.className && (
                        <span className="text-[10px] font-normal text-slate-500">
                          ({currentUser.className})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{getRoleBadge(currentUser.role)}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div
                    ref={profileMenuRef}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl mx-1.5 mb-1.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đang đăng nhập:</div>
                      <div className="text-sm font-black text-slate-900 truncate">{currentUser.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        {getRoleBadge(currentUser.role)}
                        {currentUser.className && (
                          <span className="text-[11px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            Lớp {currentUser.className}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions List */}
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setAuthModalTab('change-password');
                          setShowAuthModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        Đổi mật khẩu tài khoản
                      </button>

                      {/* Các chức năng quản trị: CHỈ HIỂN THỊ TRÊN TÀI KHOẢN GIÁO VIÊN HOẶC QUẢN TRỊ VIÊN */}
                      {isTeacherOrAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setShowProvisioningModal(true);
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            Trung tâm Cấp tài khoản & Mật khẩu
                          </button>

                          <button
                            onClick={() => {
                              handleAdminNavClick('admin-dashboard');
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                            Quản trị Hệ thống (Admin)
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1 pt-1" />

                      <button
                        onClick={() => {
                          setAuthModalTab('login');
                          setShowAuthModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-slate-500" />
                        Đăng nhập tài khoản khác
                      </button>

                      <button
                        onClick={() => {
                          setAuthModalTab('register');
                          setShowAuthModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                        Đăng ký học sinh mới
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 mt-1 px-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. MOBILE NAVIGATION BAR */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs">
            <button
              onClick={() => onNavigate('lessons')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'lessons' ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              📚 19 Bài học
            </button>
            <button
              onClick={() => onNavigate('speed-battle')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'speed-battle' ? 'bg-amber-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              ⚡ Đấu trường 60s
            </button>
            <button
              onClick={() => onNavigate('flashcards')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'flashcards' ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              ✨ Flashcards
            </button>
            <button
              onClick={() => onNavigate('interactive-grapher')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'interactive-grapher' ? 'bg-teal-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              📐 Đồ thị & 3D
            </button>
            <button
              onClick={() => onNavigate('ai-assist')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'ai-assist' ? 'bg-purple-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              🤖 Gia sư AI
            </button>
            <button
              onClick={() => onNavigate('results')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              🏆 Kết quả
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                activeView === 'progress' ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-100'
              }`}
            >
              📈 Tiến trình
            </button>
            {isTeacherOrAdmin && (
              <button
                onClick={() => handleAdminNavClick('teacher-dashboard')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-black border ${
                  activeView === 'teacher-dashboard' ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}
              >
                🔒 Quản trị GV
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin PIN Password Protection Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        targetViewName={targetAdminView === 'admin-dashboard' ? 'QUẢN TRỊ HỆ THỐNG' : 'QUẢN TRỊ GIÁO VIÊN'}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* User Login / Register / Change Password Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialTab={authModalTab}
        currentUser={currentUser}
        onUserChange={onUserChange}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Account & Password Provisioning Hub Modal */}
      <AccountProvisioningModal
        isOpen={showProvisioningModal}
        onClose={() => setShowProvisioningModal(false)}
        onUpdated={() => {
          // Trigger reload of user state if needed
          onUserChange(storageService.getCurrentUser());
        }}
      />

      {/* Gemini API Key Settings Modal */}
      <ApiKeySettingsModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setHasApiKey(geminiService.hasApiKey());
        }}
        onSaved={() => {
          setHasApiKey(geminiService.hasApiKey());
        }}
      />
    </>
  );
};

export default Header;