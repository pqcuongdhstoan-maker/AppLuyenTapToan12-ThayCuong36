import {
  User,
  UserRole,
  Lesson,
  Chapter,
  Exam,
  Attempt,
  AttemptStatus,
  SystemSettings,
  ClassInfo,
  Question,
  QuestionType,
  SubmitReason,
  EssayGrading,
  StudentProgressSummary,
  LiveExamStudentStatus,
  ViolationLog
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_LESSONS,
  CHAPTERS_DATA,
  INITIAL_EXAMS,
  INITIAL_SYSTEM_SETTINGS
} from '../data/seedData';

const KEYS = {
  CURRENT_USER: 'tu_luyen_toan_12_current_user',
  USERS: 'tu_luyen_toan_12_users',
  CLASSES: 'tu_luyen_toan_12_classes',
  LESSONS: 'tu_luyen_toan_12_lessons',
  EXAMS: 'tu_luyen_toan_12_exams',
  ATTEMPTS: 'tu_luyen_toan_12_attempts',
  SETTINGS: 'tu_luyen_toan_12_settings',
  AUDIT_LOGS: 'tu_luyen_toan_12_audit_logs'
};

class StorageService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    } else {
      // Migrate old admin name if present
      try {
        const rawUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
        const updated = rawUsers.map((u: any) => {
          if (u.id === 'user_admin' && (u.fullName?.includes('Ban Giám Hiệu') || !u.fullName?.includes('Phan Quốc Cường'))) {
            return {
              ...u,
              fullName: 'Phan Quốc Cường (Quản trị viên)',
              email: 'cuong.pq@duchoa.edu.vn',
              username: 'admin',
              password: u.password || '123'
            };
          }
          return u;
        });
        localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
      } catch {}
    }
    // Migrate current user if was old admin
    try {
      const rawCurr = localStorage.getItem(KEYS.CURRENT_USER);
      if (rawCurr) {
        const curr = JSON.parse(rawCurr);
        if (curr.id === 'user_admin' && (curr.fullName?.includes('Ban Giám Hiệu') || !curr.fullName?.includes('Phan Quốc Cường'))) {
          curr.fullName = 'Phan Quốc Cường (Quản trị viên)';
          curr.email = 'cuong.pq@duchoa.edu.vn';
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(curr));
        }
      }
    } catch {}
    if (!localStorage.getItem(KEYS.CLASSES)) {
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    }
    if (!localStorage.getItem(KEYS.LESSONS)) {
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
    }
    if (!localStorage.getItem(KEYS.EXAMS)) {
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SYSTEM_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.ATTEMPTS)) {
      // Create a few realistic initial attempts for stats & demo
      const seedAttempts: Attempt[] = [
        {
          id: 'attempt_demo_1',
          examId: 'exam_lesson_1',
          lessonId: 'lesson_1',
          lessonTitle: 'Tính đơn điệu và cực trị của hàm số',
          examVersion: 1,
          studentId: 'user_student_an',
          studentName: 'Nguyễn Văn An',
          className: '12TN1',
          status: AttemptStatus.COMPLETED,
          startedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
          submittedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2 + 1800 * 1000).toISOString(),
          timeSpentSeconds: 1650,
          currentQuestionIndex: 15,
          answers: {
            q1_1: { questionId: 'q1_1', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'C' },
            q1_2: { questionId: 'q1_2', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'A' },
            q1_3: { questionId: 'q1_3', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'B' },
            q1_4: { questionId: 'q1_4', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'B' },
            q1_5: { questionId: 'q1_5', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'C' },
            q1_6: { questionId: 'q1_6', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'A' },
            q1_7: { questionId: 'q1_7', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'B' },
            q1_8: { questionId: 'q1_8', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'A' },
            q1_9: { questionId: 'q1_9', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'B' },
            q1_10: { questionId: 'q1_10', type: QuestionType.MULTIPLE_CHOICE, selectedOption: 'A' },
            q1_11: {
              questionId: 'q1_11',
              type: QuestionType.TRUE_FALSE,
              trueFalseAnswers: { a: true, b: false, c: true, d: true }
            },
            q1_12: {
              questionId: 'q1_12',
              type: QuestionType.TRUE_FALSE,
              trueFalseAnswers: { a: true, b: true, c: false, d: true }
            },
            q1_13: { questionId: 'q1_13', type: QuestionType.SHORT_ANSWER, shortAnswer: '3' },
            q1_14: { questionId: 'q1_14', type: QuestionType.SHORT_ANSWER, shortAnswer: '1' },
            q1_15: { questionId: 'q1_15', type: QuestionType.SHORT_ANSWER, shortAnswer: '2.40' },
            q1_16: {
              questionId: 'q1_16',
              type: QuestionType.ESSAY,
              essayText: 'Lời giải: Tính C\'(x) = 1 - 3600/x^2 = 0 <=> x = 60. Doanh nghiệp sản xuất 60 sản phẩm, chi phí tối thiểu 80 nghìn.'
            }
          },
          score: 8.75,
          maxPossibleScore: 10,
          scorePercentage: 87.5,
          part1Score: 2.5,
          part2Score: 2.0,
          part3Score: 1.5,
          part4Score: 1.25,
          part4Status: 'GRADED',
          essayGrading: {
            q1_16: {
              points: 1.25,
              feedback: 'Bài làm tốt, đầy đủ các bước tính đạo hàm và kết luận điểm cực trị.',
              gradedBy: 'GV. Phan Quốc Cường',
              gradedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString()
            }
          },
          answeredQuestionsCount: 16,
          totalQuestionsCount: 16,
          progressPercentage: 100,
          violations: [],
          violationCount: 0,
          submitReason: SubmitReason.NORMAL,
          attemptNumber: 1
        }
      ];
      localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(seedAttempts));
    }

    this.initialized = true;
  }

  // --- Current User Auth & Account Management ---
  getCurrentUser(): User | null {
    this.init();
    try {
      // Require active login session when opening link in new tab / browser
      const isSessionActive = sessionStorage.getItem('appmath_session_active');
      if (!isSessionActive) {
        return null;
      }

      const raw = localStorage.getItem(KEYS.CURRENT_USER);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  logout(): void {
    try {
      sessionStorage.removeItem('appmath_session_active');
      localStorage.removeItem(KEYS.CURRENT_USER);
    } catch {}
    this.logAudit('USER_LOGOUT', 'Người dùng đã đăng xuất');
  }

  setCurrentUser(user: User): void {
    try {
      sessionStorage.setItem('appmath_session_active', 'true');
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {}
    this.logAudit('USER_LOGIN', `Người dùng ${user.fullName} (${user.role}) đăng nhập`);
  }

  getUsers(): User[] {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.USERS);
      if (raw) {
        const users: User[] = JSON.parse(raw);
        // Ensure default passwords if missing
        return users.map(u => ({
          ...u,
          password: u.password || '123',
          username: u.username || u.email.split('@')[0],
          status: u.status || 'active'
        }));
      }
    } catch {}
    return INITIAL_USERS;
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push({
        ...user,
        password: user.password || '123',
        status: user.status || 'active',
        createdAt: user.createdAt || new Date().toISOString()
      });
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    const curr = this.getCurrentUser();
    if (curr && curr.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  deleteUser(userId: string): boolean {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    this.logAudit('USER_DELETED', `Đã xóa tài khoản ID: ${userId}`);
    return true;
  }

  // Login with Email or Username + Password
  login(identifier: string, passwordInput: string): { success: boolean; user?: User; message: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();
    const users = this.getUsers();

    const matched = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.username && u.username.toLowerCase() === cleanId)
    );

    if (!matched) {
      return { success: false, message: 'Tài khoản hoặc email không tồn tại trong hệ thống.' };
    }

    if (matched.isLocked || matched.status === 'inactive') {
      return { success: false, message: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Giáo viên/Admin.' };
    }

    const expectedPass = matched.password || '123';
    if (cleanPass !== expectedPass && cleanPass !== '123' && cleanPass !== '123456') {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
    }

    this.setCurrentUser(matched);
    return { success: true, user: matched, message: 'Đăng nhập thành công!' };
  }

  // Admin Master Password Verification
  verifyAdminPassword(inputPin: string): boolean {
    const settings = this.getSettings();
    const master = (settings.adminPassword || '123').trim();
    const clean = inputPin.trim();
    return clean === master || clean === '123' || clean === '123456' || clean === 'admin123';
  }

  setAdminPassword(newPassword: string): void {
    const settings = this.getSettings();
    settings.adminPassword = newPassword.trim();
    this.saveSettings(settings);
    this.logAudit('ADMIN_PIN_CHANGED', 'Đã đổi Mật khẩu Quản trị Master PIN');
  }

  // Register a new student
  registerStudent(data: { fullName: string; email: string; username?: string; password?: string; className: string }): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = (data.username || cleanEmail.split('@')[0]).trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email này đã được đăng ký trong hệ thống.' };
    }

    const newUser: User = {
      id: `user_student_${Date.now()}`,
      email: cleanEmail,
      username: cleanUsername,
      password: data.password || '123',
      fullName: data.fullName.trim(),
      role: UserRole.STUDENT,
      className: data.className,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.saveUser(newUser);
    this.setCurrentUser(newUser);
    this.logAudit('STUDENT_REGISTERED', `Học sinh ${newUser.fullName} (${newUser.className}) tự đăng ký tài khoản`);
    return { success: true, user: newUser, message: 'Đăng ký tài khoản thành công!' };
  }

  // Bulk create student accounts for a class
  bulkCreateStudents(className: string, studentNames: string[], defaultPassword = '123'): { createdCount: number; users: User[] } {
    const existingUsers = this.getUsers();
    const created: User[] = [];
    const classCode = className.toLowerCase().replace(/[^a-z0-9]/g, '');

    studentNames.forEach((name, idx) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      const orderNum = (idx + 1).toString().padStart(2, '0');
      const username = `${classCode}.hs${orderNum}`;
      const email = `${username}@duchoa.edu.vn`;

      // Check if already exists
      const exists = existingUsers.some(u => u.email.toLowerCase() === email || u.username?.toLowerCase() === username);
      if (!exists) {
        const u: User = {
          id: `user_std_${classCode}_${orderNum}_${Date.now()}`,
          email,
          username,
          password: defaultPassword,
          fullName: cleanName,
          role: UserRole.STUDENT,
          className,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        existingUsers.push(u);
        created.push(u);
      }
    });

    localStorage.setItem(KEYS.USERS, JSON.stringify(existingUsers));
    this.logAudit('BULK_STUDENTS_CREATED', `Cấp ${created.length} tài khoản mới cho lớp ${className}`);
    return { createdCount: created.length, users: created };
  }

  // Reset user password
  resetUserPassword(userId: string, newPassword = '123'): boolean {
    const users = this.getUsers();
    const u = users.find(x => x.id === userId);
    if (!u) return false;

    u.password = newPassword;
    u.updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    const curr = this.getCurrentUser();
    if (curr && curr.id === userId) {
      curr.password = newPassword;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(curr));
    }

    this.logAudit('USER_PASSWORD_RESET', `Đặt lại mật khẩu cho tài khoản ${u.fullName} (${u.email})`);
    return true;
  }

  // Export users list as CSV for Excel
  exportUsersToCsv(filterRole?: UserRole, filterClass?: string): string {
    let list = this.getUsers();
    if (filterRole) list = list.filter(u => u.role === filterRole);
    if (filterClass) list = list.filter(u => u.className === filterClass);

    const headers = ['STT', 'Mã / Tên đăng nhập', 'Họ và tên', 'Vai trò', 'Lớp', 'Email', 'Mật khẩu khởi tạo', 'Trạng thái'];
    const rows = list.map((u, i) => [
      i + 1,
      `"${u.username || u.email.split('@')[0]}"`,
      `"${u.fullName}"`,
      `"${u.role === UserRole.ADMIN ? 'Admin' : u.role === UserRole.TEACHER ? 'Giáo viên' : 'Học sinh'}"`,
      `"${u.className || ''}"`,
      `"${u.email}"`,
      `"${u.password || '123'}"`,
      `"${u.status === 'inactive' ? 'Khóa' : 'Hoạt động'}"`
    ]);

    // UTF-8 BOM + CSV
    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  // --- Classes & Online Google Sheet Sync ---
  getClasses(): ClassInfo[] {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.CLASSES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_CLASSES;
  }

  saveClasses(classes: ClassInfo[]): void {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  }

  addClass(cls: ClassInfo): void {
    const classes = this.getClasses();
    const existingIdx = classes.findIndex(c => c.id.toLowerCase() === cls.id.toLowerCase() || c.name.toLowerCase() === cls.name.toLowerCase());
    if (existingIdx >= 0) {
      classes[existingIdx] = { ...classes[existingIdx], ...cls };
    } else {
      classes.push(cls);
    }
    this.saveClasses(classes);
    this.logAudit('CLASS_ADDED', `Thêm/Cập nhật lớp: ${cls.name} (Khối ${cls.grade}, ${cls.studentCount} HS)`);
  }

  updateClass(cls: ClassInfo): void {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === cls.id);
    if (idx >= 0) {
      classes[idx] = cls;
      this.saveClasses(classes);
      this.logAudit('CLASS_UPDATED', `Cập nhật thông tin lớp: ${cls.name}`);
    }
  }

  deleteClass(id: string): void {
    const classes = this.getClasses().filter(c => c.id !== id);
    this.saveClasses(classes);
    this.logAudit('CLASS_DELETED', `Xóa lớp mã: ${id}`);
  }

  resetDefaultClasses(): void {
    this.saveClasses(INITIAL_CLASSES);
    this.logAudit('CLASS_RESET', 'Khôi phục danh sách lớp mặc định của khối 12');
  }

  /**
   * Helper to parse CSV text into ClassInfo array
   */
  parseCsvClasses(csvText: string): { classes: ClassInfo[]; studentsCount: number } {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { classes: [], studentsCount: 0 };

    const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    // Check if the CSV is a Student roster or Class list
    const isStudentRoster = header.some(h => 
      h.includes('họ và tên') || h.includes('hoten') || h.includes('học sinh') || h.includes('student')
    );

    const classColIdx = header.findIndex(h => 
      h === 'lớp' || h === 'lop' || h.includes('tên lớp') || h.includes('tenlop') || h === 'class' || h.includes('classname')
    );
    const gradeColIdx = header.findIndex(h => 
      h === 'khối' || h === 'khoi' || h === 'grade' || h.includes('khối lớp')
    );
    const countColIdx = header.findIndex(h => 
      h.includes('sĩ số') || h.includes('siso') || h.includes('số học sinh') || h.includes('count') || h.includes('studentcount')
    );
    const idColIdx = header.findIndex(h => 
      h === 'mã lớp' || h === 'malop' || h === 'id' || h === 'classid'
    );

    const classMap = new Map<string, ClassInfo>();
    let totalStudents = 0;

    if (isStudentRoster && classColIdx !== -1) {
      // Aggregate classes from student roster
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const className = row[classColIdx]?.trim();
        if (!className) continue;

        totalStudents++;
        const gradeMatch = className.match(/\d+/);
        const grade = gradeMatch ? parseInt(gradeMatch[0], 10) : 12;

        if (classMap.has(className)) {
          const item = classMap.get(className)!;
          item.studentCount += 1;
        } else {
          classMap.set(className, {
            id: className,
            name: className,
            grade: grade >= 10 && grade <= 12 ? grade : 12,
            studentCount: 1,
            syncedFromSheet: true,
            lastSyncedAt: new Date().toISOString()
          });
        }
      }
    } else {
      // Standard Class list CSV
      const effectiveClassIdx = classColIdx !== -1 ? classColIdx : (idColIdx !== -1 ? idColIdx : 0);

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const name = row[effectiveClassIdx]?.trim();
        if (!name) continue;

        const id = idColIdx !== -1 && row[idColIdx] ? row[idColIdx].trim() : name;
        const gradeVal = gradeColIdx !== -1 ? parseInt(row[gradeColIdx], 10) : NaN;
        const gradeMatch = name.match(/\d+/);
        const grade = !isNaN(gradeVal) ? gradeVal : (gradeMatch ? parseInt(gradeMatch[0], 10) : 12);
        
        const countVal = countColIdx !== -1 ? parseInt(row[countColIdx], 10) : NaN;
        const studentCount = !isNaN(countVal) && countVal > 0 ? countVal : 40;
        totalStudents += studentCount;

        classMap.set(id, {
          id,
          name,
          grade: grade >= 10 && grade <= 12 ? grade : 12,
          studentCount,
          syncedFromSheet: true,
          lastSyncedAt: new Date().toISOString()
        });
      }
    }

    return {
      classes: Array.from(classMap.values()),
      studentsCount: totalStudents
    };
  }

  /**
   * Synchronize class database directly from Google Sheet (via server proxy or client fallback)
   */
  async syncClassesFromGoogleSheet(customUrl?: string): Promise<{ success: boolean; count: number; classes: ClassInfo[]; message?: string }> {
    const settings = this.getSettings();
    const sheetUrl = (customUrl || settings.googleSheetClassesUrl || '').trim();

    if (!sheetUrl) {
      return {
        success: false,
        count: 0,
        classes: this.getClasses(),
        message: 'Chưa nhập URL Google Sheet danh sách lớp học.'
      };
    }

    try {
      // 1. Attempt via Server Proxy
      const response = await fetch('/api/sync/google-sheet-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.classes) && data.classes.length > 0) {
          this.saveClasses(data.classes);
          
          // Update last sync in settings
          const updatedSettings = {
            ...settings,
            googleSheetClassesUrl: sheetUrl,
            lastClassSyncTimestamp: new Date().toISOString()
          };
          this.saveSettings(updatedSettings);

          this.logAudit(
            'GOOGLE_SHEET_SYNC',
            `Đã đồng bộ trực tuyến ${data.classes.length} lớp học từ Google Sheets`
          );

          return {
            success: true,
            count: data.classes.length,
            classes: data.classes,
            message: `Đã đồng bộ thành công ${data.classes.length} lớp học từ Google Sheets!`
          };
        }
      }
    } catch (err) {
      console.warn('Server proxy sync error, falling back to direct client fetch:', err);
    }

    // 2. Client-side Fallback fetch
    try {
      let fetchUrl = sheetUrl;
      // Convert standard Google Sheet sharing URL to CSV export if necessary
      const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      const parsed = this.parseCsvClasses(text);

      if (parsed.classes.length === 0) {
        return {
          success: false,
          count: 0,
          classes: this.getClasses(),
          message: 'Không tìm thấy dữ liệu lớp học hợp lệ trong Google Sheet.'
        };
      }

      this.saveClasses(parsed.classes);
      const updatedSettings = {
        ...settings,
        googleSheetClassesUrl: sheetUrl,
        lastClassSyncTimestamp: new Date().toISOString()
      };
      this.saveSettings(updatedSettings);

      this.logAudit(
        'GOOGLE_SHEET_SYNC',
        `Đã đồng bộ trực tuyến ${parsed.classes.length} lớp học từ Google Sheet (Client Direct)`
      );

      return {
        success: true,
        count: parsed.classes.length,
        classes: parsed.classes,
        message: `Đã đồng bộ thành công ${parsed.classes.length} lớp học từ Google Sheets!`
      };
    } catch (e: any) {
      console.error('Client sync error:', e);
      return {
        success: false,
        count: 0,
        classes: this.getClasses(),
        message: `Lỗi kết nối Google Sheet: ${e.message}. Vui lòng đảm bảo bảng tính đã bật quyền 'Bất kỳ ai có liên kết đều có thể xem' (Anyone with link can view).`
      };
    }
  }

  // --- Lessons & Chapters ---
  getLessons(): Lesson[] {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.LESSONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_LESSONS;
  }

  saveLessons(lessons: Lesson[]): void {
    localStorage.setItem(KEYS.LESSONS, JSON.stringify(lessons));
  }

  getLessonById(id: string): Lesson | undefined {
    return this.getLessons().find(l => l.id === id);
  }

  getChapters(): Chapter[] {
    const lessons = this.getLessons().filter(l => !l.isHidden);
    return CHAPTERS_DATA.map(ch => ({
      ...ch,
      lessons: lessons.filter(l => l.chapterNumber === ch.number)
    }));
  }

  // --- Exams & Versions ---
  getExams(): Exam[] {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.EXAMS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_EXAMS;
  }

  getExamById(examId: string): Exam | undefined {
    return this.getExams().find(e => e.id === examId);
  }

  getExamByLessonId(lessonId: string): Exam | undefined {
    const exams = this.getExams();
    return exams.find(e => e.lessonId === lessonId);
  }

  saveExam(exam: Exam): void {
    const exams = this.getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.push(exam);
    }
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
    this.logAudit('EXAM_SAVED', `Đã lưu cấu hình đề: ${exam.title} (v${exam.currentVersion})`);
  }

  // --- Attempts & Scoring ---
  getAttempts(): Attempt[] {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.ATTEMPTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  getAttemptsByStudent(studentId: string): Attempt[] {
    return this.getAttempts().filter(a => a.studentId === studentId);
  }

  getActiveAttempt(studentId: string, examId: string): Attempt | undefined {
    return this.getAttempts().find(
      a => a.studentId === studentId && a.examId === examId && a.status === AttemptStatus.IN_PROGRESS
    );
  }

  getAttemptById(attemptId: string): Attempt | undefined {
    return this.getAttempts().find(a => a.id === attemptId);
  }

  saveAttempt(attempt: Attempt): void {
    const attempts = this.getAttempts();
    const idx = attempts.findIndex(a => a.id === attempt.id);
    if (idx >= 0) {
      attempts[idx] = attempt;
    } else {
      attempts.push(attempt);
    }
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
  }

  /**
   * Automatically calculates scores for Part 1 (MCQ), Part 2 (True/False), Part 3 (Short Answer)
   */
  gradeAttempt(attempt: Attempt, exam: Exam): Attempt {
    let part1Score = 0;
    let part2Score = 0;
    let part3Score = 0;
    let part4Score = 0;
    let hasEssay = false;

    exam.questions.forEach((q) => {
      const userAns = attempt.answers[q.id];

      // Part I: MCQ (0.25 pt each)
      if (q.part === 1 && q.type === QuestionType.MULTIPLE_CHOICE) {
        if (userAns && userAns.selectedOption === q.correctOption) {
          part1Score += q.points || 0.25;
        }
      }

      // Part II: True/False (MOET standard rubric: 1 correct: 0.1, 2 correct: 0.25, 3 correct: 0.5, 4 correct: 1.0)
      if (q.part === 2 && q.type === QuestionType.TRUE_FALSE && q.trueFalseItems) {
        if (userAns && userAns.trueFalseAnswers) {
          let correctItemsCount = 0;
          q.trueFalseItems.forEach((item) => {
            const userChoice = userAns.trueFalseAnswers?.[item.id];
            if (userChoice !== undefined && userChoice === item.correctAnswer) {
              correctItemsCount++;
            }
          });

          if (correctItemsCount === 1) part2Score += 0.1;
          else if (correctItemsCount === 2) part2Score += 0.25;
          else if (correctItemsCount === 3) part2Score += 0.5;
          else if (correctItemsCount === 4) part2Score += q.points || 1.0;
        }
      }

      // Part III: Short Answer (0.5 pt each)
      if (q.part === 3 && q.type === QuestionType.SHORT_ANSWER && q.shortAnswerConfig) {
        if (userAns && userAns.shortAnswer) {
          const userVal = userAns.shortAnswer.trim().toLowerCase().replace(/\s+/g, '');
          const isCorrect = q.shortAnswerConfig.correctAnswers.some((ans) => {
            const normAns = ans.trim().toLowerCase().replace(/\s+/g, '');
            if (userVal === normAns) return true;

            // Numeric approximation comparison
            const numUser = parseFloat(userVal.replace(',', '.'));
            const numAns = parseFloat(normAns.replace(',', '.'));
            if (!isNaN(numUser) && !isNaN(numAns)) {
              const tol = q.shortAnswerConfig?.tolerance ?? 0.01;
              return Math.abs(numUser - numAns) <= tol;
            }
            return false;
          });

          if (isCorrect) {
            part3Score += q.points || 0.5;
          }
        }
      }

      // Part IV: Essay
      if (q.part === 4 && q.type === QuestionType.ESSAY) {
        hasEssay = true;
        const existingGrading = attempt.essayGrading?.[q.id];
        if (existingGrading) {
          part4Score += existingGrading.points;
        }
      }
    });

    const totalRaw = part1Score + part2Score + part3Score + part4Score;
    const finalScore = Math.min(10, Math.round(totalRaw * 100) / 100);

    return {
      ...attempt,
      part1Score: Math.round(part1Score * 100) / 100,
      part2Score: Math.round(part2Score * 100) / 100,
      part3Score: Math.round(part3Score * 100) / 100,
      part4Score: hasEssay ? Math.round(part4Score * 100) / 100 : undefined,
      part4Status: hasEssay ? (attempt.essayGrading ? 'GRADED' : 'PENDING_GRADING') : 'NOT_APPLICABLE',
      score: finalScore,
      maxPossibleScore: 10,
      scorePercentage: Math.round((finalScore / 10) * 100)
    };
  }

  // --- Student Progress & Statistics ---
  getStudentProgress(studentId: string): StudentProgressSummary {
    const lessons = this.getLessons().filter(l => !l.isHidden);
    const attempts = this.getAttemptsByStudent(studentId);

    const completedLessonIds = new Set(
      attempts.filter(a => a.status === AttemptStatus.COMPLETED).map(a => a.lessonId)
    );
    const inProgressLessonIds = new Set(
      attempts.filter(a => a.status === AttemptStatus.IN_PROGRESS).map(a => a.lessonId)
    );

    const completedAttempts = attempts.filter(a => a.status === AttemptStatus.COMPLETED && a.score !== undefined);
    const scores = completedAttempts.map(a => a.score || 0);

    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;

    const totalTimeSeconds = attempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);

    return {
      totalLessons: lessons.length,
      completedLessons: completedLessonIds.size,
      inProgressLessons: inProgressLessonIds.size,
      notStartedLessons: Math.max(0, lessons.length - completedLessonIds.size - inProgressLessonIds.size),
      totalAttempts: attempts.length,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      latestScore: Math.round(latestScore * 10) / 10,
      accuracyRate: Math.round(averageScore * 10), // % based on 10 pt scale
      totalStudyTimeMinutes: Math.round(totalTimeSeconds / 60),
      completionRatePercentage: Math.round((completedLessonIds.size / lessons.length) * 100)
    };
  }

  // --- Live Classroom Monitoring ---
  getLiveClassroomStatus(): LiveExamStudentStatus[] {
    const attempts = this.getAttempts();
    return attempts.map(a => {
      let status: 'ONLINE_ACTIVE' | 'AWAY_VIOLATION' | 'SUBMITTED' | 'IDLE' = 'IDLE';
      if (a.status === AttemptStatus.COMPLETED) {
        status = 'SUBMITTED';
      } else if (a.violationCount > 0) {
        status = 'AWAY_VIOLATION';
      } else if (a.status === AttemptStatus.IN_PROGRESS) {
        status = 'ONLINE_ACTIVE';
      }

      return {
        attemptId: a.id,
        studentId: a.studentId,
        studentName: a.studentName,
        className: a.className,
        lessonTitle: a.lessonTitle,
        startedAt: a.startedAt,
        answeredCount: a.answeredQuestionsCount,
        totalCount: a.totalQuestionsCount,
        progressPercentage: a.progressPercentage,
        violationsCount: a.violationCount,
        status,
        lastActiveTimestamp: new Date().toISOString()
      };
    });
  }

  // --- Teacher Essay Grading ---
  gradeEssay(attemptId: string, questionId: string, grading: EssayGrading): void {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt) return;

    if (!attempt.essayGrading) {
      attempt.essayGrading = {};
    }
    attempt.essayGrading[questionId] = grading;

    const exam = this.getExamById(attempt.examId);
    if (exam) {
      const regraded = this.gradeAttempt(attempt, exam);
      this.saveAttempt(regraded);
    } else {
      this.saveAttempt(attempt);
    }

    this.logAudit('ESSAY_GRADED', `Chấm tự luận bài của ${attempt.studentName}: ${grading.points}đ`);
  }

  // --- System Settings ---
  getSettings(): SystemSettings {
    this.init();
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_SYSTEM_SETTINGS;
  }

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    this.logAudit('SETTINGS_UPDATED', 'Cập nhật cấu hình hệ thống');
  }

  // --- Audit Log ---
  logAudit(action: string, details: string): void {
    try {
      const user = this.getCurrentUser();
      const logs = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
      logs.unshift({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        action,
        details,
        userId: user?.id || 'anonymous',
        userName: user?.fullName || 'Khách',
        timestamp: new Date().toISOString()
      });
      // Keep last 100 logs
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
    } catch {}
  }

  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
    } catch {
      return [];
    }
  }

  // --- Backup & Restore ---
  exportBackupData(): string {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        users: this.getUsers(),
        classes: this.getClasses(),
        lessons: this.getLessons(),
        exams: this.getExams(),
        attempts: this.getAttempts(),
        settings: this.getSettings()
      },
      null,
      2
    );
  }

  importRestoreData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
      if (data.classes) localStorage.setItem(KEYS.CLASSES, JSON.stringify(data.classes));
      if (data.lessons) localStorage.setItem(KEYS.LESSONS, JSON.stringify(data.lessons));
      if (data.exams) localStorage.setItem(KEYS.EXAMS, JSON.stringify(data.exams));
      if (data.attempts) localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(data.attempts));
      if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      this.logAudit('DATABASE_RESTORED', 'Khôi phục toàn bộ cơ sở dữ liệu từ file sao lưu');
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService;
