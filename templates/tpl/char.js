/* ============================================================
   卡里那套楼层界面 —— 引擎 create() 的模板版
   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post
   ============================================================ */
var TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;
var timers = [], destroyed = false;
var idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;
var slotKeys = [], sprites = {}, activeSprite = null;

function $(id){ return document.getElementById(id); }
function el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
function normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }
/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */
function coverBox(imgEl, bw, bh){
  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;
  if (!nw || !nh || !bw || !bh) return;
  var ar = nw / nh, bar = bw / bh, w, h;
  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }
  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';
}

var FX = {
  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',
  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',
  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',
  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',
  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',
  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',
  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',
};

/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */
function _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }
/* ★ 宿主有时只传"用得到的那几张", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),
   否则名字再对也查不到, 直接显示空背景 */
function _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }
function _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }
/* ★ 以前对不上名字会 hash 兜底"随便挑一张": 结果是不管消息里写什么背景/表情, 永远显示同一张,
   用户完全看不出是"名字对不上"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */
var _missWarned = {};
function warnMissing(kind, name, table){
  var ks = [], k;
  for (k in (table || {})) ks.push(k);
  if (!ks.length) return;
  if (_missWarned[kind + '|' + name]) return;
  _missWarned[kind + '|' + name] = 1;
  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';
  try { console.warn('[gv] ' + msg); } catch (e) {}
  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}
}
function resolveBg(key){
  var m = _bgT(), k, pat;
  if (!key) return null;
  k = _bare(key);
  /* ★ 去扩展名 + 互相包含: 包里叫"主殿.png"、剧本写"主殿" 也要能对上 */
  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }
  warnMissing('背景', key, m);
  return null;
}
function facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }
function resolveFace(key, name){
  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;
  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }
  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }
  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);
  return null;
}
function resolveFaceEntry(key, name){
  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;
  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }
  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }
  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */
  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }
  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);
  return null;
}
/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */
function hasFaceFor(key, name){
  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;
  if (!nm) return false;
  if (k && (m[nm + '|' + k] || m[k])) return true;
  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }
  return false;
}
function resolveAccent(name){
  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];
  return pool[hash(String(name)) % pool.length];
}


try { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}
var caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');
var bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');
/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,
    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */
var phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');
/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */
var dotsBox = $('dots');

/* ---- 立绘: 一个站位一个 sprite ---- */
function mkSprite(key){
  var s = el('div', 'gv-sprite'), im = el('img');
  im.addEventListener('error', function(){ im.style.display = 'none'; });
  im.addEventListener('load', function(){ im.style.display = ''; });
  s.appendChild(im);
  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */
  var single = slotKeys.length <= 1;
  var i = single ? 0 : slotKeys.indexOf(key);
  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看
  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));
  var y = pos && typeof pos.y === 'number' ? pos.y : 100;
  var sc = pos && pos.scale ? pos.scale : 1;
  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */
  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);
  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);
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
function spriteFor(key){ return sprites[key] || mkSprite(key); }

/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */
var BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */
var bgTried = {}, bgNat = {};
/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */
function sizeBg(box2, nat){
  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;
  if (!nat || !nat.w || !nat.h || !pw || !ph) return;
  var ar = nat.w / nat.h, bar = pw / ph, w, h;
  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }
  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';
  box2.style.width = w + 'px'; box2.style.height = h + 'px';
  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';
  box2.style.backgroundSize = '100% 100%';
}
function setBg(bg){
  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;
  if (url === curBg) return;
  curBg = url;
  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;
  var hideEl = showEl === bgA ? bgB : bgA;
  function paint(u){
    if (u) { showEl.style.backgroundImage = 'url("' + u + '")'; showEl.style.backgroundColor = ''; }
    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑
    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }
    showEl.style.backgroundPosition = '50% 50%';
    showEl.style.backgroundSize = 'cover';
    sizeBg(showEl, bgNat[u] || null);
    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';
    showEl.classList.add('gv-on');
    hideEl.classList.remove('gv-on');
  }
  if (!url) { paint(null); return; }
  if (bgTried[url] === false) { paint(null); return; }
  if (bgTried[url] === true) { paint(url); return; }
  try {
    var probe = new Image();
    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };
    probe.onerror = function(){ bgTried[url] = false; paint(null); };
    probe.src = url;
  } catch (e) { paint(null); }
}

