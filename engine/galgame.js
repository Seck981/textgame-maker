/* ============================================================
   酒馆 Galgame 楼层界面 — 渲染引擎
   用法: 由酒馆助手脚本注入到酒馆主页面, 暴露 window.Galgame
   ============================================================ */
(function () {
  'use strict';
  if (window.Galgame && window.Galgame.version >= 1) return;

  const BASE = '/galgame/';
  /* ★ 引擎文件版本标记 —— 插件导出前会查这个字符串: 酒馆里的 /galgame/galgame.js 是【扩展更新时不会自动替换】的, 没有这个标记 = 用户的引擎还是旧的, 导出的脚本悬浮窗会退回旧样子 (index.js 导出页会当面警告) */
  const ENGINE_REV = '2026-09-26-rich1';

  const CONFIG = {
    /* 背景: AI 写的关键词 -> 图片。用 includes 匹配, 顺序有意义。
       ★ 这些是【引擎/角色卡】用的素材, 不在插件包里; 插件预览不会用它们 */
    bgMap: {
      '海': BASE + 'bg/sea.jpg', 'sea': BASE + 'bg/sea.jpg', '沙滩': BASE + 'bg/sea.jpg', '浪': BASE + 'bg/sea.jpg',
      '夜': BASE + 'bg/night.jpg', '星': BASE + 'bg/night.jpg', 'night': BASE + 'bg/night.jpg', '晚': BASE + 'bg/night.jpg',
      '空': BASE + 'bg/sky.jpg', '云': BASE + 'bg/sky.jpg', 'sky': BASE + 'bg/sky.jpg', '天': BASE + 'bg/sky.jpg',
      '酒馆': BASE + 'bg/tavern.jpg', '木': BASE + 'bg/tavern.jpg', '室内': BASE + 'bg/tavern.jpg',
      '房': BASE + 'bg/tavern.jpg', '屋': BASE + 'bg/tavern.jpg', 'room': BASE + 'bg/tavern.jpg',
      '店': BASE + 'bg/tavern.jpg', '书': BASE + 'bg/tavern.jpg', '咖啡馆': BASE + 'bg/tavern.jpg',
    },
    /* 表情: AI 写的关键词 -> 立绘。未命中时按名字哈希挑一张(保证同一表情永远同一张) */
    faceMap: {
      '平静': BASE + 'chara/c.png', '默认': BASE + 'chara/c.png', 'normal': BASE + 'chara/c.png',
      '微笑': BASE + 'chara/a.png', '笑': BASE + 'chara/a.png', '开心': BASE + 'chara/a.png', 'smile': BASE + 'chara/a.png',
      '害羞': BASE + 'chara/f.png', '脸红': BASE + 'chara/f.png', 'blush': BASE + 'chara/f.png',
      '惊讶': BASE + 'chara/e.png', '吃惊': BASE + 'chara/e.png', '惊': BASE + 'chara/e.png',
      '生气': BASE + 'chara/d.png', '怒': BASE + 'chara/d.png', 'angry': BASE + 'chara/d.png',
      '悲伤': BASE + 'chara/b.png', '难过': BASE + 'chara/b.png', '哭': BASE + 'chara/b.png',
    },
    facePool: ['a', 'b', 'c', 'd', 'e', 'f'].map(n => BASE + 'chara/' + n + '.png'),
    accentMap: {
      '爱丽丝': '#ff8fb1', '旁白': '#9aa3bb',
    },
    defaultAccent: '#ff8fb1',
    /* 站位关键词: AI 写在最后一个字段。数量可配置 —— 插件里改这里 */
    slots: ['left', 'middle', 'right'],
    /* 每个站位的落点: { left: {x:22,y:100,scale:1}, ... }。空则按索引自动平分 */
    slotPos: {},
    /* ★ 占位排版: 每个站位一块"画框" { left: {x:8,y:52,w:34,h:48}, ... }
       x/y = 框左上角(整块的百分比), w/h = 框宽高(百分比)。有框就按框站, 没框还是走上面那套自动平分 */
    slotBoxes: {},
    /* 多立绘时, 非当前说话者降到多少透明度 */
    idleOpacity: 0.55,
    /* 情绪气泡贴纸 */
    bubbleMap: {},
    seMap: {},                  /* 音效: 名字 -> 音频地址 */
    bubblePos: { x: 78, y: 24, scale: 1 },
    bubblePosEach: {},          /* 单个贴纸单独调过的落点: { 贴纸名: {x,y,scale} } */
  bubblePosSlot: {},          /* 每个【站位】各一套气泡落点: { 站位: {x,y,scale} } —— 优先于 bubblePos, 低于 bubblePosEach */
    bubbleAnim: {},
    bubbleMs: 1900,
    /* 自定义演出组 */
    effects: {},
    /* BGM: 情绪 -> 外链 */
    audioMap: {},
    /* P4 页面模板: 空 = 用引擎自带长相 */
    templates: { char: null, user: null, panel: null },
    typeSpeed: 28,       // 每字毫秒
    autoDelay: 1600,     // 自动播放停顿
    requirePipe: true,   // 必须至少有一行 "名字|表情|台词" 才算命中, 防止劫持普通小说输出
  };

  const FX = {
    none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',
    shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',
    jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',
    zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',
    dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',

    bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',
    flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',
  };

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }

  /* 背景/立绘的值可以是 URL 字符串, 也可以是 { url, fit:{x,y,scale} } —— 素材包导入后用后者 */
  function normEntry(v) { return v == null ? null : (typeof v === 'string' ? { url: v } : v); }
  function bareName(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\.(png|jpe?g|webp|gif|bmp|avif)$/, ''); }
  /* ★ 对不上名字时【不再随便挑一张】。
     以前是 hash 兜底: 同一个名字永远给同一张图 —— 用户看到的就成了"不管我怎么改, 背景永远是这一张"
     (实测: 消息里写【bg:主殿】, 方案里只有 天机阁/炼丹房 -> 哈希挑中其中一张, 永远那一张)。
     现在: 不显示背景 + 同一个名字只提示一次, 把"消息里的名字"和"方案里的名字"摊开给用户看。 */
  const _missWarned = {};
  function warnMissing(kind, name, table) {
    const keys = Object.keys(table || {});
    if (!keys.length) return;                 // 一张素材都没有: 是真的没导入, 不用吵
    const id = kind + '|' + name;
    if (_missWarned[id]) return;
    _missWarned[id] = 1;
    const msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + keys.slice(0, 8).join(' / ') + (keys.length > 8 ? ' …' : '') + '）';
    try { console.warn('[gv] ' + msg); } catch (e) {}
    try { if (typeof toastr !== 'undefined') toastr.warning(msg, '素材对不上', { timeOut: 9000 }); } catch (e) {}
  }
  function resolveBg(key) {
    if (!key) return null;
    const k = bareName(key);
    /* ★ 包里键是文件名(主殿.png)、剧本写"主殿": 去扩展名 + 互相包含都要能对上 */
    for (const pat in CONFIG.bgMap) { const pb = bareName(pat); if (pb && (k.includes(pb) || pb.includes(k))) return normEntry(CONFIG.bgMap[pat]); }
    warnMissing('背景', key, CONFIG.bgMap);
    return null;
  }
  function resolveFace(key, name) {
    const k = String(key || '').trim().toLowerCase();
    const nm = String(name || '').trim();
    /* 先按 "角色|情绪" 精确找 (素材包导入后是这样), 再按情绪找, 最后哈希兜底 */
    if (k) {
      const exact = CONFIG.faceMap[nm + '|' + k] || CONFIG.faceMap[k];
      if (exact) return normEntry(exact).url;
    }
    for (const pat in CONFIG.faceMap) {
      if (pat.indexOf('|') >= 0) continue;             // 带角色名的键不参与模糊匹配
      if (k && k.includes(pat.toLowerCase())) return normEntry(CONFIG.faceMap[pat]).url;
    }
    /* ★ 以前这里从 facePool 里 hash 挑一张顶上 —— 结果是"人物站位/表情对不上"(拿的是别人的脸)。
       现在不给图, 只提示一次: 消息里的「角色·情绪」在方案里没有对应的立绘。 */
    warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), CONFIG.faceMap);
    return null;
  }
  /* 和 resolveFace 一样, 但把整个条目拿出来 (立绘的取景 fit 要用) */
  function resolveFaceEntry(key, name) {
    const k = String(key || '').trim().toLowerCase();
    const nm = String(name || '').trim();
    if (k) {
      const exact = CONFIG.faceMap[nm + '|' + k] || CONFIG.faceMap[k];
      if (exact) return normEntry(exact);
    }
    for (const pat in CONFIG.faceMap) {
      if (pat.indexOf('|') >= 0) continue;
      if (k && k.includes(pat.toLowerCase())) return normEntry(CONFIG.faceMap[pat]);
    }
    /* ★ 表情对不上时: 优先拿【这个角色自己的】一张脸, 别甩一张别人的 (以前是全局池哈希 -> 会冒出别人的立绘) */
    if (nm) for (const pat in CONFIG.faceMap) { const _i = pat.indexOf('|'); if (_i > 0 && pat.slice(0, _i) === nm) return normEntry(CONFIG.faceMap[pat]); }
    warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), CONFIG.faceMap);
    return null;
  }
  /* ★ 这个名字到底有没有立绘 (精确 / 只按表情 / 模糊匹配 / "角色|表情" 键里的角色名 都算)。
     没有 = 路人 -> 和旁白同一套处理: 名字照写, 但不给他配立绘, 也不动台上已经站着的人 */
  function hasFaceFor(key, name) {
    const k = String(key || '').trim().toLowerCase();
    const nm = String(name || '').trim();
    if (!nm) return false;
    if (k && (CONFIG.faceMap[nm + '|' + k] || CONFIG.faceMap[k])) return true;
    for (const pat in CONFIG.faceMap) {
      const _i = pat.indexOf('|');
      if (_i > 0) { if (pat.slice(0, _i) === nm) return true; continue; }
      if (k && k.includes(pat.toLowerCase())) return true;
    }
    return false;
  }
  /* 当前"正在用的人设"的头像。以 ST 现场的 user_avatar 为准,
     不要用调用方传进来的旧值 (换人设之后旧值就是别人/旧的图了) */
  function liveUserName() {
    try {
      const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
      return String((c && c.name1) || '');
    } catch (e) { return ''; }
  }

  function liveUserAvatar() {
    try {
      const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
      if (!c) return '';
      const me = String(c.name1 || '');
      const psAll = (c.powerUserSettings && c.powerUserSettings.personas) || {};
      const fileOf = function (src) {
        const m = /[?&]file=([^&]+)/.exec(String(src || ''));
        return m ? decodeURIComponent(m[1]) : '';
      };
      /* 1) 酒馆自己渲染的用户楼层头像: 只有当它对应的人设名 == 当前人设名 时才采信
         (人设池里可能有好几个同名文件, 靠这个区分; 但楼层头像可能是旧人设的, 名字对不上就作废) */
      try {
        const im = document.querySelector('#chat .mes[is_user="true"] .avatar img');
        const src = im && (im.getAttribute('src') || im.src);
        const f = fileOf(src);
        if (src && f && psAll[f] !== undefined && String(psAll[f]) === me) return src;
      } catch (e) {}
      /* 2) 按当前人设名在人设池里找 */
      for (const k in psAll) {
        const v = psAll[k];
        const nm = (v && typeof v === 'object') ? (v.name || v.avatar) : v;
        if (String(nm) === me) return '/thumbnail?type=persona&file=' + encodeURIComponent(k);
      }
      /* 3) 人设池里标记为"默认"的那个 */
      const def = String((c.powerUserSettings && c.powerUserSettings.default_persona) || '');
      if (def && psAll[def] !== undefined) return '/thumbnail?type=persona&file=' + encodeURIComponent(def);
      const cur = String(c.user_avatar || '');
      if (cur && cur !== 'none') return '/thumbnail?type=persona&file=' + encodeURIComponent(cur);
    } catch (e) {}
    return '';
  }

  /* 人设切换: 把页面上所有 User 头像(楼层里那个 + 对话框右上角那个)换成新的人设头像 */
  function refreshUserAvatars() {
    const url = liveUserAvatar();
    if (!url) return;
    const walk = function (root) {
      try {
        const ims = root.querySelectorAll ? root.querySelectorAll('img.gv-uava') : [];
        for (let i = 0; i < ims.length; i++) { if (ims[i].getAttribute('src') !== url) ims[i].src = url; }
        const all = root.querySelectorAll ? root.querySelectorAll('*') : [];
        for (let j = 0; j < all.length; j++) { if (all[j].shadowRoot) walk(all[j].shadowRoot); }
      } catch (e) {}
    };
    walk(document);
    /* User 楼层那一行的名字也跟着当前人设走 */
    try {
      const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
      const me = String((c && c.name1) || '');
      if (me) {
        const walk2 = function (root) {
          try {
            const bs = root.querySelectorAll ? root.querySelectorAll('.gv-utext b, .gv-name.gv-user') : [];
            for (let i = 0; i < bs.length; i++) { if (bs[i].textContent !== me) bs[i].textContent = me; }
            const all = root.querySelectorAll ? root.querySelectorAll('*') : [];
            for (let j = 0; j < all.length; j++) { if (all[j].shadowRoot) walk2(all[j].shadowRoot); }
          } catch (e) {}
        };
        walk2(document);
      }
    } catch (e) {}
  }
  (function watchPersona() {
    /* 事件 + 轮询双保险: 人设改了(名字或头像变了)就刷新楼层里的 User 头像和名字 */
    let lastSig = '';
    setInterval(function () {
      try {
        const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
        const sig = String((c && c.name1) || '') + '|' + liveUserAvatar();
        if (sig !== lastSig) { lastSig = sig; refreshUserAvatars(); }
      } catch (e) {}
    }, 1200);
    try {
      const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
      if (!c || !c.eventSource) return;
      const ev = c.event_types || {};
      if (ev.PERSONA_CHANGED) c.eventSource.on(ev.PERSONA_CHANGED, function () { setTimeout(refreshUserAvatars, 60); });
      if (ev.CHAT_CHANGED) c.eventSource.on(ev.CHAT_CHANGED, function () { setTimeout(refreshUserAvatars, 300); });
    } catch (e) {}
  })();

  function resolveAccent(name) {
    for (const pat in CONFIG.accentMap) if (String(name).includes(pat)) return CONFIG.accentMap[pat];
    const pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];
    return pool[hash(String(name)) % pool.length];
  }

  function stripMd(s) {
    return String(s || '')
      .replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1')
      .replace(/(^|[^*])\*(?!\s)(.+?)(?<!\s)\*/g, '$1$2')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-•>]+\s*/, '')
      .trim();
  }

  /* ---------------- 草稿注释剥离 ---------------- */
  /* AI 自我迭代时会写 <!-- draft: [生成预演]/[有罪推定] ... --> , 这些不能进正文。
     正常闭合的直接删; 没闭合的 (被 token 截断) 从 <!-- 起到文末全砍 —— 那种情况下
     后面的内容本来也不可信, 宁可少显示也不要让草稿漏到界面上。 */
  function stripComments(text) {
    let s = String(text == null ? '' : text);
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    let i = s.indexOf('<!--');
    while (i >= 0) {
      s = s.slice(0, i);
      i = s.indexOf('<!--');
    }
    return s;
  }

  /* ---------------- 正文定位 (跨预设) ---------------- */
  /* 已知的"附加块"标签: 正文遇到它们就结束 */
  var EXTRA_BLOCKS = ('tableedit meow_fm meowfm profile branches snow finish author_note muttering quote ' +
    'novel_header narrative_instruction eo scene summary think thinking analysis reasoning status statusbar ' +
    'state options choices vars variables memory details tucao memo note notes remember remember_note').split(' ');

  function lineSpans(t) {
    const arr = t.split(/\r?\n/); let off = 0;
    return arr.map(x => { const o = off; off += x.length + 1; return { x, o }; });
  }

  /* 返回正文在文本里的 [start, end)。
     分层判定, 一层比一层弱:
       1. 显式正文容器 <content> / <scene> / <body> / <novel_body>
       2. 思维链分界 </think> </thinking> </analysis> </reasoning> </metacognition> </cot>
       3. 第一个附加块标签 (<tableEdit>/<meow_FM>/<profile>/<snow>/...)
     confident=false 表示三条都没命中 —— 这时绝不猜, 楼层保持酒馆原生渲染 */
  function bodyRange(text) {
    const t = String(text == null ? '' : text);
    const cm = /<(content|scene|novel_body|body)\s*>/i.exec(t);
    if (cm) {
      const s = cm.index + cm[0].length;
      const ce = new RegExp('<\\/' + cm[1], 'i').exec(t.slice(s));
      return { start: s, end: ce ? s + ce.index : t.length, how: 'container:' + cm[1].toLowerCase(), confident: true };
    }
    let start = 0, sawThink = false, mm;
    const th = /<\/(?:think(?:ing)?|analysis|reasoning|metacognition|cot)>/gi;
    while ((mm = th.exec(t))) { start = mm.index + mm[0].length; sawThink = true; }
    let end = t.length, sawBlock = false;
    for (const sp of lineSpans(t)) {
      if (sp.o < start) continue;
      const s = sp.x.trim();
      const bm = /^<\/?([a-zA-Z_][\w-]*)>$/.exec(s);
      if (bm && EXTRA_BLOCKS.indexOf(bm[1].toLowerCase()) >= 0) { end = sp.o; sawBlock = true; break; }
    }
    return { start, end, how: sawThink ? 'think-end' : (sawBlock ? 'extra-block' : 'none'), confident: sawThink || sawBlock };
  }

  /* ---------------- 解析 ---------------- */
  function parse(raw) {
    let t = String(raw == null ? '' : raw);
    if (!t.trim()) return null;

    t = stripComments(t);   // HTML 注释 (AI 的 draft 迭代块) 一律不是正文
    // 注意: <content> 的边界必须在这个 t 上量 (下面的行偏移也是按它算的),
    // 标签本身在循环里丢掉, 不能提前 replace 掉, 否则偏移全错

    // 千万别删代码围栏! 酒馆助手靠它识别需要渲染成 iframe 的前端界面

    const out = { bg: null, bgm: null, bgmAt: [], seAt: [], bgAt: [], lines: [], raw: raw };   /* bgmAt/seAt: 中途插入的音乐/音效; bgAt: 中途换的背景 */
    /* ★ 长的放前面: bg 会抢先匹配掉 bgm, 于是 【bgm:x】 被当成 bg(m:x) ❌ */
    const TAG = /^[【\[（(]?\s*(bgm|音乐|se|音效|bg|背景|scene)\s*[:：]?\s*([^】\]）)]+?)\s*[】\]）)]?\s*$/i;

    const rest = [];   // 正文之外的所有内容 (思维链 / 状态栏 / 表格 / 代码 ...)
    const pendSingles = [];   // <content> 里没写竖线的行, 待定

    // 脚本行只认"正文范围"里的 (借预设的壳, 不和预设抢结构)
    const __br = bodyRange(t);
    const scopeStart = __br.start, scopeEnd = __br.end;
    const inScope = pos => pos >= scopeStart && pos < scopeEnd;
    let cursor = 0;

    for (const rawLine of lineSpans(t)) {
      const lineStart = rawLine.o;
      const s = rawLine.x.trim();
      if (!s) { rest.push(''); continue; }
      if (/^<\/?content>$/i.test(s)) continue;   // 包裹标签本身, 哪边都不进
      // 去掉行首的列表符号
      const line = s.replace(/^[-–—•*>]+\s*/, '');

      // 标签行 (整行就是一个 【bg:xxx】)
      if (/^[【\[]/.test(line)) {
        const m = line.match(TAG);
        if (m) {
          const k = m[1].toLowerCase();
          /* ★ 背景: 第一条当"开场背景", 同时把每一次换景都记进 bgAt(按行号) —— 模板那条路要按行换背景 */
          if (k === 'bg' || k === '背景' || k === 'scene') { const _bn = m[2].trim(); if (out.bg == null) out.bg = _bn; out.bgAt.push({ at: out.lines.length, name: _bn }); continue; }
          if (k === 'bgm' || k === '音乐') { const nm = m[2].trim(); if (out.bgm == null) out.bgm = nm; out.bgmAt.push({ at: out.lines.length, name: nm }); continue; }
          if (k === 'se' || k === '音效') { out.seAt.push({ at: out.lines.length, name: m[2].trim() }); continue; }
        }
        // 【xxx】开头但不像标签 -> 落到附加内容
      }

      // markdown 表格 / mermaid / 分隔线 -> 附加内容
      if (/^\s*\|/.test(line) || line.includes('-->') || /^\s*\|?[\s:-]*-{3,}[\s:|-]*$/.test(line)) {
        rest.push(rawLine.x); continue;
      }

      const parts = line.split(/\s*[|｜]\s*|\t+/);
      /* ★ 行尾那个 | 是【终止符】不是空字段 —— 不削掉的话 "名|表情|台词|效果|" 会算成 5 段:
         效果被并进台词(真机: |bubble:sparkle| 原样出现在正文里), 而 fx 取到的是末尾那个空串 -> 气泡永远不弹。
         (旁白||文字| 削掉尾巴后剩 3 段, 正好走"第 3 段空着"的那条老路, 不受影响) */
      if (parts.length > 1 && !String(parts[parts.length - 1]).trim()) parts.pop();
      if (parts.length > 5) { rest.push(rawLine.x); continue; }   // 表格行字段太多
      if (parts.length >= 3 && inScope(lineStart)) {
        /* 站位字段可选: 名|表情|台词|效果|left —— 只有最后一段命中站位关键词时才吃掉它 */
        const arr = parts.slice();
        let slot = '', se = '';
        /* 音效写在最后: 认 se:名字 / 音效:名字, 或者最后一段正好是导入过的音效名 */
        if (arr.length >= 3) {
          const last = String(arr[arr.length - 1]).trim();
          const bare = last.replace(/^(se|音效)\s*[:：]\s*/i, '');
          if (bare !== last || (CONFIG.seMap && CONFIG.seMap[bare])) { se = bare; arr.pop(); }
        }
        if (arr.length >= 4 && CONFIG.slots.indexOf(String(arr[arr.length - 1]).trim().toLowerCase()) >= 0) {
          slot = String(arr.pop()).trim().toLowerCase();
        }
        const nm = stripMd(arr[0]);
        const hasFx = arr.length >= 4;   // 4 段才把最后一段当演出效果, 3 段就是 名|表情|台词
        /* 旁白|文字| (第 3 段空着) -> 第 2 段就是正文, 别显示成空台词 */
        let txFix = stripMd(hasFx ? arr.slice(2, arr.length - 1).join('|') : arr.slice(2).join('|'));
        if (!txFix && !hasFx && (!nm || nm === '旁白') && String(arr[1] || '').trim()) txFix = stripMd(arr[1]);
        out.lines.push({
          name: nm, face: stripMd(arr[1]),
          text: txFix,
          fx: stripMd(hasFx ? arr[arr.length - 1] : ''),
          slot: slot,
          se: se,
          isNarr: !nm || nm === '旁白',
        });
      } else if (parts.length === 2 && inScope(lineStart)) {
        out.lines.push({ name: stripMd(parts[0]), face: '', text: stripMd(parts[1]), fx: '', isNarr: true });
      } else if (inScope(lineStart)) {
        // <content> 里的单字段行 (比如 AI 用 *斜体* 写的内心独白):
        // 先按旁白记着, 等确认这一楼确实是脚本再留下, 否则原样退回附加内容
        const pend = { name: '旁白', face: '', text: stripMd(s), fx: '', isNarr: true, _pend: true, _raw: rawLine.x };
        out.lines.push(pend); pendSingles.push(pend);
      } else {
        // 单字段行: 不是脚本正文, 归到附加内容 (思维链、状态栏文字都走这里)
        rest.push(rawLine.x);
      }
    }

    // 命中判定: 必须是 "名字|表情|台词" 这种三字段行, 或者显式写了 【bg:..】
    // 这样普通小说正文绝不会被劫持
    out.structured = out.lines.filter(l => !l.isNarr && !l._pend).length;
    if (out.structured === 0 && pendSingles.length) {
      // 整段都不像脚本 -> 这些行全部还给附加内容, 让酒馆按原样渲染
      for (const l of pendSingles) { const i = out.lines.indexOf(l); if (i >= 0) out.lines.splice(i, 1); rest.push(l._raw); }
      pendSingles.length = 0;
    }
    out.lines.forEach(l => { delete l._pend; delete l._raw; });

    out.rest = rest.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    out.hasPipe = out.structured > 0;
    if (out.lines.length === 0) return null;
    if (CONFIG.requirePipe && out.structured === 0 && !out.bg) return null;
    return out;
  }

  /* 总是可用: 返回 { story, rest, body }, story 可能为 null */
  function extract(raw) {
    const text = String(raw == null ? '' : raw);
    const story = parse(text);
    let rest = '';
    if (story) {
      rest = story.rest || '';
    } else {
      // 不是脚本格式: 附加内容 = 正文范围之外的部分 (正文本身交给渲染/API 转脚本)
      const br = bodyRange(text);
      rest = stripComments(text.slice(0, br.start) + '\n' + text.slice(br.end)).trim();
    }
    return { story, rest, body: bodyOf(text), range: bodyRange(text) };
  }

  /* 正文纯文本 (去标签/去注释), 用于判断"是不是散文"和送进 API 转脚本 */
  function bodyOf(text) {
    const t = String(text == null ? '' : text);
    const br = bodyRange(t);
    let body = stripComments(t.slice(br.start, br.end));
    // 只保留中文/日文/引号/常见标点的正文时, 把 <p style=..> 这类标签也去掉
    body = body.replace(/<br\s*\/?>/gi, '\n').replace(/<\/[a-zA-Z][^>]*>/g, '').replace(/<[a-zA-Z][^>]*>/g, ' ');
    return body.replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ---------------- 渲染 ---------------- */
  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function create(data, opts) {
    opts = opts || {};
    const timers = [];
    let destroyed = false;
    let idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null;
    let curBg = null;

    const root = el('div', 'gv-root' + (opts.inline ? ' gv-inline' : ''));
    const phone = el('div', 'gv-phone');
    root.appendChild(phone);

    const bgs = el('div', 'gv-bgs');
    const bgA = el('div', 'gv-bg'), bgB = el('div', 'gv-bg');
    bgs.appendChild(bgA); bgs.appendChild(bgB);
    phone.appendChild(bgs);
    phone.appendChild(el('div', 'gv-vignette'));
    const dim = el('div', 'gv-dim'); phone.appendChild(dim);
    const flash = el('div', 'gv-flash'); phone.appendChild(flash);

    /* ---------- 立绘: 一个站位一个 sprite, 支持多角色同框 ---------- */
    const stage = el('div', 'gv-stage');
    phone.appendChild(stage);
    const slotKeys = (CONFIG.slots || []).filter(Boolean);
    const sprites = {};
    function mkSprite(key) {
      const s = el('div', 'gv-sprite');
      const im = el('img');
      im.addEventListener('error', function () { im.style.display = 'none'; });   // 立绘挂了也不报错
      im.addEventListener('load', function () { im.style.display = ''; });
      s.appendChild(im);
      /* ★ 单人(站位 ≤1): 站位/落点/占位框一概不参与 —— 剧本里残留的 |left 也不能把立绘拖到左边。
         以前 pos 的判断在前面, 于是单人方案里一条 slotPos.left={x:17} 的残留就会让立绘永远偏左,
         而定位弹窗(单人时没有站位键)是居中 -> 两边永远对不上。 */
      const single = slotKeys.length <= 1;
      const i = single ? 0 : slotKeys.indexOf(key);
      /* ★ 单人连 slotPos 都不看: 方案里从多人改回单人时会剩下一堆 slotPos.left/right,
         以前"换个键继续查"照样命中残留 -> 立绘被摆到 20%, 而定位弹窗单人时是居中 50% -> 永远对不上 */
      const pos = single ? null : ((CONFIG.slotPos || {})[key] || null);
      const x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));
      const y = pos && typeof pos.y === 'number' ? pos.y : 100;
      const sc = pos && pos.scale ? pos.scale : 1;
      /* ★ 占位排版: 这一格画了框就按框站 (居中对齐框、底边贴框底、宽高就是框的宽高); 单人不用框 */
      const box = single ? null : ((CONFIG.slotBoxes || {})[key] || null);
      const hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);
      if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }
      s.style.setProperty('--gv-x', x + '%');
      s.style.setProperty('--gv-y', String(y));
      s.style.setProperty('--gv-s', String(sc));
      s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));
      s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');
      s.dataset.slot = key;
      stage.appendChild(s);
      sprites[key] = { el: s, img: im, key: key };
      return sprites[key];
    }
    function spriteFor(key) { return sprites[key] || mkSprite(key); }
    let activeSprite = mkSprite('');      // 当前说话者那张; 无站位时就是唯一的默认那张
    const img = activeSprite.img;
    if (slotKeys.length) activeSprite.el.style.display = 'none';   // 配了站位就用不到这张默认的

    const ui = el('div', 'gv-ui');
    const box = el('div', 'gv-box');
    const nameEl = el('div', 'gv-name');
    const textEl = el('p', 'gv-text');
    const caret = el('span', 'gv-caret');
    textEl.appendChild(caret);
    const next = el('div', 'gv-next', '▼');
    const uava = el('img', 'gv-uava');
    uava.style.display = 'none';
    box.appendChild(uava); box.appendChild(nameEl); box.appendChild(textEl); box.appendChild(next);
    ui.appendChild(box);
    const hud = el('div', 'gv-hud');
    const dots = el('div', 'gv-dots');
    const btns = el('div', 'gv-btns');
    const autoBtn = el('div', 'gv-btn', '自动');
    const replayBtn = el('div', 'gv-btn', '重播');
    btns.appendChild(autoBtn); btns.appendChild(replayBtn);
    hud.appendChild(dots); hud.appendChild(btns);
    ui.appendChild(hud);
    phone.appendChild(ui);

    /* ---- 自建工具条: 平时只有一个「编辑」, 点开从下方弹出气泡菜单 ---- */
    const toolbar = el("div", "gv-toolbar");
    const btnEdit = el("span", "gv-tb gv-big", "编辑");
    btnEdit.title = "操作菜单";
    const popup = el("div", "gv-popup");
    const mkP = (label, action, cls, tip) => {
      const b = el("span", "gv-tb" + (cls ? " " + cls : ""), label);
      b.title = tip || label;
      b.addEventListener("click", ev => {
        ev.stopPropagation();
        popup.classList.remove("gv-open");
        btnEdit.textContent = "编辑";
        if (action === "edit") { openEditor(); return; }
        opts.onAction && opts.onAction(action);
      });
      popup.appendChild(b);
      return b;
    };
    mkP("编辑", "edit", "gv-primary", "编辑这一楼的原文");
    mkP("复制", "copy", "", "复制这一楼内容");
    mkP("上移楼层", "up", "", "楼层上移");
    mkP("下移楼层", "down", "", "楼层下移");
    const btnUa = mkP(opts.showUserAvatar ? "关闭头像" : "显示头像", "toggle-user-avatar", "gv-toggle", "对话轮到TA说话时显示TA的头像");
    if (opts.showUserAvatar) btnUa.classList.add("gv-on");
    mkP("删除楼层", "delete", "gv-danger", "删除这一楼");
    btnEdit.addEventListener("click", ev => {
      ev.stopPropagation();
      const open = popup.classList.toggle("gv-open");
      btnEdit.textContent = open ? "关闭" : "编辑";
    });
    toolbar.append(btnEdit, popup);
    phone.appendChild(toolbar);

    /* ---- 自建编辑器 ---- */
    const editor = el("div", "gv-editor");
    const ta = document.createElement("textarea");
    ta.className = "gv-editor-ta";
    const ebtns = el("div", "gv-editor-btns");
    const bSave = el("span", "gv-tb gv-primary", "确认修改");
    const bCancel = el("span", "gv-tb", "退出修改");
    ebtns.append(bSave, bCancel);
    editor.append(ta, ebtns);
    phone.appendChild(editor);

    function openEditor() {
      ta.value = String(opts.rawText == null ? "" : opts.rawText);
      editor.classList.add("gv-open");
      ta.focus();
    }
    function closeEditor(save) {
      editor.classList.remove("gv-open");
      if (save) opts.onAction && opts.onAction("save", ta.value);
    }
    bSave.addEventListener("click", ev => { ev.stopPropagation(); closeEditor(true); });
    bCancel.addEventListener("click", ev => { ev.stopPropagation(); closeEditor(false); });
    editor.addEventListener("click", ev => ev.stopPropagation());

    const N = data.lines.length;
    for (let i = 0; i < N; i++) dots.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));

    /* 没有背景图 / 背景图 404 时都不许报错: 退回一个中性渐变 */
    /* 没有背景素材时就空着 (手机自己的底色), 不再内置演示图/演示渐变 */
    var bgTried = {};
    /* 图片按原始比例铺满一个框 (等价于 cover, 但元素保持图片本身的比例 ——
       这样缩小的时候是缩"整张图", 被裁掉的两边能露出来) */
    function coverBox(imgEl, bw, bh) {
      const nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;
      if (!nw || !nh || !bw || !bh) return;
      const ar = nw / nh, bar = bw / bh;
      let w, h;
      if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }
      imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';
    }
    /* 背景: 让 .gv-bg 这个层自己变成图片的比例 (铺满手机框), 而不是 inset:0 + cover 裁 */
    const bgNat = {};
    function sizeBg(box2, nat) {
      const pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;
      if (!nat || !nat.w || !nat.h || !pw || !ph) return;
      const ar = nat.w / nat.h, bar = pw / ph;
      let w, h;
      if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }
      box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';
      box2.style.width = w + 'px'; box2.style.height = h + 'px';
      box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';
      box2.style.backgroundSize = '100% 100%';
    }

    function setBg(bg) {
      const url = bg && bg.url ? bg.url : '';
      const fit = bg && bg.fit ? bg.fit : null;
      if (url === curBg) return;
      curBg = url;
      const showEl = bgA.classList.contains('gv-on') ? bgB : bgA;
      const hideEl = showEl === bgA ? bgB : bgA;
      function paint(u) {
        showEl.style.backgroundImage = u ? 'url("' + u + '")' : 'none';
        showEl.style.backgroundPosition = '50% 50%';
        showEl.style.backgroundSize = 'cover';
        sizeBg(showEl, bgNat[u] || null);   // 有原图尺寸就按图片比例铺满 (缩小能露两边)
        showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';
        showEl.classList.add('gv-on');
        hideEl.classList.remove('gv-on');
      }
      if (!url) { paint(null); return; }
      if (bgTried[url] === false) { paint(null); return; }   // 已经确认加载失败过
      if (bgTried[url] === true) {
        if (!bgNat[url]) { const p2 = new Image(); p2.onload = function () { bgNat[url] = { w: p2.naturalWidth, h: p2.naturalHeight }; paint(url); }; p2.src = url; }
        paint(url); return;
      }
      try {
        const probe = new Image();
        probe.onload = function () { bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };
        probe.onerror = function () { bgTried[url] = false; paint(null); };
        probe.src = url;
      } catch (e) { paint(null); }
    }

    /* ---------- 情绪气泡贴纸 ---------- */
    let curSlot = '';                     /* ★ 当前这一行的站位 (show 里赋值): 气泡按站位选落点 */
    const sticker = el('div', 'gv-sticker');
    const stickerImg = el('img');
    stickerImg.addEventListener('error', function () { stickerImg.style.display = 'none'; });
    stickerImg.addEventListener('load', function () { stickerImg.style.display = ''; });
    sticker.appendChild(stickerImg);
    phone.appendChild(sticker);
    function showSticker(name) {
      const map = CONFIG.bubbleMap || {};
      let url = map[name];
      if (!url) { const ks = Object.keys(map); if (ks.length) url = map[ks[hash(name) % ks.length]]; }
      if (!url) return;                       // 没素材就静默忽略, 不报错
      /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */
      const p = (CONFIG.bubblePosEach || {})[name]
        || (curSlot && (CONFIG.bubblePosSlot || {})[curSlot])
        || CONFIG.bubblePos || {};
      stickerImg.src = url;
      sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');
      sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');
      sticker.style.setProperty('--gv-bs', String(p.scale || 1));
      const anim = (CONFIG.bubbleAnim || {})[name] || 'pop';
      sticker.className = 'gv-sticker';
      void sticker.offsetWidth;
      sticker.classList.add('gv-on', 'gv-b-' + anim);
      timers.push(setTimeout(function () { sticker.classList.remove('gv-on'); }, CONFIG.bubbleMs || 1900));
    }

    function applyFx(fx) {
      const key = String(fx || '').trim().toLowerCase();
      if (!key) return;
      // 可能一行里写了多个效果, 用逗号/顿号分隔
      for (const piece of key.split(/[,，、+\s]+/)) {
        if (!piece) continue;
        /* bubble:名字 -> 弹情绪贴纸 (插件里配的 20 张 + 自己导入的) */
        if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {
          showSticker(piece.split(/[:：]/)[1] || '');
          continue;
        }
        /* 自定义演出组 (在制作器的「特殊演出」里做的) */
        const cust = (CONFIG.effects || {})[piece];
        if (cust) {
          const target = cust.target === 'bg' ? bgs : (cust.target === 'phone' ? phone : activeSprite.el);
          const c = cust.cls || ('gv-fx-' + piece);
          target.classList.remove(c); void target.offsetWidth; target.classList.add(c);
          timers.push(setTimeout(function () { target.classList.remove(c); }, cust.duration || 900));
          if (cust.js) { try { (new Function('el', 'ctx', cust.js))(target, { name: '', slot: '' }); } catch (e) { console.warn('[gv] 自定义演出出错', piece, e); } }
          continue;
        }
        const cls = FX[piece];
        if (!cls) continue;
        if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }

        if (cls === 'gv-bubble') {
          const b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);
          stage.appendChild(b);
          timers.push(setTimeout(() => b.remove(), 1600));
          continue;
        }
        if (cls === 'gv-flash') {
          flash.classList.remove('gv-go'); void flash.offsetWidth; flash.classList.add('gv-go');
          continue;
        }
        activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);
        timers.push(setTimeout(() => activeSprite.el.classList.remove(cls), 900));
      }
    }

    function show(i) {
      if (destroyed || i < 0 || i >= N) return;
      idx = i;
      const line = data.lines[i];
      /* 声音: 走到哪一行就把这一行该响的 BGM / 音效放出来 (【bgm:】可以中途插入) */
      if (i === 0 && !(data.bgmAt || []).length) stopBgm();     // 这一楼没有 BGM -> 把上一首停掉
      (data.bgmAt || []).forEach(function (ev) { if (ev.at === i) playBgm(ev.name); });
      (data.seAt || []).forEach(function (ev) { if (ev.at === i) playSe(ev.name); });
      if (line.se) playSe(line.se);
      const isNarr = line.isNarr || !line.name;
      const uname = String(opts.userName || '').trim();
      const lname = String(line.name == null ? '' : line.name).trim();
      /* 认"这句是不是 {{user}} 说的": 当前人设名 + 聊天里用户楼层用过的名字 (人设可能被换过,
         聊天里存的是当时的名字, 比如 "Save"), 还有各种 {{user}} 写法 */
      let aliases = opts.userAliases;
      if (!aliases) {
        aliases = [];
        try {
          const c = (typeof window !== 'undefined' && window.SillyTavern && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : null;
          if (c) {
            if (c.name1) aliases.push(String(c.name1).trim());
            const chat = c.chat || [];
            for (let i = 0; i < chat.length; i++) { const m = chat[i]; if (m && m.is_user && m.name) aliases.push(String(m.name).trim()); }
          }
        } catch (e) {}
        aliases = aliases.filter(function (s, i, a) { return !!s && a.indexOf(s) === i; });
      }
      /* ★ 角色名优先: 人设名 == 角色名时 (User 也叫「迎九」), 角色自己的台词不能被判成 User, 否则立绘不出来 */
      const _cname = String(opts.charName || '').trim() || (function () { try { return String(window.SillyTavern.getContext().name2 || '').trim(); } catch (e) { return ''; } })();
      const _isCharLine = !!_cname && lname === _cname;
      const isUser = !isNarr && !_isCharLine && (!!uname || aliases.length > 0) &&
        (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);
      /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 但样式/立绘跟旁白走 */
      const isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);
      const narrLike = isNarr || isExtra;
      nameEl.textContent = isNarr ? '旁白' : (isUser ? (liveUserName() || line.name) : line.name);
      nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');
      const uurl = isUser && opts.showUserAvatar ? (liveUserAvatar() || opts.userAvatar || '') : '';
      if (uurl) {
        if (uava.getAttribute('src') !== uurl) uava.src = uurl;   // 跟着当前人设走
        uava.style.display = ''; box.classList.add('gv-has-uava');
      } else {
        uava.style.display = 'none'; box.classList.remove('gv-has-uava');
      }
      root.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));
      textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');
      next.style.display = 'none';

      /* 站位: 选中对应的 sprite —— 多角色同框时, 非说话者淡下去 */
      const _sl = String(line.slot || '').trim().toLowerCase();
      curSlot = _sl;
      /* 旁白 / {{user}} 说的那一行 / 没匹配到立绘 -> 这行不该有立绘 (否则重播回第一行时还挂着上一个人的图) */
      const fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘
      const spk = (fentry && fentry.url) ? spriteFor(_sl) : null;
      if (spk) {
        activeSprite = spk;
        const gim = spk.img, gel = spk.el;
        const url = fentry.url;
        if (gim.getAttribute('src') !== url) {
          gim.setAttribute('src', url);   // 不做入场动画: 立绘直接换, 不闪
        }
        /* 「立绘定位」调出来的取景: translate(x%,y%) scale(s), 和制作器里看到的一致 */
        const ffit = fentry.fit || null;
        coverBox(gim, gel.clientWidth, gel.clientHeight);
        if (!gim.__gvSized) { gim.__gvSized = true; gim.addEventListener('load', function () { coverBox(gim, gel.clientWidth, gel.clientHeight); }); }
        gim.style.transformOrigin = 'center center';
        gim.style.transform = ffit
          ? ('translate(' + (ffit.x || 0) + '%, ' + (ffit.y || 0) + '%) scale(' + (ffit.scale || 1) + ')')
          : '';
        gel.style.display = '';
      }
      for (const sk in sprites) {
        const sp = sprites[sk];
        /* 这一行没有立绘(旁白等): 台上现有的立绘保持不变 —— 只有「重播」才会清空 (见 replayBtn) */
        if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }   // 说话的人有站位时, 才收起默认那张
        sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);
        if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');
      }


      // 打字机
      typing = true;
      const full = line.text || '';
      let n = 0;
      textEl.textContent = '';
      textEl.appendChild(caret);
      caret.classList.remove('gv-on');
      clearInterval(typeTimer);
      typeTimer = setInterval(() => {
        if (destroyed) { clearInterval(typeTimer); return; }
        n++;
        textEl.textContent = full.slice(0, n);
        textEl.appendChild(caret);
        if (n >= full.length) { finishTyping(); }
      }, CONFIG.typeSpeed);

      function finishTyping() {
        clearInterval(typeTimer);
        typing = false;
        textEl.textContent = full;
        textEl.appendChild(caret);
        caret.classList.add('gv-on');
        next.style.display = '';
        applyFx(line.fx);
        if (autoOn) {
          clearTimeout(autoTimer);
          autoTimer = setTimeout(() => { if (autoOn) advance(); }, CONFIG.autoDelay + full.length * 20);
        }
      }
      activeSprite.el.__finish = finishTyping;

      Array.from(dots.children).forEach((d, k) => d.classList.toggle('gv-on', k === i));
    }

    function advance() {
      if (typing) { activeSprite.el.__finish && activeSprite.el.__finish(); return; }
      if (idx + 1 < N) show(idx + 1);
      else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }
    }

    phone.addEventListener('click', () => { if (editor.classList.contains('gv-open')) return; advance(); });
    autoBtn.addEventListener('click', e => {
      e.stopPropagation();
      autoOn = !autoOn;
      autoBtn.classList.toggle('gv-active', autoOn);
      if (autoOn) advance();
    });
    replayBtn.addEventListener('click', e => {
      e.stopPropagation();
      // 重置背景以触发淡入
      curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');
      /* 重播 = 从头再演一遍: 台上立绘先清空 (旁白时不会突然消失, 只有重播才清) */
      for (const sk in sprites) { const sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }
      setBg(resolveBg(data.bg));
      show(0);
    });

    // 初始
    setBg(resolveBg(data.bg));
    timers.push(setTimeout(() => show(0), 120));

    function destroy() {
      destroyed = true;
      clearInterval(typeTimer); clearTimeout(autoTimer);
      timers.forEach(clearTimeout);
      root.remove();
    }

    return { el: root, destroy, phone,
      setUserAvatar(on) { btnUa.classList.toggle('gv-on', !!on); btnUa.textContent = on ? '关闭头像' : '显示头像'; opts.showUserAvatar = !!on; },
      setRawText(t) { opts.rawText = t; },
    };
  }

  /* ============================================================
     兜底转换用的子 API 配置
     - 持久化在 localStorage (重启酒馆/重启电脑都在, 不会写进角色卡)
     - 密钥只存在本机浏览器里, 导出角色卡不会带出去
     ============================================================ */
  var CONVERT_KEY = 'gv_convert_api_v1';
  var CONVERT_KINDS = [
    { id: 'deepseek', label: '官方 DeepSeek',    source: 'deepseek',   url: 'https://api.deepseek.com/beta',              model: 'deepseek-chat' },
    { id: 'gemini',   label: '官方 Gemini',      source: 'makersuite', url: 'https://generativelanguage.googleapis.com',  model: 'gemini-2.0-flash' },
    { id: 'claude',   label: '官方 Claude',      source: 'claude',     url: 'https://api.anthropic.com/v1',               model: 'claude-sonnet-4-5' },
    { id: 'custom',   label: '兼容 OpenAI 格式', source: 'custom',     url: '',                                           model: '' },
  ];
  var CONVERT_DEFAULT = { enabled: true, kind: 'deepseek', key: '', url: '', model: '' };

  function loadConvertCfg() {
    var c = {};
    for (var k in CONVERT_DEFAULT) c[k] = CONVERT_DEFAULT[k];
    try { var raw = localStorage.getItem(CONVERT_KEY); if (raw) { var o = JSON.parse(raw); for (var k2 in o) if (k2 in c) c[k2] = o[k2]; } } catch (e) {}
    return c;
  }
  function saveConvertCfg(c) { try { localStorage.setItem(CONVERT_KEY, JSON.stringify(c)); return true; } catch (e) { return false; } }
  function convertKind(id) { for (var i = 0; i < CONVERT_KINDS.length; i++) if (CONVERT_KINDS[i].id === id) return CONVERT_KINDS[i]; return CONVERT_KINDS[0]; }

  /* 组装成 generateRaw 的 custom_api。
     密钥留空 -> 返回 null -> 走酒馆当前的主 API; 填了 -> 用这里的子 API */
  function convertApiOf(cfg) {
    cfg = cfg || loadConvertCfg();
    var k = convertKind(cfg.kind);
    if (!String(cfg.key || '').trim()) return null;
    var api = { source: k.source };
    /* 官方源一律用它自己的地址; 自定义地址只在"兼容 OpenAI 格式"下生效,
       否则以前填过的自定义地址会污染官方源 */
    var url = (k.id === 'custom' ? String(cfg.url || '') : String(k.url || '')).trim();
    var model = (k.id === 'custom' ? String(cfg.model || '') : String(k.model || '')).trim();
    if (url) api.apiurl = url;
    if (model) api.model = model;
    if (cfg.key) api.key = String(cfg.key);
    return api;
  }
  function convertEnabled() { return loadConvertCfg().enabled !== false; }

  /* ---------- 兜底转换 API 设置弹窗 ---------- */
  function createConvertDialog(opts) {
    opts = opts || {};
    var cfg = loadConvertCfg();
    var mask = el('div', 'gv-cfg-mask');
    var box = el('div', 'gv-cfg');
    var head = el('div', 'gv-cfg-head', '兜底转换 API');
    var x = el('span', 'gv-cfg-x', '✕');
    head.appendChild(x);
    var body = el('div', 'gv-cfg-body');

    var rOn = el('div', 'gv-cfg-row');
    rOn.appendChild(el('label', '', '启用'));
    var sw = el('div', 'gv-sw' + (cfg.enabled !== false ? ' gv-on' : ''));
    rOn.appendChild(sw);

    var rKind = el('div', 'gv-cfg-row');
    rKind.appendChild(el('label', '', '服务'));
    var sel = document.createElement('select');
    CONVERT_KINDS.forEach(function (k) {
      var o = document.createElement('option'); o.value = k.id; o.textContent = k.label; sel.appendChild(o);
    });
    sel.value = cfg.kind;
    rKind.appendChild(sel);

    var rKey = el('div', 'gv-cfg-row');
    rKey.appendChild(el('label', '', '密钥'));
    var inpKey = document.createElement('input');
    inpKey.type = 'password'; inpKey.placeholder = 'sk-...'; inpKey.value = cfg.key || '';
    inpKey.setAttribute('autocomplete', 'off');
    rKey.appendChild(inpKey);

    var rUrl = el('div', 'gv-cfg-row');
    rUrl.appendChild(el('label', '', '接口地址'));
    var inpUrl = document.createElement('input');
    inpUrl.type = 'text'; inpUrl.placeholder = 'https://api.example.com/v1'; inpUrl.value = cfg.url || '';
    rUrl.appendChild(inpUrl);

    var rModel = el('div', 'gv-cfg-row');
    rModel.appendChild(el('label', '', '模型'));
    var inpModel = document.createElement('input');
    inpModel.type = 'text'; inpModel.placeholder = 'gpt-4o-mini / 留空用默认'; inpModel.value = cfg.model || '';
    rModel.appendChild(inpModel);

    var note = el('div', 'gv-cfg-note');
    body.append(rOn, rKind, rKey, rUrl, rModel, note);

    var foot = el('div', 'gv-cfg-foot');
    var bSave = el('span', 'gv-tb gv-primary', '保存');
    var bClear = el('span', 'gv-tb', '清除密钥');
    var status = el('span', 'gv-cfg-status', '');
    foot.append(bSave, bClear, status);
    box.append(head, body, foot);
    mask.appendChild(box);

    function syncRows() {
      var k = convertKind(sel.value);
      rUrl.classList.toggle('gv-hide', k.id !== 'custom');
      rModel.classList.toggle('gv-hide', k.id !== 'custom');
      inpKey.placeholder = k.id === 'deepseek' ? 'sk-... (DeepSeek 控制台的 key)'
        : k.id === 'gemini' ? 'AIza... (Google AI Studio 的 key)'
        : k.id === 'claude' ? 'sk-ant-...' : 'sk-...';
      note.textContent = inpKey.value.trim()
        ? '密钥已填 → 转换时用这里的子 API。密钥只存在本机浏览器, 不会写进角色卡。'
        : '密钥留空 → 转换时直接用酒馆当前的主 API（就是你正在聊天用的那个）。';
    }
    function collect() { return { enabled: sw.classList.contains('gv-on'), kind: sel.value, key: inpKey.value.trim(), url: inpUrl.value.trim(), model: inpModel.value.trim() }; }
    function flash(txt) { status.textContent = txt; status.classList.add('gv-show'); clearTimeout(flash._t); flash._t = setTimeout(function () { status.classList.remove('gv-show'); }, 1500); }
    var autoSave = null;
    function auto() { clearTimeout(autoSave); autoSave = setTimeout(function () { cfg = collect(); saveConvertCfg(cfg); flash('已保存'); if (opts.onChange) opts.onChange(cfg); }, 350); }

    sw.addEventListener('click', function () { sw.classList.toggle('gv-on'); auto(); });
    sel.addEventListener('change', function () { syncRows(); auto(); });
    [inpKey, inpUrl, inpModel].forEach(function (i) { i.addEventListener('input', function () { syncRows(); auto(); }); });
    bSave.addEventListener('click', function () { cfg = collect(); saveConvertCfg(cfg); flash(saveConvertCfg(cfg) ? '已保存 ✓' : '保存失败'); if (opts.onChange) opts.onChange(cfg); });
    bClear.addEventListener('click', function () { inpKey.value = ''; auto(); flash('密钥已清空'); });
    x.addEventListener('click', function () { close(); });
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });

    syncRows();
    function open() { mask.style.display = ''; }
    function close() { mask.style.display = 'none'; if (opts.onClose) opts.onClose(collect()); }
    mask.style.display = 'none';
    return { el: mask, open: open, close: close, get cfg() { return collect(); } };
  }


  /* ---------- 格式提示词弹窗 (查看/编辑要发给 AI 的那段) ---------- */
  function createPromptDialog(opts) {
    opts = opts || {};
    const mask = el('div', 'gv-cfg-mask');
    const box = el('div', 'gv-cfg gv-cfg-wide');
    const head = el('div', 'gv-cfg-head', '格式提示词（发给 AI）');
    const x = el('span', 'gv-cfg-x', '✕'); head.appendChild(x);
    const body = el('div', 'gv-cfg-body');
    const ta = document.createElement('textarea');
    ta.className = 'gv-cfg-ta'; ta.spellcheck = false;
    body.appendChild(ta);
    const note = el('div', 'gv-cfg-note', '');
    body.appendChild(note);
    const foot = el('div', 'gv-cfg-foot');
    const bSave = el('span', 'gv-tb gv-primary', '保存');
    const bReset = el('span', 'gv-tb', '恢复默认');
    const bCopy = el('span', 'gv-tb', '复制');
    const status = el('span', 'gv-cfg-status', '');
    foot.append(bSave, bReset, bCopy, status);
    box.append(head, body, foot);
    mask.appendChild(box);

    function flash(t) { status.textContent = t; status.classList.add('gv-show'); clearTimeout(flash._t); flash._t = setTimeout(() => status.classList.remove('gv-show'), 1500); }
    function refresh() {
      ta.value = opts.getPrompt ? String(opts.getPrompt() || '') : '';
      note.textContent = (opts.isPromptEdited && opts.isPromptEdited())
        ? '当前用的是【你编辑过的版本】。点「恢复默认」可以回到自动生成的版本。'
        : '这是根据素材清单【自动生成的默认版本】。改动后以你的为准，并立即重新注入。';
    }
    bSave.addEventListener('click', () => { opts.setPrompt && opts.setPrompt(ta.value); refresh(); flash('已保存 ✓'); });
    bReset.addEventListener('click', () => { opts.resetPrompt && opts.resetPrompt(); refresh(); flash('已恢复默认'); });
    bCopy.addEventListener('click', () => {
      const done = () => flash('已复制 ✓');
      try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand('copy'); done(); }); }
      catch (e) { ta.select(); document.execCommand('copy'); done(); }
    });
    x.addEventListener('click', () => close());
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    function open() { refresh(); mask.style.display = ''; }
    function close() { mask.style.display = 'none'; }
    mask.style.display = 'none';
    return { el: mask, open: open, close: close };
  }

  /* ============================================================
     P4 页面排版: 使用者自己的 HTML/CSS/JS 跑在沙箱 iframe 里
     引擎只做四件事: 准备数据 -> postMessage 喂进去 -> 接动作 -> 调尺寸
     ============================================================ */
  var GV_BRIDGE = [
    '(function(){',
    '  var ctx = { kind:"", lines:[], bg:null, cast:[], assets:{}, data:{}, size:{w:0,h:0}, index:0, ready:false, _h:{} };',
    '  ctx._post = function(t, a){ try { parent.postMessage({__gv:1, type:t, arg:a}, "*"); } catch(e){} };',
    '  ctx.setBg  = function(k){ this._post("setBg", k); };',
    '  ctx.say    = function(i){ this._post("say", i); };',
    '  ctx.next   = function(){ this._post("next"); };',
    '  ctx.prev   = function(){ this._post("prev"); };',
    '  ctx.fx     = function(n){ this._post("fx", n); };',
    '  ctx.bubble = function(n){ this._post("bubble", n); };',
    '  ctx.setSize= function(w,h){ this._post("setSize", {w:w,h:h}); };',
    '  ctx.on     = function(e,f){ (this._h[e] = this._h[e] || []).push(f); };',
    '  ctx.log    = function(){ var a=[].slice.call(arguments).map(String); try{ console.log.apply(console,a); }catch(e){} this._post("log", a); };',
    '  function fire(e,arg){ (ctx._h[e]||[]).forEach(function(f){ try{ f(arg); }catch(x){ ctx._post("error", String(x && x.message || x)); } }); }',
    '  function fit(){ try { ctx._post("resize", Math.max(24, document.documentElement.scrollHeight)); } catch(e){} }',
    '  window.ctx = ctx;',
    '  window.addEventListener("error", function(e){ ctx._post("error", String(e.message)); });',
    '  window.addEventListener("message", function(e){',
    '    var d = e.data; if (!d || d.__gv !== 1) return;',
    '    if (d.type === "init") { var __p = d.payload || d.arg || {}; for (var k in __p) ctx[k] = __p[k]; ctx.ready = true; fire("init", ctx); fit(); }',
    '    else if (d.type === "line") { ctx.index = d.arg; fire("line", d.arg); }',
    '    else { fire(d.type, d.arg); }',
    '  });',
    '  window.addEventListener("load", function(){ fit(); setTimeout(fit,120); setTimeout(fit,700); });',
    '  try { new ResizeObserver(fit).observe(document.documentElement); } catch(e){}',
    '  ctx._post("ready");',
    '})();'
  ].join('\n');

  var TPL_BASE_CSS = '*,*::before,*::after{box-sizing:border-box;}html,body{margin:0;padding:0;}' +
    'body{font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif;-webkit-tap-highlight-color:transparent;}' +
    'img{display:block;max-width:100%;}';

  function buildSrcdoc(t, libs) {
    var head = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<style>' + TPL_BASE_CSS + '\n' + String(t.css || '') + '</style>\n' + (libs ? '<style data-gv-libs="1">' + libs + '</style>\n' : '') + GV_LIB_RECV + '</head>\n<body>\n';
    var mid = String(t.html || '') + GV_FIT;
    var tail = '\n<script>' + GV_BRIDGE + '<\/script>\n<script>\ntry{\n' + String(t.js || '') + '\n}catch(e){ ctx._post("error", String(e && e.message || e)); }\n<\/script>\n</body>\n</html>';
    return head + mid + tail;
  }

  /* 把一个模板挂进容器, 返回 { frame, send, setPayload, destroy } */
  var _libsCss = null;
