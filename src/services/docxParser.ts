import JSZip from 'jszip';
import { Question, QuestionType, DifficultyLevel, QuestionOption, TrueFalseItem, ContentBlock } from '../types';
import { decodeMtefToLatex } from './mtefDecoder';
import { convertWmfToSvgDataUrl } from './wmfDecoder';

export interface DocxValidationIssue {
  questionIndex: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface DocxParseStats {
  part1Count: number;
  part2Count: number;
  part3Count: number;
  part4Count: number;
  ommlCount: number;
  mathTypeCount: number;
  imageCount: number;
  failedConversionsCount: number;
}

export interface DocxParseResult {
  title: string;
  questions: Question[];
  rawText: string;
  warnings: string[];
  hasUnconfidentFormulas: boolean;
  stats: DocxParseStats;
  validationIssues: DocxValidationIssue[];
}

export type DocxParsedExam = DocxParseResult;

/**
 * Converts Microsoft Word OMML (Office Math Markup Language) XML Node to LaTeX string
 */
export function convertOmmlToLatex(ommlNode: Element): { latex: string; confident: boolean } {
  try {
    let isConfident = true;

    function parseNode(node: Element): string {
      const tagName = node.localName || node.nodeName.replace(/^.*:/, '');

      // Fractions: <m:f> -> \dfrac{num}{den}
      if (tagName === 'f') {
        const numNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('num'));
        const denNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('den'));
        const num = numNode ? Array.from(numNode.children).map(c => parseNode(c as Element)).join('') : '';
        const den = denNode ? Array.from(denNode.children).map(c => parseNode(c as Element)).join('') : '';
        return `\\dfrac{${num || '1'}}{${den || '1'}}`;
      }

      // Radicals (square root / nth root): <m:rad> -> \sqrt[deg]{e}
      if (tagName === 'rad') {
        const degNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('deg'));
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const deg = degNode ? Array.from(degNode.children).map(c => parseNode(c as Element)).join('').trim() : '';
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        return deg ? `\\sqrt[${deg}]{${e}}` : `\\sqrt{${e}}`;
      }

      // Superscript: <m:sSup> -> base^{sup}
      if (tagName === 'sSup') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const supNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sup'));
        const base = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        const sup = supNode ? Array.from(supNode.children).map(c => parseNode(c as Element)).join('') : '';
        return `${base}^{${sup}}`;
      }

      // Subscript: <m:sSub> -> base_{sub}
      if (tagName === 'sSub') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const subNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sub'));
        const base = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        const sub = subNode ? Array.from(subNode.children).map(c => parseNode(c as Element)).join('') : '';
        return `${base}_{${sub}}`;
      }

      // Sub-Superscript: <m:sSubSup> -> base_{sub}^{sup}
      if (tagName === 'sSubSup') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const subNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sub'));
        const supNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sup'));
        const base = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        const sub = subNode ? Array.from(subNode.children).map(c => parseNode(c as Element)).join('') : '';
        const sup = supNode ? Array.from(supNode.children).map(c => parseNode(c as Element)).join('') : '';
        return `${base}_{${sub}}^{${sup}}`;
      }

      // Integrals / Large Operators / n-ary: <m:nary> -> \int_{sub}^{sup} {e}
      if (tagName === 'nary') {
        const chr = node.getAttribute('m:chr') || '\\int';
        const subNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sub'));
        const supNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('sup'));
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const sub = subNode ? Array.from(subNode.children).map(c => parseNode(c as Element)).join('').trim() : '';
        const sup = supNode ? Array.from(supNode.children).map(c => parseNode(c as Element)).join('').trim() : '';
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        
        let op = '\\int';
        if (chr === '∑' || chr === 'sum') op = '\\sum';
        else if (chr === '∏' || chr === 'prod') op = '\\prod';

        if (sub && sup) return `${op}_{${sub}}^{${sup}}{${e}}`;
        if (sub) return `${op}_{${sub}}{${e}}`;
        return `${op}{${e}}`;
      }

      // Limits: <m:limLow> -> \lim_{lim} {e}
      if (tagName === 'limLow') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const limNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('lim'));
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        const lim = limNode ? Array.from(limNode.children).map(c => parseNode(c as Element)).join('') : '';
        return `\\lim_{${lim}}{${e}}`;
      }

      // Delimiters (Parentheses, Brackets, Cases): <m:d>
      if (tagName === 'd') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const content = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        const begChr = node.getAttribute('m:begChr') || '(';
        const endChr = node.getAttribute('m:endChr') || ')';

        if (begChr === '{' && (!endChr || endChr === '')) {
          return `\\begin{cases} ${content} \\end{cases}`;
        }
        return `\\left${begChr} ${content} \\right${endChr}`;
      }

      // Accent / Vector: <m:acc> -> \vec{e} or \bar{e}
      if (tagName === 'acc') {
        const chr = node.getAttribute('m:chr') || '→';
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        if (chr === '→' || chr === '⃗') return `\\vec{${e}}`;
        if (chr === '¯' || chr === '—') return `\\overline{${e}}`;
        if (chr === '^' || chr === '̂') return `\\widehat{${e}}`;
        return `\\vec{${e}}`;
      }

      // Matrix: <m:m>
      if (tagName === 'm') {
        const rows = Array.from(node.children).filter(c => (c.localName || c.nodeName).endsWith('mr'));
        const rowLatex = rows.map(r => {
          const cells = Array.from(r.children).filter(c => (c.localName || c.nodeName).endsWith('e'));
          return cells.map(c => Array.from(c.children).map(ch => parseNode(ch as Element)).join('')).join(' & ');
        }).join(' \\\\ ');
        return `\\begin{matrix} ${rowLatex} \\end{matrix}`;
      }

      // Functions: <m:func> -> \fname{e} (sin, cos, tan, cot, ln, log, etc.)
      if (tagName === 'func') {
        const fNameNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('fName'));
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const fName = fNameNode ? Array.from(fNameNode.children).map(c => parseNode(c as Element)).join('').trim() : '';
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        
        const lowerFName = fName.toLowerCase();
        if (['sin', 'cos', 'tan', 'cot', 'ln', 'log', 'exp', 'arcsin', 'arccos', 'arctan', 'min', 'max', 'det'].includes(lowerFName)) {
          return `\\${lowerFName}{${e}}`;
        }
        return `${fName}(${e})`;
      }

      // Group character / Overbrace / Underbrace: <m:groupChr>
      if (tagName === 'groupChr') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const chr = node.getAttribute('m:chr') || '';
        const pos = node.getAttribute('m:pos') || 'top';
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        if (chr === '⏟' || pos === 'bot') return `\\underbrace{${e}}`;
        if (chr === '⏞' || pos === 'top') return `\\overbrace{${e}}`;
        return e;
      }

      // Box / BorderBox: <m:box>, <m:borderBox>
      if (tagName === 'box' || tagName === 'borderBox') {
        const eNode = Array.from(node.children).find(c => (c.localName || c.nodeName).endsWith('e'));
        const e = eNode ? Array.from(eNode.children).map(c => parseNode(c as Element)).join('') : '';
        return e;
      }

      // Text node <m:t> or <w:t>
      if (tagName === 't') {
        let txt = node.textContent || '';
        // Replace common math unicode symbols with LaTeX
        txt = txt
          .replace(/ℝ/g, '\\mathbb{R} ')
          .replace(/ℤ/g, '\\mathbb{Z} ')
          .replace(/ℕ/g, '\\mathbb{N} ')
          .replace(/ℚ/g, '\\mathbb{Q} ')
          .replace(/ℂ/g, '\\mathbb{C} ')
          .replace(/∞/g, '\\infty ')
          .replace(/±/g, '\\pm ')
          .replace(/≤/g, '\\le ')
          .replace(/≥/g, '\\ge ')
          .replace(/≠/g, '\\neq ')
          .replace(/∈/g, '\\in ')
          .replace(/∉/g, '\\notin ')
          .replace(/⊂/g, '\\subset ')
          .replace(/⊃/g, '\\supset ')
          .replace(/∪/g, '\\cup ')
          .replace(/∩/g, '\\cap ')
          .replace(/∅/g, '\\emptyset ')
          .replace(/Δ|∆/g, '\\Delta ')
          .replace(/π/g, '\\pi ')
          .replace(/α/g, '\\alpha ')
          .replace(/β/g, '\\beta ')
          .replace(/γ/g, '\\gamma ')
          .replace(/θ/g, '\\theta ')
          .replace(/λ/g, '\\lambda ')
          .replace(/ω/g, '\\omega ')
          .replace(/φ/g, '\\varphi ')
          .replace(/→/g, '\\to ')
          .replace(/⇒/g, '\\Rightarrow ')
          .replace(/⇔/g, '\\Leftrightarrow ')
          .replace(/·/g, '\\cdot ')
          .replace(/×/g, '\\times ')
          .replace(/÷/g, '\\div ')
          .replace(/≈/g, '\\approx ')
          .replace(/≡/g, '\\equiv ')
          .replace(/∠/g, '\\angle ')
          .replace(/°/g, '^\\circ ')
          .replace(/′/g, '\'')
          .replace(/″/g, '\'\'')
          .replace(/…|⋯/g, '\\dots ');
        return txt;
      }

      // Recursively parse children
      if (node.children && node.children.length > 0) {
        return Array.from(node.children).map(c => parseNode(c as Element)).join('');
      }

      return node.textContent || '';
    }

    const latex = parseNode(ommlNode).trim();
    return { latex, confident: isConfident && latex.length > 0 };
  } catch (err) {
    console.warn('OMML convert warning:', err);
    return { latex: ommlNode.textContent || '', confident: false };
  }
}

