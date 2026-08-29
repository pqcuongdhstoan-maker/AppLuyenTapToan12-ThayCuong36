/**
 * Gemini Service with Multi-Model Fallback & User API Key Management
 * Following rules in AI_INSTRUCTIONS.md:
 * - Default Model: gemini-3-flash-preview
 * - Fallback Chain: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash']
 * - Automatic retry with next model if API error / quota limit (429 RESOURCE_EXHAUSTED) occurs.
 * - Stores user API key & selected model in localStorage.
 */

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview (Mặc định)',
    tag: 'Tối ưu tốc độ & Chính xác cao',
    isDefault: true,
    description: 'Thế hệ mô hình mới nhất của Google, phản hồi siêu nhanh, xuất sắc trong toán học và LaTeX.'
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    tag: 'Tư duy sâu & Bài toán phức tạp',
    isDefault: false,
    description: 'Khả năng suy luận toán học đa bước, tối ưu cho phân tích lỗi tư duy và bài toán vận dụng cao.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Ổn định & Tiết kiệm Quota',
    isDefault: false,
    description: 'Model ổn định cao, dự phòng tối ưu khi các model preview quá tải hoặc hết hạn mức.'
  }
];

export const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

const STORAGE_API_KEY = 'gemini_api_key';
const STORAGE_MODEL = 'selected_gemini_model';

export interface GeminiResponse {
  success: boolean;
  text?: string;
  modelUsed?: string;
  error?: string;
  errorCode?: string;
}

export const geminiService = {
  getApiKey(): string {
    return localStorage.getItem(STORAGE_API_KEY) || '';
  },

  setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(STORAGE_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_API_KEY);
    }
  },

  hasApiKey(): boolean {
    const key = this.getApiKey();
    return !!(key && key.trim().length > 10);
  },

  getSelectedModel(): string {
    return localStorage.getItem(STORAGE_MODEL) || 'gemini-3-flash-preview';
  },

  setSelectedModel(modelId: string): void {
    localStorage.setItem(STORAGE_MODEL, modelId);
  },

  /**
   * Test if the provided API key is valid
   */
  async testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    if (!apiKey || apiKey.trim().length < 10) {
      return { valid: false, message: 'Khóa API không hợp lệ. Vui lòng kiểm tra lại.' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Kiểm tra kết nối API. Trả lời: OK' }] }]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error?.message || `Lỗi HTTP ${res.status}: ${res.statusText}`;
        const errorCode = data?.error?.status || `${res.status}`;
        return { valid: false, message: `[${errorCode}] ${errorMsg}` };
      }

      return { valid: true, message: 'Kết nối API Gemini thành công!' };
    } catch (e: any) {
      return { valid: false, message: `Không thể kết nối đến máy chủ Google: ${e.message || 'Lỗi mạng'}` };
    }
  },

  /**
   * Generate content using Gemini with automatic fallback retry across models
   */
  async generateContent(
    prompt: string,
    systemInstruction?: string,
    onRetryNotice?: (fromModel: string, toModel: string, error: string) => void
  ): Promise<GeminiResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: 'Chưa có Gemini API Key. Vui lòng nhấn nút "Cài đặt API Key" trên thanh điều hướng để nhập khóa của bạn.',
        errorCode: 'MISSING_API_KEY'
      };
    }

    const preferredModel = this.getSelectedModel();
    // Order model list starting with preferredModel, then the rest of FALLBACK_MODELS
    const modelQueue = [
      preferredModel,
      ...FALLBACK_MODELS.filter(m => m !== preferredModel)
    ];

    let lastError = '';
    let lastErrorCode = '';

    for (let i = 0; i < modelQueue.length; i++) {
      const currentModel = modelQueue[i];
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

        const payload: any = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7
          }
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          const apiErrorStatus = data?.error?.status || `${response.status}`;
          const apiErrorMessage = data?.error?.message || response.statusText;
          lastErrorCode = apiErrorStatus;
          lastError = `[${apiErrorStatus}] ${apiErrorMessage}`;

          console.warn(`Model ${currentModel} failed: ${lastError}`);

          // If there is another model to fallback to, notify and retry
          if (i < modelQueue.length - 1) {
            const nextModel = modelQueue[i + 1];
            if (onRetryNotice) {
              onRetryNotice(currentModel, nextModel, lastError);
            }
            continue; // Retry with next model
          }
          break;
        }

        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return {
            success: true,
            text: candidateText,
            modelUsed: currentModel
          };
        } else {
          lastError = 'Google AI không trả về nội dung câu trả lời phù hợp.';
          lastErrorCode = 'EMPTY_RESPONSE';
        }
      } catch (err: any) {
        lastError = err.message || 'Lỗi kết nối mạng';
        lastErrorCode = 'NETWORK_ERROR';
        if (i < modelQueue.length - 1) {
          const nextModel = modelQueue[i + 1];
          if (onRetryNotice) {
            onRetryNotice(currentModel, nextModel, lastError);
          }
          continue;
        }
      }
    }

    // All models in the fallback chain failed
    return {
      success: false,
      error: `Tất cả các mô hình AI đều thất bại: ${lastError}`,
      errorCode: lastErrorCode || 'ALL_MODELS_FAILED'
    };
  }
};
