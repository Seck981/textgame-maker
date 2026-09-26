import fs from 'node:fs';
const BASE = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/';
const OUT = (process.env.ST_DIR || '/path/to/SillyTavern') + '/public/galgame/fa-inline.css';
const CACHE = 'D:/toomanybug/galgame/tpl-build/fa-inline.css';
let css = await (await fetch(BASE + 'css/all.min.css')).text();
const names = [...new Set([...css.matchAll(/url\((?:["']?)(\.\.\/webfonts\/[^"')]+)(?:["']?)\)/g)].map(m => m[1]))];
const keep = names.filter(n => n.endsWith('.woff2'));
console.log('字体引用:', names.length, '| 只内联 woff2:', keep.length);
const data = {};
for (const n of keep) {
  const buf = Buffer.from(await (await fetch(BASE + n.replace('../', ''))).arrayBuffer());
  data[n] = 'data:font/woff2;base64,' + buf.toString('base64');
  console.log('  ', n, Math.round(buf.length / 1024) + 'KB');
}
/* 1) 去掉 ttf 回退 (体积大头, 现代浏览器不用)  2) woff2 换成 data: */
css = css.replace(/,\s*url\((?:["']?)\.\.\/webfonts\/[^"')]+\.ttf(?:["']?)\)\s*format\(["']truetype["']\)/g, '');
css = css.replace(/url\((?:["']?)(\.\.\/webfonts\/[^"')]+)(?:["']?)\)/g, (m, n) => data[n] ? 'url(' + data[n] + ')' : m);
/* 只留 FA6 那三个家族: FA5 / v4 兼容的 @font-face 会把同样的字体再内联两遍 (1.2MB -> ~500KB) */
css = css.replace(/@font-face\{[^}]*font-family:\s*["']Font Awesome 5[^}]*\}/g, '')
         .replace(/@font-face\{[^}]*font-family:\s*["']FontAwesome["'][^}]*\}/g, '');
fs.writeFileSync(OUT, css);
fs.writeFileSync(CACHE, css);
console.log('写出:', OUT);
console.log('大小:', Math.round(css.length / 1024) + 'KB | 还有外链吗:', /\.\.\/webfonts/.test(css) ? '有(!)' : '没有 ✅');