/* 真机这边也是"把库搬进沙箱": CSS 类的库直接内联 (FA 图标 / highlight 配色 / animate 动画) */
function gvLibsCss() {
  var list = ['/galgame/fa-inline.css', '/galgame/libs/highlight.css', '/galgame/libs/animate.css'];
  var out = '';
  return list.reduce(function (p, u) {
    return p.then(function () {
      return fetch(u, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (t) { out += '\n' + t; }).catch(function () {});
    });
  }, Promise.resolve()).then(function () { return out; });
}
function loadLibsCss() {
  if (_libsCss != null) return Promise.resolve(_libsCss);
  return gvLibsCss().then(function (t) { _libsCss = t || ''; return _libsCss; });
}
/* ★ 真机的 JS 类库: 沙箱加载不了外链脚本, 也不能用宿主造的 blob —— 引擎取字节 -> postMessage 给 iframe,
   iframe 自己造 blob 再执行 (接收器见 buildSrcdoc 里注入的 GV_LIB_RECV) */
/* ★ 自适应缩放: 容器比设计宽度(400)窄就整块缩小 (宿主注入, 老模板也自动有) */
var GV_FIT = "<script data-gv-fit=\"1\">(function(){try{if(window.__gvFit)return;window.__gvFit=1;var DW=400;try{document.documentElement.style.overflowX=\"hidden\";}catch(e){}function f(){try{var a=document.documentElement.clientWidth||0;var s=(a>0)?Math.min(1,a/DW):1;var r=document.querySelector(\".gv-root\");if(!r)return;r.style.setProperty(\"--gv-scale\",String(s));var p=document.getElementById(\"phone\");if(p){p.style.width=s<1?(DW+\"px\"):\"\";p.style.maxWidth=s<1?\"none\":\"\";p.style.flex=s<1?\"0 0 auto\":\"\";}try{document.documentElement.style.overflow=s<1?\"hidden\":\"\";}catch(e2){}var q=p?p.getBoundingClientRect():null;if(q&&q.width>40){parent.postMessage({__gv:1,type:\"frameSize\",arg:{w:Math.round(a),h:Math.round(q.height)}},\"*\");parent.postMessage({__gv:1,type:\"resize\",arg:Math.round(q.height)},\"*\");}}catch(e){}}var ph=document.getElementById(\"phone\");if(window.ResizeObserver&&ph)new ResizeObserver(f).observe(ph);window.addEventListener(\"load\",function(){setTimeout(f,300);setTimeout(f,1000)});f();}catch(e){}})();<\/script>";
var GV_LIB_RECV = "<script>(function(){window.addEventListener('message',function(e){var d=e.data;if(!d||d.__gv!==1||d.type!=='gvlibs')return;var items=d.arg||[];for(var i=0;i<items.length;i++){var it=items[i];try{var u=URL.createObjectURL(new Blob([it.buf],{type:it.mime||'application/octet-stream'}));if(it.kind==='css'){var l=document.createElement('link');l.rel='stylesheet';l.href=u;document.head.appendChild(l);}else{var s=document.createElement('script');s.src=u;document.head.appendChild(s);}}catch(x){}}});})();<\/script>";
var _libsBytes = null;
function gvLibsBytes() {
  if (_libsBytes) return Promise.resolve(_libsBytes);
  var list = [
    { kind: 'js', mime: 'text/javascript', url: '/galgame/libs/tailwind-cdn.js' },
    { kind: 'js', mime: 'text/javascript', url: '/galgame/libs/highlight.js' },
    { kind: 'js', mime: 'text/javascript', url: '/galgame/libs/mermaid.js' }
  ];
  return Promise.all(list.map(function (it) {
    return fetch(it.url, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.arrayBuffer() : null; })
      .then(function (buf) { return buf ? { kind: it.kind, mime: it.mime, buf: buf } : null; })
      .catch(function () { return null; });
  })).then(function (arr) { _libsBytes = arr.filter(Boolean); return _libsBytes; });
}

