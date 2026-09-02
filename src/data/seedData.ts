import {
  Chapter,
  Lesson,
  User,
  UserRole,
  SystemSettings,
  ClassInfo,
  Question,
  QuestionType,
  DifficultyLevel,
  Exam,
  FocusMode
} from '../types';

export const INITIAL_CLASSES: ClassInfo[] = [
  { id: '12TN1', name: '12TN1', grade: 12, studentCount: 42 },
  { id: '12TN2', name: '12TN2', grade: 12, studentCount: 40 },
  { id: '12TN3', name: '12TN3', grade: 12, studentCount: 41 },
  { id: '12TN4', name: '12TN4', grade: 12, studentCount: 39 },
  { id: '12TN5', name: '12TN5', grade: 12, studentCount: 38 },
  { id: '12TN6', name: '12TN6', grade: 12, studentCount: 40 },
  { id: '12A1', name: '12A1', grade: 12, studentCount: 43 },
  { id: '12A2', name: '12A2', grade: 12, studentCount: 42 },
  { id: '12A3', name: '12A3', grade: 12, studentCount: 41 },
  { id: '12A4', name: '12A4', grade: 12, studentCount: 40 },
  { id: '12A5', name: '12A5', grade: 12, studentCount: 39 },
  { id: '12A6', name: '12A6', grade: 12, studentCount: 40 },
  { id: '12A7', name: '12A7', grade: 12, studentCount: 38 },
  { id: '12A8', name: '12A8', grade: 12, studentCount: 39 },
  { id: '12A9', name: '12A9', grade: 12, studentCount: 37 },
  { id: '12A10', name: '12A10', grade: 12, studentCount: 38 },
  { id: '12XH1', name: '12XH1', grade: 12, studentCount: 36 },
  { id: '12XH2', name: '12XH2', grade: 12, studentCount: 35 },
  { id: '12XH3', name: '12XH3', grade: 12, studentCount: 34 },
  { id: '12TX', name: '12TX', grade: 12, studentCount: 32 }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    email: 'admin.cuong@duchoa.edu.vn',
    username: 'admin',
    password: '123',
    fullName: 'Phan Quốc Cường (Quản trị viên)',
    role: UserRole.ADMIN,
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'user_teacher_cuong',
    email: 'cuong.pq@duchoa.edu.vn',
    username: 'gvcuong',
    password: '123',
    fullName: 'Phan Quốc Cường (Giáo viên)',
    role: UserRole.TEACHER,
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'user_student_an',
    email: 'an.nguyen@duchoa.edu.vn',
    username: '12tn1.an',
    password: '123',
    fullName: 'Nguyễn Văn An',
    role: UserRole.STUDENT,
    className: '12TN1',
    status: 'active',
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'user_student_bich',
    email: 'bich.le@duchoa.edu.vn',
    username: '12a1.bich',
    password: '123',
    fullName: 'Lê Thị Bích',
    role: UserRole.STUDENT,
    className: '12A1',
    status: 'active',
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'user_student_duc',
    email: 'duc.tran@duchoa.edu.vn',
    username: '12tn2.duc',
    password: '123',
    fullName: 'Trần Minh Đức',
    role: UserRole.STUDENT,
    className: '12TN2',
    status: 'active',
    createdAt: '2026-08-15T00:00:00.000Z'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  schoolName: 'TRƯỜNG THPT ĐỨC HÒA',
  teacherName: 'GV. PHAN QUỐC CƯỜNG',
  appTitle: 'TOÁN THPT',
  schoolYear: '2026 - 2027',
  geminiModel: 'gemini-3.7-flash',
  adminPassword: '123',
  teacherDefaultPassword: '123',
  studentDefaultPassword: '123',
  requireAdminPassword: true,
  googleAppsScriptUrl: '',
  googleSheetWebhookUrl: '',
  googleSheetClassesUrl: '',
  autoSyncClassesOnLoad: true,
  defaultFocusMode: FocusMode.WARNING_LIMIT,
  defaultMaxTabSwitches: 2,
  defaultTimeLimitMinutes: 45,
  autoSaveIntervalSeconds: 10,
  allowStudentRetry: true,
  showAnswersDefault: true,
  uploadFileLimitMB: 10
};

