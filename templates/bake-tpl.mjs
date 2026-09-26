import fs from 'node:fs';
const DIR = 'D:/toomanybug/galgame/tpl-build/tpl/';
const P = (process.env.ST_DIR || '/path/to/SillyTavern') + '/data/default-user/extensions/TextGameMaker/index.js';
const tpl = {};
for (const k of ['char', 'user', 'panel']) {
  tpl[k] = {
    html: fs.readFileSync(DIR + k + '.html', 'utf8'),
    css: fs.readFileSync(DIR + k + '.css', 'utf8'),
    js: fs.readFileSync(DIR + k + '.js', 'utf8'),
  };
}
/* ★ 第 9 条: char 横版 —— HTML/JS 跟竖版同一套 (元素 id 全一样, 所以音量面板/编辑器/演出都能用),
   CSS 是「竖版 + 横版覆盖层」, JS 只把设计宽度 400 改成 640 (自适应缩放的基准) */
const landCss = fs.readFileSync(DIR + 'char-land.css', 'utf8');
const landJs = tpl.char.js.replace('var DESIGN_W = 400', 'var DESIGN_W = 640');
if (landJs === tpl.char.js) console.log('WARN: DESIGN_W 没替换到');
const stripAudio = (t) => {
  const rep = (s) => String(s || '')
    .replace(/<!--gv-audio-->[\s\S]*?<!--\/gv-audio-->/g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*$/g, '')
    .replace(/\/\* ---- 声音: 自己播[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-pause\*\/[\s\S]*?(?:\/\*\/gv-pause\*\/|$)/g, '')
    .replace(/\/\* 音量面板[\s\S]*?(?=\.gv-editor \{|$)/g, '');
  return { html: rep(t.html), css: rep(t.css), js: rep(t.js) };
};
tpl.charLand = {
  html: tpl.char.html,
  css: tpl.char.css + '\n' + landCss,
  js: landJs,
};
/* ★ 4 套预设: 竖/横 × 有/无音频 (无音频 = 把音频那几块剥掉) */
tpl.charNoAudio = stripAudio(tpl.char);
tpl.charLandNoAudio = stripAudio(tpl.charLand);
let s = fs.readFileSync(P, 'utf8');
const at = s.indexOf('const DEFAULT_TPL = ');
const end = s.indexOf('\n};', at);
if (at < 0 || end < 0) { console.log('DEFAULT_TPL NOT FOUND'); process.exit(1); }
s = s.slice(0, at) + 'const DEFAULT_TPL = ' + JSON.stringify(tpl, null, 1) + ';' + s.slice(end + 3);
fs.writeFileSync(P, s);
try { new Function(s); console.log('IDX-OK'); } catch (e) { console.log('IDX-ERR ' + e.message); process.exit(1); }
console.log('baked', Object.keys(tpl).map(k => k + ':' + tpl[k].html.length + '/' + tpl[k].css.length + '/' + tpl[k].js.length).join(' '));