/* ★ 外链 CSS 支持 (真机这边): 模板里写的 <link href="https://..."> 一律取回来、把里面的 url(字体/图片)
   全部内联成 data:、再当成 <style> 塞进沙箱 —— 沙箱只认 data: 和它自己造的 blob:, 外链一律加载不出来 */
function gvExpandCss(txt, baseUrl) {
  var re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  var urls = []; String(txt || '').replace(re, function (m, q, u) { urls.push(u); return m; });
  var uniq = [];
  urls.forEach(function (u) {
    var s = String(u || '').trim();
    if (!s || /^(data:|blob:|#)/i.test(s)) return;
    var abs = s; try { abs = new URL(s, baseUrl).href; } catch (e) { return; }
    if (uniq.indexOf(abs) < 0) uniq.push(abs);
  });
  var w2 = {};
  uniq.forEach(function (u) { if (/\.woff2(\?|#|$)/i.test(u)) w2[u.replace(/\.woff2(\?|#|$)/i, '')] = 1; });
  var want = uniq.filter(function (u) { return !(/\.(ttf|eot|otf|svg)(\?|#|$)/i.test(u) && w2[u.replace(/\.(ttf|eot|otf|svg)(\?|#|$)/i, '')]); });
  var map = {};
  var chain = Promise.resolve();
  for (var k = 0; k < want.length; k += 4) {
    (function (slice) {
      chain = chain.then(function () {
        return Promise.all(slice.map(function (u) {
          return fetch(u, { credentials: 'same-origin' }).then(function (r) {
            if (!r.ok) return;
            return r.arrayBuffer().then(function (ab) {
              var b = new Uint8Array(ab), s2 = '';
              for (var i = 0; i < b.length; i++) s2 += String.fromCharCode(b[i]);
              map[u] = 'data:' + (r.headers.get('content-type') || 'application/octet-stream') + ';base64,' + btoa(s2);
            });
          }).catch(function () {});
        }));
      });
    })(want.slice(k, k + 4));
  }
  return chain.then(function () {
    return String(txt || '').replace(re, function (m, q, u) {
      var s = String(u || '').trim(), abs = s;
      try { abs = new URL(s, baseUrl).href; } catch (e) { return m; }
      return map[abs] ? 'url(' + map[abs] + ')' : m;
    });
  });
}
function gvInlineExternalCss(html) {
  var out = String(html || '');
  var tags = [], re = /<link\b[^>]*>/gi, m;
  while ((m = re.exec(out)) !== null) {
    var tag = m[0];
    if (!/stylesheet/i.test(tag)) continue;
    var hm = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!hm || !/^https?:/i.test(hm[1])) continue;
    tags.push({ tag: tag, href: hm[1] });
  }
  var chain = Promise.resolve();
  tags.forEach(function (it, idx) {
    chain = chain.then(function () {
      return fetch(it.href, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) return;
        return r.text().then(function (css) { return gvExpandCss(css, it.href); }).then(function (css2) {
          out = out.replace(it.tag, '<style data-gv-ext="' + idx + '">' + css2 + '</style>');
        });
      }).catch(function () {});
    });
  });
  return chain.then(function () { return out; });
}
function mountTemplate(container, kind, payload, opts) {
    var t = (CONFIG.templates || {})[kind];
    if (!t) return null;
    opts = opts || {};
    var old = container.querySelector('.gv-tpl-frame');
    if (old) old.remove();
    var f = document.createElement('iframe');
    f.className = 'gv-tpl-frame';
    f.setAttribute('sandbox', 'allow-scripts');
    f.setAttribute('allow', 'autoplay');     // 沙箱 iframe 默认没有自动播放权限, 不授的话 BGM 点了也不响
    f.setAttribute('scrolling', 'no');
    f.style.cssText = opts.canvas
      ? 'position:absolute;left:0;top:0;width:100%;height:100%;border:0;display:block;pointer-events:auto;'
      : 'width:100%;border:0;display:block;min-height:40px;height:' + (opts.minH || 40) + 'px;';
        Promise.all([loadLibsCss(), gvInlineExternalCss(t.html)]).then(function (res) {
      f.srcdoc = buildSrcdoc({ html: res[1], css: t.css, js: t.js }, res[0]);
    });
    container.appendChild(f);
    var cw = function () { try { return f.contentWindow; } catch (e) { return null; } };
    var alive = true, last = payload;
    function say(type, arg) { var w = cw(); if (w) { try { w.postMessage({ __gv: 1, type: type, arg: arg }, '*'); } catch (e) {} } }
    function setVolumes(o) { return window.Galgame ? window.Galgame.setVolumes(o) : null; }
    function onMsg(e) {
      if (!alive || e.source !== cw()) return;
      var d = e.data; if (!d || d.__gv !== 1) return;
      if (d.type === 'resize') { if (opts.canvas) return; if (!opts.fixedH) f.style.height = Math.max(opts.minH || 32, Number(d.arg) || 40) + 'px'; return; }
      /* ★ 悬浮窗要求的外框尺寸(宽+高): 模板拖动/改大小/收小球都会报 —— 以前没人接,
         于是"活动范围永远那么小 / 改大小没用 / 小球被挡住"。 */
      if (d.type === 'wantSize') {
        var _ws = d.arg || {};
        if (opts.canvas) {
          /* ★ 画布模式(悬浮窗): iframe 本来就是整个窗口, 这里只把"面板那一块"用 clip-path 抠出来。
             面板因此能拖到窗口任何角落, 面板以外的地方鼠标照样点得到聊天。
             (以前拿面板包围盒去改 iframe 宽高 -> 活动范围永远只有那一小块, 收成小球还会跑到框外点不到) */
          var _x = Math.max(0, Number(_ws.x) || 0), _y = Math.max(0, Number(_ws.y) || 0);
          var _w0 = Math.max(40, Number(_ws.w) || 0), _h0 = Math.max(40, Number(_ws.h) || 0);
          var _vw = window.innerWidth || 400, _vh = window.innerHeight || 640;
          var _rr = Math.max(0, Math.floor(_vw - _x - _w0)), _bb = Math.max(0, Math.floor(_vh - _y - _h0));
          f.style.clipPath = 'inset(' + Math.floor(_y) + 'px ' + _rr + 'px ' + _bb + 'px ' + Math.floor(_x) + 'px)';
          f.style.webkitClipPath = f.style.clipPath;
          return;
        }
        var _w = Math.max(160, Math.min(900, Number(_ws.w) || 0));
        var _h = Math.max(48, Math.min(2400, Number(_ws.h) || 0));
        if (_w) f.style.width = _w + 'px';
        if (_h && !opts.fixedH) f.style.height = _h + 'px';
        return;
      }
      if (d.type === 'ready') { try { gvLibsBytes().then(function (items) { if (items && items.length) say('gvlibs', items); }); } catch (e) {} say('init', last); if (opts.onReady) opts.onReady(); return; }
      if (d.type === 'volume') { setVolumes(d.arg); return; }        // 模板里的音量滑块
      if (d.type === 'bgmQuery') { say('bgmState', bgmState()); return; }   // 进度条
      if (d.type === 'bgmSeekPct') { seekBgmPct(d.arg); return; }
      if (d.type === 'bgmReplay') { replayBgm(); return; }
      if (d.type === 'bgmPause') { toggleBgmPause(); return; }        // 暂停 / 继续
      if (d.type === 'se') { playSe(d.arg); return; }
      if (d.type === 'bgm') { playBgm(d.arg); return; }
      if (opts.onAction) opts.onAction(d.type, d.arg);
    }
    window.addEventListener('message', onMsg);
    f.addEventListener('load', function () { say('init', last); });
    return {
      frame: f,
      send: say,
      setPayload: function (p) { last = p; say('init', p); },
      line: function (i) { say('line', i); },
      destroy: function () { alive = false; window.removeEventListener('message', onMsg); try { f.remove(); } catch (e) {} },
    };
  }

  /* ============================================================
     悬浮窗: 把每一楼"正文之外的那一大坨"集中读出来渲染
     html 由酒馆自己的显示管线产出 -> 预设正则(折叠思维链/摘要/选项按钮)全部生效
     ============================================================ */
  function createPanel(opts) {
    opts = opts || {};
    const folded = new Set();
    let rawMode = false;
    let lastEntries = [];

    const root = el('div', 'gv-panel');
    const head = el('div', 'gv-panel-head');
    const title = el('span', 'gv-panel-title', '楼层附加内容');
    const count = el('span', 'gv-panel-count', '0');
    const spacer = el('span', 'gv-panel-spacer');
    const btnRaw = el('span', 'gv-panel-btn', 'Aa'); btnRaw.title = '渲染 / 源码';
    const btnPrompt = el('span', 'gv-panel-btn', '词'); btnPrompt.title = '查看/编辑发给 AI 的格式提示词';
    const btnPack = el('span', 'gv-panel-btn', '包'); btnPack.title = '导入素材包 (.zip) —— 拿到别人做的卡时点这里';
    const btnConv = el('span', 'gv-panel-btn', '转'); btnConv.title = '兜底转换设置 (点开可以选子 API)';
    function syncConvBtn() { btnConv.classList.toggle('gv-on', convertEnabled()); }
    syncConvBtn();
    const btnRedraw = el('span', 'gv-panel-btn', '↻'); btnRedraw.title = '重绘所有楼层';
    const btnFold = el('span', 'gv-panel-btn', '–'); btnFold.title = '整体折叠';
    const btnMini = el('span', 'gv-panel-btn', '✕'); btnMini.title = '收成小球';
    head.append(title, count, spacer, btnRaw, btnPrompt, btnPack, btnConv, btnRedraw, btnFold, btnMini);
    btnConv.addEventListener('click', e => { e.stopPropagation(); dlg.open(); });
    btnPrompt.addEventListener('click', e => { e.stopPropagation(); pdg.open(); });
    btnPack.addEventListener('click', e => { e.stopPropagation(); opts.onToggle && opts.onToggle('pack'); });
    btnRedraw.addEventListener('click', e => { e.stopPropagation(); opts.onToggle && opts.onToggle('redraw'); });
    const body = el('div', 'gv-panel-body');
    root.append(head, body);

    /* ---- 自绘滚动条: Chrome 的原生条又丑、又调不动、还画不进截图, 干脆自己画一条 ---- */
    const sbSyncs = [];
    function attachScrollbar(scroller, host) {
      try {
        scroller.classList.add('gv-sbhost');
        const bar = el('div', 'gv-sb'), thumb = el('div', 'gv-sb-thumb');
        bar.appendChild(thumb); host.appendChild(bar);
        const sync = () => {
          const sh = scroller.scrollHeight, ch = scroller.clientHeight;
          if (sh <= ch + 1) { bar.style.display = 'none'; return; }
          bar.style.display = 'block';
          const r = scroller.getBoundingClientRect(), hr = host.getBoundingClientRect();
          bar.style.top = Math.round(r.top - hr.top) + 'px';
          bar.style.height = Math.round(r.height) + 'px';
          const track = Math.max(20, r.height - 8);
          const h = Math.max(26, Math.round(track * ch / sh));
          thumb.style.height = h + 'px';
          const max = sh - ch;
          const t = max > 0 ? scroller.scrollTop / max : 0;
          thumb.style.transform = 'translateY(' + Math.round(t * Math.max(0, track - h)) + 'px)';
        };
        scroller.addEventListener('scroll', sync, { passive: true });
        if (window.ResizeObserver) { const ro = new ResizeObserver(() => sync()); ro.observe(scroller); ro.observe(host); }
        setTimeout(sync, 0);
        return sync;
      } catch (e) { return function () {}; }
    }
    const sbBody = attachScrollbar(body, root);
    /* 点"转"弹出来的设置界面 (挂在面板里, 跟着面板走) */
    const dlg = createConvertDialog({ onChange: syncConvBtn, onClose: syncConvBtn });
    root.appendChild(dlg.el);
    const pdg = createPromptDialog(opts);
    root.appendChild(pdg.el);

    /* ---- 拖动 ---- */
    let drag = null, dragMoved = false;
    head.addEventListener('mousedown', e => {
      dragMoved = false;   // 每次按下都清一次, 免得上一轮拖动留下的标记把这一次点击吃掉
      /* 收成小球时整个球都是把手 (否则唯一的子元素是按钮, 一按就被挡掉 -> 拖不动) */
      if (e.target.closest('.gv-panel-btn') && !root.classList.contains('gv-mini')) return;
      const r = root.getBoundingClientRect();
      drag = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top };
      root.style.right = 'auto'; root.style.left = r.left + 'px'; root.style.top = r.top + 'px';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) dragMoved = true;
      root.style.left = Math.max(0, Math.min(window.innerWidth - 90, drag.ox + e.clientX - drag.sx)) + 'px';
      root.style.top = Math.max(0, Math.min(window.innerHeight - 60, drag.oy + e.clientY - drag.sy)) + 'px';
    });
    document.addEventListener('mouseup', () => { if (drag) { drag = null; document.body.style.userSelect = ''; } });

    /* ---- 缩放 (长按边缘拖动) ---- */
    let rs = null;
    function addHandle(cls, dir) {
      const h = el('div', 'gv-rs ' + cls);
      h.addEventListener('mousedown', e => {
        const r = root.getBoundingClientRect();
        rs = { dir, sx: e.clientX, sy: e.clientY, w: r.width, h: r.height, l: r.left };
        root.style.right = 'auto'; root.style.left = r.left + 'px';
        root.style.maxHeight = 'none';
        document.body.style.userSelect = 'none';
        e.preventDefault(); e.stopPropagation();
      });
      root.appendChild(h);
    }
    addHandle('gv-rs-e', 'e'); addHandle('gv-rs-w', 'w'); addHandle('gv-rs-s', 's'); addHandle('gv-rs-se', 'se');
    document.addEventListener('mousemove', e => {
      if (!rs) return;
      const dx = e.clientX - rs.sx, dy = e.clientY - rs.sy;
      if (rs.dir === 'e' || rs.dir === 'se') root.style.width = Math.max(220, rs.w + dx) + 'px';
      if (rs.dir === 'w') { const w = Math.max(220, rs.w - dx); root.style.width = w + 'px'; root.style.left = (rs.l + (rs.w - w)) + 'px'; }
      if (rs.dir === 's' || rs.dir === 'se') root.style.height = Math.max(90, rs.h + dy) + 'px';
    });
    document.addEventListener('mouseup', () => { if (rs) { rs = null; document.body.style.userSelect = ''; } });

    /* – = 收成小球 (黑色小球 + 猫爪肉球) */
    const PAW = '<svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">' +
      '<ellipse cx="16" cy="21" rx="7.6" ry="6.4" fill="#fff"/>' +
      '<circle cx="7.4" cy="13" r="3.2" fill="#fff"/>' +
      '<circle cx="13" cy="7.8" r="3.4" fill="#fff"/>' +
      '<circle cx="19.4" cy="7.8" r="3.4" fill="#fff"/>' +
      '<circle cx="25" cy="13" r="3.2" fill="#fff"/></svg>';
    btnFold.title = '收成小球';
    btnFold.addEventListener('click', () => {
      if (dragMoved) { dragMoved = false; return; }   // 刚才是拖球, 不是点球
      const mini = root.classList.toggle('gv-mini');
      btnFold.classList.toggle('gv-paw', mini);
      btnFold.innerHTML = mini ? PAW : '–';
      btnFold.title = mini ? '展开悬浮窗' : '收成小球';
    });
    btnRaw.addEventListener('click', () => { rawMode = !rawMode; btnRaw.classList.toggle('gv-on', rawMode); render(lastEntries); });
    /* ✕ = 关掉整个悬浮窗 (重开这个角色的聊天才会再出现) */
    btnMini.title = '关闭悬浮窗';
    btnMini.addEventListener('click', () => {
      if (dragMoved) { dragMoved = false; return; }
      if (opts.onClose) opts.onClose();
      else root.remove();
    });

    function render(entries) {
      lastEntries = entries || [];
      body.innerHTML = '';
      const shown = lastEntries.filter(e => (e.html && e.html.trim()) || (e.raw && e.raw.trim()));
      count.textContent = String(shown.length);
      if (shown.length === 0) { body.appendChild(el('div', 'gv-panel-empty', '暂无附加内容')); sbBody(); return; }

      shown.forEach(e => {
        const item = el('div', 'gv-panel-item');
        const h = el('div', 'gv-panel-item-head');
        h.append(el('b', '', '#' + e.id), el('span', 'gv-pitem-name', e.name || '旁白'),
                 el('span', 'gv-pitem-len', (e.raw ? e.raw.length : 0) + ' 字'));
        if (e.story) h.appendChild(el('span', 'gv-pitem-tag', '有剧情'));

        // 动作按钮: 对应酒馆原生 Edit 那一排
        const acts = el('div', 'gv-panel-actions');
        const mk = (label, action, danger, tip) => {
          const b = el('span', 'gv-act' + (danger ? ' gv-danger' : ''), label);
          b.title = tip || label;
          b.addEventListener('click', ev => { ev.stopPropagation(); opts.onAction && opts.onAction(action, e.id); });
          acts.appendChild(b);
        };
        mk('编辑', 'edit', false, '打开酒馆原生编辑');
        mk('复制', 'copy', false, '复制这一楼内容');
        mk('上移', 'up', false, '楼层上移');
        mk('下移', 'down', false, '楼层下移');
        mk('删除', 'delete', true, '删除这一楼');

        const content = el('div', 'gv-panel-item-body');
        if (rawMode) content.textContent = e.raw || '';
        else { renderRichInto(content, e.html || '', e.id); fitIframes(content); }

        h.addEventListener('click', () => {
          const now = !folded.has(e.id);
          if (now) folded.add(e.id); else folded.delete(e.id);
          item.classList.toggle('gv-collapsed', now);
        });
        item.append(h, acts, content);
        body.appendChild(item);
        sbSyncs.push(attachScrollbar(content, item));
      });
      sbBody();
      requestAnimationFrame(() => { sbBody(); sbSyncs.forEach(s => s()); });
    }

    return {
      el: root, setFloors: render,
      show() { root.style.display = ''; },
      hide() { root.style.display = 'none'; },
      collapse() { root.classList.add('gv-mini'); },
      destroy() { root.remove(); },
    };
  }

  /* 富渲染: 不依赖 showdown 解析围栏, 自己精确切分
     - 按三个反引号把文本切成 [普通文本] / [围栏] 交替的小段
     - 普通文本 -> markdown 渲染
     - 围栏里含 html> / <head> / <body  -> 活 iframe (酒馆助手那套)
     - 其它围栏 -> pre/code */
  /* ==GV-RICH-START== 悬浮窗富渲染: 本段必须保持自包含 —— tpl-build/sync-rich.mjs
     会把整段抄进插件(index.js)给预览用, 两边共用一套切分/围栏代码 */
  var FENCE3 = String.fromCharCode(96, 96, 96);
  var THIRD_PARTY2 =
    '<link rel="stylesheet" href="https://testingcf.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css" />' +
    '<script src="/scripts/extensions/third-party/JS-Slash-Runner/lib/tailwindcss.min.js"><\/script>' +
    '<script src="https://testingcf.jsdelivr.net/npm/jquery/dist/jquery.min.js"><\/script>' +
    '<script src="https://testingcf.jsdelivr.net/npm/jquery-ui/dist/jquery-ui.min.js"><\/script>' +
    '<link rel="stylesheet" href="https://testingcf.jsdelivr.net/npm/jquery-ui/themes/base/theme.min.css" />' +
    '<script src="https://testingcf.jsdelivr.net/npm/jquery-ui-touch-punch"><\/script>' +
    '<script src="https://testingcf.jsdelivr.net/npm/vue/dist/vue.runtime.global.prod.min.js"><\/script>' +
    '<script src="https://testingcf.jsdelivr.net/npm/vue-router/dist/vue-router.global.prod.min.js"><\/script>';

  var PRELUDE2 = [
    "(function(){",
    "  /* ★ 先探一次上级: 只有上级就是酒馆页面本身(楼里正常的活 iframe)才什么都不做。",
    "     悬浮窗里那个 iframe 的上级是面板模板 —— 它可能跨源(读不到 document), 也可能同源但根本没有 #send_textarea,",
    "     两种情况都必须装假 parent, 否则卡片点选项时 t/o 都是空, 会静默什么都不发生(2026-09-26 真机就是这个)。 */",
    "  var __gvNeedShim = false;",
    "  try {",
    "    var __gvPD = (window.parent !== window) ? window.parent.document : null;",
    "    __gvNeedShim = (window.parent !== window) && !(__gvPD && __gvPD.querySelector && __gvPD.querySelector('#send_textarea'));",
    "  } catch (e) { __gvNeedShim = (window.parent !== window); }",
    "  try { window._ = window.parent._; } catch (e) {}",
    "  try {",
    "    var id = (window.frameElement && window.frameElement.id) || window.name;",
    "    if (id) { window.__TH_IFRAME_ID = id; if (!window.name) window.name = id; }",
    "    var TH = window.parent.TavernHelper || {};",
    "    var lod = window._;",
    "    if (lod) {",
    "      var r = lod(window);",
    "      r = r.merge(lod.pick(window.parent, [\"EjsTemplate\",\"TavernHelper\",\"YAML\",\"showdown\",\"toastr\",\"z\"]));",
    "      r = r.merge(lod.omit(TH, \"_bind\"));",
    "      if (TH._bind) { r = r.merge.apply(r, Object.entries(TH._bind).map(function(kv){ var o = {}; o[kv[0].replace(\"_\",\"\")] = kv[1].bind(window); return o; })); }",
    "      r.value();",
    "      lod.set(window, \"__VUE_PROD_DEVTOOLS__\", true);",
    "      lod.set(window, \"__VUE_OPTIONS_API__\", true);",
    "      lod.set(window, \"__VUE_PROD_HYDRATION_MISMATCH_DETAILS__\", false);",
    "    }",
    "  } catch (e) { if (!__gvNeedShim) console.warn(\"gv prelude\", e); }",
    "  /* SillyTavern 单独一层 try: 上面那段拿不到上级也不该把它带走 (悬浮窗里就靠假 parent 兜底) */",
    "  try {",
    "    Object.defineProperty(window, \"SillyTavern\", { configurable: true, get: function(){",
    "      var PP = window.parent || {};",
    "      var ST = (lod && lod.get) ? lod.get(window.parent, \"SillyTavern\") : PP.SillyTavern;",
    "      if (!ST || !ST.getContext) ST = PP.SillyTavern;",
    "      if (!ST || !ST.getContext) return { getContext: function(){ return {}; } };",
    "      var g = function(){ return Object.assign({}, ST.getContext()); };",
    "      return Object.assign({}, g(), { getContext: g });",
    "    }});",
    "  } catch (e) { if (!__gvNeedShim) console.warn(\"gv prelude SillyTavern\", e); }",
    "  function fit(){ try { var h = document.body.scrollHeight; if (h > 20 && window.frameElement) window.frameElement.style.height = (h + 10) + \"px\"; try { parent.postMessage({ __gvFit: 1, h: h }, \"*\"); } catch(e2){} } catch(e){} }",
    "  window.addEventListener(\"load\", function(){ fit(); setTimeout(fit, 250); setTimeout(fit, 900); });",
    "  try { new ResizeObserver(function(){ setTimeout(fit, 50); }).observe(document.documentElement); } catch(e){}",
    "  try { new MutationObserver(function(){ setTimeout(fit, 60); }).observe(document.documentElement, { subtree: true, childList: true, attributes: true }); } catch(e){}",
    "  /* ---- ★ 沙箱里的卡片想\"点选项填进输入框\"时, 它写的是 window.parent.document.querySelector('#send_textarea')",
    "     或 window.parent.triggerSlash(...) —— 但在我们这里 window.parent 是宿主模板(独立源, 拿不到酒馆)。",
    "     所以给 window.parent / $ / TavernHelper / triggerSlash 做一层假代理, 真正的动作 postMessage 给最外层页面执行 ---- */",
    "  var __gvRealParent = window.parent;",
    "  /* ★ 只在真拿不到上级时(悬浮窗那种嵌套沙箱)才装假 parent; 楼里正常的活 iframe 是同源, 一个字节都不动 */",
    "  if (__gvNeedShim) {",
    "  function __gvCall(fn, arg) { try { window.top.postMessage({ __gvTH: 1, fn: fn, arg: arg == null ? '' : String(arg) }, '*'); } catch (e) {} }",
    "  function __gvEl() {",
    "    var el = { textContent: '', innerText: '', innerHTML: '', style: {}, dataset: {}, checked: false, disabled: false,",
    "      classList: { add: function(){}, remove: function(){}, toggle: function(){}, contains: function(){ return false; } },",
    "      setAttribute: function(){}, getAttribute: function(){ return null; }, removeAttribute: function(){},",
    "      addEventListener: function(){}, removeEventListener: function(){}, appendChild: function(){}, removeChild: function(){},",
    "      focus: function(){}, blur: function(){}, click: function(){}, select: function(){}, dispatchEvent: function(){ return true; },",
    "      querySelector: function(){ return null; }, querySelectorAll: function(){ return []; },",
    "      getBoundingClientRect: function(){ return { top: 0, left: 0, width: 0, height: 0 }; },",
    "      val: function(v){ if (v === undefined) return this.value; this.value = String(v); return this; },",
    "      text: function(){ return this; }, html: function(){ return this; }, on: function(){ return this; },",
    "      css: function(){ return this; }, attr: function(){ return this; }, prop: function(){ return this; },",
    "      show: function(){ return this; }, hide: function(){ return this; }, trigger: function(){ return this; }, off: function(){ return this; } };",
    "    try { Object.defineProperty(el, 'value', { get: function(){ return this._v || ''; }, set: function(v){ this._v = String(v); __gvCall('setInput', this._v); }, configurable: true }); } catch (e) {}",
    "    return el;",
    "  }",
    "  var __gvE = __gvEl();",
    "  var __gvBtn = __gvEl();",
    "  /* 只认酒馆那几个熟面孔: 输入框给能落笔的假元素, 发送键给不吭声的假元素(不替用户按发送) */",
    "  function __gvPick(s) { s = String(s); if (/send_textarea|send_text|chat_input|mes_text/i.test(s)) return __gvE; if (/send_but|send_button|send_form|rightSendForm/i.test(s)) return __gvBtn; return null; }",
    "  var __gvDoc = { querySelector: function(s){ return __gvPick(s); },",
    "    querySelectorAll: function(){ return []; }, getElementById: function(id){ return __gvPick(id); },",
    "    createElement: function(){ return __gvEl(); }, addEventListener: function(){}, removeEventListener: function(){},",
    "    body: __gvE, head: __gvE, documentElement: __gvE };",
    "  function __gvToastFn(){ return function(m){ __gvCall('toast', m); }; }",
    "  var __gvTH = { insertOrReplaceText: function(t){ __gvCall('setInput', t); }, insertText: function(t){ __gvCall('setInput', t); },",
    "    replaceText: function(t){ __gvCall('setInput', t); }, triggerSlash: function(c){ __gvCall('triggerSlash', c); },",
    "    formatAsTavernRegexedString: function(t){ return String(t == null ? '' : t); }, getLastMessageId: function(){ return -1; },",
    "    getChatMessages: function(){ return []; }, _bind: {} };",
    "  var __gv$ = function(){ return __gvE; };",
    "  try {",
    "    var FAKE = { document: __gvDoc, TavernHelper: __gvTH, triggerSlash: function(c){ __gvCall('triggerSlash', c); },",
    "      $: __gv$, jQuery: __gv$, console: window.console, Math: Math, JSON: JSON, Date: Date, Array: Array, Object: Object,",
    "      String: String, Number: Number, RegExp: RegExp, Promise: Promise, setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,",
    "      setInterval: window.setInterval, clearInterval: window.clearInterval, location: window.location,",
    "      toastr: { info: __gvToastFn(), success: __gvToastFn(), warning: __gvToastFn(), error: __gvToastFn() },",
    "      SillyTavern: { getContext: function(){ return { chat: [], characters: [], name1: '', name2: '', setChatInput: function(t){ __gvCall('setInput', t); } }; } },",
    "      postMessage: function(m, o){ try { __gvRealParent.postMessage(m, o || '*'); } catch (e) {} } };",
    "    try { window.parent = FAKE; } catch (e) {}",
    "    if (!window.TavernHelper) { try { window.TavernHelper = __gvTH; } catch (e) {} }",
    "    if (!window.triggerSlash) { try { window.triggerSlash = FAKE.triggerSlash; } catch (e) {} }",
    "    if (!window.$) { try { window.$ = __gv$; window.jQuery = __gv$; } catch (e) {} }",
    "    if (!window.toastr) { try { window.toastr = FAKE.toastr; } catch (e) {} }",
    "  } catch (e) { console.warn('gv fake parent', e); }",
    "  }",
    "})();"
  ].join("\n");

  function isFrontend(content) {
    return ["html>", "<head>", "<body"].some(function (t) { return String(content).indexOf(t) >= 0; });
  }
  function escHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]; });
  }

  var __gvSeq2 = 0;
  function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }
  function richFrameDoc(code) {
    return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      + '<style>*,*::before,*::after{box-sizing:border-box;}html,body{margin:0!important;padding:0;max-width:100%!important;}</style>\n'
      + THIRD_PARTY2 + '\n<script>' + PRELUDE2 + '<\/script>\n</head>\n<body>\n' + code + '\n</body>\n</html>';
  }
  /* 活 iframe 的 HTML 串 (和酒馆助手那套一致: TH-render 外壳 + TH-message-- 前缀的 id) */
  function richFrameHtml(code, messageId) {
    var id = 'TH-message--' + (messageId == null ? '0' : messageId) + '--gv' + (__gvSeq2++);
    return '<div class="TH-render gv-rich"><iframe class="gv-rich-iframe" id="' + id + '" frameborder="0" scrolling="no"'
      + ' style="width:100%;border:0;display:block;min-height:24px;height:60px;" srcdoc="' + escAttr(richFrameDoc(code)) + '"></iframe></div>';
  }

  var __md2 = null;
  function mdToHtml2(text) {
    var t = String(text == null ? "" : text);
    if (!t.trim()) return "";
    try {
      if (!__md2 && window.showdown && window.showdown.Converter) {
        __md2 = new window.showdown.Converter({ tables: true, breaks: true, literalMidWordUnderscores: true, tasklists: true });
      }
      if (__md2) return __md2.makeHtml(t);
    } catch (e) {}
    return "<p>" + escHtml(t).replace(/\n/g, "<br>") + "</p>";
  }

  /* 富渲染: 把所有围栏换成占位符 -> 整段走 markdown -> 再把占位符换回(活 iframe / 代码块)
     ★ 这里是字符串版: 悬浮窗模板跑在沙箱 iframe 里, 宿主没法把 DOM 塞进去, 只能把 HTML 串递过去。
     html 语言的围栏 = 活 iframe (和酒馆助手的表现一致), 其它语言 = pre/code */
  function richHtml(text, messageId) {
    var src = String(text == null ? '' : text);
    var holders = [];
    var re = new RegExp(FENCE3 + '([a-zA-Z0-9_-]*)[ \\t]*\\r?\\n?([\\s\\S]*?)' + FENCE3, 'g');
    var pre = src.replace(re, function (m, lang, code) {
      var token = '@@GVRICH' + holders.length + '@@';
      var l = String(lang || '').toLowerCase();
      holders.push({ front: l === 'html' || l === 'htm' || isFrontend(code), lang: lang || '', code: code });
      return '\n' + token + '\n';
    });
    var html = mdToHtml2(pre);
    if (!holders.length) return html;
    html = html.replace(/<p>\s*(@@GVRICH\d+@@)\s*<\/p>/g, '$1');
    holders.forEach(function (h, i) {
      var out = h.front ? richFrameHtml(h.code, messageId)
        : '<pre class="gv-rich-pre"><code' + (h.lang ? ' class="language-' + h.lang + '"' : '') + '>' + escHtml(h.code) + '</code></pre>';
      html = html.split('@@GVRICH' + i + '@@').join(out);
    });
    return html;
  }
  function renderRichInto(container, text, messageId) {
    container.innerHTML = richHtml(text, messageId);
  }
  /* ==GV-RICH-END== */
  /* 从父页面量 iframe 高度 (不依赖 iframe 内部的脚本) */
  function fitIframes(container) {
    var list = container.querySelectorAll('iframe.gv-rich-iframe');
    Array.prototype.slice.call(list).forEach(function (f) {
      function doFit() {
        try {
          var d = f.contentDocument;
          if (!d) return;
          var h = 0;
          if (d.body) h = d.body.scrollHeight;
          if (d.documentElement && d.documentElement.scrollHeight > h) h = d.documentElement.scrollHeight;
          var holder = f.parentElement;
          if (!h || h < 24) {
            /* 空的 iframe (比如预设的摘要卡在这条消息里没内容) -> 整块收掉, 不留空白 */
            f.style.height = '0px';
            f.style.display = 'none';
            if (holder && holder.classList.contains('gv-rich')) holder.style.display = 'none';
            return;
          }
          if (holder && holder.classList.contains('gv-rich')) holder.style.display = '';
          f.style.display = 'block';
          f.style.height = (h + 10) + 'px';
          f.setAttribute('data-gv-fit', '1');
        } catch (e) {}
      }
      f.addEventListener('load', function () { doFit(); setTimeout(doFit, 250); setTimeout(doFit, 900); });
      setTimeout(doFit, 400); setTimeout(doFit, 1200); setTimeout(doFit, 2500); setTimeout(doFit, 4500);
    });
  }

