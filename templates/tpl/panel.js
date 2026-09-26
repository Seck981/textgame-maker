/* 悬浮窗: 卡里那套 + 自带页面(词/转/包), 宿主接不接都能用 */
var folded = {}, rawMode = false, lastEntries = [], foldedAll = false, dragMoved = false;
function $(id){ return document.getElementById(id); }
function el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
var root = $('panel'), body = $('body'), count = $('count');

/* ---- 富渲染出来的活 iframe: 高度由它里面那段 prelude 用 postMessage 报过来 ----
   沙箱里读不到 iframe 的 contentDocument, 所以只能让它自己报 (真机/预览同一套) */
window.addEventListener('message', function(ev){
  var d = ev.data; if (!d || d.__gvFit !== 1) return;
  var h = Math.max(0, Math.round(Number(d.h) || 0));
  var list = body.querySelectorAll('iframe.gv-rich-iframe');
  for (var i = 0; i < list.length; i++) {
    if (list[i].contentWindow !== ev.source) continue;
    list[i].style.height = (h > 24 ? h + 10 : 0) + 'px';
    list[i].style.display = h > 24 ? 'block' : 'none';
    var holder = list[i].parentElement;
    if (holder && holder.classList && holder.classList.contains('gv-rich')) holder.style.display = h > 24 ? '' : 'none';
    try { if (typeof sbBody === 'function') { sbBody(); sbSyncs.forEach(function(s){ s(); }); } } catch (e) {}
  }
});

/* ---- 自绘滚动条 (和卡里一个样式): 原生那条 Chrome 画得丑 ---- */
var sbSyncs = [];
function attachScrollbar(scroller, host){
  try {
    scroller.classList.add('gv-sbhost');
    var bar = el('div', 'gv-sb'), thumb = el('div', 'gv-sb-thumb');
    bar.appendChild(thumb); host.appendChild(bar);
    var sync = function(){
      var sh = scroller.scrollHeight, ch = scroller.clientHeight;
      if (sh <= ch + 1) { bar.style.display = 'none'; return; }
      bar.style.display = 'block';
      var r = scroller.getBoundingClientRect(), hr = host.getBoundingClientRect();
      bar.style.top = Math.round(r.top - hr.top) + 'px';
      bar.style.height = Math.round(r.height) + 'px';
      var track = Math.max(20, r.height - 8);
      var h = Math.max(26, Math.round(track * ch / sh));
      thumb.style.height = h + 'px';
      var max = sh - ch;
      var t = max > 0 ? scroller.scrollTop / max : 0;
      thumb.style.transform = 'translateY(' + Math.round(t * Math.max(0, track - h)) + 'px)';
    };
    scroller.addEventListener('scroll', sync, { passive: true });
    if (window.ResizeObserver) { var ro = new ResizeObserver(function(){ sync(); }); ro.observe(scroller); ro.observe(host); }
    setTimeout(sync, 0);
    return sync;
  } catch (e) { return function(){}; }
}
var sbBody = attachScrollbar(body, root);
var sheet = $('sheet'), sheetTitle = $('sheetTitle'), sheetBody = $('sheetBody'), sheetFoot = $('sheetFoot');

/* ---------- 页面容器 ---------- */
function openSheet(title, nodes, buttons){
  sheetTitle.textContent = title;
  sheetBody.innerHTML = '';
  nodes.forEach(function(n){ sheetBody.appendChild(n); });
  sheetFoot.innerHTML = '';
  (buttons || []).forEach(function(b){ sheetFoot.appendChild(b); });
  sheet.classList.add('on');
  fitSelf();
}
function closeSheet(){ sheet.classList.remove('on'); }
$('sheetX').addEventListener('click', closeSheet);

function row(label, node){
  var r = el('div', 'gv-sheet-row');
  r.appendChild(el('label', '', label));
  r.appendChild(node);
  return r;
}
function btn(label, primary, fn){
  var b = el('span', 'gv-tb' + (primary ? ' gv-primary' : ''), label);
  b.addEventListener('click', fn);
  return b;
}
function flash(msg, fail){
  var t = el('div', 'gv-sheet-toast' + (fail ? ' bad' : ''), msg);
  (sheet.classList.contains('on') ? sheet : root).appendChild(t);
  setTimeout(function(){ t.remove(); }, 5000);
}