function findChildrenByTag(el: Element, tagName: string): Element[] {
  const result: Element[] = [];
  const target = tagName.toLowerCase();
  
  function scan(node: Element) {
    const loc = (node.localName || node.nodeName.replace(/^.*:/, '')).toLowerCase();
    if (loc === target) {
      result.push(node);
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const ch = node.childNodes[i] as Element;
      if (ch && ch.nodeType === 1) {
        scan(ch);
      }
    }
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    const ch = el.childNodes[i] as Element;
    if (ch && ch.nodeType === 1) {
      scan(ch);
    }
  }
  return result;
}

function getAttr(el: Element, attrName: string): string | null {
  const target = attrName.toLowerCase();
  const direct = el.getAttribute(attrName);
  if (direct) return direct;
  
  if (el.attributes) {
    for (let i = 0; i < el.attributes.length; i++) {
      const a = el.attributes[i];
      const loc = (a.localName || a.name.replace(/^.*:/, '')).toLowerCase();
      if (loc === target || a.name.toLowerCase() === target || a.name.toLowerCase().endsWith(':' + target)) {
        return a.value;
      }
    }
  }
  return null;
}

/**
 * Parses a Word .docx file ArrayBuffer or File into structured Questions with rich content blocks
 */
export async function parseDocxFile(fileData: File | ArrayBuffer): Promise<DocxParseResult> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(fileData);
  } catch (err) {
    throw new Error('Không thể đọc file Word (.docx). File có thể bị hỏng hoặc sai định dạng.');
  }

  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Cấu trúc file Word không hợp lệ (thiếu word/document.xml).');
  }

  const docXmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');

  const warnings: string[] = [];
  const validationIssues: DocxValidationIssue[] = [];
  let hasUnconfidentFormulas = false;

  let ommlCount = 0;
  let mathTypeCount = 0;
  let imageCount = 0;
  let failedConversionsCount = 0;

  // Extract embedded media images map (rId -> dataUrl) and OLE MathType map (rId -> LaTeX)
  const imageMap: { [relId: string]: string } = {};
  const oleMap: { [relId: string]: string } = {};

  try {
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (relsFile) {
      const relsXml = await relsFile.async('text');
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const relationships = findChildrenByTag(relsDoc.documentElement, 'Relationship');

      for (let i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        const id = getAttr(rel, 'Id');
        const target = getAttr(rel, 'Target');
        const type = getAttr(rel, 'Type') || '';

        if (id && target) {
          const cleanTarget = target.startsWith('/') ? target.substring(1) : `word/${target}`;
          if (type.includes('/image') || target.match(/\.(png|jpg|jpeg|gif|svg|webp|wmf|emf)$/i)) {
            const imageFile = zip.file(cleanTarget) || zip.file(target);
            if (imageFile) {
              const ext = target.split('.').pop()?.toLowerCase() || 'png';
              if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                const base64 = await imageFile.async('base64');
                imageMap[id] = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                imageCount++;
              } else if (['wmf', 'emf'].includes(ext)) {
                try {
                  const wmfBuf = await imageFile.async('arraybuffer');
                  const mtefLatex = decodeMtefToLatex(wmfBuf);
                  if (mtefLatex && mtefLatex.trim()) {
                    oleMap[id] = mtefLatex;
                    mathTypeCount++;
                  }
                  const svgData = convertWmfToSvgDataUrl(wmfBuf);
                  if (svgData) {
                    imageMap[id] = svgData;
                    imageCount++;
                  }
                } catch (e) {
                  console.warn('WMF/EMF convert warning:', e);
                }
              }
            }
          } else if (type.includes('oleObject') || target.endsWith('.bin') || target.includes('embeddings')) {
            const binFile = zip.file(cleanTarget) || zip.file(target) || zip.file(`word/embeddings/${target.split('/').pop()}`);
            if (binFile) {
              try {
                const binBuffer = await binFile.async('arraybuffer');
                const latex = decodeMtefToLatex(binBuffer);
                if (latex) {
                  oleMap[id] = latex;
                  mathTypeCount++;
                } else {
                  failedConversionsCount++;
                }
              } catch (err) {
                console.warn('MTEF decode error for rel:', id, err);
                failedConversionsCount++;
              }
            }
          }
        }
      }
    }

    // Also index all files in word/embeddings folder directly
    const embeddingsFolder = zip.folder('word/embeddings');
    if (embeddingsFolder) {
      const files = embeddingsFolder.file(/.*/);
      let oleIndex = 1;
      for (const f of files) {
        try {
          const buf = await f.async('arraybuffer');
          const latex = decodeMtefToLatex(buf);
          if (latex) {
            const fname = f.name.split('/').pop() || '';
            oleMap[fname] = latex;
            oleMap[`ole_${oleIndex}`] = latex;
            oleIndex++;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Could not extract relationships / OLE objects from docx:', e);
  }

  const body = findChildrenByTag(xmlDoc.documentElement, 'body')[0] || xmlDoc.documentElement;

  interface ProcessedItem {
    text: string;
    blocks: ContentBlock[];
    isBold?: boolean;
    isUnderlined?: boolean;
    hasLowConfidenceMath?: boolean;
  }

  function processRunOrElement(el: Element): ProcessedItem {
    let pText = '';
    const pBlocks: ContentBlock[] = [];
    let pLowConfidence = false;
    let isBold = false;
    let isUnderlined = false;

    const tag = (el.localName || el.nodeName.replace(/^.*:/, '')).toLowerCase();

    // 1. OMML Math (<m:oMath>, <m:oMathPara>)
    if (tag === 'omath' || tag === 'omathpara') {
      ommlCount++;
      const { latex, confident } = convertOmmlToLatex(el);
      if (!confident) {
        pLowConfidence = true;
        hasUnconfidentFormulas = true;
      }
      pText += ` $${latex}$ `;
      pBlocks.push({ type: 'math', latex });
      return { text: pText, blocks: pBlocks, hasLowConfidenceMath: pLowConfidence };
    }

    // 2. MathType OLE Object (<w:object>)
    if (tag === 'object') {
      const oleNodes = findChildrenByTag(el, 'OLEObject');
      let foundMath = false;

      for (let o = 0; o < oleNodes.length; o++) {
        const rId = getAttr(oleNodes[o], 'id') || '';
        const shapeId = getAttr(oleNodes[o], 'ShapeID') || '';
        
        let latex = oleMap[rId];
        if (!latex && rId) {
          const matchingKey = Object.keys(oleMap).find(k => k.includes(rId) || rId.includes(k));
          if (matchingKey) latex = oleMap[matchingKey];
        }
        if (!latex && shapeId) {
          const matchingKey = Object.keys(oleMap).find(k => k.includes(shapeId) || shapeId.includes(k));
          if (matchingKey) latex = oleMap[matchingKey];
        }

        if (latex) {
          pText += ` $${latex}$ `;
          pBlocks.push({ type: 'math', latex });
          foundMath = true;
        }
      }

      if (!foundMath) {
        // Check if v:imagedata has MathType WMF in oleMap
        const vImgs = findChildrenByTag(el, 'imagedata');
        for (let v = 0; v < vImgs.length; v++) {
          const imgId = getAttr(vImgs[v], 'id') || getAttr(vImgs[v], 'href');
          if (imgId && oleMap[imgId]) {
            const latex = oleMap[imgId];
            pText += ` $${latex}$ `;
            pBlocks.push({ type: 'math', latex });
            foundMath = true;
            break;
          }
        }
      }

      return { text: pText, blocks: pBlocks, hasLowConfidenceMath: pLowConfidence };
    }

    // 3. VML Picture (<w:pict>)
    if (tag === 'pict') {
      const vImgs = findChildrenByTag(el, 'imagedata');
      for (let v = 0; v < vImgs.length; v++) {
        const imgId = getAttr(vImgs[v], 'id') || getAttr(vImgs[v], 'href');
        if (imgId) {
          if (oleMap[imgId]) {
            const latex = oleMap[imgId];
            pText += ` $${latex}$ `;
            pBlocks.push({ type: 'math', latex });
          } else if (imageMap[imgId]) {
            const url = imageMap[imgId];
            pBlocks.push({ type: 'image', url });
            pText += ` ![](${url}) `;
          }
        }
      }
      return { text: pText, blocks: pBlocks, hasLowConfidenceMath: pLowConfidence };
    }

    // 4. Drawing (<w:drawing>)
    if (tag === 'drawing') {
      const blipNodes = findChildrenByTag(el, 'blip');
      for (let b = 0; b < blipNodes.length; b++) {
        const embedId = getAttr(blipNodes[b], 'embed') || getAttr(blipNodes[b], 'id');
        if (embedId) {
          if (oleMap[embedId]) {
            const latex = oleMap[embedId];
            pText += ` $${latex}$ `;
            pBlocks.push({ type: 'math', latex });
          } else if (imageMap[embedId]) {
            const url = imageMap[embedId];
            pBlocks.push({ type: 'image', url });
            pText += ` ![](${url}) `;
          }
        }
      }
      return { text: pText, blocks: pBlocks, hasLowConfidenceMath: pLowConfidence };
    }

    // 5. Standard Text Node (<w:t>)
    if (tag === 't') {
      const txt = el.textContent || '';
      pText += txt;
      if (txt) pBlocks.push({ type: 'text', value: txt });
      return { text: pText, blocks: pBlocks, hasLowConfidenceMath: pLowConfidence };
    }

    // 6. Run (<w:r>)
    if (tag === 'r') {
      isUnderlined = findChildrenByTag(el, 'u').length > 0;
      isBold = findChildrenByTag(el, 'b').length > 0;

      let runText = '';
      const runBlocks: ContentBlock[] = [];

      for (let c = 0; c < el.childNodes.length; c++) {
        const child = el.childNodes[c] as Element;
        if (child && child.nodeType === 1) {
          const res = processRunOrElement(child);
          if (res.text) runText += res.text;
          runBlocks.push(...res.blocks);
          if (res.hasLowConfidenceMath) pLowConfidence = true;
        }
      }

      if (isUnderlined && runText.trim()) {
        runText = `<u>${runText}</u>`;
      }
      pText += runText;
      pBlocks.push(...runBlocks);
      return { text: pText, blocks: pBlocks, isBold, isUnderlined, hasLowConfidenceMath: pLowConfidence };
    }

    // 7. Other Container Elements
    for (let c = 0; c < el.childNodes.length; c++) {
      const child = el.childNodes[c] as Element;
      if (child && child.nodeType === 1) {
        const res = processRunOrElement(child);
        if (res.text) pText += res.text;
        pBlocks.push(...res.blocks);
        if (res.hasLowConfidenceMath) pLowConfidence = true;
        if (res.isBold) isBold = true;
        if (res.isUnderlined) isUnderlined = true;
      }
    }

    return { text: pText, blocks: pBlocks, isBold, isUnderlined, hasLowConfidenceMath: pLowConfidence };
  }

  function processParagraph(p: Element): ProcessedItem {
    return processRunOrElement(p);
  }

  function processTable(tbl: Element): ProcessedItem {
    const rows = findChildrenByTag(tbl, 'tr');
    if (rows.length === 0) return { text: '', blocks: [] };

    const tableRows: string[] = [];
    let maxCols = 0;

    for (const r of rows) {
      const cells = findChildrenByTag(r, 'tc');
      maxCols = Math.max(maxCols, cells.length);
      const cellTexts = cells.map(c => {
        const ps = findChildrenByTag(c, 'p');
        const cellContent = ps.map(p => processParagraph(p).text).filter(Boolean).join(' ');
        return cellContent || ' ';
      });
      tableRows.push(cellTexts.join(' & ') + ' \\\\ \\hline');
    }

    const colAlign = '|' + Array(maxCols || 1).fill('c').join('|') + '|';
    const latexTable = `$$\n\\begin{array}{${colAlign}}\n\\hline\n${tableRows.join('\n')}\n\\end{array}\n$$`;
    return {
      text: latexTable,
      blocks: [{ type: 'math', latex: `\\begin{array}{${colAlign}}\n\\hline\n${tableRows.join('\n')}\n\\end{array}` }]
    };
  }

  const extractedLines: ProcessedItem[] = [];

  if (body) {
    for (let i = 0; i < body.childNodes.length; i++) {
      const el = body.childNodes[i] as Element;
      if (!el || el.nodeType !== 1) continue;
      const tag = (el.localName || el.nodeName.replace(/^.*:/, '')).toLowerCase();

      if (tag === 'p') {
        const res = processParagraph(el);
        if (res.text.trim() || res.blocks.length > 0) {
          extractedLines.push(res);
        }
      } else if (tag === 'tbl') {
        const res = processTable(el);
        if (res.text.trim() || res.blocks.length > 0) {
          extractedLines.push(res);
        }
      }
    }
  }

  const fullText = extractedLines.map(l => l.text).join('\n');
  const questions: Question[] = [];

  let currentPart: 1 | 2 | 3 | 4 = 1;
  let qNum = 1;

  let currentQuestionLines: ProcessedItem[] = [];
  let currentNeedsCheck = false;
  let hasStartedFirstQuestion = false;

  const isInstructionOrExamHeader = (text: string): boolean => {
    const t = text.toLowerCase().trim();
    return (
      t.includes('mỗi câu hỏi có bốn phương án') ||
      t.includes('thí sinh chỉ chọn một phương án') ||
      t.includes('thí sinh trả lời từ câu') ||
      t.includes('thí sinh chọn đúng hoặc sai') ||
      t.includes('trong mỗi ý a), b), c), d)') ||
      t.includes('trong mỗi ý a, b, c, d') ||
      t.includes('thí sinh ghi câu trả lời') ||
      t.includes('học sinh tô vào ô') ||
      t.includes('học sinh ghi đáp án') ||
      t.includes('thời gian làm bài') ||
      t.includes('bộ giáo dục và đào tạo') ||
      t.includes('sở giáo dục và đào tạo') ||
      t.includes('trường thpt') ||
      t.includes('đề kiểm tra') ||
      t.includes('đề thi thử') ||
      t.includes('môn: toán') ||
      t.includes('mã đề thi')
    );
  };

  const saveCurrentDraft = () => {
    if (currentQuestionLines.length === 0) return;

    const rawBlock = currentQuestionLines.map(l => l.text).join('\n').trim();
    if (!rawBlock) return;

    if (isInstructionOrExamHeader(rawBlock)) {
      currentQuestionLines = [];
      currentNeedsCheck = false;
      return;
    }

    const allBlocks: ContentBlock[] = [];
    currentQuestionLines.forEach(l => allBlocks.push(...l.blocks));

    const q = processQuestionBlock(
      rawBlock,
      allBlocks,
      currentPart,
      qNum,
      currentNeedsCheck,
      validationIssues
    );

    if (q) {
      const normalizedQ = normalizeImportedQuestion(q);
      questions.push(normalizedQ);
      qNum++;
    }

    currentQuestionLines = [];
    currentNeedsCheck = false;
  };

  for (const lineObj of extractedLines) {
    const line = lineObj.text.trim();
    if (!line && lineObj.blocks.length === 0) continue;

    // Strict Section Header Recognition: PHẦN I, PHẦN II, PHẦN III, PHẦN IV
    const partMatch = line.match(/^\s*PHẦN\s+(IV|III|II|I|\d+)\b/i);
    if (partMatch) {
      saveCurrentDraft();
      const numeral = partMatch[1].toUpperCase();
      if (numeral === 'IV' || numeral === '4') currentPart = 4;
      else if (numeral === 'III' || numeral === '3') currentPart = 3;
      else if (numeral === 'II' || numeral === '2') currentPart = 2;
      else currentPart = 1;
      qNum = 1; // Restart numbering per section as required
      continue;
    }

    // Check for "Câu 1", "Câu 2", "Bài 1", "Question 1", "[Câu 1]", etc.
    const isNewQuestionStart = /^(?:\[|\()? *(?:câu|cau|bài|bai|question) *\d+ *[\.\:\-\]\)]/i.test(line);

    if (isNewQuestionStart) {
      saveCurrentDraft();
      hasStartedFirstQuestion = true;
    } else if (!hasStartedFirstQuestion) {
      // Skip general instructions / cover page
      continue;
    }

    if (isInstructionOrExamHeader(line)) {
      continue;
    }

    currentQuestionLines.push(lineObj);
    if (lineObj.hasLowConfidenceMath) currentNeedsCheck = true;
  }

  saveCurrentDraft();

  if (hasUnconfidentFormulas) {
    warnings.push('Một số công thức toán có ký hiệu đặc biệt cần giáo viên kiểm tra lại trong màn hình xem trước.');
  }
  const stats: DocxParseStats = {
    part1Count: questions.filter(q => q.part === 1).length,
    part2Count: questions.filter(q => q.part === 2).length,
    part3Count: questions.filter(q => q.part === 3).length,
    part4Count: questions.filter(q => q.part === 4).length,
    ommlCount,
    mathTypeCount,
    imageCount,
    failedConversionsCount
  };

  return {
    title: 'Đề nhập từ file Word',
    questions,
    rawText: fullText,
    warnings,
    hasUnconfidentFormulas,
    stats,
    validationIssues
  };
}

/**
 * Extracts sequential content blocks for Part I (Multiple Choice)
 */
function extractSequentialBlocksForPart1(
  rawBlocks: ContentBlock[],
  blockText: string
): {
  stemBlocks: ContentBlock[];
  options: QuestionOption[];
  correctOption: string | null;
} {
  const stemBlocks: ContentBlock[] = [];
  const optionBlocksMap: { [key: string]: ContentBlock[] } = { A: [], B: [], C: [], D: [] };
  let currentKey: string | null = null;
  let detectedCorrect: string | null = null;

  // Detect underlined option from raw text e.g. <u>A</u>. or <u>A.</u>
  const underlinedMatch = blockText.match(/<u>\s*([A-D])[\.\:\s]*<\/u>|<u>\s*([A-D])\s*<\/u>[\.\:\s]/i);
  if (underlinedMatch) {
    detectedCorrect = (underlinedMatch[1] || underlinedMatch[2]).toUpperCase();
  } else {
    const ansMatch = blockText.match(/(?:đáp án|đáp án đúng|chọn|key|đa)[\:\s]*([A-D])\b/i);
    if (ansMatch) detectedCorrect = ansMatch[1].toUpperCase();
  }

  for (const block of rawBlocks) {
    if (block.type === 'text') {
      const val = block.value || '';
      // Search for option markers: A., B., C., D.
      const optRegex = /(?:^|[\s\t\.\,\;])(?:<u>)?([A-D])(?:<\/u>)?[\.\:\)]\s*/g;
      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = optRegex.exec(val)) !== null) {
        const preText = val.substring(lastIdx, match.index);
        if (preText) {
          const cleanPre = preText.replace(/<\/?u>/g, '').trim();
          if (cleanPre) {
            if (currentKey && optionBlocksMap[currentKey]) {
              optionBlocksMap[currentKey].push({ type: 'text', value: cleanPre });
            } else {
              stemBlocks.push({ type: 'text', value: cleanPre });
            }
          }
        }

        currentKey = match[1].toUpperCase();
        lastIdx = optRegex.lastIndex;
      }

      const remaining = val.substring(lastIdx);
      if (remaining) {
        const cleanRem = remaining.replace(/<\/?u>/g, '').trim();
        if (cleanRem) {
          if (currentKey && optionBlocksMap[currentKey]) {
            optionBlocksMap[currentKey].push({ type: 'text', value: cleanRem });
          } else {
            stemBlocks.push({ type: 'text', value: cleanRem });
          }
        }
      }
    } else {
      // Math, math-image, image, etc.
      if (currentKey && optionBlocksMap[currentKey]) {
        optionBlocksMap[currentKey].push(block);
      } else {
        stemBlocks.push(block);
      }
    }
  }

  const options: QuestionOption[] = ['A', 'B', 'C', 'D'].map(letter => {
    const blks = optionBlocksMap[letter] || [];
    let textContent = blks.map(b => {
      if (b.type === 'text') return b.value || '';
      if (b.type === 'math') return `$${b.latex}$`;
      if (b.type === 'math-image') return `![](${b.url})`;
      if (b.type === 'image') return `![](${b.url})`;
      return '';
    }).join(' ').trim();

    return {
      id: letter,
      content: textContent,
      contentBlocks: blks.length > 0 ? blks : [{ type: 'text', value: textContent }]
    };
  });

  return { stemBlocks, options, correctOption: detectedCorrect };
}

