import fs from 'node:fs';
const crcTable = (() => { const t=new Int32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c;} return t; })();
const crc32 = b => { let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=crcTable[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
const mkChunk = (type, data) => { const l=Buffer.alloc(4); l.writeUInt32BE(data.length); const t=Buffer.from(type,'ascii'); const c=Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t,data]))); return Buffer.concat([l,t,data,c]); };

/** 解析 PNG 的所有 chunk */
export function readChunks(buf) {
  const out = []; let p = 8;
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.subarray(p+4, p+8).toString('ascii');
    const data = buf.subarray(p+8, p+8+len);
    const crc = buf.subarray(p+8+len, p+12+len);
    out.push({ type, data, crc, raw: buf.subarray(p, p+12+len) });
    p += 12 + len;
    if (type === 'IEND') break;
  }
  return out;
}

/** 把所有 chara / ccv3 元数据换成新的 (先删掉旧的, 再插到 IHDR 之后) */
export function writeCard(file, cardObj) {
  const buf = fs.readFileSync(file);
  const chunks = readChunks(buf);
  const kwOf = c => { const nul = c.data.indexOf(0); return (nul >= 0 ? c.data.subarray(0, nul) : c.data).toString('latin1').toLowerCase(); };
  /* ★ 原来只写回 chara(v2): 卡里本来有 ccv3(v3) 的话会被整块丢掉, 而酒馆优先读 ccv3 —— 等于白改。
     现在: 原卡有 ccv3 就两份一起写(内容同步), 没有就只写 chara。 */
  const hadCcv3 = chunks.some(c => (c.type === 'tEXt' || c.type === 'zTXt' || c.type === 'iTXt') && kwOf(c) === 'ccv3');
  const b64 = Buffer.from(JSON.stringify(cardObj), 'utf8').toString('base64');
  const kept = chunks.filter(c => {
    if (c.type !== 'tEXt' && c.type !== 'iTXt' && c.type !== 'zTXt') return true;
    const kw = kwOf(c);
    return kw !== 'chara' && kw !== 'ccv3';
  });
  console.log('原 chunk:', chunks.map(c => c.type).join(','), '| 保留:', kept.map(c => c.type).join(','), '| ccv3:', hadCcv3 ? '保留并同步' : '原卡没有');
  const sig = buf.subarray(0, 8);
  const out = [sig];
  const mk = kw => mkChunk('tEXt', Buffer.concat([Buffer.from(kw, 'latin1'), Buffer.from([0]), Buffer.from(b64, 'latin1')]));
  let inserted = false;
  for (const c of kept) {
    out.push(c.raw);
    if (!inserted && c.type === 'IHDR') { out.push(mk('chara')); if (hadCcv3) out.push(mk('ccv3')); inserted = true; }
  }
  fs.writeFileSync(file, Buffer.concat(out));
  return fs.statSync(file).size;
}

export function readCard(file) {
  const chunks = readChunks(fs.readFileSync(file));
  for (const c of chunks) {
    if (c.type !== 'tEXt') continue;
    const nul = c.data.indexOf(0);
    const kw = c.data.subarray(0, nul).toString('latin1').toLowerCase();
    if (kw !== 'chara') continue;
    const body = c.data.subarray(nul + 1);
    const cands = [Buffer.from(body.toString('latin1'), 'base64'), body];
    for (const cand of cands) {
      try { const o = JSON.parse(cand.toString('utf8')); if (o && o.name) return o; } catch (e) {}
    }
  }
  return null;
}