/* ---------- 词: 提示词 ---------- */
function openPrompt(){
  var ta = document.createElement('textarea');
  ta.className = 'gv-sheet-ta';
  ta.spellcheck = false;
  ta.value = String(ctx.prompt || '');
  ta.placeholder = '这里是发给 AI 的格式提示词（插件里「提示词」页生成的那份）';
  var note = el('div', 'gv-sheet-note', '没有宿主时这里显示的是插件传进来的提示词；有宿主(角色脚本)时保存会真的写回去。');
  openSheet('格式提示词', [ta, note], [
    btn('保存', true, function(){ ctx._post('setPrompt', ta.value); }),
    btn('复制', false, function(){ try { ta.select(); document.execCommand('copy'); flash('已复制'); } catch (e) {} }),
    btn('关闭', false, closeSheet),
  ]);
}
/* ---------- 转: 兜底转换 API ---------- */
var CONV_KINDS = [['deepseek', '官方 DeepSeek'], ['gemini', '官方 Gemini'], ['claude', '官方 Claude'], ['custom', '兼容 OpenAI 格式']];
function openConvert(){
  var cfg = ctx.convertCfg || {};
  var sw = el('div', 'gv-sw' + (cfg.enabled !== false ? ' gv-on' : ''));
  sw.addEventListener('click', function(){ sw.classList.toggle('gv-on'); });
  var sel = document.createElement('select');
  CONV_KINDS.forEach(function(k){ var o = document.createElement('option'); o.value = k[0]; o.textContent = k[1]; sel.appendChild(o); });
  sel.value = cfg.kind || 'deepseek';
  var key = document.createElement('input'); key.type = 'password'; key.placeholder = 'sk-...（留空 = 用酒馆当前的主 API）'; key.value = cfg.key || '';
  var url = document.createElement('input'); url.type = 'text'; url.placeholder = '自定义接口地址'; url.value = cfg.url || '';
  var model = document.createElement('input'); model.type = 'text'; url.placeholder = ''; model.placeholder = '模型名'; model.value = cfg.model || '';
  var note = el('div', 'gv-sheet-note', '密钥只存在你自己的浏览器里，不会写进角色卡。');
  function collect(){ return { enabled: sw.classList.contains('gv-on'), kind: sel.value, key: key.value.trim(), url: url.value.trim(), model: model.value.trim() }; }
  openSheet('兜底转换 API', [row('启用', sw), row('服务', sel), row('密钥', key), row('接口', url), row('模型', model), note], [
    btn('保存', true, function(){ ctx._post('convertCfg', collect()); }),
    btn('关闭', false, closeSheet),
  ]);
}
/* ---------- 素材: ① 导入高清素材包  ② 清除浏览器素材缓存 ---------- */
function openPack(){
  var note = el('div', 'gv-sheet-note', '脚本自带低清版；这里导入高清 .zip（同名覆盖）。');
  noteEl = note;
  var picker = document.createElement('input');
  picker.type = 'file'; picker.accept = '.zip,application/zip';
  picker.className = 'gv-sheet-file';
  var noteEl = null;
  picker.addEventListener('change', function(){
    var f = picker.files && picker.files[0];
    if (!f) return;
    /* ★ 必须把【字节】发给宿主 —— 以前只发名字/大小, 宿主那边拿不到文件, 点了等于没点 */
    if (noteEl) noteEl.textContent = '正在读取 ' + f.name + ' …';
    var done = function(buf){
      if (buf) { if (noteEl) noteEl.textContent = '正在导入：' + f.name + '（' + Math.round((f.size||0)/1024) + ' KB）—— 结果看右下角提示'; ctx._post('packFile', { name: f.name, size: f.size, buf: buf }); }
      else { if (noteEl) noteEl.textContent = '这个浏览器读不出这个文件，换个浏览器试试'; ctx._post('packFile', { name: f.name, size: f.size }); }
    };
    try {
      if (f.arrayBuffer) f.arrayBuffer().then(done).catch(function(){ done(null); });
      else { var fr = new FileReader(); fr.onload = function(){ done(fr.result); }; fr.onerror = function(){ done(null); }; fr.readAsArrayBuffer(f); }
    } catch (e) { done(null); }
  });
  /* ★ ② 清除浏览器素材缓存: 角色脚本每次打开都会自动恢复"以前导入过的包",
     旧包里同名素材会盖住新脚本自带的 —— 卡片更新后还显示旧素材时, 清一下再刷新页面。 */
  var clr = el('div', 'gv-sheet-note', '旧素材还显示？清一下浏览器里的缓存，再刷新。');
  var bPick = btn('① 导入高清素材包 (.zip)', true, function(){ picker.click(); });
  var bClr = btn('② 清除浏览器素材缓存', false, function(){
    if (noteEl) noteEl.textContent = '正在清除…';
    ctx._post('clearPackCache');
  });
  openSheet('素材', [note, row('选择文件', picker), clr], [bPick, bClr, btn('关闭', false, closeSheet)]);
}

