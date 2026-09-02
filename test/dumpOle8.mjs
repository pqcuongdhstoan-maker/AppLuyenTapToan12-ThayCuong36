import fs from 'fs';
import zlib from 'zlib';

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
const ole8 = entries['word/embeddings/oleObject8.bin'];

// Find MTEF header
let mtefPos = -1;
for (let i = 0; i < ole8.length - 4; i++) {
  if (ole8[i] === 0x05 && ole8[i+1] === 0x01 && ole8[i+2] === 0x00) {
    mtefPos = i;
    break;
  }
}

console.log('MTEF starts at:', mtefPos);
if (mtefPos >= 0) {
  const slice = ole8.subarray(mtefPos, mtefPos + 250);
  console.log('Hex dump from MTEF start:');
  console.log(Buffer.from(slice).toString('hex'));
}
