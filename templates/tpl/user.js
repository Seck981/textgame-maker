/* 玩家楼层: 卡里那套 (一行 + 展开操作 + 自建编辑器) */
function $(id){ return document.getElementById(id); }
var wrap = $('wrap'), editBtn = $('editBtn'), ed = $('ed'), ta = $('ta');
var ua = $('uava'), uname = $('uname'), utext = $('utext'), uaBtn = $('uaBtn');

function showBar(c){
  c = c || ctx;
  var u = c.avatar || '';
  if (u) { ua.src = u; ua.style.display = ''; } else { ua.style.display = 'none'; }
  uname.textContent = c.name || '';
  utext.textContent = String(c.text || '').replace(/^\s*[（(][^）)]*[）)]\s*/, '');
  ta.value = String(c.text || '');
  uaBtn.classList.toggle('gv-on', !!u);
  uaBtn.textContent = u ? '关闭头像' : '显示头像';
}

editBtn.addEventListener('click', function(e){
  e.stopPropagation();
  var open = wrap.classList.toggle('gv-open');
  editBtn.textContent = open ? '关闭' : '编辑';
  if (!open) ed.classList.remove('gv-open');
});
function tplToast(msg){
  var t = document.createElement('div');
  t.className = 'gv-tpl-toast'; t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(function(){ t.remove(); }, 5000);
}
function closeAll(){ ed.classList.remove('gv-open'); wrap.classList.remove('gv-open'); editBtn.textContent = '编辑'; }
Array.prototype.forEach.call(document.querySelectorAll('[data-a]'), function(b){
  b.addEventListener('click', function(e){
    e.stopPropagation();
    var a = b.getAttribute('data-a');
    if (a === 'edit') { ed.classList.toggle('gv-open'); if (ed.classList.contains('gv-open')) ta.focus(); return; }
    if (a === 'save') { ctx._post('save', ta.value); closeAll(); return; }
    if (a === 'close') { closeAll(); return; }
    ctx._post(a);
  });
});
$('bSave').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('save', ta.value); closeAll(); });
ctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });
$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); ed.classList.remove('gv-open'); });
ed.addEventListener('click', function(e){ e.stopPropagation(); });
ctx.on('init', showBar);
ctx.on('openEditor', function(){ ed.classList.add('gv-open'); wrap.classList.add('gv-open'); editBtn.textContent = '关闭'; ta.focus(); });