/**
 * Extracts sequential content blocks for Part II (True / False)
 */
function extractSequentialBlocksForPart2(
  rawBlocks: ContentBlock[],
  _blockText: string
): {
  stemBlocks: ContentBlock[];
  trueFalseItems: TrueFalseItem[];
} {
  const stemBlocks: ContentBlock[] = [];
  const tfBlocksMap: { [key: string]: ContentBlock[] } = { a: [], b: [], c: [], d: [] };
  let currentKey: string | null = null;

  for (const block of rawBlocks) {
    if (block.type === 'text') {
      const val = block.value || '';
      // Search for sub-item markers: a), b), c), d) or a., b., c., d., (a), (b)
      const tfRegex = /(?:^|[\s\t\.\,\;\n])(?:<u>)?(?:\(([a-d])\)|([a-d])(?:<\/u>)?[\.\:\)]|\(([a-d])\))(?:<\/u>)?\s*/gi;
      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = tfRegex.exec(val)) !== null) {
        const preText = val.substring(lastIdx, match.index);
        if (preText) {
          const cleanPre = preText.replace(/<\/?u>/g, '').trim();
          if (cleanPre) {
            if (currentKey && tfBlocksMap[currentKey]) {
              tfBlocksMap[currentKey].push({ type: 'text', value: cleanPre });
            } else {
              stemBlocks.push({ type: 'text', value: cleanPre });
            }
          }
        }

        const rawLetter = match[1] || match[2] || match[3];
        currentKey = rawLetter ? rawLetter.toLowerCase() : 'a';
        lastIdx = tfRegex.lastIndex;
      }

      const remaining = val.substring(lastIdx);
      if (remaining) {
        const cleanRem = remaining.replace(/<\/?u>/g, '').trim();
        if (cleanRem) {
          if (currentKey && tfBlocksMap[currentKey]) {
            tfBlocksMap[currentKey].push({ type: 'text', value: cleanRem });
          } else {
            stemBlocks.push({ type: 'text', value: cleanRem });
          }
        }
      }
    } else {
      if (currentKey && tfBlocksMap[currentKey]) {
        tfBlocksMap[currentKey].push(block);
      } else {
        stemBlocks.push(block);
      }
    }
  }

  const trueFalseItems: TrueFalseItem[] = ['a', 'b', 'c', 'd'].map(letter => {
    const blks = tfBlocksMap[letter] || [];
    let textContent = blks.map(b => {
      if (b.type === 'text') return b.value || '';
      if (b.type === 'math') return `$${b.latex}$`;
      if (b.type === 'math-image') return `![](${b.url})`;
      if (b.type === 'image') return `![](${b.url})`;
      return '';
    }).join(' ').trim();

    const lower = textContent.toLowerCase();
    const isExplicitFalse = lower.includes('(sai)') || lower.includes('[sai]') || lower.includes('(s)') || lower.includes('[s]') || lower.endsWith(': sai') || lower.endsWith('. sai');
    const isExplicitTrue = lower.includes('(đúng)') || lower.includes('[đúng]') || lower.includes('(dung)') || lower.includes('[dung]') || lower.includes('(đ)') || lower.includes('[đ]') || lower.endsWith(': đúng') || lower.endsWith('. đúng');

    let correctAnswer: boolean | undefined = undefined;
    if (isExplicitFalse) correctAnswer = false;
    else if (isExplicitTrue) correctAnswer = true;

    // Clean [Đúng] / [Sai] tags from text content
    let cleanText = textContent
      .replace(/[\(\[]\s*(đúng|sai|dung|đ|s|d)\s*[\)\]]/gi, '')
      .replace(/[\:\.]\s*(đúng|sai|dung)\s*$/gi, '')
      .trim();

    return {
      id: letter,
      content: cleanText,
      correctAnswer,
      contentBlocks: blks.length > 0 ? blks : [{ type: 'text', value: cleanText }]
    };
  });

  return { stemBlocks, trueFalseItems };
}

