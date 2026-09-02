import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sigma,
  Lightbulb,
  AlertTriangle,
  Edit3,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRight,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { Lesson, CoreKnowledge, KeyFormulaItem, ProblemMethodItem, User, UserRole } from '../../types';
import MathRenderer from '../math/MathRenderer';
import RichMathTextInput from '../math/RichMathTextInput';

interface LessonKnowledgeModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (lessonId: string, knowledge: CoreKnowledge) => void;
  onStartExam?: (lesson: Lesson) => void;
  currentUser?: User | null;
}

type TabType = 'summary' | 'formulas' | 'methods' | 'mistakes' | 'edit';

export const LessonKnowledgeModal: React.FC<LessonKnowledgeModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onSave,
  onStartExam,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit state for teachers
  const [editKnowledge, setEditKnowledge] = useState<CoreKnowledge>({
    summary: '',
    keyFormulas: [],
    methods: [],
    commonMistakes: []
  });

  const isTeacherOrAdmin =
    currentUser?.role === UserRole.TEACHER || currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (lesson?.coreKnowledge) {
      setEditKnowledge(JSON.parse(JSON.stringify(lesson.coreKnowledge)));
    } else if (lesson) {
      setEditKnowledge({
        summary: `Kiến thức bài học ${lesson.title} đang được cập nhật.`,
        keyFormulas: [],
        methods: [],
        commonMistakes: []
      });
    }
    setActiveTab('summary');
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const knowledge = lesson.coreKnowledge || editKnowledge;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = () => {
    if (onSave) {
      onSave(lesson.id, {
        ...editKnowledge,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser?.fullName || 'Giáo viên'
      });
    }
    setActiveTab('summary');
  };

  // Helper to add new formula
  const handleAddFormula = () => {
    setEditKnowledge(prev => ({
      ...prev,
      keyFormulas: [
        ...(prev.keyFormulas || []),
        { name: 'Công thức mới', latex: 'f(x) = y', note: 'Ghi chú công thức' }
      ]
    }));
  };

  // Helper to add new method
  const handleAddMethod = () => {
    setEditKnowledge(prev => ({
      ...prev,
      methods: [
        ...(prev.methods || []),
        {
          problemType: 'Dạng toán mới',
          steps: ['Bước 1: Phân tích đề bài', 'Bước 2: Áp dụng định lý/công thức'],
          example: 'Ví dụ minh họa',
          solution: 'Lời giải chi tiết'
        }
      ]
    }));
  };

  // Helper to add new mistake
  const handleAddMistake = () => {
    setEditKnowledge(prev => ({
      ...prev,
      commonMistakes: [...(prev.commonMistakes || []), 'Lưu ý cần tránh sai lầm']
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <BookOpen className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-yellow-200 border border-white/25">
                  Khối {lesson.grade || 12}
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Chương {lesson.chapterNumber}: {lesson.chapterTitle}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5 tracking-tight line-clamp-1">
                Bài {lesson.number}: {lesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="In tóm tắt kiến thức"
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>In</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tóm tắt lý thuyết</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'formulas'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sigma className="w-4 h-4 text-purple-500" />
            <span>Công thức cốt lõi</span>
            {knowledge.keyFormulas && knowledge.keyFormulas.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
                {knowledge.keyFormulas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('methods')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'methods'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Dạng toán & PP Giải</span>
            {knowledge.methods && knowledge.methods.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold">
                {knowledge.methods.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'mistakes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Lưu ý tránh bẫy</span>
            {knowledge.commonMistakes && knowledge.commonMistakes.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold">
                {knowledge.commonMistakes.length}
              </span>
            )}
          </button>

          {isTeacherOrAdmin && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ml-auto ${
                activeTab === 'edit'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 rounded-t-lg shadow-sm'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <Edit3 className="w-4 h-4 text-emerald-500" />
              <span>Biên tập cho GV</span>
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm leading-relaxed text-slate-800 dark:text-slate-200 text-base">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-200/50 dark:border-slate-700 font-bold text-blue-900 dark:text-blue-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Trọng tâm kiến thức cần ghi nhớ
                  </span>
                  <button
                    onClick={() => handleCopy(knowledge.summary, 'summary')}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 transition-colors"
                  >
                    {copiedId === 'summary' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  <MathRenderer content={knowledge.summary} />
                </div>
              </div>

              {/* Quick glance formulas */}
              {knowledge.keyFormulas && knowledge.keyFormulas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                    <Sigma className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Các công thức cơ bản trong bài
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {knowledge.keyFormulas.slice(0, 4).map((f, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <span>{f.name}</span>
                          {f.note && (
                            <span className="text-slate-500 text-[11px] font-medium bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                              {f.note}
                            </span>
                          )}
                        </div>
                        <div className="py-2 px-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center font-mono">
                          <MathRenderer content={`$$${f.latex}$$`} displayMode={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FORMULAS */}
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Hệ thống đầy đủ các công thức chuẩn LaTeX cần ghi nhớ để làm bài tập nhanh và chính xác.
                </p>
                {isTeacherOrAdmin && (
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Thêm công thức
                  </button>
                )}
              </div>

              {(!knowledge.keyFormulas || knowledge.keyFormulas.length === 0) ? (
                <div className="text-center py-12 text-slate-400">
                  <Sigma className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có danh sách công thức chi tiết cho bài này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {knowledge.keyFormulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-purple-50/40 via-white to-indigo-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-extrabold">
                            {idx + 1}
                          </span>
                          {formula.name}
                        </span>

                        <div className="flex items-center gap-2">
                          {formula.note && (
                            <span className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full font-medium">
                              {formula.note}
                            </span>
                          )}
                          <button
                            onClick={() => handleCopy(formula.latex, `formula_${idx}`)}
                            title="Sao chép mã LaTeX"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            {copiedId === `formula_${idx}` ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="my-2 p-3 bg-white dark:bg-slate-950/70 rounded-xl border border-purple-100/80 dark:border-slate-800 text-center shadow-inner overflow-x-auto">
                        <MathRenderer content={`$$${formula.latex}$$`} displayMode={true} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: METHODS */}
          {activeTab === 'methods' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Phương pháp tư duy và các bước giải cho từng dạng bài toán điển hình trong đề thi.
              </p>

              {(!knowledge.methods || knowledge.methods.length === 0) ? (
                <div className="text-center py-12 text-slate-400">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Phương pháp giải đang được biên soạn chi tiết.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledge.methods.map((method, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-extrabold text-xs">
                          Dạng {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {method.problemType}
                        </h4>
                      </div>

                      {/* Steps list */}
                      <div className="space-y-1.5 pl-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Các bước thực hiện:
                        </p>
                        <div className="space-y-1">
                          {method.steps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              <div>
                                <MathRenderer content={step} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Example & Solution if available */}
                      {method.example && (
                        <div className="p-3.5 bg-amber-50/60 dark:bg-slate-900/80 rounded-lg border border-amber-200/60 dark:border-slate-700 text-sm space-y-2">
                          <p className="font-bold text-amber-900 dark:text-amber-300 text-xs">
                            📌 Ví dụ mẫu:
                          </p>
                          <div className="text-slate-800 dark:text-slate-200">
                            <MathRenderer content={method.example} />
                          </div>
                          {method.solution && (
                            <div className="pt-2 border-t border-amber-200/50 dark:border-slate-700">
                              <p className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                                💡 Hướng dẫn giải:
                              </p>
                              <div className="text-slate-700 dark:text-slate-300">
                                <MathRenderer content={method.solution} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MISTAKES */}
          {activeTab === 'mistakes' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                  Tổng hợp các lỗi sai phổ biến mà học sinh thường mắc phải trong các kỳ thi kiểm tra và thi Tốt nghiệp THPT.
                </p>
              </div>

              {(!knowledge.commonMistakes || knowledge.commonMistakes.length === 0) ? (
                <div className="text-center py-12 text-slate-400">
                  <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-40" />
                  <p>Bài học này ít bẫy phức tạp, hãy lưu ý đọc kỹ đề bài.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {knowledge.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-sm hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        <MathRenderer content={mistake} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TEACHER EDIT */}
          {activeTab === 'edit' && isTeacherOrAdmin && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <span>Chế độ biên tập nội dung kiến thức bài học dành cho Giáo viên</span>
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>

              {/* Edit Summary */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Tóm tắt lý thuyết trọng tâm:
                </label>
                <RichMathTextInput
                  value={editKnowledge.summary}
                  onChange={val => setEditKnowledge(prev => ({ ...prev, summary: val }))}
                  placeholder="Nhập nội dung tóm tắt lý thuyết (hỗ trợ LaTeX $...$ và $$...$$)"
                  rows={4}
                />
              </div>

              {/* Edit Formulas */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sigma className="w-4 h-4 text-purple-600" />
                    Danh sách công thức cốt lõi:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFormula}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm công thức
                  </button>
                </div>

                <div className="space-y-3">
                  {(editKnowledge.keyFormulas || []).map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formula.name}
                          onChange={e => {
                            const val = e.target.value;
                            setEditKnowledge(prev => {
                              const updated = [...(prev.keyFormulas || [])];
                              updated[idx].name = val;
                              return { ...prev, keyFormulas: updated };
                            });
                          }}
                          placeholder="Tên công thức..."
                          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={formula.note || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditKnowledge(prev => {
                              const updated = [...(prev.keyFormulas || [])];
                              updated[idx].note = val;
                              return { ...prev, keyFormulas: updated };
                            });
                          }}
                          placeholder="Ghi chú (tùy chọn)..."
                          className="w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditKnowledge(prev => ({
                              ...prev,
                              keyFormulas: (prev.keyFormulas || []).filter((_, fIdx) => fIdx !== idx)
                            }));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <RichMathTextInput
                        value={formula.latex}
                        onChange={val => {
                          setEditKnowledge(prev => {
                            const updated = [...(prev.keyFormulas || [])];
                            updated[idx].latex = val;
                            return { ...prev, keyFormulas: updated };
                          });
                        }}
                        placeholder="Mã công thức LaTeX..."
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Mistakes */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Lưu ý và bẫy sai lầm thường gặp:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMistake}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm lưu ý
                  </button>
                </div>

                <div className="space-y-2">
                  {(editKnowledge.commonMistakes || []).map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1">
                        <RichMathTextInput
                          value={mistake}
                          onChange={val => {
                            setEditKnowledge(prev => {
                              const updated = [...(prev.commonMistakes || [])];
                              updated[idx] = val;
                              return { ...prev, commonMistakes: updated };
                            });
                          }}
                          placeholder={`Lưu ý ${idx + 1}...`}
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditKnowledge(prev => ({
                            ...prev,
                            commonMistakes: (prev.commonMistakes || []).filter((_, mIdx) => mIdx !== idx)
                          }));
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {knowledge.lastUpdated ? (
              <span>Cập nhật gần nhất: {new Date(knowledge.lastUpdated).toLocaleDateString('vi-VN')}</span>
            ) : (
              <span>Chương trình GDPT 2018 - Toán THPT</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors"
            >
              Đóng
            </button>

            {onStartExam && (
              <button
                onClick={() => {
                  onClose();
                  onStartExam(lesson);
                }}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Luyện tập bài học này</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonKnowledgeModal;