/* ---- 情绪气泡贴纸 ---- */
var sticker = $('sticker'), stickerImg = $('stickerImg');
function showSticker(name){
  var map = ctx.bubbles || {}, url = map[name];
  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */
  if (!url) return;
  /* 单个贴纸单独调过落点就用它自己的 (制作器「切换气泡」里一个个摆的), 否则用默认 */
  var p = (ctx.bubblePosEach || {})[name] || ctx.bubblePos || {};
  stickerImg.src = url;
  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');
  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');
  sticker.style.setProperty('--gv-bs', String(p.scale || 1));
  var anim = (ctx.bubbleAnim || {})[name] || 'pop';
  sticker.className = 'gv-sticker';
  void sticker.offsetWidth;
  sticker.classList.add('gv-on', 'gv-b-' + anim);
  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));
}

function applyFx(fx){
  var key = String(fx || '').trim().toLowerCase();
  if (!key) return;
  var pieces = key.split(/[,，、+\s]+/), i;
  for (i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    if (!piece) continue;
    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {
      showSticker(piece.split(/[:：]/)[1] || '');
      continue;
    }
    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。
       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */
    var cust = (ctx.effects || {})[piece];
    if (cust) {
      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);
      var cc = cust.cls || ('gv-fx-' + piece);
      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);
      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);
      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }
      continue;
    }
    var cls = FX[piece];
  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出
    if (!cls) continue;
    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }
    if (cls === 'gv-bubble') {
      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);
      stage.appendChild(b);
      timers.push(setTimeout(function(){ b.remove(); }, 1600));
      continue;
    }
    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }
    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);
    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);
  }
}

function show(i){
  if (destroyed || i < 0 || i >= N) return;
  idx = i;
  var L = ctx.lines || [], line = L[i];
  var isNarr = !line.name || line.name === '旁白';
  var uname = String(ctx.userName || '').trim();
  var aliases = ctx.userAliases || [];
  var lname = String(line.name == null ? '' : line.name).trim();
  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——
     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */
  var cname = String(ctx.charName || '').trim();
  var isCharLine = !!cname && lname === cname;
  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&
    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);
  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */
  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);
  var narrLike = isNarr || isExtra;
  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名
  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');
  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }
  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }
  var rootEl = document.querySelector('.gv-root');
  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));
  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');
  nextEl.style.display = 'none';

  /* 站位: 说话的那张亮, 其它淡下去 */
  var sl = String(line.slot || '').trim().toLowerCase();
  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */
  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘
  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;
  if (spk) {
    activeSprite = spk;
    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画
    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */
    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);
    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }
    var ff = fentry.fit || null;
    spk.img.style.transformOrigin = 'center center';
    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';
    spk.el.style.display = '';
  }
  for (var sk in sprites) {
    var sp = sprites[sk];
    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */
    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }
    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);
    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');
  }

  /* 声音: 这一步该响的 BGM / 音效。
     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);
       拿不到 data: 再交给宿主 (真机上是引擎在放) */
  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->
     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。
     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */
  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });
  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });
  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */
  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });
  if (line.se && typeof playSe === 'function') playSe(line.se);

  /* 打字机 */
  typing = true;
  var full = String(line.text || ''), n = 0;
  textEl.textContent = '';
  textEl.appendChild(caret);
  caret.classList.remove('gv-on');
  clearInterval(typeTimer);
  function finishTyping(){
    clearInterval(typeTimer);
    typing = false;
    textEl.textContent = full;
    textEl.appendChild(caret);
    caret.classList.add('gv-on');
    nextEl.style.display = '';
    applyFx(line.fx);
    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }
  }
  typeTimer = setInterval(function(){
    if (destroyed) { clearInterval(typeTimer); return; }
    n++;
    textEl.textContent = full.slice(0, n);
    textEl.appendChild(caret);
    if (n >= full.length) finishTyping();
  }, TYPESPEED);
  activeSprite.__finish = finishTyping;

  var ds = dotsBox.children;
  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);
}