/* ---------- 头部按钮 ---------- */
$('btnConv').addEventListener('click', function(e){ e.stopPropagation(); openConvert(); });
$('btnPrompt').addEventListener('click', function(e){ e.stopPropagation(); openPrompt(); });
$('btnPack').addEventListener('click', function(e){ e.stopPropagation(); openPack(); });
$('btnRedraw').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('redraw'); });
/* – = 收成小球 (黑色小球 + 猫爪肉球) */
var PAW = '<svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">' +
  '<ellipse cx="16" cy="21" rx="7.6" ry="6.4" fill="#fff"/>' +
  '<circle cx="7.4" cy="13" r="3.2" fill="#fff"/>' +
  '<circle cx="13" cy="7.8" r="3.4" fill="#fff"/>' +
  '<circle cx="19.4" cy="7.8" r="3.4" fill="#fff"/>' +
  '<circle cx="25" cy="13" r="3.2" fill="#fff"/></svg>';
$('btnFold').addEventListener('click', function(){
  if (dragMoved) { dragMoved = false; return; }   // 拖球之后不要顺手展开
  var mini = root.classList.toggle('gv-mini');
  this.innerHTML = mini ? PAW : '–';
  this.title = mini ? '展开悬浮窗' : '收成小球';
  this.classList.toggle('gv-paw', mini);
});
$('btnRaw').addEventListener('click', function(){ rawMode = !rawMode; this.classList.toggle('gv-on', rawMode); render(lastEntries); });
/* ✕ = 直接关掉整个悬浮窗 (重开这个角色的聊天才会再出来) */
$('btnMini').addEventListener('click', function(e){
  e.stopPropagation();
  closeSheet();
  root.style.display = 'none';
  ctx._post('closePanel');
  flash('悬浮窗已关闭（重新打开这个聊天才会再出现）');
});

