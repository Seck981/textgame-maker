import fs from 'node:fs';
const DIR = (process.env.ST_DIR || '/path/to/SillyTavern') + '/public/galgame/libs/';
for (const [name, url] of [
  ['tailwind.js', 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.17/lib/index.js'],
  ['tailwind-cdn.js', 'https://cdn.tailwindcss.com/3.4.16'],
]) {
  try { const r = await fetch(url); if (!r.ok) { console.log('MISS', name, r.status); continue; }
    const b = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(DIR + name, b);
    console.log(name, Math.round(b.length / 1024) + 'KB', '| window.tailwind:', b.toString('utf8').indexOf('window.tailwind') >= 0 || b.toString('utf8').indexOf('tailwind =') >= 0);
  } catch (e) { console.log('ERR', name, e.message); }
}
