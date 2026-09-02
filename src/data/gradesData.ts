import { Lesson, Chapter, CoreKnowledge } from '../types';

// ==========================================
// 1. KHỐI 10 (27 BÀI HỌC - 9 CHƯƠNG)
// ==========================================
export const GRADE_10_LESSONS: Lesson[] = [
  // CHƯƠNG I: MỆNH ĐỀ VÀ TẬP HỢP
  {
    id: 'lesson_10_1',
    grade: 10,
    number: 1,
    title: 'Mệnh đề và mệnh đề chứa biến',
    chapterNumber: 1,
    chapterTitle: 'MỆNH ĐỀ VÀ TẬP HỢP',
    semester: 1,
    examId: 'exam_10_1',
    coreKnowledge: {
      summary: 'Mệnh đề logic là một khẳng định đúng hoặc một khẳng định sai. Một mệnh đề không thể vừa đúng vừa sai. Mệnh đề phủ định $\\overline{P}$ đúng khi $P$ sai và ngược lại. Mệnh đề kéo theo $P \\Rightarrow Q$ chỉ sai khi $P$ đúng mà $Q$ sai.',
      keyFormulas: [
        { name: 'Mệnh đề phủ định', latex: '\\overline{P}', note: 'Phủ định của P' },
        { name: 'Phủ định với mọi (∀)', latex: '\\overline{\\forall x \\in X, P(x)} \\Leftrightarrow \\exists x \\in X, \\overline{P(x)}', note: 'Phủ định của ∀ là ∃' },
        { name: 'Phủ định tồn tại (∃)', latex: '\\overline{\\exists x \\in X, P(x)} \\Leftrightarrow \\forall x \\in X, \\overline{P(x)}', note: 'Phủ định của ∃ là ∀' },
        { name: 'Mệnh đề tương đương', latex: 'P \\Leftrightarrow Q', note: 'P khi và chỉ khi Q (cùng đúng hoặc cùng sai)' }
      ],
      methods: [
        {
          problemType: 'Xét tính đúng sai của mệnh đề',
          steps: [
            'Bước 1: Xác định rõ giả thiết và kết luận của mệnh đề.',
            'Bước 2: Tìm một phản ví dụ (nếu chứng minh mệnh đề sai) hoặc lập luận chặt chẽ (nếu đúng).'
          ],
          example: 'Xét tính đúng sai của mệnh đề: "$\\forall n \\in \\mathbb{N}, n^2 + 1$ là số lẻ".',
          solution: 'Với $n = 1 \\in \\mathbb{N} \\Rightarrow 1^2 + 1 = 2$ (số chẵn) $\\Rightarrow$ Mệnh đề SAI.'
        },
        {
          problemType: 'Lập mệnh đề phủ định',
          steps: [
            'Đổi ký hiệu $\\forall \\to \\exists$ hoặc $\\exists \\to \\forall$.',
            'Phủ định phần khẳng định phía sau ($= \\to \\neq, > \\to \\le, < \\to \\ge$).'
          ]
        }
      ],
      commonMistakes: [
        'Nhầm lẫn phủ định của ">" là "<" (đúng phải là "≤").',
        'Quên đổi ký hiệu ∀ thành ∃ khi phủ định mệnh đề chứa lượng từ.'
      ]
    }
  },
  {
    id: 'lesson_10_2',
    grade: 10,
    number: 2,
    title: 'Tập hợp và các phép toán trên tập hợp',
    chapterNumber: 1,
    chapterTitle: 'MỆNH ĐỀ VÀ TẬP HỢP',
    semester: 1,
    examId: 'exam_10_2',
    coreKnowledge: {
      summary: 'Tập hợp là khái niệm cơ bản. Tập con $A \\subset B \\Leftrightarrow \\forall x \\in A \\Rightarrow x \\in B$. Hai tập hợp bằng nhau $A = B \\Leftrightarrow A \\subset B$ và $B \\subset A$. Các phép toán cơ bản: Giao ($A \\cap B$), Hợp ($A \\cup B$), Hiệu ($A \\setminus B$), Phần bù ($C_E A$).',
      keyFormulas: [
        { name: 'Giao của hai tập hợp', latex: 'A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}', note: 'Lấy phần chung' },
        { name: 'Hợp của hai tập hợp', latex: 'A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}', note: 'Gộp chung tất cả' },
        { name: 'Hiệu của hai tập hợp', latex: 'A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}', note: 'Thuộc A nhưng không thuộc B' },
        { name: 'Phần bù', latex: 'C_E A = E \\setminus A \\quad (A \\subset E)', note: 'Phần bù của A trong E' }
      ],
      methods: [
        {
          problemType: 'Biểu diễn tập hợp số và tìm giao, hợp, hiệu',
          steps: [
            'Bước 1: Vẽ trục số thực $\\mathbb{R}$.',
            'Bước 2: Đánh dấu các mút của từng khoảng/đoạn.',
            'Bước 3: Gạch bỏ phần không thuộc tập hợp theo quy tắc phép toán giao, hợp, hiệu.'
          ]
        }
      ],
      commonMistakes: [
        'Lẫn lộn ngoặc tròn $(\\,)$ (không lấy mút) và ngoặc vuông $[\\,]$ (có lấy mút).',
        'Quên đổi chiều dấu ngoặc khi lấy phần bù hoặc hiệu tập hợp.'
      ]
    }
  },

  // CHƯƠNG II: BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN
  {
    id: 'lesson_10_3',
    grade: 10,
    number: 3,
    title: 'Bất phương trình bậc nhất hai ẩn',
    chapterNumber: 2,
    chapterTitle: 'BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    semester: 1,
    examId: 'exam_10_3',
    coreKnowledge: {
      summary: 'Bất phương trình bậc nhất hai ẩn $x, y$ có dạng tổng quát $ax + by + c < 0$ (hoặc $\\le, >, \\ge$) với $a^2 + b^2 \\neq 0$. Miền nghiệm trên mặt phẳng $Oxy$ là một nửa mặt phẳng có bờ là đường thẳng $d: ax + by + c = 0$.',
      keyFormulas: [
        { name: 'Dạng tổng quát', latex: 'ax + by + c \\le 0 \\quad (a^2+b^2 \\neq 0)', note: 'Bờ là đường thẳng ax+by+c=0' }
      ],
      methods: [
        {
          problemType: 'Xác định miền nghiệm của BPT bậc nhất hai ẩn',
          steps: [
            'Bước 1: Vẽ đường thẳng $d: ax + by + c = 0$ trên hệ trục $Oxy$.',
            'Bước 2: Lấy một điểm thử $M(x_0; y_0) \\notin d$ (thường chọn gốc tọa độ $O(0;0)$ nếu $c \\neq 0$).',
            'Bước 3: Tính giá trị $ax_0 + by_0 + c$. Nếu thỏa mãn BPT thì nửa mặt phẳng chứa điểm $M$ là miền nghiệm; ngược lại gạch bỏ.'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson_10_4',
    grade: 10,
    number: 4,
    title: 'Hệ bất phương trình bậc nhất hai ẩn và bài toán tối ưu',
    chapterNumber: 2,
    chapterTitle: 'BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    semester: 1,
    examId: 'exam_10_4',
    coreKnowledge: {
      summary: 'Miền nghiệm của hệ BPT bậc nhất hai ẩn là giao của các miền nghiệm thành phần (thường là miền đa giác lồi). Giá trị lớn nhất hoặc nhỏ nhất của biểu thức mục tiêu $F(x, y) = ax + by$ trên miền đa giác lồi luôn đạt tại một trong các đỉnh của đa giác.',
      keyFormulas: [
        { name: 'Hàm mục tiêu tuyến tính', latex: 'F(x, y) = ax + by', note: 'Đạt cực trị tại các đỉnh của miền đa giác nghiệm' }
      ],
      methods: [
        {
          problemType: 'Tìm giá trị lớn nhất/nhỏ nhất của $F(x,y) = ax+by$',
          steps: [
            'Bước 1: Biểu diễn miền nghiệm của hệ BPT (xác định tọa độ tất cả các đỉnh $A, B, C, \\dots$).',
            'Bước 2: Tính giá trị $F(x, y)$ tại từng đỉnh.',
            'Bước 3: So sánh các giá trị và kết luận GTLN, GTNN.'
          ]
        }
      ]
    }
  },

  // CHƯƠNG III: HỆ THỨC LƯỢNG TRONG TAM GIÁC
  {
    id: 'lesson_10_5',
    grade: 10,
    number: 5,
    title: 'Giá trị lượng giác của một góc từ 0° đến 180°',
    chapterNumber: 3,
    chapterTitle: 'HỆ THỨC LƯỢNG TRONG TAM GIÁC',
    semester: 1,
    examId: 'exam_10_5',
    coreKnowledge: {
      summary: 'Trên nửa đường tròn đơn vị, với mỗi góc $\\alpha$ ($0^\\circ \\le \\alpha \\le 180^\\circ$), tọa độ điểm $M(x_0; y_0)$ thỏa mãn $\\cos\\alpha = x_0, \\sin\\alpha = y_0, \\tan\\alpha = \\frac{y_0}{x_0}, \\cot\\alpha = \\frac{x_0}{y_0}$.',
      keyFormulas: [
        { name: 'Hai góc bù nhau', latex: '\\sin(180^\\circ - \\alpha) = \\sin\\alpha, \\quad \\cos(180^\\circ - \\alpha) = -\\cos\\alpha', note: 'Sin bù bằng nhau, Cos bù đối nhau' },
        { name: 'Hai góc phụ nhau', latex: '\\sin(90^\\circ - \\alpha) = \\cos\\alpha, \\quad \\cos(90^\\circ - \\alpha) = \\sin\\alpha', note: 'Phụ chéo' },
        { name: 'Hằng đẳng thức cơ bản', latex: '\\sin^2\\alpha + \\cos^2\\alpha = 1, \\quad 1 + \\tan^2\\alpha = \\frac{1}{\\cos^2\\alpha}', note: 'Áp dụng cho mọi góc 0° đến 180°' }
      ]
    }
  },
  {
    id: 'lesson_10_6',
    grade: 10,
    number: 6,
    title: 'Hệ thức lượng trong tam giác và giải tam giác',
    chapterNumber: 3,
    chapterTitle: 'HỆ THỨC LƯỢNG TRONG TAM GIÁC',
    semester: 1,
    examId: 'exam_10_6',
    coreKnowledge: {
      summary: 'Hệ thống định lý Cosin, định lý Sin và các công thức tính diện tích tam giác là công cụ then chốt để giải tam giác và ứng dụng đo đạc thực địa.',
      keyFormulas: [
        { name: 'Định lý Cosin', latex: 'a^2 = b^2 + c^2 - 2bc\\cos A', note: 'Tính cạnh khi biết 2 cạnh và góc xen giữa' },
        { name: 'Định lý Sin', latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', note: 'R là bán kính đường tròn ngoại tiếp' },
        { name: 'Công thức diện tích tam giác', latex: 'S = \\frac{1}{2}ab\\sin C = \\frac{abc}{4R} = pr = \\sqrt{p(p-a)(p-b)(p-c)}', note: 'p là nửa chu vi, r là bán kính nội tiếp' }
      ]
    }
  },

  // CHƯƠNG IV: VECTƠ
  {
    id: 'lesson_10_7',
    grade: 10,
    number: 7,
    title: 'Các khái niệm mở đầu về vectơ',
    chapterNumber: 4,
    chapterTitle: 'VECTƠ',
    semester: 1,
    examId: 'exam_10_7',
    coreKnowledge: {
      summary: 'Vectơ là đoạn thẳng có hướng. Hai vectơ cùng phương nếu giá của chúng song song hoặc trùng nhau. Hai vectơ bằng nhau khi có cùng hướng và cùng độ dài. Vectơ-không $\\vec{0}$ có độ dài bằng 0 và cùng phương với mọi vectơ.',
      keyFormulas: [
        { name: 'Độ dài vectơ', latex: '|\\vec{AB}| = AB', note: 'Độ dài đoạn thẳng AB' },
        { name: 'Hai vectơ bằng nhau', latex: '\\vec{a} = \\vec{b} \\Leftrightarrow \\begin{cases} \\vec{a} \\uparrow\\uparrow \\vec{b} \\\\ |\\vec{a}| = |\\vec{b}| \\end{cases}', note: 'Cùng hướng và cùng độ dài' }
      ]
    }
  },
  {
    id: 'lesson_10_8',
    grade: 10,
    number: 8,
    title: 'Tổng và hiệu của hai vectơ',
    chapterNumber: 4,
    chapterTitle: 'VECTƠ',
    semester: 1,
    examId: 'exam_10_8',
    coreKnowledge: {
      summary: 'Các quy tắc cộng, trừ vectơ cơ bản: Quy tắc 3 điểm (Chasles), quy tắc hình bình hành, quy tắc trung điểm và quy tắc trọng tâm tam giác.',
      keyFormulas: [
        { name: 'Quy tắc 3 điểm cộng', latex: '\\vec{AB} + \\vec{BC} = \\vec{AC}', note: 'Nối đuôi Chasles' },
        { name: 'Quy tắc 3 điểm trừ', latex: '\\vec{OB} - \\vec{OA} = \\vec{AB}', note: 'Chung gốc O' },
        { name: 'Quy tắc hình bình hành', latex: '\\vec{AB} + \\vec{AD} = \\vec{AC}', note: 'ABCD là hình bình hành' },
        { name: 'Hệ thức trung điểm', latex: '\\vec{IA} + \\vec{IB} = \\vec{0} \\Leftrightarrow \\vec{MA} + \\vec{MB} = 2\\vec{MI}', note: 'I là trung điểm AB' }
      ]
    }
  },
  {
    id: 'lesson_10_9',
    grade: 10,
    number: 9,
    title: 'Tích của một vectơ với một số',
    chapterNumber: 4,
    chapterTitle: 'VECTƠ',
    semester: 1,
    examId: 'exam_10_9',
    coreKnowledge: {
      summary: 'Tích của số $k \\in \\mathbb{R}$ với vectơ $\\vec{a}$ là một vectơ $k\\vec{a}$. Điều kiện để 2 vectơ cùng phương: $\\vec{a}$ cùng phương $\\vec{b} \\neq \\vec{0} \\Leftrightarrow \\exists k \\in \\mathbb{R}: \\vec{a} = k\\vec{b}$.',
      keyFormulas: [
        { name: 'Điều kiện 3 điểm thẳng hàng', latex: 'A, B, C \\text{ thẳng hàng } \\Leftrightarrow \\vec{AB} = k\\vec{AC}', note: 'k ≠ 0' },
        { name: 'Hệ thức trọng tâm', latex: '\\vec{GA} + \\vec{GB} + \\vec{GC} = \\vec{0} \\Leftrightarrow \\vec{MA} + \\vec{MB} + \\vec{MC} = 3\\vec{MG}', note: 'G là trọng tâm tam giác ABC' }
      ]
    }
  },
  {
    id: 'lesson_10_10',
    grade: 10,
    number: 10,
    title: 'Tích vô hướng của hai vectơ',
    chapterNumber: 4,
    chapterTitle: 'VECTƠ',
    semester: 1,
    examId: 'exam_10_10',
    coreKnowledge: {
      summary: 'Tích vô hướng của 2 vectơ $\\vec{a}$ và $\\vec{b}$ là một số thực: $\\vec{a} \\cdot \\vec{b} = |\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos(\\vec{a}, \\vec{b})$. Ứng dụng để tính độ dài, góc và chứng minh hai đường thẳng vuông góc.',
      keyFormulas: [
        { name: 'Công thức tích vô hướng', latex: '\\vec{a} \\cdot \\vec{b} = |\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos(\\vec{a}, \\vec{b})', note: 'Kết quả là một số thực' },
        { name: 'Điều kiện vuông góc', latex: '\\vec{a} \\perp \\vec{b} \\Leftrightarrow \\vec{a} \\cdot \\vec{b} = 0', note: 'Áp dụng chứng minh hình học' },
        { name: 'Bình phương vô hướng', latex: '\\vec{a}^2 = |\\vec{a}|^2', note: 'Bình phương vô hướng bằng bình phương độ dài' }
      ]
    }
  },

  // CHƯƠNG V: CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU KHÔNG GHÉP NHÓM
  {
    id: 'lesson_10_11',
    grade: 10,
    number: 11,
    title: 'Số gần đúng và sai số',
    chapterNumber: 5,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU KHÔNG GHÉP NHÓM',
    semester: 1,
    examId: 'exam_10_11',
    coreKnowledge: {
      summary: 'Sai số tuyệt đối $\\Delta_a = |\\bar{a} - a| \\le d$ (với $d$ là độ chính xác). Sai số tương đối $\\delta_a = \\frac{\\Delta_a}{|a|} \\le \\frac{d}{|a|}$. Quy tròn số căn cứ theo độ chính xác $d$.',
      keyFormulas: [
        { name: 'Sai số tuyệt đối', latex: '\\Delta_a = |\\bar{a} - a| \\le d', note: 'a ± d' },
        { name: 'Sai số tương đối', latex: '\\delta_a = \\frac{\\Delta_a}{|a|}', note: 'Đánh giá mức độ tin cậy' }
      ]
    }
  },
  {
    id: 'lesson_10_12',
    grade: 10,
    number: 12,
    title: 'Các số đặc trưng đo xu thế trung tâm',
    chapterNumber: 5,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU KHÔNG GHÉP NHÓM',
    semester: 1,
    examId: 'exam_10_12',
    coreKnowledge: {
      summary: 'Số trung bình ($\\bar{x}$), Trung vị ($M_e$), Tứ phân vị ($Q_1, Q_2, Q_3$) và Mốt ($M_o$) dùng để mô tả giá trị đại diện cho mẫu số liệu.',
      keyFormulas: [
        { name: 'Số trung bình', latex: '\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n} = \\frac{\\sum n_i x_i}{n}', note: 'Trung bình cộng' },
        { name: 'Tứ phân vị', latex: 'Q_2 = M_e, \\quad Q_1 = M_e(\\text{nửa dưới}), \\quad Q_3 = M_e(\\text{nửa trên})', note: 'Chia mẫu số liệu làm 4 phần bằng nhau' }
      ]
    }
  },
  {
    id: 'lesson_10_13',
    grade: 10,
    number: 13,
    title: 'Các số đặc trưng đo mức độ phân tán',
    chapterNumber: 5,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU KHÔNG GHÉP NHÓM',
    semester: 1,
    examId: 'exam_10_13',
    coreKnowledge: {
      summary: 'Khoảng biến thiên $R = x_{\\max} - x_{\\min}$, Khoảng tứ phân vị $\\Delta_Q = Q_3 - Q_1$, Phương sai $s^2$ và Độ lệch chuẩn $s = \\sqrt{s^2}$ đo mức độ phân tán của mẫu dữ liệu xung quanh giá trị trung bình.',
      keyFormulas: [
        { name: 'Khoảng biến thiên', latex: 'R = x_{\\max} - x_{\\min}', note: 'Hiệu giữa giá trị lớn nhất và nhỏ nhất' },
        { name: 'Khoảng tứ phân vị', latex: '\\Delta_Q = Q_3 - Q_1', note: 'Không bị ảnh hưởng bởi giá trị bất thường' },
        { name: 'Phương sai', latex: 's^2 = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\bar{x})^2', note: 'Độ lệch chuẩn s = √(s²)' }
      ]
    }
  },

  // CHƯƠNG VI: HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG
  {
    id: 'lesson_10_14',
    grade: 10,
    number: 14,
    title: 'Hàm số và đồ thị',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG',
    semester: 2,
    examId: 'exam_10_14',
    coreKnowledge: {
      summary: 'Tập xác định $D$, tập giá trị của hàm số. Sự đồng biến: $x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$ (đồ thị đi lên). Sự nghịch biến: $x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$ (đồ thị đi xuống).',
      keyFormulas: [
        { name: 'Hàm số đồng biến (tăng)', latex: '\\forall x_1, x_2 \\in (a; b), x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)', note: 'Đồ thị đi lên từ trái sang phải' },
        { name: 'Hàm số nghịch biến (giảm)', latex: '\\forall x_1, x_2 \\in (a; b), x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)', note: 'Đồ thị đi xuống từ trái sang phải' }
      ]
    }
  },
  {
    id: 'lesson_10_15',
    grade: 10,
    number: 15,
    title: 'Hàm số bậc hai và đồ thị Parabol',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG',
    semester: 2,
    examId: 'exam_10_15',
    coreKnowledge: {
      summary: 'Hàm số $y = ax^2 + bx + c$ ($a \\neq 0$) có đồ thị là một Parabol có đỉnh $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$, trục đối xứng $x = -\\frac{b}{2a}$. Bề lõm quay lên nếu $a > 0$, quay xuống nếu $a < 0$.',
      keyFormulas: [
        { name: 'Tọa độ đỉnh Parabol', latex: 'I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)', note: 'Điểm cực trị của hàm bậc 2' },
        { name: 'Trục đối xứng', latex: 'x = -\\frac{b}{2a}', note: 'Đường thẳng đứng đi qua đỉnh I' }
      ]
    }
  },
  {
    id: 'lesson_10_16',
    grade: 10,
    number: 16,
    title: 'Dấu của tam thức bậc hai',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG',
    semester: 2,
    examId: 'exam_10_16',
    coreKnowledge: {
      summary: 'Quy tắc xét dấu $f(x) = ax^2 + bx + c$: "Trong trái ngoài cùng" (khi $\\Delta > 0$). Khi $\\Delta < 0$, $f(x)$ luôn cùng dấu với hệ số $a$ với mọi $x \\in \\mathbb{R}$.',
      keyFormulas: [
        { name: 'Điều kiện f(x) > 0 với mọi x', latex: 'f(x) > 0, \\forall x \\in \\mathbb{R} \\Leftrightarrow \\begin{cases} a > 0 \\\\ \\Delta < 0 \\end{cases}', note: 'Luôn dương trên R' },
        { name: 'Điều kiện f(x) ≤ 0 với mọi x', latex: 'f(x) \\le 0, \\forall x \\in \\mathbb{R} \\Leftrightarrow \\begin{cases} a < 0 \\\\ \\Delta \\le 0 \\end{cases}', note: 'Luôn không dương trên R' }
      ]
    }
  },
  {
    id: 'lesson_10_17',
    grade: 10,
    number: 17,
    title: 'Phương trình quy về phương trình bậc hai',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG',
    semester: 2,
    examId: 'exam_10_17',
    coreKnowledge: {
      summary: 'Các dạng phương trình chứa căn bậc hai quy về bậc hai: $\\sqrt{f(x)} = \\sqrt{g(x)}$ (bình phương 2 vế kèm $g(x) \\ge 0$) và $\\sqrt{f(x)} = ax + b$ (điều kiện $ax + b \\ge 0$, sau đó bình phương).',
      keyFormulas: [
        { name: 'Dạng căn f(x) = g(x)', latex: '\\sqrt{f(x)} = g(x) \\Leftrightarrow \\begin{cases} g(x) \\ge 0 \\\\ f(x) = [g(x)]^2 \\end{cases}', note: 'Bắt buộc đặt điều kiện g(x) ≥ 0' },
        { name: 'Dạng căn f(x) = căn g(x)', latex: '\\sqrt{f(x)} = \\sqrt{g(x)} \\Leftrightarrow \\begin{cases} f(x) \\ge 0 \\\\ f(x) = g(x) \\end{cases}', note: 'Chỉ cần 1 trong 2 biểu thức ≥ 0' }
      ]
    }
  },

  // CHƯƠNG VII: PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG
  {
    id: 'lesson_10_18',
    grade: 10,
    number: 18,
    title: 'Tọa độ của vectơ trong mặt phẳng Oxy',
    chapterNumber: 7,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG',
    semester: 2,
    examId: 'exam_10_18',
    coreKnowledge: {
      summary: 'Vectơ $\\vec{u} = (x; y) \\Leftrightarrow \\vec{u} = x\\vec{i} + y\\vec{j}$. Tọa độ điểm $M(x_M; y_M) \\Leftrightarrow \\vec{OM} = (x_M; y_M)$. Độ dài vectơ $|\\vec{u}| = \\sqrt{x^2 + y^2}$. Tọa độ vectơ $\\vec{AB} = (x_B - x_A; y_B - y_A)$.',
      keyFormulas: [
        { name: 'Tích vô hướng tọa độ', latex: '\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2', note: 'Tích hoành + tích tung' },
        { name: 'Độ dài đoạn thẳng', latex: 'AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}', note: 'Khoảng cách giữa 2 điểm' },
        { name: 'Tọa độ trung điểm', latex: 'x_I = \\frac{x_A + x_B}{2}, \\quad y_I = \\frac{y_A + y_B}{2}', note: 'I là trung điểm AB' }
      ]
    }
  },
  {
    id: 'lesson_10_19',
    grade: 10,
    number: 19,
    title: 'Phương trình đường thẳng trong mặt phẳng',
    chapterNumber: 7,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG',
    semester: 2,
    examId: 'exam_10_19',
    coreKnowledge: {
      summary: 'Đường thẳng đi qua $M(x_0; y_0)$ có VTPT $\\vec{n}=(a; b)$ có PTTQ: $a(x - x_0) + b(y - y_0) = 0$. Đường thẳng có VTCP $\\vec{u}=(u_1; u_2)$ có PT tham số: $x = x_0 + u_1 t, y = y_0 + u_2 t$.',
      keyFormulas: [
        { name: 'PT tổng quát đường thẳng', latex: 'ax + by + c = 0 \\quad (a^2+b^2 \\neq 0)', note: 'VTPT n = (a; b)' },
        { name: 'PT tham số đường thẳng', latex: '\\begin{cases} x = x_0 + u_1 t \\\\ y = y_0 + u_2 t \\end{cases} \\quad (t \\in \\mathbb{R})', note: 'VTCP u = (u1; u2)' }
      ]
    }
  },
  {
    id: 'lesson_10_20',
    grade: 10,
    number: 20,
    title: 'Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách',
    chapterNumber: 7,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG',
    semester: 2,
    examId: 'exam_10_20',
    coreKnowledge: {
      summary: 'Khoảng cách từ điểm $M(x_0; y_0)$ đến đường thẳng $\\Delta: ax + by + c = 0$ và cosin góc giữa 2 đường thẳng $\\Delta_1, \\Delta_2$.',
      keyFormulas: [
        { name: 'Khoảng cách từ điểm đến đường thẳng', latex: 'd(M, \\Delta) = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}', note: 'Tử có trị tuyệt đối, mẫu căn a² + b²' },
        { name: 'Góc giữa hai đường thẳng', latex: '\\cos(\\Delta_1, \\Delta_2) = \\frac{|a_1 a_2 + b_1 b_2|}{\\sqrt{a_1^2 + b_1^2} \\cdot \\sqrt{a_2^2 + b_2^2}}', note: 'Góc 0° ≤ φ ≤ 90°' }
      ]
    }
  },
  {
    id: 'lesson_10_21',
    grade: 10,
    number: 21,
    title: 'Đường tròn trong mặt phẳng tọa độ',
    chapterNumber: 7,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG',
    semester: 2,
    examId: 'exam_10_21',
    coreKnowledge: {
      summary: 'Đường tròn tâm $I(a; b)$ bán kính $R$ có phương trình chính tắc $(x - a)^2 + (y - b)^2 = R^2$ hoặc dạng khai triển $x^2 + y^2 - 2ax - 2by + c = 0$ với điều kiện $a^2 + b^2 - c > 0$ ($R = \\sqrt{a^2 + b^2 - c}$).',
      keyFormulas: [
        { name: 'Phương trình chính tắc đường tròn', latex: '(x - a)^2 + (y - b)^2 = R^2', note: 'Tâm I(a; b), bán kính R' },
        { name: 'Điều kiện phương trình bậc hai là đường tròn', latex: 'a^2 + b^2 - c > 0', note: 'R = √(a² + b² - c)' },
        { name: 'Phương trình tiếp tuyến tại điểm M₀', latex: '(x_0 - a)(x - x_0) + (y_0 - b)(y - y_0) = 0', note: 'M₀(x₀; y₀) thuộc (C)' }
      ]
    }
  },
  {
    id: 'lesson_10_22',
    grade: 10,
    number: 22,
    title: 'Ba đường conic trong mặt phẳng tọa độ',
    chapterNumber: 7,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG',
    semester: 2,
    examId: 'exam_10_22',
    coreKnowledge: {
      summary: 'Phương trình chính tắc của 3 đường conic: Elip $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($b^2 = a^2 - c^2$), Hypebol $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ ($b^2 = c^2 - a^2$), Parabol $y^2 = 2px$ ($p > 0$).',
      keyFormulas: [
        { name: 'PT chính tắc Elip', latex: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad (a > b > 0, b^2 = a^2 - c^2)', note: 'Tiêu cự 2c, trục lớn 2a, trục nhỏ 2b' },
        { name: 'PT chính tắc Hypebol', latex: '\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\quad (a, b > 0, c^2 = a^2 + b^2)', note: 'Tiêu cự 2c, trục thực 2a, trục ảo 2b' },
        { name: 'PT chính tắc Parabol', latex: 'y^2 = 2px \\quad (p > 0)', note: 'Tiêu điểm F(p/2; 0), đường chuẩn x = -p/2' }
      ]
    }
  },

  // CHƯƠNG VIII: ĐẠI SỐ TỔ HỢP
  {
    id: 'lesson_10_23',
    grade: 10,
    number: 23,
    title: 'Quy tắc đếm (Quy tắc cộng và quy tắc nhân)',
    chapterNumber: 8,
    chapterTitle: 'ĐẠI SỐ TỔ HỢP',
    semester: 2,
    examId: 'exam_10_23',
    coreKnowledge: {
      summary: 'Quy tắc cộng áp dụng cho các phương án loại trừ nhau (hoàn thành công việc trong 1 phương án). Quy tắc nhân áp dụng cho công việc gồm nhiều giai đoạn liên tiếp (phải thực hiện tất cả các giai đoạn).',
      keyFormulas: [
        { name: 'Quy tắc cộng', latex: 'N = m + n', note: '2 phương án độc lập A hoặc B' },
        { name: 'Quy tắc nhân', latex: 'N = m \\times n', note: '2 giai đoạn liên tiếp 1 và 2' }
      ]
    }
  },
  {
    id: 'lesson_10_24',
    grade: 10,
    number: 24,
    title: 'Hoán vị, chỉnh hợp và tổ hợp',
    chapterNumber: 8,
    chapterTitle: 'ĐẠI SỐ TỔ HỢP',
    semester: 2,
    examId: 'exam_10_24',
    coreKnowledge: {
      summary: 'Hoán vị ($P_n = n!$) sắp xếp $n$ phần tử có thứ tự. Chỉnh hợp ($A_n^k$) chọn $k$ phần tử và sắp xếp có thứ tự. Tổ hợp ($C_n^k$) chọn $k$ phần tử không phân biệt thứ tự.',
      keyFormulas: [
        { name: 'Số hoán vị', latex: 'P_n = n! = n(n-1)\\dots 1', note: 'Quy ước 0! = 1' },
        { name: 'Số chỉnh hợp chập k', latex: 'A_n^k = \\frac{n!}{(n-k)!}', note: 'Có thứ tự (vị trí, chức vụ)' },
        { name: 'Số tổ hợp chập k', latex: 'C_n^k = \\frac{n!}{k!(n-k)!} = \\frac{A_n^k}{k!}', note: 'Không tính thứ tự (chọn nhóm)' },
        { name: 'Tính chất đối xứng tổ hợp', latex: 'C_n^k = C_n^{n-k}, \\quad C_n^k + C_n^{k+1} = C_{n+1}^{k+1}', note: 'Tam giác Pascal' }
      ]
    }
  },
  {
    id: 'lesson_10_25',
    grade: 10,
    number: 25,
    title: 'Nhị thức Newton (Bậc 4 và Bậc 5)',
    chapterNumber: 8,
    chapterTitle: 'ĐẠI SỐ TỔ HỢP',
    semester: 2,
    examId: 'exam_10_25',
    coreKnowledge: {
      summary: 'Công thức khai triển nhị thức Newton $(a+b)^4$ và $(a+b)^5$ sử dụng hệ số tổ hợp $C_n^k$.',
      keyFormulas: [
        { name: 'Khai triển (a+b)⁴', latex: '(a+b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4', note: 'Hệ số: 1, 4, 6, 4, 1' },
        { name: 'Khai triển (a+b)⁵', latex: '(a+b)^5 = a^5 + 5a^4b + 10a^3b^2 + 10a^2b^3 + 5ab^4 + b^5', note: 'Hệ số: 1, 5, 10, 10, 5, 1' }
      ]
    }
  },

  // CHƯƠNG IX: XÁC SUẤT CỔ ĐIỂN
  {
    id: 'lesson_10_26',
    grade: 10,
    number: 26,
    title: 'Biến cố và không gian mẫu',
    chapterNumber: 9,
    chapterTitle: 'TÍNH XÁC SUẤT THEO ĐỊNH NGHĨA CỔ ĐIỂN',
    semester: 2,
    examId: 'exam_10_26',
    coreKnowledge: {
      summary: 'Không gian mẫu $\\Omega$ là tập hợp tất cả các kết quả có thể xảy ra của phép thử. Biến cố $A$ là tập con của không gian mẫu ($A \\subset \\Omega$). Biến cố không thể $\\emptyset$, biến cố chắc chắn $\\Omega$, biến cố đối $\\overline{A} = \\Omega \\setminus A$.',
      keyFormulas: [
        { name: 'Số phần tử không gian mẫu', latex: 'n(\\Omega)', note: 'Tổng số kết quả đồng khả năng' },
        { name: 'Biến cố đối', latex: 'P(\\overline{A}) = 1 - P(A)', note: 'Tổng xác suất biến cố và đối bằng 1' }
      ]
    }
  },
  {
    id: 'lesson_10_27',
    grade: 10,
    number: 27,
    title: 'Xác suất của biến cố theo định nghĩa cổ điển',
    chapterNumber: 9,
    chapterTitle: 'TÍNH XÁC SUẤT THEO ĐỊNH NGHĨA CỔ ĐIỂN',
    semester: 2,
    examId: 'exam_10_27',
    coreKnowledge: {
      summary: 'Định nghĩa cổ điển của xác suất: $P(A) = \\frac{n(A)}{n(\\Omega)}$ với $n(A)$ là số kết quả thuận lợi cho $A$ và $n(\\Omega)$ là số phần tử của không gian mẫu ($0 \\le P(A) \\le 1$).',
      keyFormulas: [
        { name: 'Công thức xác suất cổ điển', latex: 'P(A) = \\frac{n(A)}{n(\\Omega)}', note: 'n(A): số kết quả thuận lợi cho A' }
      ]
    }
  }
];

// ==========================================
// 2. KHỐI 11 (31 BÀI HỌC - 9 CHƯƠNG)
// ==========================================
export const GRADE_11_LESSONS: Lesson[] = [
  // CHƯƠNG I: HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC
  {
    id: 'lesson_11_1',
    grade: 11,
    number: 1,
    title: 'Giá trị lượng giác của góc lượng giác',
    chapterNumber: 1,
    chapterTitle: 'HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC',
    semester: 1,
    examId: 'exam_11_1',
    coreKnowledge: {
      summary: 'Khái niệm góc lượng giác trên đường tròn lượng giác, đơn vị radian ($180^\\circ = \\pi \\text{ rad}$). Giá trị lượng giác $\\sin, \\cos, \\tan, \\cot$ và dấu theo 4 góc phần tư.',
      keyFormulas: [
        { name: 'Đổi độ sang radian', latex: 'a^\\circ = a \\cdot \\frac{\\pi}{180} \\text{ rad}', note: 'π rad = 180°' },
        { name: 'Độ dài cung tròn', latex: 'l = R \\cdot \\alpha', note: 'α tính bằng radian, R là bán kính' }
      ]
    }
  },
  {
    id: 'lesson_11_2',
    grade: 11,
    number: 2,
    title: 'Công thức lượng giác',
    chapterNumber: 1,
    chapterTitle: 'HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC',
    semester: 1,
    examId: 'exam_11_2',
    coreKnowledge: {
      summary: 'Hệ thống công thức cộng, công thức nhân đôi, công thức hạ bậc, công thức biến đổi tích thành tổng và tổng thành tích.',
      keyFormulas: [
        { name: 'Công thức cộng Cos', latex: '\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b', note: 'Cos thì cos cos sin sin, dấu trừ' },
        { name: 'Công thức cộng Sin', latex: '\\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b', note: 'Sin thì sin cos cos sin, cùng dấu' },
        { name: 'Công thức nhân đôi', latex: '\\sin 2a = 2\\sin a \\cos a, \\quad \\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a', note: 'Hạ bậc cos² a = (1+cos2a)/2' },
        { name: 'Công thức biến đổi tổng thành tích', latex: '\\cos u + \\cos v = 2\\cos\\frac{u+v}{2}\\cos\\frac{u-v}{2}', note: 'Cos cộng cos bằng 2 cos cos' }
      ]
    }
  },
  {
    id: 'lesson_11_3',
    grade: 11,
    number: 3,
    title: 'Hàm số lượng giác',
    chapterNumber: 1,
    chapterTitle: 'HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC',
    semester: 1,
    examId: 'exam_11_3',
    coreKnowledge: {
      summary: 'Khảo sát tập xác định, tập giá trị, tính chẵn lẻ và tính tuần hoàn của 4 hàm số lượng giác cơ bản: $y = \\sin x$ (chu kỳ $2\\pi$), $y = \\cos x$ (chu kỳ $2\\pi$), $y = \\tan x$ (chu kỳ $\\pi$), $y = \\cot x$ (chu kỳ $\\pi$).',
      keyFormulas: [
        { name: 'Tính chẵn lẻ', latex: '\\cos(-x) = \\cos x \\text{ (chẵn)}, \\quad \\sin(-x) = -\\sin x, \\tan(-x) = -\\tan x \\text{ (lẻ)}', note: 'Cos chẵn, Sin và Tan lẻ' }
      ]
    }
  },
  {
    id: 'lesson_11_4',
    grade: 11,
    number: 4,
    title: 'Phương trình lượng giác cơ bản',
    chapterNumber: 1,
    chapterTitle: 'HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC',
    semester: 1,
    examId: 'exam_11_4',
    coreKnowledge: {
      summary: 'Nghiệm của các phương trình lượng giác cơ bản: $\\sin x = m, \\cos x = m, \\tan x = m, \\cot x = m$.',
      keyFormulas: [
        { name: 'Nghiệm phương trình sin x = sin α', latex: '\\sin x = \\sin\\alpha \\Leftrightarrow \\begin{bmatrix} x = \\alpha + k2\\pi \\\\ x = \\pi - \\alpha + k2\\pi \\end{bmatrix} \\quad (k \\in \\mathbb{Z})', note: 'Chính nó hoặc bù + k2π' },
        { name: 'Nghiệm phương trình cos x = cos α', latex: '\\cos x = \\cos\\alpha \\Leftrightarrow x = \\pm \\alpha + k2\\pi \\quad (k \\in \\mathbb{Z})', note: 'Đối nhau ±α + k2π' },
        { name: 'Nghiệm phương trình tan x = tan α', latex: '\\tan x = \\tan\\alpha \\Leftrightarrow x = \\alpha + k\\pi \\quad (k \\in \\mathbb{Z})', note: 'Chu kỳ kπ' }
      ]
    }
  },

  // CHƯƠNG II: DÃY SỐ, CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN
  {
    id: 'lesson_11_5',
    grade: 11,
    number: 5,
    title: 'Dãy số',
    chapterNumber: 2,
    chapterTitle: 'DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN',
    semester: 1,
    examId: 'exam_11_5',
    coreKnowledge: {
      summary: 'Dãy số $(u_n)$ là hàm số xác định trên $\\mathbb{N}^*$. Dãy số tăng khi $u_{n+1} > u_n, \\forall n$. Dãy số giảm khi $u_{n+1} < u_n, \\forall n$. Dãy số bị chặn trên, bị chặn dưới và bị chặn.',
      keyFormulas: [
        { name: 'Dãy số bị chặn', latex: 'm \\le u_n \\le M, \\quad \\forall n \\in \\mathbb{N}^*', note: 'Bị chặn cả trên và dưới' }
      ]
    }
  },
  {
    id: 'lesson_11_6',
    grade: 11,
    number: 6,
    title: 'Cấp số cộng',
    chapterNumber: 2,
    chapterTitle: 'DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN',
    semester: 1,
    examId: 'exam_11_6',
    coreKnowledge: {
      summary: 'Cấp số cộng có $u_{n+1} = u_n + d$ ($d$ là công sai). Số hạng tổng quát $u_n = u_1 + (n-1)d$. Tổng $n$ số hạng đầu $S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n-1)d]}{2}$.',
      keyFormulas: [
        { name: 'Số hạng tổng quát CSC', latex: 'u_n = u_1 + (n-1)d', note: 'd: công sai' },
        { name: 'Tổng n số hạng đầu CSC', latex: 'S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n-1)d]}{2}', note: 'Tính tổng dãy số cách đều' }
      ]
    }
  },
  {
    id: 'lesson_11_7',
    grade: 11,
    number: 7,
    title: 'Cấp số nhân',
    chapterNumber: 2,
    chapterTitle: 'DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN',
    semester: 1,
    examId: 'exam_11_7',
    coreKnowledge: {
      summary: 'Cấp số nhân có $u_{n+1} = u_n \\cdot q$ ($q$ là công bội). Số hạng tổng quát $u_n = u_1 \\cdot q^{n-1}$. Tổng $n$ số hạng đầu ($q \\neq 1$): $S_n = \\frac{u_1(1 - q^n)}{1 - q}$.',
      keyFormulas: [
        { name: 'Số hạng tổng quát CSN', latex: 'u_n = u_1 \\cdot q^{n-1}', note: 'q: công bội' },
        { name: 'Tổng n số hạng đầu CSN', latex: 'S_n = \\frac{u_1(1 - q^n)}{1 - q} \\quad (q \\neq 1)', note: 'Tổng cấp số nhân' },
        { name: 'Tổng cấp số nhân lùi vô hạn', latex: 'S = \\frac{u_1}{1 - q} \\quad (|q| < 1)', note: 'Lùi vô hạn khi |q| < 1' }
      ]
    }
  },

  // CHƯƠNG III: GIỚI HẠN. HÀM SỐ LIÊN TỤC
  {
    id: 'lesson_11_8',
    grade: 11,
    number: 8,
    title: 'Giới hạn của dãy số',
    chapterNumber: 3,
    chapterTitle: 'GIỚI HẠN. HÀM SỐ LIÊN TỤC',
    semester: 1,
    examId: 'exam_11_8',
    coreKnowledge: {
      summary: 'Các giới hạn cơ bản: $\\lim \\frac{1}{n^k} = 0, \\lim q^n = 0$ ($|q| < 1$). Quy tắc tính giới hạn vô cực và khử các dạng vô định $\\frac{\\infty}{\\infty}, \\infty - \\infty$.',
      keyFormulas: [
        { name: 'Giới hạn phân thức bậc vô cùng', latex: '\\lim_{n \\to +\\infty} \\frac{a_p n^p + \\dots}{b_q n^q + \\dots}', note: 'Chia bậc cao nhất của n' }
      ]
    }
  },
  {
    id: 'lesson_11_9',
    grade: 11,
    number: 9,
    title: 'Giới hạn của hàm số',
    chapterNumber: 3,
    chapterTitle: 'GIỚI HẠN. HÀM SỐ LIÊN TỤC',
    semester: 1,
    examId: 'exam_11_9',
    coreKnowledge: {
      summary: 'Giới hạn hữu hạn tại một điểm $\\lim_{x \\to x_0} f(x)$, giới hạn một bên $\\lim_{x \\to x_0^+} f(x), \\lim_{x \\to x_0^-} f(x)$. Khử các dạng vô định kinh điển: $\\frac{0}{0}, \\frac{\\infty}{\\infty}, 0 \\cdot \\infty, \\infty - \\infty$.',
      keyFormulas: [
        { name: 'Điều kiện tồn tại giới hạn tại điểm', latex: '\\lim_{x \\to x_0} f(x) = L \\Leftrightarrow \\lim_{x \\to x_0^+} f(x) = \\lim_{x \\to x_0^-} f(x) = L', note: 'Giới hạn trái bằng giới hạn phải' }
      ]
    }
  },
  {
    id: 'lesson_11_10',
    grade: 11,
    number: 10,
    title: 'Hàm số liên tục',
    chapterNumber: 3,
    chapterTitle: 'GIỚI HẠN. HÀM SỐ LIÊN TỤC',
    semester: 1,
    examId: 'exam_11_10',
    coreKnowledge: {
      summary: 'Hàm số $y = f(x)$ liên tục tại điểm $x_0 \\Leftrightarrow \\lim_{x \\to x_0} f(x) = f(x_0)$. Định lý giá trị trung gian: Nếu $f(x)$ liên tục trên $[a; b]$ và $f(a) \\cdot f(b) < 0$ thì phương trình $f(x) = 0$ có ít nhất 1 nghiệm $c \\in (a; b)$.',
      keyFormulas: [
        { name: 'Định lý nghiệm phương trình', latex: 'f(a) \\cdot f(b) < 0 \\Rightarrow \\exists c \\in (a; b): f(c) = 0', note: 'Chứng minh phương trình có nghiệm' }
      ]
    }
  },

  // CHƯƠNG IV: QUAN HỆ SONG SONG TRONG KHÔNG GIAN
  {
    id: 'lesson_11_11',
    grade: 11,
    number: 11,
    title: 'Điểm, đường thẳng và mặt phẳng trong không gian',
    chapterNumber: 4,
    chapterTitle: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG',
    semester: 1,
    examId: 'exam_11_11',
    coreKnowledge: {
      summary: 'Các tiên đề hình học không gian, cách xác định một mặt phẳng (qua 3 điểm không thẳng hàng, qua 1 điểm và 1 đường thẳng, qua 2 đường thẳng cắt nhau hoặc song song). Cách tìm giao tuyến của 2 mặt phẳng và giao điểm của đường thẳng với mặt phẳng.'
    }
  },
  {
    id: 'lesson_11_12',
    grade: 11,
    number: 12,
    title: 'Hai đường thẳng song song trong không gian',
    chapterNumber: 4,
    chapterTitle: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG',
    semester: 1,
    examId: 'exam_11_12',
    coreKnowledge: {
      summary: 'Vị trí tương đối của 2 đường thẳng trong không gian: Cắt nhau, song song, trùng nhau (đồng phẳng) và chéo nhau (không đồng phẳng). Định lý giao tuyến song song.'
    }
  },
  {
    id: 'lesson_11_13',
    grade: 11,
    number: 13,
    title: 'Đường thẳng và mặt phẳng song song',
    chapterNumber: 4,
    chapterTitle: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG',
    semester: 1,
    examId: 'exam_11_13',
    coreKnowledge: {
      summary: 'Điều kiện để đường thẳng song song với mặt phẳng: $d \\not\\subset (\\alpha)$ và $d \\parallel d\' \\subset (\\alpha) \\Rightarrow d \\parallel (\\alpha)$.',
      keyFormulas: [
        { name: 'Điều kiện d // (α)', latex: '\\begin{cases} d \\not\\subset (\\alpha) \\\\ d \\parallel d\' \\subset (\\alpha) \\end{cases} \\Rightarrow d \\parallel (\\alpha)', note: 'Chứng minh đường thẳng // mặt phẳng' }
      ]
    }
  },
  {
    id: 'lesson_11_14',
    grade: 11,
    number: 14,
    title: 'Hai mặt phẳng song song',
    chapterNumber: 4,
    chapterTitle: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG',
    semester: 1,
    examId: 'exam_11_14',
    coreKnowledge: {
      summary: 'Điều kiện để 2 mặt phẳng song song: Nếu mặt phẳng $(\\alpha)$ chứa 2 đường thẳng cắt nhau $a, b$ cùng song song với $(\\beta)$ thì $(\\alpha) \\parallel (\\beta)$. Định lý Ta-lét trong không gian.'
    }
  },
  {
    id: 'lesson_11_15',
    grade: 11,
    number: 15,
    title: 'Phép chiếu song song và hình biểu diễn',
    chapterNumber: 4,
    chapterTitle: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG',
    semester: 1,
    examId: 'exam_11_15',
    coreKnowledge: {
      summary: 'Tính chất của phép chiếu song song: Bảo toàn tính thẳng hàng, thứ tự điểm, tỉ số đoạn thẳng và tính song song của hai đường thẳng.'
    }
  },

  // CHƯƠNG V: CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU GHÉP NHÓM
  {
    id: 'lesson_11_16',
    grade: 11,
    number: 16,
    title: 'Mẫu số liệu ghép nhóm và các số đặc trưng',
    chapterNumber: 5,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    examId: 'exam_11_16',
    coreKnowledge: {
      summary: 'Tính số trung bình $\\bar{x}$, Trung vị $M_e$, Tứ phân vị $Q_1, Q_2, Q_3$ và Mốt $M_o$ cho bảng tần số ghép nhóm dạng $[a_i; a_{i+1})$.',
      keyFormulas: [
        { name: 'Trung vị mẫu ghép nhóm', latex: 'M_e = a_p + \\frac{\\frac{n}{2} - C}{n_p} \\cdot (a_{p+1} - a_p)', note: 'C: tần số tích lũy nhóm trước' },
        { name: 'Mốt mẫu ghép nhóm', latex: 'M_o = a_j + \\frac{n_j - n_{j-1}}{(n_j - n_{j-1}) + (n_j - n_{j+1})} \\cdot h', note: 'h: độ dài nhóm chứa mốt' }
      ]
    }
  },

  // CHƯƠNG VI: HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT
  {
    id: 'lesson_11_17',
    grade: 11,
    number: 17,
    title: 'Phép tính lũy thừa với số mũ thực',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    semester: 2,
    examId: 'exam_11_17',
    coreKnowledge: {
      summary: 'Các quy tắc lũy thừa với số mũ nguyên, hữu tỉ và thực: $a^m \\cdot a^n = a^{m+n}, \\frac{a^m}{a^n} = a^{m-n}, (a^m)^n = a^{m\\cdot n}, (ab)^n = a^n b^n, \\sqrt[n]{a^m} = a^{\\frac{m}{n}}$.',
      keyFormulas: [
        { name: 'Lũy thừa căn bậc n', latex: '\\sqrt[n]{a^m} = a^{\\frac{m}{n}} \\quad (a > 0, n \\in \\mathbb{N}^*, n \\ge 2)', note: 'Chuyển căn sang số mũ phân số' }
      ]
    }
  },
  {
    id: 'lesson_11_18',
    grade: 11,
    number: 18,
    title: 'Lôgarit',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    semester: 2,
    examId: 'exam_11_18',
    coreKnowledge: {
      summary: 'Định nghĩa lôgarit $\\log_a b = c \\Leftrightarrow a^c = b$ ($0 < a \\neq 1, b > 0$). Các tính chất: $\\log_a (xy) = \\log_a x + \\log_a y, \\log_a \\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y, \\log_a x^\\alpha = \\alpha \\log_a x$. Công thức đổi cơ số $\\log_a b = \\frac{\\log_c b}{\\log_c a}$.',
      keyFormulas: [
        { name: 'Công thức đổi cơ số', latex: '\\log_a b = \\frac{\\log_c b}{\\log_c a} = \\frac{\\ln b}{\\ln a}', note: 'Chuyển về ln hoặc log thập phân' }
      ]
    }
  },
  {
    id: 'lesson_11_19',
    grade: 11,
    number: 19,
    title: 'Hàm số mũ và hàm số lôgarit',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    semester: 2,
    examId: 'exam_11_19',
    coreKnowledge: {
      summary: 'Hàm số $y = a^x$ (TXĐ $\\mathbb{R}$, TGT $(0; +\\infty)$) và $y = \\log_a x$ (TXĐ $(0; +\\infty)$, TGT $\\mathbb{R}$). Đồng biến khi $a > 1$, nghịch biến khi $0 < a < 1$. Đồ thị đối xứng nhau qua đường thẳng $y = x$.',
      keyFormulas: [
        { name: 'Đạo hàm hàm số mũ', latex: '(a^x)\' = a^x \\ln a, \\quad (e^x)\' = e^x', note: 'Cơ số e đạo hàm bằng chính nó' },
        { name: 'Đạo hàm hàm số lôgarit', latex: '(\\log_a x)\' = \\frac{1}{x \\ln a}, \\quad (\\ln x)\' = \\frac{1}{x}', note: 'TXĐ x > 0' }
      ]
    }
  },
  {
    id: 'lesson_11_20',
    grade: 11,
    number: 20,
    title: 'Phương trình, bất phương trình mũ và lôgarit',
    chapterNumber: 6,
    chapterTitle: 'HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT',
    semester: 2,
    examId: 'exam_11_20',
    coreKnowledge: {
      summary: 'Các phương pháp giải phương trình, BPT mũ và lôgarit: Đưa về cùng cơ số, đặt ẩn phụ, lôgarit hóa / mũ hóa, đánh giá hàm đặc trưng. Lưu ý đổi chiều BPT khi cơ số $0 < a < 1$.',
      keyFormulas: [
        { name: 'BPT mũ cơ số 0 < a < 1', latex: 'a^{f(x)} > a^{g(x)} \\Leftrightarrow f(x) < g(x) \\quad (0 < a < 1)', note: 'Đổi chiều bất phương trình' },
        { name: 'BPT lôgarit cơ số a > 1', latex: '\\log_a f(x) > \\log_a g(x) \\Leftrightarrow f(x) > g(x) > 0 \\quad (a > 1)', note: 'Giữ nguyên chiều, kèm điều kiện dương' }
      ]
    }
  },

  // CHƯƠNG VII: ĐẠO HÀM
  {
    id: 'lesson_11_21',
    grade: 11,
    number: 21,
    title: 'Định nghĩa và ý nghĩa hình học của đạo hàm',
    chapterNumber: 7,
    chapterTitle: 'ĐẠO HÀM',
    semester: 2,
    examId: 'exam_11_21',
    coreKnowledge: {
      summary: 'Đạo hàm tại điểm: $f\'(x_0) = \\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0}$. Ý nghĩa hình học: Hệ số góc của tiếp tuyến tại $M(x_0; y_0)$ là $k = f\'(x_0)$. Phương trình tiếp tuyến: $y = f\'(x_0)(x - x_0) + y_0$.',
      keyFormulas: [
        { name: 'PT tiếp tuyến của đồ thị hàm số', latex: 'y = f\'(x_0)(x - x_0) + y_0', note: 'k = f\'(x₀) là hệ số góc tiếp tuyến' }
      ]
    }
  },
  {
    id: 'lesson_11_22',
    grade: 11,
    number: 22,
    title: 'Các quy tắc tính đạo hàm',
    chapterNumber: 7,
    chapterTitle: 'ĐẠO HÀM',
    semester: 2,
    examId: 'exam_11_22',
    coreKnowledge: {
      summary: 'Đạo hàm tổng, hiệu, tích, thương và đạo hàm hàm hợp: $(uv)\' = u\'v + uv\', \\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}, [f(u)]\' = f\'(u) \\cdot u\'$.',
      keyFormulas: [
        { name: 'Đạo hàm thương', latex: '\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}', note: 'Mẫu bình phương' },
        { name: 'Đạo hàm hàm hợp', latex: '[f(u)]\' = f\'(u) \\cdot u\'(x)', note: 'Nhân thêm u\'(x)' }
      ]
    }
  },
  {
    id: 'lesson_11_23',
    grade: 11,
    number: 23,
    title: 'Đạo hàm cấp hai và ứng dụng vật lí',
    chapterNumber: 7,
    chapterTitle: 'ĐẠO HÀM',
    semester: 2,
    examId: 'exam_11_23',
    coreKnowledge: {
      summary: 'Đạo hàm cấp hai $y\'\' = (y\')\'$. Ý nghĩa vật lí: Vận tốc tức thời $v(t) = s\'(t)$, Gia tốc tức thời $a(t) = v\'(t) = s\'\'(t)$.',
      keyFormulas: [
        { name: 'Gia tốc tức thời', latex: 'a(t) = v\'(t) = s\'\'(t)', note: 'Đạo hàm cấp 2 của phương trình quãng đường' }
      ]
    }
  },

  // CHƯƠNG VIII: QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN
  {
    id: 'lesson_11_24',
    grade: 11,
    number: 24,
    title: 'Hai đường thẳng vuông góc trong không gian',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_24',
    coreKnowledge: {
      summary: 'Góc giữa hai đường thẳng $a, b$ ($0^\\circ \\le \\varphi \\le 90^\\circ$). Điều kiện vuông góc: $a \\perp b \\Leftrightarrow \\vec{u}_a \\cdot \\vec{u}_b = 0$.'
    }
  },
  {
    id: 'lesson_11_25',
    grade: 11,
    number: 25,
    title: 'Đường thẳng vuông góc với mặt phẳng',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_25',
    coreKnowledge: {
      summary: 'Điều kiện để $d \\perp (\\alpha)$: Đường thẳng $d$ vuông góc với 2 đường thẳng cắt nhau nằm trong $(\\alpha)$. Định lý 3 đường vuông góc.',
      keyFormulas: [
        { name: 'Điều kiện d ⊥ (α)', latex: '\\begin{cases} d \\perp a \\subset (\\alpha) \\\\ d \\perp b \\subset (\\alpha) \\\\ a \\cap b = \\{O\\} \\end{cases} \\Rightarrow d \\perp (\\alpha)', note: 'Vuông góc với 2 đường cắt nhau' }
      ]
    }
  },
  {
    id: 'lesson_11_26',
    grade: 11,
    number: 26,
    title: 'Hai mặt phẳng vuông góc',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_26',
    coreKnowledge: {
      summary: 'Điều kiện để $(\\alpha) \\perp (\\beta)$: Mặt phẳng $(\\alpha)$ chứa một đường thẳng vuông góc với $(\\beta)$. Định lý giao tuyến vuông góc.'
    }
  },
  {
    id: 'lesson_11_27',
    grade: 11,
    number: 27,
    title: 'Khoảng cách trong không gian',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_27',
    coreKnowledge: {
      summary: 'Khoảng cách từ điểm đến đường thẳng, điểm đến mặt phẳng, khoảng cách giữa đường thẳng và mặt phẳng song song, và khoảng cách giữa 2 đường thẳng chéo nhau (đoạn vuông góc chung / dựng mặt phẳng song song).',
      keyFormulas: [
        { name: 'Khoảng cách 2 đường chéo nhau', latex: 'd(a, b) = d(a, (\\beta)) = d(M, (\\beta)) \\quad (b \\subset (\\beta), a \\parallel (\\beta))', note: 'Đưa về khoảng cách từ điểm đến mặt phẳng' }
      ]
    }
  },
  {
    id: 'lesson_11_28',
    grade: 11,
    number: 28,
    title: 'Góc giữa đường thẳng và mặt phẳng. Góc nhị diện',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_28',
    coreKnowledge: {
      summary: 'Góc giữa đường thẳng $d$ và $(\\alpha)$ là góc giữa $d$ và hình chiếu $d\'$ của nó trên $(\\alpha)$. Góc phẳng nhị diện xác định bởi 2 tia cùng vuông góc với cạnh nhị diện tại 1 điểm.'
    }
  },
  {
    id: 'lesson_11_29',
    grade: 11,
    number: 29,
    title: 'Thể tích của một số khối đa diện',
    chapterNumber: 8,
    chapterTitle: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_11_29',
    coreKnowledge: {
      summary: 'Công thức tính thể tích khối lăng trụ $V = B \\cdot h$ và khối chóp $V = \\frac{1}{3} B \\cdot h$.',
      keyFormulas: [
        { name: 'Thể tích khối lăng trụ / hộp', latex: 'V = B \\cdot h', note: 'B: diện tích đáy, h: chiều cao' },
        { name: 'Thể tích khối chóp', latex: 'V = \\frac{1}{3} B \\cdot h', note: 'B: diện tích đáy, h: chiều cao' }
      ]
    }
  },

  // CHƯƠNG IX: XÁC SUẤT
  {
    id: 'lesson_11_30',
    grade: 11,
    number: 30,
    title: 'Biến cố giao và quy tắc nhân xác suất',
    chapterNumber: 9,
    chapterTitle: 'XÁC SUẤT',
    semester: 2,
    examId: 'exam_11_30',
    coreKnowledge: {
      summary: 'Hai biến cố $A$ và $B$ độc lập khi việc xảy ra hay không xảy ra của $A$ không ảnh hưởng đến xác suất của $B$. Quy tắc nhân cho biến cố độc lập: $P(AB) = P(A) \\cdot P(B)$.',
      keyFormulas: [
        { name: 'Quy tắc nhân biến cố độc lập', latex: 'P(A \\cap B) = P(A) \\cdot P(B)', note: 'Áp dụng khi A và B độc lập' }
      ]
    }
  },
  {
    id: 'lesson_11_31',
    grade: 11,
    number: 31,
    title: 'Biến cố hợp và quy tắc cộng xác suất',
    chapterNumber: 9,
    chapterTitle: 'XÁC SUẤT',
    semester: 2,
    examId: 'exam_11_31',
    coreKnowledge: {
      summary: 'Quy tắc cộng tổng quát: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. Nếu $A$ và $B$ xung khắc ($A \\cap B = \\emptyset$) thì $P(A \\cup B) = P(A) + P(B)$.',
      keyFormulas: [
        { name: 'Quy tắc cộng tổng quát', latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)', note: 'Trừ phần giao nhau' },
        { name: 'Quy tắc cộng biến cố xung khắc', latex: 'P(A \\cup B) = P(A) + P(B) \\quad (A \\cap B = \emptyset)', note: 'Không xảy ra đồng thời' }
      ]
    }
  }
];

// ==========================================
// 3. KHỐI 12 (19 BÀI HỌC - 6 CHƯƠNG)
// ==========================================
export const GRADE_12_LESSONS: Lesson[] = [
  // CHƯƠNG I: ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ
  {
    id: 'lesson_1',
    grade: 12,
    number: 1,
    title: 'Tính đơn điệu và cực trị của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_1',
    coreKnowledge: {
      summary: 'Khảo sát dấu đạo hàm $y\' = f\'(x)$: Hàm số đồng biến trên $K \\Leftrightarrow f\'(x) \\ge 0, \\forall x \\in K$ (bằng 0 tại hữu hạn điểm). Hàm số nghịch biến khi $f\'(x) \\le 0$. Cực trị là điểm mà tại đó đạo hàm $f\'(x)$ đổi dấu khi đi qua $x_0$.',
      keyFormulas: [
        { name: 'Điều kiện đồng biến', latex: 'f\'(x) \\ge 0, \\quad \\forall x \\in K', note: 'Dấu bằng xảy ra tại hữu hạn điểm' },
        { name: 'Điều kiện nghịch biến', latex: 'f\'(x) \\le 0, \\quad \\forall x \\in K', note: 'Dấu bằng xảy ra tại hữu hạn điểm' },
        { name: 'Cực đại (Đổi dấu + sang -)', latex: 'f\'(x_0) = 0 \\text{ và } f\'\'(x_0) < 0', note: 'Điểm cực đại địa phương' },
        { name: 'Cực tiểu (Đổi dấu - sang +)', latex: 'f\'(x_0) = 0 \\text{ và } f\'\'(x_0) > 0', note: 'Điểm cực tiểu địa phương' }
      ],
      methods: [
        {
          problemType: 'Tìm khoảng đơn điệu của hàm số',
          steps: [
            'Bước 1: Tìm tập xác định $D$ của hàm số.',
            'Bước 2: Tính đạo hàm $y\' = f\'(x)$. Giải phương trình $f\'(x) = 0$ hoặc tìm các điểm $f\'(x)$ không xác định.',
            'Bước 3: Lập bảng xét dấu $f\'(x)$ hoặc bảng biến thiên.',
            'Bước 4: Kết luận khoảng đồng biến (nơi $f\' > 0$) và nghịch biến (nơi $f\' < 0$).'
          ]
        }
      ],
      commonMistakes: [
        'Dùng ký hiệu hợp $\\cup$ khi kết luận khoảng đồng biến (phải dùng từ "và" hoặc dấu chấm phẩy ";").',
        'Quên xét điều kiện tập xác định trước khi tính đạo hàm.'
      ]
    }
  },
  {
    id: 'lesson_2',
    grade: 12,
    number: 2,
    title: 'Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_2',
    coreKnowledge: {
      summary: 'Quy tắc tìm GTLN/GTNN trên đoạn $[a; b]$: Tính đạo hàm $f\'(x)$, tìm nghiệm $x_i \\in [a; b]$, tính giá trị $f(a), f(b), f(x_i)$ và chọn số lớn nhất (GTLN), nhỏ nhất (GTNN).',
      keyFormulas: [
        { name: 'GTLN trên đoạn [a; b]', latex: '\\max_{[a; b]} f(x) = \\max\\{f(a), f(b), f(x_1), \\dots\\}', note: 'x_i là nghiệm f\'(x) = 0 thuộc [a; b]' }
      ]
    }
  },
  {
    id: 'lesson_3',
    grade: 12,
    number: 3,
    title: 'Đường tiệm cận của đồ thị hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_3',
    coreKnowledge: {
      summary: 'Tiệm cận đứng (TCĐ): $x = x_0$ khi $\\lim_{x \\to x_0^\\pm} y = \\pm\\infty$. Tiệm cận ngang (TCN): $y = y_0$ khi $\\lim_{x \\to \\pm\\infty} y = y_0$. Tiệm cận xiên (TCX): $y = ax + b$ khi $\\lim_{x \\to \\pm\\infty} [y - (ax+b)] = 0$.',
      keyFormulas: [
        { name: 'TCĐ phân thức bậc 1 / bậc 1', latex: 'y = \\frac{ax+b}{cx+d} \\Rightarrow \\text{TCĐ: } x = -\\frac{d}{c}, \\text{ TCN: } y = \\frac{a}{c}', note: 'Đường tiệm cận hàm nhất biến' },
        { name: 'TCX phân thức bậc 2 / bậc 1', latex: 'y = \\frac{ax^2+bx+c}{px+q} = (Ax+B) + \\frac{R}{px+q} \\Rightarrow \\text{TCX: } y = Ax + B', note: 'Chia đa thức lấy phần thương' }
      ]
    }
  },
  {
    id: 'lesson_4',
    grade: 12,
    number: 4,
    title: 'Khảo sát sự biến thiên và vẽ đồ thị của hàm số',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_4',
    coreKnowledge: {
      summary: 'Sơ đồ khảo sát hoàn chỉnh: TXĐ, đạo hàm, chiều biến thiên, cực trị, tiệm cận, bảng biến thiên và vẽ đồ thị (hàm bậc 3 $y = ax^3+bx^2+cx+d$, hàm nhất biến $y = \\frac{ax+b}{cx+d}$, hàm hữu tỉ bậc 2 / bậc 1 $y = \\frac{ax^2+bx+c}{px+q}$).'
    }
  },
  {
    id: 'lesson_5',
    grade: 12,
    number: 5,
    title: 'Ứng dụng đạo hàm giải quyết bài toán thực tiễn',
    chapterNumber: 1,
    chapterTitle: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ',
    semester: 1,
    examId: 'exam_lesson_5',
    coreKnowledge: {
      summary: 'Xây dựng hàm mục tiêu $f(x)$ cho các bài toán tối ưu hóa trong kinh tế (lợi nhuận tối đa, chi phí tối thiểu), hình học (thể tích hộp lớn nhất, tiết kiệm vật liệu) và vật lí.'
    }
  },

  // CHƯƠNG II: VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN
  {
    id: 'lesson_6',
    grade: 12,
    number: 6,
    title: 'Vectơ trong không gian',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_6',
    coreKnowledge: {
      summary: 'Khái niệm vectơ không gian, quy tắc hình hộp $\\vec{AC\'} = \\vec{AB} + \\vec{AD} + \\vec{AA\'}$, điều kiện đồng phẳng của 3 vectơ và tích vô hướng trong không gian.',
      keyFormulas: [
        { name: 'Quy tắc hình hộp', latex: '\\vec{AC\'} = \\vec{AB} + \\vec{AD} + \\vec{AA\'}', note: 'Đường chéo hình hộp xuất phát từ A' }
      ]
    }
  },
  {
    id: 'lesson_7',
    grade: 12,
    number: 7,
    title: 'Hệ trục tọa độ trong không gian Oxyz',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_7',
    coreKnowledge: {
      summary: 'Hệ trục tọa độ $Oxyz$ gồm 3 trục vuông góc từng đôi một với các vectơ đơn vị $\\vec{i}, \\vec{j}, \\vec{k}$. Tọa độ điểm $M(x; y; z) \\Leftrightarrow \\vec{OM} = x\\vec{i} + y\\vec{j} + z\\vec{k}$.',
      keyFormulas: [
        { name: 'Khoảng cách giữa 2 điểm Oxyz', latex: 'AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}', note: 'Độ dài đoạn thẳng trong không gian' }
      ]
    }
  },
  {
    id: 'lesson_8',
    grade: 12,
    number: 8,
    title: 'Biểu thức tọa độ của các phép toán vectơ',
    chapterNumber: 2,
    chapterTitle: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 1,
    examId: 'exam_lesson_8',
    coreKnowledge: {
      summary: 'Các phép toán: $\\vec{u} \\pm \\vec{v} = (x_1 \\pm x_2; y_1 \\pm y_2; z_1 \\pm z_2)$, $k\\vec{u} = (kx_1; ky_1; kz_1)$, tích vô hướng $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2$, độ dài $|\\vec{u}| = \\sqrt{x^2+y^2+z^2}$.',
      keyFormulas: [
        { name: 'Cosin góc giữa 2 vectơ', latex: '\\cos(\\vec{u}, \\vec{v}) = \\frac{x_1 x_2 + y_1 y_2 + z_1 z_2}{\\sqrt{x_1^2+y_1^2+z_1^2} \\cdot \\sqrt{x_2^2+y_2^2+z_2^2}}', note: 'Tích vô hướng chia tích độ dài' }
      ]
    }
  },

  // CHƯƠNG III: CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM
  {
    id: 'lesson_9',
    grade: 12,
    number: 9,
    title: 'Khoảng biến thiên và khoảng tứ phân vị',
    chapterNumber: 3,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    examId: 'exam_lesson_9',
    coreKnowledge: {
      summary: 'Khoảng biến thiên $R = a_{k+1} - a_1$. Khoảng tứ phân vị $\\Delta_Q = Q_3 - Q_1$ đánh giá mức độ phân tán của 50% số liệu ở trung tâm.',
      keyFormulas: [
        { name: 'Khoảng tứ phân vị ghép nhóm', latex: '\\Delta_Q = Q_3 - Q_1', note: 'Loại bỏ ảnh hưởng của giá trị ngoại lai' }
      ]
    }
  },
  {
    id: 'lesson_10',
    grade: 12,
    number: 10,
    title: 'Phương sai và độ lệch chuẩn',
    chapterNumber: 3,
    chapterTitle: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM',
    semester: 1,
    examId: 'exam_lesson_10',
    coreKnowledge: {
      summary: 'Phương sai $s^2 = \\frac{1}{n} \\sum_{i=1}^k m_i (c_i - \\bar{x})^2$ (với $c_i$ là giá trị đại diện của nhóm $i$, $m_i$ là tần số). Độ lệch chuẩn $s = \\sqrt{s^2}$.',
      keyFormulas: [
        { name: 'Phương sai mẫu ghép nhóm', latex: 's^2 = \\frac{1}{n} \\sum_{i=1}^k m_i c_i^2 - (\\bar{x})^2', note: 'Công thức tính nhanh phương sai' }
      ]
    }
  },

  // CHƯƠNG IV: NGUYÊN HÀM VÀ TÍCH PHÂN
  {
    id: 'lesson_11',
    grade: 12,
    number: 11,
    title: 'Nguyên hàm',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_11',
    coreKnowledge: {
      summary: 'Bảng nguyên hàm cơ bản và các phương pháp tìm nguyên hàm: Phương pháp đổi biến số ($u = u(x) \\Rightarrow \\mathrm{d}u = u\'(x)\\mathrm{d}x$) và phương pháp từng phần ($\\int u \\mathrm{d}v = uv - \\int v \\mathrm{d}u$).',
      keyFormulas: [
        { name: 'Bảng nguyên hàm hàm lũy thừa', latex: '\\int x^\\alpha \\mathrm{d}x = \\frac{x^{\\alpha+1}}{\\alpha+1} + C \\quad (\\alpha \\neq -1)', note: 'Nguyên hàm 1/x là ln|x| + C' },
        { name: 'Nguyên hàm hàm mũ', latex: '\\int e^x \\mathrm{d}x = e^x + C, \\quad \\int a^x \\mathrm{d}x = \\frac{a^x}{\\ln a} + C', note: 'Cơ số a > 0, a ≠ 1' },
        { name: 'Công thức nguyên hàm từng phần', latex: '\\int u \\mathrm{d}v = u \\cdot v - \\int v \\mathrm{d}u', note: 'Nhất lô, nhì đa, tam lượng, tứ mũ' }
      ]
    }
  },
  {
    id: 'lesson_12',
    grade: 12,
    number: 12,
    title: 'Tích phân',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_12',
    coreKnowledge: {
      summary: 'Định nghĩa tích phân theo công thức Newton-Leibniz: $\\int_a^b f(x) \\mathrm{d}x = F(b) - F(a)$. Tính chất tuyến tính, chèn cận và các phương pháp đổi biến số (nhớ đổi cận), từng phần.',
      keyFormulas: [
        { name: 'Công thức Newton-Leibniz', latex: '\\int_a^b f(x) \\mathrm{d}x = F(x)\\Big|_a^b = F(b) - F(a)', note: 'F(x) là một nguyên hàm của f(x)' },
        { name: 'Tích phân từng phần', latex: '\\int_a^b u \\mathrm{d}v = (uv)\\Big|_a^b - \\int_a^b v \\mathrm{d}u', note: 'Đổi cận cho cả tích uv' }
      ]
    }
  },
  {
    id: 'lesson_13',
    grade: 12,
    number: 13,
    title: 'Ứng dụng hình học của tích phân',
    chapterNumber: 4,
    chapterTitle: 'NGUYÊN HÀM VÀ TÍCH PHÂN',
    semester: 2,
    examId: 'exam_lesson_13',
    coreKnowledge: {
      summary: 'Tính diện tích hình phẳng giới hạn bởi các đường cong và thể tích khối tròn xoay khi quay quanh trục $Ox$.',
      keyFormulas: [
        { name: 'Diện tích hình phẳng 2 đường', latex: 'S = \\int_a^b |f(x) - g(x)| \\mathrm{d}x', note: 'Có trị tuyệt đối' },
        { name: 'Thể tích khối tròn xoay quanh Ox', latex: 'V = \\pi \\int_a^b [f(x)]^2 \\mathrm{d}x', note: 'Nhớ có nhân hệ số π' }
      ]
    }
  },

  // CHƯƠNG V: PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN
  {
    id: 'lesson_14',
    grade: 12,
    number: 14,
    title: 'Phương trình mặt phẳng',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_14',
    coreKnowledge: {
      summary: 'Mặt phẳng đi qua $M(x_0; y_0; z_0)$ có VTPT $\\vec{n}=(A; B; C)$ có PTTQ: $A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$. Khoảng cách từ điểm $M_0$ đến mặt phẳng $(P)$.',
      keyFormulas: [
        { name: 'PT tổng quát mặt phẳng', latex: 'Ax + By + Cz + D = 0 \\quad (A^2+B^2+C^2 \\neq 0)', note: 'VTPT n = (A; B; C)' },
        { name: 'Khoảng cách từ điểm đến mặt phẳng', latex: 'd(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}', note: 'Trị tuyệt đối chia căn A² + B² + C²' },
        { name: 'Phương trình mặt phẳng theo đoạn chắn', latex: '\\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1', note: 'Cắt 3 trục tại A(a;0;0), B(0;b;0), C(0;0;c)' }
      ]
    }
  },
  {
    id: 'lesson_15',
    grade: 12,
    number: 15,
    title: 'Phương trình đường thẳng trong không gian',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_15',
    coreKnowledge: {
      summary: 'Đường thẳng đi qua $M(x_0; y_0; z_0)$ có VTCP $\\vec{u}=(a; b; c)$ có PT tham số: $x = x_0 + at, y = y_0 + bt, z = z_0 + ct$ hoặc PT chính tắc: $\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}$.',
      keyFormulas: [
        { name: 'PT tham số đường thẳng', latex: '\\begin{cases} x = x_0 + at \\\\ y = y_0 + bt \\\\ z = z_0 + ct \\end{cases} \\quad (t \\in \\mathbb{R})', note: 'VTCP u = (a; b; c)' },
        { name: 'PT chính tắc đường thẳng', latex: '\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c} \\quad (abc \\neq 0)', note: 'Dạng tỉ số' }
      ]
    }
  },
  {
    id: 'lesson_16',
    grade: 12,
    number: 16,
    title: 'Công thức tính góc trong không gian',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_16',
    coreKnowledge: {
      summary: 'Công thức cosin góc giữa 2 đường thẳng, cosin góc giữa 2 mặt phẳng và sin góc giữa đường thẳng và mặt phẳng.',
      keyFormulas: [
        { name: 'Góc giữa 2 mặt phẳng', latex: '\\cos((P), (Q)) = \\frac{|A_1 A_2 + B_1 B_2 + C_1 C_2|}{\\sqrt{A_1^2+B_1^2+C_1^2} \\cdot \\sqrt{A_2^2+B_2^2+C_2^2}}', note: 'Cosin góc giữa 2 VTPT' },
        { name: 'Góc giữa đường thẳng và mặt phẳng', latex: '\\sin(d, (P)) = \\frac{|aA + bB + cC|}{\\sqrt{a^2+b^2+c^2} \\cdot \\sqrt{A^2+B^2+C^2}}', note: 'Lưu ý dùng hàm Sin' }
      ]
    }
  },
  {
    id: 'lesson_17',
    grade: 12,
    number: 17,
    title: 'Phương trình mặt cầu',
    chapterNumber: 5,
    chapterTitle: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN',
    semester: 2,
    examId: 'exam_lesson_17',
    coreKnowledge: {
      summary: 'Mặt cầu tâm $I(a; b; c)$ bán kính $R$ có PT: $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ hoặc dạng khai triển $x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0$ với điều kiện $a^2 + b^2 + c^2 - d > 0$ ($R = \\sqrt{a^2 + b^2 + c^2 - d}$).',
      keyFormulas: [
        { name: 'PT chính tắc mặt cầu', latex: '(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2', note: 'Tâm I(a; b; c), bán kính R' },
        { name: 'Vị trí tương đối mặt phẳng và mặt cầu', latex: 'd(I, (P)) < R \\text{ (Cắt theo đường tròn r = } \\sqrt{R^2 - d^2}\\text{)}', note: 'd = R là tiếp xúc' }
      ]
    }
  },

  // CHƯƠNG VI: XÁC SUẤT CÓ ĐIỀU KIỆN
  {
    id: 'lesson_18',
    grade: 12,
    number: 18,
    title: 'Xác suất có điều kiện',
    chapterNumber: 6,
    chapterTitle: 'XÁC SUẤT CÓ ĐIỀU KIỆN',
    semester: 2,
    examId: 'exam_lesson_18',
    coreKnowledge: {
      summary: 'Xác suất của biến cố $A$ với điều kiện biến cố $B$ đã xảy ra: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ ($P(B) > 0$). Quy tắc nhân xác suất tổng quát: $P(A \\cap B) = P(B) \\cdot P(A|B) = P(A) \\cdot P(B|A)$.',
      keyFormulas: [
        { name: 'Xác suất có điều kiện', latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad (P(B) > 0)', note: 'Xác suất A biết B đã xảy ra' },
        { name: 'Quy tắc nhân tổng quát', latex: 'P(A \\cap B) = P(B) \\cdot P(A|B)', note: 'Dùng cho sơ đồ hình cây' }
      ]
    }
  },
  {
    id: 'lesson_19',
    grade: 12,
    number: 19,
    title: 'Công thức xác suất toàn phần và công thức Bayes',
    chapterNumber: 6,
    chapterTitle: 'XÁC SUẤT CÓ ĐIỀU KIỆN',
    semester: 2,
    examId: 'exam_lesson_19',
    coreKnowledge: {
      summary: 'Công thức xác suất toàn phần: $P(A) = P(B)P(A|B) + P(\\overline{B})P(A|\\overline{B})$. Công thức Bayes tính xác suất hậu nghiệm: $P(B|A) = \\frac{P(B)P(A|B)}{P(A)}$.',
      keyFormulas: [
        { name: 'Công thức xác suất toàn phần', latex: 'P(A) = \\sum_{i=1}^n P(B_i) \\cdot P(A|B_i)', note: '{B₁, B₂, ..., Bₙ} là nhóm biến cố đầy đủ' },
        { name: 'Công thức Bayes', latex: 'P(B_k|A) = \\frac{P(B_k) \\cdot P(A|B_k)}{\\sum_{i=1}^n P(B_i) \\cdot P(A|B_i)}', note: 'Xác định nguyên nhân sau khi có kết quả A' }
      ]
    }
  }
];

// ==========================================
// 4. DANH MỤC CHƯƠNG THEO 3 KHỐI LỚP
// ==========================================
export const ALL_CHAPTERS_DATA: Chapter[] = [
  // KHỐI 10
  { grade: 10, number: 1, title: 'MỆNH ĐỀ VÀ TẬP HỢP', semester: 1, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 1) },
  { grade: 10, number: 2, title: 'BẤT PHƯƠNG TRÌNH VÀ HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN', semester: 1, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 2) },
  { grade: 10, number: 3, title: 'HỆ THỨC LƯỢNG TRONG TAM GIÁC', semester: 1, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 3) },
  { grade: 10, number: 4, title: 'VECTƠ', semester: 1, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 4) },
  { grade: 10, number: 5, title: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU KHÔNG GHÉP NHÓM', semester: 1, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 5) },
  { grade: 10, number: 6, title: 'HÀM SỐ, ĐỒ THỊ VÀ ỨNG DỤNG', semester: 2, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 6) },
  { grade: 10, number: 7, title: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG MẶT PHẲNG', semester: 2, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 7) },
  { grade: 10, number: 8, title: 'ĐẠI SỐ TỔ HỢP', semester: 2, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 8) },
  { grade: 10, number: 9, title: 'TÍNH XÁC SUẤT THEO ĐỊNH NGHĨA CỔ ĐIỂN', semester: 2, lessons: GRADE_10_LESSONS.filter(l => l.chapterNumber === 9) },

  // KHỐI 11
  { grade: 11, number: 1, title: 'HÀM SỐ LƯỢNG GIÁC VÀ PHƯƠNG TRÌNH LƯỢNG GIÁC', semester: 1, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 1) },
  { grade: 11, number: 2, title: 'DÃY SỐ. CẤP SỐ CỘNG VÀ CẤP SỐ NHÂN', semester: 1, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 2) },
  { grade: 11, number: 3, title: 'GIỚI HẠN. HÀM SỐ LIÊN TỤC', semester: 1, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 3) },
  { grade: 11, number: 4, title: 'ĐƯỜNG THẲNG VÀ MẶT PHẲNG TRONG KHÔNG GIAN. QUAN HỆ SONG SONG', semester: 1, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 4) },
  { grade: 11, number: 5, title: 'CÁC SỐ ĐẶC TRƯNG ĐO XU THẾ TRUNG TÂM CHO MẪU SỐ LIỆU GHÉP NHÓM', semester: 1, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 5) },
  { grade: 11, number: 6, title: 'HÀM SỐ MŨ VÀ HÀM SỐ LÔGARIT', semester: 2, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 6) },
  { grade: 11, number: 7, title: 'ĐẠO HÀM', semester: 2, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 7) },
  { grade: 11, number: 8, title: 'QUAN HỆ VUÔNG GÓC TRONG KHÔNG GIAN', semester: 2, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 8) },
  { grade: 11, number: 9, title: 'XÁC SUẤT', semester: 2, lessons: GRADE_11_LESSONS.filter(l => l.chapterNumber === 9) },

  // KHỐI 12
  { grade: 12, number: 1, title: 'ỨNG DỤNG ĐẠO HÀM ĐỂ KHẢO SÁT VÀ VẼ ĐỒ THỊ HÀM SỐ', semester: 1, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 1) },
  { grade: 12, number: 2, title: 'VECTƠ VÀ HỆ TRỤC TỌA ĐỘ TRONG KHÔNG GIAN', semester: 1, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 2) },
  { grade: 12, number: 3, title: 'CÁC SỐ ĐẶC TRƯNG ĐO MỨC ĐỘ PHÂN TÁN CỦA MẪU SỐ LIỆU GHÉP NHÓM', semester: 1, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 3) },
  { grade: 12, number: 4, title: 'NGUYÊN HÀM VÀ TÍCH PHÂN', semester: 2, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 4) },
  { grade: 12, number: 5, title: 'PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN', semester: 2, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 5) },
  { grade: 12, number: 6, title: 'XÁC SUẤT CÓ ĐIỀU KIỆN', semester: 2, lessons: GRADE_12_LESSONS.filter(l => l.chapterNumber === 6) }
];

export const ALL_LESSONS_DATA: Lesson[] = [
  ...GRADE_10_LESSONS,
  ...GRADE_11_LESSONS,
  ...GRADE_12_LESSONS
];