function advance(){
  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }
  if (idx + 1 < N) show(idx + 1);
  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }
}
phone.addEventListener('click', function(){
  /* ★ 浏览器要求"先有用户操作"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */
  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}
  if (editor.classList.contains('gv-open')) return; advance();
});
autoBtn.addEventListener('click', function(e){
  e.stopPropagation();
  autoOn = !autoOn;
  autoBtn.classList.toggle('gv-active', autoOn);
  if (autoOn) advance();
});
replayBtn.addEventListener('click', function(e){
  e.stopPropagation();
  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');
  /* 重播: 台上立绘先清空 */
  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }
  setBg(resolveBg(ctx.bg));
  show(0);
});

/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */
btnEdit.addEventListener('click', function(e){
  e.stopPropagation();
  var open = popup.classList.toggle('gv-open');
  btnEdit.textContent = open ? '关闭' : '编辑';
});
Array.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){
  b.addEventListener('click', function(e){
    e.stopPropagation();
    var a = b.getAttribute('data-a');
    popup.classList.remove('gv-open');
    btnEdit.textContent = '编辑';
    if (a === 'edit') { openEditor(); return; }
    if (a === 'volume') { toggleVol(); return; }
    ctx._post(a);
  });
});
function buildRaw(){
  var L = ctx.lines || [], out = [];
  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');
  for (var i = 0; i < L.length; i++) {
    var l = L[i];
    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));
    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));
  }
  return out.join('\n');
}
function openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }
function tplToast(msg){
  var t = el('div', 'gv-tpl-toast', msg);
  phone.appendChild(t);
  setTimeout(function(){ t.remove(); }, 5000);
}
function closeEditor(save){
  editor.classList.remove('gv-open');
  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示
}
ctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });
$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });
$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });
editor.addEventListener('click', function(e){ e.stopPropagation(); });

function initAll(){
  timers.forEach(clearTimeout); timers = []; destroyed = false;
  slotKeys = (ctx.slots || []).filter(Boolean);
  stage.innerHTML = ''; sprites = {};
  activeSprite = mkSprite('');
  if (slotKeys.length) activeSprite.el.style.display = 'none';
  N = (ctx.lines || []).length;
  dotsBox.innerHTML = '';
  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));
  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }
  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }
  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');
  setBg(resolveBg(ctx.bg));
  timers.push(setTimeout(function(){ show(0); }, 120));
}
/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */
var DESIGN_W = 400;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */
function autoFit(){
  try {
    var avail = document.documentElement.clientWidth || 0;
    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;
    var root = document.querySelector('.gv-root');
    if (root) root.style.setProperty('--gv-scale', String(s));
    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */
    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }
    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }
    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */
    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}
    return s;
  } catch (e) { return 1; }
}
function reportSize(){
  try {
    var s = autoFit();
    var avail = document.documentElement.clientWidth || 0;
    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */
    if (r.width > 40) {
      /* ★ 宽度只报【容器宽】: 把"缩放后的手机宽"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)
         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */
      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}
      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */
      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });
      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */
    }
  } catch (e) {}
}
/*gv-audio*/
/* ---- 声音: 自己播 (data: 能用就自己放, 否则叫宿主) ----
   __gvAudioV4__  ← 这一块的"新版"标记。必须落在这段的【截取范围内】:
   插件给老方案补这一块时靠它判断补没补过, 标记在范围外 -> 每次打开插件都会再补一份 (老方案的 JS 被叠过几十份)
   ★ 自检: window.__gvAudio 里记着调用/命中/播放次数, 探针能直接看是哪一步没走到 */
/* 老快照(页面排版里存过的)可能没有 $ 的定义 -> 这一整块一开头就 ReferenceError, 什么都装不上。
   这里补一个兜底: 没有就自己造一个 (有就什么都不做) */