/* ---------- 自定义演出: 把用户写的 CSS 注进来, 按名字用 ---------- */
function injectEffectCss() {
  const map = CONFIG.effects || {};
  let css = '';
  for (const k in map) { const e = map[k]; if (e && e.css) css += '\n/* ' + k + ' */\n' + e.css; }
  let st = document.getElementById('gv-fx-style');
  if (!st) { st = document.createElement('style'); st.id = 'gv-fx-style'; (document.head || document.documentElement).appendChild(st); }
  st.textContent = css;
}

/* ---------- 声音: 全局只有一个 BGM + 一个音效; 音量存本机 localStorage ---------- */
const VOL_KEY = 'gv_volume_v1';
let _vol = null, _bgmEl = null, _seEl = null, _bgmName = null, _needGesture = false;
/* ★ 用户手动暂停过这首 -> 记住。切酒馆页面 / 楼层重画时宿主会再发一次同名的 bgm,
   以前这里只看"是不是正在放", 暂停状态等于没放 -> 于是自动续播(用户: 我暂停了它自己又响)。 */
let _bgmUserPaused = false;
function getVolume() {
  if (_vol) return _vol;
  const v = { bgm: 0.8, se: 0.8 };
  try { const s = JSON.parse(localStorage.getItem(VOL_KEY) || 'null');
    if (s && typeof s === 'object') { if (typeof s.bgm === 'number') v.bgm = Math.max(0, Math.min(1, s.bgm)); if (typeof s.se === 'number') v.se = Math.max(0, Math.min(1, s.se)); } } catch (e) {}
  _vol = v; return v;
}
function setVolume(kind, val) {
  const v = getVolume();
  const x = Math.max(0, Math.min(1, Number(val) || 0));
  if (kind === 'se') v.se = x; else v.bgm = x;
  try { localStorage.setItem(VOL_KEY, JSON.stringify(v)); } catch (e) {}
  try { if (_bgmEl) _bgmEl.volume = v.bgm; if (_seEl) _seEl.volume = v.se; } catch (e) {}
  return v;
}
function ensureAudio() {
  if (_bgmEl) return;
  try {
    _bgmEl = document.createElement('audio'); _bgmEl.loop = true; _bgmEl.preload = 'auto'; _bgmEl.volume = getVolume().bgm;
    _seEl = document.createElement('audio'); _seEl.preload = 'auto'; _seEl.volume = getVolume().se;
    _bgmEl.style.display = 'none'; _seEl.style.display = 'none';
    (document.body || document.documentElement).appendChild(_bgmEl);
    (document.body || document.documentElement).appendChild(_seEl);
    /* 浏览器要求"先有用户操作"才允许出声: 第一次点击/触摸时把该放的补上。
       ★ 但用户是【手动暂停】的话绝不续播 —— 以前这里不看 _bgmUserPaused, 于是点酒馆任何一个地方
         (切页面、点列表) 都会把暂停的音乐重新 play() 起来 (用户: 我暂停了它自己又响, 很烦)。 */
    const resume = () => { _needGesture = false; if (_bgmUserPaused) return; if (_bgmEl && _bgmEl.src) _bgmEl.play().catch(function () {}); };
    document.addEventListener('click', resume, true);
    document.addEventListener('touchstart', resume, true);
  } catch (e) {}
}
/* ★ 找不到音频时别装死: 进度条一直 0:00, 用户根本分不清是"没烘进脚本"还是"脚本坏了" */
var _noAudioWarned = {};
function warnNoAudio(kind, name) {
  var k = kind + '|' + name;
  if (_noAudioWarned[k]) return;
  _noAudioWarned[k] = 1;
  var msg = kind + '「' + name + '」在脚本里没有音频数据：本地文件偏大没烘进脚本（重新导出时把「本地音频上限」调大），或者它来自素材包（悬浮窗「素」→ ① 导入高清素材包）。';
  try { if (typeof toastr !== 'undefined') toastr.warning(msg, '声音', { timeOut: 8000 }); else console.warn('[gv] ' + msg); } catch (e) {}
}
function playBgm(name) {
  if (!name) return;
  const map = CONFIG.audioMap || {};
  const url = map[name];
  if (!url) { warnNoAudio('BGM', name); return; }     // 没这个音频: 提示一次, 别静默跳过
  ensureAudio(); if (!_bgmEl) return;
  if (_bgmName === name && _bgmEl.src && !_bgmEl.paused) return;   // 同一首重复出现: 不重播
  if (_bgmName === name && _bgmEl.src && _bgmUserPaused) return;   // ★ 同一首被用户暂停了: 别自动续播
  if (_bgmName !== name) _bgmUserPaused = false;                   // 换一首 = 重新开始自动播放
  _bgmName = name;
  try {
    _bgmEl.src = url;
    _bgmEl.volume = 0;
    const target = getVolume().bgm;
    const p = _bgmEl.play();
    if (p && p.catch) p.catch(function () { _needGesture = true; });
    let v = 0; const t0 = Date.now();
    const timer = setInterval(function () {
      v = Math.min(target, target * ((Date.now() - t0) / 400));       // 淡入 ~400ms
      try { _bgmEl.volume = v; } catch (e) {}
      if (v >= target || !_bgmEl) clearInterval(timer);
    }, 40);
  } catch (e) {}
}
function bgmState() {
  try { return { name: _bgmName, t: _bgmEl ? _bgmEl.currentTime : 0, dur: _bgmEl && isFinite(_bgmEl.duration) ? _bgmEl.duration : 0, paused: _bgmEl ? _bgmEl.paused : true }; } catch (e) { return { t: 0, dur: 0, paused: true }; }
}
function seekBgmPct(pct) {
  try { if (_bgmEl && isFinite(_bgmEl.duration) && _bgmEl.duration > 0) _bgmEl.currentTime = Math.max(0, Math.min(1, Number(pct) || 0)) * _bgmEl.duration; } catch (e) {}
}
function replayBgm() {
  try { if (_bgmEl && _bgmEl.src) { _bgmUserPaused = false; _bgmEl.currentTime = 0; _bgmEl.volume = getVolume().bgm; var p = _bgmEl.play(); if (p && p.catch) p.catch(function () {}); } } catch (e) {}
}
/* 暂停 / 继续: 只是停一下, 不丢当前这首 (再点一下从原地接着放) */
var _pauseAt = 0;
function toggleBgmPause() {
  try {
    var now = Date.now();
    if (now - _pauseAt < 300) return;              // 老模板可能装了两份监听 -> 只认第一条消息
    _pauseAt = now;
    if (!_bgmEl || !_bgmEl.src) return;
    if (_bgmEl.paused) { _bgmUserPaused = false; _bgmEl.volume = getVolume().bgm; var p = _bgmEl.play(); if (p && p.catch) p.catch(function () {}); }
    else { _bgmUserPaused = true; _bgmEl.pause(); }
  } catch (e) {}
}
function stopBgm() {
  _bgmUserPaused = false;
  try { if (_bgmEl) { _bgmEl.pause(); _bgmEl.removeAttribute('src'); _bgmEl.load(); } } catch (e) {}
  _bgmName = null;
}
function playSe(name) {
  if (!name) return;
  const map = CONFIG.seMap || {};
  const url = map[name];
  if (!url) { warnNoAudio('音效', name); return; }    // 同上: 提示一次
  ensureAudio(); if (!_seEl) return;
  try {
    _seEl.pause(); _seEl.currentTime = 0;            // ★ 同时只播一个: 新的把旧的停掉
    _seEl.src = url; _seEl.volume = getVolume().se;
    const p = _seEl.play();
    if (p && p.catch) p.catch(function () { _needGesture = true; });
  } catch (e) {}
}