/* ---------- 拖动: 直接在沙箱里挪 (不记录位置, 重进回初始) ---------- */
(function(){
  var drag = null;
  function clampSelf(){
    if (!root.style.left) return;
    var r = root.getBoundingClientRect();
    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;
    var nl = Math.max(-(r.width - 80), Math.min(vw - 80, r.left));
    var nt = Math.max(0, Math.min(vh - 40, r.top));
    if (Math.round(nl) !== Math.round(r.left) || Math.round(nt) !== Math.round(r.top)) {
      root.style.left = Math.round(nl) + 'px'; root.style.top = Math.round(nt) + 'px';
    }
  }
  /* ★ 尺寸一变就报一次: 宿主拿它抠 clip-path(画布=整个窗口) —— 那里就是"鼠标能点到面板"的区域。
     以前只在拖动/改大小/开编辑时报, 楼层渲染完自己长高了却不报 -> 宿主的可点区域还停在旧的小方块上,
     表现就是"面板看得见、但点不到 / 拖不动 / 改不了大小"。 */
  try {
    if (window.ResizeObserver) new ResizeObserver(function(){ fitSelf(); }).observe(root);
    window.addEventListener('load', function(){ setTimeout(fitSelf, 80); });
    setTimeout(fitSelf, 300);
  } catch (e) {}
  /* ★ 以前按 root.style.left||0 算 —— 面板本来靠 right:16px 定位, 第一次拖会先跳到左上角,
     看着就是"能动的范围莫名其妙只有一小块"。现在按【当前真实位置】算, 按下即跟手。 */
  $('head').addEventListener('mousedown', function(e){
    dragMoved = false;   // 每次按下都清, 免得上一轮拖动把这一次点击吃掉
    if (e.target.closest('.gv-panel-btn') && !root.classList.contains('gv-mini')) return;   // 小球时整球可拖
    var r = root.getBoundingClientRect();
    root.style.right = 'auto';
    root.style.left = Math.round(r.left) + 'px';
    root.style.top = Math.round(r.top) + 'px';
    drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
    /* ★ 活动范围 = 整块画布: 只保证"至少 80px 留在画面里、标题那一行不会被推出上边",
       其余随便拖 —— 以前没有任何限制, 拖出去就再也点不到了 (小球同理) */
    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;
    var nl = Math.max(-(drag.w - 80), Math.min(vw - 80, drag.l + dx));
    var nt = Math.max(0, Math.min(vh - 40, drag.t + dy));
    root.style.left = Math.round(nl) + 'px';
    root.style.top = Math.round(nt) + 'px';
    fitSelf();
    ctx._post('move', { dx: Math.round(dx), dy: Math.round(dy) });   // 将来宿主想接管也可以
  });
  document.addEventListener('mouseup', function(){ drag = null; });
  window.addEventListener('resize', function(){ clampSelf(); fitSelf(); });
})();

/* ---------- 让外框跟着面板走: 拖动/改大小/开页面之后都报一次 ---------- */
var lastFit = null;
function fitSelf(){
  var mini = root.classList.contains('gv-mini');
  var r = root.getBoundingClientRect();
  /* ★ 收成小球也要报【真实尺寸】: 以前故意报旧的大尺寸 -> 外框还是那么大, 小球被挡掉一半点不到。
     展开时会再报一次全尺寸(下面这段每次拖动/改大小/开关都会调用)。 */
  /* ★ 报【面板自己在窗口里的位置 + 尺寸】: 宿主拿它去抠 clip-path(画布=整个窗口)。
     老宿主只认 w/h 当包围盒, 所以 resize 那条继续报"右下角坐标 + 14"。 */
  var need = { x: Math.round(r.left), y: Math.round(r.top), w: Math.ceil(r.width), h: Math.ceil(r.height) };
  if (!mini) lastFit = need;
  ctx._post('resize', need.y + need.h + 14);
  ctx._post('wantSize', need);
}

/* 编辑框跟着面板高度走 */
function syncEditorHeight(){
  var ed = root.querySelector('.gv-panel-inline-edit');
  if (!ed || !ed.parentNode) return;
  var body = ed.parentNode;
  var whole = root.getBoundingClientRect().height;
  var chrome = Number(body.dataset.gvChrome) || 0;       // 打开编辑那一刻量到的"除正文外的固定高度"
  body.style.minHeight = Math.max(160, Math.round(whole - chrome)) + 'px';
}

