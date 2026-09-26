/* 把 engine/ 里的引擎文件复制到 <酒馆>/public/galgame/
   用法:  ST_DIR=/path/to/SillyTavern node tools/install-engine.mjs
   (Windows: set ST_DIR=D:\SillyTavern\SillyTavern && node tools\install-engine.mjs) */
import fs from 'node:fs';
import path from 'node:path';

const ST = process.env.ST_DIR || '';
if (!ST) {
  console.error('请先设置 ST_DIR 指向你的酒馆根目录（里面能看到 public/ 和 data/）');
  process.exit(1);
}
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SRC = path.join(here, '..', 'engine');
const DST = path.join(ST, 'public', 'galgame');
if (!fs.existsSync(path.join(ST, 'public'))) {
  console.error('这个目录看起来不是酒馆根目录：' + ST);
  process.exit(1);
}
fs.mkdirSync(path.join(DST, 'libs'), { recursive: true });
let n = 0;
for (const f of fs.readdirSync(SRC)) {
  const s = path.join(SRC, f);
  if (fs.statSync(s).isDirectory()) {
    for (const g of fs.readdirSync(s)) { fs.copyFileSync(path.join(s, g), path.join(DST, f, g)); n++; console.log('  libs/' + g); }
  } else { fs.copyFileSync(s, path.join(DST, f)); n++; console.log('  ' + f); }
}
console.log('完成：复制了 ' + n + ' 个文件到 ' + DST);
console.log('现在刷新酒馆页面，插件就能预览和导出了。');