/**
 * Extracts sequential content blocks for Part III (Short Answer)
 */
function extractSequentialBlocksForPart3(
  rawBlocks: ContentBlock[],
  blockText: string
): {
  stemBlocks: ContentBlock[];
  shortAnswerConfig: ShortAnswerConfig;
  solution?: string;
  solutionBlocks?: ContentBlock[];
} {
  // Extract "Đáp án: X" or "Đáp số: X"
  const ansMatch = blockText.match(/(?:đáp án|đáp số|kết quả|ans|da)[\:\s]*([\-0-9\,\.\/\+\s]+)/i);
  let correctAnswers: string[] = [];
  if (ansMatch) {
    const rawVal = ansMatch[1].trim().replace(/\s+/g, '');
    const altDot = rawVal.replace(/,/g, '.');
    const altComma = rawVal.replace(/\./g, ',');
    correctAnswers = Array.from(new Set([rawVal, altDot, altComma])).filter(Boolean);
  }

  let solution: string | undefined = undefined;
  const solutionBlocks: ContentBlock[] = [];
  const stemBlocks: ContentBlock[] = [];
  let isInSolution = false;

  for (const block of rawBlocks) {
    if (block.type === 'text') {
      const val = block.value || '';
      const solIdx = val.search(/(lời giải|hướng dẫn giải|hd giải|solution)[\:\.]/i);
      if (solIdx !== -1) {
        const pre = val.substring(0, solIdx).trim();
        if (pre) stemBlocks.push({ type: 'text', value: pre });
        const post = val.substring(solIdx).trim();
        if (post) solutionBlocks.push({ type: 'text', value: post });
        isInSolution = true;
        continue;
      }
    }

    if (isInSolution) {
      solutionBlocks.push(block);
    } else {
      stemBlocks.push(block);
    }
  }

  if (solutionBlocks.length > 0) {
    solution = solutionBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : '')).join(' ').trim();
  }

  return {
    stemBlocks,
    shortAnswerConfig: { correctAnswers, tolerance: 0.01 },
    solution,
    solutionBlocks: solutionBlocks.length > 0 ? solutionBlocks : undefined
  };
}

