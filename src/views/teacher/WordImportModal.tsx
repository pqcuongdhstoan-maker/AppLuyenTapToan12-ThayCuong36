import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Info,
  X,
  Layers,
  RotateCcw
} from 'lucide-react';
import { parseDocxFile, DocxParsedExam } from '../../services/docxParser';
import { Lesson, Exam } from '../../types';
import { storageService } from '../../services/storageService';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewParsed: (parsed: DocxParsedExam, lesson: Lesson) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  onPreviewParsed
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson_1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStepText, setProgressStepText] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lessons = storageService.getLessons();

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setErrorMsg('Vui lòng chọn tệp định dạng Microsoft Word (.docx)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp vượt quá giới hạn cho phép (50MB).');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(5);
    setProgressStepText('Đang tải tệp tin...');
    setErrorMsg(null);

    try {
      const parsed = await parseDocxFile(file, (percent, stepText) => {
        setProgressPercent(percent);
        setProgressStepText(stepText);
      });

      const targetLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];
      setIsProcessing(false);

      if (!parsed.questions || parsed.questions.length === 0) {
        setErrorMsg('Không tìm thấy câu hỏi hợp lệ trong tệp Word. Hãy đảm bảo đề thi bắt đầu bằng "Câu 1.", "Câu 2." hoặc có các tiêu đề PHẦN I, II, III, IV.');
        return;
      }

      onPreviewParsed(parsed, targetLesson);
    } catch (e: any) {
      console.error('Parse Word error:', e);
      setErrorMsg(`Lỗi khi đọc file Word: ${e.message || 'Cấu trúc file không tương thích'}`);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRetry = () => {
    setErrorMsg(null);
    setIsProcessing(false);
    setProgressPercent(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              NHẬP ĐỀ THI TỪ MICROSOFT WORD (.DOCX)
            </h3>
            <p className="text-xs text-slate-500">
              Bộ chuyển đổi OMML Math &amp; Hình ảnh sang chuẩn LaTeX
            </p>
          </div>
        </div>

        {/* Lesson selection target */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Chọn Bài học cần gán đề thi:
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                Bài {l.number}: {l.title} (Chương {l.chapterNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isProcessing ? (
            <div className="py-4 space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-800">{progressStepText || 'Đang giải nén và phân tích cấu trúc Word...'}</div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 font-bold">{progressPercent}%</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                Kéo thả file <strong>.docx</strong> vào đây hoặc click để chọn file
              </div>
              <div className="text-xs text-slate-400">
                Hỗ trợ đầy đủ định dạng Phần I (A,B,C,D), Phần II (a,b,c,d), Phần III (trả lời ngắn), Phần IV (tự luận).
              </div>
            </div>
          )}
        </div>

        {/* Error Notice with Retry Button */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Format Rules Guide */}
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Quy chuẩn cấu trúc file Word đề thi:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
            <li><strong>PHẦN I:</strong> Tiêu đề "PHẦN I" hoặc "Phần 1", các câu bắt đầu bằng "Câu 1.", 4 phương án A, B, C, D. Gạch chân hoặc in đậm đáp án đúng.</li>
            <li><strong>PHẦN II:</strong> Bắt đầu bằng "PHẦN II", 4 ý a), b), c), d). Có nhãn Đúng / Sai hoặc gạch chân.</li>
            <li><strong>PHẦN III:</strong> Bắt đầu bằng "PHẦN III", câu hỏi yêu cầu điền số kết quả.</li>
            <li><strong>PHẦN IV:</strong> Bắt đầu bằng "PHẦN IV", câu hỏi tự luận kèm barem điểm.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WordImportModal;
