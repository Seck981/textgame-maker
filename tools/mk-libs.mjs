import fs from 'node:fs';
const DIR = (process.env.ST_DIR || '/path/to/SillyTavern') + '/public/galgame/libs/';
fs.mkdirSync(DIR, { recursive: true });
const want = [
  ['tailwind.js', 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.12/dist/index.global.js'],
  ['highlight.js', 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/highlight.min.js'],
  ['highlight.css', 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/github-dark.min.css'],
  ['mermaid.js', 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js'],
  ['animate.css', 'https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css'],
];
for (const [name, url] of want) {
  try {
    const r = await fetch(url);
    if (!r.ok) { console.log('MISS', name, r.status); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(DIR + name, buf);
    console.log(name, Math.round(buf.length / 1024) + 'KB');
  } catch (e) { console.log('ERR', name, e.message); }
}
console.log('目录:', DIR);
console.log('清单:', fs.readdirSync(DIR).join(' '));
