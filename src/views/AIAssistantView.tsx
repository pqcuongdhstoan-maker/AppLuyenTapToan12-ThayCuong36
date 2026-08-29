import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { User } from '../types';
import { MathRenderer } from '../components/math/MathRenderer';
import { MathEditor } from '../components/math/MathEditor';
import { geminiService } from '../services/geminiService';

interface AIAssistantViewProps {
  currentUser: User;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      content: `Chào **${currentUser.fullName}**! Thầy là Trợ lý AI Học tập môn Toán 12 của Trường THPT Đức Hòa.
Em có thể hỏi thầy bất kỳ câu hỏi nào về:
- Các chuyên đề Khảo sát hàm số, Vectơ & Tọa độ Oxyz, Nguyên hàm & Tích phân, Thống kê & Xác suất có điều kiện.
- Hướng dẫn phương pháp giải theo từng bước với công thức chuẩn LaTeX.
- Giải thích các dạng câu hỏi Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn và Tự luận.`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);
  const [showMathEditor, setShowMathEditor] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, retryNotice]);

  const quickPrompts = [
    'Tóm tắt công thức Đạo hàm & Khảo sát hàm số lớp 12',
    'Phương pháp giải bài toán Tìm GTLN, GTNN bài toán thực tế',
    'Các dạng viết phương trình mặt phẳng trong không gian Oxyz',
    'Công thức Xác suất có điều kiện và Công thức nhân xác suất',
    'Phương pháp tính Nguyên hàm & Tích phân từng phần'
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setRetryNotice(null);

    const systemInstruction = `Bạn là Trợ lý AI Học tập & Gia sư môn Toán 12 của Trường THPT Đức Hòa (phụ trách bởi GV. Phan Quốc Cường), theo chuẩn Chương trình GDPT 2018 bộ sách Kết nối tri thức với cuộc sống.
Mọi công thức toán học bạn xuất ra PHẢI được viết chuẩn LaTeX kẹp giữa dấu $...$ (nội dòng) hoặc $$...$$ (khối).
Hãy hướng dẫn tận tình, giải thích cặn kẽ từng bước, kèm ví dụ minh họa và phương pháp tư duy toán học.`;

    try {
      const response = await geminiService.generateContent(
        textToSend,
        systemInstruction,
        (fromModel, toModel, error) => {
          setRetryNotice(`Đang tự động chuyển sang mô hình dự phòng "${toModel}" do ${fromModel} gặp lỗi: ${error}`);
        }
      );

      if (response.success && response.text) {
        const aiMessage: Message = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          content: response.text,
          modelUsed: response.modelUsed,
          timestamp: new Date().toLocaleTimeString('vi-VN')
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: `msg_err_${Date.now()}`,
          sender: 'ai',
          content: response.error || 'Chưa thể kết nối tới mô hình AI. Vui lòng kiểm tra lại API Key hoặc nhấn nút "Lấy API key" trên thanh điều hướng.',
          isError: true,
          timestamp: new Date().toLocaleTimeString('vi-VN')
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg_err_${Date.now()}`,
        sender: 'ai',
        content: `Đã xảy ra sự cố: ${error.message || 'Lỗi mạng'}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setRetryNotice(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>TRỢ LÝ TOÁN 12 THPT ĐỨC HÒA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            AI Giải Đáp & Ôn Tập Môn Toán
          </h2>
          <p className="text-xs text-purple-100 max-w-xl">
            Tư vấn kiến thức, gợi ý phương pháp giải theo chuẩn GDPT 2018, hiển thị công thức LaTeX trực quan.
          </p>
        </div>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs min-h-[460px] max-h-[600px] flex flex-col justify-between overflow-hidden">
        {/* Scrollable Message List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div
                className={`relative group max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <MathRenderer content={msg.content} />

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 text-slate-600"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {retryNotice && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium animate-pulse flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{retryNotice}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-200" />
                <span>Thầy AI đang giải bài và tổng hợp công thức toán...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Nhập câu hỏi hoặc công thức LaTeX toán học:
            </span>
            <button
              onClick={() => setShowMathEditor(!showMathEditor)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showMathEditor ? 'Gõ thông thường' : 'Bảng ký hiệu Toán học'}
            </button>
          </div>

          {showMathEditor ? (
            <div className="mb-2">
              <MathEditor
                value={inputText}
                onChange={setInputText}
                placeholder="Nhập câu hỏi toán (ví dụ: Tìm nguyên hàm $\int x \cos x dx$)..."
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  disabled={!inputText.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi câu hỏi
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Hỏi thầy phương pháp giải câu toán 12 bất kỳ..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;