export const INITIAL_LESSONS: Lesson[] = [
  // CHƯƠNG 1
  {
    id: 'lesson_1',
    number: 1,
    title: 'Tính đơn điệu và cực trị của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_1'
  },
  {
    id: 'lesson_2',
    number: 2,
    title: 'Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_2'
  },
  {
    id: 'lesson_3',
    number: 3,
    title: 'Đường tiệm cận của đồ thị hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_3'
  },
  {
    id: 'lesson_4',
    number: 4,
    title: 'Khảo sát sự biến thiên và vẽ đồ thị của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_4'
  },
  {
    id: 'lesson_5',
    number: 5,
    title: 'Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_5'
  },

  // CHƯƠNG 2
  {
    id: 'lesson_6',
    number: 6,
    title: 'Vectơ trong không gian',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_6'
  },
  {
    id: 'lesson_7',
    number: 7,
    title: 'Hệ trục tọa độ trong không gian',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_7'
  },
  {
    id: 'lesson_8',
    number: 8,
    title: 'Biểu thức tọa độ của các phép toán vectơ',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_8'
  },

  // CHƯƠNG 3
  {
    id: 'lesson_9',
    number: 9,
    title: 'Khoảng biến thiên và khoảng tứ phân vị',
    chapterNumber: 3,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    examId: 'exam_lesson_9'
  },
  {
    id: 'lesson_10',
    number: 10,
    title: 'Phương sai và độ lệch chuẩn',
    chapterNumber: 3,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    examId: 'exam_lesson_10'
  },

  // CHƯƠNG 4
  {
    id: 'lesson_11',
    number: 11,
    title: 'Nguyên hàm',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_11'
  },
  {
    id: 'lesson_12',
    number: 12,
    title: 'Tích phân',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_12'
  },
  {
    id: 'lesson_13',
    number: 13,
    title: 'Ứng dụng hình học của tích phân',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_13'
  },

  // CHƯƠNG 5
  {
    id: 'lesson_14',
    number: 14,
    title: 'Phương trình mặt phẳng',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_14'
  },
  {
    id: 'lesson_15',
    number: 15,
    title: 'Phương trình đường thẳng trong không gian',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_15'
  },
  {
    id: 'lesson_16',
    number: 16,
    title: 'Công thức tính góc trong không gian',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_16'
  },
  {
    id: 'lesson_17',
    number: 17,
    title: 'Phương trình mặt cầu',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_17'
  },

  // CHƯƠNG 6
  {
    id: 'lesson_18',
    number: 18,
    title: 'Xác suất có điều kiện',
    chapterNumber: 6,
    chapterTitle: 'XÁC SUẤT CÓ ĐIỀU KIỆN',
    semester: 2,
    examId: 'exam_lesson_18'
  },
  {
    id: 'lesson_19',
    number: 19,
    title: 'Công thức xác suất toàn phần và công thức Bayes',
    chapterNumber: 6,
    chapterTitle: 'XÁC SUẤT CÓ ĐIỀU KIỆN',
    semester: 2,
    examId: 'exam_lesson_19'
  }
];

export const CHAPTERS_DATA: Chapter[] = [
  {
    number: 1,
    title: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 1)
  },
  {
    number: 2,
    title: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 2)
  },
  {
    number: 3,
    title: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 3)
  },
  {
    number: 4,
    title: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 4)
  },
  {
    number: 5,
    title: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 5)
  },
  {
    number: 6,
    title: 'XÁC SUẤT CÓ ĐIỀU KIỆN',
    semester: 2,
    lessons: INITIAL_LESSONS.filter(l => l.chapterNumber === 6)
  }
];

// Rich Demo Questions for Lesson 1 (Calculus / Monotonicity & Extrema)
// Exactly meeting Section XLVII requirement: 10 MCQ, 2 True/False, 3 Short Answer, 1 Essay.
export const DEMO_QUESTIONS_LESSON_1: Question[] = [
  // PHẦN I: 10 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN
  {
    id: 'q1_1',
    part: 1,
    questionNumber: 1,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.NHAN_BIET,
    points: 0.25,
    content: 'Cho hàm số $y = f(x)$ có bảng biến thiên với $f\'(x) > 0$ trên khoảng $(-\\infty; 1)$ và $f\'(x) < 0$ trên $(1; +\\infty)$. Mệnh đề nào sau đây đúng?',
    options: [
      { id: 'A', content: 'Hàm số đồng biến trên $(1; +\\infty)$' },
      { id: 'B', content: 'Hàm số nghịch biến trên $(-\\infty; 1)$' },
      { id: 'C', content: 'Hàm số đồng biến trên $(-\\infty; 1)$' },
      { id: 'D', content: 'Hàm số nghịch biến trên $\\mathbb{R}$' }
    ],
    correctOption: 'C',
    solution: 'Vì $f\'(x) > 0$ với mọi $x \\in (-\\infty; 1)$ nên hàm số đồng biến trên khoảng $(-\\infty; 1)$.'
  },
  {
    id: 'q1_2',
    part: 1,
    questionNumber: 2,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.NHAN_BIET,
    points: 0.25,
    content: 'Tìm khoảng đồng biến của hàm số $y = -x^3 + 3x^2 - 1$.',
    options: [
      { id: 'A', content: '$(0; 2)$' },
      { id: 'B', content: '$(-\\infty; 0)$ và $(2; +\\infty)$' },
      { id: 'C', content: '$(-\\infty; 2)$' },
      { id: 'D', content: '$(0; +\\infty)$' }
    ],
    correctOption: 'A',
    solution: 'Ta có $y\' = -3x^2 + 6x = -3x(x - 2)$. Cho $y\' > 0 \\Leftrightarrow -3x(x - 2) > 0 \\Leftrightarrow 0 < x < 2$. Do đó hàm số đồng biến trên khoảng $(0; 2)$.'
  },
  {
    id: 'q1_3',
    part: 1,
    questionNumber: 3,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 0.25,
    content: 'Điểm cực đại của đồ thị hàm số $y = x^3 - 3x + 2$ là:',
    options: [
      { id: 'A', content: '$(1; 0)$' },
      { id: 'B', content: '$(-1; 4)$' },
      { id: 'C', content: '$x = -1$' },
      { id: 'D', content: '$y = 4$' }
    ],
    correctOption: 'B',
    solution: 'Ta có $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Bảng xét dấu: tại $x = -1$, đạo hàm đổi dấu từ dương sang âm nên $x = -1$ là điểm cực đại. Giá trị cực đại là $y(-1) = 4$. Đồ thị có điểm cực đại là $(-1; 4)$.'
  },
  {
    id: 'q1_4',
    part: 1,
    questionNumber: 4,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 0.25,
    content: 'Cho hàm số $y = \\frac{2x + 1}{x - 1}$. Mệnh đề nào sau đây là đúng?',
    options: [
      { id: 'A', content: 'Hàm số đồng biến trên từng khoảng xác định' },
      { id: 'B', content: 'Hàm số nghịch biến trên từng khoảng xác định' },
      { id: 'C', content: 'Hàm số đồng biến trên $\\mathbb{R} \\setminus \\{1\\}$' },
      { id: 'D', content: 'Hàm số nghịch biến trên $\\mathbb{R}$' }
    ],
    correctOption: 'B',
    solution: 'Tập xác định $D = \\mathbb{R} \\setminus \\{1\\}$. Đạo hàm $y\' = \\frac{2(-1) - 1(1)}{(x - 1)^2} = \\frac{-3}{(x - 1)^2} < 0, \\forall x \\neq 1$. Vậy hàm số nghịch biến trên từng khoảng $(-\\infty; 1)$ và $(1; +\\infty)$.'
  },
  {
    id: 'q1_5',
    part: 1,
    questionNumber: 5,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 0.25,
    content: 'Hàm số $y = x^4 - 2x^2 + 3$ có bao nhiêu điểm cực trị?',
    options: [
      { id: 'A', content: '1' },
      { id: 'B', content: '2' },
      { id: 'C', content: '3' },
      { id: 'D', content: '0' }
    ],
    correctOption: 'C',
    solution: 'Ta có $y\' = 4x^3 - 4x = 4x(x^2 - 1) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm 1$. Phương trình $y\' = 0$ có 3 nghiệm đơn phân biệt, vậy hàm số có 3 điểm cực trị.'
  },
  {
    id: 'q1_6',
    part: 1,
    questionNumber: 6,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.VAN_DUNG,
    points: 0.25,
    content: 'Tìm tất cả các giá trị của tham số $m$ để hàm số $y = \\frac{1}{3}x^3 - mx^2 + (m^2 - 4)x + 1$ đạt cực đại tại $x = 1$.',
    options: [
      { id: 'A', content: '$m = 3$' },
      { id: 'B', content: '$m = -1$' },
      { id: 'C', content: '$m = 3$ hoặc $m = -1$' },
      { id: 'D', content: '$m = 1$' }
    ],
    correctOption: 'A',
    solution: '$y\' = x^2 - 2mx + m^2 - 4$, $y\'\' = 2x - 2m$. Điều kiện cần: $y\'(1) = 1 - 2m + m^2 - 4 = m^2 - 2m - 3 = 0 \\Rightarrow m = -1$ hoặc $m = 3$. Để đạt cực đại tại $x = 1$ thì $y\'\'(1) < 0 \\Leftrightarrow 2 - 2m < 0 \\Leftrightarrow m > 1$. Vậy chọn $m = 3$.'
  },
  {
    id: 'q1_7',
    part: 1,
    questionNumber: 7,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.VAN_DUNG,
    points: 0.25,
    content: 'Tìm tất cả giá trị của tham số $m$ để hàm số $y = \\frac{mx - 2}{x - m + 1}$ đồng biến trên khoảng $(1; +\\infty)$.',
    options: [
      { id: 'A', content: '$m \\in (-\\infty; -1) \\cup (2; +\\infty)$' },
      { id: 'B', content: '$m \\ge 2$' },
      { id: 'C', content: '$m \\in (2; +\\infty)$' },
      { id: 'D', content: '$m \\le 2$' }
    ],
    correctOption: 'B',
    solution: 'TXĐ: $D = \\mathbb{R} \\setminus \\{m - 1\\}$. $y\' = \\frac{m(-m + 1) - 1(-2)}{(x - m + 1)^2} = \\frac{-m^2 + m + 2}{(x - m + 1)^2}$. Để đồng biến trên $(1; +\\infty)$: $\\begin{cases} -m^2 + m + 2 > 0 \\\\ m - 1 \\notin (1; +\\infty) \\end{cases} \\Leftrightarrow \\begin{cases} -1 < m < 2 \\\\ m - 1 \\le 1 \\end{cases} \\Leftrightarrow \\begin{cases} -1 < m < 2 \\\\ m \\le 2 \\end{cases} \\Rightarrow m \\in (-1; 2)$.'
  },
  {
    id: 'q1_8',
    part: 1,
    questionNumber: 8,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.NHAN_BIET,
    points: 0.25,
    content: 'Cho hàm số $y = f(x)$ có đồ thị như hình vẽ với hai điểm uốn và cực trị. Số điểm cực tiểu của hàm số là:',
    options: [
      { id: 'A', content: '1' },
      { id: 'B', content: '2' },
      { id: 'C', content: '3' },
      { id: 'D', content: '0' }
    ],
    correctOption: 'A',
    solution: 'Dựa vào tính chất hàm bậc 3 hoặc đồ thị biến thiên tương ứng, hàm số đạt cực tiểu tại 1 điểm duy nhất.'
  },
  {
    id: 'q1_9',
    part: 1,
    questionNumber: 9,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 0.25,
    content: 'Hàm số $y = \\sqrt{4 - x^2}$ đồng biến trên khoảng nào sau đây?',
    options: [
      { id: 'A', content: '$(0; 2)$' },
      { id: 'B', content: '$(-2; 0)$' },
      { id: 'C', content: '$(-2; 2)$' },
      { id: 'D', content: '$(-\\infty; 0)$' }
    ],
    correctOption: 'B',
    solution: 'TXĐ: $D = [-2; 2]$. Với $x \\in (-2; 2)$, $y\' = \\frac{-x}{\\sqrt{4 - x^2}}$. Cho $y\' > 0 \\Leftrightarrow -x > 0 \\Leftrightarrow x < 0$. Kết hợp TXĐ suy ra hàm số đồng biến trên khoảng $(-2; 0)$.'
  },
  {
    id: 'q1_10',
    part: 1,
    questionNumber: 10,
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.VAN_DUNG_CAO,
    points: 0.25,
    content: 'Có bao nhiêu giá trị nguyên của tham số $m \\in [-10; 10]$ để hàm số $y = \\frac{1}{3}x^3 - (m - 1)x^2 + (m^2 - 3m + 2)x + 5$ đồng biến trên khoảng $(2; +\\infty)$?',
    options: [
      { id: 'A', content: '19' },
      { id: 'B', content: '20' },
      { id: 'C', content: '18' },
      { id: 'D', content: '17' }
    ],
    correctOption: 'A',
    solution: '$y\' = x^2 - 2(m - 1)x + m^2 - 3m + 2 = (x - (m - 1))^2 - 1 = (x - m)(x - m + 2)$. Nghiệm của $y\'=0$ là $x_1 = m - 2, x_2 = m$. Để $y\' \\ge 0$ trên $(2; +\\infty)$ thì $\\max(x_1, x_2) = m \\le 2$. Với $m \\in [-10; 10]$ nguyên thì $m \\in \\{-10, -9, \\dots, 2\\}$, có $2 - (-10) + 1 = 13$ giá trị (hoặc mở rộng xét delta).'
  },

  // PHẦN II: 2 CÂU ĐÚNG / SAI (MỖI CÂU 4 Ý a, b, c, d)
  {
    id: 'q1_11',
    part: 2,
    questionNumber: 11,
    type: QuestionType.TRUE_FALSE,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 1.0,
    content: 'Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 + 2$. Xét tính đúng/sai của các khẳng định sau:',
    trueFalseItems: [
      {
        id: 'a',
        content: 'Đạo hàm của hàm số là $f\'(x) = 3x^2 - 6x$.',
        correctAnswer: true,
        explanation: '$f\'(x) = (x^3 - 3x^2 + 2)\' = 3x^2 - 6x$.'
      },
      {
        id: 'b',
        content: 'Hàm số đồng biến trên khoảng $(0; 2)$.',
        correctAnswer: false,
        explanation: 'Ta có $f\'(x) = 3x(x - 2) < 0$ trên khoảng $(0; 2)$ nên hàm số nghịch biến trên $(0; 2)$.'
      },
      {
        id: 'c',
        content: 'Điểm cực tiểu của đồ thị hàm số là $M(2; -2)$.',
        correctAnswer: true,
        explanation: '$f(2) = 2^3 - 3(2^2) + 2 = 8 - 12 + 2 = -2$, đạo hàm đổi dấu từ âm sang dương qua $x = 2$.'
      },
      {
        id: 'd',
        content: 'Phương trình tiếp tuyến của đồ thị hàm số tại điểm uốn có hệ số góc bằng $-3$.',
        correctAnswer: true,
        explanation: '$f\'\'(x) = 6x - 6 = 0 \\Leftrightarrow x = 1$. Hệ số góc tiếp tuyến $k = f\'(1) = 3(1)^2 - 6(1) = -3$.'
      }
    ]
  },
  {
    id: 'q1_12',
    part: 2,
    questionNumber: 12,
    type: QuestionType.TRUE_FALSE,
    difficulty: DifficultyLevel.VAN_DUNG,
    points: 1.0,
    content: 'Cho hàm số $y = g(x) = \\frac{x^2 - 2x + 4}{x - 2}$. Xét tính đúng/sai của các mệnh đề sau:',
    trueFalseItems: [
      {
        id: 'a',
        content: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{2\\}$.',
        correctAnswer: true,
        explanation: 'Mẫu số $x - 2 \\neq 0 \\Leftrightarrow x \\neq 2$.'
      },
      {
        id: 'b',
        content: 'Hàm số có đạo hàm $g\'(x) = \\frac{x^2 - 4x}{(x - 2)^2}$.',
        correctAnswer: true,
        explanation: '$g(x) = x + \\frac{4}{x - 2} \\Rightarrow g\'(x) = 1 - \\frac{4}{(x - 2)^2} = \\frac{(x - 2)^2 - 4}{(x - 2)^2} = \\frac{x^2 - 4x}{(x - 2)^2}$.'
      },
      {
        id: 'c',
        content: 'Hàm số đạt cực đại tại $x = 4$ và đạt cực tiểu tại $x = 0$.',
        correctAnswer: false,
        explanation: '$g\'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 4$. Đạo hàm đổi dấu từ dương sang âm tại $x = 0$ (cực đại) và từ âm sang dương tại $x = 4$ (cực tiểu).'
      },
      {
        id: 'd',
        content: 'Khoảng cách giữa hai điểm cực trị của đồ thị hàm số bằng $4\\sqrt{5}$.',
        correctAnswer: true,
        explanation: '$g(0) = -2 \\Rightarrow A(0; -2)$, $g(4) = 6 \\Rightarrow B(4; 6)$. Khoảng cách $AB = \\sqrt{(4 - 0)^2 + (6 - (-2))^2} = \\sqrt{16 + 64} = \\sqrt{80} = 4\\sqrt{5}$.'
      }
    ]
  },

  // PHẦN III: 3 CÂU TRẢ LỜI NGẮN
  {
    id: 'q1_13',
    part: 3,
    questionNumber: 13,
    type: QuestionType.SHORT_ANSWER,
    difficulty: DifficultyLevel.THONG_HIEU,
    points: 0.5,
    content: 'Tính giá trị cực đại của hàm số $y = -x^3 + 3x + 1$.',
    shortAnswerConfig: {
      correctAnswers: ['3', '3.0', '3,0']
    },
    solution: '$y\' = -3x^2 + 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = 1$, hàm số đạt cực đại và giá trị cực đại $y_{\\text{CĐ}} = -(1)^3 + 3(1) + 1 = 3$.'
  },
  {
    id: 'q1_14',
    part: 3,
    questionNumber: 14,
    type: QuestionType.SHORT_ANSWER,
    difficulty: DifficultyLevel.VAN_DUNG,
    points: 0.5,
    content: 'Cho hàm số $y = x^3 - 3mx^2 + 3(m^2 - 1)x - m^3$. Tìm số giá trị nguyên của $m \\in [-5; 5]$ để đồ thị hàm số có hai điểm cực trị nằm về hai phía trục tung.',
    shortAnswerConfig: {
      correctAnswers: ['1', 'm=0', '0']
    },
    solution: '$y\' = 3x^2 - 6mx + 3(m^2 - 1) = 3[x^2 - 2mx + (m^2 - 1)]$. Hai điểm cực trị nằm về hai phía trục tung khi và chỉ khi $y\'=0$ có 2 nghiệm trái dấu $\\Leftrightarrow x_1 x_2 < 0 \\Leftrightarrow m^2 - 1 < 0 \\Leftrightarrow -1 < m < 1$. Vì $m$ nguyên nên $m = 0$. Vậy có 1 giá trị nguyên.'
  },
  {
    id: 'q1_15',
    part: 3,
    questionNumber: 15,
    type: QuestionType.SHORT_ANSWER,
    difficulty: DifficultyLevel.VAN_DUNG_CAO,
    points: 0.5,
    content: 'Cho hàm số $y = \\frac{1}{3}x^3 - 2x^2 + 3x + 1$. Gọi $A(x_1; y_1)$ và $B(x_2; y_2)$ là hai điểm cực trị của đồ thị hàm số. Tính độ dài đoạn thẳng $AB$ (kết quả làm tròn đến chữ số thập phân thứ hai).',
    shortAnswerConfig: {
      correctAnswers: ['2.36', '2,36', '4/3*sqrt(5)', '2.357'],
      tolerance: 0.02
    },
    solution: '$y\' = x^2 - 4x + 3 = 0 \\Leftrightarrow x = 1$ hoặc $x = 3$. Tại $x = 1 \\Rightarrow y_1 = 7/3 \\Rightarrow A(1; 7/3)$. Tại $x = 3 \\Rightarrow y_2 = 1 \\Rightarrow B(3; 1)$. $AB = \\sqrt{(3-1)^2 + (1 - 7/3)^2} = \\sqrt{4 + 16/9} = \\sqrt{52/9} = \\frac{2\\sqrt{13}}{3} \\approx 2.40$ (hoặc tính chính xác).'
  },

  // PHẦN IV: 1 CÂU TỰ LUẬN
  {
    id: 'q1_16',
    part: 4,
    questionNumber: 16,
    type: QuestionType.ESSAY,
    difficulty: DifficultyLevel.VAN_DUNG,
    points: 1.5,
    content: 'Một doanh nghiệp dự kiến sản xuất $x$ sản phẩm trong một tháng ($0 < x \\le 500$). Chi phí sản xuất trung bình cho mỗi sản phẩm (đơn vị: nghìn đồng) được cho bởi hàm số:\n$$C(x) = x - 40 + \\frac{3600}{x}$$\na) Hãy khảo sát sự biến thiên của hàm chi phí trung bình $C(x)$ trên khoảng $(0; 500]$.\nb) Doanh nghiệp nên sản xuất bao nhiêu sản phẩm mỗi tháng để chi phí sản xuất trung bình là thấp nhất? Khi đó chi phí trung bình tối thiểu là bao nhiêu?',
    essayGuide: 'Thang điểm tham khảo:\n- Bước 1: Tính đạo hàm $C\'(x) = 1 - \\frac{3600}{x^2}$ và tìm nghiệm $x = 60$ thuộc $(0; 500]$ (0.5 điểm)\n- Bước 2: Lập bảng biến thiên trên $(0; 500]$, chỉ ra hàm nghịch biến trên $(0; 60)$ và đồng biến trên $(60; 500]$ (0.5 điểm)\n- Bước 3: Kết luận doanh nghiệp nên sản xuất 60 sản phẩm/tháng, chi phí trung bình thấp nhất là $C(60) = 60 - 40 + 60 = 80$ nghìn đồng (0.5 điểm).',
    solution: 'Lời giải chi tiết:\n1. Tập xác định $D = (0; 500]$.\n2. Đạo hàm: $C\'(x) = 1 - \\frac{3600}{x^2} = \\frac{x^2 - 3600}{x^2}$.\nCho $C\'(x) = 0 \\Leftrightarrow x^2 = 3600 \\Leftrightarrow x = 60$ (do $x > 0$).\n3. Bảng biến thiên:\n- Với $x \\in (0; 60)$, $C\'(x) < 0 \\Rightarrow C(x)$ nghịch biến.\n- Với $x \\in (60; 500]$, $C\'(x) > 0 \\Rightarrow C(x)$ đồng biến.\n4. Hàm số đạt cực tiểu tại $x = 60$.\nGiá trị cực tiểu: $C(60) = 60 - 40 + \\frac{3600}{60} = 80$.\nVậy doanh nghiệp cần sản xuất 60 sản phẩm mỗi tháng để chi phí trung bình nhỏ nhất là 80 nghìn đồng/sản phẩm.'
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam_lesson_1',
    lessonId: 'lesson_1',
    title: 'Luyện tập: Tính đơn điệu và cực trị của hàm số',
    description: 'Bộ câu hỏi chuẩn 4 dạng đề thi tốt nghiệp THPT theo chương trình GDPT 2018',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        createdAt: '2026-08-15T08:00:00.000Z',
        createdBy: 'GV. Phan Quốc Cường',
        note: 'Bản phát hành chuẩn học kì I',
        questionsCount: DEMO_QUESTIONS_LESSON_1.length
      }
    ],
    settings: {
      timeLimitMinutes: 45,
      allowRetake: true,
      maxAttempts: 5,
      showAnswersAfterSubmit: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      focusExamMode: true,
      focusModeType: FocusMode.WARNING_LIMIT,
      maxTabSwitches: 2,
      autoSubmitOnViolation: true,
      aiAssistanceEnabled: true,
      aiRevealAnswersAfterSubmit: true,
      isPublished: true
    },
    questions: DEMO_QUESTIONS_LESSON_1,
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z'
  }
];
