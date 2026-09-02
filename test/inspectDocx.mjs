import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { decodeMtefToLatex } from '../src/services/mtefDecoder.ts';

function unzip(buffer) {
  const entries = {};
  let offset = 0;
  while (offset < buffer.length - 4) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) { offset++; continue; }
    const compMethod = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const filename = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = buffer.subarray(dataStart, dataStart + compSize);
    let uncompressed = null;
    if (compMethod === 0) uncompressed = compData;
    else if (compMethod === 8) {
      try { uncompressed = zlib.inflateRawSync(compData); } catch (e) {}
    }
    if (uncompressed) entries[filename] = uncompressed;
    offset = dataStart + compSize;
  }
  return entries;
}

const buf = fs.readFileSync('test-files/TN1.docx');
const entries = unzip(buf);

const embKeys = Object.keys(entries).filter(k => k.startsWith('word/embeddings/'));
for (const k of embKeys.slice(0, 10)) {
  const binBuf = entries[k];
  const latex = decodeMtefToLatex(binBuf);
  console.log(`OLE [${k}]: "${latex}"`);
}

const wmfKeys = Object.keys(entries).filter(k => k.startsWith('word/media/') && k.endsWith('.wmf'));
for (const k of wmfKeys.slice(0, 10)) {
  const wmfBuf = entries[k];
  const latex = decodeMtefToLatex(wmfBuf);
  console.log(`WMF [${k}]: "${latex}"`);
}