try { if (typeof window.$ !== 'function') window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}
var bgmEl = null, seEl = null, bgmNow = '';
window.__gvAudio = { calls: 0, miss: 0, played: 0, se: 0, err: '', ready: false };
function volNow(){ var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : {}; return { bgm: c.bgm == null ? .8 : c.bgm, se: c.se == null ? .8 : c.se }; }
function ensureAudio(){ if (bgmEl) return true; try { bgmEl = new Audio(); bgmEl.loop = true; seEl = new Audio(); window.__gvAudio.ready = true; return true; } catch (e) { window.__gvAudio.err = String(e); return false; } }
function hasLocalAudio(){ return !!(ctx.audioBgm && Object.keys(ctx.audioBgm).length) || !!(ctx.audioSe && Object.keys(ctx.audioSe).length); }
/* __gvAudioV2__ : 沙箱 iframe 是独立源, 默认没有自动播放权限 -> 自己 play() 永远 NotAllowedError。
   所以声音一律由【宿主】放: 预览里是插件(普通源), 真机上是引擎。 */
function playBgm(name, tries){
  window.__gvAudio.calls++;
  if (!name) return;
  bgmNow = name;
  ctx._post('bgm', name);
}
function playBgmLocal(name){
  var u = (ctx.audioBgm || {})[name];
  if (!u) return;
  if (!ensureAudio()) return;
  if (bgmEl.src && !bgmEl.paused) return;
  bgmEl.src = u; bgmEl.volume = volNow().bgm;
  try { bgmEl.play().catch(function(){}); } catch (e) {}
}
function playSe(name, tries){
  if (!name) return;
  ctx._post('se', name);                 // 同样交给宿主放
  window.__gvAudio.se++;
}

/*gv-audio*/
/* ---- 音量: 两个滑块, 拖到 0 = 静音; 自己放的话直接改自己的音量, 值也给宿主存 ---- */
function toggleVol(){ var v = $('vol'); if (!v) return;
  /* ★ 一次点击只认一次: 老方案里这块代码被补过重复的 [data-a] 处理器, 点一下会 toggle 两三回
     -> 音量面板"闪一下就没了"。150ms 内的重复调用直接吞掉 (真手速不可能这么快) */
  var _tv = Date.now();
  if (toggleVol.__at && _tv - toggleVol.__at < 150) return;
  toggleVol.__at = _tv;
  v.classList.toggle('gv-open');
  if (v.classList.contains('gv-open')) { syncVol(); try { ctx._post('bgmQuery'); } catch (e) {}
    if (!volTimer) volTimer = setInterval(volPoll, 600); }
  else if (volTimer) { clearInterval(volTimer); volTimer = null; } }