/* ---------- 改大小: 左/右/上/下 四条边 + 右下角, 都能拖 (沙箱内, 不记录尺寸) ---------- */
(function(){
  function mkHandle(cls, title){ var h = el('div', 'gv-panel-rs ' + cls); h.title = title; root.appendChild(h); return h; }
  /* ★ 类名要和 CSS 对上: .gv-panel-rs-t/-b/-l/-r (四条边) + .gv-rs-corner (右下角)。
     以前只挂了右边和下边两个把手、左边和上边根本没有, 而且那两条还被 CSS 的 width/height:20px
     卡成小条 —— 结果就是"只有右下角能拖", 很不方便。现在四个方向都能拖。 */
  var MIN_W = 240, MIN_H = 120;
  var rs = null;
  function start(e, dir){
    e.stopPropagation(); e.preventDefault();
    var r = root.getBoundingClientRect();
    rs = { dir: dir, x: e.clientX, y: e.clientY, w: r.width, h: r.height, l: r.left, t: r.top };
    root.style.maxHeight = 'none';           // ★ 72vh 那个高度上限, 一拖就撤掉, 想多高就多高
    root.style.right = 'auto';
    root.style.left = Math.round(r.left) + 'px';
    root.style.top = Math.round(r.top) + 'px';
  }
  /* 顺序有讲究: 右下角最后加 -> 同层级时它压在最上面, 角上那一下拖的是"同时改宽高" */
  [['gv-panel-rs-t', '拖动改高度（上边）', 'n'],
   ['gv-panel-rs-b', '拖动改高度（下边）', 's'],
   ['gv-panel-rs-l', '拖动改宽度（左边）', 'w'],
   ['gv-panel-rs-r', '拖动改宽度（右边）', 'e'],
   ['gv-rs-corner', '拖动改大小（右下角）', 'se']].forEach(function(it){
    mkHandle(it[0], it[1]).addEventListener('mousedown', function(e){ start(e, it[2]); });
  });
  document.addEventListener('mousemove', function(e){
    if (!rs) return;
    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;
    var dx = e.clientX - rs.x, dy = e.clientY - rs.y, dir = rs.dir;
    /* 右边(含角): 改宽, 最多到窗口右边缘 */
    if (dir.indexOf('e') >= 0) {
      var maxW = Math.max(MIN_W, vw - rs.l - 2);
      root.style.width = Math.round(Math.max(MIN_W, Math.min(maxW, rs.w + dx))) + 'px';
    }
    /* 左边: 改宽, 右边缘钉住 -> 面板跟着往左挪 */
    if (dir.indexOf('w') >= 0) {
      var nw = Math.round(Math.max(MIN_W, Math.min(Math.max(MIN_W, rs.l + rs.w), rs.w - dx)));
      root.style.width = nw + 'px';
      root.style.left = Math.round(rs.l + (rs.w - nw)) + 'px';
    }
    /* 下边(含角): 改高, 最多到窗口下边缘 */
    if (dir.indexOf('s') >= 0) {
      var maxH = Math.max(MIN_H, vh - rs.t - 2);
      root.style.height = Math.round(Math.max(MIN_H, Math.min(maxH, rs.h + dy))) + 'px';
    }
    /* 上边: 改高, 下边缘钉住 -> 面板跟着往上挪 */
    if (dir.indexOf('n') >= 0) {
      var nh = Math.round(Math.max(MIN_H, Math.min(Math.max(MIN_H, rs.t + rs.h), rs.h - dy)));
      root.style.height = nh + 'px';
      root.style.top = Math.round(rs.t + (rs.h - nh)) + 'px';
    }
    syncEditorHeight();
    fitSelf();
  });
  document.addEventListener('mouseup', function(){ rs = null; });
})();