/**
 * Extracts sequential content blocks for Part IV (Essay)
 */
function extractSequentialBlocksForPart4(
  rawBlocks: ContentBlock[],
  _blockText: string
): {
  stemBlocks: ContentBlock[];
  essayGuide?: string;
  solution?: string;
  solutionBlocks?: ContentBlock[];
} {
  const solutionBlocks: ContentBlock[] = [];
  const stemBlocks: ContentBlock[] = [];
  let isInSolution = false;

  for (const block of rawBlocks) {
    if (block.type === 'text') {
      const val = block.value || '';
      const solIdx = val.search(/(lời giải|hướng dẫn giải|hướng dẫn chấm|rubric|solution)[\:\.]/i);
      if (solIdx !== -1) {
        const pre = val.substring(0, solIdx).trim();
        if (pre) stemBlocks.push({ type: 'text', value: pre });
        const post = val.substring(solIdx).trim();
        if (post) solutionBlocks.push({ type: 'text', value: post });
        isInSolution = true;
        continue;
      }
    }

    if (isInSolution) {
      solutionBlocks.push(block);
    } else {
      stemBlocks.push(block);
    }
  }

  let essayGuide: string | undefined = undefined;
  if (solutionBlocks.length > 0) {
    essayGuide = solutionBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : '')).join(' ').trim();
  }

  return {
    stemBlocks,
    essayGuide,
    solution: essayGuide,
    solutionBlocks: solutionBlocks.length > 0 ? solutionBlocks : undefined
  };
}

