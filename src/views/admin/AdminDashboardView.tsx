import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  Save,
  Download,
  Upload,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle,
  Database,
  History,
  Key,
  KeyRound,
  Users,
  Settings as SettingsIcon,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import {
  User,
  UserRole,
  SystemSettings,
  FocusMode
} from '../../types';
import { storageService } from '../../services/storageService';
import { AccountProvisioningModal } from '../../components/auth/AccountProvisioningModal';

interface AdminDashboardViewProps {
  currentUser: User;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'classes' | 'users' | 'backup' | 'audit'>('settings');
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSettings());
  const [classes, setClasses] = useState(storageService.getClasses());
  const [users, setUsers] = useState<User[]>(storageService.getUsers());
  const [auditLogs, setAuditLogs] = useState(storageService.getAuditLogs());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSyncingClasses, setIsSyncingClasses] = useState(false);
  const [classSyncMsg, setClassSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showProvisioningModal, setShowProvisioningModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.STUDENT);
  const [newClass, setNewClass] = useState('12TN1');

  // Add / Edit Class modal
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<number>(12);
  const [newClassStudentCount, setNewClassStudentCount] = useState<number>(40);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshAll = () => {
    setSettings(storageService.getSettings());
    setClasses(storageService.getClasses());
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaveSuccessMsg('Đã lưu cấu hình hệ thống thành công!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Google Sheet Class Sync
  const handleSyncClassesFromGoogleSheet = async () => {
    if (!settings.googleSheetClassesUrl?.trim()) {
      setClassSyncMsg({
        type: 'error',
        text: 'Vui lòng nhập đường dẫn URL Google Sheet danh sách lớp học trước khi đồng bộ.'
      });
      return;
    }

    setIsSyncingClasses(true);
    setClassSyncMsg(null);

    const res = await storageService.syncClassesFromGoogleSheet(settings.googleSheetClassesUrl);
    setIsSyncingClasses(false);

    if (res.success) {
      setClassSyncMsg({
        type: 'success',
        text: `✅ ${res.message || `Đồng bộ thành công ${res.count} lớp học từ Google Sheets!`}`
      });
      refreshAll();
    } else {
      setClassSyncMsg({
        type: 'error',
        text: `❌ ${res.message || 'Không thể đồng bộ danh sách lớp từ Google Sheets'}`
      });
    }
  };

  // Add or Edit Class
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const classItem = {
      id: editingClassId || newClassName.trim().toUpperCase(),
      name: newClassName.trim().toUpperCase(),
      grade: Number(newClassGrade) || 12,
      studentCount: Number(newClassStudentCount) || 40,
      lastSyncedAt: new Date().toISOString()
    };

    if (editingClassId) {
      storageService.updateClass(classItem);
    } else {
      storageService.addClass(classItem);
    }

    setClasses(storageService.getClasses());
    setShowAddClassModal(false);
    setEditingClassId(null);
    setNewClassName('');
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Lớp ${name}?`)) {
      storageService.deleteClass(id);
      setClasses(storageService.getClasses());
    }
  };

  const handleResetClasses = () => {
    if (confirm('Khôi phục lại 20 lớp mặc định của khối 12 THPT Đức Hòa (12TN1 - 12TX)?')) {
      storageService.resetDefaultClasses();
      setClasses(storageService.getClasses());
      setClassSyncMsg({ type: 'success', text: 'Đã khôi phục 20 lớp học mặc định thành công!' });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fullName: newFullName.trim(),
      email: newEmail.trim() || `${newFullName.toLowerCase().replace(/\s+/g, '')}@duchoa.edu.vn`,
      role: newRole,
      className: newRole === UserRole.STUDENT ? newClass : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveUser(newUser);
    setUsers(storageService.getUsers());
    setShowAddUserModal(false);
    setNewFullName('');
    setNewEmail('');
  };

  const handleBackupDownload = () => {
    const dataStr = storageService.exportBackupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_LuyenTapToan12_KNTT_${Date.now()}.json`;
    a.click();
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importRestoreData(content);
      if (success) {
        refreshAll();
        alert('Khôi phục toàn bộ cơ sở dữ liệu thành công!');
      } else {
        alert('File sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalSchoolStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>HỆ THỐNG QUẢN TRỊ TRUNG TÂM • THPT ĐỨC HÒA</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          Quản Trị Hệ Thống & Cơ Sở Dữ Liệu
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
          Cấu hình Chế độ thi trực tuyến (Focus Exam Mode), kết nối Database danh sách lớp học từ Google Sheets, quản lý phân quyền và sao lưu dữ liệu toàn trường.
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          CẤU HÌNH HỆ THỐNG & QUY CHẾ THI
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'classes' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          DATABASE LỚP HỌC (GOOGLE SHEETS) ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          QUẢN LÝ NGƯỜI DÙNG ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'backup' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          SAO LƯU & KHÔI PHỤC DỮ LIỆU
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          NHẬT KÝ HỆ THỐNG (AUDIT LOGS)
        </button>
      </div>

      {/* TAB 1: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Quy chế thi trực tuyến & Giám sát Focus Mode
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cài đặt mức độ giám sát khi học sinh làm bài thi và luyện tập
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tên ứng dụng hiển thị:
              </label>
              <input
                type="text"
                value={settings.appTitle}
                onChange={(e) => setSettings({ ...settings, appTitle: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tên Trường / Đơn vị:
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Mật khẩu Quản trị (Master PIN):</span>
                <span className="text-[10px] text-purple-600 font-normal">Dùng để mở Quản trị GV & Admin</span>
              </label>
              <input
                type="text"
                value={settings.adminPassword || '123'}
                onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                className="w-full p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Chế độ giám sát Focus Exam Mode mặc định:
              </label>
              <select
                value={settings.defaultFocusMode}
                onChange={(e) => setSettings({ ...settings, defaultFocusMode: e.target.value as FocusMode })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value={FocusMode.OFF}>Tắt giám sát (Không giới hạn)</option>
                <option value={FocusMode.WARNING}>Chỉ cảnh báo khi chuyển tab</option>
                <option value={FocusMode.WARNING_LIMIT}>Cảnh báo và tự nộp bài sau số lần vi phạm</option>
                <option value={FocusMode.AUTO_SUBMIT}>Tự động nộp bài ngay lập tức khi rời màn hình</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Số lần chuyển tab tối đa cho phép trước khi tự nộp:
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.maxAllowedTabSwitches || 2}
                onChange={(e) => setSettings({ ...settings, maxAllowedTabSwitches: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tần suất tự động lưu bài làm (giây):
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={settings.autoSaveIntervalSeconds}
                onChange={(e) => setSettings({ ...settings, autoSaveIntervalSeconds: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Google Apps Script Webhook URL (Xuất bảng điểm):
              </label>
              <input
                type="url"
                value={settings.googleSheetWebhookUrl || ''}
                onChange={(e) => setSettings({ ...settings, googleSheetWebhookUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              LƯU CẤU HÌNH HỆ THỐNG
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CLASSES & GOOGLE SHEETS DATABASE */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Google Sheets Connection Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>KẾT NỐI DATABASE TRỰC TUYẾN GOOGLE SHEETS</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Đồng Bộ Danh Sách Lớp Học Từ Google Sheets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập liên kết bảng tính Google Sheets để tự động cập nhật danh sách lớp và sĩ số học sinh toàn trường.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  settings.googleSheetClassesUrl
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${settings.googleSheetClassesUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {settings.googleSheetClassesUrl ? 'Đã liên kết Google Sheets' : 'Chưa nhập liên kết'}
                </span>
              </div>
            </div>

            {classSyncMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
                classSyncMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                {classSyncMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{classSyncMsg.text}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Đường dẫn Google Sheets (Share Link hoặc CSV / Apps Script Endpoint):
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="url"
                  value={settings.googleSheetClassesUrl || ''}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setSettings({ ...settings, googleSheetClassesUrl: newUrl });
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    storageService.saveSettings(settings);
                    handleSyncClassesFromGoogleSheet();
                  }}
                  disabled={isSyncingClasses || !settings.googleSheetClassesUrl}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className={`w-4 h-4 ${isSyncingClasses ? 'animate-spin' : ''}`} />
                  <span>{isSyncingClasses ? 'Đang đồng bộ...' : 'ĐỒNG BỘ NGAY'}</span>
                </button>
              </div>

              {settings.lastClassSyncTimestamp && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Lần đồng bộ gần nhất:</span>
                  <strong className="text-slate-600 font-semibold">{new Date(settings.lastClassSyncTimestamp).toLocaleString('vi-VN')}</strong>
                </div>
              )}
            </div>

            {/* Template Guide Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Hướng dẫn định dạng cấu trúc bảng tính Google Sheet:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hệ thống hỗ trợ 2 dạng bảng tính Google Sheet:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <strong className="text-indigo-700 block mb-1">Dạng 1: Danh sách lớp học</strong>
                  <code className="text-slate-700 text-[10px] block bg-slate-100 p-1.5 rounded">
                    Mã lớp | Tên lớp | Khối | Sĩ số<br/>
                    12A1 | 12A1 | 12 | 42<br/>
                    12TN1 | 12TN1 | 12 | 40
                  </code>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <strong className="text-purple-700 block mb-1">Dạng 2: Danh sách học sinh theo lớp</strong>
                  <code className="text-slate-700 text-[10px] block bg-slate-100 p-1.5 rounded">
                    STT | Họ và tên | Lớp | Email<br/>
                    1 | Nguyễn Văn An | 12TN1 | an@...<br/>
                    2 | Lê Thị Bích | 12A1 | bich@...
                  </code>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">
                * Lưu ý: Trên Google Sheets, hãy bấm nút <strong>Chia sẻ (Share)</strong> và chọn quyền <strong>"Bất kỳ ai có đường liên kết đều có thể xem" (Anyone with the link can view)</strong>.
              </p>
            </div>
          </div>

          {/* Class List Table Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Danh Sách Các Lớp Học Hiện Có ({classes.length} lớp • {totalSchoolStudents} Học sinh)
              </h3>
              <p className="text-xs text-slate-500">
                Danh sách lớp học dùng chung cho học sinh đăng nhập, làm bài và tổng hợp điểm của Giáo viên
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetClasses}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Khôi phục 20 lớp mặc định
              </button>

              <button
                onClick={() => {
                  setEditingClassId(null);
                  setNewClassName('');
                  setNewClassGrade(12);
                  setNewClassStudentCount(40);
                  setShowAddClassModal(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                THÊM LỚP THỦ CÔNG
              </button>
            </div>
          </div>

          {/* Class Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã lớp</th>
                  <th className="px-4 py-3.5">Tên lớp</th>
                  <th className="px-4 py-3.5">Khối</th>
                  <th className="px-4 py-3.5">Sĩ số</th>
                  <th className="px-4 py-3.5">Nguồn dữ liệu</th>
                  <th className="px-4 py-3.5">Cập nhật</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-700">{cls.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">Lớp {cls.name}</td>
                    <td className="px-4 py-3.5">Khối {cls.grade}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{cls.studentCount} học sinh</td>
                    <td className="px-4 py-3.5">
                      {cls.syncedFromSheet ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                          <Database className="w-3 h-3" /> Google Sheets
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                          Hệ thống / Thủ công
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {cls.lastSyncedAt ? new Date(cls.lastSyncedAt).toLocaleDateString('vi-VN') : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingClassId(cls.id);
                          setNewClassName(cls.name);
                          setNewClassGrade(cls.grade);
                          setNewClassStudentCount(cls.studentCount);
                          setShowAddClassModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg"
                        title="Sửa lớp"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD / EDIT CLASS MODAL */}
          {showAddClassModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {editingClassId ? 'Sửa thông tin lớp học' : 'Thêm lớp học mới'}
                </h3>
                <form onSubmit={handleSaveClass} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học</label>
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Ví dụ: 12A12 hoặc 12TN7"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                    >
                      <option value={12}>Khối 12</option>
                      <option value={11}>Khối 11</option>
                      <option value={10}>Khối 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sĩ số học sinh</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={newClassStudentCount}
                      onChange={(e) => setNewClassStudentCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddClassModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
                    >
                      {editingClassId ? 'Lưu thay đổi' : 'Tạo lớp học'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Danh Sách Tài Khoản & Mật Khẩu ({users.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý phân quyền, cấp tài khoản đăng nhập cho Giáo viên và Học sinh toàn trường
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProvisioningModal(true)}
                className="px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                CẤP TÀI KHOẢN HÀNG LOẠT THEO LỚP
              </button>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                THÊM LẺ
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Họ và tên</th>
                  <th className="px-4 py-3.5">Tên đăng nhập / Email</th>
                  <th className="px-4 py-3.5">Vai trò</th>
                  <th className="px-4 py-3.5">Lớp</th>
                  <th className="px-4 py-3.5">Mật khẩu</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{u.fullName}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-indigo-700">{u.username || u.email.split('@')[0]}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                        u.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{u.className ? `Lớp ${u.className}` : '--'}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                        {u.password || '123'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          const newPass = prompt(`Nhập mật khẩu mới cho ${u.fullName}:`, '123');
                          if (newPass && newPass.trim()) {
                            storageService.resetUserPassword(u.id, newPass.trim());
                            refreshAll();
                          }
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Đổi mật khẩu"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== 'user_admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa tài khoản ${u.fullName}?`)) {
                              storageService.deleteUser(u.id);
                              refreshAll();
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Sao Lưu & Khôi Phục Cơ Sở Dữ Liệu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải về toàn bộ cơ sở dữ liệu (đề thi, bài làm học sinh, điểm số, lịch sử) dưới dạng file JSON an toàn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Tải bản sao lưu JSON</h4>
              <p className="text-xs text-slate-500">
                Xuất file sao lưu đầy đủ trạng thái bài thi, ngân hàng câu hỏi 19 bài học và nhật ký.
              </p>
              <button
                onClick={handleBackupDownload}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                TẢI BẢN SAO LƯU (.JSON)
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Khôi phục từ file JSON</h4>
              <p className="text-xs text-slate-500">
                Nhập file sao lưu để phục hồi dữ liệu hệ thống mà không làm gián đoạn bài giảng.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                CHỌN FILE ĐỂ KHÔI PHỤC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Nhật Ký Hành Động Hệ Thống (Audit Logs)
          </h3>

          <div className="space-y-2">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-700 mr-2">[{log.action}]</span>
                  <span className="text-slate-800 font-medium">{log.details}</span>
                  <span className="text-slate-400 ml-2 font-normal">bởi {log.userName}</span>
                </div>
                <div className="text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm người dùng mới</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Trần Văn Bình"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="binh.tv@duchoa.edu.vn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value={UserRole.STUDENT}>Học sinh (STUDENT)</option>
                  <option value={UserRole.TEACHER}>Giáo viên (TEACHER)</option>
                  <option value={UserRole.ADMIN}>Quản trị viên (ADMIN)</option>
                </select>
              </div>

              {newRole === UserRole.STUDENT && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Account Provisioning & Excel Export Hub */}
      <AccountProvisioningModal
        isOpen={showProvisioningModal}
        onClose={() => setShowProvisioningModal(false)}
        onUpdated={refreshAll}
      />
    </div>
  );
};

export default AdminDashboardView;