/* ---------- 编辑: 把这一格的内容区整块换成编辑器 (和 char 那套一个风格) ---------- */
function openItemEditor(item, e){
  var body = item.querySelector('.gv-panel-item-body');
  if (!body || body.querySelector('.gv-panel-inline-edit')) return;
  /* ★ 编辑时不许缩: 把整块高度锁住, 编辑框撑满它 */
  var whole = Math.max(220, Math.round(root.getBoundingClientRect().height));
  if (!root.style.height) root.style.height = whole + 'px';
  var prevBodyH = body.style.minHeight;
  var chrome = Math.max(120, Math.round(whole - body.getBoundingClientRect().height));
  body.dataset.gvChrome = String(chrome);
  body.style.minHeight = Math.max(160, whole - chrome) + 'px';
  var prev = body.innerHTML;
  item.classList.add('gv-editing');
  var wrap = el('div', 'gv-panel-inline-edit');
  var ta = document.createElement('textarea');
  ta.className = 'gv-panel-inline-ta';
  ta.spellcheck = false;
  ta.value = String(e.raw || '');
  var row = el('div', 'gv-panel-inline-btns');
  var bOk = el('span', 'gv-tb gv-primary', '确认修改');
  var bNo = el('span', 'gv-tb', '退出修改');
  row.append(bOk, bNo);
  wrap.append(ta, row);
  body.innerHTML = '';
  body.appendChild(wrap);
  bNo.addEventListener('click', function(ev){ ev.stopPropagation(); body.innerHTML = prev; body.style.minHeight = prevBodyH; item.classList.remove('gv-editing'); fitSelf(); });
  bOk.addEventListener('click', function(ev){
    ev.stopPropagation();
    e.raw = ta.value;
    e.html = ta.value.replace(/[&<>]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
    ctx._post('saveFloor', { id: e.id, text: ta.value });
    body.style.minHeight = prevBodyH;
    item.classList.remove('gv-editing');
    render(lastEntries);            // 保存后按新内容重画整列
    fitSelf();
  });
  ta.addEventListener('click', function(ev){ ev.stopPropagation(); });
  ta.focus();
  fitSelf();
}

/* ---------- 列表 ---------- */
function render(entries){
  lastEntries = entries || [];
  body.innerHTML = '';
  var shown = lastEntries.filter(function(e){ return (e.html && String(e.html).trim()) || (e.raw && String(e.raw).trim()); });
  count.textContent = String(shown.length);
  if (!shown.length) { body.appendChild(el('div', 'gv-panel-empty', '暂无附加内容')); return; }
  shown.forEach(function(e){
    var item = el('div', 'gv-panel-item' + (folded[e.id] ? ' gv-collapsed' : ''));
    var h = el('div', 'gv-panel-item-head');
    h.appendChild(el('b', '', '#' + e.id));
    h.appendChild(el('span', 'gv-pitem-name', e.name || '旁白'));
    h.appendChild(el('span', 'gv-pitem-len', (e.raw ? e.raw.length : 0) + ' 字'));
    if (e.story) h.appendChild(el('span', 'gv-pitem-tag', '有剧情'));
    var acts = el('div', 'gv-panel-actions');
    [['编辑', 'edit', false, '打开编辑器'], ['复制', 'copy', false, '复制这一楼内容'],
     ['上移', 'up', false, '楼层上移'], ['下移', 'down', false, '楼层下移'],
     ['删除', 'delete', true, '删除这一楼']].forEach(function(a){
      var b = el('span', 'gv-act' + (a[2] ? ' gv-danger' : ''), a[0]);
      b.title = a[3];
      b.addEventListener('click', function(ev){
        ev.stopPropagation();
        if (a[1] === 'edit') { openItemEditor(item, e); return; }   // 整块变成编辑器
        ctx._post(a[1], e.id);
      });
      acts.appendChild(b);
    });
    var content = el('div', 'gv-panel-item-body');
    if (rawMode) content.textContent = e.raw || '';
    else content.innerHTML = e.html || '';
    h.addEventListener('click', function(){
      folded[e.id] = !folded[e.id];
      item.classList.toggle('gv-collapsed', !!folded[e.id]);
    });
    item.appendChild(h); item.appendChild(acts); item.appendChild(content);
    body.appendChild(item);
    sbSyncs.push(attachScrollbar(content, item));
  });
  sbBody();
  requestAnimationFrame(function(){ sbBody(); sbSyncs.forEach(function(s){ s(); }); });
}
ctx.on('init', function(c){
  render(c.floors || []);
  /* 预览: 宿主给了框子高度 -> 面板不要长出去 (不然下面的内容被裁掉又看不到滚动条) */
  if (c.panelBox && c.panelBox.h) root.style.maxHeight = Math.max(200, Number(c.panelBox.h) - 16) + 'px';
  /* 宿主记着上次拖到哪 -> 重画(不是刷新预览)时位置保持 */
  if (c.panelOffset) {
    root.style.left = (Number(c.panelOffset.dx) || 0) + 'px';
    root.style.top = (Number(c.panelOffset.dy) || 0) + 'px';
    lastFit = null;
  }
  setTimeout(fitSelf, 60);
  if (c.prompt != null) ctx.prompt = c.prompt;
  if (c.convertCfg) ctx.convertCfg = c.convertCfg;
  $('btnConv').classList.toggle('gv-on', !!(c.convertCfg && c.convertCfg.enabled !== false));
});
ctx.on('floors', function(list){ render(list || []); });
ctx.on('convert', function(on){ $('btnConv').classList.toggle('gv-on', !!on); });
ctx.on('prompt', function(t){ ctx.prompt = t; });
ctx.on('toast', function(msg){ if (msg) flash(String(msg)); });   // 宿主回的提示