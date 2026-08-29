import React, { useState } from 'react';
import {
  BookOpen,
  FileCheck,
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
  Layers,
  School,
  Flame,
  Rotate3d
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { geminiService } from '../../services/geminiService';
import { ApiKeySettingsModal } from '../settings/ApiKeySettingsModal';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  activeView,
  onNavigate
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(geminiService.hasApiKey());
  const [editName, setEditName] = useState(currentUser.fullName);
  const [editClass, setEditClass] = useState(currentUser.className || '12TN1');

  const allUsers = storageService.getUsers();
  const classes = storageService.getClasses();

  const handleSwitchUser = (user: User) => {
    storageService.setCurrentUser(user);
    onUserChange(user);
    setShowAccountSwitcher(false);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      fullName: editName,
      className: editClass,
      updatedAt: new Date().toISOString()
    };
    storageService.saveUser(updated);
    onUserChange(updated);
    setShowEditProfileModal(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">ADMIN</span>;
      case UserRole.TEACHER:
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">GIÁO VIÊN</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">HỌC SINH</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: School & System Branding */}
          <div
            onClick={() => onNavigate('lessons')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  TRƯỜNG THPT ĐỨC HÒA
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-md">
                  CT GDPT 2018
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                LUYỆN TẬP TOÁN 12 - KNTT
              </h1>
              <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                <span>KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</span>
                <span>•</span>
                <span className="font-semibold">GV. PHAN QUỐC CƯỜNG</span>
              </div>
            </div>
          </div>

          {/* Middle: Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('lessons')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'lessons'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Luyện tập
            </button>

            <button
              onClick={() => onNavigate('speed-battle')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'speed-battle'
                  ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Đấu trường 60s
            </button>

            <button
              onClick={() => onNavigate('flashcards')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'flashcards'
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              Flashcards
            </button>

            <button
              onClick={() => onNavigate('interactive-grapher')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'interactive-grapher'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Rotate3d className="w-4 h-4 text-indigo-600" />
              Đồ thị & 3D
            </button>

            <button
              onClick={() => onNavigate('results')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'results'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Kết quả của em
            </button>

            <button
              onClick={() => onNavigate('progress')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'progress'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Tiến trình
            </button>

            <button
              onClick={() => onNavigate('ai-assist')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'ai-assist'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Hỗ trợ
            </button>

            {/* Teacher Admin Nav */}
            {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.ADMIN) && (
              <button
                onClick={() => onNavigate('teacher-dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'teacher-dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                QUẢN TRỊ GIÁO VIÊN
              </button>
            )}

            {/* Admin Nav */}
            {currentUser.role === UserRole.ADMIN && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'admin-dashboard'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                QUẢN TRỊ HỆ THỐNG
              </button>
            )}
          </nav>

          {/* Right: API Key Config & User Profile */}
          <div className="flex items-center gap-2">
            {/* Permanent Settings (API Key) Button */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs border ${
                hasApiKey
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              }`}
              title="Cài đặt Google Gemini API Key để kích hoạt AI"
            >
              <KeyRound className={`w-3.5 h-3.5 ${hasApiKey ? 'text-indigo-600' : 'text-rose-600'}`} />
              <span className="hidden sm:inline">
                {hasApiKey ? 'Gemini Key' : 'Lấy API key để sử dụng app'}
              </span>
              <span className="sm:hidden">
                {hasApiKey ? 'Key' : 'Lấy Key'}
              </span>
              {!hasApiKey && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
              )}
            </button>

            {/* User Profile & Quick Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all text-left"
              >
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.fullName}</span>
                  {currentUser.className && (
                    <span className="text-[11px] font-normal text-slate-500">
                      ({currentUser.className})
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">{getRoleBadge(currentUser.role)}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs text-slate-400">Đang đăng nhập bằng:</div>
                  <div className="text-sm font-bold text-slate-800">{currentUser.fullName}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    {getRoleBadge(currentUser.role)}
                    {currentUser.className && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Lớp: {currentUser.className}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setEditName(currentUser.fullName);
                      setEditClass(currentUser.className || '12TN1');
                      setShowEditProfileModal(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    Đổi thông tin cá nhân
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountSwitcher(!showAccountSwitcher);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      Chuyển đổi tài khoản nhanh
                    </div>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Account switcher list */}
                  {showAccountSwitcher && (
                    <div className="mx-2 my-1 p-1 bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-100">
                      {allUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`p-2 text-xs rounded-md cursor-pointer flex items-center justify-between hover:bg-white transition-colors ${
                            u.id === currentUser.id ? 'bg-white font-bold text-indigo-700' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{u.fullName} {u.className ? `(${u.className})` : ''}</div>
                            <div className="text-[10px] text-slate-400">{u.role}</div>
                          </div>
                          {u.id === currentUser.id && <span className="text-[10px] text-emerald-600">Hiện tại</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      // Switch to default student or reset
                      handleSwitchUser(allUsers[2]);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs">
          <button
            onClick={() => onNavigate('lessons')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'lessons' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📚 Bài học
          </button>
          <button
            onClick={() => onNavigate('mock-exams')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'mock-exams' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📝 Thi thử
          </button>
          <button
            onClick={() => onNavigate('results')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            🏆 Kết quả
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'progress' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📈 Tiến trình
          </button>
          <button
            onClick={() => onNavigate('ai-assist')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeView === 'ai-assist' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            ✨ AI Hỗ trợ
          </button>
          {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.ADMIN) && (
            <button
              onClick={() => onNavigate('teacher-dashboard')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                activeView === 'teacher-dashboard' ? 'bg-blue-600 text-white' : 'text-blue-700 bg-blue-50 border border-blue-200'
              }`}
            >
              ⚙ GV
            </button>
          )}
          {currentUser.role === UserRole.ADMIN && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                activeView === 'admin-dashboard' ? 'bg-purple-600 text-white' : 'text-purple-700 bg-purple-50 border border-purple-200'
              }`}
            >
              ⚙ Admin
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Cập nhật thông tin học sinh</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp</label>
                <select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key & Model Settings Modal */}
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
    </header>
  );
};

export default Header;
