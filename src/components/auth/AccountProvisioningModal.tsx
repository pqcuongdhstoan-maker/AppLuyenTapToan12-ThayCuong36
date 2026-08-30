import React, { useState } from 'react';
import {
  User,
  UserRole
} from '../../types';
import { storageService } from '../../services/storageService';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  KeyRound,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  ShieldCheck,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface AccountProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const AccountProvisioningModal: React.FC<AccountProvisioningModalProps> = ({
  isOpen,
  onClose,
  onUpdated
}) => {
  const [tab, setTab] = useState<'single' | 'bulk' | 'list'>('list');
  const [selectedClass, setSelectedClass] = useState('12TN1');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Single create state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [userClass, setUserClass] = useState('12TN1');

  // Bulk create state
  const [bulkClass, setBulkClass] = useState('12TN1');
  const [bulkNamesText, setBulkNamesText] = useState(
    'Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cường\nPhạm Mai Dung\nVũ Đức Em\nHoàng Gia Hân'
  );
  const [bulkDefaultPass, setBulkDefaultPass] = useState('123');

  // Notification
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const classes = storageService.getClasses();
  const allUsers = storageService.getUsers();

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (selectedClass !== 'ALL' && u.className !== selectedClass && u.role === UserRole.STUDENT) return false;
    return true;
  });

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setMsg({ type: 'error', text: 'Vui lòng nhập Họ tên và Email.' });
      return;
    }

    const newUser: User = {
      id: `user_${role.toLowerCase()}_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: (username || email.split('@')[0]).trim().toLowerCase(),
      password: password || '123',
      role,
      className: role === UserRole.STUDENT ? userClass : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    storageService.saveUser(newUser);
    setMsg({ type: 'success', text: `Đã cấp tài khoản thành công cho ${newUser.fullName}!` });
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('123');
    onUpdated?.();
  };

  const handleCreateBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkNamesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setMsg({ type: 'error', text: 'Vui lòng nhập ít nhất 1 tên học sinh.' });
      return;
    }

    const res = storageService.bulkCreateStudents(bulkClass, names, bulkDefaultPass);
    setMsg({
      type: 'success',
      text: `Đã cấp thành công ${res.createdCount} tài khoản học sinh cho Lớp ${bulkClass}!`
    });
    setTab('list');
    setSelectedClass(bulkClass);
    onUpdated?.();
  };

  const handleResetPassword = (u: User) => {
    const newPass = prompt(`Nhập mật khẩu mới cho ${u.fullName}:`, '123');
    if (newPass !== null && newPass.trim() !== '') {
      storageService.resetUserPassword(u.id, newPass.trim());
      setMsg({ type: 'success', text: `Đã đổi mật khẩu cho ${u.fullName} thành: ${newPass.trim()}` });
      onUpdated?.();
    }
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${u.fullName} (${u.email})?`)) {
      storageService.deleteUser(u.id);
      setMsg({ type: 'success', text: `Đã xóa tài khoản ${u.fullName}.` });
      onUpdated?.();
    }
  };

  const handleExportCsv = () => {
    const csvContent = storageService.exportUsersToCsv(
      roleFilter === 'ALL' ? undefined : (roleFilter as UserRole),
      selectedClass === 'ALL' ? undefined : selectedClass
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DanhSachTaiKhoan_THPT_DucHoa_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg({ type: 'success', text: 'Đã xuất file Excel / CSV danh sách tài khoản thành công!' });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-black text-blue-600 uppercase tracking-wider">
                TRUNG TÂM PHÂN QUYỀN & CẤP TÀI KHOẢN
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Cấp tài khoản & Mật khẩu Giáo viên / Học sinh
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 py-3 shrink-0">
          <button
            onClick={() => { setTab('list'); setMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Danh sách tài khoản ({allUsers.length})
          </button>
          <button
            onClick={() => { setTab('bulk'); setMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'bulk' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ⚡ Cấp hàng loạt theo Lớp
          </button>
          <button
            onClick={() => { setTab('single'); setMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Tạo tài khoản lẻ
          </button>

          <button
            onClick={handleExportCsv}
            className="ml-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Tải bảng danh sách tài khoản & mật khẩu Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (.csv)
          </button>
        </div>

        {/* Alerts */}
        {msg && (
          <div
            className={`mb-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: User List & Management */}
          {tab === 'list' && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600 pl-1">Lọc:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value={UserRole.STUDENT}>Học sinh</option>
                  <option value={UserRole.TEACHER}>Giáo viên</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="ALL">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>Lớp {c.name}</option>
                  ))}
                </select>

                <span className="ml-auto text-slate-500 font-medium">
                  Hiển thị: <strong>{filteredUsers.length}</strong> tài khoản
                </span>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Tên đăng nhập / Email</th>
                      <th className="p-3">Vai trò</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">Mật khẩu</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="p-3">
                          <div className="font-semibold text-indigo-700">{u.username || u.email.split('@')[0]}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === UserRole.ADMIN
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === UserRole.TEACHER
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{u.className || '-'}</td>
                        <td className="p-3">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                            {u.password || '123'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== 'user_admin' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
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

          {/* TAB 2: Bulk Class Generation */}
          {tab === 'bulk' && (
            <form onSubmit={handleCreateBulk} className="space-y-4 p-1">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed">
                <strong>💡 Hướng dẫn cấp tài khoản tự động theo lớp:</strong>
                <p className="mt-1 text-slate-600">
                  Hệ thống sẽ tự động tạo email và tên đăng nhập chuẩn dạng: <code>{bulkClass.toLowerCase()}.hs01@duchoa.edu.vn</code> kèm mật khẩu mặc định an toàn để phát cho học sinh.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn lớp học sinh</label>
                  <select
                    value={bulkClass}
                    onChange={(e) => setBulkClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu khởi tạo chung</label>
                  <input
                    type="text"
                    value={bulkDefaultPass}
                    onChange={(e) => setBulkDefaultPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh sách họ và tên học sinh (mỗi bạn 1 dòng)
                </label>
                <textarea
                  rows={8}
                  required
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  placeholder="Dán danh sách họ tên học sinh tại đây..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sinh toàn bộ tài khoản cho Lớp {bulkClass} ngay</span>
              </button>
            </form>
          )}

          {/* TAB 3: Single Create */}
          {tab === 'single' && (
            <form onSubmit={handleCreateSingle} className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  >
                    <option value={UserRole.STUDENT}>Học sinh</option>
                    <option value={UserRole.TEACHER}>Giáo viên</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              {role === UserRole.STUDENT && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp</label>
                  <select
                    value={userClass}
                    onChange={(e) => setUserClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="hung.nv@duchoa.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                  <input
                    type="text"
                    required
                    placeholder="Mặc định: 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm tài khoản vào hệ thống</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProvisioningModal;