export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Phần I: Trắc nghiệm 4 lựa chọn (A, B, C, D)
  TRUE_FALSE = 'TRUE_FALSE',           // Phần II: Trắc nghiệm Đúng / Sai (a, b, c, d)
  SHORT_ANSWER = 'SHORT_ANSWER',       // Phần III: Trả lời ngắn (số, phân số, tọa độ, v.v.)
  ESSAY = 'ESSAY'                      // Phần IV: Tự luận (lời giải, công thức, ảnh đính kèm)
}

export enum DifficultyLevel {
  NHAN_BIET = 'NHAN_BIET',       // Nhận biết
  THONG_HIEU = 'THONG_HIEU',     // Thông hiểu
  VAN_DUNG = 'VAN_DUNG',         // Vận dụng
  VAN_DUNG_CAO = 'VAN_DUNG_CAO'  // Vận dụng cao
}

export enum AttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum SubmitReason {
  NORMAL = 'NORMAL',
  TIME_EXPIRED = 'TIME_EXPIRED',
  AUTO_SUBMIT_TAB_SWITCH = 'AUTO_SUBMIT_TAB_SWITCH',
  TEACHER_FORCE_SUBMIT = 'TEACHER_FORCE_SUBMIT',
  TEACHER_REMOTE_SUBMIT = 'TEACHER_REMOTE_SUBMIT'
}

export enum FocusMode {
  OFF = 'OFF',
  LOG_ONLY = 'LOG_ONLY',                     // Mode 1: Chỉ ghi nhật ký
  WARNING = 'WARNING',                       // Mode 2: Cảnh báo
  WARNING_LIMIT = 'WARNING_LIMIT',           // Mode 3: Cảnh báo + Giới hạn số lần
  AUTO_SUBMIT = 'AUTO_SUBMIT'                // Mode 4: Tự động nộp bài ngay khi vi phạm
}

export interface User {
  id: string;
  email: string;
  username?: string;
  password?: string;
  fullName: string;
  role: UserRole;
  className?: string;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  isLocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ContentBlock {
  type: 'text' | 'math' | 'image' | 'math-image' | 'warning';
  value?: string;           // Plain text
  latex?: string;           // LaTeX math string (e.g. f(x), \mathbb{R})
  url?: string;             // Image URL / Data URL (PNG, SVG, JPG)
  alt?: string;             // Image label / caption
  sourceType?: 'mathtype-ole' | 'omml' | 'wmf' | 'emf' | 'raster';
  display?: 'inline' | 'block';
  width?: number;
  height?: number;
  warningMessage?: string;  // Warning description when an object could not be converted cleanly
}

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  content: string;
  contentBlocks?: ContentBlock[];
}

export interface TrueFalseItem {
  id: string; // 'a' | 'b' | 'c' | 'd'
  content: string;
  correctAnswer?: boolean; // true = Đúng, false = Sai, undefined = Chưa xác định
  explanation?: string;
  contentBlocks?: ContentBlock[];
}

export interface ShortAnswerConfig {
  correctAnswers: string[]; // List of acceptable equivalents e.g. ["3/4", "0.75", "0,75"]
  tolerance?: number; // Allowed error margin (e.g. 0.01)
  decimals?: number; // Rounding requirement
  unit?: string;
}

export interface Question {
  id: string;
  examId?: string;
  lessonId?: string;
  part: 1 | 2 | 3 | 4; // Phần I, II, III, IV
  questionNumber: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string; // May contain LaTeX math: $...$ or $$...$$
  contentBlocks?: ContentBlock[]; // Rich content blocks in original sequential order
  options?: QuestionOption[]; // For Part I
  correctOption?: string | string[] | null; // 'A' or null if unassigned
  trueFalseItems?: TrueFalseItem[]; // For Part II
  shortAnswerConfig?: ShortAnswerConfig; // For Part III
  essayGuide?: string; // For Part IV: Suggested rubric/solution for teacher
  solution?: string; // Detailed solution explanation
  solutionBlocks?: ContentBlock[];
  points: number; // Max points for this question (default 0.25 for Part I, 1.0 for Part II, 0.5 for Part III, 1-2 for Part IV)
  imageUrl?: string;
  fallbackMode?: 'content' | 'word-image'; // Azota-like fallback mode
  fallbackImageUrl?: string; // Image snapshot of the entire question in Word appearance
  needsTeacherCheck?: boolean; // Flagged when formula extraction had low confidence or warnings
  topic?: string;
}

export interface ExamVersion {
  version: number;
  createdAt: string;
  createdBy: string;
  note?: string;
  questionsCount: number;
}

export interface ExamSettings {
  timeLimitMinutes: number; // 0 = Unlimited, or 15, 30, 45, 60, 90, 120
  allowRetake: boolean;
  maxAttempts: number;
  showAnswersAfterSubmit: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  focusExamMode: boolean;
  focusModeType: FocusMode;
  maxTabSwitches: number;
  autoSubmitOnViolation: boolean;
  aiAssistanceEnabled: boolean;
  aiRevealAnswersAfterSubmit: boolean;
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
}

export interface Exam {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  currentVersion: number;
  versions: ExamVersion[];
  settings: ExamSettings;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  chapterNumber: number;
  chapterTitle: string;
  semester: 1 | 2;
  description?: string;
  isHidden?: boolean;
  isCustom?: boolean; // Teacher-created supplementary topic
  examId?: string;
}

export interface Chapter {
  number: number;
  title: string;
  semester: 1 | 2;
  lessons: Lesson[];
}

export interface AnswerPayload {
  questionId: string;
  type: QuestionType;
  selectedOption?: string | string[]; // Part I
  trueFalseAnswers?: { [key: string]: boolean }; // Part II: { a: true, b: false, c: true, d: false }
  shortAnswer?: string; // Part III
  essayText?: string; // Part IV
  essayFiles?: { name: string; url: string; size: number; type: string }[]; // Part IV uploads
  isFlaggedForReview?: boolean;
  answeredAt?: string;
}

export interface ViolationLog {
  id: string;
  timestamp: string;
  type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT' | 'PAGE_HIDE';
  details: string;
}

export interface EssayGrading {
  points: number;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
  aiSuggestedPoints?: number;
  aiSuggestedFeedback?: string;
}

export interface Attempt {
  id: string;
  examId: string;
  lessonId: string;
  lessonTitle: string;
  examVersion: number;
  studentId: string;
  studentName: string;
  className: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  currentQuestionIndex: number;
  answers: { [questionId: string]: AnswerPayload };
  
  // Scoring
  score?: number; // Total points scored (0-10)
  maxPossibleScore?: number; // e.g. 10
  scorePercentage?: number; // 0-100%
  part1Score?: number;
  part2Score?: number;
  part3Score?: number;
  part4Score?: number;
  part4Status?: 'NOT_APPLICABLE' | 'PENDING_GRADING' | 'GRADED';
  essayGrading?: { [questionId: string]: EssayGrading };
  
  // Progress
  answeredQuestionsCount: number;
  totalQuestionsCount: number;
  progressPercentage: number;
  
  // Integrity & Violations
  violations: ViolationLog[];
  violationCount: number;
  submitReason?: SubmitReason;
  attemptNumber: number;
}

export interface SystemSettings {
  schoolName: string;
  teacherName: string;
  appTitle: string;
  schoolYear: string;
  geminiModel: string;
  adminPassword?: string; // Mật khẩu Master PIN vào khu vực Quản trị (mặc định: 123456)
  teacherDefaultPassword?: string; // Mật khẩu khởi tạo cho giáo viên (mặc định: 123456)
  studentDefaultPassword?: string; // Mật khẩu khởi tạo cho học sinh (mặc định: 123456)
  requireAdminPassword?: boolean; // Bắt buộc nhập mật khẩu khi vào Quản trị
  googleAppsScriptUrl: string;
  googleSheetWebhookUrl?: string;
  googleSheetClassesUrl?: string; // Link Google Sheets / CSV chứa danh sách lớp & học sinh
  autoSyncClassesOnLoad?: boolean;
  lastClassSyncTimestamp?: string;
  defaultFocusMode: FocusMode;
  defaultMaxTabSwitches: number;
  maxAllowedTabSwitches?: number;
  defaultTimeLimitMinutes: number;
  autoSaveIntervalSeconds: number;
  allowStudentRetry: boolean;
  showAnswersDefault: boolean;
  uploadFileLimitMB: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  isLocked?: boolean;
  syncedFromSheet?: boolean;
  lastSyncedAt?: string;
}

export interface StudentProgressSummary {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  notStartedLessons: number;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  latestScore: number;
  accuracyRate: number;
  totalStudyTimeMinutes: number;
  completionRatePercentage: number;
}

export interface LiveExamStudentStatus {
  attemptId: string;
  studentId: string;
  studentName: string;
  className: string;
  lessonTitle: string;
  startedAt: string;
  answeredCount: number;
  totalCount: number;
  progressPercentage: number;
  timeLeftSeconds?: number;
  violationsCount: number;
  status: 'ONLINE_ACTIVE' | 'AWAY_VIOLATION' | 'SUBMITTED' | 'IDLE';
  lastActiveTimestamp: string;
}
