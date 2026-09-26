import fs from 'node:fs';
const G = (process.env.ST_DIR || '/path/to/SillyTavern') + '/public/galgame/';
const D = 'D:/toomanybug/galgame/tpl-build/tpl/';
/* 卡里那套的样式原样搬 (char/user 都用 galgame.css, panel 用 galgame-panel.css) */
fs.copyFileSync(G + 'galgame.css', D + 'char.css');
fs.copyFileSync(G + 'galgame.css', D + 'user.css');
fs.copyFileSync(G + 'galgame-panel.css', D + 'panel.css');
/* 模板在 iframe 里: 高度不能再依赖 vh(会和"按内容量高度"打架), 面板也不能 fixed */
fs.appendFileSync(D + 'char.css', '\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n' +
  '.gv-root { align-items: flex-start; }\n' +
  '.gv-phone { max-height: none; }\n');
fs.appendFileSync(D + 'panel.css', '\n/* ---- 模板版微调: 面板的位置/大小由宿主决定, 这里不当 fixed ---- */\n' +
  '.gv-panel { position: relative; top: auto; right: auto; width: 100%; max-width: 380px; margin: 0 auto; max-height: none; }\n' +
  '.gv-panel .gv-rs { display: none; }\n' +
  '.gv-panel-body { max-height: none; }\n');
console.log('css copied',
  fs.statSync(D + 'char.css').size, fs.statSync(D + 'user.css').size, fs.statSync(D + 'panel.css').size);