/* ★ 独立监听: 老模板里的 [data-a] 处理器不认识 volume, 这里自己兜住 (它多发的那条消息无害) */
try {
  var _vbtn = document.querySelector('[data-a="volume"]');
  if (_vbtn) _vbtn.addEventListener('click', function (e) { e.stopPropagation(); setTimeout(toggleVol, 0); });
} catch (e) {}
function syncVol(){
  var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : { bgm: 0.8, se: 0.8 };
  var b = $('volBgm'), s = $('volSe');
  if (b) { b.value = String(Math.round((c.bgm != null ? c.bgm : 0.8) * 100)); }
  if (s) { s.value = String(Math.round((c.se != null ? c.se : 0.8) * 100)); }
  volLabel();
}
function volLabel(){
  var b = $('volBgm'), s = $('volSe'), bp = $('volBgmPc'), sp = $('volSePc');
  if (bp && b) bp.textContent = b.value + '%';
  if (sp && s) sp.textContent = s.value + '%';
}
/* ---- 进度条 + 重播: 音频在宿主那边, 所以靠消息问/发 ---- */
var volTimer = null, volDragging = false;
function fmtT(sec){ sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
function volPoll(){
  if (!($('vol') || {}).classList || !$('vol').classList.contains('gv-open')) { clearInterval(volTimer); volTimer = null; return; }
  if (!volDragging) ctx._post('bgmQuery');
}
ctx.on('bgmState', function (st) {
  st = st || {};
  var r = $('volPos'); if (!r) return;
  var dur = Number(st.dur) || 0, t = Number(st.t) || 0;
  if (dur > 0) r.value = String(Math.round(t / dur * 1000));
  var pc = $('volPosPc'); if (pc) pc.textContent = fmtT(t) + ' / ' + fmtT(dur);
  r.disabled = !dur;
});
$('volPos').addEventListener('pointerdown', function () { volDragging = true; });
$('volPos').addEventListener('pointerup', function () { volDragging = false; });
$('volPos').addEventListener('input', function (e) {
  e.stopPropagation();
  ctx._post('bgmSeekPct', Number(this.value) / 1000);
});
$('volReplay').addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmReplay'); });
/*gv-pause*/
/* ---- 暂停 / 继续: 音频在宿主那边放, 所以点一下发条消息让它停 / 接着放 ----
   按钮用 JS 造 (不依赖 HTML), 老模板补丁也能把这一整块追加进去 */
try {
  var _vp = $('volPause');
  if (!_vp) {
    _vp = document.createElement('span');
    _vp.id = 'volPause'; _vp.className = 'gv-vol-btn'; _vp.textContent = '暂停';
    _vp.title = '暂停 / 接着放 BGM';
    var _vpRow = $('volReplay') ? $('volReplay').parentNode : null;
    if (_vpRow) _vpRow.appendChild(_vp);
  }
  /* ★ 老快照可能被补过不止一份 -> 装过的就别再装一遍 (两份监听 = 点一下发两条 = 停了又接着放) */
  if (!_vp.__gvPauseOn) {
    _vp.__gvPauseOn = 1;
    _vp.addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmPause'); });
  }
  if (!ctx.__gvPauseLabel) {
    ctx.__gvPauseLabel = 1;
    ctx.on('bgmState', function (st) {
      try { var b = $('volPause'); if (b && st && typeof st.paused === 'boolean') b.textContent = st.paused ? '继续' : '暂停'; } catch (e) {}
    });
  }
} catch (e) {}
/*/gv-pause*/
/* ★ 面板右上角的关闭按钮 (用 JS 造, 老模板也能自动拿到, 不会重复插一份面板) */
try {
  var _vbox = $('vol');
  if (_vbox && !$('volX')) {
    var _vx = document.createElement('span');
    _vx.id = 'volX'; _vx.className = 'gv-vol-x'; _vx.textContent = '×'; _vx.title = '关闭音量面板';
    _vx.addEventListener('click', function (e) {
      e.stopPropagation();
      $('vol').classList.remove('gv-open');
      if (volTimer) { clearInterval(volTimer); volTimer = null; }
    });
    _vbox.appendChild(_vx);
  }
} catch (e) {}
$('volBgm').addEventListener('input', function(e){ e.stopPropagation(); volLabel();
  var v = { bgm: Number(this.value) / 100, se: Number($('volSe').value) / 100 };
  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;
  ctx._post('volume', v); });
$('volSe').addEventListener('input', function(e){ e.stopPropagation(); volLabel();
  var v = { bgm: Number($('volBgm').value) / 100, se: Number(this.value) / 100 };
  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;
  ctx._post('volume', v); });
$('vol').addEventListener('click', function(e){ e.stopPropagation(); });

/*/gv-audio*/
ctx.on('init', function(){
  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */
  /*gv-audio*/ try { var b0 = (ctx.bgmAt || [])[0]; if (b0) playBgm(b0.name); else ctx._post('bgm', ''); } catch (e) {} /*/gv-audio*/
  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */
  try {
    var st = document.getElementById('gv-bubble-style');
    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }
    st.textContent = String(ctx.bubbleCss || '');
  } catch (e) {}
  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */
  try {
    var _fxm = ctx.effects || {}, _fxc = '', _fxk;
    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\n/* ' + _fxk + ' */\n' + _fxm[_fxk].css; }
    var sfe = document.getElementById('gv-fx-style');
    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }
    sfe.textContent = _fxc;
  } catch (e) {}
  initAll(); setTimeout(reportSize, 220);
});
ctx.on('openEditor', function(){ openEditor(); });
/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */
try { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}
window.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });
ctx.on('line', function(n){ show(n); });
ctx.on('fx', function(n){ applyFx(n); });
ctx.on('bubble', function(n){ applyFx('bubble:' + n); });