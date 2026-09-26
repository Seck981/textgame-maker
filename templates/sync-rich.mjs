/* 把引擎里的"悬浮窗富渲染"整段 (==GV-RICH-START== .. ==GV-RICH-END==) 同步进插件预览
   用法:  ST_DIR=/path/to/SillyTavern node templates/sync-rich.mjs
   (Windows: set ST_DIR=D:\SillyTavern\SillyTavern && node templates\sync-rich.mjs)
   引擎 = <ST>/public/galgame/galgame.js ; 插件 = <ST>/data/default-user/extensions/TextGameMaker/index.js
   改了引擎那段富渲染(切分围栏/活 iframe)之后一定要跑一次, 否则插件预览和真机会分叉 */
import fs from 'node:fs';
import path from 'node:path';

const ST = process.env.ST_DIR || '';
if (!ST) { console.error('请先设置 ST_DIR 指向你的酒馆根目录（里面能看到 public/ 和 data/）'); process.exit(1); }
const ENGINE = path.join(ST, 'public', 'galgame', 'galgame.js');
const PLUGIN = path.join(ST, 'data', process.env.TGM_USER || 'default-user', 'extensions', process.env.TGM_DIRNAME || 'TextGameMaker', 'index.js');

const A = '/* ==GV-RICH-START==', B = '/* ==GV-RICH-END== */';
const A2 = '/* ==GV-RICH-BEGIN==', B2 = '/* ==GV-RICH-END== */';

const eng = fs.readFileSync(ENGINE, 'utf8');
const i0 = eng.indexOf(A), i1 = eng.indexOf(B);
if (i0 < 0 || i1 < 0) { console.error('引擎里找不到 GV-RICH 标记'); process.exit(1); }
const block = eng.slice(i0, i1 + B.length);
console.log('引擎段落: ' + block.split(String.fromCharCode(10)).length + ' 行, ' + block.length + ' 字符');

let idx = fs.readFileSync(PLUGIN, 'utf8');
const j0 = idx.indexOf(A2);
const j1 = idx.indexOf(B2, j0 + 1);
const head = '  /* ==GV-RICH-BEGIN== 悬浮窗富渲染 —— 由引擎 galgame.js 的 ==GV-RICH-START== 段自动同步' +
  ' (templates/sync-rich.mjs)。预览和真机共用同一套切分/围栏代码, 手改这里下次同步会被覆盖 */' + String.fromCharCode(10);
const body = block.split(String.fromCharCode(10)).map(l => (l.trim() ? '  ' + l : l)).join(String.fromCharCode(10));
const tail = String.fromCharCode(10) + '  /* ==GV-RICH-END== */';
if (j0 >= 0 && j1 > j0) idx = idx.slice(0, j0) + head + body + tail + idx.slice(j1 + B2.length);
else {
  const anchor = "  const LS_LAST = 'tgm_last_project';";
  const k = idx.indexOf(anchor);
  if (k < 0) { console.error('插件里找不到插入锚点'); process.exit(1); }
  const at = k + anchor.length;
  idx = idx.slice(0, at) + String.fromCharCode(10, 10) + head + body + tail + idx.slice(at);
}
fs.writeFileSync(PLUGIN, idx);
console.log('已写入 ' + PLUGIN + ' (' + Buffer.byteLength(idx) + ' 字节)');
console.log('richHtml: ' + (idx.includes('function richHtml') ? 'ok' : '缺失'));
