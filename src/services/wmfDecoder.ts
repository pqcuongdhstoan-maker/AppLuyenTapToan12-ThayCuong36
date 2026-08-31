/**
 * Zero-dependency pure TypeScript WMF / EMF (Windows Metafile) to SVG / Canvas Data URL Converter
 * Converts Word equation preview images and vector illustrations into native browser-renderable SVG strings / Data URLs.
 */

export interface WmfConvertResult {
  svg: string;
  dataUrl: string;
  width: number;
  height: number;
}

export class WmfDecoder {
  private bytes: Uint8Array;
  private pos: number = 0;

  constructor(buffer: ArrayBuffer | Uint8Array) {
    this.bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  public toSvg(): string {
    try {
      let minX = 0;
      let minY = 0;
      let width = 300;
      let height = 150;

      // 1. Check Placeable WMF Header (22 bytes, magic 0x9AC6CDD7)
      if (this.bytes.length >= 22) {
        const magic = this.readUint32(0);
        if (magic === 0x9AC6CDD7) {
          const left = this.readInt16(6);
          const top = this.readInt16(8);
          const right = this.readInt16(10);
          const bottom = this.readInt16(12);
          const inch = this.readUint16(14) || 96;

          minX = left;
          minY = top;
          width = Math.abs(right - left) || 300;
          height = Math.abs(bottom - top) || 150;
          this.pos = 22; // Skip placeable header to standard WMF header
        }
      }

      // 2. Standard WMF Header (18 bytes)
      if (this.pos + 18 <= this.bytes.length) {
        this.pos += 18; // Skip standard WMF header
      }

      const svgElements: string[] = [];
      const gdiObjects: any[] = [];
      let currentPen = { color: '#000000', width: 1, style: 0 };
      let currentBrush = { color: 'none', style: 0 };
      let currentTextColor = '#000000';

      // 3. Process WMF Records
      while (this.pos + 6 <= this.bytes.length) {
        const sizeWords = this.readUint32(this.pos);
        const recordBytes = sizeWords * 2;
        const func = this.readUint16(this.pos + 4);
        const paramPos = this.pos + 6;

        if (sizeWords < 3 || this.pos + recordBytes > this.bytes.length) {
          break;
        }

        switch (func) {
          case 0x0000: // META_EOF
            this.pos = this.bytes.length;
            break;

          case 0x020B: { // META_SETWINDOWORG
            minY = this.readInt16(paramPos);
            minX = this.readInt16(paramPos + 2);
            break;
          }

          case 0x020C: { // META_SETWINDOWEXT
            height = Math.abs(this.readInt16(paramPos)) || height;
            width = Math.abs(this.readInt16(paramPos + 2)) || width;
            break;
          }

          case 0x02FA: { // META_CREATEPENINDIRECT
            const style = this.readUint16(paramPos);
            const w = this.readInt16(paramPos + 2);
            const colorRef = this.readUint32(paramPos + 6);
            const r = colorRef & 0xFF;
            const g = (colorRef >> 8) & 0xFF;
            const b = (colorRef >> 16) & 0xFF;
            const pen = {
              type: 'pen',
              style,
              width: Math.max(1, w),
              color: style === 5 ? 'none' : `rgb(${r},${g},${b})`
            };
            gdiObjects.push(pen);
            break;
          }

          case 0x02FB: { // META_CREATEBRUSHINDIRECT
            const style = this.readUint16(paramPos);
            const colorRef = this.readUint32(paramPos + 2);
            const r = colorRef & 0xFF;
            const g = (colorRef >> 8) & 0xFF;
            const b = (colorRef >> 16) & 0xFF;
            const brush = {
              type: 'brush',
              style,
              color: style === 1 ? 'none' : `rgb(${r},${g},${b})`
            };
            gdiObjects.push(brush);
            break;
          }

          case 0x012C: { // META_SELECTOBJECT
            const objIndex = this.readUint16(paramPos);
            const obj = gdiObjects[objIndex];
            if (obj) {
              if (obj.type === 'pen') currentPen = obj;
              if (obj.type === 'brush') currentBrush = obj;
            }
            break;
          }

          case 0x0209: { // META_SETTEXTCOLOR
            const colorRef = this.readUint32(paramPos);
            const r = colorRef & 0xFF;
            const g = (colorRef >> 8) & 0xFF;
            const b = (colorRef >> 16) & 0xFF;
            currentTextColor = `rgb(${r},${g},${b})`;
            break;
          }

          case 0x0325: { // META_POLYLINE
            const numPoints = this.readInt16(paramPos);
            const points: string[] = [];
            for (let i = 0; i < numPoints; i++) {
              const x = this.readInt16(paramPos + 2 + i * 4);
              const y = this.readInt16(paramPos + 4 + i * 4);
              points.push(`${x},${y}`);
            }
            svgElements.push(
              `<polyline points="${points.join(' ')}" stroke="${currentPen.color}" stroke-width="${currentPen.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
            );
            break;
          }

          case 0x0324: { // META_POLYGON
            const numPoints = this.readInt16(paramPos);
            const points: string[] = [];
            for (let i = 0; i < numPoints; i++) {
              const x = this.readInt16(paramPos + 2 + i * 4);
              const y = this.readInt16(paramPos + 4 + i * 4);
              points.push(`${x},${y}`);
            }
            svgElements.push(
              `<polygon points="${points.join(' ')}" stroke="${currentPen.color}" stroke-width="${currentPen.width}" fill="${currentBrush.color}" stroke-linejoin="round" />`
            );
            break;
          }

          case 0x041B: { // META_RECTANGLE
            const bottom = this.readInt16(paramPos);
            const right = this.readInt16(paramPos + 2);
            const top = this.readInt16(paramPos + 4);
            const left = this.readInt16(paramPos + 6);
            const rw = Math.abs(right - left);
            const rh = Math.abs(bottom - top);
            svgElements.push(
              `<rect x="${Math.min(left, right)}" y="${Math.min(top, bottom)}" width="${rw}" height="${rh}" stroke="${currentPen.color}" stroke-width="${currentPen.width}" fill="${currentBrush.color}" />`
            );
            break;
          }

          case 0x0521: { // META_TEXTOUT
            const strLen = this.readInt16(paramPos);
            let textStr = '';
            for (let s = 0; s < strLen; s++) {
              textStr += String.fromCharCode(this.bytes[paramPos + 2 + s]);
            }
            const y = this.readInt16(paramPos + 2 + ((strLen + 1) & ~1));
            const x = this.readInt16(paramPos + 4 + ((strLen + 1) & ~1));
            svgElements.push(
              `<text x="${x}" y="${y}" fill="${currentTextColor}" font-size="14" font-family="sans-serif">${this.escapeXml(textStr)}</text>`
            );
            break;
          }

          default:
            break;
        }

        this.pos += recordBytes;
      }

      const viewBox = `${minX} ${minY} ${width} ${height}`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">\n${svgElements.join('\n')}\n</svg>`;
    } catch (e) {
      console.warn('WMF decode error:', e);
      return '';
    }
  }

  public toDataUrl(): string {
    const svg = this.toSvg();
    if (!svg) return '';
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  private readUint16(offset: number): number {
    if (offset + 2 > this.bytes.length) return 0;
    return this.bytes[offset] | (this.bytes[offset + 1] << 8);
  }

  private readInt16(offset: number): number {
    if (offset + 2 > this.bytes.length) return 0;
    const val = this.bytes[offset] | (this.bytes[offset + 1] << 8);
    return val >= 0x8000 ? val - 0x10000 : val;
  }

  private readUint32(offset: number): number {
    if (offset + 4 > this.bytes.length) return 0;
    return (
      (this.bytes[offset]) |
      (this.bytes[offset + 1] << 8) |
      (this.bytes[offset + 2] << 16) |
      (this.bytes[offset + 3] << 24)
    ) >>> 0;
  }

  private escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

/**
 * Converts a WMF ArrayBuffer / Uint8Array to an SVG data URL
 */
export function convertWmfToSvgDataUrl(buffer: ArrayBuffer | Uint8Array): string {
  const decoder = new WmfDecoder(buffer);
  return decoder.toDataUrl();
}
