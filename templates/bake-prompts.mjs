import fs from 'node:fs';
const P = (process.env.ST_DIR || '/path/to/SillyTavern') + '/data/default-user/extensions/TextGameMaker/index.js';
const J = 'D:/toomanybug/galgame/tpl-build/page-prompts.json';
const prompts = JSON.parse(fs.readFileSync(J, 'utf8'));
let s = fs.readFileSync(P, 'utf8');
const block = 'const PAGE_PROMPTS = ' + JSON.stringify(prompts) + ';';
const START = 'const PAGE_PROMPTS = ';
const at = s.indexOf(START);
if (at >= 0) {
  const end = s.indexOf('\n', at);
  s = s.slice(0, at) + block + s.slice(end);
  console.log('替换已有 PAGE_PROMPTS');
} else {
  const anchor = 'const DEFAULT_TPL = ';
  const i = s.indexOf(anchor);
  if (i < 0) { console.log('DEFAULT_TPL NOT FOUND'); process.exit(1); }
  s = s.slice(0, i) + block + '\n' + s.slice(i);
  console.log('插入 PAGE_PROMPTS');
}
fs.writeFileSync(P, s);
try { new Function(s); console.log('IDX-OK'); } catch (e) { console.log('IDX-ERR ' + e.message); process.exit(1); }
console.log('长度: char', prompts.char.length, '| user', prompts.user.length, '| panel', prompts.panel.length);