/* ---------- 气泡演出: 制作器里"改过的内置"和"自己写的" CSS 注进来 ---------- */
function injectBubbleCss(css) {
  let st = document.getElementById('gv-bubble-style');
  if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; (document.head || document.documentElement).appendChild(st); }
  st.textContent = String(css || '');
}

  window.Galgame = {
    version: 1,
    /* P4: 三层页面模板 { char:{html,css,js}, user:{...}, panel:{...} }, 为空则用引擎自带长相 */
    setTemplates(t) { if (t && typeof t === 'object') CONFIG.templates = t; },
    mountTemplate: mountTemplate,
  GV_LIB_RECV: GV_LIB_RECV,
  gvLibsBytes: gvLibsBytes,
    buildSrcdoc: buildSrcdoc,
    CONFIG, parse, extract, bodyRange, bodyOf, stripComments,
    /* 脚本(或导出的脚本)可以覆盖站位关键词和每个站位的落点 */
    setSlots(list) { if (Array.isArray(list)) CONFIG.slots = list.map(function (x) { return String(x).trim().toLowerCase(); }).filter(Boolean); },
    setSlotPos(map) { if (map && typeof map === 'object') CONFIG.slotPos = map; },
    /* ★ 占位排版: { 站位: {x,y,w,h} } (百分比) */
    setSlotBoxes(map) { if (map && typeof map === 'object') CONFIG.slotBoxes = map; },
    /* 素材包导入后用: { bg: {关键词: {url,fit}}, face: {'角色|情绪': url}, bubble: {key: url} } */
    setAssets(a) {
      if (!a) return;
      if (a.bg && Object.keys(a.bg).length) { CONFIG.bgMap = a.bg; }
      if (a.face && Object.keys(a.face).length) { CONFIG.faceMap = a.face; CONFIG.facePool = Object.values(a.face).map(function (v) { return normEntry(v).url; }); }
      if (a.bubble) CONFIG.bubbleMap = a.bubble;
      if (a.audio) CONFIG.audioMap = a.audio;
      if (a.se) CONFIG.seMap = a.se;
    },
    /* 制作器做的自定义演出: { 名字: {css, cls, target, duration, js} } */
    setEffects(map) { if (map && typeof map === 'object') { CONFIG.effects = map; injectEffectCss(); } },
    /* 声音: 全局一个 BGM + 一个音效; 音量存本机 */
    playBgm: playBgm, playSe: playSe, stopBgm: stopBgm, bgmState: bgmState, seekBgmPct: seekBgmPct, replayBgm: replayBgm, getVolume: getVolume,
    setVolume: function (kind, val) { return setVolume(kind, val); },
    setVolumes: function (o) { if (!o) return getVolume(); if (o.bgm != null) setVolume('bgm', o.bgm); if (o.se != null) setVolume('se', o.se); return getVolume(); },
    /* 气泡外观: {pos:{x,y,scale}, anim:{贴纸名:动画名}, ms} */
    setBubbles(o) {
      if (!o) return;
      if (o.pos) CONFIG.bubblePos = o.pos;
      if (o.posEach) CONFIG.bubblePosEach = o.posEach;
      if (o.posSlot) CONFIG.bubblePosSlot = o.posSlot;   /* 每个站位一套气泡落点 */
      if (o.anim) CONFIG.bubbleAnim = o.anim;
      if (o.ms) CONFIG.bubbleMs = o.ms;
      if (o.css != null) injectBubbleCss(o.css);     // 改过的内置气泡演出 / 自己写的
    },
    injectEffectCss: injectEffectCss,
    refreshUserAvatars: refreshUserAvatars,
    liveUserAvatar: liveUserAvatar,
    resolveBg: resolveBg, resolveFace: resolveFace,
    loadConvertCfg, saveConvertCfg, convertApiOf, convertEnabled, createConvertDialog, createPromptDialog, create, createPanel, renderRichInto, richHtml, fitIframes, resolveBg, resolveFace,
    /* 直接渲染一段脚本文本到指定容器, 便于独立测试 */

    renderTo(container, text, opts) {
      const data = parse(text);
      if (!data) return null;
      const app = create(data, opts);
      container.innerHTML = '';
      container.appendChild(app.el);
      return app;
    },
  };
})();