/**
 * Helper to parse a single question block into a structured Question object with rich ContentBlocks
 */
function processQuestionBlock(
  block: string,
  rawBlocks: ContentBlock[],
  part: 1 | 2 | 3 | 4,
  questionNumber: number,
  needsTeacherCheck: boolean,
  validationIssues: DocxValidationIssue[]
): Question {
  // Strip "Câu X." prefix from the first text block
  const cleanedRawBlocks = rawBlocks.map((b, idx) => {
    if (idx === 0 && b.type === 'text') {
      const firstVal = (b.value || '').replace(/^(?:\[|\()? *(?:câu|cau|bài|bai|question) *\d+ *[\.\:\-\]\)]\s*/i, '').trim();
      return { ...b, value: firstVal };
    }
    return b;
  });

  const firstImage = cleanedRawBlocks.find(b => b.type === 'image')?.url;

  if (part === 1) {
    const res = extractSequentialBlocksForPart1(cleanedRawBlocks, block);
    const stemContent = res.stemBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : (b.url ? `![](${b.url})` : ''))).join(' ').trim();

    if (res.options.length < 4 || res.options.some(o => !o.content)) {
      validationIssues.push({
        questionIndex: questionNumber,
        message: `Phần I - Câu ${questionNumber}: Kiểm tra các phương án A, B, C, D`,
        severity: res.options.length < 2 ? 'error' : 'warning'
      });
    }

    return {
      id: `imported_q_${part}_${questionNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      part: 1,
      questionNumber,
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: DifficultyLevel.THONG_HIEU,
      points: 0.25,
      content: stemContent,
      contentBlocks: res.stemBlocks,
      options: res.options,
      correctOption: res.correctOption,
      imageUrl: firstImage,
      fallbackMode: 'content',
      needsTeacherCheck: needsTeacherCheck || res.correctOption === null
    };
  }

  if (part === 2) {
    const res = extractSequentialBlocksForPart2(cleanedRawBlocks, block);
    const stemContent = res.stemBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : (b.url ? `![](${b.url})` : ''))).join(' ').trim();

    return {
      id: `imported_q_${part}_${questionNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      part: 2,
      questionNumber,
      type: QuestionType.TRUE_FALSE,
      difficulty: DifficultyLevel.THONG_HIEU,
      points: 1.0,
      content: stemContent,
      contentBlocks: res.stemBlocks,
      trueFalseItems: res.trueFalseItems,
      imageUrl: firstImage,
      fallbackMode: 'content',
      needsTeacherCheck: needsTeacherCheck || res.trueFalseItems.some(tf => tf.correctAnswer === undefined)
    };
  }

  if (part === 3) {
    const res = extractSequentialBlocksForPart3(cleanedRawBlocks, block);
    const stemContent = res.stemBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : (b.url ? `![](${b.url})` : ''))).join(' ').trim();

    return {
      id: `imported_q_${part}_${questionNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      part: 3,
      questionNumber,
      type: QuestionType.SHORT_ANSWER,
      difficulty: DifficultyLevel.VAN_DUNG,
      points: 0.5,
      content: stemContent,
      contentBlocks: res.stemBlocks,
      shortAnswerConfig: res.shortAnswerConfig,
      solution: res.solution,
      solutionBlocks: res.solutionBlocks,
      imageUrl: firstImage,
      fallbackMode: 'content',
      needsTeacherCheck: needsTeacherCheck || res.shortAnswerConfig.correctAnswers.length === 0
    };
  }

  // Part 4 (Essay)
  const res = extractSequentialBlocksForPart4(cleanedRawBlocks, block);
  const stemContent = res.stemBlocks.map(b => b.value || (b.latex ? `$${b.latex}$` : (b.url ? `![](${b.url})` : ''))).join(' ').trim();

  return {
    id: `imported_q_${part}_${questionNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    part: 4,
    questionNumber,
    type: QuestionType.ESSAY,
    difficulty: DifficultyLevel.VAN_DUNG_CAO,
    points: 1.0,
    content: stemContent,
    contentBlocks: res.stemBlocks,
    essayGuide: res.essayGuide,
    solution: res.solution,
    solutionBlocks: res.solutionBlocks,
    imageUrl: firstImage,
    fallbackMode: 'content',
    needsTeacherCheck
  };
}

/**
 * Normalizes an imported question:
 * - Cleans spurious placeholders ("Hình minh họa", broken alt texts, etc.)
 * - Cleans duplicate boundary operators (==, ++, --, duplicate \infty)
 * - Fixes function representation duplicate parens (f(x))) -> f(x))
 * - Cleans and balances interval parentheses ((a; b)) -> (a; b)
 * - Preserves valid mathematical constructs (f(g(x)), (x+1)^2, coordinates, intervals [a; b), [a; b])
 * - Merges adjacent text blocks and logs diagnostic info in DEV
 */
export function normalizeImportedQuestion(q: Question): Question {
  // Comprehensive helper to clean mathematical formulas and text
  const cleanMathString = (s: string): string => {
    if (!s) return '';
    let res = s
      // Remove any fake alt text / captions
      .replace(/!\[\s*Hình minh họa\s*\]/gi, '![]')
      .replace(/!\[\s*Công thức MathType\s*\]/gi, '![]')
      .replace(/Hình minh họa/gi, '')
      // Fix duplicate boundary signs
      .replace(/y\s*==\s*/g, 'y = ')
      .replace(/==+/g, '=')
      .replace(/=\s*=/g, '=')
      .replace(/--+/g, '-')
      .replace(/\+\++/g, '+')
      .replace(/(\\infty)+/g, '\\infty')
      .replace(/-\s*\\infty/g, '-\\infty')
      .replace(/\+\s*\\infty/g, '+\\infty')
      // Fix function duplicate parentheses: f(x))) -> f(x)
      .replace(/f'\s*\(+\s*x\s*[\)\s]*/g, "f'(x)")
      .replace(/f\s*\(+\s*x\s*[\)\s]*/g, "f(x)")
      .replace(/f'\s*\(\s*x\s*\)[\)\s]*/g, "f'(x)")
      .replace(/f\s*\(\s*x\s*\)[\)\s]*/g, "f(x)")
      .replace(/f\(\(x/g, "f(x)")
      .replace(/f'\(\(x/g, "f'(x)")
      // Fix double parentheses on intervals: ((a; b)) -> (a; b)
      .replace(/\(\(\s*([^;\$]+;\s*[^;\$]+)\s*\)\)/g, '($1)')
      .replace(/\(\(\s*([^;\$]+;\s*[^;\$]+)\s*\)/g, '($1)')
      .replace(/\(\s*([^;\$]+;\s*[^;\$]+)\s*\)\)/g, '($1)')
      // Clean sets and greek symbols
      .replace(/\\mathbb\{R\}\s*(\\Upsilon|[^\w\s\$\\\,\;\:\.\(\)\[\]\{\}\+\-\*\/\=\<\>\^])+/g, '\\mathbb{R}')
      .replace(/\\mathbb\{R\}\s*\\Upsilon/g, '\\mathbb{R}')
      .replace(/\\Upsilon\b/g, '')
      .replace(/\\mathbb\{R\}\s*\?/g, '\\mathbb{R}')
      .replace(/\s+/g, ' ')
      .trim();

    return res;
  };

  let content = cleanMathString(q.content || '');

  // 2. Clean contentBlocks
  let contentBlocks = (q.contentBlocks || [])
    .filter(b => {
      if (b.type === 'text') return Boolean(b.value && b.value.trim());
      if (b.type === 'math') return Boolean(b.latex && b.latex.trim());
      if (b.type === 'math-image') return Boolean(b.url && b.url.trim());
      if (b.type === 'image') return Boolean(b.url && b.url.trim());
      if (b.type === 'warning') return Boolean(b.warningMessage && b.warningMessage.trim());
      return true;
    })
    .map(b => {
      if (b.type === 'text') {
        return { ...b, value: cleanMathString(b.value || '') };
      }
      if (b.type === 'math') {
        let l = cleanMathString(b.latex || '')
          .replace(/==+/g, '=')
          .replace(/\(\(+/g, '(')
          .replace(/\)\)+/g, ')');
        return { ...b, latex: l.trim() };
      }
      if (b.type === 'image') {
        const alt = (b.alt && !b.alt.includes('Hình minh họa') && !b.alt.includes('MathType')) ? b.alt : undefined;
        return { ...b, alt };
      }
      return b;
    });

  // Merge consecutive text blocks
  const mergedBlocks: ContentBlock[] = [];
  for (const blk of contentBlocks) {
    const prev = mergedBlocks[mergedBlocks.length - 1];
    if (prev && prev.type === 'text' && blk.type === 'text') {
      prev.value = ((prev.value || '') + ' ' + (blk.value || '')).trim();
    } else {
      mergedBlocks.push(blk);
    }
  }

  // 3. Clean options (Part I)
  let options = q.options?.map(opt => {
    let optContent = cleanMathString(opt.content);

    // Format interval (a; b)
    if (optContent.includes(';')) {
      if (!optContent.startsWith('(') && !optContent.startsWith('[')) {
        optContent = '(' + optContent;
      }
      if (!optContent.endsWith(')') && !optContent.endsWith(']')) {
        optContent = optContent + ')';
      }
      optContent = optContent.replace(/^\(\s*\(\s*([^;\)]+;\s*[^;\)]+)\s*\)\s*\)$/, '($1)');
    }

    const optBlocks = (opt.contentBlocks && opt.contentBlocks.length > 0)
      ? opt.contentBlocks.map(b => {
          if (b.type === 'text') return { ...b, value: cleanMathString(b.value || '') };
          if (b.type === 'math') return { ...b, latex: cleanMathString(b.latex || '') };
          return b;
        })
      : [{ type: 'text' as const, value: optContent }];

    return {
      ...opt,
      content: optContent,
      contentBlocks: optBlocks
    };
  });

  // 4. Clean True/False items (Part II)
  let trueFalseItems = q.trueFalseItems?.map(tf => {
    let c = cleanMathString(tf.content);
    const tfBlocks = (tf.contentBlocks && tf.contentBlocks.length > 0)
      ? tf.contentBlocks.map(b => {
          if (b.type === 'text') return { ...b, value: cleanMathString(b.value || '') };
          if (b.type === 'math') return { ...b, latex: cleanMathString(b.latex || '') };
          return b;
        })
      : [{ type: 'text' as const, value: c }];

    return {
      ...tf,
      content: c,
      contentBlocks: tfBlocks
    };
  });

  // 5. Clean solution
  let solution = q.solution ? cleanMathString(q.solution) : undefined;
  let solutionBlocks = q.solutionBlocks?.map(b => {
    if (b.type === 'text') return { ...b, value: cleanMathString(b.value || '') };
    if (b.type === 'math') return { ...b, latex: cleanMathString(b.latex || '') };
    return b;
  });

  // Diagnostic log in dev
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    console.log('[DocxParser Diagnostic]', {
      questionNumber: q.questionNumber,
      part: q.part,
      detectedType: q.type,
      blocksCount: mergedBlocks.length,
      hasImage: Boolean(q.imageUrl),
      optionsCount: options?.length,
      tfCount: trueFalseItems?.length
    });
  }

  return {
    ...q,
    content,
    contentBlocks: mergedBlocks,
    options,
    trueFalseItems,
    solution,
    solutionBlocks
  };
}
