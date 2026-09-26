/* ============================================================
   文字游戏页面制作器 —— 酒馆扩展
   - 顶部按钮：注入到顶栏，扩展按钮之后
   - 界面：方案 / 页面排版 / 图片素材 / 特殊演出 / 提示词 / 导出
   - 存储：IndexedDB（素材大，localStorage 装不下）
   ============================================================ */
(function () {
  'use strict';
  const PLUGIN = { name: '文字游戏页面制作器', version: '1.0.13', dir: '/scripts/extensions/third-party/TextGameMaker' };
  const LS_LAST = 'tgm_last_project';

      /* ==GV-RICH-BEGIN== 悬浮窗富渲染 —— 由引擎 galgame.js 的 ==GV-RICH-START== 段自动同步 (templates/sync-rich.mjs)。预览和真机共用同一套切分/围栏代码, 手改这里下次同步会被覆盖 */
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
  /* ==GV-RICH-END== */
  /* ==GV-RICH-END== */
  /* ==GV-RICH-END== */

  /* ---------------- 内置气泡贴纸（随插件走，离线可用） ---------------- */
  const STICKERS = [
    ['sparkle', '闪光'], ['love', '爱心'], ['dream', '梦幻云'], ['wilt', '失落花'], ['stare', '沉默'],
    ['sweat', '汗'], ['rose', '玫瑰'], ['party', '庆祝'], ['shock', '惊叹'], ['yandere', '病娇'],
    ['luck', '幸运'], ['wind', '风'], ['rain', '阴雨'], ['question', '疑惑'], ['anger', '怒气'],
    ['dizzy', '眩晕'], ['heartbreak', '心碎'], ['sakura', '樱花'], ['rainbow', '彩虹'], ['skull', '骷髅'],
  ];
  const PAGE_PROMPTS = {"char":"======================================================================\n一、仿文字游戏的 CHAR 楼层（提示词）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【仿文字游戏的 CHAR 楼层】：角色说话那一层。手机框 + 背景层 + 立绘层 + 对话框 + 气泡贴纸 + HUD + 工具条菜单 +\n  音量面板 + 模板自带的\"改这一楼\"编辑器。\n  必须有的结构（宿主 / 模板自己都会找这些 id）：\n    gv-root + #phone（最外层和手机框，宿主靠 gv-root 判断模板是否完整）\n    #bgA #bgB（两层背景，交叉淡入） #dim #flash（压暗 / 闪白） #stage（立绘层）\n    #sticker + #stickerImg（气泡贴纸）\n    #box 里：#uava（头像）#name（名字）#text（正文，内部要有 #caret 光标）#next（继续箭头）\n    #dots（进度点）#auto（自动）#replay（重播）\n    .gv-toolbar + #btnEdit + #popup，菜单项用 data-a：edit / copy / up / down /\n    toggle-user-avatar / volume / delete（宿主按这个认功能，名字不能改）\n    #vol 音量面板：#volBgm #volSe（滑块）#volBgmPc #volSePc（百分比）#volPos #volPosPc（进度）\n    #volReplay #volPause #volX\n    #editor + #ta + #bSave + #bCancel（模板自带的编辑器）\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  尺寸与比例（【比例由你自己的 CSS 定，任意比例都要能做】）：\n    · 手机框的宽高比写在 CSS 里：默认竖版 aspect-ratio: 9 / 19.5（400px 宽 → 约 867px 高）。\n      要做横版就写 16 / 9（常见 640×360、960×540），方形写 1 / 1（常见 600×600）—— 随你。\n    · 宽度别写死：用 width: 100%（撑满宿主给的那点宽度，默认 400px）；高度交给 aspect-ratio。\n      · 制作器里「版式」选横版时，这一层用的是 640×360 的宽屏模板（同一套 HTML/JS，只是 CSS 覆盖成横屏；\n        设计宽度 640）—— 你写的时候只要保证「比例由 CSS 定、能自适应」这两条，横竖都能跑。\n      宿主允许的范围：宽约 200~700px、高约 260~1200px。\n    · 宿主会把你渲染出来的手机框实测尺寸记成「方案的定位框 宽/高」（预览外框跟着它走），\n      所以你 CSS 里写什么比例，成品就是什么比例 —— 别写 min(100%, 960px) 这种硬编码宽度，也别用 vh / vw。\n    · 所有层（#bgA #bgB / #stage / #box / #sticker）都必须【在手机框里面】用 position: absolute 定位\n      （相对 .gv-phone），不要贴到 body / iframe 上。\n    · 对话框那一块（.gv-ui > .gv-box）贴在手机框底部：left:0; right:0; bottom:0，别让它溢出手机框。\n    · 参考模板里这几条必须保留（颜色圆角随便改，定位别改）：\n      .gv-bgs { position:absolute; inset:0; }   .gv-ui { position:absolute; left:0; right:0; bottom:0; }\n      .gv-stage { position:absolute; inset:0; }   .gv-phone { aspect-ratio: 9 / 19.5; }（默认竖版，你想换比例就改这一行）\n  状态类：.gv-on（开着）.gv-hide（藏起来）.gv-open（音量面板展开）\n  音量面板：.gv-vol 及内部 .gv-vol-row .gv-vol-lb .gv-vol-rng .gv-vol-pc .gv-vol-btn .gv-vol-x\n  演出效果类：.gv-shake .gv-flashin .gv-zoom .gv-fade 之类（AI 在台词里写\"演出效果\"时挂上去的）\n  气泡入场动画：.gv-b-xxx 一类（名字要跟 JS 里 showSticker 用的对得上）\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", payload => …) 拿数据；之后交互都用 ctx._post。\n  2) 逐行渲染：payload.lines[]（每行 {name, face, text, fx, slot, se, isNarr}）→ 打字机 →\n     点一下 / 自动播放推进；旁白和角色行样式不同。\n  3) 背景 / 立绘：payload.backgrounds 按 【bg:】 事件切换（#bgA/#bgB 交叉淡入）；\n     payload.faces + 每张图的 fit（x/y/scale）写进 transform。\n  4) 气泡贴纸：payload.bubbles（名字 → 图）→ 在 .gv-phone 里按百分比摆一张。落点是【三档，按优先级取】：\n     payload.bubblePosEach[贴纸名]  →  payload.bubblePosSlot[当前行的 slot]  →  payload.bubblePos（默认）\n     每档都是 {x, y, scale}（x/y 是气泡【中心点】的百分比）。当前行的站位 = line.slot；旁白、以及没写站位的行，\n     slot 是空串 —— 那就别去查 bubblePosSlot，直接用默认那档。入场动画 payload.bubbleAnim[贴纸名]、自定义动画 payload.bubbleCss。\n  5) 演出效果：payload.fxAliases / 自定义 effects → 给角色或整屏加类。\n  6) 声音：payload.bgmAt / seAt（{at: 行号, name}）→ ctx._post(\"bgm\", 名字) / (\"se\", 名字)。\n     地址可能是 data: 也可能是 http；格式可能是 mp3，也可能是 opus(ogg)（制作器导出时会把大的音频压成 Opus）——\n     你只管把宿主给的地址交给 <audio> / new Audio()，不要按扩展名做判断。\n     ★ 暂停 / 继续只发 ctx._post(\"bgmPause\")。不要在 document 上挂 click / touchstart 去「补播」音频：\n       浏览器自动播放限制宿主已经处理了，自己补播会把用户按下的暂停冲掉（真机上实测过这个坑：暂停后点哪都重新响）。\n  7) 音量面板：滑块 / 进度 / 重播 / 暂停都走消息（见下表）。\n  8) 菜单：data-a 那些项点了发对应消息；9) 编辑器 #bSave → ctx._post(\"save\", 文本)。\n 10) 高度上报：量【.gv-phone 的 getBoundingClientRect()】发 ctx._post(\"frameSize\", {w,h})（量 body 会算错）；出错 try/catch 后\n     ctx._post(\"error\", 消息)，不要静默失败。\n 11) 自适应（重要）：设计宽度自己定一个（默认 400px，和 CSS 里手机框那套尺寸对齐）。容器比它窄时整块等比缩小：\n     在 #phone 外面的根节点上写 .gv-root { transform: scale(取小(容器宽 / 设计宽, 1)); transform-origin: 50% 0; }\n     （比例最好用 CSS 变量 --gv-scale 传进去）。下面三条必须一起做，少一条就是 bug：\n     ① 缩小时把手机框 width 钉成设计宽（400px）+ max-width: none + flex: 0 0 auto —— 不然 flex / 百分比先把它压扁，\n        再乘一次 scale 就成「缩两次」，看起来越缩越小；\n     ② 缩小时给 html 加 overflow: hidden —— transform 不改布局盒，缩完下面会多出一截空白滚动区；\n     ③ 上报尺寸：宽度一律报【容器宽】(document.documentElement.clientWidth)，绝对不能报缩放后的手机宽 ——\n        宿主 / 预览会拿它当外框宽，等于把缩放结果又喂回去，会一轮轮越缩越小（300→225→169→127）；\n        高度报【缩放后的视觉高度】(rect.height)，并同时发 ctx._post(\"resize\", 高度)（真机的外框高度靠它）。\n\n可选功能：演出之外的「第二个页面」（默认模板里【没有】这个，用户要求、或者你自己先问一句再加）\n  做法：演出页上加一个返回按钮，点了退出演出、进到另一个页面；在那个页面上再点返回，就回到演出。\n\n  那一页放什么要看卡的类型 —— 别自己硬编内容，先问用户三件事：\n    ① 要不要这个返回页  ② 页面上要显示什么  ③ 里面的数字从哪来\n  举例：\n    · 经营类的卡 → 返回页做成「经营菜单」（金钱 / 库存 / 菜单 / 雇员 / 今日流水…）\n    · 冒险类的卡 → 返回页做成「地图界面」（地点列表 / 已探索 / 当前所在…）\n    · 别的：状态栏、角色图鉴、背包、小游戏（猜谜 / 翻牌 / 数字游戏）都行\n\n  数字从哪来：酒馆里的变量系统 MVU（不了解也没关系，按下面两行写就行）\n    简单说：MVU 让角色卡能\"记事\"——剧情进度、金钱、好感度这些存成这一层楼的变量，剧情推进时由 AI 更新。\n    读法就两行：var data = Mvu.getMvuData(); 然后 _.get(data, \"路径\") 取值（路径看变量结构，比如 stat_data.金钱）。\n    取到之后：固定字段填格子，列表类遍历着填；MVU 更新完会通知前端，界面跟着重画。\n    拿不到 Mvu（对方没装 MVU / 这层楼没有变量）要优雅降级：显示占位文字，别报错白屏。\n\n  实现提示（都在同一个模板里做，不要跳转页面）\n    · 演出页和返回页是「同一个 iframe 里的两个视图」：用一个 class（例如 .gv-view-menu）切换；\n      点返回时切视图，不要用 location / window.open（沙箱里会失败）。\n    · 返回按钮放工具条或画面角落，id 自己起（不要占用上面那张\"必须保留的 id\"表）。\n    · 返回页的样式照这一层的风格写，不要引入外链字体 / 图片。\n\n交卷前自检（这几条不过就别交）：\n  1) 比例是你在 CSS 里定的（默认竖版 9/19.5；换横版/方形就改 .gv-phone 的 aspect-ratio），宽度是 width:100%，没写死 px；\n  2) 对话框贴在手机框最底部、没有超出手机框；背景 / 立绘 / 贴纸全在手机框内；\n  3) 没有用 vh / vw / position: fixed；\n  4) 有 ctx._post(\"frameSize\", {w,h})（量【.gv-phone 缩放后的 rect】）+ ctx._post(\"resize\", 高度)；\n  5) 上面那张“必须保留的 id”表里的 id 一个都没少（尤其 #vol* 那一串和 data-a 那七个）。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready                加载好了，把数据给我\n  宿主 → 模板   init(payload)        lines / backgrounds / faces / bubbles / bgmAt / seAt / volume …\n  模板 → 宿主   bgm(名字) / se(名字)  放歌 / 放音效；名字为空 = 停\n  模板 → 宿主   volume({bgm,se})     两个音量（0~1）\n  模板 → 宿主   bgmQuery             问当前进度；宿主回 bgmState({name,t,dur,paused})\n  模板 → 宿主   bgmSeekPct(0~1)      拖进度    bgmReplay / bgmPause  重播 / 暂停·继续\n  模板 → 宿主   save(文本)           保存这一楼文本\n  模板 → 宿主   frameSize({w,h})     上报尺寸   error(消息)  出错上报\n  模板 → 宿主   edit / copy / up / down / delete / toggle-user-avatar   菜单按钮\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        <!--gv-audio--><span class=\"gv-tb\" data-a=\"volume\" id=\"btnVol\" title=\"调整 BGM / 音效 的音量\">调整音量</span><!--/gv-audio-->\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    <!--gv-audio--><div class=\"gv-vol\" id=\"vol\">\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音频</span><input class=\"gv-vol-rng\" id=\"volBgm\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volBgmPc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音效</span><input class=\"gv-vol-rng\" id=\"volSe\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volSePc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">进度</span><input class=\"gv-vol-rng\" id=\"volPos\" type=\"range\" min=\"0\" max=\"1000\" step=\"1\" value=\"0\"><span class=\"gv-vol-pc\" id=\"volPosPc\">0:00</span><span class=\"gv-vol-btn\" id=\"volReplay\">重播</span></div>\n      <div class=\"gv-vol-tip\">拖到 0 就是静音；音量记在这台设备上；进度条跟着 BGM 走</div>\n    </div><!--/gv-audio-->\n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>\n```\n```css\n/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n```\n```js\n/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 400;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n/*gv-audio*/\n/* ---- 声音: 自己播 (data: 能用就自己放, 否则叫宿主) ----\n   __gvAudioV4__  ← 这一块的\"新版\"标记。必须落在这段的【截取范围内】:\n   插件给老方案补这一块时靠它判断补没补过, 标记在范围外 -> 每次打开插件都会再补一份 (老方案的 JS 被叠过几十份)\n   ★ 自检: window.__gvAudio 里记着调用/命中/播放次数, 探针能直接看是哪一步没走到 */\n/* 老快照(页面排版里存过的)可能没有 $ 的定义 -> 这一整块一开头就 ReferenceError, 什么都装不上。\n   这里补一个兜底: 没有就自己造一个 (有就什么都不做) */\ntry { if (typeof window.$ !== 'function') window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}\nvar bgmEl = null, seEl = null, bgmNow = '';\nwindow.__gvAudio = { calls: 0, miss: 0, played: 0, se: 0, err: '', ready: false };\nfunction volNow(){ var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : {}; return { bgm: c.bgm == null ? .8 : c.bgm, se: c.se == null ? .8 : c.se }; }\nfunction ensureAudio(){ if (bgmEl) return true; try { bgmEl = new Audio(); bgmEl.loop = true; seEl = new Audio(); window.__gvAudio.ready = true; return true; } catch (e) { window.__gvAudio.err = String(e); return false; } }\nfunction hasLocalAudio(){ return !!(ctx.audioBgm && Object.keys(ctx.audioBgm).length) || !!(ctx.audioSe && Object.keys(ctx.audioSe).length); }\n/* __gvAudioV2__ : 沙箱 iframe 是独立源, 默认没有自动播放权限 -> 自己 play() 永远 NotAllowedError。\n   所以声音一律由【宿主】放: 预览里是插件(普通源), 真机上是引擎。 */\nfunction playBgm(name, tries){\n  window.__gvAudio.calls++;\n  if (!name) return;\n  bgmNow = name;\n  ctx._post('bgm', name);\n}\nfunction playBgmLocal(name){\n  var u = (ctx.audioBgm || {})[name];\n  if (!u) return;\n  if (!ensureAudio()) return;\n  if (bgmEl.src && !bgmEl.paused) return;\n  bgmEl.src = u; bgmEl.volume = volNow().bgm;\n  try { bgmEl.play().catch(function(){}); } catch (e) {}\n}\nfunction playSe(name, tries){\n  if (!name) return;\n  ctx._post('se', name);                 // 同样交给宿主放\n  window.__gvAudio.se++;\n}\n\n/*gv-audio*/\n/* ---- 音量: 两个滑块, 拖到 0 = 静音; 自己放的话直接改自己的音量, 值也给宿主存 ---- */\nfunction toggleVol(){ var v = $('vol'); if (!v) return;\n  /* ★ 一次点击只认一次: 老方案里这块代码被补过重复的 [data-a] 处理器, 点一下会 toggle 两三回\n     -> 音量面板\"闪一下就没了\"。150ms 内的重复调用直接吞掉 (真手速不可能这么快) */\n  var _tv = Date.now();\n  if (toggleVol.__at && _tv - toggleVol.__at < 150) return;\n  toggleVol.__at = _tv;\n  v.classList.toggle('gv-open');\n  if (v.classList.contains('gv-open')) { syncVol(); try { ctx._post('bgmQuery'); } catch (e) {}\n    if (!volTimer) volTimer = setInterval(volPoll, 600); }\n  else if (volTimer) { clearInterval(volTimer); volTimer = null; } }\n/* ★ 独立监听: 老模板里的 [data-a] 处理器不认识 volume, 这里自己兜住 (它多发的那条消息无害) */\ntry {\n  var _vbtn = document.querySelector('[data-a=\"volume\"]');\n  if (_vbtn) _vbtn.addEventListener('click', function (e) { e.stopPropagation(); setTimeout(toggleVol, 0); });\n} catch (e) {}\nfunction syncVol(){\n  var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : { bgm: 0.8, se: 0.8 };\n  var b = $('volBgm'), s = $('volSe');\n  if (b) { b.value = String(Math.round((c.bgm != null ? c.bgm : 0.8) * 100)); }\n  if (s) { s.value = String(Math.round((c.se != null ? c.se : 0.8) * 100)); }\n  volLabel();\n}\nfunction volLabel(){\n  var b = $('volBgm'), s = $('volSe'), bp = $('volBgmPc'), sp = $('volSePc');\n  if (bp && b) bp.textContent = b.value + '%';\n  if (sp && s) sp.textContent = s.value + '%';\n}\n/* ---- 进度条 + 重播: 音频在宿主那边, 所以靠消息问/发 ---- */\nvar volTimer = null, volDragging = false;\nfunction fmtT(sec){ sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }\nfunction volPoll(){\n  if (!($('vol') || {}).classList || !$('vol').classList.contains('gv-open')) { clearInterval(volTimer); volTimer = null; return; }\n  if (!volDragging) ctx._post('bgmQuery');\n}\nctx.on('bgmState', function (st) {\n  st = st || {};\n  var r = $('volPos'); if (!r) return;\n  var dur = Number(st.dur) || 0, t = Number(st.t) || 0;\n  if (dur > 0) r.value = String(Math.round(t / dur * 1000));\n  var pc = $('volPosPc'); if (pc) pc.textContent = fmtT(t) + ' / ' + fmtT(dur);\n  r.disabled = !dur;\n});\n$('volPos').addEventListener('pointerdown', function () { volDragging = true; });\n$('volPos').addEventListener('pointerup', function () { volDragging = false; });\n$('volPos').addEventListener('input', function (e) {\n  e.stopPropagation();\n  ctx._post('bgmSeekPct', Number(this.value) / 1000);\n});\n$('volReplay').addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmReplay'); });\n/*gv-pause*/\n/* ---- 暂停 / 继续: 音频在宿主那边放, 所以点一下发条消息让它停 / 接着放 ----\n   按钮用 JS 造 (不依赖 HTML), 老模板补丁也能把这一整块追加进去 */\ntry {\n  var _vp = $('volPause');\n  if (!_vp) {\n    _vp = document.createElement('span');\n    _vp.id = 'volPause'; _vp.className = 'gv-vol-btn'; _vp.textContent = '暂停';\n    _vp.title = '暂停 / 接着放 BGM';\n    var _vpRow = $('volReplay') ? $('volReplay').parentNode : null;\n    if (_vpRow) _vpRow.appendChild(_vp);\n  }\n  /* ★ 老快照可能被补过不止一份 -> 装过的就别再装一遍 (两份监听 = 点一下发两条 = 停了又接着放) */\n  if (!_vp.__gvPauseOn) {\n    _vp.__gvPauseOn = 1;\n    _vp.addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmPause'); });\n  }\n  if (!ctx.__gvPauseLabel) {\n    ctx.__gvPauseLabel = 1;\n    ctx.on('bgmState', function (st) {\n      try { var b = $('volPause'); if (b && st && typeof st.paused === 'boolean') b.textContent = st.paused ? '继续' : '暂停'; } catch (e) {}\n    });\n  }\n} catch (e) {}\n/*/gv-pause*/\n/* ★ 面板右上角的关闭按钮 (用 JS 造, 老模板也能自动拿到, 不会重复插一份面板) */\ntry {\n  var _vbox = $('vol');\n  if (_vbox && !$('volX')) {\n    var _vx = document.createElement('span');\n    _vx.id = 'volX'; _vx.className = 'gv-vol-x'; _vx.textContent = '×'; _vx.title = '关闭音量面板';\n    _vx.addEventListener('click', function (e) {\n      e.stopPropagation();\n      $('vol').classList.remove('gv-open');\n      if (volTimer) { clearInterval(volTimer); volTimer = null; }\n    });\n    _vbox.appendChild(_vx);\n  }\n} catch (e) {}\n$('volBgm').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number(this.value) / 100, se: Number($('volSe').value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('volSe').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number($('volBgm').value) / 100, se: Number(this.value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('vol').addEventListener('click', function(e){ e.stopPropagation(); });\n\n/*/gv-audio*/\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  /*gv-audio*/ try { var b0 = (ctx.bgmAt || [])[0]; if (b0) playBgm(b0.name); else ctx._post('bgm', ''); } catch (e) {} /*/gv-audio*/\n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });\n```","charNoAudio":"★ 这一份是【竖版 · 无音频】的默认预设：竖版 400×867，并且【不要】音量面板 / 进度条 / 播放·暂停按钮 / 【bgm:】【se:】那一整套，画面里也别出现音频按钮。\n\n======================================================================\n一、仿文字游戏的 CHAR 楼层（提示词 · 竖版 · 无音频）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【仿文字游戏的 CHAR 楼层】：角色说话那一层。手机框 + 背景层 + 立绘层 + 对话框 + 气泡贴纸 + HUD + 工具条菜单 +\n  音量面板 + 模板自带的\"改这一楼\"编辑器。\n  必须有的结构（宿主 / 模板自己都会找这些 id）：\n    gv-root + #phone（最外层和手机框，宿主靠 gv-root 判断模板是否完整）\n    #bgA #bgB（两层背景，交叉淡入） #dim #flash（压暗 / 闪白） #stage（立绘层）\n    #sticker + #stickerImg（气泡贴纸）\n    #box 里：#uava（头像）#name（名字）#text（正文，内部要有 #caret 光标）#next（继续箭头）\n    #dots（进度点）#auto（自动）#replay（重播）\n    .gv-toolbar + #btnEdit + #popup，菜单项用 data-a：edit / copy / up / down /\n    toggle-user-avatar / volume / delete（宿主按这个认功能，名字不能改）\n    #vol 音量面板：#volBgm #volSe（滑块）#volBgmPc #volSePc（百分比）#volPos #volPosPc（进度）\n    #volReplay #volPause #volX\n    #editor + #ta + #bSave + #bCancel（模板自带的编辑器）\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  尺寸与比例（【比例由你自己的 CSS 定，任意比例都要能做】）：\n    · 手机框的宽高比写在 CSS 里：默认竖版 aspect-ratio: 9 / 19.5（400px 宽 → 约 867px 高）。\n      要做横版就写 16 / 9（常见 640×360、960×540），方形写 1 / 1（常见 600×600）—— 随你。\n    · 宽度别写死：用 width: 100%（撑满宿主给的那点宽度，默认 400px）；高度交给 aspect-ratio。\n      · 制作器里「版式」选横版时，这一层用的是 640×360 的宽屏模板（同一套 HTML/JS，只是 CSS 覆盖成横屏；\n        设计宽度 640）—— 你写的时候只要保证「比例由 CSS 定、能自适应」这两条，横竖都能跑。\n      宿主允许的范围：宽约 200~700px、高约 260~1200px。\n    · 宿主会把你渲染出来的手机框实测尺寸记成「方案的定位框 宽/高」（预览外框跟着它走），\n      所以你 CSS 里写什么比例，成品就是什么比例 —— 别写 min(100%, 960px) 这种硬编码宽度，也别用 vh / vw。\n    · 所有层（#bgA #bgB / #stage / #box / #sticker）都必须【在手机框里面】用 position: absolute 定位\n      （相对 .gv-phone），不要贴到 body / iframe 上。\n    · 对话框那一块（.gv-ui > .gv-box）贴在手机框底部：left:0; right:0; bottom:0，别让它溢出手机框。\n    · 参考模板里这几条必须保留（颜色圆角随便改，定位别改）：\n      .gv-bgs { position:absolute; inset:0; }   .gv-ui { position:absolute; left:0; right:0; bottom:0; }\n      .gv-stage { position:absolute; inset:0; }   .gv-phone { aspect-ratio: 9 / 19.5; }（默认竖版，你想换比例就改这一行）\n  状态类：.gv-on（开着）.gv-hide（藏起来）.gv-open（音量面板展开）\n  音量面板：.gv-vol 及内部 .gv-vol-row .gv-vol-lb .gv-vol-rng .gv-vol-pc .gv-vol-btn .gv-vol-x\n  演出效果类：.gv-shake .gv-flashin .gv-zoom .gv-fade 之类（AI 在台词里写\"演出效果\"时挂上去的）\n  气泡入场动画：.gv-b-xxx 一类（名字要跟 JS 里 showSticker 用的对得上）\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", payload => …) 拿数据；之后交互都用 ctx._post。\n  2) 逐行渲染：payload.lines[]（每行 {name, face, text, fx, slot, se, isNarr}）→ 打字机 →\n     点一下 / 自动播放推进；旁白和角色行样式不同。\n  3) 背景 / 立绘：payload.backgrounds 按 【bg:】 事件切换（#bgA/#bgB 交叉淡入）；\n     payload.faces + 每张图的 fit（x/y/scale）写进 transform。\n  4) 气泡贴纸：payload.bubbles（名字 → 图）→ 在 .gv-phone 里按百分比摆一张。落点是【三档，按优先级取】：\n     payload.bubblePosEach[贴纸名]  →  payload.bubblePosSlot[当前行的 slot]  →  payload.bubblePos（默认）\n     每档都是 {x, y, scale}（x/y 是气泡【中心点】的百分比）。当前行的站位 = line.slot；旁白、以及没写站位的行，\n     slot 是空串 —— 那就别去查 bubblePosSlot，直接用默认那档。入场动画 payload.bubbleAnim[贴纸名]、自定义动画 payload.bubbleCss。\n  5) 演出效果：payload.fxAliases / 自定义 effects → 给角色或整屏加类。\n  6) 声音：payload.bgmAt / seAt（{at: 行号, name}）→ ctx._post(\"bgm\", 名字) / (\"se\", 名字)。\n     地址可能是 data: 也可能是 http；格式可能是 mp3，也可能是 opus(ogg)（制作器导出时会把大的音频压成 Opus）——\n     你只管把宿主给的地址交给 <audio> / new Audio()，不要按扩展名做判断。\n     ★ 暂停 / 继续只发 ctx._post(\"bgmPause\")。不要在 document 上挂 click / touchstart 去「补播」音频：\n       浏览器自动播放限制宿主已经处理了，自己补播会把用户按下的暂停冲掉（真机上实测过这个坑：暂停后点哪都重新响）。\n  7) 音量面板：滑块 / 进度 / 重播 / 暂停都走消息（见下表）。\n  8) 菜单：data-a 那些项点了发对应消息；9) 编辑器 #bSave → ctx._post(\"save\", 文本)。\n 10) 高度上报：量【.gv-phone 的 getBoundingClientRect()】发 ctx._post(\"frameSize\", {w,h})（量 body 会算错）；出错 try/catch 后\n     ctx._post(\"error\", 消息)，不要静默失败。\n 11) 自适应（重要）：设计宽度自己定一个（默认 400px，和 CSS 里手机框那套尺寸对齐）。容器比它窄时整块等比缩小：\n     在 #phone 外面的根节点上写 .gv-root { transform: scale(取小(容器宽 / 设计宽, 1)); transform-origin: 50% 0; }\n     （比例最好用 CSS 变量 --gv-scale 传进去）。下面三条必须一起做，少一条就是 bug：\n     ① 缩小时把手机框 width 钉成设计宽（400px）+ max-width: none + flex: 0 0 auto —— 不然 flex / 百分比先把它压扁，\n        再乘一次 scale 就成「缩两次」，看起来越缩越小；\n     ② 缩小时给 html 加 overflow: hidden —— transform 不改布局盒，缩完下面会多出一截空白滚动区；\n     ③ 上报尺寸：宽度一律报【容器宽】(document.documentElement.clientWidth)，绝对不能报缩放后的手机宽 ——\n        宿主 / 预览会拿它当外框宽，等于把缩放结果又喂回去，会一轮轮越缩越小（300→225→169→127）；\n        高度报【缩放后的视觉高度】(rect.height)，并同时发 ctx._post(\"resize\", 高度)（真机的外框高度靠它）。\n\n可选功能：演出之外的「第二个页面」（默认模板里【没有】这个，用户要求、或者你自己先问一句再加）\n  做法：演出页上加一个返回按钮，点了退出演出、进到另一个页面；在那个页面上再点返回，就回到演出。\n\n  那一页放什么要看卡的类型 —— 别自己硬编内容，先问用户三件事：\n    ① 要不要这个返回页  ② 页面上要显示什么  ③ 里面的数字从哪来\n  举例：\n    · 经营类的卡 → 返回页做成「经营菜单」（金钱 / 库存 / 菜单 / 雇员 / 今日流水…）\n    · 冒险类的卡 → 返回页做成「地图界面」（地点列表 / 已探索 / 当前所在…）\n    · 别的：状态栏、角色图鉴、背包、小游戏（猜谜 / 翻牌 / 数字游戏）都行\n\n  数字从哪来：酒馆里的变量系统 MVU（不了解也没关系，按下面两行写就行）\n    简单说：MVU 让角色卡能\"记事\"——剧情进度、金钱、好感度这些存成这一层楼的变量，剧情推进时由 AI 更新。\n    读法就两行：var data = Mvu.getMvuData(); 然后 _.get(data, \"路径\") 取值（路径看变量结构，比如 stat_data.金钱）。\n    取到之后：固定字段填格子，列表类遍历着填；MVU 更新完会通知前端，界面跟着重画。\n    拿不到 Mvu（对方没装 MVU / 这层楼没有变量）要优雅降级：显示占位文字，别报错白屏。\n\n  实现提示（都在同一个模板里做，不要跳转页面）\n    · 演出页和返回页是「同一个 iframe 里的两个视图」：用一个 class（例如 .gv-view-menu）切换；\n      点返回时切视图，不要用 location / window.open（沙箱里会失败）。\n    · 返回按钮放工具条或画面角落，id 自己起（不要占用上面那张\"必须保留的 id\"表）。\n    · 返回页的样式照这一层的风格写，不要引入外链字体 / 图片。\n\n交卷前自检（这几条不过就别交）：\n  1) 比例是你在 CSS 里定的（默认竖版 9/19.5；换横版/方形就改 .gv-phone 的 aspect-ratio），宽度是 width:100%，没写死 px；\n  2) 对话框贴在手机框最底部、没有超出手机框；背景 / 立绘 / 贴纸全在手机框内；\n  3) 没有用 vh / vw / position: fixed；\n  4) 有 ctx._post(\"frameSize\", {w,h})（量【.gv-phone 缩放后的 rect】）+ ctx._post(\"resize\", 高度)；\n  5) 上面那张“必须保留的 id”表里的 id 一个都没少（尤其 #vol* 那一串和 data-a 那七个）。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready                加载好了，把数据给我\n  宿主 → 模板   init(payload)        lines / backgrounds / faces / bubbles / bgmAt / seAt / volume …\n  模板 → 宿主   bgm(名字) / se(名字)  放歌 / 放音效；名字为空 = 停\n  模板 → 宿主   volume({bgm,se})     两个音量（0~1）\n  模板 → 宿主   bgmQuery             问当前进度；宿主回 bgmState({name,t,dur,paused})\n  模板 → 宿主   bgmSeekPct(0~1)      拖进度    bgmReplay / bgmPause  重播 / 暂停·继续\n  模板 → 宿主   save(文本)           保存这一楼文本\n  模板 → 宿主   frameSize({w,h})     上报尺寸   error(消息)  出错上报\n  模板 → 宿主   edit / copy / up / down / delete / toggle-user-avatar   菜单按钮\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        \n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    \n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>\n```\n```css\n/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n```\n```js\n/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 400;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  \n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });\n```","charLand":"★ 这一份是【横版 · 有音频】的默认预设：横版 640×360（aspect-ratio: 16 / 9）宽屏版式，并且【保留】音量面板 / BGM / 音效那一整套。下面示例里出现的 9 / 19.5、400px 是竖版数字，你按横版来。\n\n======================================================================\n一、仿文字游戏的 CHAR 楼层（提示词 · 横版 · 有音频）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【仿文字游戏的 CHAR 楼层】：角色说话那一层。手机框 + 背景层 + 立绘层 + 对话框 + 气泡贴纸 + HUD + 工具条菜单 +\n  音量面板 + 模板自带的\"改这一楼\"编辑器。\n  必须有的结构（宿主 / 模板自己都会找这些 id）：\n    gv-root + #phone（最外层和手机框，宿主靠 gv-root 判断模板是否完整）\n    #bgA #bgB（两层背景，交叉淡入） #dim #flash（压暗 / 闪白） #stage（立绘层）\n    #sticker + #stickerImg（气泡贴纸）\n    #box 里：#uava（头像）#name（名字）#text（正文，内部要有 #caret 光标）#next（继续箭头）\n    #dots（进度点）#auto（自动）#replay（重播）\n    .gv-toolbar + #btnEdit + #popup，菜单项用 data-a：edit / copy / up / down /\n    toggle-user-avatar / volume / delete（宿主按这个认功能，名字不能改）\n    #vol 音量面板：#volBgm #volSe（滑块）#volBgmPc #volSePc（百分比）#volPos #volPosPc（进度）\n    #volReplay #volPause #volX\n    #editor + #ta + #bSave + #bCancel（模板自带的编辑器）\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  尺寸与比例（【比例由你自己的 CSS 定，任意比例都要能做】）：\n    · 手机框的宽高比写在 CSS 里：默认竖版 aspect-ratio: 9 / 19.5（400px 宽 → 约 867px 高）。\n      要做横版就写 16 / 9（常见 640×360、960×540），方形写 1 / 1（常见 600×600）—— 随你。\n    · 宽度别写死：用 width: 100%（撑满宿主给的那点宽度，默认 400px）；高度交给 aspect-ratio。\n      · 制作器里「版式」选横版时，这一层用的是 640×360 的宽屏模板（同一套 HTML/JS，只是 CSS 覆盖成横屏；\n        设计宽度 640）—— 你写的时候只要保证「比例由 CSS 定、能自适应」这两条，横竖都能跑。\n      宿主允许的范围：宽约 200~700px、高约 260~1200px。\n    · 宿主会把你渲染出来的手机框实测尺寸记成「方案的定位框 宽/高」（预览外框跟着它走），\n      所以你 CSS 里写什么比例，成品就是什么比例 —— 别写 min(100%, 960px) 这种硬编码宽度，也别用 vh / vw。\n    · 所有层（#bgA #bgB / #stage / #box / #sticker）都必须【在手机框里面】用 position: absolute 定位\n      （相对 .gv-phone），不要贴到 body / iframe 上。\n    · 对话框那一块（.gv-ui > .gv-box）贴在手机框底部：left:0; right:0; bottom:0，别让它溢出手机框。\n    · 参考模板里这几条必须保留（颜色圆角随便改，定位别改）：\n      .gv-bgs { position:absolute; inset:0; }   .gv-ui { position:absolute; left:0; right:0; bottom:0; }\n      .gv-stage { position:absolute; inset:0; }   .gv-phone { aspect-ratio: 9 / 19.5; }（默认竖版，你想换比例就改这一行）\n  状态类：.gv-on（开着）.gv-hide（藏起来）.gv-open（音量面板展开）\n  音量面板：.gv-vol 及内部 .gv-vol-row .gv-vol-lb .gv-vol-rng .gv-vol-pc .gv-vol-btn .gv-vol-x\n  演出效果类：.gv-shake .gv-flashin .gv-zoom .gv-fade 之类（AI 在台词里写\"演出效果\"时挂上去的）\n  气泡入场动画：.gv-b-xxx 一类（名字要跟 JS 里 showSticker 用的对得上）\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", payload => …) 拿数据；之后交互都用 ctx._post。\n  2) 逐行渲染：payload.lines[]（每行 {name, face, text, fx, slot, se, isNarr}）→ 打字机 →\n     点一下 / 自动播放推进；旁白和角色行样式不同。\n  3) 背景 / 立绘：payload.backgrounds 按 【bg:】 事件切换（#bgA/#bgB 交叉淡入）；\n     payload.faces + 每张图的 fit（x/y/scale）写进 transform。\n  4) 气泡贴纸：payload.bubbles（名字 → 图）→ 在 .gv-phone 里按百分比摆一张。落点是【三档，按优先级取】：\n     payload.bubblePosEach[贴纸名]  →  payload.bubblePosSlot[当前行的 slot]  →  payload.bubblePos（默认）\n     每档都是 {x, y, scale}（x/y 是气泡【中心点】的百分比）。当前行的站位 = line.slot；旁白、以及没写站位的行，\n     slot 是空串 —— 那就别去查 bubblePosSlot，直接用默认那档。入场动画 payload.bubbleAnim[贴纸名]、自定义动画 payload.bubbleCss。\n  5) 演出效果：payload.fxAliases / 自定义 effects → 给角色或整屏加类。\n  6) 声音：payload.bgmAt / seAt（{at: 行号, name}）→ ctx._post(\"bgm\", 名字) / (\"se\", 名字)。\n     地址可能是 data: 也可能是 http；格式可能是 mp3，也可能是 opus(ogg)（制作器导出时会把大的音频压成 Opus）——\n     你只管把宿主给的地址交给 <audio> / new Audio()，不要按扩展名做判断。\n     ★ 暂停 / 继续只发 ctx._post(\"bgmPause\")。不要在 document 上挂 click / touchstart 去「补播」音频：\n       浏览器自动播放限制宿主已经处理了，自己补播会把用户按下的暂停冲掉（真机上实测过这个坑：暂停后点哪都重新响）。\n  7) 音量面板：滑块 / 进度 / 重播 / 暂停都走消息（见下表）。\n  8) 菜单：data-a 那些项点了发对应消息；9) 编辑器 #bSave → ctx._post(\"save\", 文本)。\n 10) 高度上报：量【.gv-phone 的 getBoundingClientRect()】发 ctx._post(\"frameSize\", {w,h})（量 body 会算错）；出错 try/catch 后\n     ctx._post(\"error\", 消息)，不要静默失败。\n 11) 自适应（重要）：设计宽度自己定一个（默认 400px，和 CSS 里手机框那套尺寸对齐）。容器比它窄时整块等比缩小：\n     在 #phone 外面的根节点上写 .gv-root { transform: scale(取小(容器宽 / 设计宽, 1)); transform-origin: 50% 0; }\n     （比例最好用 CSS 变量 --gv-scale 传进去）。下面三条必须一起做，少一条就是 bug：\n     ① 缩小时把手机框 width 钉成设计宽（400px）+ max-width: none + flex: 0 0 auto —— 不然 flex / 百分比先把它压扁，\n        再乘一次 scale 就成「缩两次」，看起来越缩越小；\n     ② 缩小时给 html 加 overflow: hidden —— transform 不改布局盒，缩完下面会多出一截空白滚动区；\n     ③ 上报尺寸：宽度一律报【容器宽】(document.documentElement.clientWidth)，绝对不能报缩放后的手机宽 ——\n        宿主 / 预览会拿它当外框宽，等于把缩放结果又喂回去，会一轮轮越缩越小（300→225→169→127）；\n        高度报【缩放后的视觉高度】(rect.height)，并同时发 ctx._post(\"resize\", 高度)（真机的外框高度靠它）。\n\n可选功能：演出之外的「第二个页面」（默认模板里【没有】这个，用户要求、或者你自己先问一句再加）\n  做法：演出页上加一个返回按钮，点了退出演出、进到另一个页面；在那个页面上再点返回，就回到演出。\n\n  那一页放什么要看卡的类型 —— 别自己硬编内容，先问用户三件事：\n    ① 要不要这个返回页  ② 页面上要显示什么  ③ 里面的数字从哪来\n  举例：\n    · 经营类的卡 → 返回页做成「经营菜单」（金钱 / 库存 / 菜单 / 雇员 / 今日流水…）\n    · 冒险类的卡 → 返回页做成「地图界面」（地点列表 / 已探索 / 当前所在…）\n    · 别的：状态栏、角色图鉴、背包、小游戏（猜谜 / 翻牌 / 数字游戏）都行\n\n  数字从哪来：酒馆里的变量系统 MVU（不了解也没关系，按下面两行写就行）\n    简单说：MVU 让角色卡能\"记事\"——剧情进度、金钱、好感度这些存成这一层楼的变量，剧情推进时由 AI 更新。\n    读法就两行：var data = Mvu.getMvuData(); 然后 _.get(data, \"路径\") 取值（路径看变量结构，比如 stat_data.金钱）。\n    取到之后：固定字段填格子，列表类遍历着填；MVU 更新完会通知前端，界面跟着重画。\n    拿不到 Mvu（对方没装 MVU / 这层楼没有变量）要优雅降级：显示占位文字，别报错白屏。\n\n  实现提示（都在同一个模板里做，不要跳转页面）\n    · 演出页和返回页是「同一个 iframe 里的两个视图」：用一个 class（例如 .gv-view-menu）切换；\n      点返回时切视图，不要用 location / window.open（沙箱里会失败）。\n    · 返回按钮放工具条或画面角落，id 自己起（不要占用上面那张\"必须保留的 id\"表）。\n    · 返回页的样式照这一层的风格写，不要引入外链字体 / 图片。\n\n交卷前自检（这几条不过就别交）：\n  1) 比例是你在 CSS 里定的（默认竖版 9/19.5；换横版/方形就改 .gv-phone 的 aspect-ratio），宽度是 width:100%，没写死 px；\n  2) 对话框贴在手机框最底部、没有超出手机框；背景 / 立绘 / 贴纸全在手机框内；\n  3) 没有用 vh / vw / position: fixed；\n  4) 有 ctx._post(\"frameSize\", {w,h})（量【.gv-phone 缩放后的 rect】）+ ctx._post(\"resize\", 高度)；\n  5) 上面那张“必须保留的 id”表里的 id 一个都没少（尤其 #vol* 那一串和 data-a 那七个）。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready                加载好了，把数据给我\n  宿主 → 模板   init(payload)        lines / backgrounds / faces / bubbles / bgmAt / seAt / volume …\n  模板 → 宿主   bgm(名字) / se(名字)  放歌 / 放音效；名字为空 = 停\n  模板 → 宿主   volume({bgm,se})     两个音量（0~1）\n  模板 → 宿主   bgmQuery             问当前进度；宿主回 bgmState({name,t,dur,paused})\n  模板 → 宿主   bgmSeekPct(0~1)      拖进度    bgmReplay / bgmPause  重播 / 暂停·继续\n  模板 → 宿主   save(文本)           保存这一楼文本\n  模板 → 宿主   frameSize({w,h})     上报尺寸   error(消息)  出错上报\n  模板 → 宿主   edit / copy / up / down / delete / toggle-user-avatar   菜单按钮\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        <!--gv-audio--><span class=\"gv-tb\" data-a=\"volume\" id=\"btnVol\" title=\"调整 BGM / 音效 的音量\">调整音量</span><!--/gv-audio-->\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    <!--gv-audio--><div class=\"gv-vol\" id=\"vol\">\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音频</span><input class=\"gv-vol-rng\" id=\"volBgm\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volBgmPc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音效</span><input class=\"gv-vol-rng\" id=\"volSe\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volSePc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">进度</span><input class=\"gv-vol-rng\" id=\"volPos\" type=\"range\" min=\"0\" max=\"1000\" step=\"1\" value=\"0\"><span class=\"gv-vol-pc\" id=\"volPosPc\">0:00</span><span class=\"gv-vol-btn\" id=\"volReplay\">重播</span></div>\n      <div class=\"gv-vol-tip\">拖到 0 就是静音；音量记在这台设备上；进度条跟着 BGM 走</div>\n    </div><!--/gv-audio-->\n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>\n```\n```css\n/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n/* ============================================================\n   横版覆盖（版式 = 横版 · 设计宽 640 · 640×360）\n   这一份是【追加在竖版 CSS 后面】的覆盖层：\n   手机框比例、立绘高度、对话框、音量面板、贴纸大小 换成横屏那种galgame 布局，\n   其余（背景铺满、演出动画、编辑器、气泡、HUD）沿用竖版那一套。\n   ============================================================ */\n.gv-phone {\n  width: min(100%, 640px);\n  aspect-ratio: 16 / 9;\n  max-height: none;\n  border-radius: 14px;\n}\n/* 立绘: 横屏时别顶到顶, 留一点天花板 (画了占位框的话, 以框的高度为准) */\n.gv-sprite { height: var(--gv-h, 94%); }\n/* 对话框: 横屏做成\"底部一条\" —— 别占满整屏, 文字也小一号 */\n.gv-ui { padding: 0 12px 10px; }\n.gv-box { min-height: 0; border-radius: 12px; padding: 12px 14px 13px; }\n.gv-text { font-size: 14.5px; line-height: 1.62; min-height: 3em; }\n.gv-name { font-size: 13px; top: -12px; padding: 3px 12px; }\n.gv-uava { width: 36px; height: 36px; top: -11px; border-radius: 10px; }\n/* 音量面板: 横屏上下更矮, 所以往中间收一点 */\n.gv-vol { top: 6%; left: 18%; right: 18%; }\n/* 气泡贴纸: 屏幕矮, 30% 太大 */\n.gv-sticker { width: 17%; }\n.gv-bubble { font-size: 26px; }\n/* 提示条 / HUD 的位置微调 */\n.gv-tpl-toast { bottom: 10px; font-size: 11.5px; }\n.gv-hud { padding: 6px 6px 2px; }\n```\n```js\n/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 640;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n/*gv-audio*/\n/* ---- 声音: 自己播 (data: 能用就自己放, 否则叫宿主) ----\n   __gvAudioV4__  ← 这一块的\"新版\"标记。必须落在这段的【截取范围内】:\n   插件给老方案补这一块时靠它判断补没补过, 标记在范围外 -> 每次打开插件都会再补一份 (老方案的 JS 被叠过几十份)\n   ★ 自检: window.__gvAudio 里记着调用/命中/播放次数, 探针能直接看是哪一步没走到 */\n/* 老快照(页面排版里存过的)可能没有 $ 的定义 -> 这一整块一开头就 ReferenceError, 什么都装不上。\n   这里补一个兜底: 没有就自己造一个 (有就什么都不做) */\ntry { if (typeof window.$ !== 'function') window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}\nvar bgmEl = null, seEl = null, bgmNow = '';\nwindow.__gvAudio = { calls: 0, miss: 0, played: 0, se: 0, err: '', ready: false };\nfunction volNow(){ var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : {}; return { bgm: c.bgm == null ? .8 : c.bgm, se: c.se == null ? .8 : c.se }; }\nfunction ensureAudio(){ if (bgmEl) return true; try { bgmEl = new Audio(); bgmEl.loop = true; seEl = new Audio(); window.__gvAudio.ready = true; return true; } catch (e) { window.__gvAudio.err = String(e); return false; } }\nfunction hasLocalAudio(){ return !!(ctx.audioBgm && Object.keys(ctx.audioBgm).length) || !!(ctx.audioSe && Object.keys(ctx.audioSe).length); }\n/* __gvAudioV2__ : 沙箱 iframe 是独立源, 默认没有自动播放权限 -> 自己 play() 永远 NotAllowedError。\n   所以声音一律由【宿主】放: 预览里是插件(普通源), 真机上是引擎。 */\nfunction playBgm(name, tries){\n  window.__gvAudio.calls++;\n  if (!name) return;\n  bgmNow = name;\n  ctx._post('bgm', name);\n}\nfunction playBgmLocal(name){\n  var u = (ctx.audioBgm || {})[name];\n  if (!u) return;\n  if (!ensureAudio()) return;\n  if (bgmEl.src && !bgmEl.paused) return;\n  bgmEl.src = u; bgmEl.volume = volNow().bgm;\n  try { bgmEl.play().catch(function(){}); } catch (e) {}\n}\nfunction playSe(name, tries){\n  if (!name) return;\n  ctx._post('se', name);                 // 同样交给宿主放\n  window.__gvAudio.se++;\n}\n\n/*gv-audio*/\n/* ---- 音量: 两个滑块, 拖到 0 = 静音; 自己放的话直接改自己的音量, 值也给宿主存 ---- */\nfunction toggleVol(){ var v = $('vol'); if (!v) return;\n  /* ★ 一次点击只认一次: 老方案里这块代码被补过重复的 [data-a] 处理器, 点一下会 toggle 两三回\n     -> 音量面板\"闪一下就没了\"。150ms 内的重复调用直接吞掉 (真手速不可能这么快) */\n  var _tv = Date.now();\n  if (toggleVol.__at && _tv - toggleVol.__at < 150) return;\n  toggleVol.__at = _tv;\n  v.classList.toggle('gv-open');\n  if (v.classList.contains('gv-open')) { syncVol(); try { ctx._post('bgmQuery'); } catch (e) {}\n    if (!volTimer) volTimer = setInterval(volPoll, 600); }\n  else if (volTimer) { clearInterval(volTimer); volTimer = null; } }\n/* ★ 独立监听: 老模板里的 [data-a] 处理器不认识 volume, 这里自己兜住 (它多发的那条消息无害) */\ntry {\n  var _vbtn = document.querySelector('[data-a=\"volume\"]');\n  if (_vbtn) _vbtn.addEventListener('click', function (e) { e.stopPropagation(); setTimeout(toggleVol, 0); });\n} catch (e) {}\nfunction syncVol(){\n  var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : { bgm: 0.8, se: 0.8 };\n  var b = $('volBgm'), s = $('volSe');\n  if (b) { b.value = String(Math.round((c.bgm != null ? c.bgm : 0.8) * 100)); }\n  if (s) { s.value = String(Math.round((c.se != null ? c.se : 0.8) * 100)); }\n  volLabel();\n}\nfunction volLabel(){\n  var b = $('volBgm'), s = $('volSe'), bp = $('volBgmPc'), sp = $('volSePc');\n  if (bp && b) bp.textContent = b.value + '%';\n  if (sp && s) sp.textContent = s.value + '%';\n}\n/* ---- 进度条 + 重播: 音频在宿主那边, 所以靠消息问/发 ---- */\nvar volTimer = null, volDragging = false;\nfunction fmtT(sec){ sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }\nfunction volPoll(){\n  if (!($('vol') || {}).classList || !$('vol').classList.contains('gv-open')) { clearInterval(volTimer); volTimer = null; return; }\n  if (!volDragging) ctx._post('bgmQuery');\n}\nctx.on('bgmState', function (st) {\n  st = st || {};\n  var r = $('volPos'); if (!r) return;\n  var dur = Number(st.dur) || 0, t = Number(st.t) || 0;\n  if (dur > 0) r.value = String(Math.round(t / dur * 1000));\n  var pc = $('volPosPc'); if (pc) pc.textContent = fmtT(t) + ' / ' + fmtT(dur);\n  r.disabled = !dur;\n});\n$('volPos').addEventListener('pointerdown', function () { volDragging = true; });\n$('volPos').addEventListener('pointerup', function () { volDragging = false; });\n$('volPos').addEventListener('input', function (e) {\n  e.stopPropagation();\n  ctx._post('bgmSeekPct', Number(this.value) / 1000);\n});\n$('volReplay').addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmReplay'); });\n/*gv-pause*/\n/* ---- 暂停 / 继续: 音频在宿主那边放, 所以点一下发条消息让它停 / 接着放 ----\n   按钮用 JS 造 (不依赖 HTML), 老模板补丁也能把这一整块追加进去 */\ntry {\n  var _vp = $('volPause');\n  if (!_vp) {\n    _vp = document.createElement('span');\n    _vp.id = 'volPause'; _vp.className = 'gv-vol-btn'; _vp.textContent = '暂停';\n    _vp.title = '暂停 / 接着放 BGM';\n    var _vpRow = $('volReplay') ? $('volReplay').parentNode : null;\n    if (_vpRow) _vpRow.appendChild(_vp);\n  }\n  /* ★ 老快照可能被补过不止一份 -> 装过的就别再装一遍 (两份监听 = 点一下发两条 = 停了又接着放) */\n  if (!_vp.__gvPauseOn) {\n    _vp.__gvPauseOn = 1;\n    _vp.addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmPause'); });\n  }\n  if (!ctx.__gvPauseLabel) {\n    ctx.__gvPauseLabel = 1;\n    ctx.on('bgmState', function (st) {\n      try { var b = $('volPause'); if (b && st && typeof st.paused === 'boolean') b.textContent = st.paused ? '继续' : '暂停'; } catch (e) {}\n    });\n  }\n} catch (e) {}\n/*/gv-pause*/\n/* ★ 面板右上角的关闭按钮 (用 JS 造, 老模板也能自动拿到, 不会重复插一份面板) */\ntry {\n  var _vbox = $('vol');\n  if (_vbox && !$('volX')) {\n    var _vx = document.createElement('span');\n    _vx.id = 'volX'; _vx.className = 'gv-vol-x'; _vx.textContent = '×'; _vx.title = '关闭音量面板';\n    _vx.addEventListener('click', function (e) {\n      e.stopPropagation();\n      $('vol').classList.remove('gv-open');\n      if (volTimer) { clearInterval(volTimer); volTimer = null; }\n    });\n    _vbox.appendChild(_vx);\n  }\n} catch (e) {}\n$('volBgm').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number(this.value) / 100, se: Number($('volSe').value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('volSe').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number($('volBgm').value) / 100, se: Number(this.value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('vol').addEventListener('click', function(e){ e.stopPropagation(); });\n\n/*/gv-audio*/\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  /*gv-audio*/ try { var b0 = (ctx.bgmAt || [])[0]; if (b0) playBgm(b0.name); else ctx._post('bgm', ''); } catch (e) {} /*/gv-audio*/\n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });\n```","charLandNoAudio":"★ 这一份是【横版 · 无音频】的默认预设：横版 640×360（16 / 9）宽屏，而且【不要】音频那一整套（同「竖版 · 无音频」）。\n\n======================================================================\n一、仿文字游戏的 CHAR 楼层（提示词 · 横版 · 无音频）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【仿文字游戏的 CHAR 楼层】：角色说话那一层。手机框 + 背景层 + 立绘层 + 对话框 + 气泡贴纸 + HUD + 工具条菜单 +\n  音量面板 + 模板自带的\"改这一楼\"编辑器。\n  必须有的结构（宿主 / 模板自己都会找这些 id）：\n    gv-root + #phone（最外层和手机框，宿主靠 gv-root 判断模板是否完整）\n    #bgA #bgB（两层背景，交叉淡入） #dim #flash（压暗 / 闪白） #stage（立绘层）\n    #sticker + #stickerImg（气泡贴纸）\n    #box 里：#uava（头像）#name（名字）#text（正文，内部要有 #caret 光标）#next（继续箭头）\n    #dots（进度点）#auto（自动）#replay（重播）\n    .gv-toolbar + #btnEdit + #popup，菜单项用 data-a：edit / copy / up / down /\n    toggle-user-avatar / volume / delete（宿主按这个认功能，名字不能改）\n    #vol 音量面板：#volBgm #volSe（滑块）#volBgmPc #volSePc（百分比）#volPos #volPosPc（进度）\n    #volReplay #volPause #volX\n    #editor + #ta + #bSave + #bCancel（模板自带的编辑器）\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  尺寸与比例（【比例由你自己的 CSS 定，任意比例都要能做】）：\n    · 手机框的宽高比写在 CSS 里：默认竖版 aspect-ratio: 9 / 19.5（400px 宽 → 约 867px 高）。\n      要做横版就写 16 / 9（常见 640×360、960×540），方形写 1 / 1（常见 600×600）—— 随你。\n    · 宽度别写死：用 width: 100%（撑满宿主给的那点宽度，默认 400px）；高度交给 aspect-ratio。\n      · 制作器里「版式」选横版时，这一层用的是 640×360 的宽屏模板（同一套 HTML/JS，只是 CSS 覆盖成横屏；\n        设计宽度 640）—— 你写的时候只要保证「比例由 CSS 定、能自适应」这两条，横竖都能跑。\n      宿主允许的范围：宽约 200~700px、高约 260~1200px。\n    · 宿主会把你渲染出来的手机框实测尺寸记成「方案的定位框 宽/高」（预览外框跟着它走），\n      所以你 CSS 里写什么比例，成品就是什么比例 —— 别写 min(100%, 960px) 这种硬编码宽度，也别用 vh / vw。\n    · 所有层（#bgA #bgB / #stage / #box / #sticker）都必须【在手机框里面】用 position: absolute 定位\n      （相对 .gv-phone），不要贴到 body / iframe 上。\n    · 对话框那一块（.gv-ui > .gv-box）贴在手机框底部：left:0; right:0; bottom:0，别让它溢出手机框。\n    · 参考模板里这几条必须保留（颜色圆角随便改，定位别改）：\n      .gv-bgs { position:absolute; inset:0; }   .gv-ui { position:absolute; left:0; right:0; bottom:0; }\n      .gv-stage { position:absolute; inset:0; }   .gv-phone { aspect-ratio: 9 / 19.5; }（默认竖版，你想换比例就改这一行）\n  状态类：.gv-on（开着）.gv-hide（藏起来）.gv-open（音量面板展开）\n  音量面板：.gv-vol 及内部 .gv-vol-row .gv-vol-lb .gv-vol-rng .gv-vol-pc .gv-vol-btn .gv-vol-x\n  演出效果类：.gv-shake .gv-flashin .gv-zoom .gv-fade 之类（AI 在台词里写\"演出效果\"时挂上去的）\n  气泡入场动画：.gv-b-xxx 一类（名字要跟 JS 里 showSticker 用的对得上）\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", payload => …) 拿数据；之后交互都用 ctx._post。\n  2) 逐行渲染：payload.lines[]（每行 {name, face, text, fx, slot, se, isNarr}）→ 打字机 →\n     点一下 / 自动播放推进；旁白和角色行样式不同。\n  3) 背景 / 立绘：payload.backgrounds 按 【bg:】 事件切换（#bgA/#bgB 交叉淡入）；\n     payload.faces + 每张图的 fit（x/y/scale）写进 transform。\n  4) 气泡贴纸：payload.bubbles（名字 → 图）→ 在 .gv-phone 里按百分比摆一张。落点是【三档，按优先级取】：\n     payload.bubblePosEach[贴纸名]  →  payload.bubblePosSlot[当前行的 slot]  →  payload.bubblePos（默认）\n     每档都是 {x, y, scale}（x/y 是气泡【中心点】的百分比）。当前行的站位 = line.slot；旁白、以及没写站位的行，\n     slot 是空串 —— 那就别去查 bubblePosSlot，直接用默认那档。入场动画 payload.bubbleAnim[贴纸名]、自定义动画 payload.bubbleCss。\n  5) 演出效果：payload.fxAliases / 自定义 effects → 给角色或整屏加类。\n  6) 声音：payload.bgmAt / seAt（{at: 行号, name}）→ ctx._post(\"bgm\", 名字) / (\"se\", 名字)。\n     地址可能是 data: 也可能是 http；格式可能是 mp3，也可能是 opus(ogg)（制作器导出时会把大的音频压成 Opus）——\n     你只管把宿主给的地址交给 <audio> / new Audio()，不要按扩展名做判断。\n     ★ 暂停 / 继续只发 ctx._post(\"bgmPause\")。不要在 document 上挂 click / touchstart 去「补播」音频：\n       浏览器自动播放限制宿主已经处理了，自己补播会把用户按下的暂停冲掉（真机上实测过这个坑：暂停后点哪都重新响）。\n  7) 音量面板：滑块 / 进度 / 重播 / 暂停都走消息（见下表）。\n  8) 菜单：data-a 那些项点了发对应消息；9) 编辑器 #bSave → ctx._post(\"save\", 文本)。\n 10) 高度上报：量【.gv-phone 的 getBoundingClientRect()】发 ctx._post(\"frameSize\", {w,h})（量 body 会算错）；出错 try/catch 后\n     ctx._post(\"error\", 消息)，不要静默失败。\n 11) 自适应（重要）：设计宽度自己定一个（默认 400px，和 CSS 里手机框那套尺寸对齐）。容器比它窄时整块等比缩小：\n     在 #phone 外面的根节点上写 .gv-root { transform: scale(取小(容器宽 / 设计宽, 1)); transform-origin: 50% 0; }\n     （比例最好用 CSS 变量 --gv-scale 传进去）。下面三条必须一起做，少一条就是 bug：\n     ① 缩小时把手机框 width 钉成设计宽（400px）+ max-width: none + flex: 0 0 auto —— 不然 flex / 百分比先把它压扁，\n        再乘一次 scale 就成「缩两次」，看起来越缩越小；\n     ② 缩小时给 html 加 overflow: hidden —— transform 不改布局盒，缩完下面会多出一截空白滚动区；\n     ③ 上报尺寸：宽度一律报【容器宽】(document.documentElement.clientWidth)，绝对不能报缩放后的手机宽 ——\n        宿主 / 预览会拿它当外框宽，等于把缩放结果又喂回去，会一轮轮越缩越小（300→225→169→127）；\n        高度报【缩放后的视觉高度】(rect.height)，并同时发 ctx._post(\"resize\", 高度)（真机的外框高度靠它）。\n\n可选功能：演出之外的「第二个页面」（默认模板里【没有】这个，用户要求、或者你自己先问一句再加）\n  做法：演出页上加一个返回按钮，点了退出演出、进到另一个页面；在那个页面上再点返回，就回到演出。\n\n  那一页放什么要看卡的类型 —— 别自己硬编内容，先问用户三件事：\n    ① 要不要这个返回页  ② 页面上要显示什么  ③ 里面的数字从哪来\n  举例：\n    · 经营类的卡 → 返回页做成「经营菜单」（金钱 / 库存 / 菜单 / 雇员 / 今日流水…）\n    · 冒险类的卡 → 返回页做成「地图界面」（地点列表 / 已探索 / 当前所在…）\n    · 别的：状态栏、角色图鉴、背包、小游戏（猜谜 / 翻牌 / 数字游戏）都行\n\n  数字从哪来：酒馆里的变量系统 MVU（不了解也没关系，按下面两行写就行）\n    简单说：MVU 让角色卡能\"记事\"——剧情进度、金钱、好感度这些存成这一层楼的变量，剧情推进时由 AI 更新。\n    读法就两行：var data = Mvu.getMvuData(); 然后 _.get(data, \"路径\") 取值（路径看变量结构，比如 stat_data.金钱）。\n    取到之后：固定字段填格子，列表类遍历着填；MVU 更新完会通知前端，界面跟着重画。\n    拿不到 Mvu（对方没装 MVU / 这层楼没有变量）要优雅降级：显示占位文字，别报错白屏。\n\n  实现提示（都在同一个模板里做，不要跳转页面）\n    · 演出页和返回页是「同一个 iframe 里的两个视图」：用一个 class（例如 .gv-view-menu）切换；\n      点返回时切视图，不要用 location / window.open（沙箱里会失败）。\n    · 返回按钮放工具条或画面角落，id 自己起（不要占用上面那张\"必须保留的 id\"表）。\n    · 返回页的样式照这一层的风格写，不要引入外链字体 / 图片。\n\n交卷前自检（这几条不过就别交）：\n  1) 比例是你在 CSS 里定的（默认竖版 9/19.5；换横版/方形就改 .gv-phone 的 aspect-ratio），宽度是 width:100%，没写死 px；\n  2) 对话框贴在手机框最底部、没有超出手机框；背景 / 立绘 / 贴纸全在手机框内；\n  3) 没有用 vh / vw / position: fixed；\n  4) 有 ctx._post(\"frameSize\", {w,h})（量【.gv-phone 缩放后的 rect】）+ ctx._post(\"resize\", 高度)；\n  5) 上面那张“必须保留的 id”表里的 id 一个都没少（尤其 #vol* 那一串和 data-a 那七个）。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready                加载好了，把数据给我\n  宿主 → 模板   init(payload)        lines / backgrounds / faces / bubbles / bgmAt / seAt / volume …\n  模板 → 宿主   bgm(名字) / se(名字)  放歌 / 放音效；名字为空 = 停\n  模板 → 宿主   volume({bgm,se})     两个音量（0~1）\n  模板 → 宿主   bgmQuery             问当前进度；宿主回 bgmState({name,t,dur,paused})\n  模板 → 宿主   bgmSeekPct(0~1)      拖进度    bgmReplay / bgmPause  重播 / 暂停·继续\n  模板 → 宿主   save(文本)           保存这一楼文本\n  模板 → 宿主   frameSize({w,h})     上报尺寸   error(消息)  出错上报\n  模板 → 宿主   edit / copy / up / down / delete / toggle-user-avatar   菜单按钮\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        \n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    \n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>\n```\n```css\n/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n/* ============================================================\n   横版覆盖（版式 = 横版 · 设计宽 640 · 640×360）\n   这一份是【追加在竖版 CSS 后面】的覆盖层：\n   手机框比例、立绘高度、对话框、音量面板、贴纸大小 换成横屏那种galgame 布局，\n   其余（背景铺满、演出动画、编辑器、气泡、HUD）沿用竖版那一套。\n   ============================================================ */\n.gv-phone {\n  width: min(100%, 640px);\n  aspect-ratio: 16 / 9;\n  max-height: none;\n  border-radius: 14px;\n}\n/* 立绘: 横屏时别顶到顶, 留一点天花板 (画了占位框的话, 以框的高度为准) */\n.gv-sprite { height: var(--gv-h, 94%); }\n/* 对话框: 横屏做成\"底部一条\" —— 别占满整屏, 文字也小一号 */\n.gv-ui { padding: 0 12px 10px; }\n.gv-box { min-height: 0; border-radius: 12px; padding: 12px 14px 13px; }\n.gv-text { font-size: 14.5px; line-height: 1.62; min-height: 3em; }\n.gv-name { font-size: 13px; top: -12px; padding: 3px 12px; }\n.gv-uava { width: 36px; height: 36px; top: -11px; border-radius: 10px; }\n\n```\n```js\n/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 640;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  \n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });\n```","user":"======================================================================\n二、与 CHAR 楼层配套的 USER 楼层（提示词）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【与 CHAR 楼层配套的 USER 楼层】：玩家那一层，平时只有一条 userbar（头像 + 名字 + 正文 + 「编辑」按钮），点「编辑」展开操作菜单和\n  一个文本框。没有背景 / 立绘 / 音频。\n  必须有的结构（宿主 / 模板自己都会找这些 id）：\n    .gv-userbar-wrap #wrap（最外层）  .gv-userbar  .gv-ubar-main\n    .gv-uava #uava（头像）  .gv-utext 里 <b id=\"uname\">（名字）+ <span id=\"utext\">（正文）\n    #editBtn（展开 / 收起那一行）\n    .gv-ubar-extra #extra（展开区）里 .gv-ubar-actions #acts，菜单项用 data-a：\n    edit / copy / up / down / toggle-user-avatar / delete / close\n    .gv-ubar-editor #ed 里：#ta（文本框）+ #bSave（确认修改）+ #bCancel（退出修改）\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  结构类：.gv-userbar-wrap .gv-userbar .gv-ubar-main .gv-uava .gv-utext .gv-ubar-btn .gv-ubar-extra\n          .gv-ubar-actions .gv-ubar-editor .gv-tb .gv-primary .gv-danger .gv-toggle\n  状态类：.gv-on / .gv-hide（宿主会加）\n  这一层的类名少，配色排版随便换，但上面这些名字不能改\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", …)（payload 里是 {name, text, avatar}）。\n  2) 把名字 / 正文 / 头像填进对应元素（没有头像就不显示 #uava）。\n  3) 「编辑」按钮：展开 / 收起 #extra；菜单项 [data-a] 保留给宿主处理（复制 / 上移 / 下移 /\n     删除 / 关闭 / 显示头像），模板不用自己实现。\n  4) #bSave → ctx._post(\"save\", 文本框里的内容)；#bCancel 收起编辑器。\n  5) 高度上报 ctx._post(\"frameSize\", {w,h})。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready        加载好了   宿主 → 模板   init({name, text, avatar})\n  模板 → 宿主   save(文本)   保存这一楼正文\n  模板 → 宿主   frameSize({w,h})  上报尺寸\n  模板 → 宿主   edit / copy / up / down / delete / close / toggle-user-avatar   菜单按钮\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套玩家楼层 (引擎内置 userbar 的原样移植) -->\n<div class=\"gv-userbar-wrap\" id=\"wrap\">\n  <div class=\"gv-userbar\">\n    <div class=\"gv-ubar-main\">\n      <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n      <div class=\"gv-utext\"><b id=\"uname\"></b><span id=\"utext\"></span></div>\n      <span class=\"gv-ubar-btn\" id=\"editBtn\" title=\"展开操作\">编辑</span>\n    </div>\n    <div class=\"gv-ubar-extra\" id=\"extra\">\n      <div class=\"gv-ubar-actions\" id=\"acts\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\">上移</span>\n        <span class=\"gv-tb\" data-a=\"down\">下移</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"uaBtn\">显示头像</span>\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\">删除</span>\n        <span class=\"gv-tb\" data-a=\"close\">关闭</span>\n      </div>\n      <div class=\"gv-ubar-editor\" id=\"ed\">\n        <textarea id=\"ta\"></textarea>\n        <div class=\"row\">\n          <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n          <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n```\n```css\n/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: 100%;\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n```\n```js\n/* 玩家楼层: 卡里那套 (一行 + 展开操作 + 自建编辑器) */\nfunction $(id){ return document.getElementById(id); }\nvar wrap = $('wrap'), editBtn = $('editBtn'), ed = $('ed'), ta = $('ta');\nvar ua = $('uava'), uname = $('uname'), utext = $('utext'), uaBtn = $('uaBtn');\n\nfunction showBar(c){\n  c = c || ctx;\n  var u = c.avatar || '';\n  if (u) { ua.src = u; ua.style.display = ''; } else { ua.style.display = 'none'; }\n  uname.textContent = c.name || '';\n  utext.textContent = String(c.text || '').replace(/^\\s*[（(][^）)]*[）)]\\s*/, '');\n  ta.value = String(c.text || '');\n  uaBtn.classList.toggle('gv-on', !!u);\n  uaBtn.textContent = u ? '关闭头像' : '显示头像';\n}\n\neditBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = wrap.classList.toggle('gv-open');\n  editBtn.textContent = open ? '关闭' : '编辑';\n  if (!open) ed.classList.remove('gv-open');\n});\nfunction tplToast(msg){\n  var t = document.createElement('div');\n  t.className = 'gv-tpl-toast'; t.textContent = msg;\n  wrap.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeAll(){ ed.classList.remove('gv-open'); wrap.classList.remove('gv-open'); editBtn.textContent = '编辑'; }\nArray.prototype.forEach.call(document.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    if (a === 'edit') { ed.classList.toggle('gv-open'); if (ed.classList.contains('gv-open')) ta.focus(); return; }\n    if (a === 'save') { ctx._post('save', ta.value); closeAll(); return; }\n    if (a === 'close') { closeAll(); return; }\n    ctx._post(a);\n  });\n});\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('save', ta.value); closeAll(); });\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); ed.classList.remove('gv-open'); });\ned.addEventListener('click', function(e){ e.stopPropagation(); });\nctx.on('init', showBar);\nctx.on('openEditor', function(){ ed.classList.add('gv-open'); wrap.classList.add('gv-open'); editBtn.textContent = '关闭'; ta.focus(); });\n```","panel":"======================================================================\n三、与 CHAR 楼层配套的悬浮窗（提示词）\n======================================================================\n\n开工之前（先别写代码）\n  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：\n    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）\n    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）\n    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …\n    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走\n  用户已经说清楚的项就别再问；他说\"你看着办\"就自己定，但要在回复开头用一两行写清你定的风格和配色。\n  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。\n\n这一层是什么 / 要做什么 / HTML 结构要求\n  这一层是【与 CHAR 楼层配套的悬浮窗】（制作器那个浮窗，显示楼层的附加内容）：上面一条标题栏（计数 + 一排按钮），下面是内容列表；\n  它自己还带三个内嵌页面（提示词 / 兜底转换 API / 导入素材包），并且能拖动、改大小、收成小球。\n  必须有的结构：\n    .gv-panel #panel（最外层）  .gv-panel-head #head（标题栏）\n    标题栏按钮：.gv-panel-title  .gv-panel-count #count  .gv-panel-spacer\n    #btnRaw（渲染 / 源码） #btnPrompt（词） #btnPack（包） #btnConv（转） #btnRedraw（重绘）\n    #btnFold（收小球） #btnMini（关闭）\n    .gv-panel-body #body（内容列表）\n    内嵌页面 .gv-sheet #sheet 里：.gv-sheet-head #sheetTitle + #sheetX  .gv-sheet-body #sheetBody\n    .gv-sheet-foot #sheetFoot\n\n通用规则（三份提示词里都写了，改的时候三份一起改）\n\n沙箱限制（很容易踩）\n  1) iframe 是 sandbox=\"allow-scripts\"（独立源）：只能加载 data: 和它自己造的 blob:，\n     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。\n  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；\n     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。\n  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。\n\n输出格式（硬要求，一次回复就把三块给全）\n  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。\n  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，\n  写错或漏写就会进错框 / 加载失败。\n    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。\n    · css 那块：只写 CSS，不写 <style> 标签。\n    · js 那块：只写 JS，不写 <script> 标签。\n  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段\n  （\"其余同上\"\"省略\"\"按上面自己补\"都不行 —— 三块都得给全，一次给完）。\n  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。\n  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。\n     （var / function）就行。\n\n沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）\n  能用：\n  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：\n    · Font Awesome 全套图标 —— <i class=\"fa-solid fa-heart\"></i> / <i class=\"fa-regular fa-star\"></i> / <i class=\"fa-brands fa-github\"></i>\n    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）\n    · highlight.js —— <pre><code class=\"language-js\">…</code></pre>，代码高亮（配色已带）\n    · Mermaid —— <div class=\"mermaid\">graph TD; A-->B;</div> 之类，画流程图\n    · animate.css —— class=\"animate__animated animate__bounce\" 之类的入场动画\n    · 内联 SVG、<img src=\"data:...\">、CSS 里的 data: 背景图\n    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。\n      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。\n    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出\n      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src=\"__gvasset:房间__\">。\n      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来\n    · <link rel=\"stylesheet\" href=\"https://...\"> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的\n      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）\n    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）\n  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。\n\nCSS 部分的要求\n  结构类：.gv-panel .gv-panel-head .gv-panel-title .gv-panel-count .gv-panel-spacer .gv-panel-btn\n          .gv-panel-body .gv-sheet .gv-sheet-head .gv-sheet-x .gv-sheet-body .gv-sheet-foot\n  列表项：.gv-panel-item .gv-panel-item-head .gv-pitem-name .gv-pitem-len .gv-pitem-tag\n          .gv-panel-actions .gv-act .gv-panel-item-body .gv-panel-inline-edit .gv-panel-inline-ta\n  状态类：.gv-on / .gv-mini（收成小球）/ .gv-editing / .gv-collapsed\n  注意：这一层里不能用 position: fixed，定位由宿主给的外框决定\n\nJS 部分的要求\n  1) 握手：ctx._post(\"ready\")；ctx.on(\"init\", c) 拿 {floors, prompt, convertCfg, panelBox, panelOffset}；\n     之后 ctx.on(\"floors\") 更新列表、ctx.on(\"toast\") 弹提示。\n  2) 列表渲染：floors 里每项是 {id, name, raw, html, story}：raw = 原文（「源码」模式显示它）；\n     ★ html = 【已经渲染好的 HTML 串】—— 里面的围栏代码块已经被宿主换成了「活 iframe」（卡片里的脚本也已经在跑）。\n       你直接 item.innerHTML = html 就行，【不要】自己去切三反引号围栏，也别再套一层白名单过滤。\n     每项显示 #id + 名字 + 字数 + 「有剧情」标记，点标题折叠 / 展开；每项一组操作：\n     编辑（整块换成文本框，确认后 ctx._post(\"saveFloor\", {id, text})）/ 复制 / 上移 / 下移 / 删除。\n  2b) 那些「活 iframe」的高度：它自己会用 parent.postMessage({__gvFit: 1, h}) 把内容高度报上来；\n     你监听 message，按 event.source 找到对应的 iframe.gv-rich-iframe，把高度设成 h + 10（h < 24 就当成空的收起来）。\n     不接这个上报，卡片会被压成一条缝、或者撑出一大截空白。\n     ★ 这些 iframe 是【黑盒】：里面的卡片脚本点一下就能把选项填进酒馆的输入框（引擎在沙箱里给它们装了假 parent，动作 postMessage 到最外层页面）。\n       所以别去清洗 / 重写 / 再包一层它的内容，也别给 iframe 加 sandbox、pointer-events: none、或自己截它的点击 —— 一拦，卡片里的按钮就又「点不开」了。\n     ★ 引擎是按「上级里有没有 #send_textarea」决定要不要给这层 iframe 接管 parent 的 —— 所以面板模板里**别放 id=\"send_textarea\" 的元素**：\n       放了引擎会以为上级就是酒馆页面、不接管，卡片点选项就又变成\"一点反应都没有\"（v1.0.9 修的就是这个坑）。\n  3) 三个内嵌页面：提示词（保存 → ctx._post(\"setPrompt\", 文本)）、兜底转换 API\n     （保存 → ctx._post(\"convertCfg\", {...})）、导入素材包（选文件 → ctx._post(\"packFile\", {name,size})）。\n  4) #btnRaw 切换\"渲染 / 源码\"显示；#btnRedraw → ctx._post(\"redraw\")；\n     #btnMini → ctx._post(\"closePanel\") 并把自己隐藏；#btnFold 收成小球 / 展开。\n  5) 拖动 → ctx._post(\"move\", {dx,dy})；右下角拖动改大小；尺寸变化后上报\n     ctx._post(\"resize\", 高度) + ctx._post(\"wantSize\", {w,h})（宿主靠它撑外框）。\n  6) 出错 try/catch 后 ctx._post(\"error\", 消息)。\n\n消息协议（宿主认这些类型名，不能自己发明）\n  模板 → 宿主   ready         宿主 → 模板   init({floors, prompt, convertCfg, panelBox, panelOffset})\n  宿主 → 模板   floors(列表) / toast(提示)\n  模板 → 宿主   saveFloor({id,text})   保存某一项\n  模板 → 宿主   setPrompt(文本) / convertCfg(配置) / packFile({name,size})\n  模板 → 宿主   redraw / closePanel   重绘 / 关闭浮窗\n  模板 → 宿主   move({dx,dy}) / resize(高度) / wantSize({w,h})\n  模板 → 宿主   error(消息)   出错上报\n\n输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。\n\n参考：这一层当前默认模板全文（照它写最稳）\n```html\n<!-- 卡里那套悬浮窗 (引擎 createPanel 的移植) + 自带三个页面(词/转/包), 不依赖宿主 -->\n<div class=\"gv-panel\" id=\"panel\">\n  <div class=\"gv-panel-head\" id=\"head\">\n    <span class=\"gv-panel-title\">楼层附加内容</span>\n    <span class=\"gv-panel-count\" id=\"count\">0</span>\n    <span class=\"gv-panel-spacer\"></span>\n    <span class=\"gv-panel-btn\" id=\"btnRaw\" title=\"渲染 / 源码\">Aa</span>\n    <span class=\"gv-panel-btn\" id=\"btnPrompt\" title=\"格式提示词（发给 AI 的）\">词</span>\n    <span class=\"gv-panel-btn\" id=\"btnPack\" title=\"素：导入高清素材包 (.zip) / 清除浏览器素材缓存\">素</span>\n    <span class=\"gv-panel-btn\" id=\"btnConv\" title=\"兜底转换 API 设置\">转</span>\n    <span class=\"gv-panel-btn\" id=\"btnRedraw\" title=\"重绘\">↻</span>\n    <span class=\"gv-panel-btn\" id=\"btnFold\" title=\"收成小球\">–</span>\n    <span class=\"gv-panel-btn\" id=\"btnMini\" title=\"关闭悬浮窗\">✕</span>\n  </div>\n  <div class=\"gv-panel-body\" id=\"body\"></div>\n\n  <!-- 三个内嵌页面: 自己在模板里画, 没有宿主也能开 -->\n  <div class=\"gv-sheet\" id=\"sheet\">\n    <div class=\"gv-sheet-head\"><span id=\"sheetTitle\">页面</span><span class=\"gv-sheet-x\" id=\"sheetX\">✕</span></div>\n    <div class=\"gv-sheet-body\" id=\"sheetBody\"></div>\n    <div class=\"gv-sheet-foot\" id=\"sheetFoot\"></div>\n  </div>\n</div>\n```\n```css\n\n/* ============================================================\n   悬浮窗: 各楼层的\"正文之外那一大坨\"\n   走酒馆自己的显示管线渲染 -> 预设正则(折叠思维链/摘要/选项按钮)全部生效\n   ============================================================ */\n\n/* ★ 这一层整页都在沙箱 iframe / 预览框里: 整页禁止出滚动条 (那条丑的谷歌原生滚动条就是它出来的) */\nhtml, body { overflow: hidden !important; scrollbar-width: none; margin: 0; background: transparent; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n.gv-panel, .gv-panel * { box-sizing: border-box; }\n.gv-panel {\n  position: fixed; top: 78px; right: 16px; z-index: 2147483000;\n  width: 360px; height: auto; max-height: calc(100vh - 16px); min-width: 220px; min-height: 90px;\n  display: flex; flex-direction: column; overflow: hidden;\n  border-radius: 14px;\n  background: rgba(13,15,23,.93);\n  border: 1px solid rgba(255,255,255,.16);\n  box-shadow: 0 12px 40px rgba(0,0,0,.6);\n  backdrop-filter: blur(12px) saturate(1.2); -webkit-backdrop-filter: blur(12px) saturate(1.2);\n  color: #e6e9f2; font-size: 12.5px;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-panel-head {\n  display: flex; align-items: center; gap: 6px;\n  padding: 8px 10px; cursor: move; flex: 0 0 auto;\n  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03));\n  border-bottom: 1px solid rgba(255,255,255,.10);\n}\n.gv-panel-title { font-weight: 700; font-size: 12.5px; letter-spacing: .3px; white-space: nowrap; }\n.gv-panel-count { background: #ff8fb1; color: #10121a; border-radius: 999px; padding: 0 7px; font-size: 11px; font-weight: 700; line-height: 16px; }\n.gv-panel-spacer { flex: 1; }\n.gv-panel-btn {\n  cursor: pointer; width: 21px; height: 21px; line-height: 21px; text-align: center;\n  border-radius: 6px; background: rgba(255,255,255,.09); font-size: 11px; transition: background .15s;\n}\n.gv-panel-btn:hover { background: rgba(255,255,255,.24); }\n.gv-panel-btn.gv-on { background: #ff8fb1; color: #10121a; font-weight: 700; }\n.gv-panel.gv-folded .gv-panel-body { display: none; }\n.gv-panel.gv-mini { width: auto !important; height: auto !important; }\n.gv-panel.gv-mini .gv-panel-title,\n.gv-panel.gv-mini .gv-panel-body,\n.gv-panel.gv-mini .gv-panel-btn:not(:last-child) { display: none; }\n\n.gv-panel-body { overflow: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; user-select: text; flex: 1 1 auto; min-height: 0; }\n.gv-panel-body::-webkit-scrollbar { width: 8px; }\n.gv-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 4px; }\n\n.gv-panel-item { border: 1px solid rgba(255,255,255,.10); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.035); display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }\n.gv-panel-item-head {\n  flex: 0 0 auto;\n  display: flex; align-items: center; gap: 6px; padding: 6px 9px; cursor: pointer;\n  background: rgba(255,255,255,.055); font-size: 12px;\n}\n.gv-panel-item-head:hover { background: rgba(255,255,255,.10); }\n.gv-panel-item-head b { color: #ff9fc0; font-variant-numeric: tabular-nums; }\n.gv-pitem-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .9; }\n.gv-pitem-len { opacity: .5; font-size: 11px; white-space: nowrap; }\n.gv-pitem-tag { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: rgba(127,209,255,.18); color: #9fd8ff; white-space: nowrap; }\n\n/* 每楼的动作按钮 (对应原生 Edit 里那一排) */\n.gv-panel-actions {\n  display: flex; gap: 4px; flex-wrap: wrap; padding: 5px 8px; flex: 0 0 auto;\n  background: rgba(0,0,0,.22); border-bottom: 1px solid rgba(255,255,255,.07);\n}\n.gv-act {\n  cursor: pointer; padding: 2px 9px; border-radius: 6px; font-size: 11px;\n  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.88); transition: background .15s;\n}\n.gv-act:hover { background: rgba(255,255,255,.24); }\n.gv-act.gv-danger:hover { background: rgba(255,90,90,.85); color: #fff; }\n\n.gv-panel-item-body {\n  padding: 8px 10px; flex: 1 1 auto; min-height: 0; overflow: auto; overflow-x: hidden;\n  font-size: 12.5px; line-height: 1.62; color: #c9cee0;\n  white-space: pre-wrap; word-break: break-word;\n}\n.gv-panel-item.gv-collapsed .gv-panel-item-body,\n.gv-panel-item.gv-collapsed .gv-panel-actions { display: none; }\n.gv-panel-empty { padding: 16px; text-align: center; opacity: .45; font-size: 12px; }\n\n/* 附加内容里的酒馆原生渲染结果 —— 全部限宽, 防止预设的固定宽高把面板撑爆 */\n.gv-panel-item-body > * { max-width: 100% !important; box-sizing: border-box; }\n.gv-panel-item-body .gv-rich { width: 100% !important; display: block !important; height: auto !important; min-height: 44px; }\n.gv-panel-item-body .gv-rich-iframe {\n  width: 100% !important; display: block !important; border: 0 !important;\n  height: 60px; min-height: 24px; background: transparent;\n}\n.gv-panel-item-body pre { background: rgba(0,0,0,.28); padding: 7px 9px; border-radius: 8px; font-size: 11.5px; }\n.gv-panel-item-body img, .gv-panel-item-body video, .gv-panel-item-body canvas { max-width: 100% !important; height: auto !important; }\n.gv-panel-item-body table { max-width: 100% !important; display: block; overflow-x: auto; }\n.gv-panel-item-body pre, .gv-panel-item-body code { max-width: 100% !important; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }\n.gv-panel-item-body div, .gv-panel-item-body section, .gv-panel-item-body p { max-width: 100% !important; }\n.gv-panel-item-body * { overflow-wrap: anywhere; }\n\n.gv-panel-item-body img { max-width: 100%; height: auto; border-radius: 6px; }\n.gv-panel-item-body table { border-collapse: collapse; width: 100%; margin: 4px 0; }\n.gv-panel-item-body th, .gv-panel-item-body td { border: 1px solid rgba(255,255,255,.15); padding: 2px 6px; font-size: 11.5px; }\n.gv-panel-item-body hr { border: 0; border-top: 1px solid rgba(255,255,255,.15); margin: 8px 0; }\n.gv-panel-item-body p { margin: .4em 0; }\n.gv-panel-item-body details { margin: 6px 0; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: 4px 8px; background: rgba(255,255,255,.03); }\n.gv-panel-item-body details > summary { cursor: pointer; font-weight: 600; color: #9fd8ff; }\n.gv-panel-item-body .mes_reasoning_details, .gv-panel-item-body details.gv-reasoning { opacity: .95; }\n\n/* 缩放把手: 长按边缘拖动即可改大小 */\n.gv-rs { position: absolute; z-index: 10; }\n.gv-rs-e { top: 10px; right: 0; width: 7px; bottom: 12px; cursor: ew-resize; }\n.gv-rs-s { left: 10px; right: 12px; bottom: 0; height: 7px; cursor: ns-resize; }\n.gv-rs-w { top: 10px; left: 0; width: 7px; bottom: 12px; cursor: ew-resize; }\n.gv-rs-se { right: 0; bottom: 0; width: 15px; height: 15px; cursor: nwse-resize; }\n.gv-rs-se::after {\n  content: \"\"; position: absolute; right: 3px; bottom: 3px; width: 7px; height: 7px;\n  border-right: 2px solid rgba(255,255,255,.45); border-bottom: 2px solid rgba(255,255,255,.45);\n  border-radius: 0 0 3px 0;\n}\n.gv-rs-e:hover, .gv-rs-s:hover, .gv-rs-w:hover, .gv-rs-se:hover { background: rgba(255,143,177,.25); }\n\n/* ---------- 兜底转换 API 设置弹窗 ---------- */\n.gv-cfg-mask { position: absolute; inset: 0; z-index: 30; background: rgba(6,8,14,.78);\n  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);\n  display: flex; align-items: center; justify-content: center; padding: 10px; }\n.gv-cfg { width: 100%; max-width: 330px; max-height: 100%; overflow: auto; border-radius: 12px;\n  background: #171a26; border: 1px solid rgba(255,255,255,.16); box-shadow: 0 14px 40px rgba(0,0,0,.6); }\n.gv-cfg-head { display: flex; align-items: center; padding: 9px 12px; font-weight: 700; font-size: 12.5px;\n  border-bottom: 1px solid rgba(255,255,255,.1); background: linear-gradient(180deg, rgba(255,255,255,.08), transparent); }\n.gv-cfg-x { margin-left: auto; cursor: pointer; opacity: .65; font-size: 13px; }\n.gv-cfg-x:hover { opacity: 1; }\n.gv-cfg-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 9px; }\n.gv-cfg-row { display: flex; align-items: center; gap: 8px; }\n.gv-cfg-row > label { flex: 0 0 60px; opacity: .72; font-size: 12px; }\n.gv-cfg-row input, .gv-cfg-row select {\n  flex: 1; min-width: 0; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.16);\n  border-radius: 7px; color: #e6e9f2; font-size: 12px; padding: 5px 8px; outline: none;\n  font-family: inherit; user-select: text; }\n.gv-cfg-row input:focus, .gv-cfg-row select:focus { border-color: #ff8fb1; }\n.gv-cfg-row select option { background: #171a26; color: #e6e9f2; }\n.gv-cfg-row.gv-hide { display: none; }\n.gv-sw { width: 38px; height: 20px; border-radius: 999px; background: rgba(255,255,255,.16);\n  position: relative; cursor: pointer; transition: background .18s; flex: 0 0 auto; }\n.gv-sw::after { content: \"\"; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;\n  border-radius: 50%; background: #cfd4e4; transition: transform .18s, background .18s; }\n.gv-sw.gv-on { background: #ff8fb1; }\n.gv-sw.gv-on::after { transform: translateX(18px); background: #fff; }\n.gv-cfg-note { font-size: 11px; line-height: 1.55; opacity: .5; }\n.gv-cfg-foot { display: flex; align-items: center; gap: 8px; padding: 9px 12px;\n  border-top: 1px solid rgba(255,255,255,.1); }\n.gv-cfg-status { margin-left: auto; font-size: 11px; color: #a6f0c6; opacity: 0; transition: opacity .25s; }\n.gv-cfg-status.gv-show { opacity: 1; }\n.gv-cfg-wide { max-width: 100%; }\n.gv-cfg-ta { width: 100%; height: 260px; resize: vertical; background: rgba(255,255,255,.06);\n  border: 1px solid rgba(255,255,255,.16); border-radius: 8px; color: #e6e9f2;\n  font-family: Consolas, \"Courier New\", monospace; font-size: 11.5px; line-height: 1.55;\n  padding: 8px 9px; outline: none; user-select: text; white-space: pre-wrap; }\n.gv-cfg-ta:focus { border-color: #ff8fb1; }\n\n/* ---- 悬浮窗里\"整块变编辑器\" ---- */\n.gv-panel-inline-edit{display:flex;flex-direction:column;gap:8px;}\n.gv-panel-inline-ta{width:100%;min-height:160px;box-sizing:border-box;background:rgba(0,0,0,.28);\n  border:1px solid rgba(255,255,255,.18);border-radius:8px;color:#e6e9f2;padding:9px 10px;\n  font-size:12.5px;line-height:1.65;resize:vertical;font-family:inherit;}\n.gv-panel-inline-ta:focus{outline:none;border-color:rgba(255,143,177,.75);}\n.gv-panel-inline-btns{display:flex;gap:6px;}\n\n/* 编辑框撑满整格, 不缩回去 */\n.gv-panel-inline-edit{display:flex;flex-direction:column;flex:1;min-height:0;}\n.gv-panel-inline-ta{flex:1 1 auto;min-height:140px;}\n\n/* 编辑时: 这一格自己撑满整个面板(面板改大编辑框也跟着大) */\n.gv-panel-item.gv-editing{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-item-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-inline-edit{flex:1 1 auto;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-inline-ta{flex:1 1 auto;min-height:120px;}\n\n/* 面板主体要能吃掉剩余高度, 里面的编辑器才能跟着变 */\n.gv-panel-body{flex:1 1 auto;min-height:0;}\n\n/* ===== 悬浮窗模板自带的三个页面(词/转/包) + 右下角把手 ===== */\n.gv-sheet{display:none;position:absolute;left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%);\n  width:min(300px,calc(100% - 22px));height:auto;max-height:min(76%,340px);z-index:5;\n  border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(16,18,27,.98);\n  box-shadow:0 18px 44px rgba(0,0,0,.6);\n  background:rgba(10,12,18,.97);flex-direction:column;border-radius:14px;}\n.gv-sheet.on{display:flex;}\n.gv-sheet-head{display:flex;align-items:center;padding:8px 10px;font-weight:700;font-size:12.5px;border-bottom:1px solid rgba(255,255,255,.12);}\n.gv-sheet-x{margin-left:auto;cursor:pointer;opacity:.7;padding:0 4px;}\n.gv-sheet-x:hover{opacity:1;}\n.gv-sheet-body{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}\n.gv-sheet-foot{display:flex;gap:6px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.12);}\n.gv-sheet-row{display:flex;align-items:center;gap:8px;}\n.gv-sheet-row label{width:52px;opacity:.7;flex:0 0 auto;font-size:12px;}\n.gv-sheet-row input,.gv-sheet-row select{flex:1;min-width:0;background:rgba(255,255,255,.08);\n  border:1px solid rgba(255,255,255,.16);color:#e6e9f2;border-radius:8px;padding:5px 8px;font-size:12px;}\n.gv-sheet-ta{width:100%;min-height:180px;box-sizing:border-box;background:rgba(255,255,255,.06);\n  border:1px solid rgba(255,255,255,.16);color:#e6e9f2;border-radius:8px;padding:8px;\n  font-size:12px;line-height:1.6;resize:vertical;font-family:inherit;}\n.gv-sheet-note{font-size:11.5px;opacity:.6;line-height:1.6;white-space:pre-wrap;}\n.gv-sheet-file{color:#c9cee0;font-size:12px;}\n.gv-sw{width:36px;height:20px;border-radius:999px;background:rgba(255,255,255,.18);position:relative;cursor:pointer;flex:0 0 auto;}\n.gv-sw::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s;}\n.gv-sw.gv-on{background:#ff8fb1;}\n.gv-sw.gv-on::after{left:18px;}\n.gv-sheet-toast{position:absolute;left:50%;bottom:52px;transform:translateX(-50%);\n  background:rgba(255,143,177,.95);color:#1a1016;padding:4px 12px;border-radius:999px;font-size:12px;z-index:9;}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n.gv-panel-rs{position:absolute;right:0;bottom:0;width:20px;height:20px;z-index:7;cursor:nwse-resize;touch-action:none;\n  background:linear-gradient(135deg,transparent 44%,rgba(255,255,255,.55) 50%,transparent 56%,\n    transparent 64%,rgba(255,255,255,.55) 70%,transparent 76%);}\n.gv-panel-rs:hover{background-color:rgba(255,255,255,.12);}\n/* ★ 边框也能拖: 右边一条改宽、下边一条改高 (以前只有右下角那一个 16px 的小把手, 基本点不到) */\n.gv-panel-rs-r{position:absolute;right:0;top:16px;bottom:16px;width:7px;cursor:ew-resize;background:transparent;z-index:7;touch-action:none;}\n.gv-panel-rs-b{position:absolute;bottom:0;left:16px;right:16px;height:7px;cursor:ns-resize;background:transparent;z-index:7;touch-action:none;}\n.gv-panel-rs-r:hover{background:rgba(255,255,255,.10);}\n.gv-panel-rs-b:hover{background:rgba(255,255,255,.10);}\n\n/* 面板自己不出滚动条 (内容超出由 .gv-panel-body 内部滚) */\n.gv-panel{overflow:hidden;}\n.gv-panel-body{overflow:auto;scrollbar-width:none;}\n.gv-panel-body::-webkit-scrollbar{width:0;height:0;display:none;}\n.gv-sheet-body{scrollbar-width:none;}\n.gv-sheet-body::-webkit-scrollbar{width:0;height:0;display:none;}\n.gv-panel-body::-webkit-scrollbar{width:8px;}\n.gv-panel-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:4px;}\n.gv-panel-body::-webkit-scrollbar-track{background:transparent;}\n\n/* ---- 收成小球: 黑色小球 + 猫爪 ---- */\n.gv-panel.gv-mini{width:46px !important;height:46px !important;min-width:0;min-height:0;\n  border-radius:50%;background:#0b0d14;border:1px solid rgba(255,255,255,.18);\n  display:flex;align-items:center;justify-content:center;padding:0;overflow:hidden;}\n.gv-panel.gv-mini .gv-panel-head{padding:0;border:0;background:none;justify-content:center;}\n.gv-panel.gv-mini .gv-panel-title,\n.gv-panel.gv-mini .gv-panel-count,\n.gv-panel.gv-mini .gv-panel-spacer,\n.gv-panel.gv-mini .gv-panel-body,\n.gv-panel.gv-mini .gv-sheet,\n.gv-panel.gv-mini .gv-panel-btn:not(.gv-paw){display:none;}\n.gv-panel.gv-mini .gv-panel-btn.gv-paw{width:100%;height:100%;background:none;border:0;\n  display:flex;align-items:center;justify-content:center;color:#fff;}\n/* 小球状态: 缩放把手全部藏掉 (引擎用的是 .gv-rs, 模板用的是 .gv-panel-rs, 两个都要藏,\n   否则那个右下角的白色小把手会从球边上露出来) */\n.gv-panel.gv-mini .gv-rs,\n.gv-panel.gv-mini .gv-panel-rs { display: none; }\n/* ---- 滚动条: 跟面板一个风格 (内缩的粉色药丸, 不是系统默认那条) ---- */\n.gv-panel-body, .gv-panel-item-body, .gv-sheet-body, .gv-cfg, .gv-panel-inline-ta, .gv-sheet-ta {\n  scrollbar-width: thin;\n  scrollbar-color: rgba(255,143,177,.65) rgba(255,255,255,.05);\n}\n.gv-panel-body::-webkit-scrollbar,\n.gv-panel-item-body::-webkit-scrollbar,\n.gv-sheet-body::-webkit-scrollbar,\n.gv-cfg::-webkit-scrollbar,\n.gv-panel-inline-ta::-webkit-scrollbar,\n.gv-sheet-ta::-webkit-scrollbar {\n  width: 11px;\n  height: 11px;\n}\n.gv-panel-body::-webkit-scrollbar-track,\n.gv-panel-item-body::-webkit-scrollbar-track,\n.gv-sheet-body::-webkit-scrollbar-track,\n.gv-cfg::-webkit-scrollbar-track,\n.gv-panel-inline-ta::-webkit-scrollbar-track,\n.gv-sheet-ta::-webkit-scrollbar-track {\n  background: rgba(255,255,255,.045);\n  border-radius: 999px;\n  margin: 5px 2px;\n}\n.gv-panel-body::-webkit-scrollbar-thumb,\n.gv-panel-item-body::-webkit-scrollbar-thumb,\n.gv-sheet-body::-webkit-scrollbar-thumb,\n.gv-cfg::-webkit-scrollbar-thumb,\n.gv-panel-inline-ta::-webkit-scrollbar-thumb,\n.gv-sheet-ta::-webkit-scrollbar-thumb {\n  background: rgba(255,143,177,.5);\n  border: 3px solid transparent;\n  background-clip: content-box;\n  border-radius: 999px;\n}\n.gv-panel-body::-webkit-scrollbar-thumb:hover,\n.gv-panel-item-body::-webkit-scrollbar-thumb:hover,\n.gv-sheet-body::-webkit-scrollbar-thumb:hover,\n.gv-cfg::-webkit-scrollbar-thumb:hover,\n.gv-panel-inline-ta::-webkit-scrollbar-thumb:hover,\n.gv-sheet-ta::-webkit-scrollbar-thumb:hover {\n  background: #ff8fb1;\n  border: 3px solid transparent;\n  background-clip: content-box;\n  border-radius: 999px;\n}\n.gv-panel-body::-webkit-scrollbar-corner,\n.gv-panel-item-body::-webkit-scrollbar-corner,\n.gv-sheet-body::-webkit-scrollbar-corner,\n.gv-cfg::-webkit-scrollbar-corner,\n.gv-panel-inline-ta::-webkit-scrollbar-corner,\n.gv-sheet-ta::-webkit-scrollbar-corner {\n  background: transparent;\n}\n/* 小球: 整颗都能拖 */\n.gv-panel.gv-mini .gv-panel-btn.gv-paw { cursor: move; }\n\n/* ---- 自绘滚动条 (JS 画, 见 attachScrollbar): 原生那条在 Chrome 里又丑又调不动 ---- */\n.gv-panel-item { position: relative; }\n.gv-sbhost { scrollbar-width: none; }\n.gv-sbhost::-webkit-scrollbar { width: 0 !important; height: 0 !important; }\n.gv-sb { position: absolute; right: 3px; width: 7px; pointer-events: none; z-index: 6; opacity: .85; transition: opacity .18s; }\n.gv-sb-thumb { position: absolute; left: 0; right: 0; top: 4px; border-radius: 999px;\n  background: linear-gradient(180deg, rgba(255,143,177,.92), rgba(255,143,177,.55));\n  box-shadow: 0 0 6px rgba(255,143,177,.28); }\n.gv-panel:hover .gv-sb { opacity: 1; }\n\n/* ★ 以前这里把面板改成 position:relative 居中(老设计: 宿主按面板包围盒给 iframe 定尺寸)。\n   现在宿主是\"整窗口画布 + clip-path\", 面板必须保持 fixed —— 它的 left/top 就是窗口坐标,\n   否则拖动会跟手错位、右下角把手和收小球全点不到 (实测: 面板被这条规则顶到 x=1770 点不着)。 */\n.gv-panel .gv-rs { display: none; }\n.gv-panel-body { max-height: none; }\n```\n```js\n/* 悬浮窗: 卡里那套 + 自带页面(词/转/包), 宿主接不接都能用 */\nvar folded = {}, rawMode = false, lastEntries = [], foldedAll = false, dragMoved = false;\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nvar root = $('panel'), body = $('body'), count = $('count');\n\n/* ---- 富渲染出来的活 iframe: 高度由它里面那段 prelude 用 postMessage 报过来 ----\n   沙箱里读不到 iframe 的 contentDocument, 所以只能让它自己报 (真机/预览同一套) */\nwindow.addEventListener('message', function(ev){\n  var d = ev.data; if (!d || d.__gvFit !== 1) return;\n  var h = Math.max(0, Math.round(Number(d.h) || 0));\n  var list = body.querySelectorAll('iframe.gv-rich-iframe');\n  for (var i = 0; i < list.length; i++) {\n    if (list[i].contentWindow !== ev.source) continue;\n    list[i].style.height = (h > 24 ? h + 10 : 0) + 'px';\n    list[i].style.display = h > 24 ? 'block' : 'none';\n    var holder = list[i].parentElement;\n    if (holder && holder.classList && holder.classList.contains('gv-rich')) holder.style.display = h > 24 ? '' : 'none';\n    try { if (typeof sbBody === 'function') { sbBody(); sbSyncs.forEach(function(s){ s(); }); } } catch (e) {}\n  }\n});\n\n/* ---- 自绘滚动条 (和卡里一个样式): 原生那条 Chrome 画得丑 ---- */\nvar sbSyncs = [];\nfunction attachScrollbar(scroller, host){\n  try {\n    scroller.classList.add('gv-sbhost');\n    var bar = el('div', 'gv-sb'), thumb = el('div', 'gv-sb-thumb');\n    bar.appendChild(thumb); host.appendChild(bar);\n    var sync = function(){\n      var sh = scroller.scrollHeight, ch = scroller.clientHeight;\n      if (sh <= ch + 1) { bar.style.display = 'none'; return; }\n      bar.style.display = 'block';\n      var r = scroller.getBoundingClientRect(), hr = host.getBoundingClientRect();\n      bar.style.top = Math.round(r.top - hr.top) + 'px';\n      bar.style.height = Math.round(r.height) + 'px';\n      var track = Math.max(20, r.height - 8);\n      var h = Math.max(26, Math.round(track * ch / sh));\n      thumb.style.height = h + 'px';\n      var max = sh - ch;\n      var t = max > 0 ? scroller.scrollTop / max : 0;\n      thumb.style.transform = 'translateY(' + Math.round(t * Math.max(0, track - h)) + 'px)';\n    };\n    scroller.addEventListener('scroll', sync, { passive: true });\n    if (window.ResizeObserver) { var ro = new ResizeObserver(function(){ sync(); }); ro.observe(scroller); ro.observe(host); }\n    setTimeout(sync, 0);\n    return sync;\n  } catch (e) { return function(){}; }\n}\nvar sbBody = attachScrollbar(body, root);\nvar sheet = $('sheet'), sheetTitle = $('sheetTitle'), sheetBody = $('sheetBody'), sheetFoot = $('sheetFoot');\n\n/* ---------- 页面容器 ---------- */\nfunction openSheet(title, nodes, buttons){\n  sheetTitle.textContent = title;\n  sheetBody.innerHTML = '';\n  nodes.forEach(function(n){ sheetBody.appendChild(n); });\n  sheetFoot.innerHTML = '';\n  (buttons || []).forEach(function(b){ sheetFoot.appendChild(b); });\n  sheet.classList.add('on');\n  fitSelf();\n}\nfunction closeSheet(){ sheet.classList.remove('on'); }\n$('sheetX').addEventListener('click', closeSheet);\n\nfunction row(label, node){\n  var r = el('div', 'gv-sheet-row');\n  r.appendChild(el('label', '', label));\n  r.appendChild(node);\n  return r;\n}\nfunction btn(label, primary, fn){\n  var b = el('span', 'gv-tb' + (primary ? ' gv-primary' : ''), label);\n  b.addEventListener('click', fn);\n  return b;\n}\nfunction flash(msg, fail){\n  var t = el('div', 'gv-sheet-toast' + (fail ? ' bad' : ''), msg);\n  (sheet.classList.contains('on') ? sheet : root).appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\n\n/* ---------- 词: 提示词 ---------- */\nfunction openPrompt(){\n  var ta = document.createElement('textarea');\n  ta.className = 'gv-sheet-ta';\n  ta.spellcheck = false;\n  ta.value = String(ctx.prompt || '');\n  ta.placeholder = '这里是发给 AI 的格式提示词（插件里「提示词」页生成的那份）';\n  var note = el('div', 'gv-sheet-note', '没有宿主时这里显示的是插件传进来的提示词；有宿主(角色脚本)时保存会真的写回去。');\n  openSheet('格式提示词', [ta, note], [\n    btn('保存', true, function(){ ctx._post('setPrompt', ta.value); }),\n    btn('复制', false, function(){ try { ta.select(); document.execCommand('copy'); flash('已复制'); } catch (e) {} }),\n    btn('关闭', false, closeSheet),\n  ]);\n}\n/* ---------- 转: 兜底转换 API ---------- */\nvar CONV_KINDS = [['deepseek', '官方 DeepSeek'], ['gemini', '官方 Gemini'], ['claude', '官方 Claude'], ['custom', '兼容 OpenAI 格式']];\nfunction openConvert(){\n  var cfg = ctx.convertCfg || {};\n  var sw = el('div', 'gv-sw' + (cfg.enabled !== false ? ' gv-on' : ''));\n  sw.addEventListener('click', function(){ sw.classList.toggle('gv-on'); });\n  var sel = document.createElement('select');\n  CONV_KINDS.forEach(function(k){ var o = document.createElement('option'); o.value = k[0]; o.textContent = k[1]; sel.appendChild(o); });\n  sel.value = cfg.kind || 'deepseek';\n  var key = document.createElement('input'); key.type = 'password'; key.placeholder = 'sk-...（留空 = 用酒馆当前的主 API）'; key.value = cfg.key || '';\n  var url = document.createElement('input'); url.type = 'text'; url.placeholder = '自定义接口地址'; url.value = cfg.url || '';\n  var model = document.createElement('input'); model.type = 'text'; url.placeholder = ''; model.placeholder = '模型名'; model.value = cfg.model || '';\n  var note = el('div', 'gv-sheet-note', '密钥只存在你自己的浏览器里，不会写进角色卡。');\n  function collect(){ return { enabled: sw.classList.contains('gv-on'), kind: sel.value, key: key.value.trim(), url: url.value.trim(), model: model.value.trim() }; }\n  openSheet('兜底转换 API', [row('启用', sw), row('服务', sel), row('密钥', key), row('接口', url), row('模型', model), note], [\n    btn('保存', true, function(){ ctx._post('convertCfg', collect()); }),\n    btn('关闭', false, closeSheet),\n  ]);\n}\n/* ---------- 素材: ① 导入高清素材包  ② 清除浏览器素材缓存 ---------- */\nfunction openPack(){\n  var note = el('div', 'gv-sheet-note', '脚本自带低清版；这里导入高清 .zip（同名覆盖）。');\n  noteEl = note;\n  var picker = document.createElement('input');\n  picker.type = 'file'; picker.accept = '.zip,application/zip';\n  picker.className = 'gv-sheet-file';\n  var noteEl = null;\n  picker.addEventListener('change', function(){\n    var f = picker.files && picker.files[0];\n    if (!f) return;\n    /* ★ 必须把【字节】发给宿主 —— 以前只发名字/大小, 宿主那边拿不到文件, 点了等于没点 */\n    if (noteEl) noteEl.textContent = '正在读取 ' + f.name + ' …';\n    var done = function(buf){\n      if (buf) { if (noteEl) noteEl.textContent = '正在导入：' + f.name + '（' + Math.round((f.size||0)/1024) + ' KB）—— 结果看右下角提示'; ctx._post('packFile', { name: f.name, size: f.size, buf: buf }); }\n      else { if (noteEl) noteEl.textContent = '这个浏览器读不出这个文件，换个浏览器试试'; ctx._post('packFile', { name: f.name, size: f.size }); }\n    };\n    try {\n      if (f.arrayBuffer) f.arrayBuffer().then(done).catch(function(){ done(null); });\n      else { var fr = new FileReader(); fr.onload = function(){ done(fr.result); }; fr.onerror = function(){ done(null); }; fr.readAsArrayBuffer(f); }\n    } catch (e) { done(null); }\n  });\n  /* ★ ② 清除浏览器素材缓存: 角色脚本每次打开都会自动恢复\"以前导入过的包\",\n     旧包里同名素材会盖住新脚本自带的 —— 卡片更新后还显示旧素材时, 清一下再刷新页面。 */\n  var clr = el('div', 'gv-sheet-note', '旧素材还显示？清一下浏览器里的缓存，再刷新。');\n  var bPick = btn('① 导入高清素材包 (.zip)', true, function(){ picker.click(); });\n  var bClr = btn('② 清除浏览器素材缓存', false, function(){\n    if (noteEl) noteEl.textContent = '正在清除…';\n    ctx._post('clearPackCache');\n  });\n  openSheet('素材', [note, row('选择文件', picker), clr], [bPick, bClr, btn('关闭', false, closeSheet)]);\n}\n\n/* ---------- 头部按钮 ---------- */\n$('btnConv').addEventListener('click', function(e){ e.stopPropagation(); openConvert(); });\n$('btnPrompt').addEventListener('click', function(e){ e.stopPropagation(); openPrompt(); });\n$('btnPack').addEventListener('click', function(e){ e.stopPropagation(); openPack(); });\n$('btnRedraw').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('redraw'); });\n/* – = 收成小球 (黑色小球 + 猫爪肉球) */\nvar PAW = '<svg viewBox=\"0 0 32 32\" width=\"20\" height=\"20\" aria-hidden=\"true\">' +\n  '<ellipse cx=\"16\" cy=\"21\" rx=\"7.6\" ry=\"6.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"7.4\" cy=\"13\" r=\"3.2\" fill=\"#fff\"/>' +\n  '<circle cx=\"13\" cy=\"7.8\" r=\"3.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"19.4\" cy=\"7.8\" r=\"3.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"25\" cy=\"13\" r=\"3.2\" fill=\"#fff\"/></svg>';\n$('btnFold').addEventListener('click', function(){\n  if (dragMoved) { dragMoved = false; return; }   // 拖球之后不要顺手展开\n  var mini = root.classList.toggle('gv-mini');\n  this.innerHTML = mini ? PAW : '–';\n  this.title = mini ? '展开悬浮窗' : '收成小球';\n  this.classList.toggle('gv-paw', mini);\n});\n$('btnRaw').addEventListener('click', function(){ rawMode = !rawMode; this.classList.toggle('gv-on', rawMode); render(lastEntries); });\n/* ✕ = 直接关掉整个悬浮窗 (重开这个角色的聊天才会再出来) */\n$('btnMini').addEventListener('click', function(e){\n  e.stopPropagation();\n  closeSheet();\n  root.style.display = 'none';\n  ctx._post('closePanel');\n  flash('悬浮窗已关闭（重新打开这个聊天才会再出现）');\n});\n\n/* ---------- 拖动: 直接在沙箱里挪 (不记录位置, 重进回初始) ---------- */\n(function(){\n  var drag = null;\n  function clampSelf(){\n    if (!root.style.left) return;\n    var r = root.getBoundingClientRect();\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var nl = Math.max(-(r.width - 80), Math.min(vw - 80, r.left));\n    var nt = Math.max(0, Math.min(vh - 40, r.top));\n    if (Math.round(nl) !== Math.round(r.left) || Math.round(nt) !== Math.round(r.top)) {\n      root.style.left = Math.round(nl) + 'px'; root.style.top = Math.round(nt) + 'px';\n    }\n  }\n  /* ★ 尺寸一变就报一次: 宿主拿它抠 clip-path(画布=整个窗口) —— 那里就是\"鼠标能点到面板\"的区域。\n     以前只在拖动/改大小/开编辑时报, 楼层渲染完自己长高了却不报 -> 宿主的可点区域还停在旧的小方块上,\n     表现就是\"面板看得见、但点不到 / 拖不动 / 改不了大小\"。 */\n  try {\n    if (window.ResizeObserver) new ResizeObserver(function(){ fitSelf(); }).observe(root);\n    window.addEventListener('load', function(){ setTimeout(fitSelf, 80); });\n    setTimeout(fitSelf, 300);\n  } catch (e) {}\n  /* ★ 以前按 root.style.left||0 算 —— 面板本来靠 right:16px 定位, 第一次拖会先跳到左上角,\n     看着就是\"能动的范围莫名其妙只有一小块\"。现在按【当前真实位置】算, 按下即跟手。 */\n  $('head').addEventListener('mousedown', function(e){\n    dragMoved = false;   // 每次按下都清, 免得上一轮拖动把这一次点击吃掉\n    if (e.target.closest('.gv-panel-btn') && !root.classList.contains('gv-mini')) return;   // 小球时整球可拖\n    var r = root.getBoundingClientRect();\n    root.style.right = 'auto';\n    root.style.left = Math.round(r.left) + 'px';\n    root.style.top = Math.round(r.top) + 'px';\n    drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };\n    e.preventDefault();\n  });\n  document.addEventListener('mousemove', function(e){\n    if (!drag) return;\n    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;\n    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;\n    /* ★ 活动范围 = 整块画布: 只保证\"至少 80px 留在画面里、标题那一行不会被推出上边\",\n       其余随便拖 —— 以前没有任何限制, 拖出去就再也点不到了 (小球同理) */\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var nl = Math.max(-(drag.w - 80), Math.min(vw - 80, drag.l + dx));\n    var nt = Math.max(0, Math.min(vh - 40, drag.t + dy));\n    root.style.left = Math.round(nl) + 'px';\n    root.style.top = Math.round(nt) + 'px';\n    fitSelf();\n    ctx._post('move', { dx: Math.round(dx), dy: Math.round(dy) });   // 将来宿主想接管也可以\n  });\n  document.addEventListener('mouseup', function(){ drag = null; });\n  window.addEventListener('resize', function(){ clampSelf(); fitSelf(); });\n})();\n\n/* ---------- 让外框跟着面板走: 拖动/改大小/开页面之后都报一次 ---------- */\nvar lastFit = null;\nfunction fitSelf(){\n  var mini = root.classList.contains('gv-mini');\n  var r = root.getBoundingClientRect();\n  /* ★ 收成小球也要报【真实尺寸】: 以前故意报旧的大尺寸 -> 外框还是那么大, 小球被挡掉一半点不到。\n     展开时会再报一次全尺寸(下面这段每次拖动/改大小/开关都会调用)。 */\n  /* ★ 报【面板自己在窗口里的位置 + 尺寸】: 宿主拿它去抠 clip-path(画布=整个窗口)。\n     老宿主只认 w/h 当包围盒, 所以 resize 那条继续报\"右下角坐标 + 14\"。 */\n  var need = { x: Math.round(r.left), y: Math.round(r.top), w: Math.ceil(r.width), h: Math.ceil(r.height) };\n  if (!mini) lastFit = need;\n  ctx._post('resize', need.y + need.h + 14);\n  ctx._post('wantSize', need);\n}\n\n/* 编辑框跟着面板高度走 */\nfunction syncEditorHeight(){\n  var ed = root.querySelector('.gv-panel-inline-edit');\n  if (!ed || !ed.parentNode) return;\n  var body = ed.parentNode;\n  var whole = root.getBoundingClientRect().height;\n  var chrome = Number(body.dataset.gvChrome) || 0;       // 打开编辑那一刻量到的\"除正文外的固定高度\"\n  body.style.minHeight = Math.max(160, Math.round(whole - chrome)) + 'px';\n}\n\n/* ---------- 改大小: 右下角 / 右边框 / 下边框都能拖 (沙箱内, 不记录尺寸) ---------- */\n(function(){\n  function mkHandle(cls, title){ var h = el('div', 'gv-panel-rs ' + cls); h.title = title; root.appendChild(h); return h; }\n  /* ★ 类名要和 CSS 对上: 模板 CSS 里写的是 .gv-panel-rs-r / .gv-panel-rs-b\n     (以前写成 gv-rs-r/gv-rs-b -> 选择器匹配不上, 两条边把手被渲染成跟右下角一样大的方块) */\n  var corner = mkHandle('gv-rs-corner', '拖动改大小');\n  var edgeR = mkHandle('gv-panel-rs-r', '拖动改宽度');\n  var edgeB = mkHandle('gv-panel-rs-b', '拖动改高度');\n  var rs = null;\n  function start(e, dir){\n    e.stopPropagation(); e.preventDefault();\n    var r = root.getBoundingClientRect();\n    rs = { dir: dir, x: e.clientX, y: e.clientY, w: r.width, h: r.height, l: r.left, t: r.top };\n    root.style.maxHeight = 'none';           // ★ 72vh 那个高度上限, 一拖就撤掉, 想多高就多高\n    root.style.right = 'auto';\n    root.style.left = Math.round(r.left) + 'px';\n    root.style.top = Math.round(r.top) + 'px';\n  }\n  corner.addEventListener('mousedown', function(e){ start(e, 'se'); });\n  edgeR.addEventListener('mousedown', function(e){ start(e, 'e'); });\n  edgeB.addEventListener('mousedown', function(e){ start(e, 's'); });\n  document.addEventListener('mousemove', function(e){\n    if (!rs) return;\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var maxW = Math.max(240, vw - rs.l - 2), maxH = Math.max(120, vh - rs.t - 2);\n    if (rs.dir.indexOf('e') >= 0) root.style.width = Math.round(Math.max(240, Math.min(maxW, rs.w + (e.clientX - rs.x)))) + 'px';\n    if (rs.dir.indexOf('s') >= 0) root.style.height = Math.round(Math.max(120, Math.min(maxH, rs.h + (e.clientY - rs.y)))) + 'px';\n    syncEditorHeight();\n    fitSelf();\n  });\n  document.addEventListener('mouseup', function(){ rs = null; });\n})();\n\n/* ---------- 编辑: 把这一格的内容区整块换成编辑器 (和 char 那套一个风格) ---------- */\nfunction openItemEditor(item, e){\n  var body = item.querySelector('.gv-panel-item-body');\n  if (!body || body.querySelector('.gv-panel-inline-edit')) return;\n  /* ★ 编辑时不许缩: 把整块高度锁住, 编辑框撑满它 */\n  var whole = Math.max(220, Math.round(root.getBoundingClientRect().height));\n  if (!root.style.height) root.style.height = whole + 'px';\n  var prevBodyH = body.style.minHeight;\n  var chrome = Math.max(120, Math.round(whole - body.getBoundingClientRect().height));\n  body.dataset.gvChrome = String(chrome);\n  body.style.minHeight = Math.max(160, whole - chrome) + 'px';\n  var prev = body.innerHTML;\n  item.classList.add('gv-editing');\n  var wrap = el('div', 'gv-panel-inline-edit');\n  var ta = document.createElement('textarea');\n  ta.className = 'gv-panel-inline-ta';\n  ta.spellcheck = false;\n  ta.value = String(e.raw || '');\n  var row = el('div', 'gv-panel-inline-btns');\n  var bOk = el('span', 'gv-tb gv-primary', '确认修改');\n  var bNo = el('span', 'gv-tb', '退出修改');\n  row.append(bOk, bNo);\n  wrap.append(ta, row);\n  body.innerHTML = '';\n  body.appendChild(wrap);\n  bNo.addEventListener('click', function(ev){ ev.stopPropagation(); body.innerHTML = prev; body.style.minHeight = prevBodyH; item.classList.remove('gv-editing'); fitSelf(); });\n  bOk.addEventListener('click', function(ev){\n    ev.stopPropagation();\n    e.raw = ta.value;\n    e.html = ta.value.replace(/[&<>]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });\n    ctx._post('saveFloor', { id: e.id, text: ta.value });\n    body.style.minHeight = prevBodyH;\n    item.classList.remove('gv-editing');\n    render(lastEntries);            // 保存后按新内容重画整列\n    fitSelf();\n  });\n  ta.addEventListener('click', function(ev){ ev.stopPropagation(); });\n  ta.focus();\n  fitSelf();\n}\n\n/* ---------- 列表 ---------- */\nfunction render(entries){\n  lastEntries = entries || [];\n  body.innerHTML = '';\n  var shown = lastEntries.filter(function(e){ return (e.html && String(e.html).trim()) || (e.raw && String(e.raw).trim()); });\n  count.textContent = String(shown.length);\n  if (!shown.length) { body.appendChild(el('div', 'gv-panel-empty', '暂无附加内容')); return; }\n  shown.forEach(function(e){\n    var item = el('div', 'gv-panel-item' + (folded[e.id] ? ' gv-collapsed' : ''));\n    var h = el('div', 'gv-panel-item-head');\n    h.appendChild(el('b', '', '#' + e.id));\n    h.appendChild(el('span', 'gv-pitem-name', e.name || '旁白'));\n    h.appendChild(el('span', 'gv-pitem-len', (e.raw ? e.raw.length : 0) + ' 字'));\n    if (e.story) h.appendChild(el('span', 'gv-pitem-tag', '有剧情'));\n    var acts = el('div', 'gv-panel-actions');\n    [['编辑', 'edit', false, '打开编辑器'], ['复制', 'copy', false, '复制这一楼内容'],\n     ['上移', 'up', false, '楼层上移'], ['下移', 'down', false, '楼层下移'],\n     ['删除', 'delete', true, '删除这一楼']].forEach(function(a){\n      var b = el('span', 'gv-act' + (a[2] ? ' gv-danger' : ''), a[0]);\n      b.title = a[3];\n      b.addEventListener('click', function(ev){\n        ev.stopPropagation();\n        if (a[1] === 'edit') { openItemEditor(item, e); return; }   // 整块变成编辑器\n        ctx._post(a[1], e.id);\n      });\n      acts.appendChild(b);\n    });\n    var content = el('div', 'gv-panel-item-body');\n    if (rawMode) content.textContent = e.raw || '';\n    else content.innerHTML = e.html || '';\n    h.addEventListener('click', function(){\n      folded[e.id] = !folded[e.id];\n      item.classList.toggle('gv-collapsed', !!folded[e.id]);\n    });\n    item.appendChild(h); item.appendChild(acts); item.appendChild(content);\n    body.appendChild(item);\n    sbSyncs.push(attachScrollbar(content, item));\n  });\n  sbBody();\n  requestAnimationFrame(function(){ sbBody(); sbSyncs.forEach(function(s){ s(); }); });\n}\nctx.on('init', function(c){\n  render(c.floors || []);\n  /* 预览: 宿主给了框子高度 -> 面板不要长出去 (不然下面的内容被裁掉又看不到滚动条) */\n  if (c.panelBox && c.panelBox.h) root.style.maxHeight = Math.max(200, Number(c.panelBox.h) - 16) + 'px';\n  /* 宿主记着上次拖到哪 -> 重画(不是刷新预览)时位置保持 */\n  if (c.panelOffset) {\n    root.style.left = (Number(c.panelOffset.dx) || 0) + 'px';\n    root.style.top = (Number(c.panelOffset.dy) || 0) + 'px';\n    lastFit = null;\n  }\n  setTimeout(fitSelf, 60);\n  if (c.prompt != null) ctx.prompt = c.prompt;\n  if (c.convertCfg) ctx.convertCfg = c.convertCfg;\n  $('btnConv').classList.toggle('gv-on', !!(c.convertCfg && c.convertCfg.enabled !== false));\n});\nctx.on('floors', function(list){ render(list || []); });\nctx.on('convert', function(on){ $('btnConv').classList.toggle('gv-on', !!on); });\nctx.on('prompt', function(t){ ctx.prompt = t; });\nctx.on('toast', function(msg){ if (msg) flash(String(msg)); });   // 宿主回的提示\n```"};
const DEFAULT_TPL = {
 "char": {
  "html": "<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        <!--gv-audio--><span class=\"gv-tb\" data-a=\"volume\" id=\"btnVol\" title=\"调整 BGM / 音效 的音量\">调整音量</span><!--/gv-audio-->\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    <!--gv-audio--><div class=\"gv-vol\" id=\"vol\">\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音频</span><input class=\"gv-vol-rng\" id=\"volBgm\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volBgmPc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音效</span><input class=\"gv-vol-rng\" id=\"volSe\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volSePc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">进度</span><input class=\"gv-vol-rng\" id=\"volPos\" type=\"range\" min=\"0\" max=\"1000\" step=\"1\" value=\"0\"><span class=\"gv-vol-pc\" id=\"volPosPc\">0:00</span><span class=\"gv-vol-btn\" id=\"volReplay\">重播</span></div>\n      <div class=\"gv-vol-tip\">拖到 0 就是静音；音量记在这台设备上；进度条跟着 BGM 走</div>\n    </div><!--/gv-audio-->\n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>",
  "css": "/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n",
  "js": "/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 400;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n/*gv-audio*/\n/* ---- 声音: 自己播 (data: 能用就自己放, 否则叫宿主) ----\n   __gvAudioV4__  ← 这一块的\"新版\"标记。必须落在这段的【截取范围内】:\n   插件给老方案补这一块时靠它判断补没补过, 标记在范围外 -> 每次打开插件都会再补一份 (老方案的 JS 被叠过几十份)\n   ★ 自检: window.__gvAudio 里记着调用/命中/播放次数, 探针能直接看是哪一步没走到 */\n/* 老快照(页面排版里存过的)可能没有 $ 的定义 -> 这一整块一开头就 ReferenceError, 什么都装不上。\n   这里补一个兜底: 没有就自己造一个 (有就什么都不做) */\ntry { if (typeof window.$ !== 'function') window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}\nvar bgmEl = null, seEl = null, bgmNow = '';\nwindow.__gvAudio = { calls: 0, miss: 0, played: 0, se: 0, err: '', ready: false };\nfunction volNow(){ var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : {}; return { bgm: c.bgm == null ? .8 : c.bgm, se: c.se == null ? .8 : c.se }; }\nfunction ensureAudio(){ if (bgmEl) return true; try { bgmEl = new Audio(); bgmEl.loop = true; seEl = new Audio(); window.__gvAudio.ready = true; return true; } catch (e) { window.__gvAudio.err = String(e); return false; } }\nfunction hasLocalAudio(){ return !!(ctx.audioBgm && Object.keys(ctx.audioBgm).length) || !!(ctx.audioSe && Object.keys(ctx.audioSe).length); }\n/* __gvAudioV2__ : 沙箱 iframe 是独立源, 默认没有自动播放权限 -> 自己 play() 永远 NotAllowedError。\n   所以声音一律由【宿主】放: 预览里是插件(普通源), 真机上是引擎。 */\nfunction playBgm(name, tries){\n  window.__gvAudio.calls++;\n  if (!name) return;\n  bgmNow = name;\n  ctx._post('bgm', name);\n}\nfunction playBgmLocal(name){\n  var u = (ctx.audioBgm || {})[name];\n  if (!u) return;\n  if (!ensureAudio()) return;\n  if (bgmEl.src && !bgmEl.paused) return;\n  bgmEl.src = u; bgmEl.volume = volNow().bgm;\n  try { bgmEl.play().catch(function(){}); } catch (e) {}\n}\nfunction playSe(name, tries){\n  if (!name) return;\n  ctx._post('se', name);                 // 同样交给宿主放\n  window.__gvAudio.se++;\n}\n\n/*gv-audio*/\n/* ---- 音量: 两个滑块, 拖到 0 = 静音; 自己放的话直接改自己的音量, 值也给宿主存 ---- */\nfunction toggleVol(){ var v = $('vol'); if (!v) return;\n  /* ★ 一次点击只认一次: 老方案里这块代码被补过重复的 [data-a] 处理器, 点一下会 toggle 两三回\n     -> 音量面板\"闪一下就没了\"。150ms 内的重复调用直接吞掉 (真手速不可能这么快) */\n  var _tv = Date.now();\n  if (toggleVol.__at && _tv - toggleVol.__at < 150) return;\n  toggleVol.__at = _tv;\n  v.classList.toggle('gv-open');\n  if (v.classList.contains('gv-open')) { syncVol(); try { ctx._post('bgmQuery'); } catch (e) {}\n    if (!volTimer) volTimer = setInterval(volPoll, 600); }\n  else if (volTimer) { clearInterval(volTimer); volTimer = null; } }\n/* ★ 独立监听: 老模板里的 [data-a] 处理器不认识 volume, 这里自己兜住 (它多发的那条消息无害) */\ntry {\n  var _vbtn = document.querySelector('[data-a=\"volume\"]');\n  if (_vbtn) _vbtn.addEventListener('click', function (e) { e.stopPropagation(); setTimeout(toggleVol, 0); });\n} catch (e) {}\nfunction syncVol(){\n  var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : { bgm: 0.8, se: 0.8 };\n  var b = $('volBgm'), s = $('volSe');\n  if (b) { b.value = String(Math.round((c.bgm != null ? c.bgm : 0.8) * 100)); }\n  if (s) { s.value = String(Math.round((c.se != null ? c.se : 0.8) * 100)); }\n  volLabel();\n}\nfunction volLabel(){\n  var b = $('volBgm'), s = $('volSe'), bp = $('volBgmPc'), sp = $('volSePc');\n  if (bp && b) bp.textContent = b.value + '%';\n  if (sp && s) sp.textContent = s.value + '%';\n}\n/* ---- 进度条 + 重播: 音频在宿主那边, 所以靠消息问/发 ---- */\nvar volTimer = null, volDragging = false;\nfunction fmtT(sec){ sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }\nfunction volPoll(){\n  if (!($('vol') || {}).classList || !$('vol').classList.contains('gv-open')) { clearInterval(volTimer); volTimer = null; return; }\n  if (!volDragging) ctx._post('bgmQuery');\n}\nctx.on('bgmState', function (st) {\n  st = st || {};\n  var r = $('volPos'); if (!r) return;\n  var dur = Number(st.dur) || 0, t = Number(st.t) || 0;\n  if (dur > 0) r.value = String(Math.round(t / dur * 1000));\n  var pc = $('volPosPc'); if (pc) pc.textContent = fmtT(t) + ' / ' + fmtT(dur);\n  r.disabled = !dur;\n});\n$('volPos').addEventListener('pointerdown', function () { volDragging = true; });\n$('volPos').addEventListener('pointerup', function () { volDragging = false; });\n$('volPos').addEventListener('input', function (e) {\n  e.stopPropagation();\n  ctx._post('bgmSeekPct', Number(this.value) / 1000);\n});\n$('volReplay').addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmReplay'); });\n/*gv-pause*/\n/* ---- 暂停 / 继续: 音频在宿主那边放, 所以点一下发条消息让它停 / 接着放 ----\n   按钮用 JS 造 (不依赖 HTML), 老模板补丁也能把这一整块追加进去 */\ntry {\n  var _vp = $('volPause');\n  if (!_vp) {\n    _vp = document.createElement('span');\n    _vp.id = 'volPause'; _vp.className = 'gv-vol-btn'; _vp.textContent = '暂停';\n    _vp.title = '暂停 / 接着放 BGM';\n    var _vpRow = $('volReplay') ? $('volReplay').parentNode : null;\n    if (_vpRow) _vpRow.appendChild(_vp);\n  }\n  /* ★ 老快照可能被补过不止一份 -> 装过的就别再装一遍 (两份监听 = 点一下发两条 = 停了又接着放) */\n  if (!_vp.__gvPauseOn) {\n    _vp.__gvPauseOn = 1;\n    _vp.addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmPause'); });\n  }\n  if (!ctx.__gvPauseLabel) {\n    ctx.__gvPauseLabel = 1;\n    ctx.on('bgmState', function (st) {\n      try { var b = $('volPause'); if (b && st && typeof st.paused === 'boolean') b.textContent = st.paused ? '继续' : '暂停'; } catch (e) {}\n    });\n  }\n} catch (e) {}\n/*/gv-pause*/\n/* ★ 面板右上角的关闭按钮 (用 JS 造, 老模板也能自动拿到, 不会重复插一份面板) */\ntry {\n  var _vbox = $('vol');\n  if (_vbox && !$('volX')) {\n    var _vx = document.createElement('span');\n    _vx.id = 'volX'; _vx.className = 'gv-vol-x'; _vx.textContent = '×'; _vx.title = '关闭音量面板';\n    _vx.addEventListener('click', function (e) {\n      e.stopPropagation();\n      $('vol').classList.remove('gv-open');\n      if (volTimer) { clearInterval(volTimer); volTimer = null; }\n    });\n    _vbox.appendChild(_vx);\n  }\n} catch (e) {}\n$('volBgm').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number(this.value) / 100, se: Number($('volSe').value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('volSe').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number($('volBgm').value) / 100, se: Number(this.value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('vol').addEventListener('click', function(e){ e.stopPropagation(); });\n\n/*/gv-audio*/\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  /*gv-audio*/ try { var b0 = (ctx.bgmAt || [])[0]; if (b0) playBgm(b0.name); else ctx._post('bgm', ''); } catch (e) {} /*/gv-audio*/\n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });"
 },
 "user": {
  "html": "<!-- 卡里那套玩家楼层 (引擎内置 userbar 的原样移植) -->\n<div class=\"gv-userbar-wrap\" id=\"wrap\">\n  <div class=\"gv-userbar\">\n    <div class=\"gv-ubar-main\">\n      <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n      <div class=\"gv-utext\"><b id=\"uname\"></b><span id=\"utext\"></span></div>\n      <span class=\"gv-ubar-btn\" id=\"editBtn\" title=\"展开操作\">编辑</span>\n    </div>\n    <div class=\"gv-ubar-extra\" id=\"extra\">\n      <div class=\"gv-ubar-actions\" id=\"acts\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\">上移</span>\n        <span class=\"gv-tb\" data-a=\"down\">下移</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"uaBtn\">显示头像</span>\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\">删除</span>\n        <span class=\"gv-tb\" data-a=\"close\">关闭</span>\n      </div>\n      <div class=\"gv-ubar-editor\" id=\"ed\">\n        <textarea id=\"ta\"></textarea>\n        <div class=\"row\">\n          <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n          <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>",
  "css": "/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: 100%;\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n",
  "js": "/* 玩家楼层: 卡里那套 (一行 + 展开操作 + 自建编辑器) */\nfunction $(id){ return document.getElementById(id); }\nvar wrap = $('wrap'), editBtn = $('editBtn'), ed = $('ed'), ta = $('ta');\nvar ua = $('uava'), uname = $('uname'), utext = $('utext'), uaBtn = $('uaBtn');\n\nfunction showBar(c){\n  c = c || ctx;\n  var u = c.avatar || '';\n  if (u) { ua.src = u; ua.style.display = ''; } else { ua.style.display = 'none'; }\n  uname.textContent = c.name || '';\n  utext.textContent = String(c.text || '').replace(/^\\s*[（(][^）)]*[）)]\\s*/, '');\n  ta.value = String(c.text || '');\n  uaBtn.classList.toggle('gv-on', !!u);\n  uaBtn.textContent = u ? '关闭头像' : '显示头像';\n}\n\neditBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = wrap.classList.toggle('gv-open');\n  editBtn.textContent = open ? '关闭' : '编辑';\n  if (!open) ed.classList.remove('gv-open');\n});\nfunction tplToast(msg){\n  var t = document.createElement('div');\n  t.className = 'gv-tpl-toast'; t.textContent = msg;\n  wrap.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeAll(){ ed.classList.remove('gv-open'); wrap.classList.remove('gv-open'); editBtn.textContent = '编辑'; }\nArray.prototype.forEach.call(document.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    if (a === 'edit') { ed.classList.toggle('gv-open'); if (ed.classList.contains('gv-open')) ta.focus(); return; }\n    if (a === 'save') { ctx._post('save', ta.value); closeAll(); return; }\n    if (a === 'close') { closeAll(); return; }\n    ctx._post(a);\n  });\n});\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('save', ta.value); closeAll(); });\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); ed.classList.remove('gv-open'); });\ned.addEventListener('click', function(e){ e.stopPropagation(); });\nctx.on('init', showBar);\nctx.on('openEditor', function(){ ed.classList.add('gv-open'); wrap.classList.add('gv-open'); editBtn.textContent = '关闭'; ta.focus(); });"
 },
 "panel": {
  "html": "<!-- 卡里那套悬浮窗 (引擎 createPanel 的移植) + 自带三个页面(词/转/包), 不依赖宿主 -->\n<div class=\"gv-panel\" id=\"panel\">\n  <div class=\"gv-panel-head\" id=\"head\">\n    <span class=\"gv-panel-title\">楼层附加内容</span>\n    <span class=\"gv-panel-count\" id=\"count\">0</span>\n    <span class=\"gv-panel-spacer\"></span>\n    <span class=\"gv-panel-btn\" id=\"btnRaw\" title=\"渲染 / 源码\">Aa</span>\n    <span class=\"gv-panel-btn\" id=\"btnPrompt\" title=\"格式提示词（发给 AI 的）\">词</span>\n    <span class=\"gv-panel-btn\" id=\"btnPack\" title=\"素：导入高清素材包 (.zip) / 清除浏览器素材缓存\">素</span>\n    <span class=\"gv-panel-btn\" id=\"btnConv\" title=\"兜底转换 API 设置\">转</span>\n    <span class=\"gv-panel-btn\" id=\"btnRedraw\" title=\"重绘\">↻</span>\n    <span class=\"gv-panel-btn\" id=\"btnFold\" title=\"收成小球\">–</span>\n    <span class=\"gv-panel-btn\" id=\"btnMini\" title=\"关闭悬浮窗\">✕</span>\n  </div>\n  <div class=\"gv-panel-body\" id=\"body\"></div>\n\n  <!-- 三个内嵌页面: 自己在模板里画, 没有宿主也能开 -->\n  <div class=\"gv-sheet\" id=\"sheet\">\n    <div class=\"gv-sheet-head\"><span id=\"sheetTitle\">页面</span><span class=\"gv-sheet-x\" id=\"sheetX\">✕</span></div>\n    <div class=\"gv-sheet-body\" id=\"sheetBody\"></div>\n    <div class=\"gv-sheet-foot\" id=\"sheetFoot\"></div>\n  </div>\n</div>",
  "css": "\n/* ============================================================\n   悬浮窗: 各楼层的\"正文之外那一大坨\"\n   走酒馆自己的显示管线渲染 -> 预设正则(折叠思维链/摘要/选项按钮)全部生效\n   ============================================================ */\n\n/* ★ 这一层整页都在沙箱 iframe / 预览框里: 整页禁止出滚动条 (那条丑的谷歌原生滚动条就是它出来的) */\nhtml, body { overflow: hidden !important; scrollbar-width: none; margin: 0; background: transparent; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n.gv-panel, .gv-panel * { box-sizing: border-box; }\n.gv-panel {\n  position: fixed; top: 78px; right: 16px; z-index: 2147483000;\n  width: 360px; height: auto; max-height: calc(100vh - 16px); min-width: 220px; min-height: 90px;\n  display: flex; flex-direction: column; overflow: hidden;\n  border-radius: 14px;\n  background: rgba(13,15,23,.93);\n  border: 1px solid rgba(255,255,255,.16);\n  box-shadow: 0 12px 40px rgba(0,0,0,.6);\n  backdrop-filter: blur(12px) saturate(1.2); -webkit-backdrop-filter: blur(12px) saturate(1.2);\n  color: #e6e9f2; font-size: 12.5px;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-panel-head {\n  display: flex; align-items: center; gap: 6px;\n  padding: 8px 10px; cursor: move; flex: 0 0 auto;\n  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03));\n  border-bottom: 1px solid rgba(255,255,255,.10);\n}\n.gv-panel-title { font-weight: 700; font-size: 12.5px; letter-spacing: .3px; white-space: nowrap; }\n.gv-panel-count { background: #ff8fb1; color: #10121a; border-radius: 999px; padding: 0 7px; font-size: 11px; font-weight: 700; line-height: 16px; }\n.gv-panel-spacer { flex: 1; }\n.gv-panel-btn {\n  cursor: pointer; width: 21px; height: 21px; line-height: 21px; text-align: center;\n  border-radius: 6px; background: rgba(255,255,255,.09); font-size: 11px; transition: background .15s;\n}\n.gv-panel-btn:hover { background: rgba(255,255,255,.24); }\n.gv-panel-btn.gv-on { background: #ff8fb1; color: #10121a; font-weight: 700; }\n.gv-panel.gv-folded .gv-panel-body { display: none; }\n.gv-panel.gv-mini { width: auto !important; height: auto !important; }\n.gv-panel.gv-mini .gv-panel-title,\n.gv-panel.gv-mini .gv-panel-body,\n.gv-panel.gv-mini .gv-panel-btn:not(:last-child) { display: none; }\n\n.gv-panel-body { overflow: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; user-select: text; flex: 1 1 auto; min-height: 0; }\n.gv-panel-body::-webkit-scrollbar { width: 8px; }\n.gv-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 4px; }\n\n.gv-panel-item { border: 1px solid rgba(255,255,255,.10); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.035); display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }\n.gv-panel-item-head {\n  flex: 0 0 auto;\n  display: flex; align-items: center; gap: 6px; padding: 6px 9px; cursor: pointer;\n  background: rgba(255,255,255,.055); font-size: 12px;\n}\n.gv-panel-item-head:hover { background: rgba(255,255,255,.10); }\n.gv-panel-item-head b { color: #ff9fc0; font-variant-numeric: tabular-nums; }\n.gv-pitem-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .9; }\n.gv-pitem-len { opacity: .5; font-size: 11px; white-space: nowrap; }\n.gv-pitem-tag { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: rgba(127,209,255,.18); color: #9fd8ff; white-space: nowrap; }\n\n/* 每楼的动作按钮 (对应原生 Edit 里那一排) */\n.gv-panel-actions {\n  display: flex; gap: 4px; flex-wrap: wrap; padding: 5px 8px; flex: 0 0 auto;\n  background: rgba(0,0,0,.22); border-bottom: 1px solid rgba(255,255,255,.07);\n}\n.gv-act {\n  cursor: pointer; padding: 2px 9px; border-radius: 6px; font-size: 11px;\n  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.88); transition: background .15s;\n}\n.gv-act:hover { background: rgba(255,255,255,.24); }\n.gv-act.gv-danger:hover { background: rgba(255,90,90,.85); color: #fff; }\n\n.gv-panel-item-body {\n  padding: 8px 10px; flex: 1 1 auto; min-height: 0; overflow: auto; overflow-x: hidden;\n  font-size: 12.5px; line-height: 1.62; color: #c9cee0;\n  white-space: pre-wrap; word-break: break-word;\n}\n.gv-panel-item.gv-collapsed .gv-panel-item-body,\n.gv-panel-item.gv-collapsed .gv-panel-actions { display: none; }\n.gv-panel-empty { padding: 16px; text-align: center; opacity: .45; font-size: 12px; }\n\n/* 附加内容里的酒馆原生渲染结果 —— 全部限宽, 防止预设的固定宽高把面板撑爆 */\n.gv-panel-item-body > * { max-width: 100% !important; box-sizing: border-box; }\n.gv-panel-item-body .gv-rich { width: 100% !important; display: block !important; height: auto !important; min-height: 44px; }\n.gv-panel-item-body .gv-rich-iframe {\n  width: 100% !important; display: block !important; border: 0 !important;\n  height: 60px; min-height: 24px; background: transparent;\n}\n.gv-panel-item-body pre { background: rgba(0,0,0,.28); padding: 7px 9px; border-radius: 8px; font-size: 11.5px; }\n.gv-panel-item-body img, .gv-panel-item-body video, .gv-panel-item-body canvas { max-width: 100% !important; height: auto !important; }\n.gv-panel-item-body table { max-width: 100% !important; display: block; overflow-x: auto; }\n.gv-panel-item-body pre, .gv-panel-item-body code { max-width: 100% !important; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }\n.gv-panel-item-body div, .gv-panel-item-body section, .gv-panel-item-body p { max-width: 100% !important; }\n.gv-panel-item-body * { overflow-wrap: anywhere; }\n\n.gv-panel-item-body img { max-width: 100%; height: auto; border-radius: 6px; }\n.gv-panel-item-body table { border-collapse: collapse; width: 100%; margin: 4px 0; }\n.gv-panel-item-body th, .gv-panel-item-body td { border: 1px solid rgba(255,255,255,.15); padding: 2px 6px; font-size: 11.5px; }\n.gv-panel-item-body hr { border: 0; border-top: 1px solid rgba(255,255,255,.15); margin: 8px 0; }\n.gv-panel-item-body p { margin: .4em 0; }\n.gv-panel-item-body details { margin: 6px 0; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: 4px 8px; background: rgba(255,255,255,.03); }\n.gv-panel-item-body details > summary { cursor: pointer; font-weight: 600; color: #9fd8ff; }\n.gv-panel-item-body .mes_reasoning_details, .gv-panel-item-body details.gv-reasoning { opacity: .95; }\n\n/* 缩放把手: 长按边缘拖动即可改大小 */\n.gv-rs { position: absolute; z-index: 10; }\n.gv-rs-e { top: 10px; right: 0; width: 7px; bottom: 12px; cursor: ew-resize; }\n.gv-rs-s { left: 10px; right: 12px; bottom: 0; height: 7px; cursor: ns-resize; }\n.gv-rs-w { top: 10px; left: 0; width: 7px; bottom: 12px; cursor: ew-resize; }\n.gv-rs-se { right: 0; bottom: 0; width: 15px; height: 15px; cursor: nwse-resize; }\n.gv-rs-se::after {\n  content: \"\"; position: absolute; right: 3px; bottom: 3px; width: 7px; height: 7px;\n  border-right: 2px solid rgba(255,255,255,.45); border-bottom: 2px solid rgba(255,255,255,.45);\n  border-radius: 0 0 3px 0;\n}\n.gv-rs-e:hover, .gv-rs-s:hover, .gv-rs-w:hover, .gv-rs-se:hover { background: rgba(255,143,177,.25); }\n\n/* ---------- 兜底转换 API 设置弹窗 ---------- */\n.gv-cfg-mask { position: absolute; inset: 0; z-index: 30; background: rgba(6,8,14,.78);\n  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);\n  display: flex; align-items: center; justify-content: center; padding: 10px; }\n.gv-cfg { width: 100%; max-width: 330px; max-height: 100%; overflow: auto; border-radius: 12px;\n  background: #171a26; border: 1px solid rgba(255,255,255,.16); box-shadow: 0 14px 40px rgba(0,0,0,.6); }\n.gv-cfg-head { display: flex; align-items: center; padding: 9px 12px; font-weight: 700; font-size: 12.5px;\n  border-bottom: 1px solid rgba(255,255,255,.1); background: linear-gradient(180deg, rgba(255,255,255,.08), transparent); }\n.gv-cfg-x { margin-left: auto; cursor: pointer; opacity: .65; font-size: 13px; }\n.gv-cfg-x:hover { opacity: 1; }\n.gv-cfg-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 9px; }\n.gv-cfg-row { display: flex; align-items: center; gap: 8px; }\n.gv-cfg-row > label { flex: 0 0 60px; opacity: .72; font-size: 12px; }\n.gv-cfg-row input, .gv-cfg-row select {\n  flex: 1; min-width: 0; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.16);\n  border-radius: 7px; color: #e6e9f2; font-size: 12px; padding: 5px 8px; outline: none;\n  font-family: inherit; user-select: text; }\n.gv-cfg-row input:focus, .gv-cfg-row select:focus { border-color: #ff8fb1; }\n.gv-cfg-row select option { background: #171a26; color: #e6e9f2; }\n.gv-cfg-row.gv-hide { display: none; }\n.gv-sw { width: 38px; height: 20px; border-radius: 999px; background: rgba(255,255,255,.16);\n  position: relative; cursor: pointer; transition: background .18s; flex: 0 0 auto; }\n.gv-sw::after { content: \"\"; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;\n  border-radius: 50%; background: #cfd4e4; transition: transform .18s, background .18s; }\n.gv-sw.gv-on { background: #ff8fb1; }\n.gv-sw.gv-on::after { transform: translateX(18px); background: #fff; }\n.gv-cfg-note { font-size: 11px; line-height: 1.55; opacity: .5; }\n.gv-cfg-foot { display: flex; align-items: center; gap: 8px; padding: 9px 12px;\n  border-top: 1px solid rgba(255,255,255,.1); }\n.gv-cfg-status { margin-left: auto; font-size: 11px; color: #a6f0c6; opacity: 0; transition: opacity .25s; }\n.gv-cfg-status.gv-show { opacity: 1; }\n.gv-cfg-wide { max-width: 100%; }\n.gv-cfg-ta { width: 100%; height: 260px; resize: vertical; background: rgba(255,255,255,.06);\n  border: 1px solid rgba(255,255,255,.16); border-radius: 8px; color: #e6e9f2;\n  font-family: Consolas, \"Courier New\", monospace; font-size: 11.5px; line-height: 1.55;\n  padding: 8px 9px; outline: none; user-select: text; white-space: pre-wrap; }\n.gv-cfg-ta:focus { border-color: #ff8fb1; }\n\n/* ---- 悬浮窗里\"整块变编辑器\" ---- */\n.gv-panel-inline-edit{display:flex;flex-direction:column;gap:8px;}\n.gv-panel-inline-ta{width:100%;min-height:160px;box-sizing:border-box;background:rgba(0,0,0,.28);\n  border:1px solid rgba(255,255,255,.18);border-radius:8px;color:#e6e9f2;padding:9px 10px;\n  font-size:12.5px;line-height:1.65;resize:vertical;font-family:inherit;}\n.gv-panel-inline-ta:focus{outline:none;border-color:rgba(255,143,177,.75);}\n.gv-panel-inline-btns{display:flex;gap:6px;}\n\n/* 编辑框撑满整格, 不缩回去 */\n.gv-panel-inline-edit{display:flex;flex-direction:column;flex:1;min-height:0;}\n.gv-panel-inline-ta{flex:1 1 auto;min-height:140px;}\n\n/* 编辑时: 这一格自己撑满整个面板(面板改大编辑框也跟着大) */\n.gv-panel-item.gv-editing{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-item-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-inline-edit{flex:1 1 auto;min-height:0;}\n.gv-panel-item.gv-editing .gv-panel-inline-ta{flex:1 1 auto;min-height:120px;}\n\n/* 面板主体要能吃掉剩余高度, 里面的编辑器才能跟着变 */\n.gv-panel-body{flex:1 1 auto;min-height:0;}\n\n/* ===== 悬浮窗模板自带的三个页面(词/转/包) + 右下角把手 ===== */\n.gv-sheet{display:none;position:absolute;left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%);\n  width:min(300px,calc(100% - 22px));height:auto;max-height:min(76%,340px);z-index:5;\n  border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(16,18,27,.98);\n  box-shadow:0 18px 44px rgba(0,0,0,.6);\n  background:rgba(10,12,18,.97);flex-direction:column;border-radius:14px;}\n.gv-sheet.on{display:flex;}\n.gv-sheet-head{display:flex;align-items:center;padding:8px 10px;font-weight:700;font-size:12.5px;border-bottom:1px solid rgba(255,255,255,.12);}\n.gv-sheet-x{margin-left:auto;cursor:pointer;opacity:.7;padding:0 4px;}\n.gv-sheet-x:hover{opacity:1;}\n.gv-sheet-body{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}\n.gv-sheet-foot{display:flex;gap:6px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.12);}\n.gv-sheet-row{display:flex;align-items:center;gap:8px;}\n.gv-sheet-row label{width:52px;opacity:.7;flex:0 0 auto;font-size:12px;}\n.gv-sheet-row input,.gv-sheet-row select{flex:1;min-width:0;background:rgba(255,255,255,.08);\n  border:1px solid rgba(255,255,255,.16);color:#e6e9f2;border-radius:8px;padding:5px 8px;font-size:12px;}\n.gv-sheet-ta{width:100%;min-height:180px;box-sizing:border-box;background:rgba(255,255,255,.06);\n  border:1px solid rgba(255,255,255,.16);color:#e6e9f2;border-radius:8px;padding:8px;\n  font-size:12px;line-height:1.6;resize:vertical;font-family:inherit;}\n.gv-sheet-note{font-size:11.5px;opacity:.6;line-height:1.6;white-space:pre-wrap;}\n.gv-sheet-file{color:#c9cee0;font-size:12px;}\n.gv-sw{width:36px;height:20px;border-radius:999px;background:rgba(255,255,255,.18);position:relative;cursor:pointer;flex:0 0 auto;}\n.gv-sw::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s;}\n.gv-sw.gv-on{background:#ff8fb1;}\n.gv-sw.gv-on::after{left:18px;}\n.gv-sheet-toast{position:absolute;left:50%;bottom:52px;transform:translateX(-50%);\n  background:rgba(255,143,177,.95);color:#1a1016;padding:4px 12px;border-radius:999px;font-size:12px;z-index:9;}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n.gv-panel-rs{position:absolute;right:0;bottom:0;width:20px;height:20px;z-index:7;cursor:nwse-resize;touch-action:none;\n  background:linear-gradient(135deg,transparent 44%,rgba(255,255,255,.55) 50%,transparent 56%,\n    transparent 64%,rgba(255,255,255,.55) 70%,transparent 76%);}\n.gv-panel-rs:hover{background-color:rgba(255,255,255,.12);}\n/* ★ 边框也能拖: 右边一条改宽、下边一条改高 (以前只有右下角那一个 16px 的小把手, 基本点不到) */\n.gv-panel-rs-r{position:absolute;right:0;top:16px;bottom:16px;width:7px;cursor:ew-resize;background:transparent;z-index:7;touch-action:none;}\n.gv-panel-rs-b{position:absolute;bottom:0;left:16px;right:16px;height:7px;cursor:ns-resize;background:transparent;z-index:7;touch-action:none;}\n.gv-panel-rs-r:hover{background:rgba(255,255,255,.10);}\n.gv-panel-rs-b:hover{background:rgba(255,255,255,.10);}\n\n/* 面板自己不出滚动条 (内容超出由 .gv-panel-body 内部滚) */\n.gv-panel{overflow:hidden;}\n.gv-panel-body{overflow:auto;scrollbar-width:none;}\n.gv-panel-body::-webkit-scrollbar{width:0;height:0;display:none;}\n.gv-sheet-body{scrollbar-width:none;}\n.gv-sheet-body::-webkit-scrollbar{width:0;height:0;display:none;}\n.gv-panel-body::-webkit-scrollbar{width:8px;}\n.gv-panel-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:4px;}\n.gv-panel-body::-webkit-scrollbar-track{background:transparent;}\n\n/* ---- 收成小球: 黑色小球 + 猫爪 ---- */\n.gv-panel.gv-mini{width:46px !important;height:46px !important;min-width:0;min-height:0;\n  border-radius:50%;background:#0b0d14;border:1px solid rgba(255,255,255,.18);\n  display:flex;align-items:center;justify-content:center;padding:0;overflow:hidden;}\n.gv-panel.gv-mini .gv-panel-head{padding:0;border:0;background:none;justify-content:center;}\n.gv-panel.gv-mini .gv-panel-title,\n.gv-panel.gv-mini .gv-panel-count,\n.gv-panel.gv-mini .gv-panel-spacer,\n.gv-panel.gv-mini .gv-panel-body,\n.gv-panel.gv-mini .gv-sheet,\n.gv-panel.gv-mini .gv-panel-btn:not(.gv-paw){display:none;}\n.gv-panel.gv-mini .gv-panel-btn.gv-paw{width:100%;height:100%;background:none;border:0;\n  display:flex;align-items:center;justify-content:center;color:#fff;}\n/* 小球状态: 缩放把手全部藏掉 (引擎用的是 .gv-rs, 模板用的是 .gv-panel-rs, 两个都要藏,\n   否则那个右下角的白色小把手会从球边上露出来) */\n.gv-panel.gv-mini .gv-rs,\n.gv-panel.gv-mini .gv-panel-rs { display: none; }\n/* ---- 滚动条: 跟面板一个风格 (内缩的粉色药丸, 不是系统默认那条) ---- */\n.gv-panel-body, .gv-panel-item-body, .gv-sheet-body, .gv-cfg, .gv-panel-inline-ta, .gv-sheet-ta {\n  scrollbar-width: thin;\n  scrollbar-color: rgba(255,143,177,.65) rgba(255,255,255,.05);\n}\n.gv-panel-body::-webkit-scrollbar,\n.gv-panel-item-body::-webkit-scrollbar,\n.gv-sheet-body::-webkit-scrollbar,\n.gv-cfg::-webkit-scrollbar,\n.gv-panel-inline-ta::-webkit-scrollbar,\n.gv-sheet-ta::-webkit-scrollbar {\n  width: 11px;\n  height: 11px;\n}\n.gv-panel-body::-webkit-scrollbar-track,\n.gv-panel-item-body::-webkit-scrollbar-track,\n.gv-sheet-body::-webkit-scrollbar-track,\n.gv-cfg::-webkit-scrollbar-track,\n.gv-panel-inline-ta::-webkit-scrollbar-track,\n.gv-sheet-ta::-webkit-scrollbar-track {\n  background: rgba(255,255,255,.045);\n  border-radius: 999px;\n  margin: 5px 2px;\n}\n.gv-panel-body::-webkit-scrollbar-thumb,\n.gv-panel-item-body::-webkit-scrollbar-thumb,\n.gv-sheet-body::-webkit-scrollbar-thumb,\n.gv-cfg::-webkit-scrollbar-thumb,\n.gv-panel-inline-ta::-webkit-scrollbar-thumb,\n.gv-sheet-ta::-webkit-scrollbar-thumb {\n  background: rgba(255,143,177,.5);\n  border: 3px solid transparent;\n  background-clip: content-box;\n  border-radius: 999px;\n}\n.gv-panel-body::-webkit-scrollbar-thumb:hover,\n.gv-panel-item-body::-webkit-scrollbar-thumb:hover,\n.gv-sheet-body::-webkit-scrollbar-thumb:hover,\n.gv-cfg::-webkit-scrollbar-thumb:hover,\n.gv-panel-inline-ta::-webkit-scrollbar-thumb:hover,\n.gv-sheet-ta::-webkit-scrollbar-thumb:hover {\n  background: #ff8fb1;\n  border: 3px solid transparent;\n  background-clip: content-box;\n  border-radius: 999px;\n}\n.gv-panel-body::-webkit-scrollbar-corner,\n.gv-panel-item-body::-webkit-scrollbar-corner,\n.gv-sheet-body::-webkit-scrollbar-corner,\n.gv-cfg::-webkit-scrollbar-corner,\n.gv-panel-inline-ta::-webkit-scrollbar-corner,\n.gv-sheet-ta::-webkit-scrollbar-corner {\n  background: transparent;\n}\n/* 小球: 整颗都能拖 */\n.gv-panel.gv-mini .gv-panel-btn.gv-paw { cursor: move; }\n\n/* ---- 自绘滚动条 (JS 画, 见 attachScrollbar): 原生那条在 Chrome 里又丑又调不动 ---- */\n.gv-panel-item { position: relative; }\n.gv-sbhost { scrollbar-width: none; }\n.gv-sbhost::-webkit-scrollbar { width: 0 !important; height: 0 !important; }\n.gv-sb { position: absolute; right: 3px; width: 7px; pointer-events: none; z-index: 6; opacity: .85; transition: opacity .18s; }\n.gv-sb-thumb { position: absolute; left: 0; right: 0; top: 4px; border-radius: 999px;\n  background: linear-gradient(180deg, rgba(255,143,177,.92), rgba(255,143,177,.55));\n  box-shadow: 0 0 6px rgba(255,143,177,.28); }\n.gv-panel:hover .gv-sb { opacity: 1; }\n\n/* ★ 以前这里把面板改成 position:relative 居中(老设计: 宿主按面板包围盒给 iframe 定尺寸)。\n   现在宿主是\"整窗口画布 + clip-path\", 面板必须保持 fixed —— 它的 left/top 就是窗口坐标,\n   否则拖动会跟手错位、右下角把手和收小球全点不到 (实测: 面板被这条规则顶到 x=1770 点不着)。 */\n.gv-panel .gv-rs { display: none; }\n.gv-panel-body { max-height: none; }\n",
  "js": "/* 悬浮窗: 卡里那套 + 自带页面(词/转/包), 宿主接不接都能用 */\nvar folded = {}, rawMode = false, lastEntries = [], foldedAll = false, dragMoved = false;\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nvar root = $('panel'), body = $('body'), count = $('count');\n\n/* ---- 富渲染出来的活 iframe: 高度由它里面那段 prelude 用 postMessage 报过来 ----\n   沙箱里读不到 iframe 的 contentDocument, 所以只能让它自己报 (真机/预览同一套) */\nwindow.addEventListener('message', function(ev){\n  var d = ev.data; if (!d || d.__gvFit !== 1) return;\n  var h = Math.max(0, Math.round(Number(d.h) || 0));\n  var list = body.querySelectorAll('iframe.gv-rich-iframe');\n  for (var i = 0; i < list.length; i++) {\n    if (list[i].contentWindow !== ev.source) continue;\n    list[i].style.height = (h > 24 ? h + 10 : 0) + 'px';\n    list[i].style.display = h > 24 ? 'block' : 'none';\n    var holder = list[i].parentElement;\n    if (holder && holder.classList && holder.classList.contains('gv-rich')) holder.style.display = h > 24 ? '' : 'none';\n    try { if (typeof sbBody === 'function') { sbBody(); sbSyncs.forEach(function(s){ s(); }); } } catch (e) {}\n  }\n});\n\n/* ---- 自绘滚动条 (和卡里一个样式): 原生那条 Chrome 画得丑 ---- */\nvar sbSyncs = [];\nfunction attachScrollbar(scroller, host){\n  try {\n    scroller.classList.add('gv-sbhost');\n    var bar = el('div', 'gv-sb'), thumb = el('div', 'gv-sb-thumb');\n    bar.appendChild(thumb); host.appendChild(bar);\n    var sync = function(){\n      var sh = scroller.scrollHeight, ch = scroller.clientHeight;\n      if (sh <= ch + 1) { bar.style.display = 'none'; return; }\n      bar.style.display = 'block';\n      var r = scroller.getBoundingClientRect(), hr = host.getBoundingClientRect();\n      bar.style.top = Math.round(r.top - hr.top) + 'px';\n      bar.style.height = Math.round(r.height) + 'px';\n      var track = Math.max(20, r.height - 8);\n      var h = Math.max(26, Math.round(track * ch / sh));\n      thumb.style.height = h + 'px';\n      var max = sh - ch;\n      var t = max > 0 ? scroller.scrollTop / max : 0;\n      thumb.style.transform = 'translateY(' + Math.round(t * Math.max(0, track - h)) + 'px)';\n    };\n    scroller.addEventListener('scroll', sync, { passive: true });\n    if (window.ResizeObserver) { var ro = new ResizeObserver(function(){ sync(); }); ro.observe(scroller); ro.observe(host); }\n    setTimeout(sync, 0);\n    return sync;\n  } catch (e) { return function(){}; }\n}\nvar sbBody = attachScrollbar(body, root);\nvar sheet = $('sheet'), sheetTitle = $('sheetTitle'), sheetBody = $('sheetBody'), sheetFoot = $('sheetFoot');\n\n/* ---------- 页面容器 ---------- */\nfunction openSheet(title, nodes, buttons){\n  sheetTitle.textContent = title;\n  sheetBody.innerHTML = '';\n  nodes.forEach(function(n){ sheetBody.appendChild(n); });\n  sheetFoot.innerHTML = '';\n  (buttons || []).forEach(function(b){ sheetFoot.appendChild(b); });\n  sheet.classList.add('on');\n  fitSelf();\n}\nfunction closeSheet(){ sheet.classList.remove('on'); }\n$('sheetX').addEventListener('click', closeSheet);\n\nfunction row(label, node){\n  var r = el('div', 'gv-sheet-row');\n  r.appendChild(el('label', '', label));\n  r.appendChild(node);\n  return r;\n}\nfunction btn(label, primary, fn){\n  var b = el('span', 'gv-tb' + (primary ? ' gv-primary' : ''), label);\n  b.addEventListener('click', fn);\n  return b;\n}\nfunction flash(msg, fail){\n  var t = el('div', 'gv-sheet-toast' + (fail ? ' bad' : ''), msg);\n  (sheet.classList.contains('on') ? sheet : root).appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\n\n/* ---------- 词: 提示词 ---------- */\nfunction openPrompt(){\n  var ta = document.createElement('textarea');\n  ta.className = 'gv-sheet-ta';\n  ta.spellcheck = false;\n  ta.value = String(ctx.prompt || '');\n  ta.placeholder = '这里是发给 AI 的格式提示词（插件里「提示词」页生成的那份）';\n  var note = el('div', 'gv-sheet-note', '没有宿主时这里显示的是插件传进来的提示词；有宿主(角色脚本)时保存会真的写回去。');\n  openSheet('格式提示词', [ta, note], [\n    btn('保存', true, function(){ ctx._post('setPrompt', ta.value); }),\n    btn('复制', false, function(){ try { ta.select(); document.execCommand('copy'); flash('已复制'); } catch (e) {} }),\n    btn('关闭', false, closeSheet),\n  ]);\n}\n/* ---------- 转: 兜底转换 API ---------- */\nvar CONV_KINDS = [['deepseek', '官方 DeepSeek'], ['gemini', '官方 Gemini'], ['claude', '官方 Claude'], ['custom', '兼容 OpenAI 格式']];\nfunction openConvert(){\n  var cfg = ctx.convertCfg || {};\n  var sw = el('div', 'gv-sw' + (cfg.enabled !== false ? ' gv-on' : ''));\n  sw.addEventListener('click', function(){ sw.classList.toggle('gv-on'); });\n  var sel = document.createElement('select');\n  CONV_KINDS.forEach(function(k){ var o = document.createElement('option'); o.value = k[0]; o.textContent = k[1]; sel.appendChild(o); });\n  sel.value = cfg.kind || 'deepseek';\n  var key = document.createElement('input'); key.type = 'password'; key.placeholder = 'sk-...（留空 = 用酒馆当前的主 API）'; key.value = cfg.key || '';\n  var url = document.createElement('input'); url.type = 'text'; url.placeholder = '自定义接口地址'; url.value = cfg.url || '';\n  var model = document.createElement('input'); model.type = 'text'; url.placeholder = ''; model.placeholder = '模型名'; model.value = cfg.model || '';\n  var note = el('div', 'gv-sheet-note', '密钥只存在你自己的浏览器里，不会写进角色卡。');\n  function collect(){ return { enabled: sw.classList.contains('gv-on'), kind: sel.value, key: key.value.trim(), url: url.value.trim(), model: model.value.trim() }; }\n  openSheet('兜底转换 API', [row('启用', sw), row('服务', sel), row('密钥', key), row('接口', url), row('模型', model), note], [\n    btn('保存', true, function(){ ctx._post('convertCfg', collect()); }),\n    btn('关闭', false, closeSheet),\n  ]);\n}\n/* ---------- 素材: ① 导入高清素材包  ② 清除浏览器素材缓存 ---------- */\nfunction openPack(){\n  var note = el('div', 'gv-sheet-note', '脚本自带低清版；这里导入高清 .zip（同名覆盖）。');\n  noteEl = note;\n  var picker = document.createElement('input');\n  picker.type = 'file'; picker.accept = '.zip,application/zip';\n  picker.className = 'gv-sheet-file';\n  var noteEl = null;\n  picker.addEventListener('change', function(){\n    var f = picker.files && picker.files[0];\n    if (!f) return;\n    /* ★ 必须把【字节】发给宿主 —— 以前只发名字/大小, 宿主那边拿不到文件, 点了等于没点 */\n    if (noteEl) noteEl.textContent = '正在读取 ' + f.name + ' …';\n    var done = function(buf){\n      if (buf) { if (noteEl) noteEl.textContent = '正在导入：' + f.name + '（' + Math.round((f.size||0)/1024) + ' KB）—— 结果看右下角提示'; ctx._post('packFile', { name: f.name, size: f.size, buf: buf }); }\n      else { if (noteEl) noteEl.textContent = '这个浏览器读不出这个文件，换个浏览器试试'; ctx._post('packFile', { name: f.name, size: f.size }); }\n    };\n    try {\n      if (f.arrayBuffer) f.arrayBuffer().then(done).catch(function(){ done(null); });\n      else { var fr = new FileReader(); fr.onload = function(){ done(fr.result); }; fr.onerror = function(){ done(null); }; fr.readAsArrayBuffer(f); }\n    } catch (e) { done(null); }\n  });\n  /* ★ ② 清除浏览器素材缓存: 角色脚本每次打开都会自动恢复\"以前导入过的包\",\n     旧包里同名素材会盖住新脚本自带的 —— 卡片更新后还显示旧素材时, 清一下再刷新页面。 */\n  var clr = el('div', 'gv-sheet-note', '旧素材还显示？清一下浏览器里的缓存，再刷新。');\n  var bPick = btn('① 导入高清素材包 (.zip)', true, function(){ picker.click(); });\n  var bClr = btn('② 清除浏览器素材缓存', false, function(){\n    if (noteEl) noteEl.textContent = '正在清除…';\n    ctx._post('clearPackCache');\n  });\n  openSheet('素材', [note, row('选择文件', picker), clr], [bPick, bClr, btn('关闭', false, closeSheet)]);\n}\n\n/* ---------- 头部按钮 ---------- */\n$('btnConv').addEventListener('click', function(e){ e.stopPropagation(); openConvert(); });\n$('btnPrompt').addEventListener('click', function(e){ e.stopPropagation(); openPrompt(); });\n$('btnPack').addEventListener('click', function(e){ e.stopPropagation(); openPack(); });\n$('btnRedraw').addEventListener('click', function(e){ e.stopPropagation(); ctx._post('redraw'); });\n/* – = 收成小球 (黑色小球 + 猫爪肉球) */\nvar PAW = '<svg viewBox=\"0 0 32 32\" width=\"20\" height=\"20\" aria-hidden=\"true\">' +\n  '<ellipse cx=\"16\" cy=\"21\" rx=\"7.6\" ry=\"6.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"7.4\" cy=\"13\" r=\"3.2\" fill=\"#fff\"/>' +\n  '<circle cx=\"13\" cy=\"7.8\" r=\"3.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"19.4\" cy=\"7.8\" r=\"3.4\" fill=\"#fff\"/>' +\n  '<circle cx=\"25\" cy=\"13\" r=\"3.2\" fill=\"#fff\"/></svg>';\n$('btnFold').addEventListener('click', function(){\n  if (dragMoved) { dragMoved = false; return; }   // 拖球之后不要顺手展开\n  var mini = root.classList.toggle('gv-mini');\n  this.innerHTML = mini ? PAW : '–';\n  this.title = mini ? '展开悬浮窗' : '收成小球';\n  this.classList.toggle('gv-paw', mini);\n});\n$('btnRaw').addEventListener('click', function(){ rawMode = !rawMode; this.classList.toggle('gv-on', rawMode); render(lastEntries); });\n/* ✕ = 直接关掉整个悬浮窗 (重开这个角色的聊天才会再出来) */\n$('btnMini').addEventListener('click', function(e){\n  e.stopPropagation();\n  closeSheet();\n  root.style.display = 'none';\n  ctx._post('closePanel');\n  flash('悬浮窗已关闭（重新打开这个聊天才会再出现）');\n});\n\n/* ---------- 拖动: 直接在沙箱里挪 (不记录位置, 重进回初始) ---------- */\n(function(){\n  var drag = null;\n  function clampSelf(){\n    if (!root.style.left) return;\n    var r = root.getBoundingClientRect();\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var nl = Math.max(-(r.width - 80), Math.min(vw - 80, r.left));\n    var nt = Math.max(0, Math.min(vh - 40, r.top));\n    if (Math.round(nl) !== Math.round(r.left) || Math.round(nt) !== Math.round(r.top)) {\n      root.style.left = Math.round(nl) + 'px'; root.style.top = Math.round(nt) + 'px';\n    }\n  }\n  /* ★ 尺寸一变就报一次: 宿主拿它抠 clip-path(画布=整个窗口) —— 那里就是\"鼠标能点到面板\"的区域。\n     以前只在拖动/改大小/开编辑时报, 楼层渲染完自己长高了却不报 -> 宿主的可点区域还停在旧的小方块上,\n     表现就是\"面板看得见、但点不到 / 拖不动 / 改不了大小\"。 */\n  try {\n    if (window.ResizeObserver) new ResizeObserver(function(){ fitSelf(); }).observe(root);\n    window.addEventListener('load', function(){ setTimeout(fitSelf, 80); });\n    setTimeout(fitSelf, 300);\n  } catch (e) {}\n  /* ★ 以前按 root.style.left||0 算 —— 面板本来靠 right:16px 定位, 第一次拖会先跳到左上角,\n     看着就是\"能动的范围莫名其妙只有一小块\"。现在按【当前真实位置】算, 按下即跟手。 */\n  $('head').addEventListener('mousedown', function(e){\n    dragMoved = false;   // 每次按下都清, 免得上一轮拖动把这一次点击吃掉\n    if (e.target.closest('.gv-panel-btn') && !root.classList.contains('gv-mini')) return;   // 小球时整球可拖\n    var r = root.getBoundingClientRect();\n    root.style.right = 'auto';\n    root.style.left = Math.round(r.left) + 'px';\n    root.style.top = Math.round(r.top) + 'px';\n    drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };\n    e.preventDefault();\n  });\n  document.addEventListener('mousemove', function(e){\n    if (!drag) return;\n    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;\n    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;\n    /* ★ 活动范围 = 整块画布: 只保证\"至少 80px 留在画面里、标题那一行不会被推出上边\",\n       其余随便拖 —— 以前没有任何限制, 拖出去就再也点不到了 (小球同理) */\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var nl = Math.max(-(drag.w - 80), Math.min(vw - 80, drag.l + dx));\n    var nt = Math.max(0, Math.min(vh - 40, drag.t + dy));\n    root.style.left = Math.round(nl) + 'px';\n    root.style.top = Math.round(nt) + 'px';\n    fitSelf();\n    ctx._post('move', { dx: Math.round(dx), dy: Math.round(dy) });   // 将来宿主想接管也可以\n  });\n  document.addEventListener('mouseup', function(){ drag = null; });\n  window.addEventListener('resize', function(){ clampSelf(); fitSelf(); });\n})();\n\n/* ---------- 让外框跟着面板走: 拖动/改大小/开页面之后都报一次 ---------- */\nvar lastFit = null;\nfunction fitSelf(){\n  var mini = root.classList.contains('gv-mini');\n  var r = root.getBoundingClientRect();\n  /* ★ 收成小球也要报【真实尺寸】: 以前故意报旧的大尺寸 -> 外框还是那么大, 小球被挡掉一半点不到。\n     展开时会再报一次全尺寸(下面这段每次拖动/改大小/开关都会调用)。 */\n  /* ★ 报【面板自己在窗口里的位置 + 尺寸】: 宿主拿它去抠 clip-path(画布=整个窗口)。\n     老宿主只认 w/h 当包围盒, 所以 resize 那条继续报\"右下角坐标 + 14\"。 */\n  var need = { x: Math.round(r.left), y: Math.round(r.top), w: Math.ceil(r.width), h: Math.ceil(r.height) };\n  if (!mini) lastFit = need;\n  ctx._post('resize', need.y + need.h + 14);\n  ctx._post('wantSize', need);\n}\n\n/* 编辑框跟着面板高度走 */\nfunction syncEditorHeight(){\n  var ed = root.querySelector('.gv-panel-inline-edit');\n  if (!ed || !ed.parentNode) return;\n  var body = ed.parentNode;\n  var whole = root.getBoundingClientRect().height;\n  var chrome = Number(body.dataset.gvChrome) || 0;       // 打开编辑那一刻量到的\"除正文外的固定高度\"\n  body.style.minHeight = Math.max(160, Math.round(whole - chrome)) + 'px';\n}\n\n/* ---------- 改大小: 右下角 / 右边框 / 下边框都能拖 (沙箱内, 不记录尺寸) ---------- */\n(function(){\n  function mkHandle(cls, title){ var h = el('div', 'gv-panel-rs ' + cls); h.title = title; root.appendChild(h); return h; }\n  /* ★ 类名要和 CSS 对上: 模板 CSS 里写的是 .gv-panel-rs-r / .gv-panel-rs-b\n     (以前写成 gv-rs-r/gv-rs-b -> 选择器匹配不上, 两条边把手被渲染成跟右下角一样大的方块) */\n  var corner = mkHandle('gv-rs-corner', '拖动改大小');\n  var edgeR = mkHandle('gv-panel-rs-r', '拖动改宽度');\n  var edgeB = mkHandle('gv-panel-rs-b', '拖动改高度');\n  var rs = null;\n  function start(e, dir){\n    e.stopPropagation(); e.preventDefault();\n    var r = root.getBoundingClientRect();\n    rs = { dir: dir, x: e.clientX, y: e.clientY, w: r.width, h: r.height, l: r.left, t: r.top };\n    root.style.maxHeight = 'none';           // ★ 72vh 那个高度上限, 一拖就撤掉, 想多高就多高\n    root.style.right = 'auto';\n    root.style.left = Math.round(r.left) + 'px';\n    root.style.top = Math.round(r.top) + 'px';\n  }\n  corner.addEventListener('mousedown', function(e){ start(e, 'se'); });\n  edgeR.addEventListener('mousedown', function(e){ start(e, 'e'); });\n  edgeB.addEventListener('mousedown', function(e){ start(e, 's'); });\n  document.addEventListener('mousemove', function(e){\n    if (!rs) return;\n    var vw = window.innerWidth || 400, vh = window.innerHeight || 640;\n    var maxW = Math.max(240, vw - rs.l - 2), maxH = Math.max(120, vh - rs.t - 2);\n    if (rs.dir.indexOf('e') >= 0) root.style.width = Math.round(Math.max(240, Math.min(maxW, rs.w + (e.clientX - rs.x)))) + 'px';\n    if (rs.dir.indexOf('s') >= 0) root.style.height = Math.round(Math.max(120, Math.min(maxH, rs.h + (e.clientY - rs.y)))) + 'px';\n    syncEditorHeight();\n    fitSelf();\n  });\n  document.addEventListener('mouseup', function(){ rs = null; });\n})();\n\n/* ---------- 编辑: 把这一格的内容区整块换成编辑器 (和 char 那套一个风格) ---------- */\nfunction openItemEditor(item, e){\n  var body = item.querySelector('.gv-panel-item-body');\n  if (!body || body.querySelector('.gv-panel-inline-edit')) return;\n  /* ★ 编辑时不许缩: 把整块高度锁住, 编辑框撑满它 */\n  var whole = Math.max(220, Math.round(root.getBoundingClientRect().height));\n  if (!root.style.height) root.style.height = whole + 'px';\n  var prevBodyH = body.style.minHeight;\n  var chrome = Math.max(120, Math.round(whole - body.getBoundingClientRect().height));\n  body.dataset.gvChrome = String(chrome);\n  body.style.minHeight = Math.max(160, whole - chrome) + 'px';\n  var prev = body.innerHTML;\n  item.classList.add('gv-editing');\n  var wrap = el('div', 'gv-panel-inline-edit');\n  var ta = document.createElement('textarea');\n  ta.className = 'gv-panel-inline-ta';\n  ta.spellcheck = false;\n  ta.value = String(e.raw || '');\n  var row = el('div', 'gv-panel-inline-btns');\n  var bOk = el('span', 'gv-tb gv-primary', '确认修改');\n  var bNo = el('span', 'gv-tb', '退出修改');\n  row.append(bOk, bNo);\n  wrap.append(ta, row);\n  body.innerHTML = '';\n  body.appendChild(wrap);\n  bNo.addEventListener('click', function(ev){ ev.stopPropagation(); body.innerHTML = prev; body.style.minHeight = prevBodyH; item.classList.remove('gv-editing'); fitSelf(); });\n  bOk.addEventListener('click', function(ev){\n    ev.stopPropagation();\n    e.raw = ta.value;\n    e.html = ta.value.replace(/[&<>]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });\n    ctx._post('saveFloor', { id: e.id, text: ta.value });\n    body.style.minHeight = prevBodyH;\n    item.classList.remove('gv-editing');\n    render(lastEntries);            // 保存后按新内容重画整列\n    fitSelf();\n  });\n  ta.addEventListener('click', function(ev){ ev.stopPropagation(); });\n  ta.focus();\n  fitSelf();\n}\n\n/* ---------- 列表 ---------- */\nfunction render(entries){\n  lastEntries = entries || [];\n  body.innerHTML = '';\n  var shown = lastEntries.filter(function(e){ return (e.html && String(e.html).trim()) || (e.raw && String(e.raw).trim()); });\n  count.textContent = String(shown.length);\n  if (!shown.length) { body.appendChild(el('div', 'gv-panel-empty', '暂无附加内容')); return; }\n  shown.forEach(function(e){\n    var item = el('div', 'gv-panel-item' + (folded[e.id] ? ' gv-collapsed' : ''));\n    var h = el('div', 'gv-panel-item-head');\n    h.appendChild(el('b', '', '#' + e.id));\n    h.appendChild(el('span', 'gv-pitem-name', e.name || '旁白'));\n    h.appendChild(el('span', 'gv-pitem-len', (e.raw ? e.raw.length : 0) + ' 字'));\n    if (e.story) h.appendChild(el('span', 'gv-pitem-tag', '有剧情'));\n    var acts = el('div', 'gv-panel-actions');\n    [['编辑', 'edit', false, '打开编辑器'], ['复制', 'copy', false, '复制这一楼内容'],\n     ['上移', 'up', false, '楼层上移'], ['下移', 'down', false, '楼层下移'],\n     ['删除', 'delete', true, '删除这一楼']].forEach(function(a){\n      var b = el('span', 'gv-act' + (a[2] ? ' gv-danger' : ''), a[0]);\n      b.title = a[3];\n      b.addEventListener('click', function(ev){\n        ev.stopPropagation();\n        if (a[1] === 'edit') { openItemEditor(item, e); return; }   // 整块变成编辑器\n        ctx._post(a[1], e.id);\n      });\n      acts.appendChild(b);\n    });\n    var content = el('div', 'gv-panel-item-body');\n    if (rawMode) content.textContent = e.raw || '';\n    else content.innerHTML = e.html || '';\n    h.addEventListener('click', function(){\n      folded[e.id] = !folded[e.id];\n      item.classList.toggle('gv-collapsed', !!folded[e.id]);\n    });\n    item.appendChild(h); item.appendChild(acts); item.appendChild(content);\n    body.appendChild(item);\n    sbSyncs.push(attachScrollbar(content, item));\n  });\n  sbBody();\n  requestAnimationFrame(function(){ sbBody(); sbSyncs.forEach(function(s){ s(); }); });\n}\nctx.on('init', function(c){\n  render(c.floors || []);\n  /* 预览: 宿主给了框子高度 -> 面板不要长出去 (不然下面的内容被裁掉又看不到滚动条) */\n  if (c.panelBox && c.panelBox.h) root.style.maxHeight = Math.max(200, Number(c.panelBox.h) - 16) + 'px';\n  /* 宿主记着上次拖到哪 -> 重画(不是刷新预览)时位置保持 */\n  if (c.panelOffset) {\n    root.style.left = (Number(c.panelOffset.dx) || 0) + 'px';\n    root.style.top = (Number(c.panelOffset.dy) || 0) + 'px';\n    lastFit = null;\n  }\n  setTimeout(fitSelf, 60);\n  if (c.prompt != null) ctx.prompt = c.prompt;\n  if (c.convertCfg) ctx.convertCfg = c.convertCfg;\n  $('btnConv').classList.toggle('gv-on', !!(c.convertCfg && c.convertCfg.enabled !== false));\n});\nctx.on('floors', function(list){ render(list || []); });\nctx.on('convert', function(on){ $('btnConv').classList.toggle('gv-on', !!on); });\nctx.on('prompt', function(t){ ctx.prompt = t; });\nctx.on('toast', function(msg){ if (msg) flash(String(msg)); });   // 宿主回的提示"
 },
 "charLand": {
  "html": "<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        <!--gv-audio--><span class=\"gv-tb\" data-a=\"volume\" id=\"btnVol\" title=\"调整 BGM / 音效 的音量\">调整音量</span><!--/gv-audio-->\n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    <!--gv-audio--><div class=\"gv-vol\" id=\"vol\">\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音频</span><input class=\"gv-vol-rng\" id=\"volBgm\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volBgmPc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">音效</span><input class=\"gv-vol-rng\" id=\"volSe\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"><span class=\"gv-vol-pc\" id=\"volSePc\">80%</span></div>\n      <div class=\"gv-vol-row\"><span class=\"gv-vol-lb\">进度</span><input class=\"gv-vol-rng\" id=\"volPos\" type=\"range\" min=\"0\" max=\"1000\" step=\"1\" value=\"0\"><span class=\"gv-vol-pc\" id=\"volPosPc\">0:00</span><span class=\"gv-vol-btn\" id=\"volReplay\">重播</span></div>\n      <div class=\"gv-vol-tip\">拖到 0 就是静音；音量记在这台设备上；进度条跟着 BGM 走</div>\n    </div><!--/gv-audio-->\n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>",
  "css": "/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n/* 音量面板 (右上角「编辑 → 调整音量」) —— gv-vol-v2: 放在画面上半部分, 不挡下面的对话框 */\n.gv-vol { position: absolute; left: 12px; right: 12px; top: 12%; bottom: auto; z-index: 40; display: none;\n  flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px;\n  background: rgba(16,18,28,.94); border: 1px solid rgba(255,255,255,.18); color: #e6e9f2; }\n.gv-vol.gv-open { display: flex; }\n.gv-vol-row { display: flex; align-items: center; gap: 9px; font-size: 12px; }\n.gv-vol-lb { width: 32px; flex: 0 0 auto; }\n.gv-vol-rng { flex: 1; accent-color: #ff8fb1; }\n.gv-vol-pc { width: 40px; text-align: right; font-size: 11px; opacity: .8; }\n.gv-vol-tip { font-size: 11px; opacity: .6; }\n.gv-vol-btn { flex: 0 0 auto; padding: 2px 9px; border-radius: 7px; font-size: 11px; cursor: pointer;\n  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }\n.gv-vol-btn:hover { background: rgba(255,143,177,.85); color: #10121a; }\n/* gv-vol-v4 */\n.gv-vol-x { position: absolute; top: 4px; right: 8px; width: 20px; height: 20px; line-height: 19px;\n  text-align: center; border-radius: 6px; font-size: 15px; cursor: pointer; opacity: .7; background: rgba(255,255,255,.12); }\n.gv-vol-x:hover { opacity: 1; background: rgba(255,143,177,.9); color: #10121a; }\n\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n\n/* ============================================================\n   横版覆盖（版式 = 横版 · 设计宽 640 · 640×360）\n   这一份是【追加在竖版 CSS 后面】的覆盖层：\n   手机框比例、立绘高度、对话框、音量面板、贴纸大小 换成横屏那种galgame 布局，\n   其余（背景铺满、演出动画、编辑器、气泡、HUD）沿用竖版那一套。\n   ============================================================ */\n.gv-phone {\n  width: min(100%, 640px);\n  aspect-ratio: 16 / 9;\n  max-height: none;\n  border-radius: 14px;\n}\n/* 立绘: 横屏时别顶到顶, 留一点天花板 (画了占位框的话, 以框的高度为准) */\n.gv-sprite { height: var(--gv-h, 94%); }\n/* 对话框: 横屏做成\"底部一条\" —— 别占满整屏, 文字也小一号 */\n.gv-ui { padding: 0 12px 10px; }\n.gv-box { min-height: 0; border-radius: 12px; padding: 12px 14px 13px; }\n.gv-text { font-size: 14.5px; line-height: 1.62; min-height: 3em; }\n.gv-name { font-size: 13px; top: -12px; padding: 3px 12px; }\n.gv-uava { width: 36px; height: 36px; top: -11px; border-radius: 10px; }\n/* 音量面板: 横屏上下更矮, 所以往中间收一点 */\n.gv-vol { top: 6%; left: 18%; right: 18%; }\n/* 气泡贴纸: 屏幕矮, 30% 太大 */\n.gv-sticker { width: 17%; }\n.gv-bubble { font-size: 26px; }\n/* 提示条 / HUD 的位置微调 */\n.gv-tpl-toast { bottom: 10px; font-size: 11.5px; }\n.gv-hud { padding: 6px 6px 2px; }\n",
  "js": "/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 640;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n/*gv-audio*/\n/* ---- 声音: 自己播 (data: 能用就自己放, 否则叫宿主) ----\n   __gvAudioV4__  ← 这一块的\"新版\"标记。必须落在这段的【截取范围内】:\n   插件给老方案补这一块时靠它判断补没补过, 标记在范围外 -> 每次打开插件都会再补一份 (老方案的 JS 被叠过几十份)\n   ★ 自检: window.__gvAudio 里记着调用/命中/播放次数, 探针能直接看是哪一步没走到 */\n/* 老快照(页面排版里存过的)可能没有 $ 的定义 -> 这一整块一开头就 ReferenceError, 什么都装不上。\n   这里补一个兜底: 没有就自己造一个 (有就什么都不做) */\ntry { if (typeof window.$ !== 'function') window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}\nvar bgmEl = null, seEl = null, bgmNow = '';\nwindow.__gvAudio = { calls: 0, miss: 0, played: 0, se: 0, err: '', ready: false };\nfunction volNow(){ var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : {}; return { bgm: c.bgm == null ? .8 : c.bgm, se: c.se == null ? .8 : c.se }; }\nfunction ensureAudio(){ if (bgmEl) return true; try { bgmEl = new Audio(); bgmEl.loop = true; seEl = new Audio(); window.__gvAudio.ready = true; return true; } catch (e) { window.__gvAudio.err = String(e); return false; } }\nfunction hasLocalAudio(){ return !!(ctx.audioBgm && Object.keys(ctx.audioBgm).length) || !!(ctx.audioSe && Object.keys(ctx.audioSe).length); }\n/* __gvAudioV2__ : 沙箱 iframe 是独立源, 默认没有自动播放权限 -> 自己 play() 永远 NotAllowedError。\n   所以声音一律由【宿主】放: 预览里是插件(普通源), 真机上是引擎。 */\nfunction playBgm(name, tries){\n  window.__gvAudio.calls++;\n  if (!name) return;\n  bgmNow = name;\n  ctx._post('bgm', name);\n}\nfunction playBgmLocal(name){\n  var u = (ctx.audioBgm || {})[name];\n  if (!u) return;\n  if (!ensureAudio()) return;\n  if (bgmEl.src && !bgmEl.paused) return;\n  bgmEl.src = u; bgmEl.volume = volNow().bgm;\n  try { bgmEl.play().catch(function(){}); } catch (e) {}\n}\nfunction playSe(name, tries){\n  if (!name) return;\n  ctx._post('se', name);                 // 同样交给宿主放\n  window.__gvAudio.se++;\n}\n\n/*gv-audio*/\n/* ---- 音量: 两个滑块, 拖到 0 = 静音; 自己放的话直接改自己的音量, 值也给宿主存 ---- */\nfunction toggleVol(){ var v = $('vol'); if (!v) return;\n  /* ★ 一次点击只认一次: 老方案里这块代码被补过重复的 [data-a] 处理器, 点一下会 toggle 两三回\n     -> 音量面板\"闪一下就没了\"。150ms 内的重复调用直接吞掉 (真手速不可能这么快) */\n  var _tv = Date.now();\n  if (toggleVol.__at && _tv - toggleVol.__at < 150) return;\n  toggleVol.__at = _tv;\n  v.classList.toggle('gv-open');\n  if (v.classList.contains('gv-open')) { syncVol(); try { ctx._post('bgmQuery'); } catch (e) {}\n    if (!volTimer) volTimer = setInterval(volPoll, 600); }\n  else if (volTimer) { clearInterval(volTimer); volTimer = null; } }\n/* ★ 独立监听: 老模板里的 [data-a] 处理器不认识 volume, 这里自己兜住 (它多发的那条消息无害) */\ntry {\n  var _vbtn = document.querySelector('[data-a=\"volume\"]');\n  if (_vbtn) _vbtn.addEventListener('click', function (e) { e.stopPropagation(); setTimeout(toggleVol, 0); });\n} catch (e) {}\nfunction syncVol(){\n  var c = (ctx.volume && typeof ctx.volume === 'object') ? ctx.volume : { bgm: 0.8, se: 0.8 };\n  var b = $('volBgm'), s = $('volSe');\n  if (b) { b.value = String(Math.round((c.bgm != null ? c.bgm : 0.8) * 100)); }\n  if (s) { s.value = String(Math.round((c.se != null ? c.se : 0.8) * 100)); }\n  volLabel();\n}\nfunction volLabel(){\n  var b = $('volBgm'), s = $('volSe'), bp = $('volBgmPc'), sp = $('volSePc');\n  if (bp && b) bp.textContent = b.value + '%';\n  if (sp && s) sp.textContent = s.value + '%';\n}\n/* ---- 进度条 + 重播: 音频在宿主那边, 所以靠消息问/发 ---- */\nvar volTimer = null, volDragging = false;\nfunction fmtT(sec){ sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }\nfunction volPoll(){\n  if (!($('vol') || {}).classList || !$('vol').classList.contains('gv-open')) { clearInterval(volTimer); volTimer = null; return; }\n  if (!volDragging) ctx._post('bgmQuery');\n}\nctx.on('bgmState', function (st) {\n  st = st || {};\n  var r = $('volPos'); if (!r) return;\n  var dur = Number(st.dur) || 0, t = Number(st.t) || 0;\n  if (dur > 0) r.value = String(Math.round(t / dur * 1000));\n  var pc = $('volPosPc'); if (pc) pc.textContent = fmtT(t) + ' / ' + fmtT(dur);\n  r.disabled = !dur;\n});\n$('volPos').addEventListener('pointerdown', function () { volDragging = true; });\n$('volPos').addEventListener('pointerup', function () { volDragging = false; });\n$('volPos').addEventListener('input', function (e) {\n  e.stopPropagation();\n  ctx._post('bgmSeekPct', Number(this.value) / 1000);\n});\n$('volReplay').addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmReplay'); });\n/*gv-pause*/\n/* ---- 暂停 / 继续: 音频在宿主那边放, 所以点一下发条消息让它停 / 接着放 ----\n   按钮用 JS 造 (不依赖 HTML), 老模板补丁也能把这一整块追加进去 */\ntry {\n  var _vp = $('volPause');\n  if (!_vp) {\n    _vp = document.createElement('span');\n    _vp.id = 'volPause'; _vp.className = 'gv-vol-btn'; _vp.textContent = '暂停';\n    _vp.title = '暂停 / 接着放 BGM';\n    var _vpRow = $('volReplay') ? $('volReplay').parentNode : null;\n    if (_vpRow) _vpRow.appendChild(_vp);\n  }\n  /* ★ 老快照可能被补过不止一份 -> 装过的就别再装一遍 (两份监听 = 点一下发两条 = 停了又接着放) */\n  if (!_vp.__gvPauseOn) {\n    _vp.__gvPauseOn = 1;\n    _vp.addEventListener('click', function (e) { e.stopPropagation(); ctx._post('bgmPause'); });\n  }\n  if (!ctx.__gvPauseLabel) {\n    ctx.__gvPauseLabel = 1;\n    ctx.on('bgmState', function (st) {\n      try { var b = $('volPause'); if (b && st && typeof st.paused === 'boolean') b.textContent = st.paused ? '继续' : '暂停'; } catch (e) {}\n    });\n  }\n} catch (e) {}\n/*/gv-pause*/\n/* ★ 面板右上角的关闭按钮 (用 JS 造, 老模板也能自动拿到, 不会重复插一份面板) */\ntry {\n  var _vbox = $('vol');\n  if (_vbox && !$('volX')) {\n    var _vx = document.createElement('span');\n    _vx.id = 'volX'; _vx.className = 'gv-vol-x'; _vx.textContent = '×'; _vx.title = '关闭音量面板';\n    _vx.addEventListener('click', function (e) {\n      e.stopPropagation();\n      $('vol').classList.remove('gv-open');\n      if (volTimer) { clearInterval(volTimer); volTimer = null; }\n    });\n    _vbox.appendChild(_vx);\n  }\n} catch (e) {}\n$('volBgm').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number(this.value) / 100, se: Number($('volSe').value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('volSe').addEventListener('input', function(e){ e.stopPropagation(); volLabel();\n  var v = { bgm: Number($('volBgm').value) / 100, se: Number(this.value) / 100 };\n  ctx.volume = v; if (bgmEl) bgmEl.volume = v.bgm; if (seEl) seEl.volume = v.se;\n  ctx._post('volume', v); });\n$('vol').addEventListener('click', function(e){ e.stopPropagation(); });\n\n/*/gv-audio*/\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  /*gv-audio*/ try { var b0 = (ctx.bgmAt || [])[0]; if (b0) playBgm(b0.name); else ctx._post('bgm', ''); } catch (e) {} /*/gv-audio*/\n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });"
 },
 "charNoAudio": {
  "html": "<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        \n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    \n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>",
  "css": "/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n",
  "js": "/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 400;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  \n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });"
 },
 "charLandNoAudio": {
  "html": "<!-- 卡里那套楼层界面 (引擎 create() 的原样移植) -->\n<div class=\"gv-root gv-inline\">\n  <div class=\"gv-phone\" id=\"phone\">\n    <div class=\"gv-bgs\"><div class=\"gv-bg\" id=\"bgA\"></div><div class=\"gv-bg\" id=\"bgB\"></div></div>\n    <div class=\"gv-vignette\"></div>\n    <div class=\"gv-dim\" id=\"dim\"></div>\n    <div class=\"gv-flash\" id=\"flash\"></div>\n    <div class=\"gv-stage\" id=\"stage\"></div>\n    <div class=\"gv-ui\">\n      <div class=\"gv-box\" id=\"box\">\n        <img class=\"gv-uava\" id=\"uava\" alt=\"\">\n        <div class=\"gv-name\" id=\"name\"></div>\n        <p class=\"gv-text\" id=\"text\"><span class=\"gv-caret\" id=\"caret\"></span></p>\n        <div class=\"gv-next\" id=\"next\">▼</div>\n      </div>\n      <div class=\"gv-hud\">\n        <div class=\"gv-dots\" id=\"dots\"></div>\n        <div class=\"gv-btns\"><div class=\"gv-btn\" id=\"auto\">自动</div><div class=\"gv-btn\" id=\"replay\">重播</div></div>\n      </div>\n    </div>\n    <div class=\"gv-sticker\" id=\"sticker\"><img id=\"stickerImg\" alt=\"\"></div>\n    <div class=\"gv-toolbar\">\n      <span class=\"gv-tb gv-big\" id=\"btnEdit\" title=\"操作菜单\">编辑</span>\n      <div class=\"gv-popup\" id=\"popup\">\n        <span class=\"gv-tb gv-primary\" data-a=\"edit\" title=\"编辑这一楼的原文\">编辑</span>\n        <span class=\"gv-tb\" data-a=\"copy\" title=\"复制这一楼内容\">复制</span>\n        <span class=\"gv-tb\" data-a=\"up\" title=\"楼层上移\">上移楼层</span>\n        <span class=\"gv-tb\" data-a=\"down\" title=\"楼层下移\">下移楼层</span>\n        <span class=\"gv-tb gv-toggle\" data-a=\"toggle-user-avatar\" id=\"btnUa\" title=\"对话轮到TA说话时显示TA的头像\">显示头像</span>\n        \n        <span class=\"gv-tb gv-danger\" data-a=\"delete\" title=\"删除这一楼\">删除楼层</span>\n      </div>\n    </div>\n    \n    <div class=\"gv-editor\" id=\"editor\">\n      <textarea class=\"gv-editor-ta\" id=\"ta\"></textarea>\n      <div class=\"gv-editor-btns\">\n        <span class=\"gv-tb gv-primary\" id=\"bSave\">确认修改</span>\n        <span class=\"gv-tb\" id=\"bCancel\">退出修改</span>\n      </div>\n    </div>\n  </div>\n</div>",
  "css": "/* ============================================================\n   酒馆 Galgame 楼层界面 — 样式\n   全部类名以 gv- 前缀隔离\n   ============================================================ */\n.gv-root, .gv-root * { box-sizing: border-box; }\n.gv-root {\n  --gv-accent: #ff8fb1;\n  --gv-panel: rgba(16, 18, 28, 0.82);\n  --gv-text: #f2f3f7;\n  display: flex; justify-content: center;\n  margin: 0;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans SC\", system-ui, sans-serif;\n  -webkit-tap-highlight-color: transparent;\n  user-select: none;\n}\n\n/* ---------- 手机外框 ---------- */\n.gv-phone {\n  position: relative;\n  width: min(100%, 400px);\n  aspect-ratio: 9 / 19.5;\n  max-height: 86vh;\n  border-radius: 26px; overflow: hidden;\n  background: #05060a;\n  box-shadow: 0 10px 34px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.10) inset;\n  isolation: isolate; cursor: pointer;\n}\n/* 顶部那个\"灵动岛\"黑药丸已去掉 */\n\n/* ---------- 背景 ---------- */\n.gv-bgs { position: absolute; inset: 0; z-index: 1; }\n.gv-bg {\n  position: absolute; inset: 0; background-size: cover; background-position: center;\n  opacity: 0; transition: opacity .7s ease; transform: scale(1.04);\n}\n.gv-bg.gv-on { opacity: 1; }\n.gv-vignette {\n  position: absolute; inset: 0; z-index: 2; pointer-events: none;\n  background:\n    radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%),\n    linear-gradient(to bottom, rgba(0,0,0,.18) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.55) 100%);\n}\n.gv-dim { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: #000; opacity: 0; transition: opacity .45s ease; }\n.gv-dim.gv-on { opacity: .62; }\n.gv-flash { position: absolute; inset: 0; z-index: 30; pointer-events: none; background: #fff; opacity: 0; }\n.gv-flash.gv-go { animation: gv-flash .5s ease; }\n@keyframes gv-flash { 0%{opacity:.9} 100%{opacity:0} }\n\n/* ---------- 立绘 ---------- */\n/* ---------- 立绘: 一个站位一张, 支持多角色同框 ---------- */\n.gv-stage { position: absolute; inset: 0; z-index: 4; pointer-events: none; }\n.gv-sprite {\n  position: absolute; left: var(--gv-x, 50%);\n  bottom: calc((100 - var(--gv-y, 100)) * 1%);\n  width: var(--gv-w, 100%); height: var(--gv-h, 100%);\n  transform: translateX(-50%) scale(var(--gv-s, 1));\n  transform-origin: 50% 100%; transition: filter .35s ease, opacity .35s ease;\n  display: flex; align-items: flex-end; justify-content: center;   /* 图比框宽时也要居中, 不能偏到一边 */\n}\n.gv-sprite img {\n  height: 100%; width: auto; max-width: none; display: block;\n  object-fit: contain; object-position: bottom center;\n  filter: saturate(1.04) contrast(1.02);\n}\n/* 多角色同框: 不是当前说话者的那张淡下去 */\n.gv-sprite.gv-idle { opacity: .55; filter: brightness(.8) saturate(.85); }\n/* ★ 演出动画必须在每一帧都带上 translateX(-50%) + scale(var(--gv-s)),\n   否则动画会覆盖掉立绘的定位 transform —— 立绘就会\"闪到天边去\" */\n.gv-sprite.gv-shake { animation: gv-shake .45s ease; }\n@keyframes gv-shake {\n  0%,100%{transform:translateX(-50%) translateX(0) scale(var(--gv-s,1))}\n  20%{transform:translateX(-50%) translateX(-4px) scale(var(--gv-s,1))}\n  45%{transform:translateX(-50%) translateX(4px)  scale(var(--gv-s,1))}\n  70%{transform:translateX(-50%) translateX(-2px) scale(var(--gv-s,1))}\n}\n.gv-sprite.gv-jump { animation: gv-jump .5s ease; }\n@keyframes gv-jump {\n  0%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  35%{transform:translateX(-50%) translateY(-10px) scale(var(--gv-s,1))}\n  65%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n  82%{transform:translateX(-50%) translateY(-4px) scale(var(--gv-s,1))}\n  100%{transform:translateX(-50%) translateY(0) scale(var(--gv-s,1))}\n}\n/* 呼吸式缩放: 放大一点点 -> 缩小一点点 -> 回位 (幅度很小, 不闪不飞) */\n.gv-sprite.gv-zoom { animation: gv-zoom .9s ease-in-out; }\n@keyframes gv-zoom {\n  0%   { transform: translateX(-50%) scale(var(--gv-s,1)); }\n  30%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 1.045)); }\n  60%  { transform: translateX(-50%) scale(calc(var(--gv-s,1) * 0.985)); }\n  100% { transform: translateX(-50%) scale(var(--gv-s,1)); }\n}\n.gv-sprite.gv-dim { filter: brightness(.45) saturate(.6); }\n.gv-bubble {\n  position: absolute; top: 6%; right: 6%; z-index: 8; font-size: 30px; line-height: 1;\n  animation: gv-bubble 1.5s ease forwards; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));\n}\n@keyframes gv-bubble {\n  0%{opacity:0; transform: translateY(14px) scale(.5)}\n  25%{opacity:1; transform: translateY(0) scale(1.15)}\n  40%{transform: translateY(0) scale(1)}\n  80%{opacity:1} 100%{opacity:0; transform: translateY(-16px) scale(1)}\n}\n\n/* ---------- 对话框 ---------- */\n.gv-ui { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; padding: 0 8px 8px; }\n.gv-box {\n  position: relative; min-height: 30%; border-radius: 16px;\n  background: var(--gv-panel);\n  backdrop-filter: blur(9px) saturate(1.2); -webkit-backdrop-filter: blur(9px) saturate(1.2);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 -4px 24px rgba(0,0,0,.4);\n  padding: 16px 15px 18px;\n}\n.gv-box.gv-has-uava { padding-left: 15px; }   /* 头像在右上角, 不再挤占文字 */\n.gv-uava {\n  position: absolute; top: -13px; right: 12px; left: auto; bottom: auto;\n  width: 42px; height: 42px; border-radius: 11px; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.32); box-shadow: 0 3px 12px rgba(0,0,0,.5);\n  background: #222;\n}\n.gv-name {\n  position: absolute; top: -13px; left: 14px;\n  padding: 3px 14px; border-radius: 999px;\n  font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #10121a;\n  background: linear-gradient(135deg, #fff, var(--gv-accent));\n  box-shadow: 0 3px 10px rgba(0,0,0,.35);\n  white-space: nowrap; max-width: 70%; overflow: hidden; text-overflow: ellipsis;\n}\n.gv-name.gv-narr { background: linear-gradient(135deg,#dfe3ee,#8e97ad); }\n.gv-name.gv-user { background: linear-gradient(135deg,#fff,#7fd1ff); }\n.gv-text {\n  margin: 6px 0 0; color: var(--gv-text);\n  font-size: 16px; line-height: 1.72; letter-spacing: .3px;\n  min-height: 4.5em; white-space: pre-wrap; word-break: break-word;\n  text-shadow: 0 1px 3px rgba(0,0,0,.6);\n}\n.gv-text.gv-narr { font-style: italic; color: #c9ccdb; }\n.gv-caret {\n  display: inline-block; width: .55em; height: 1em; vertical-align: -2px;\n  background: var(--gv-accent); opacity: 0; margin-left: 2px;\n  animation: gv-caret 1s steps(1) infinite;\n}\n.gv-caret.gv-on { opacity: .9; }\n@keyframes gv-caret { 50% { opacity: 0 } }\n\n.gv-hud { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 2px; color: rgba(255,255,255,.72); font-size: 12px; }\n.gv-dots { display: flex; gap: 4px; align-items: center; }\n.gv-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.28); }\n.gv-dot.gv-on { background: var(--gv-accent); transform: scale(1.5); }\n.gv-btns { display: flex; gap: 6px; }\n.gv-btn {\n  cursor: pointer; padding: 3px 10px; border-radius: 999px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  color: rgba(255,255,255,.85); font-size: 11px; transition: background .2s, transform .1s;\n}\n.gv-btn:hover { background: rgba(255,255,255,.2); }\n.gv-btn:active { transform: scale(.94); }\n.gv-btn.gv-active { background: var(--gv-accent); color: #10121a; font-weight: 700; }\n.gv-next {\n  position: absolute; right: 14px; bottom: 8px; color: var(--gv-accent);\n  font-size: 13px; animation: gv-bob 1.1s ease-in-out infinite;\n}\n@keyframes gv-bob { 0%,100%{transform:translateY(0); opacity:.5} 50%{transform:translateY(4px); opacity:1} }\n\n/* 隐藏酒馆原生楼层正文 */\n.gv-hide { display: none !important; }\n.gv-floor-host { margin: 0; position: relative; }\n\n/* ============================================================\n   整层替换模式\n   ============================================================ */\n#chat > .mes.gv-full {\n  display: block !important;\n  width: 100% !important; max-width: 100% !important; min-width: 0 !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; border-radius: 0 !important;\n  background: transparent !important; background-image: none !important;\n  box-shadow: none !important; backdrop-filter: none !important;\n  /* #chat 是 flex column, 必须禁止收缩, 否则楼层会被压扁、内容溢出重叠 */\n  flex: 0 0 auto !important;\n  height: auto !important; min-height: auto !important; max-height: none !important;\n}\n#chat > .mes.gv-full { position: relative !important; }\n/* 头像 / 滑动箭头等藏掉, 但\"多选删除框\"必须留着 */\n#chat > .mes.gv-full > *:not(.mes_block):not(.for_checkbox) { display: none !important; }\n#chat > .mes.gv-full > .for_checkbox {\n  display: flex !important; align-items: center;\n  position: absolute !important; left: 4px; top: 6px; z-index: 80;\n  margin: 0 !important; padding: 2px 4px !important;\n  background: rgba(10,12,18,.55); border-radius: 8px;\n  opacity: .18; transition: opacity .18s;\n}\n#chat > .mes.gv-full > .for_checkbox:hover { opacity: 1; }\n#chat > .mes.gv-full > .for_checkbox .del_checkbox { display: inline-block !important; cursor: pointer; }\n#chat > .mes.gv-full > .mes_block {\n  display: block !important; position: relative !important;\n  width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important;\n  border: 0 !important; background: transparent !important; box-shadow: none !important;\n  overflow: visible !important;\n}\n/* 原生正文 / 思维链 藏掉, 但 .ch_name 要留着装原生按钮 */\n#chat > .mes.gv-full > .mes_block > *:not(.gv-floor-host):not(.ch_name) { display: none !important; }\n#chat > .mes.gv-full > .mes_block > .gv-floor-host { display: block !important; width: 100% !important; }\n\n/* 酒馆原生按钮条整个不要了 —— 用我们自己的 .gv-toolbar */\n#chat > .mes.gv-full > .mes_block > .ch_name { display: none !important; }\n\n/* ============================================================\n   自建工具条 (重复造轮子, 完全不依赖酒馆原生按钮)\n   ============================================================ */\n.gv-toolbar {\n  position: absolute; top: 0; right: 10px; z-index: 72;\n  display: flex; align-items: center; gap: 4px; padding: 3px 6px;\n  background: rgba(10,12,18,.62);\n  border: 1px solid rgba(255,255,255,.14); border-top: 0;\n  border-radius: 0 0 12px 12px;\n  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);\n  opacity: .16; transition: opacity .18s;\n}\n.gv-phone:hover .gv-toolbar, .gv-toolbar:hover, .gv-toolbar.gv-expanded { opacity: 1; }\n.gv-toolbar-actions { display: none; gap: 4px; align-items: center; }\n.gv-toolbar.gv-expanded .gv-toolbar-actions { display: flex; }\n.gv-tb.gv-big { padding: 3px 16px; font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.92); border-color: rgba(255,255,255,.55); color: #1a1d29;   /* 初始就是浅色/白色的那个「编辑」 */\n  box-shadow: 0 2px 8px rgba(0,0,0,.28); }\n.gv-tb.gv-big:hover { background: #fff; color: #10121a; }\n.gv-tb.gv-big.gv-open { background: #ff8fb1; color: #10121a; }\n.gv-tb.gv-toggle.gv-on { background: #7fd1ff; color: #10121a; font-weight: 700; }\n.gv-tb {\n  cursor: pointer; padding: 1px 9px; border-radius: 6px; font-size: 11.5px;\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.14);\n  color: rgba(255,255,255,.9); white-space: nowrap; transition: background .15s;\n}\n.gv-tb:hover { background: rgba(255,255,255,.26); }\n.gv-tb.gv-sq { padding: 1px 7px; }\n.gv-tb.gv-danger:hover { background: rgba(255,90,90,.9); color: #fff; }\n.gv-tb.gv-primary { background: #ff8fb1; color: #10121a; font-weight: 700; }\n\n/* 自建编辑器 */\n.gv-editor {\n  position: absolute; inset: 0; z-index: 90; display: none;\n  flex-direction: column; gap: 8px; padding: 14px;\n  background: rgba(8,10,16,.95);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n.gv-editor.gv-open { display: flex; }\n.gv-editor-ta {\n  flex: 1; width: 100%; resize: none; border-radius: 10px; padding: 10px;\n  background: rgba(255,255,255,.06); color: #e6e9f2;\n  font-size: 12.5px; line-height: 1.6; font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-editor-btns { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* 玩家输入楼层: 黑色一行 + 向下展开的半透明区 (不再往右撑) */\n.gv-userbar-wrap { display: block; }\n.gv-userbar {\n  max-width: min(100%, 400px); margin: 0 auto;\n  border-radius: 16px; overflow: hidden;\n  background: rgba(18,20,30,.82);\n  border: 1px solid rgba(255,255,255,.14);\n  box-shadow: 0 3px 12px rgba(0,0,0,.35);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n  color: #e6e9f2; font-size: 13.5px; line-height: 1.55;\n  font-family: \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;\n  user-select: none;\n}\n.gv-ubar-main { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }\n.gv-userbar .gv-uava {\n  position: static; top: auto; right: auto; left: auto; bottom: auto;   /* 玩家楼层: 头像回到黑条里, 原来的位置 */\n  width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto; object-fit: cover;\n  border: 1px solid rgba(255,255,255,.28); box-shadow: 0 2px 8px rgba(0,0,0,.4);\n}\n.gv-userbar .gv-utext { flex: 1; min-width: 0; text-align: left; white-space: pre-wrap; word-break: break-word; color: #eef1f8; }\n.gv-userbar .gv-utext b { color: #7fd1ff; font-weight: 700; margin-right: 8px; }\n.gv-ubar-btn {\n  cursor: pointer; flex: 0 0 auto; padding: 4px 13px; border-radius: 999px;\n  font-size: 12.5px; font-weight: 600;\n  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);\n  color: rgba(255,255,255,.9);\n}\n.gv-ubar-btn:hover { background: rgba(255,255,255,.26); }\n.gv-ubar-extra {\n  display: none; padding: 9px 12px 11px;\n  background: rgba(255,255,255,.05);\n  border-top: 1px solid rgba(255,255,255,.09);\n}\n.gv-userbar-wrap.gv-open .gv-ubar-extra { display: block; }\n.gv-ubar-actions { display: flex; flex-wrap: wrap; gap: 5px; }\n.gv-ubar-editor { display: none; flex-direction: column; gap: 6px; margin-top: 9px; }\n.gv-ubar-editor.gv-open { display: flex; }\n.gv-ubar-editor textarea {\n  width: 100%; min-height: 96px; resize: vertical; border-radius: 10px; padding: 9px;\n  background: rgba(255,255,255,.06); color: #e6e9f2; font-size: 12.5px; line-height: 1.6;\n  font-family: ui-monospace, \"Cascadia Code\", monospace;\n  border: 1px solid rgba(255,255,255,.18); outline: none;\n}\n.gv-ubar-editor .row { display: flex; gap: 8px; justify-content: flex-end; }\n\n/* AI 楼层: 编辑按钮下方弹出的气泡菜单 (在手机框里面) */\n.gv-popup {\n  display: none; position: absolute; top: calc(100% + 6px); right: 0;\n  flex-direction: column; gap: 4px; padding: 7px; min-width: 106px;\n  background: rgba(10,12,18,.94);\n  border: 1px solid rgba(255,255,255,.18);\n  border-radius: 11px; box-shadow: 0 10px 26px rgba(0,0,0,.6);\n  backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);\n}\n.gv-popup.gv-open { display: flex; }\n.gv-popup::before {\n  content: \"\"; position: absolute; top: -6px; right: 16px;\n  border: 6px solid transparent; border-top: 0;\n  border-bottom-color: rgba(10,12,18,.94);\n}\n.gv-popup .gv-tb { display: block; text-align: center; padding: 5px 12px; font-size: 12px; }\n/* ---------- 情绪气泡贴纸 ---------- */\n.gv-sticker { position: absolute; left: var(--gv-bx, 78%); top: var(--gv-by, 24%); width: 30%;\n  transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%;\n  z-index: 20; opacity: 0; pointer-events: none; }\n.gv-sticker img { width: 100%; display: block; }\n.gv-sticker.gv-on { opacity: 1; }\n@keyframes gv-b-pop {\n  0% { transform: translate(-50%,-50%) scale(0); }\n  60% { transform: translate(-50%,-50%) scale(calc(var(--gv-bs,1) * 1.25)); }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); } }\n@keyframes gv-b-left {\n  0% { transform: translate(calc(-50% - 90px),-50%) scale(var(--gv-bs,1)); opacity: 0; }\n  70% { transform: translate(calc(-50% + 8px),-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-diag {\n  0% { transform: translate(calc(-50% + 70px), calc(-50% + 70px)) scale(calc(var(--gv-bs,1) * .6)); opacity: 0; }\n  70% { transform: translate(calc(-50% - 6px), calc(-50% - 6px)) scale(calc(var(--gv-bs,1) * 1.06)); opacity: 1; }\n  100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; } }\n@keyframes gv-b-blink {\n  0%,100% { transform: translate(-50%,-50%) scale(var(--gv-bs,1)); opacity: 1; }\n  15%,45% { opacity: .15; }\n  30%,60% { opacity: 1; } }\n.gv-sticker.gv-b-pop { animation: gv-b-pop .5s cubic-bezier(.2,1.5,.4,1) forwards; }\n.gv-sticker.gv-b-left { animation: gv-b-left .5s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-diag { animation: gv-b-diag .55s cubic-bezier(.2,1.2,.4,1) forwards; }\n.gv-sticker.gv-b-blink { animation: gv-b-blink .9s ease forwards; }\n.gv-sticker.gv-b-none { opacity: 1; }\n\n/* ---- 模板里的提示条 (预览演示用) ---- */\n.gv-tpl-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;\n  background:rgba(20,22,32,.92);color:#eef1f8;border:1px solid rgba(255,255,255,.2);\n  padding:5px 14px;border-radius:999px;font-size:12px;white-space:nowrap;animation:gv-toast-in .18s ease;}\n@keyframes gv-toast-in{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1}}\n.gv-sheet-toast.bad{background:rgba(255,90,90,.95);color:#fff;}\n\n/* ---- User 楼层那一支也要 border-box, 否则编辑框 width:100% + padding 会超出容器右侧被裁 ---- */\n.gv-userbar-wrap, .gv-userbar-wrap * { box-sizing: border-box; }\n\n/* ---- 模板版微调: iframe 里由内容决定高度 ---- */\n.gv-root { align-items: flex-start; }\n.gv-phone { max-height: none; }\n\n/* ---- 自适应缩放: 容器比设计宽度窄时, JS 会设 --gv-scale, 整块按比例缩小 ---- */\n.gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; }\n/* ★ 整页不许出原生滚动条 (楼层 iframe 右边缘那条丑的谷歌滚动条就是它) */\nhtml, body { overflow: hidden !important; overflow-x: hidden; scrollbar-width: none; }\nhtml::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }\n\n/* ============================================================\n   横版覆盖（版式 = 横版 · 设计宽 640 · 640×360）\n   这一份是【追加在竖版 CSS 后面】的覆盖层：\n   手机框比例、立绘高度、对话框、音量面板、贴纸大小 换成横屏那种galgame 布局，\n   其余（背景铺满、演出动画、编辑器、气泡、HUD）沿用竖版那一套。\n   ============================================================ */\n.gv-phone {\n  width: min(100%, 640px);\n  aspect-ratio: 16 / 9;\n  max-height: none;\n  border-radius: 14px;\n}\n/* 立绘: 横屏时别顶到顶, 留一点天花板 (画了占位框的话, 以框的高度为准) */\n.gv-sprite { height: var(--gv-h, 94%); }\n/* 对话框: 横屏做成\"底部一条\" —— 别占满整屏, 文字也小一号 */\n.gv-ui { padding: 0 12px 10px; }\n.gv-box { min-height: 0; border-radius: 12px; padding: 12px 14px 13px; }\n.gv-text { font-size: 14.5px; line-height: 1.62; min-height: 3em; }\n.gv-name { font-size: 13px; top: -12px; padding: 3px 12px; }\n.gv-uava { width: 36px; height: 36px; top: -11px; border-radius: 10px; }\n",
  "js": "/* ============================================================\n   卡里那套楼层界面 —— 引擎 create() 的模板版\n   数据从 ctx 拿 (和引擎喂给 create() 的 data 一样), 按钮走 ctx._post\n   ============================================================ */\nvar TYPESPEED = 28, AUTODELAY = 1600, BUBBLEMS = 1900;\nvar timers = [], destroyed = false;\nvar idx = -1, typing = false, typeTimer = null, autoOn = false, autoTimer = null, curBg = null, N = 0;\nvar slotKeys = [], sprites = {}, activeSprite = null;\nvar curSlot = '';            /* ★ 当前这一行的站位: 气泡按站位选落点 */\n\nfunction $(id){ return document.getElementById(id); }\nfunction el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }\nfunction hash(s){ var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }\nfunction normEntry(v){ return v == null ? null : (typeof v === 'string' ? { url: v } : v); }\n/* 图片按原始比例铺满一个框 (等价 cover, 但元素保持图片比例 -> 缩小能露两边) */\nfunction coverBox(imgEl, bw, bh){\n  var nw = imgEl.naturalWidth || 0, nh = imgEl.naturalHeight || 0;\n  if (!nw || !nh || !bw || !bh) return;\n  var ar = nw / nh, bar = bw / bh, w, h;\n  if (ar > bar) { h = bh; w = Math.round(bh * ar); } else { w = bw; h = Math.round(bw / ar); }\n  imgEl.style.width = w + 'px'; imgEl.style.height = h + 'px';\n}\n\nvar FX = {\n  none: '', '': '', in: 'gv-enter', 淡入: 'gv-enter',\n  shake: 'gv-shake', 抖动: 'gv-shake', 震: 'gv-shake',\n  jump: 'gv-jump', 弹跳: 'gv-jump', 跳: 'gv-jump', bounce: 'gv-jump',\n  zoom: 'gv-zoom', 放大: 'gv-zoom', 拉近: 'gv-zoom',\n  dim: 'gv-dim', 变暗: 'gv-dim', 暗: 'gv-dim',\n  bubble: 'gv-bubble', 气泡: 'gv-bubble', 惊愕: 'gv-bubble',\n  flash: 'gv-flash', 闪白: 'gv-flash', 闪光: 'gv-flash',\n};\n\n/* ---- 素材查找: 和引擎同一套规则 (精确 -> 模糊; 对不上就【不显示】并提示一次) ---- */\nfunction _bare(s){ return String(s==null?'':s).trim().toLowerCase().replace(/\\.(png|jpe?g|webp|gif|bmp|avif)$/,''); }\n/* ★ 宿主有时只传\"用得到的那几张\", 表可能是空的 —— 空表时退回宿主传的完整表 (ctx.bgMap/ctx.faceMap),\n   否则名字再对也查不到, 直接显示空背景 */\nfunction _bgT(){ try { var a = ctx.backgrounds || {}, b = ctx.bgMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\nfunction _fcT(){ try { var a = ctx.faces || {}, b = ctx.faceMap || {}; return Object.keys(a).length ? a : (Object.keys(b).length ? b : a); } catch (e) { return {}; } }\n/* ★ 以前对不上名字会 hash 兜底\"随便挑一张\": 结果是不管消息里写什么背景/表情, 永远显示同一张,\n   用户完全看不出是\"名字对不上\"。现在不挑, 只提示一次: 消息里的名字 + 方案里现有的名字。 */\nvar _missWarned = {};\nfunction warnMissing(kind, name, table){\n  var ks = [], k;\n  for (k in (table || {})) ks.push(k);\n  if (!ks.length) return;\n  if (_missWarned[kind + '|' + name]) return;\n  _missWarned[kind + '|' + name] = 1;\n  var msg = kind + '「' + name + '」脚本自带素材里没有（现有：' + ks.slice(0, 8).join(' / ') + (ks.length > 8 ? ' …' : '') + '）';\n  try { console.warn('[gv] ' + msg); } catch (e) {}\n  try { ctx._post('missingAsset', { kind: kind, name: String(name), have: ks.slice(0, 12) }); } catch (e) {}\n}\nfunction resolveBg(key){\n  var m = _bgT(), k, pat;\n  if (!key) return null;\n  k = _bare(key);\n  /* ★ 去扩展名 + 互相包含: 包里叫\"主殿.png\"、剧本写\"主殿\" 也要能对上 */\n  for (pat in m) { var pb = _bare(pat); if (pb && (k.indexOf(pb) >= 0 || pb.indexOf(k) >= 0)) return normEntry(m[pat]); }\n  warnMissing('背景', key, m);\n  return null;\n}\nfunction facePool(){ var m = _fcT(), out = [], k; for (k in m) out.push(normEntry(m[k]).url); return out; }\nfunction resolveFace(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact).url; }\n  for (pat in m) { if (pat.indexOf('|') >= 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]).url; }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\nfunction resolveFaceEntry(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (k) { var exact = m[nm + '|' + k] || m[k]; if (exact) return normEntry(exact); }\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) continue; if (k && k.indexOf(pat.toLowerCase()) >= 0) return normEntry(m[pat]); }\n  /* ★ 表情对不上时优先拿这个角色自己的脸 (和引擎一致), 再兜全局池 */\n  if (nm) for (pat in m) { i = pat.indexOf('|'); if (i > 0 && pat.slice(0, i) === nm) return normEntry(m[pat]); }\n  warnMissing('立绘', (nm ? nm + '·' : '') + (key || '?'), m);\n  return null;\n}\n/* ★ 这个名字有没有立绘 —— 没有 = 路人, 和旁白同一套处理 (引擎里同名函数) */\nfunction hasFaceFor(key, name){\n  var m = _fcT(), k = String(key || '').trim().toLowerCase(), nm = String(name || '').trim(), pat, i;\n  if (!nm) return false;\n  if (k && (m[nm + '|' + k] || m[k])) return true;\n  for (pat in m) { i = pat.indexOf('|'); if (i > 0) { if (pat.slice(0, i) === nm) return true; continue; } if (k && k.indexOf(pat.toLowerCase()) >= 0) return true; }\n  return false;\n}\nfunction resolveAccent(name){\n  var pool = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];\n  return pool[hash(String(name)) % pool.length];\n}\n\n\ntry { if (ctx.frameSize && ctx.frameSize.w && ctx.frameSize.h) phone.style.aspectRatio = String(ctx.frameSize.w / ctx.frameSize.h); } catch (e) {}\nvar caret = $('caret'), nextEl = $('next'), boxEl = $('box'), uava = $('uava'), autoBtn = $('auto'), replayBtn = $('replay');\nvar bgA = $('bgA'), bgB = $('bgB'), editor = $('editor'), ta = $('ta'), popup = $('popup'), btnEdit = $('btnEdit'), btnUa = $('btnUa');\n/* ★ 这四个以前也没有定义 (phone / stage / nameEl / textEl) -> 用到处就 ReferenceError,\n    整层渲染不出来, 连自适应里那句 phone.style.width 都被 try 吞掉 (所以模板自己的缩放一直没生效) */\nvar phone = $('phone'), stage = $('stage'), nameEl = $('name'), textEl = $('text');\n/* ★ dotsBox 以前只有用处没有定义 -> 模板一跑就 ReferenceError: dotsBox is not defined, 整层都渲染不出来 */\nvar dotsBox = $('dots');\n\n/* ---- 立绘: 一个站位一个 sprite ---- */\nfunction mkSprite(key){\n  var s = el('div', 'gv-sprite'), im = el('img');\n  im.addEventListener('error', function(){ im.style.display = 'none'; });\n  im.addEventListener('load', function(){ im.style.display = ''; });\n  s.appendChild(im);\n  /* ★ 单人(站位 ≤1): 站位/slotPos/占位框一概不参与, 一律居中 —— 剧本里残留的 |left 不能把立绘拖到左边 */\n  var single = slotKeys.length <= 1;\n  var i = single ? 0 : slotKeys.indexOf(key);\n  var pos = single ? null : ((ctx.slotPos || {})[key] || null);   // ★ 单人连 slotPos 都不看\n  var x = pos && typeof pos.x === 'number' ? pos.x : (single || i < 0 ? 50 : Math.round(20 + i / (slotKeys.length - 1) * 60));\n  var y = pos && typeof pos.y === 'number' ? pos.y : 100;\n  var sc = pos && pos.scale ? pos.scale : 1;\n  /* ★ 占位排版: 这一格画了框就按框站 (和引擎同一套算法); 单人不用框 */\n  var box = single ? null : ((ctx.slotBoxes || {})[key] || null);\n  var hasBox = !!(box && Number(box.w) > 0 && Number(box.h) > 0);\n  if (hasBox) { x = Number(box.x) + Number(box.w) / 2; y = Number(box.y) + Number(box.h); }\n  s.style.setProperty('--gv-x', x + '%');\n  s.style.setProperty('--gv-y', String(y));\n  s.style.setProperty('--gv-s', String(sc));\n  s.style.setProperty('--gv-w', hasBox ? (Number(box.w) + '%') : (slotKeys.length ? '74%' : '100%'));\n  s.style.setProperty('--gv-h', hasBox ? (Number(box.h) + '%') : '100%');\n  s.dataset.slot = key;\n  stage.appendChild(s);\n  sprites[key] = { el: s, img: im, key: key };\n  return sprites[key];\n}\nfunction spriteFor(key){ return sprites[key] || mkSprite(key); }\n\n/* ---- 背景: 没有图/加载失败都不报错, 退回中性渐变 ---- */\nvar BG_FALLBACK = 'none';   /* 没有背景素材就空着, 不再内置演示图 */\nvar bgTried = {}, bgNat = {};\n/* 背景层按图片比例铺满手机框 (和引擎一致): 缩小的时候两边能露出来 */\nfunction sizeBg(box2, nat){\n  var pw = phone.clientWidth || 0, ph = phone.clientHeight || 0;\n  if (!nat || !nat.w || !nat.h || !pw || !ph) return;\n  var ar = nat.w / nat.h, bar = pw / ph, w, h;\n  if (ar > bar) { h = ph; w = Math.round(ph * ar); } else { w = pw; h = Math.round(pw / ar); }\n  box2.style.left = '50%'; box2.style.top = '50%'; box2.style.right = 'auto'; box2.style.bottom = 'auto';\n  box2.style.width = w + 'px'; box2.style.height = h + 'px';\n  box2.style.marginLeft = Math.round(-w / 2) + 'px'; box2.style.marginTop = Math.round(-h / 2) + 'px';\n  box2.style.backgroundSize = '100% 100%';\n}\nfunction setBg(bg){\n  var url = bg && bg.url ? bg.url : '', fit = bg && bg.fit ? bg.fit : null;\n  if (url === curBg) return;\n  curBg = url;\n  var showEl = bgA.classList.contains('gv-on') ? bgB : bgA;\n  var hideEl = showEl === bgA ? bgB : bgA;\n  function paint(u){\n    if (u) { showEl.style.backgroundImage = 'url(\"' + u + '\")'; showEl.style.backgroundColor = ''; }\n    else if (ctx.bgBlack) { showEl.style.backgroundImage = 'none'; showEl.style.backgroundColor = '#000'; }   // 空方案: 纯黑\n    else { showEl.style.backgroundImage = BG_FALLBACK; showEl.style.backgroundColor = ''; }\n    showEl.style.backgroundPosition = '50% 50%';\n    showEl.style.backgroundSize = 'cover';\n    sizeBg(showEl, bgNat[u] || null);\n    showEl.style.transform = (u && fit) ? ('translate(' + (fit.x || 0) + '%, ' + (fit.y || 0) + '%) scale(' + (fit.scale || 1) + ')') : 'none';\n    showEl.classList.add('gv-on');\n    hideEl.classList.remove('gv-on');\n  }\n  if (!url) { paint(null); return; }\n  if (bgTried[url] === false) { paint(null); return; }\n  if (bgTried[url] === true) { paint(url); return; }\n  try {\n    var probe = new Image();\n    probe.onload = function(){ bgTried[url] = true; bgNat[url] = { w: probe.naturalWidth, h: probe.naturalHeight }; paint(url); };\n    probe.onerror = function(){ bgTried[url] = false; paint(null); };\n    probe.src = url;\n  } catch (e) { paint(null); }\n}\n\n/* ---- 情绪气泡贴纸 ---- */\nvar sticker = $('sticker'), stickerImg = $('stickerImg');\nfunction showSticker(name){\n  var map = ctx.bubbles || {}, url = map[name];\n  if (!url) { warnMissing('气泡', name, map); return; }   /* ★ 不再随便挑一个贴纸顶上 */\n  if (!url) return;\n  /* 落点优先级: 这张贴纸单独调的 > 这个站位单独调的 > 默认 */\n  var p = (ctx.bubblePosEach || {})[name]\n    || (curSlot && (ctx.bubblePosSlot || {})[curSlot])\n    || ctx.bubblePos || {};\n  stickerImg.src = url;\n  sticker.style.setProperty('--gv-bx', (p.x != null ? p.x : 78) + '%');\n  sticker.style.setProperty('--gv-by', (p.y != null ? p.y : 24) + '%');\n  sticker.style.setProperty('--gv-bs', String(p.scale || 1));\n  var anim = (ctx.bubbleAnim || {})[name] || 'pop';\n  sticker.className = 'gv-sticker';\n  void sticker.offsetWidth;\n  sticker.classList.add('gv-on', 'gv-b-' + anim);\n  timers.push(setTimeout(function(){ sticker.classList.remove('gv-on'); }, BUBBLEMS));\n}\n\nfunction applyFx(fx){\n  var key = String(fx || '').trim().toLowerCase();\n  if (!key) return;\n  var pieces = key.split(/[,，、+\\s]+/), i;\n  for (i = 0; i < pieces.length; i++) {\n    var piece = pieces[i];\n    if (!piece) continue;\n    if (piece.indexOf('bubble:') === 0 || piece.indexOf('气泡:') === 0) {\n      showSticker(piece.split(/[:：]/)[1] || '');\n      continue;\n    }\n    /* ★ 自定义演出组 (制作器「特殊演出 → B」): 引擎那条路读 CONFIG.effects, 模板这条路读 ctx.effects。\n       规则和引擎 applyFx 一模一样: 加类 -> 强制重排 -> duration 后移除; cls 缺省 = gv-fx-名字; js 走 new Function(el, ctx) */\n    var cust = (ctx.effects || {})[piece];\n    if (cust) {\n      var ct = cust.target === 'bg' ? (bgA.parentElement || bgA) : (cust.target === 'phone' ? phone : activeSprite.el);\n      var cc = cust.cls || ('gv-fx-' + piece);\n      ct.classList.remove(cc); void ct.offsetWidth; ct.classList.add(cc);\n      (function (elx) { timers.push(setTimeout(function () { elx.classList.remove(cc); }, cust.duration || 900)); })(ct);\n      if (cust.js) { try { (new Function('el', 'ctx', cust.js))(ct, { name: '', slot: '' }); } catch (e) {} }\n      continue;\n    }\n    var cls = FX[piece];\n  if (!cls) { var _al = (ctx.fxAliases || {})[piece]; if (_al) cls = _al; }   // 重命名过的内置演出\n    if (!cls) continue;\n    if (cls === 'gv-dim') { activeSprite.el.classList.add('gv-dim'); continue; }\n    if (cls === 'gv-bubble') {\n      var b = el('div', 'gv-bubble', ['💢', '💦', '❓', '❗', '✨', '💗'][hash(piece + idx) % 6]);\n      stage.appendChild(b);\n      timers.push(setTimeout(function(){ b.remove(); }, 1600));\n      continue;\n    }\n    if (cls === 'gv-flash') { $('flash').classList.remove('gv-go'); void $('flash').offsetWidth; $('flash').classList.add('gv-go'); continue; }\n    activeSprite.el.classList.remove(cls); void activeSprite.el.offsetWidth; activeSprite.el.classList.add(cls);\n    (function(elx){ timers.push(setTimeout(function(){ elx.classList.remove(cls); }, 900)); })(activeSprite.el);\n  }\n}\n\nfunction show(i){\n  if (destroyed || i < 0 || i >= N) return;\n  idx = i;\n  var L = ctx.lines || [], line = L[i];\n  var isNarr = !line.name || line.name === '旁白';\n  var uname = String(ctx.userName || '').trim();\n  var aliases = ctx.userAliases || [];\n  var lname = String(line.name == null ? '' : line.name).trim();\n  /* ★ 角色名优先: 人设名和角色名撞车时 (User 也叫「迎九」), 角色自己的台词不能被判成 User ——\n     否则这句不算角色说的, 立绘就不出来 (User 覆盖了 char)。{{user}} 写法不受影响 ✓ */\n  var cname = String(ctx.charName || '').trim();\n  var isCharLine = !!cname && lname === cname;\n  var isUser = !isNarr && !isCharLine && !hasFaceFor(line.face, line.name) && (!!uname || aliases.length > 0) &&\n    (lname === uname || aliases.indexOf(lname) >= 0 || lname.indexOf('{{user}}') >= 0 || lname.indexOf('{user}') >= 0);\n  /* ★ 路人 (名字在立绘表里根本没有) = 和旁白同一套处理: 名字照写, 样式/立绘跟旁白走 */\n  var isExtra = !isNarr && !isUser && !hasFaceFor(line.face, line.name);\n  var narrLike = isNarr || isExtra;\n  nameEl.textContent = isNarr ? '旁白' : (isUser ? (uname || line.name) : line.name);   // 我说的这句: 名字用当前人设名\n  nameEl.className = 'gv-name' + (narrLike ? ' gv-narr' : '') + (isUser ? ' gv-user' : '');\n  if (isUser && ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; boxEl.classList.add('gv-has-uava'); }\n  else { uava.style.display = 'none'; boxEl.classList.remove('gv-has-uava'); }\n  var rootEl = document.querySelector('.gv-root');\n  if (rootEl) rootEl.style.setProperty('--gv-accent', narrLike ? '#9aa3bb' : resolveAccent(line.name));\n  textEl.className = 'gv-text' + (narrLike ? ' gv-narr' : '');\n  nextEl.style.display = 'none';\n\n  /* 站位: 说话的那张亮, 其它淡下去 */\n  var sl = String(line.slot || '').trim().toLowerCase();\n  /* ★ 气泡按【用户自己写的】站位选落点: 预览里没写站位的行会被默认成第一个站位(为了立绘好看),\n     那种行按\"没站位\"算, 于是真机/预览的气泡落点一致 */\n  curSlot = (line.exp === false) ? '' : sl;\n  /* 旁白 / {{user}} 那一行 / 没匹配到立绘 -> 这行不该有立绘 (重播回第一行时不能还挂着上一个人的图) */\n  var fentry = (narrLike || isUser) ? null : resolveFaceEntry(line.face, line.name);   // ★ 路人也不配立绘\n  var spk = (fentry && fentry.url) ? spriteFor(sl) : null;\n  if (spk) {\n    activeSprite = spk;\n    if (spk.img.getAttribute('src') !== fentry.url) { spk.img.setAttribute('src', fentry.url); }   // 不做入场动画\n    /* 取景: 图片按原始比例铺满站位框 + 「立绘定位」的 translate/scale (和引擎一致) */\n    coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight);\n    if (!spk.img.__gvSized) { spk.img.__gvSized = true; spk.img.addEventListener('load', function(){ coverBox(spk.img, spk.el.clientWidth, spk.el.clientHeight); }); }\n    var ff = fentry.fit || null;\n    spk.img.style.transformOrigin = 'center center';\n    spk.img.style.transform = ff ? ('translate(' + (ff.x || 0) + '%, ' + (ff.y || 0) + '%) scale(' + (ff.scale || 1) + ')') : '';\n    spk.el.style.display = '';\n  }\n  for (var sk in sprites) {\n    var sp = sprites[sk];\n    /* 这一行没有立绘(旁白等): 台上现有立绘保持不变 —— 只有「重播」才清空 */\n    if (sk === '' && slotKeys.length && spk && spk.key !== '') { sp.el.style.display = 'none'; continue; }\n    sp.el.classList.toggle('gv-idle', !!spk && sp !== spk);\n    if (sp !== spk) sp.el.classList.remove('gv-dim', 'gv-bright');\n  }\n\n  /* 声音: 这一步该响的 BGM / 音效。\n     ★ 优先自己放 (预览里插件把音频转成 data: 传进来, 沙箱也能播);\n       拿不到 data: 再交给宿主 (真机上是引擎在放) */\n  /* ★ 「无音频」那套默认模板里 playBgm/playSe 的【定义】被剥掉了, 但这几行【调用点】在剥除范围外 ->\n     以前每次 show() 都抛 ReferenceError: playBgm is not defined, 打字 / 自动 / 重播全废。\n     加 typeof 守卫: 有音频时行为完全不变, 无音频时静默跳过 */\n  (ctx.bgmAt || []).forEach(function (ev) { if (ev.at === i && typeof playBgm === 'function') playBgm(ev.name); });\n  (ctx.seAt || []).forEach(function (ev) { if (ev.at === i && typeof playSe === 'function') playSe(ev.name); });\n  /* ★ 按行换背景: 消息里第 N 行写了【bg:xxx】, 演到第 N 行就切过去 (以前整楼只认第一条 bg) */\n  (ctx.bgAt || []).forEach(function (ev) { if (ev.at === i && ev.name) setBg(resolveBg(ev.name)); });\n  if (line.se && typeof playSe === 'function') playSe(line.se);\n\n  /* 打字机 */\n  typing = true;\n  var full = String(line.text || ''), n = 0;\n  textEl.textContent = '';\n  textEl.appendChild(caret);\n  caret.classList.remove('gv-on');\n  clearInterval(typeTimer);\n  function finishTyping(){\n    clearInterval(typeTimer);\n    typing = false;\n    textEl.textContent = full;\n    textEl.appendChild(caret);\n    caret.classList.add('gv-on');\n    nextEl.style.display = '';\n    applyFx(line.fx);\n    if (autoOn) { clearTimeout(autoTimer); autoTimer = setTimeout(function(){ if (autoOn) advance(); }, AUTODELAY + full.length * 20); }\n  }\n  typeTimer = setInterval(function(){\n    if (destroyed) { clearInterval(typeTimer); return; }\n    n++;\n    textEl.textContent = full.slice(0, n);\n    textEl.appendChild(caret);\n    if (n >= full.length) finishTyping();\n  }, TYPESPEED);\n  activeSprite.__finish = finishTyping;\n\n  var ds = dotsBox.children;\n  for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('gv-on', k === i);\n}\n\nfunction advance(){\n  if (typing) { if (activeSprite && activeSprite.__finish) activeSprite.__finish(); return; }\n  if (idx + 1 < N) show(idx + 1);\n  else if (autoOn) { autoOn = false; autoBtn.classList.remove('gv-active'); }\n}\nphone.addEventListener('click', function(){\n  /* ★ 浏览器要求\"先有用户操作\"才允许出声: 你第一次点屏幕时, 把该放的 BGM 补上 (headless 里就是 NotAllowedError) */\n  try { if (bgmEl && bgmEl.paused && bgmNow && bgmEl.src) { bgmEl.volume = volNow().bgm; var p = bgmEl.play(); if (p && p.catch) p.catch(function(){}); } } catch (e) {}\n  if (editor.classList.contains('gv-open')) return; advance();\n});\nautoBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  autoOn = !autoOn;\n  autoBtn.classList.toggle('gv-active', autoOn);\n  if (autoOn) advance();\n});\nreplayBtn.addEventListener('click', function(e){\n  e.stopPropagation();\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  /* 重播: 台上立绘先清空 */\n  for (var sk in sprites) { var sp = sprites[sk]; sp.el.style.display = 'none'; sp.el.classList.remove('gv-idle', 'gv-dim', 'gv-bright'); }\n  setBg(resolveBg(ctx.bg));\n  show(0);\n});\n\n/* ---- 工具条 + 自建编辑器 (保存走 floorAction('save') -> setChatMessages) ---- */\nbtnEdit.addEventListener('click', function(e){\n  e.stopPropagation();\n  var open = popup.classList.toggle('gv-open');\n  btnEdit.textContent = open ? '关闭' : '编辑';\n});\nArray.prototype.forEach.call(popup.querySelectorAll('[data-a]'), function(b){\n  b.addEventListener('click', function(e){\n    e.stopPropagation();\n    var a = b.getAttribute('data-a');\n    popup.classList.remove('gv-open');\n    btnEdit.textContent = '编辑';\n    if (a === 'edit') { openEditor(); return; }\n    if (a === 'volume') { toggleVol(); return; }\n    ctx._post(a);\n  });\n});\nfunction buildRaw(){\n  var L = ctx.lines || [], out = [];\n  if (ctx.bg) out.push('【bg:' + ctx.bg + '】');\n  for (var i = 0; i < L.length; i++) {\n    var l = L[i];\n    if (!l.name || l.name === '旁白') out.push('旁白||' + String(l.text || '') + '|' + String(l.fx || ''));\n    else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '') + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));\n  }\n  return out.join('\\n');\n}\nfunction openEditor(){ ta.value = ctx.rawText != null ? String(ctx.rawText) : buildRaw(); editor.classList.add('gv-open'); ta.focus(); }\nfunction tplToast(msg){\n  var t = el('div', 'gv-tpl-toast', msg);\n  phone.appendChild(t);\n  setTimeout(function(){ t.remove(); }, 5000);\n}\nfunction closeEditor(save){\n  editor.classList.remove('gv-open');\n  if (save) ctx._post('save', ta.value);   // 由宿主决定怎么存、并回一个提示\n}\nctx.on('toast', function(msg){ if (msg) tplToast(String(msg)); });\n$('bSave').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(true); });\n$('bCancel').addEventListener('click', function(e){ e.stopPropagation(); closeEditor(false); });\neditor.addEventListener('click', function(e){ e.stopPropagation(); });\n\nfunction initAll(){\n  timers.forEach(clearTimeout); timers = []; destroyed = false;\n  slotKeys = (ctx.slots || []).filter(Boolean);\n  stage.innerHTML = ''; sprites = {};\n  activeSprite = mkSprite('');\n  if (slotKeys.length) activeSprite.el.style.display = 'none';\n  N = (ctx.lines || []).length;\n  dotsBox.innerHTML = '';\n  for (var i = 0; i < N; i++) dotsBox.appendChild(el('div', 'gv-dot' + (i === 0 ? ' gv-on' : '')));\n  if (ctx.userAvatar) { uava.src = ctx.userAvatar; uava.style.display = ''; } else { uava.style.display = 'none'; }\n  if (btnUa) { btnUa.classList.toggle('gv-on', !!ctx.userAvatar); btnUa.textContent = ctx.userAvatar ? '关闭头像' : '显示头像'; }\n  curBg = null; bgA.classList.remove('gv-on'); bgB.classList.remove('gv-on');\n  setBg(resolveBg(ctx.bg));\n  timers.push(setTimeout(function(){ show(0); }, 120));\n}\n/* ★ 自适应: 容器比设计宽度窄 -> 整块按比例缩小 (别人的手机 / 小窗口也不会挤坏) */\nvar DESIGN_W = 640;          /* 设计宽度: 和 CSS 里手机框那一套尺寸对应 (默认 400) */\nfunction autoFit(){\n  try {\n    var avail = document.documentElement.clientWidth || 0;\n    var s = avail > 0 ? Math.min(1, avail / DESIGN_W) : 1;\n    var root = document.querySelector('.gv-root');\n    if (root) root.style.setProperty('--gv-scale', String(s));\n    /* ★ .gv-phone 是 flex 子项, 默认 flex-shrink:1 -> 光设 width 还是会被容器压扁, 必须连 flex 一起钉住 */\n    if (s < 1) { phone.style.width = DESIGN_W + 'px'; phone.style.maxWidth = 'none'; phone.style.flex = '0 0 auto'; }\n    else { phone.style.width = ''; phone.style.maxWidth = ''; phone.style.flex = ''; }\n    /* ★ 缩小后 .gv-root 的布局盒还占着原尺寸 -> 关掉外层滚动, 免得框里多出空白滚动区 */\n    try { document.documentElement.style.overflow = s < 1 ? 'hidden' : ''; } catch (e2) {}\n    return s;\n  } catch (e) { return 1; }\n}\nfunction reportSize(){\n  try {\n    var s = autoFit();\n    var avail = document.documentElement.clientWidth || 0;\n    var r = phone.getBoundingClientRect();     /* 带 transform: 拿到的是缩放后的真实显示尺寸 */\n    if (r.width > 40) {\n      /* ★ 宽度只报【容器宽】: 把\"缩放后的手机宽\"喂回宿主, 会一轮轮越缩越小 (300->225->169->127)\n         高度报【缩放后的视觉高度】(算上手机框之外的余量), 宿主 / 引擎拿它定外框高度 */\n      var _bh = 0; try { _bh = (document.body ? document.body.scrollHeight : 0) * s; } catch (e2) {}\n      var _h = Math.round(s < 1 ? Math.max(r.height, _bh) : r.height);   /* 没缩放时和原来一样, 只报手机框本身 */\n      ctx._post('frameSize', { w: Math.round(avail || r.width), h: _h });\n      ctx._post('resize', _h);   /* 真机的外框高度靠这条 */\n    }\n  } catch (e) {}\n}\n\nctx.on('init', function(){\n  /* 第一行的 BGM 在这里也点一次 (show(0) 万一比 init 早, 就靠这次补上; 同一首不会重播) */\n  \n  /* 制作器里改过的/自己写的气泡演出 CSS: 注进来, 贴纸的 gv-b-xxx 才有动画 */\n  try {\n    var st = document.getElementById('gv-bubble-style');\n    if (!st) { st = document.createElement('style'); st.id = 'gv-bubble-style'; document.head.appendChild(st); }\n    st.textContent = String(ctx.bubbleCss || '');\n  } catch (e) {}\n  /* ★ 自定义演出 (特殊演出 → B) 的 CSS: 也注进来 —— 引擎那条路是 injectEffectCss(), 模板这条路得自己做 */\n  try {\n    var _fxm = ctx.effects || {}, _fxc = '', _fxk;\n    for (_fxk in _fxm) { if (_fxm[_fxk] && _fxm[_fxk].css) _fxc += '\\n/* ' + _fxk + ' */\\n' + _fxm[_fxk].css; }\n    var sfe = document.getElementById('gv-fx-style');\n    if (!sfe) { sfe = document.createElement('style'); sfe.id = 'gv-fx-style'; document.head.appendChild(sfe); }\n    sfe.textContent = _fxc;\n  } catch (e) {}\n  initAll(); setTimeout(reportSize, 220);\n});\nctx.on('openEditor', function(){ openEditor(); });\n/* ★ 尺寸一变就报给宿主 (宿主把它记成「方案的定位框」, 并让预览外框跟着走) —— 不能只在 load 报一次 */\ntry { if (window.ResizeObserver) { new ResizeObserver(function () { reportSize(); }).observe(phone); } } catch (e) {}\nwindow.addEventListener('load', function(){ setTimeout(reportSize, 260); setTimeout(reportSize, 900); });\nctx.on('line', function(n){ show(n); });\nctx.on('fx', function(n){ applyFx(n); });\nctx.on('bubble', function(n){ applyFx('bubble:' + n); });"
 }
};

/* ★ 第 9 条: char 楼层两套版式 —— 竖版存 pages.char, 横版存 pages.charLand (各留各的编辑内容) */
function pagesKey(tab, p) {
  if (tab !== 'char') return tab;
  const o = p || cur;
  const land = !!(o && o.layout === 'landscape'), noAud = !!(o && o.audioMode === 'without');
  /* ★ 4 套预设各存一格: 切版式/切音频都会换成那一格的编辑内容 (没写过就是那一套的默认模板,
     「恢复默认」是兜底 —— 想把手改的冲掉再点它) */
  return land ? (noAud ? 'charLandNoAudio' : 'charLand') : (noAud ? 'charNoAudio' : 'char');
}
/* ★ 4 套 char 预设对应 4 份提示词: 横/竖 × 有/无音频 */
function promptKey(tab, p) { return pagesKey(tab, p); }   // 4 套预设 = 4 格 = 4 份提示词
function tplDefOf(tab, p) {
  const o = p || cur;
  const base = DEFAULT_TPL[pagesKey(tab, o)] || DEFAULT_TPL[tab];
  return (tab === 'char' && o && o.audioMode === 'without' && base) ? stripAudio(base) : base;
}
  const stickerUrl = id => PLUGIN.dir + '/assets/sticker/' + id + '.png';

  /* ---------------- 存储 ---------------- */
  const DB = 'textgame_maker', STORE = 'kv';
  /* ★ 只能有一个连接、一个版本号。以前 kv 用 v1、blobs 用 v2, 两个连接并存 ->
     v2 的升级被已打开的 v1 连接 BLOCKED, onsuccess 永不触发, 导入文件就永久卡住。 */
  const DB_VERSION = 2;
  let _db = null;
  function db() {
    if (_db) return Promise.resolve(_db);
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB, DB_VERSION);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs');
      };
      r.onblocked = () => rej(new Error('IndexedDB 被其它标签页占用，请关掉其它酒馆页面再试'));
      r.onsuccess = () => { _db = r.result; res(_db); };
      r.onerror = () => rej(r.error);
    });
  }
  async function kvGet(k) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction(STORE, 'readonly').objectStore(STORE).get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
  async function kvSet(k, v) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction(STORE, 'readwrite').objectStore(STORE).put(v, k); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }
  /* ★ 清掉角色脚本存在本机的那份"导入过的素材包"(gv_pack_manifest + gvpack:*), 别的键一律不碰 */
async function clearPackCache() {
  const d = await db();
  return await new Promise((res, rej) => {
    const tx = d.transaction('blobs', 'readwrite'); const st2 = tx.objectStore('blobs');
    let n = 0;
    st2.delete('gv_pack_manifest'); n++;
    const cur2 = st2.openCursor();
    cur2.onsuccess = () => { const c = cur2.result; if (!c) return; if (String(c.key).indexOf('gvpack:') === 0) { c.delete(); n++; } c.continue(); };
    tx.oncomplete = () => res(n);
    tx.onerror = () => rej(tx.error || new Error('删除失败'));
  });
}
async function kvDel(k) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction(STORE, 'readwrite').objectStore(STORE).delete(k); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }

  /* ---------------- 默认方案 ---------------- */
  const DEFAULT_ASSETS = {
    bg: ['海', '夜', '天空', '酒馆', '房间'],
    face: ['平静', '微笑', '害羞', '惊讶', '生气', '悲伤'],
    fx: ['shake', 'jump', 'zoom', 'dim', 'flash'],
    bubble: STICKERS.map(s => s[0]),
    audio: [],
    se: [],
  };
  function newProject(name) {
    const now = Date.now();
    return {
      id: 'p' + now.toString(36) + Math.random().toString(36).slice(2, 6),
      name: name || '新方案', createdAt: now, updatedAt: now,
      slotsPreset: 'single',                           // single | double | triple | custom
      slotBoxes: {},                                   // ★ 占位排版: { 站位: {x,y,w,h} } 百分比
      slots: [],                                       // 站位关键词, 空 = 单角色不需要站位字段
      prompt: '',                                      // 空 = 自动生成
      assets: JSON.parse(JSON.stringify(DEFAULT_ASSETS)),
      audioList: [],                                   // 音频: 外链或本地文件 [{mood,name,kind,url|blobId,ext}]
      seList: [],                                      // 音效: 外链或本地文件 [{name,kind,url|blobId,ext}]
      pages: { char: null, user: null, panel: null },  // P4 用
      effects: [],                                     // P3 用
      bgList: [], spriteGroups: [],                    // P2 用
    };
  }
  async function listProjects() { return (await kvGet('projects')) || []; }
  async function saveProjects(l) { await kvSet('projects', l); }
  async function getProjectData(id) { return await kvGet('project:' + id); }
  async function putProjectData(p) { p.updatedAt = Date.now(); await kvSet('project:' + p.id, p); }
  async function loadProject(id) { const p = await getProjectData(id); if (p) { try { localStorage.setItem(LS_LAST, id); } catch (e) {} } return p; }
  async function createProject(name) {
    const p = newProject(name);
    const l = await listProjects(); l.push({ id: p.id, name: p.name, createdAt: p.createdAt, updatedAt: p.updatedAt });
    await saveProjects(l); await putProjectData(p);
    try { localStorage.setItem(LS_LAST, p.id); } catch (e) {}   // 记住当前选的是哪个方案
    return p;
  }
  async function removeProject(id) {
    const l = (await listProjects()).filter(x => x.id !== id);
    await saveProjects(l); await kvDel('project:' + id);
  }
  async function renameProject(id, name) {
    const p = await getProjectData(id); if (!p) return;
    p.name = name; await putProjectData(p);
    const l = await listProjects(); const e = l.find(x => x.id === id); if (e) { e.name = name; e.updatedAt = p.updatedAt; }
    await saveProjects(l);
  }

  /* ---------------- 提示词（4A：发给聊天的 AI） ----------------
     素材清单全部从【真实导入的素材】推导, 不需要人手动改提示词 */
  /* 内置气泡贴纸: 每张右上角可以叉掉 ("删掉这张"), 导出/提示词里就不带了; 重置能全找回来 */
  function stickerList(p) {
    const hid = (p && p.stickersHidden) || [];
    return STICKERS.filter(function (s) { return hid.indexOf(s[0]) < 0; });
  }
  function assetLists(p) {
    const base = DEFAULT_ASSETS;
    const bg = (p.bgList || []).map(b => b.name).filter(Boolean);
    const groups = (p.spriteGroups || []).filter(g => (g.faces || []).length);
    const faceLines = groups.map(g => g.name + '：' + g.faces.map(f => f.key).join(' / '));
    const bubble = stickerList(p).map(s => s[0] + '(' + s[1] + ')').concat((p.stickers || []).map(s => s.name));
    const audio = (p.audioList || []).map(a => a.mood || a.name);
    const se = (p.seList || []).map(s => s.name);
    const fx = BUILTIN_FX.filter(x => !((p.fxHidden || []).includes(x[0])))
      .map(x => ((p.fxNames || {})[x[0]] || x[0]))
      .concat((p.effects || []).map(e => e.name).filter(Boolean));
    return {
      bg: bg.length ? bg : base.bg,
      faceLines: faceLines.length ? faceLines : null,
      face: faceLines.length ? null : base.face,
      bubble: bubble, audio: audio, se: se,
      fx: fx, slots: (p.slots || []),
    };
  }
  function hs(s) { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }
  function promptBase(p) {   /* 不带用户覆盖的"自动生成版" */
    return buildPrompt(Object.assign({}, p, { prompt: '' }));
  }
  /* ★ 提示词里必须有 BGM / 音效 字段 (名字来自关键词表 assets.audio / assets.se):
     你一旦保存过自定义提示词, 自动生成的那份就被整段顶掉了 —— 这里把缺的那几行补在末尾。
     表里有名字才补; 已经写过的 (提到 bgm/音效) 就不动, 不会写两遍。 */
  /* ★ 关键词表 (assets.audio / assets.se) 兜底: 音频/音效列表里有名字、表里却没有 -> 补上。
     只加不减 (你自己手写的关键词不会被删)。加载方案时跑一次, 导入/改名/删除时也会同步。 */
  function syncKeywordTables(p) {
    try {
      if (!p) return false;
      p.assets = p.assets || {};
      let changed = false;
      const fix = (key, want) => {
        const cur0 = p.assets[key] || [];
        const merged = cur0.slice();
        (want || []).forEach(n => { if (n && merged.indexOf(n) < 0) merged.push(n); });
        if (merged.length !== cur0.length) { p.assets[key] = merged; changed = true; }
      };
      fix('audio', (p.audioList || []).map(a => a && (a.mood || a.name)));
      fix('se', (p.seList || []).map(a => a && a.name));
      return changed;
    } catch (e) { return false; }
  }
  function ensureAudioPromptLines(text, assets) {
    try {
      const a = assets || {};
      const bgm = a.audio || [], se = a.se || [];
      let t = String(text || '');
      const missBgm = bgm.length && !/bgm|音乐/i.test(t);
      const missSe = se.length && t.indexOf('音效') < 0;
      if (!missBgm && !missSe) return t;
      const L = ['', '【声音】'];
      if (missBgm) L.push('- BGM 只能从这里选：' + bgm.join('、') + ' —— 要换曲就在那一行写 【bgm:情绪】');
      if (missSe) L.push('- 音效：需要时把音效名写在那一行的最后（角色名|表情|台词|效果|站位|音效），可选：' + se.join('、'));
      return t.replace(/\s+$/, '') + '\n' + L.join('\n') + '\n';
    } catch (e) { return text; }
  }
  function buildPrompt(p) {
    if (p.prompt && p.prompt.trim()) return p.prompt;
    const a = assetLists(p);
    const slots = p.slots || [];
    const fxList = a.fx || [];
    /* 示例尽量用【这个方案里真实存在的素材名】—— AI 会照抄示例 */
    const g0 = (p.spriteGroups || []).find(function (g) { return (g.faces || []).length; }) || null;
    const exName = g0 ? g0.name : '角色';
    const exFace1 = g0 && g0.faces[0] ? g0.faces[0].key : '平静';
    const exFace2 = g0 && g0.faces[1] ? g0.faces[1].key : exFace1;
    const exFx = fxList.indexOf('zoom') >= 0 ? 'zoom' : (fxList[0] || '');
    const exBg = (a.bg || [])[0] || '房间';
    const L = [];
    L.push('【正文脚本格式】');
    L.push('其他部分继续遵守当前预设要求的整体结构，但其中的正文部分，必须改写为以下的程式化脚本。');
    L.push('');
    if ((a.audio || []).length) {
      L.push('第 1 行： 【bgm:情绪】—— 从这些里挑一个最贴合的：' + a.audio.join('、') + '（这段不换 BGM 就省掉这一行）');
      L.push('第 2 行： 【bg:背景名】');
    } else {
      L.push('第 1 行： 【bg:背景名】');
    }
    const hasSe = (a.se || []).length > 0;
    L.push('之后每行： 角色名|表情|台词|演出效果' + (slots.length ? '|站位' : '') + (hasSe ? '|音效' : ''));
    L.push('');
    L.push('规则：');
    L.push('- 背景名只能从这些里选：' + (a.bg || []).join('、') + '（不要自己编造背景）');
    if (a.faceLines) {
      L.push('- 立绘只能从这些里选，格式是 角色：情绪（台词里的角色名和表情名都要对得上）：');
      a.faceLines.forEach(x => L.push('    ' + x));
    } else {
      L.push('- 表情只能从这些里选：' + (a.face || []).join('、'));
    }
    L.push('- 台词直接写，不用加引号，不要写成“他说：……”');
    L.push('- 内心独白/心理描写走旁白，写成： 旁白||文字| ；不要写不带竖线的裸句子');
    L.push('- 没有立绘的角色（路人 / 只露一次脸的店小二之类）：名字照写、表情那一格【留空】，例： 店小二||客官里边请。| —— 引擎不会给他配立绘，和旁白一个待遇（只有上面立绘表里的角色才写表情名）');
    L.push('- 根据剧情自由调用素材：场景换了才换背景，角色情绪变了才换表情，不要每行都换');
    L.push('- 只能从上面列出的名字里选，不要自己新造素材名');
    L.push('- 每次 4~8 行');
    L.push('- {{user}} 说话时，角色名写 {{user}}');
    if (slots.length) L.push('- 站位字段只能写：' + slots.join('、') + '（角色站在画面的哪个位置）');
    if (slots.length) L.push('- 站位跟着角色走：同一个角色在同一段剧情里尽量一直用同一个站位');
    if ((a.bubble || []).length) L.push('- 情绪气泡：把演出效果写成 bubble:名字，可选的名字有：' + a.bubble.join('、'));
    if ((a.audio || []).length) L.push('- BGM 的情绪只能从上面列的里选，不要自己编造');
    if (hasSe) L.push('- 音效：需要时把音效名写在最后，可选的名字有：' + a.se.join('、'));
    if (fxList.length) L.push('- 可用演出效果：' + fxList.join('、'));
    L.push('');
    L.push('示例（正文里的内容）：');
    if ((a.audio || []).length) L.push('【bgm:' + a.audio[0] + '】');
    L.push('【bg:' + exBg + '】');
    L.push(exName + '|' + exFace1 + '|来了。|');
    L.push('旁白||暖气片发出很轻的响。|');
    L.push('店小二||客官里边请。|');            // ★ 路人示例: 表情留空, 不配立绘
    L.push(exName + '|' + exFace2 + '|靠窗那个位置，我给你留着。|' + exFx + (slots.length ? '|' + slots[0] : '') + (hasSe ? '|' + a.se[0] : ''));
    return L.join('\n');
  }

  /* ---------------- 界面 ---------------- */
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const TABS = [
    ['project', '方案'],
    ['pages', '页面排版'],
    ['assets', '演出素材'],
    ['effects', '特殊演出'],
    ['prompt', '提示词'],
    ['export', '导出'],
  ];
  let UI = null;

  function buildUI() {
    if (UI) return UI;
    const mask = el('div', 'tgm-hide'); mask.id = 'tgm-mask';
    const app = el('div'); app.id = 'tgm-app';
    const head = el('div', 'tgm-head');
    head.append(el('span', 'tgm-title', PLUGIN.name), el('span', 'tgm-ver', 'v' + PLUGIN.version), el('span', 'tgm-spacer'));
    const x = el('div', 'tgm-x', '✕'); head.appendChild(x);
    const body = el('div', 'tgm-body');
    const nav = el('div', 'tgm-nav');
    const main = el('div', 'tgm-main');
    const panes = {};
    TABS.forEach(([id, label], i) => {
      const n = el('div', 'tgm-nav-item' + (i === 0 ? ' tgm-on' : ''), label);
      n.dataset.tab = id;
      nav.appendChild(n);
      const p = el('div', 'tgm-pane' + (i === 0 ? ' tgm-on' : '')); p.dataset.tab = id;
      panes[id] = p; main.appendChild(p);
    });
    body.append(nav, main);
    app.append(head, body); mask.appendChild(app);
    document.body.appendChild(mask);

    nav.addEventListener('click', e => {
      const it = e.target.closest('.tgm-nav-item'); if (!it) return;
      nav.querySelectorAll('.tgm-nav-item').forEach(n => n.classList.toggle('tgm-on', n === it));
      main.querySelectorAll('.tgm-pane').forEach(p => p.classList.toggle('tgm-on', p.dataset.tab === it.dataset.tab));
      if (it.dataset.tab === 'project') q('project', renderProject);
      if (it.dataset.tab === 'prompt') q('prompt', renderPrompt);
      if (it.dataset.tab === 'assets') q('assets', renderAssets);
      if (it.dataset.tab === 'effects') q('effects', renderEffects);
      if (it.dataset.tab === 'pages') q('pages', renderPages);
      if (it.dataset.tab === 'export') q('export', renderExport);
    });
    x.addEventListener('click', () => close());
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    UI = { mask, app, panes, open, close };
    return UI;
  }
  function open() { buildUI(); _pvWinOpen = true; UI.mask.classList.remove('tgm-hide'); refresh(); }
  function close() {
    _pvWinOpen = false;                                   /* ★ 关着的时候: 预览再发 bgm/se 一律不理 */
    if (UI) UI.mask.classList.add('tgm-hide');
    try { pvStopBgm(); } catch (e) {}
  }



  /* ============================================================
     P2 素材库：图片存 IndexedDB 的 blobs 库（小图/大图都放得下，不公开、不跟卡走）
     ============================================================ */
  async function blobPut(id, blob) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction('blobs', 'readwrite').objectStore('blobs').put(blob, id); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }
  async function blobGet(id) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction('blobs', 'readonly').objectStore('blobs').get(id); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
  async function blobDel(id) { const d = await db(); return new Promise((res, rej) => { const q = d.transaction('blobs', 'readwrite').objectStore('blobs').delete(id); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }

  const _urlCache = new Map();
  function newId(p) { return (p || 'a') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  /* entry: { kind:'url', src } 或 { kind:'file', blobId } */
  async function entryUrl(e) {
    if (!e) return '';
    if (e.kind === 'url') return e.src || '';
    if (!e.blobId) return '';
    if (_urlCache.has(e.blobId)) return _urlCache.get(e.blobId);
    const b = await blobGet(e.blobId);
    if (!b) return '';
    const u = URL.createObjectURL(b);
    _urlCache.set(e.blobId, u);
    return u;
  }
  /* ---- ★ 第 6/7 条: 页面排版用的【本地素材】 ----
     模板跑在 sandbox iframe 里 (独立源), http / 根相对 / 相对路径 / file:// 的图一律加载不出来,
     只有 data: 能显示 (实测) -> 所以本地图必须由插件转成 data URL 再交给模板。
     模板里的写法: __gvasset:名字__ (预览和导出都会换, 同一套) */
  const PAGE_ASSET_RE = /__gvasset:([^<>"'\s]{1,60}?)__/g;
  const _pageAssetCache = new Map();                      // blobId -> data URL (同一张只转一次)
  function pageAssetList(p) { const o = p || cur; if (!o) return []; o.pageAssets = o.pageAssets || []; return o.pageAssets; }
  async function pageAssetDataUrl(e) {
    if (!e) return '';
    if (e.kind === 'url') return e.src || '';
    if (!e.blobId) return '';
    if (_pageAssetCache.has(e.blobId)) return _pageAssetCache.get(e.blobId);
    let b = null; try { b = await blobGet(e.blobId); } catch (err) {}
    if (!b) return '';
    const u = await new Promise(res => { try { const fr = new FileReader(); fr.onload = () => res(String(fr.result || '')); fr.onerror = () => res(''); fr.readAsDataURL(b); } catch (err) { res(''); } });
    if (u) _pageAssetCache.set(e.blobId, u);
    return u;
  }
  async function withPageAssets(t, p) {
    if (!t || typeof t !== 'object') return t;
    const list = pageAssetList(p);
    if (!list.length) return t;
    const m = {};
    for (const a of list) { const u = await pageAssetDataUrl(a); if (u) m[a.name] = u; }
    const one = s => String(s == null ? '' : s).replace(PAGE_ASSET_RE, (mm, k) => m[String(k).trim()] || mm);
    return { html: one(t.html), css: one(t.css), js: one(t.js) };
  }
  /* 预览跑在 sandbox iframe 里(独立源, 读不到 blob:), 所以预览一律用 data: 地址 */
  const _dataCache = new Map();
  /* 当前人设头像: 预览在 sandbox iframe 里, 带 cookie 的 /thumbnail 取不到 -> 页面里先转成 data: */
  const _personaData = new Map();
  async function previewPersonaUrl() {
    try {
      const c = SillyTavern.getContext();
      const me = String(c.name1 || '');
      const ps = (c.powerUserSettings && c.powerUserSettings.personas) || {};
      const fileOf = src => { const m = /[?&]file=([^&]+)/.exec(String(src || "")); return m ? decodeURIComponent(m[1]) : ""; };
      let url = "";
      /* 0) ★★ 最可靠: 酒馆核心模块里的 user_avatar —— ESM 实时绑定, 就是【当前人设】的头像文件名。
            (getContext() 里那个 user_avatar 是旧快照, 实测是 null; 而人设池里可能有好几个同名的人设,
             靠名字找会挑错人 —— 之前就是栽在这儿) */
      try {
        const core = await stCore();
        const uf = core && core.user_avatar ? String(core.user_avatar) : "";
        if (uf) url = "/thumbnail?type=persona&file=" + encodeURIComponent(uf) + "&v=" + Date.now();
      } catch (e) {}
      /* 0.4) 人设选择器里【当前选中】的那个人设 (面板打开时才有这个元素) */
      if (!url) { const sel0 = document.querySelector('#user_avatar_block .avatar.selected img, #persona_pool .avatar.selected img');
        const s0 = sel0 ? (sel0.getAttribute("src") || sel0.src || "") : ""; if (s0) url = s0; }
      /* 0.5) 老快照 (有些版本这里是有的) */
      if (!url) { const cf0 = String(c.user_avatar || "").trim(); if (cf0) url = "/thumbnail?type=persona&file=" + encodeURIComponent(cf0); }
      /* 1) 聊天里那条用户楼层的头像: 只有当它对应的人设名 == 当前人设名时才用
            (换人设后酒馆不会重画老消息, 直接用会显示成上一个人设的头像) */
      const im = document.querySelector('#chat .mes[is_user="true"] .avatar img');
      const domSrc = im ? (im.getAttribute("src") || im.src || "") : "";
      const domFile = fileOf(domSrc);
      if (!url && domSrc && domFile && ps[domFile] !== undefined && String(ps[domFile]) === me) url = domSrc;
      /* 2) 按当前人设名在人设池里找 */
      if (!url) {
        for (const k in ps) {
          const v = ps[k];
          const nm = (v && typeof v === "object") ? (v.name || v.avatar) : v;
          if (String(nm) === me) { url = "/thumbnail?type=persona&file=" + encodeURIComponent(k); break; }
        }
      }
      if (!url) return "";
      if (_personaData.has(url)) return _personaData.get(url);
      const r = await fetch(url, { credentials: "include" });
      const b = await r.blob();
      const d = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || "")); fr.onerror = () => res(""); fr.readAsDataURL(b); });
      _personaData.set(url, d);
      return d;
    } catch (e) { return ""; }
  }
  /* 预览的 iframe 是 sandbox(独立源): 实测连同源的 http 图片都加载不了(onerror),
     所以 http 图也先在页面里 fetch 成 data: 再用; fetch 不到就退回原地址(至少不比现在差) */
  const _remoteData = new Map();
  async function previewRemoteUrl(url) {
    if (!url) return '';
    if (url.slice(0, 5) === 'data:') return url;
    if (_remoteData.has(url)) return _remoteData.get(url);
    let out = url;
    try {
      const r = await fetch(url, { credentials: 'same-origin' });
      if (!r.ok) missUrl(url, 'HTTP ' + r.status);
      if (r.ok) { const b = await r.blob();
        out = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || url)); fr.onerror = () => res(url); fr.readAsDataURL(b); }); }
    } catch (e) { missUrl(url, '取不到（域名不通 / 没开跨域）'); }
    _remoteData.set(url, out);
    return out;
  }
  /* 字节桥: 把资源取成字节 (ArrayBuffer), 交给 iframe 自己造 blob —— 沙箱里只有它自己造的 blob 能加载 */
  async function fetchBytes(url) {
    try {
      const r = await fetch(url, { credentials: 'same-origin' });
      if (!r.ok) { missUrl(url, 'HTTP ' + r.status); return null; }
      const b = await r.arrayBuffer();
      return { buf: b, type: r.headers.get('content-type') || 'application/octet-stream' };
    } catch (e) { missUrl(url, '取不到（域名不通 / 没开跨域）'); return null; }
  }
  async function previewUrl(e) {
    if (!e) return '';
    if (typeof e === 'string') return previewRemoteUrl(e);
    if (e.kind === 'url') return previewRemoteUrl(e.src || '');
    if (!e.blobId) return '';
    if (_dataCache.has(e.blobId)) return _dataCache.get(e.blobId);
    const b = await blobGet(e.blobId);
    if (!b) return '';
    const u = await new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => res(''); r.readAsDataURL(b); });
    _dataCache.set(e.blobId, u);
    return u;
  }
  /* ★ 预览降采样 (性能根治): 预览框最大才 700px 宽, 没必要把 4K 原图塞进去。
     以前 demoPayload 把【所有】背景 + 所有立绘原尺寸内联: 一张 10MB PNG 的 data URL ≈ 13MB,
     每次刷新预览都要结构化克隆一遍 -> 素材一多必然卡死 / 白屏 / 挂了。
     现在: ① 只挑【这一屏用得到的】 ② 直接从 blob 画到 canvas 缩小 (连大 base64 都不生成),
     长边缩到 cap 像素、webp 带透明通道, 一张 ~100KB; 结果按 素材标识+cap 缓存 */
  const _smallCache = new Map();
  function _resizeSmall(src, cap, force) {
    return new Promise(function (res) {
      try {
        const im = new Image();
        im.onload = function () {
          try {
            const w = im.naturalWidth || 0, h = im.naturalHeight || 0;
            const k = Math.min(1, (Number(cap) || 900) / Math.max(w || 1, h || 1));
            /* ★ force: 小图也要走一遍 canvas(webp 重编码) —— 给导出烘焙用, 不然原样 PNG 会撑爆脚本 */
            if (!w || !h || (k >= 1 && !force)) return res(src);  // 本来就不大 -> 原样用
            const cv = document.createElement('canvas');
            cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
            const cx = cv.getContext('2d');
            cx.drawImage(im, 0, 0, cv.width, cv.height);
            let o = '';
            try { o = cv.toDataURL('image/webp', 0.88); } catch (e) { o = ''; }
            if (!o || o.indexOf('data:image/') !== 0) o = cv.toDataURL('image/png');
            res(o || src);
          } catch (e) { res(src); }
        };
        im.onerror = function () { res(''); };
        im.src = src;
      } catch (e) { res(''); }
    });
  }
  /* e 可以是素材对象({blobId} / {kind:'url',src}) 也可以是现成的 data:/http 地址 */
  async function previewSmall(e, cap, force) {
    if (!e) return '';
    const c = Number(cap) || 900;
    const key = (force ? 'F' : '') + c + '|' + (typeof e === 'string' ? (e.length + '|' + e.slice(0, 60) + e.slice(-40)) : String(e.blobId || e.src || e.name || ''));
    if (_smallCache.has(key)) return _smallCache.get(key);
    let src = '', tmp = '';
    try {
      if (typeof e === 'string') src = e;
      else if (e.kind === 'url' && e.src) {
        const fb = await fetchBytes(e.src);                  // http 图也走字节桥, 不在页面里留大 base64
        if (fb && fb.buf) { tmp = URL.createObjectURL(new Blob([fb.buf], { type: fb.type || 'image/png' })); src = tmp; }
        else src = await previewRemoteUrl(e.src);
      } else if (e.blobId) {
        const b = await blobGet(e.blobId);
        if (b) { tmp = URL.createObjectURL(b); src = tmp; }
      }
      let out = src ? await _resizeSmall(src, c, force) : '';
      if (!out && typeof e !== 'string') { const u = await previewUrl(e); if (u) out = await _resizeSmall(u, c, force); }   // 兜底
      if (_smallCache.size > 150) { try { _smallCache.clear(); } catch (x) {} }   // 别无限长
      _smallCache.set(key, out);
      return out;
    } finally { if (tmp) { try { URL.revokeObjectURL(tmp); } catch (x) {} } }
  }
  async function pickFile(accept) {
    return new Promise(res => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = accept || 'image/*';
      i.id = 'tgm-filepicker';
      i.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
      document.body.appendChild(i);          // 必须挂进 DOM, 有些浏览器对游离的 input 不弹文件框
      let done = false;
      const finish = f => { if (done) return; done = true; try { i.remove(); } catch (e) {} res(f); };
      i.onchange = () => finish(i.files && i.files[0] ? i.files[0] : null);
      i.oncancel = () => finish(null);       // 用户点了取消
      window.addEventListener('focus', () => setTimeout(() => { if (!i.files || !i.files.length) finish(null); }, 800), { once: true });
      i.click();
    });
  }
  async function fileEntry(file) { const id = newId('f'); await blobPut(id, file); return { kind: 'file', blobId: id, name: file.name }; }
  async function dropEntry(e) { if (e && e.kind === 'file' && e.blobId) { try { _urlCache.delete(e.blobId); await blobDel(e.blobId); } catch (err) {} } }

  /* ---- 背景 ---- */
  async function addBgFromFile() {
    const f = await pickFile('image/*'); if (!f) return null;
    const e = await fileEntry(f);
    const b = { id: newId('bg'), name: (f.name || '背景').replace(/\.[^.]+$/, ''), kind: e.kind, blobId: e.blobId, fit: { scale: 1, x: 0, y: 0 } };
    cur.bgList = cur.bgList || []; cur.bgList.push(b); await putProjectData(cur); return b;
  }
  async function addBgFromUrl(url, name) {
    const b = { id: newId('bg'), name: name || '链接背景', kind: 'url', src: url, fit: { scale: 1, x: 0, y: 0 } };
    cur.bgList = cur.bgList || []; cur.bgList.push(b); await putProjectData(cur); return b;
  }
  /* ---- 立绘 ---- */
  async function addGroup(name) {
    const g = { id: newId('g'), name: name || '新角色', anchor: { scale: 1, x: 50, y: 100 }, anchorFace: null, faces: [] };
    cur.spriteGroups = cur.spriteGroups || []; cur.spriteGroups.push(g); await putProjectData(cur); return g;
  }
  async function addFace(g, key) {
    const f = await pickFile('image/*'); if (!f) return null;
    const e = await fileEntry(f);
    const fromFile = String((f.name || '').replace(/\.[^.]+$/, '')).trim();
    const face = { id: newId('f'), key: key || fromFile || '平静', kind: e.kind, blobId: e.blobId, fit: null };
    g.faces.push(face);
    if (!g.anchorFace) { g.anchorFace = face.id; }      // 第一张自动当定位图
    await putProjectData(cur); return face;
  }

  /* ---- 取景/定位编辑器（在手机比例的框里拖动 + 缩放） ---- */
  function frameEditor(opts) {
    /* opts: { title, src, fit:{scale,x,y}, aspect, onSave } */
    return new Promise(async resolve => {
      let fit = Object.assign({ scale: 1, x: 0, y: 0 }, opts.fit || {});
      /* 气泡模式 (place:'point'): x/y 是【气泡中心点】在框里的百分比 (引擎 .gv-sticker 就是 left/top = 中心),
         不是"图片位移" —— 所以这里的拖动/缩放/摆位算法和背景、立绘那两种都不一样 */
      const isPoint = opts.place === 'point';
      const minScale = Number(opts.minScale) > 0 ? Number(opts.minScale) : 0.3;
      /* 气泡模式: 可以逐个贴纸单独摆位 (「切换气泡 ⇄」) —— 每个气泡自己一份 fit, 保存时按 key 归位 */
      const bubs = isPoint ? (opts.bubbles || []).map(function (b) {
        return { key: b.key || '', label: b.label || b.key || '', url: b.url || '', anim: b.anim || 'pop',
          fit: Object.assign({ scale: 1, x: 0, y: 0 }, b.fit || {}) };
      }) : [];
      let bi = Math.max(0, Math.min(bubs.length - 1, Number(opts.bubbleIndex) || 0));
      if (bubs.length) fit = bubs[bi].fit;      // ★ 直接指向列表里那一项, 拖动就是在改它
      const mask = el('div', 'tgm-dlg-mask');
      const box = el('div', 'tgm-dlg tgm-frame-dlg');
      box.appendChild(el('div', 'tgm-dlg-head', opts.title || '调整位置'));
      const body = el('div', 'tgm-dlg-body');
      body.appendChild(el('div', 'tgm-dlg-text', (isPoint
        ? '拖动气泡决定它落在哪：x/y 是气泡【中心点】在这个框里的百分比，和实际渲染同一套规则（框的比例 = 你在「页面排版 → 定位框」里填的宽高）。底下垫的是第一张背景 + 第一张立绘，站位/取景也按实际渲染算 —— 对着角色摆就行。'
        : (opts.fitMode === 'natural'
          ? '在框里拖动图片决定取景，用下面的滑块或滚轮缩放。（1× = 铺满这个框；框里的位置已经是它实际渲染出来的样子，含「立绘站位」的偏移和缩放）'
          : '在框里拖动图片决定取景，用下面的滑块或滚轮缩放。（1× = 铺满这个框）'))));
      /* ★ 弹窗里的立绘预览必须和真机同一套规则 (.gv-sprite): 高度铺满框、宽度按原图比例、框内居中。
         以前弹窗自己算 px 尺寸 + 自己居中, 结果和真机对不上 (实测弹窗图中心 24%, 真机 50%)。
         这里注入的就是 galgame.css 里 .gv-sprite / .gv-sprite img 的那两条规则。 */
      try {
        if (!document.getElementById('tgm-real-sprite-css')) {
          const _st = document.createElement('style'); _st.id = 'tgm-real-sprite-css';
          _st.textContent = '.tgm-frame .tgm-slotsim{display:flex;align-items:flex-end;justify-content:center;}'
            + '.tgm-frame .tgm-frame-img{position:static;inset:auto;margin:0;height:100%;width:auto;object-fit:contain;object-position:bottom center;}'
            + '.tgm-frame.tgm-hasbox .tgm-frame-img{height:100%;}';
          document.head.appendChild(_st);
        }
      } catch (e) {}
      const stage = el('div', 'tgm-frame');
      /* 取景框: 比例跟「页面排版 → 定位框」一致 (aspect = 宽/高), 但尺寸缩到对话框装得下,
         免得直接把 400x867 这种原尺寸塞进来、把整个浏览器界面占满 */
      const stageAR = (Number(opts.aspect) > 0) ? Number(opts.aspect) : 9 / 19.5;
      /* ★ 弹窗放宽了, 取景画面也能大一点 (以前竖版手机在弹窗里只有 175px 宽, 摆气泡看不清) */
      /* ★ 尺寸跟着视口走: 以前固定 min(420, …) 宽 + 最高 520 —— 在 720 高的屏幕上整块弹窗会超出视口, 下面那排按钮点不到。
         现在整体小一档 + 按可用高度算, 再配合 .tgm-frame-dlg 的 max-height/内部滚动兜底 */
      const _vh = (window.innerHeight || 800), _vw = (window.innerWidth || 900);
      const boxMaxW = Math.min(360, Number(opts.maxW) || 360, Math.max(160, Math.round(_vw * 0.72)));
      const boxMaxH = Math.max(180, Math.min(440, _vh - 360));
      let bw = Math.round(boxMaxW), bh = Math.round(bw / stageAR);
      if (bh > boxMaxH) { bh = boxMaxH; bw = Math.max(60, Math.round(bh * stageAR)); }
      stage.style.width = bw + 'px';
      stage.style.height = bh + 'px';
      stage.style.maxWidth = 'none';
      stage.style.aspectRatio = '';
      /* 立绘还要模拟「站位框」: 渲染时 sprite 是 left:x% + bottom:(100-y)% + width:w + scale:slot,
         取景框里照这个摆, 编辑器看到的位置才等于实际渲染的位置 */
      /* 气泡模式: 底下先垫第一张背景 (和引擎一样 cover 铺满) */
      if (isPoint && opts.backdrop) {
        const bd = el('img', 'tgm-frame-bd'); bd.src = opts.backdrop; stage.appendChild(bd);
      }
      const sim = el('div', 'tgm-slotsim');
      const sprites = opts.sprites || [];        // 能切换的立绘: [{group,face,label,url,fit,base}]
      /* 按角色分组: 「切换角色」先选人, 「切换立绘 ⇄」只在这个人自己的立绘里循环 */
      const groups = [];
      sprites.forEach(function (s, i) {
        const gn = s.group || s.label || '角色';
        let gg = null;
        for (let k = 0; k < groups.length; k++) if (groups[k].name === gn) gg = groups[k];
        if (!gg) { gg = { name: gn, idxs: [] }; groups.push(gg); }
        gg.idxs.push(i);
      });
      let si = 0;
      const curSp = () => sprites[si] || null;
      const curGroup = () => { for (let k = 0; k < groups.length; k++) if (groups[k].idxs.indexOf(si) >= 0) return groups[k]; return groups[0] || null; };
      /* ★ §G.5: 多人点立绘「定位」—— 弹窗里先选"定位哪个站位", 画面把这块框画出来, 拖动夹在框里 */
      const _slotList = (opts.slotPick && (cur.slots || []).filter(Boolean).length > 1) ? (cur.slots || []).filter(Boolean) : [];
      const boxOf = function (k) { const b = (cur.slotBoxes || {})[k]; return (b && Number(b.w) > 0 && Number(b.h) > 0) ? b : null; };
      /* ★ 只有一个站位(单人预设)时 _slotList 是空的 —— 但【占位框还是得查】!
         以前这里回退成 '' -> boxOf('') 永远 null -> 弹窗退回"居中 50%", 而真机照框走(17%),
         于是单人预设下弹窗永远和真机对不上(截图那个"弹窗居中、真机偏左"就是这个)。 */
      const _onlySlot = (cur.slots || []).filter(Boolean)[0] || '';
      let _boxSlot = (opts.slotKey && _slotList.indexOf(opts.slotKey) >= 0) ? opts.slotKey
                   : (_slotList[0] || opts.slotKey || _onlySlot);
      const _baseFixed = (isPoint ? ((curSp() || {}).base || null) : opts.base) || null;
      const boxBase = function () {
        const b = boxOf(_boxSlot);
        return b ? { x: Number(b.x) + Number(b.w) / 2, y: Number(b.y) + Number(b.h), w: Number(b.w) + '%', scale: 1, h: Number(b.h) } : null;
      };
      function applyBase() {
        /* ★ 单一来源: 调用处已经按真机规则算好了(含占位框), 优先用它;
           只有它没给(旧调用)才在弹窗里按站位框补一份 —— 以前反过来, 于是弹窗和真机各算一套、位置对不上 */
        const b = _baseFixed || (_boxSlot ? boxBase() : null);
        if (b) {
          sim.style.left = (Number(b.x) || 0) + '%';
          sim.style.bottom = (100 - (b.y == null ? 100 : Number(b.y))) + '%';
          sim.style.width = b.w || '74%';
          sim.style.height = b.h ? (b.h + '%') : '';
          sim.style.transform = 'translateX(-50%) scale(' + (Number(b.scale) || 1) + ')';
          sim.style.alignItems = 'flex-end';        // 和 .gv-sprite 一样: 立绘底对齐
        } else {
          sim.style.left = '50%'; sim.style.bottom = '0%'; sim.style.width = '100%'; sim.style.height = '';
          sim.style.transform = 'translateX(-50%)';
          sim.style.alignItems = 'center';          // 背景: 居中 (和引擎的 sizeBg 一致)
        }
        /* ★ 图比框宽时必须在框内【居中】(和 .gv-sprite 的 justify-content:center 一致)。
           以前只在"有占位框"那条分支里设过, 单人(没框)这条分支没设 -> 图在框里左对齐:
           实测弹窗图中心 24%、真机 50% —— 这就是"两边对不上"的最后一块。 */
        try { layoutImg(); } catch (e) {}
      }
      stage.appendChild(sim);
      const img = el('img', 'tgm-frame-img');
      let limX = 300, limY = 300;          // ★ 框内限制: 只允许在这个范围内平移 (layoutImg 里按"图要盖住框"算出来)
      /* 图片按「原始比例 + 铺满框」摆放, 尺寸等 load 后按 naturalWidth/Height 算。
         这样 scale 1 和以前的 cover 长得一样(不改变已有观感),
         而缩小时缩的是【整张图】, 被裁掉的两边会露出来 —— 用 cover 就永远看不到 */
      const _realSprite = (!isPoint && opts.fitMode === 'natural');
      const layoutImg = () => {
        /* ★ 立绘定位模式: 尺寸/居中全部交给上面那段 CSS (和真机 .gv-sprite img 一模一样),
           JS 不再插一脚 —— 之前就是 JS 自己算 px + 自己居中, 才和真机对不上 */
        if (_realSprite) { limX = 300; limY = 300; return; }
        const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
        const bw2 = sim.clientWidth || 0, bh2 = sim.clientHeight || 0;   // 和渲染一样: 按站位框算
        if (!nw || !nh || !bw2 || !bh2) return;
        /* ★ 必须和真机 .gv-sprite img 同一套: 高度铺满站位框, 宽度 = 高 × 原图比例 (contain by height),
           比框宽的部分由 flex 居中裁掉。以前这里按 cover 算 (图窄于框宽时把宽撑到框宽、高又反超),
           而且 sim 没设 justify-content -> 宽出来的部分从左边缘起排, 于是"编辑器里在中间、真机里偏左"。 */
        const ih = bh2, iw = Math.max(1, Math.round(bh2 * (nw / nh)));
        img.style.width = iw + 'px'; img.style.height = ih + 'px';

        /* ★ 框内限制: 图始终要盖住这块框, 所以平移只能到"图边贴框边"为止 */
        if (_slotList.length && boxOf(_boxSlot)) {
          const S = Number(fit.scale) || 1, kw = iw * S, kh = ih * S;
          /* ★ 取绝对值: 图比框大 -> 允许拖到"图边贴框边"为止 (保证盖住框);
             图比框小(缩小后) -> 允许在框内挪 "剩余空间的一半"。
             以前只在"图更大"时给余量, 缩到 1× 以下余量就是 0 -> 一点就被夹回 0, 看着就是"往下拖不动、还往上跳" */
          limX = Math.abs(kw - bw2) / 2 / Math.max(1, kw) * 100;
          limY = Math.abs(kh - bh2) / 2 / Math.max(1, kh) * 100;
        } else { limX = 300; limY = 300; }
      };
      sim.appendChild(img);
      img.addEventListener('load', layoutImg);
      /* 气泡模式: 这张 img 是【垫底的立绘】, 气泡本身是另一个元素 (宽度 30%, 和 .gv-sticker 一致) */
      const _firstSrc = isPoint ? ((curSp() || {}).url || '') : (opts.src || '');
      if (_firstSrc) { img.src = _firstSrc; if (img.complete) layoutImg(); }
      setTimeout(layoutImg, 80);
      let mark = null, markImg = null;
      if (isPoint) {
        mark = el('div', 'tgm-frame-pt');
        markImg = el('img'); markImg.src = (bubs.length ? bubs[bi].url : opts.src) || '';
        mark.appendChild(markImg); stage.appendChild(mark);
      }
      /* 演示动画用的 <style>: 从 galgame.css (或你改过的/自己写的) 里抠出 gv-b-xxx, 类名换成标记元素 */
      const animStyle = isPoint ? el('style') : null;
      if (animStyle) box.appendChild(animStyle);
      /* ★ §G.5: 站位的框 —— 弹窗里选"定位哪个站位", 画面把这块框用虚线标出来, 拖动夹在框里 */
      let showBox = null;
      const chips = el('div', 'tgm-row'); chips.style.flexWrap = 'wrap';
      const drawBoxShow = function () {
        if (showBox) { showBox.remove(); showBox = null; }
        if (!_slotList.length) return;
        const b = boxOf(_boxSlot); if (!b) return;
        showBox = el('div', 'tgm-boxshow');
        showBox.style.left = Number(b.x) + '%'; showBox.style.top = Number(b.y) + '%';
        showBox.style.width = Number(b.w) + '%'; showBox.style.height = Number(b.h) + '%';
        stage.appendChild(showBox);
      };
      const redrawChips = function () {
        chips.innerHTML = '';
        _slotList.forEach(function (k) {
          const c = el('div', 'tgm-btn' + (k === _boxSlot ? ' tgm-primary' : ''), k + (boxOf(k) ? '' : '（没框）'));
          c.addEventListener('click', function () { _boxSlot = k; redrawChips(); drawBoxShow(); applyBase(); paint(); });
          chips.appendChild(c);
        });
        if (!boxOf(_boxSlot)) chips.appendChild(el('span', 'tgm-imeta', '这块还没画框：去「页面排版 → 立绘站位」画一下（现在按整块画面算）'));
        else chips.appendChild(el('span', 'tgm-imeta', '拖动会被夹在这块框里（图比框大时贴边为止，缩小后在框内挪）'));
      };
      body.appendChild(stage);          // ★ 必须先把 stage 放进 body, 下面 insertBefore 才有"参照兄弟"
      if (_slotList.length) { redrawChips(); body.insertBefore(chips, stage); drawBoxShow(); }
      /* ★★ 不管单人还是多人, 立绘预览都必须按真机规则摆一次 (x/y/宽/高/缩放)。
         以前这行写在 if (_slotList.length) 里面 —— 单人时 _slotList 是空的, applyBase() 从来不执行,
         于是 sim 没有任何定位(退化成 CSS 默认: 贴着左边、宽度 = 图宽), 图上就跑到 24% 去了。
         这就是"单人模式下弹窗和真机永远对不上"的真正原因。 */
      applyBase();
      const rowS = el('div', 'tgm-row');
      rowS.appendChild(el('label', '', '缩放'));
      const rng = el('input', 'tgm-range'); rng.type = 'range'; rng.min = String(minScale); rng.max = '3'; rng.step = '0.01'; rng.value = String(fit.scale);
      rowS.appendChild(rng);
      const val = el('span', 'tgm-imeta', fit.scale.toFixed(2) + '×');
      rowS.appendChild(val);
      body.appendChild(rowS);
      const rowB = el('div', 'tgm-row');
      const bCenter = el('div', 'tgm-btn', '回到中心（1×）'); rowB.appendChild(bCenter);
      /* 气泡模式: 逐个角色对照着摆 (第一个角色的第一张立绘排在最前)
         「切换角色」= 弹窗选人, 「切换立绘 ⇄」= 在这个人自己的立绘里循环 */
      if (isPoint && sprites.length) {
        const bRole = el('div', 'tgm-btn', '切换角色 ▾');
        const bSwap = el('div', 'tgm-btn tgm-primary', '切换立绘 ⇄');
        const lbl = el('span', 'tgm-imeta', '');
        rowB.append(bRole, bSwap, lbl);
        const showLbl = () => {
          const s = curSp() || {}, gg = curGroup();
          const k = gg ? gg.idxs.indexOf(si) : 0;
          lbl.textContent = '角色 ' + (gg ? gg.name : '') + ' · 立绘 ' + ((k < 0 ? 0 : k) + 1) + '/' + (gg ? gg.idxs.length : sprites.length) + ' · ' + (s.face || s.label || '');
        };
        const applySprite = () => { const s = curSp() || {}; if (s.url) img.src = s.url; showLbl(); paintSprite(); };
        showLbl();
        bRole.addEventListener('click', async () => {
          const sel = el('select', 'tgm-sel');
          groups.forEach(function (gg, i) { const o = el('option', '', gg.name + '（' + gg.idxs.length + ' 张立绘）'); o.value = String(i); sel.appendChild(o); });
          sel.value = String(Math.max(0, groups.indexOf(curGroup())));
          const ok = await dialog({ title: '切换角色', text: '选一个角色，框里就换成他的立绘；「切换立绘 ⇄」会在他自己的立绘里循环，方便一个个对照着摆气泡。', extra: sel, okText: '切换' });
          if (!ok) return;
          const gg = groups[Number(sel.value) || 0] || groups[0];
          if (!gg) return;
          si = gg.idxs[0];
          applySprite();
        });
        bSwap.addEventListener('click', () => {
          /* 只在这个角色自己的立绘里循环 —— 只有 1 张就原地不动, 不然会窜到别的角色身上 */
          const gg = curGroup();
          if (!gg || gg.idxs.length < 2) return;
          const k = gg.idxs.indexOf(si);
          si = gg.idxs[(k + 1) % gg.idxs.length];
          applySprite();
        });
      }
      body.appendChild(rowB);
      /* 气泡模式: 逐个贴纸单独摆位 + 直接看它配的入场动画 */
      if (isPoint && bubs.length) {
        const rowP = el('div', 'tgm-row');
        const bBub = el('div', 'tgm-btn tgm-primary', '切换气泡 ⇄');
        const bPlay = el('div', 'tgm-btn', '展示气泡动画 ▶');
        const lblB = el('span', 'tgm-imeta', '');
        rowP.append(bBub, bPlay, lblB); body.appendChild(rowP);
        /* ★ 「默认」不是贴纸: 文字里不写"动画", 画面上给它一块虚线占位框 */
        const isDef = () => !(bubs[bi] || {}).key;
        const defMark = () => { if (mark) mark.classList.toggle('tgm-frame-pt-def', isDef()); };
        const showBubLbl = () => {
          const b = bubs[bi];
          lblB.textContent = b.key
            ? ('气泡 ' + b.label + ' · ' + (bi + 1) + '/' + bubs.length + ' · 动画 ' + bubbleAnimName(b.anim))
            : ('默认落点 · ' + (bi + 1) + '/' + bubs.length + ' · 对所有没单独调过的气泡生效（它自己不是贴纸，没有动画）');
        };
        showBubLbl(); defMark();
        const useBub = () => {
          const b = bubs[bi];
          if (b.url && markImg) markImg.src = b.url;
          fit = b.fit;                       // ★ 换人 = 换到那一项自己的位置
          paint(); showBubLbl(); defMark();
        };
        bBub.addEventListener('click', () => { bi = (bi + 1) % bubs.length; useBub(); });
        bPlay.addEventListener('click', async () => {
          if (isDef()) { lblB.textContent = '「默认」只决定落点和大小，没有自己的动画 —— 用「切换气泡 ⇄」挑一张贴纸再看动画'; setTimeout(showBubLbl, 2600); return; }
          const k = bubs[bi].anim || 'pop';
          let css = '';
          try { css = await bubbleAnimCss(k); } catch (e) { css = ''; }
          animStyle.textContent = String(css || '').split('.gv-sticker').join('.tgm-frame-pt');
          mark.className = 'tgm-frame-pt';
          void mark.offsetWidth;               // 强制重排, 动画才会从头播
          mark.classList.add('gv-b-' + k);
          if (k === 'none') { lblB.textContent = '这个气泡选的是「不做动画」—— 它就一直静止在设好的位置'; setTimeout(showBubLbl, 2200); }
          setTimeout(function () { if (mark) mark.className = 'tgm-frame-pt'; }, 1500);
        });
      }
      const foot = el('div', 'tgm-dlg-foot');
      const bCancel = el('div', 'tgm-btn', '取消');
      const bOk = el('div', 'tgm-btn tgm-primary', '确定');
      foot.append(bCancel, bOk);
      box.append(body, foot); mask.appendChild(box); document.body.appendChild(mask);

      /* 气泡模式下, 垫底立绘的位移/缩放 = 这张立绘自己的取景 (fit) + 它所在站位的偏移/缩放 */
      function paintSprite() {
        const s = curSp(); if (!s) return;
        const f = s.fit || { x: 0, y: 0, scale: 1 };
        img.style.transform = 'translate(' + (f.x || 0) + '%,' + (f.y || 0) + '%) scale(' + (f.scale || 1) + ')';
        const b = s.base;
        if (b) {
          sim.style.left = (Number(b.x) || 0) + '%';
          sim.style.bottom = (100 - (b.y == null ? 100 : Number(b.y))) + '%';
          sim.style.width = b.w || '74%';
          sim.style.transform = 'translateX(-50%) scale(' + (Number(b.scale) || 1) + ')';
        }
        layoutImg();
      }
      function paint() {
        try { layoutImg(); } catch (e) {}
        if (isPoint && mark) {                       // 气泡: 挪的是【中心点】, 缩放只缩气泡本身
          mark.style.left = fit.x + '%';
          mark.style.top = fit.y + '%';
          mark.style.setProperty('--gv-bs', String(fit.scale));   // 动画关键帧里用 var(--gv-bs) 收尾
          mark.style.transform = 'translate(-50%,-50%) scale(' + fit.scale + ')';
        } else {
          img.style.transform = 'translate(' + fit.x + '%,' + fit.y + '%) scale(' + fit.scale + ')';
        }
        rng.value = String(fit.scale); val.textContent = Number(fit.scale).toFixed(2) + '×';
      }
      paint();
      paintSprite();
      let drag = null;
      stage.addEventListener('pointerdown', e => {
        drag = { sx: e.clientX, sy: e.clientY, ox: fit.x, oy: fit.y };
        stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener('pointermove', e => {
        if (!drag) return;
        const r = stage.getBoundingClientRect();
        if (isPoint) {                               // 气泡中心点直接跟着鼠标走, 限制在框里
          fit.x = Math.max(0, Math.min(100, drag.ox + (e.clientX - drag.sx) / Math.max(1, r.width) * 100));
          fit.y = Math.max(0, Math.min(100, drag.oy + (e.clientY - drag.sy) / Math.max(1, r.height) * 100));
        } else {
          fit.x = Math.max(-limX, Math.min(limX, drag.ox + (e.clientX - drag.sx) / Math.max(1, r.width) * 100));
          fit.y = Math.max(-limY, Math.min(limY, drag.oy + (e.clientY - drag.sy) / Math.max(1, r.height) * 100));
        }
        paint();
      });
      stage.addEventListener('pointerup', () => { drag = null; });
      stage.addEventListener('wheel', e => { e.preventDefault(); fit.scale = Math.max(minScale, Math.min(3, fit.scale - e.deltaY * 0.001)); paint(); }, { passive: false });
      rng.addEventListener('input', () => { fit.scale = Number(rng.value); paint(); });
      bCenter.addEventListener('click', () => {
        if (isPoint) { fit.x = 50; fit.y = 50; } else { fit.x = 0; fit.y = 0; }   // 气泡的"中心"= 框的正中间
        fit.scale = 1; paint();
      });
      const done = v => { mask.remove(); resolve(v); };
      bOk.addEventListener('click', () => {
        if (isPoint && bubs.length) done({ __bubbles: bubs.map(function (b) { return { key: b.key, fit: Object.assign({}, b.fit) }; }), __bubbleKey: (bubs[bi] || {}).key || '' });
        else done(Object.assign({}, fit));
      });
      bCancel.addEventListener('click', () => done(null));
      mask.addEventListener('click', e => { if (e.target === mask) done(null); });
    });
  }


  /* ---- 站位编辑器: 在手机比例的台子上拖动每个站位, 决定立绘出现在哪 ---- */
  function slotEditor(p) {
    return new Promise(async resolve => {
      const slots = (p.slots || []).slice();
      if (!slots.length) { await askConfirm('还没配站位', '先在「立绘站位」里选一套预设（双角色 / 三角色），才能编辑位置。'); resolve(null); return; }
      const pos = JSON.parse(JSON.stringify(p.slotPos || {}));
      slots.forEach((k, i) => {
        if (!pos[k]) pos[k] = { x: slots.length <= 1 ? 50 : Math.round(20 + i / (slots.length - 1) * 60), y: 100, scale: 1 };
      });
      p.slotPreview = p.slotPreview || {};
      /* 可用的立绘素材 */
      const pool = [];
      for (const g of (p.spriteGroups || [])) for (const f of g.faces) pool.push({ id: f.id, label: g.name + ' · ' + f.key, entry: f });

      const mask = el('div', 'tgm-dlg-mask');
      const box = el('div', 'tgm-dlg tgm-frame-dlg');
      box.appendChild(el('div', 'tgm-dlg-head', '站位编辑'));
      const body = el('div', 'tgm-dlg-body');
      body.appendChild(el('div', 'tgm-dlg-text', '直接拖动台上的立绘决定它出现在哪；点一下选中，再用滑块调大小。'));
      const stage = el('div', 'tgm-frame tgm-slotstage');
      /* 站位台也用「定位框」的比例 (宽/高), 没有就退回手机比例 */
      stage.style.aspectRatio = String((p.frameSize && p.frameSize.w && p.frameSize.h) ? (p.frameSize.w / p.frameSize.h) : 9 / 19.5);
      const firstBg = (p.bgList || [])[0];
      if (firstBg) { const u = await entryUrl(firstBg); const bi = el('img', 'tgm-frame-img'); bi.src = u; bi.style.opacity = '.55'; stage.appendChild(bi); }
      body.appendChild(stage);

      const marks = {};
      let sel = slots[0];
      for (const k of slots) {
        const m = el('div', 'tgm-slotmark');
        const mi = el('img');
        const use = p.slotPreview[k];
        const face = use ? pool.find(x => x.id === use) : pool[0];
        if (face) mi.src = await entryUrl(face.entry);
        m.append(mi, el('span', 'tgm-slotlabel', k));
        stage.appendChild(m);
        marks[k] = m;
        m.addEventListener('pointerdown', e => {
          e.stopPropagation(); sel = k; paint();
          const r = stage.getBoundingClientRect();
          const move = ev => {
            pos[k].x = Math.max(0, Math.min(100, (ev.clientX - r.left) / Math.max(1, r.width) * 100));
            pos[k].y = Math.max(0, Math.min(100, (100 - (ev.clientY - r.top) / Math.max(1, r.height) * 100)));
            paint();
          };
          const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
          window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        });
      }
      function paint() {
        for (const k of slots) {
          const m = marks[k];
          m.style.left = pos[k].x + '%';
          m.style.bottom = (100 - pos[k].y) + '%';
          m.style.transform = 'translateX(-50%) scale(' + pos[k].scale + ')';
          m.classList.toggle('tgm-sel', k === sel);
        }
        rng.value = String(pos[sel].scale); val.textContent = sel + ' · ' + Number(pos[sel].scale).toFixed(2) + '×';
      }
      const rowS = el('div', 'tgm-row');
      rowS.appendChild(el('label', '', '大小'));
      const rng = el('input', 'tgm-range'); rng.type = 'range'; rng.min = '0.4'; rng.max = '2'; rng.step = '0.01';
      rowS.appendChild(rng);
      const val = el('span', 'tgm-imeta', '');
      rowS.appendChild(val);
      body.appendChild(rowS);
      const rowP = el('div', 'tgm-row');
      rowP.appendChild(el('label', '', '预览用图'));
      const selP = el('select', 'tgm-sel');
      const oAuto = el('option', '', '（自动：第一张立绘）'); oAuto.value = ''; selP.appendChild(oAuto);
      pool.forEach(x => { const o = el('option', '', x.label); o.value = x.id; selP.appendChild(o); });
      selP.value = p.slotPreview[sel] || '';
      rowP.appendChild(selP);
      body.appendChild(rowP);
      if (!pool.length) body.appendChild(el('div', 'tgm-dlg-text', '还没有导入立绘，所以台上显示的是占位方块。先去「图片素材」建角色组、加立绘。'));
      selP.addEventListener('change', async () => { p.slotPreview[sel] = selP.value || undefined; paint(); });
      rng.addEventListener('input', () => { pos[sel].scale = Number(rng.value); paint(); });

      const foot = el('div', 'tgm-dlg-foot');
      const bCancel = el('div', 'tgm-btn', '取消');
      const bOk = el('div', 'tgm-btn tgm-primary', '确定');
      foot.append(bCancel, bOk);
      box.append(body, foot); mask.appendChild(box); document.body.appendChild(mask);
      paint();
      const done = v => { mask.remove(); resolve(v); };
      bOk.addEventListener('click', () => done({ pos: pos, preview: p.slotPreview }));
      bCancel.addEventListener('click', () => done(null));
      mask.addEventListener('click', e => { if (e.target === mask) done(null); });
    });
  }

  /* ---------------- 插件自己的弹窗（不用浏览器 prompt/confirm） ---------------- */
  /* ★ 指导提示词弹窗 (只读文本框 + 复制 / 导出成 TXT) —— 和「页面排版」那边的形式一致 */
  function showPromptBox(o) {
    const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.readOnly = true;
    ta.style.minHeight = '360px'; ta.value = String(o.text || '');
    const info = el('span', 'tgm-status', ta.value.length + ' 字');
    const cp = el('span', 'tgm-btn tgm-primary', '复制');
    cp.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(ta.value); info.textContent = '已复制 ' + ta.value.length + ' 字'; }
      catch (e) { try { ta.focus(); ta.select(); document.execCommand('copy'); info.textContent = '已复制（fallback）'; } catch (x) { info.textContent = '复制失败：手动全选复制'; } }
    });
    const dl = el('span', 'tgm-btn', '导出成 TXT');
    dl.addEventListener('click', () => {
      try {
        const blob = new Blob([ta.value || ''], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (cur.name || '方案') + '.' + (o.file || '指导提示词') + '.txt';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 8000);
        info.textContent = '已导出 ' + ta.value.length + ' 字';
      } catch (e) { info.textContent = '导出失败：' + e.message; }
    });
    const wrap = el('div'); const row = el('div', 'tgm-row'); row.append(cp, dl, info); wrap.append(ta, row);
    return dialog({ title: o.title || '指导提示词', text: o.hint || '', extra: wrap, okText: '关闭' });
  }

  function dialog(opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const mask = el('div', 'tgm-dlg-mask');
      const box = el('div', 'tgm-dlg');
      box.append(el('div', 'tgm-dlg-head', opts.title || ''));
      const body = el('div', 'tgm-dlg-body');
      if (opts.text) body.appendChild(el('div', 'tgm-dlg-text', opts.text));
      let inp = null;
      if (opts.input !== undefined) {
        inp = el('input', 'tgm-in'); inp.type = 'text';
        inp.value = opts.input || ''; inp.placeholder = opts.placeholder || '';
        body.appendChild(inp);
      } else if (opts.code !== undefined) {
        inp = el('textarea', 'tgm-ta'); inp.spellcheck = false;
        inp.style.minHeight = (opts.rows ? opts.rows * 20 : 160) + 'px';
        inp.value = opts.code || ''; inp.placeholder = opts.placeholder || '';
        body.appendChild(inp);
      }
      if (opts.extra) body.appendChild(opts.extra);
      const foot = el('div', 'tgm-dlg-foot');
      const bCancel = el('div', 'tgm-btn', opts.cancelText || '取消');
      const bOk = el('div', 'tgm-btn ' + (opts.danger ? 'tgm-danger' : 'tgm-primary'), opts.okText || '确定');
      foot.append(bCancel, bOk);
      box.append(body, foot);
      mask.appendChild(box);
      document.body.appendChild(mask);
      if (inp) { setTimeout(() => { inp.focus(); inp.select(); }, 30); }
      let closed = false;
      const done = v => { if (closed) return; closed = true; mask.remove(); document.removeEventListener('keydown', onKey, true); resolve(v); };
      const onKey = e => {
        const inTa = e.target && e.target.tagName === 'TEXTAREA';
        if (e.key === 'Enter' && !inTa) { e.preventDefault(); done(inp ? inp.value : true); }
        if (e.key === 'Escape') { e.preventDefault(); done(inp ? null : false); }
      };
      bOk.addEventListener('click', () => done(inp ? inp.value : true));
      bCancel.addEventListener('click', () => done(inp ? null : false));
      mask.addEventListener('click', e => { if (e.target === mask) done(inp ? null : false); });
      document.addEventListener('keydown', onKey, true);
    });
  }
  const askText = (title, text, value, placeholder) => dialog({ title, text, input: value == null ? '' : value, placeholder, okText: '确定' });
  const askConfirm = (title, text, danger) => dialog({ title, text, danger, okText: danger ? '删除' : '确定' });

  /* 渲染串行化: 同一块面板的多次渲染按顺序跑, 避免两次 await 交叉把 DOM 搞乱 */
  const _chain = {};
  const q = (k, fn) => (_chain[k] = (_chain[k] || Promise.resolve()).then(() => fn()).catch(e => console.warn('[TGM]', k, e)));

  /* ---- 预览里的声音 ----
     预览 iframe 是沙箱(自己放不了音, 连 blob/http 都取不到), 所以由插件(父页面)替它放。
     音量共用真机那一份 (localStorage: gv_volume_v1) */
  const PV_VOL_KEY = 'gv_volume_v1';
  let _pvBgm = null, _pvSe = null, _pvBgmName = null;
/* ★ 插件窗口开着没有: 关掉之后预览 iframe 还在跑(打字机/自动播放不会因为 display:none 停),
   它会继续往宿主发 bgm / se -> 于是"我把插件关了它不响了, 一动别的页面它又开始响"。关着的时候一律不理。 */
let _pvWinOpen = false;

  /* ★ 预览里也一样: 活 iframe 里的卡片点"选项"时发上来 {__gvTH:1, fn:'setInput'|'triggerSlash'}, 我们替它落笔。
     只在预览窗开着时接 (真机那边由卡里脚本接; 两边用 e.__gvTHDone 保证只执行一次) */
  window.addEventListener('message', function (e) {
    const d = e.data; if (!d || d.__gvTH !== 1 || e.__gvTHDone) return;
    if (!_pvWinOpen) return;
    e.__gvTHDone = 1;
    try {
      if (d.fn === 'setInput') {
        const ta = document.querySelector('#send_textarea');
        if (ta) { ta.value = String(d.arg == null ? '' : d.arg); ta.dispatchEvent(new Event('input', { bubbles: true })); try { ta.focus(); } catch (e2) {} }
      } else if (d.fn === 'triggerSlash') {
        if (typeof window.triggerSlash === 'function') window.triggerSlash(String(d.arg || ''));
        else { const ta = document.querySelector('#send_textarea'); if (ta) { ta.value = String(d.arg || ''); ta.dispatchEvent(new Event('input', { bubbles: true })); } }
      } else if (d.fn === 'toast') { if (typeof toastr !== 'undefined') toastr.info(String(d.arg || '')); }
    } catch (err) {}
  });
  function pvVolume() {
    const v = { bgm: 0.8, se: 0.8 };
    try { const s = JSON.parse(localStorage.getItem(PV_VOL_KEY) || 'null');
      if (s && typeof s === 'object') { if (typeof s.bgm === 'number') v.bgm = Math.max(0, Math.min(1, s.bgm)); if (typeof s.se === 'number') v.se = Math.max(0, Math.min(1, s.se)); } } catch (e) {}
    return v;
  }
  function pvSetVolume(o) {
    const v = pvVolume();
    if (o && o.bgm != null) v.bgm = Math.max(0, Math.min(1, Number(o.bgm)));
    if (o && o.se != null) v.se = Math.max(0, Math.min(1, Number(o.se)));
    try { localStorage.setItem(PV_VOL_KEY, JSON.stringify(v)); } catch (e) {}
    if (_pvBgm) _pvBgm.volume = v.bgm;
    if (_pvSe) _pvSe.volume = v.se;
    return v;
  }
  function pvEl(kind) {
    if (kind === 'se') { if (!_pvSe) { _pvSe = document.createElement('audio'); _pvSe.preload = 'auto'; _pvSe.volume = pvVolume().se; document.body.appendChild(_pvSe); } return _pvSe; }
    if (!_pvBgm) { _pvBgm = document.createElement('audio'); _pvBgm.loop = true; _pvBgm.preload = 'auto'; _pvBgm.volume = pvVolume().bgm; document.body.appendChild(_pvBgm); }
    return _pvBgm;
  }
  function pvBgmState() {
    try { return { name: _pvBgmName, t: _pvBgm ? _pvBgm.currentTime : 0, dur: _pvBgm && isFinite(_pvBgm.duration) ? _pvBgm.duration : 0, paused: _pvBgm ? _pvBgm.paused : true }; } catch (e) { return { t: 0, dur: 0, paused: true }; }
  }
  /* 暂停 / 继续 (音量面板上的按钮): 只停一下, 不丢当前这首
     ★ 老快照里可能被补过不止一份监听 -> 点一下会发两条消息, 这里把 300ms 内的重复丢掉 */
  let _pvPauseAt = 0;
  let _pvUserPaused = false;      // ★ 用户手动暂停过: 刷新预览/重建楼层时别再自动响 (和真机引擎同一套规则)
  function pvToggleBgm() {
    try {
      const _now = Date.now();
      if (_now - _pvPauseAt < 300) return;
      _pvPauseAt = _now;
      if (!_pvBgm || !_pvBgm.src) return;
      if (_pvBgm.paused) { _pvUserPaused = false; _pvBgm.volume = pvVolume().bgm; _pvBgm.play().catch(function () {}); }
      else { _pvUserPaused = true; _pvBgm.pause(); }
    } catch (e) {}
  }
  /* 停止预览里的 BGM (把楼层里那行删掉之后必须停 —— 只靠"重建时对比名字"会被自动补歌绕过去) */
  function pvStopBgm() {
    try {
      if (_pvBgm) { _pvBgm.pause(); try { _pvBgm.currentTime = 0; } catch (e) {} }
      try { if (_pvSe) { _pvSe.pause(); _pvSe.currentTime = 0; } } catch (e) {}   /* 一次性音效也一起停 */
      _pvBgmName = null; _pvUserPaused = false;
    } catch (e) {}
  }
  async function pvPlayBgm(name) {
    if (!name) return;
    const a = (cur.audioList || []).find(function (x) { return (x.mood || x.name) === name; });
    if (!a) return;                                   // 没导入就静默跳过
    const url = a.kind === 'file' ? await entryUrl({ kind: 'file', blobId: a.blobId }) : a.url;
    if (!url) return;
    const el = pvEl('bgm');
    if (_pvBgmName === name && el.src && !el.paused) return;   // 同一首不重播
    if (_pvBgmName === name && el.src && _pvUserPaused) return;   // ★ 用户暂停过同一首: 别自动续播
    if (_pvBgmName !== name) _pvUserPaused = false;               // 换一首 = 恢复自动播放
    _pvBgmName = name; el.src = url; el.volume = pvVolume().bgm;
    try { el.play().catch(function () {}); } catch (e) {}
  }
  async function pvPlaySe(name) {
    if (!name) return;
    const s = (cur.seList || []).find(function (x) { return x.name === name; });
    if (!s) return;
    const url = s.kind === 'file' ? await entryUrl({ kind: 'file', blobId: s.blobId }) : s.url;
    if (!url) return;
    const el = pvEl('se');
    try { el.pause(); el.currentTime = 0; el.src = url; el.volume = pvVolume().se; el.play().catch(function () {}); } catch (e) {}
  }

  /* 字节桥: 把已经取到的字节发给预览 iframe (由它自己造 blob) */
  let _pvRes = [];
  /* ★ 外链取不到的清单: 预览重建时收集, 结束后在预览下面写一行人话提示 (以前是静默的) */
  let _pvMiss = [];
  function missUrl(u, why) {
    try {
      const s = String(u || ''); if (!s) return;
      if (_pvMiss.length > 8 || _pvMiss.some(function (x) { return x.u === s; })) return;
      _pvMiss.push({ u: s, why: String(why || '') });
    } catch (e) {}
  }
  function pushRes() {
    try {
      const f = document.querySelector('iframe.tgm-preview-frame'); if (!f || !f.contentWindow) return;
      const items = _pvRes.filter(function (x) { return x.buf; })
        .map(function (x) { return { token: x.token, type: x.type, buf: x.buf }; });
      if (items.length) f.contentWindow.postMessage({ __gv: 1, type: 'res', items: items }, '*');
    } catch (e) {}
  }

  /* 预览重建入口: 由 renderPages 注册 (refreshPreview 在它的闭包里, 外面拿不到)。
     切方案 / 增删素材之后用它让预览自动跟上, 不用再手动点「刷新预览」 */
  let previewRebuild = null, previewTimer = null;
  function previewSoon(reset) {
    if (!previewRebuild) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => { try { previewRebuild(!!reset); } catch (e) {} }, 300);
  }

  /* ---- 当前方案 ---- */
  let cur = null;
  async function refresh() {
    const list = await listProjects();
    if (cur && cur.id) { await putProjectData(cur); }        // 正在编辑的方案优先, 别被 refresh 顶掉
    let id = cur && cur.id ? cur.id : null;
    if (!id) { try { id = localStorage.getItem(LS_LAST); } catch (e) {} }
    if (!list.length) { cur = await createProject('默认方案'); }
    else if (cur && cur.id === id) { /* ★ 保持当前实例, 不要重新读 —— 否则回调闭包里捕获的 g/b/f 会指向旧对象树, 改动全部丢失 */ }
    else { cur = (id ? await getProjectData(id) : null) || await getProjectData(list[0].id) || await createProject('默认方案'); }
    try { localStorage.setItem(LS_LAST, cur.id); } catch (e) {}
    if (syncKeywordTables(cur)) { try { await putProjectData(cur); } catch (e) {} }   // ★ 关键词表缺名字就补上 (只加不减)
    q('project', renderProject); q('prompt', renderPrompt); q('assets', renderAssets); q('effects', renderEffects); q('pages', renderPages); q('export', renderExport);
    previewSoon(true);      // 换方案 = 预览也要换成这个方案的素材 (以前会留着上一个方案的)
  }

  /* ---- 方案页 ---- */
  function renderProject() {
    const p = UI.panes.project; p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '方案'), el('div', 'tgm-hint', '一个方案 = 一套页面模板 + 一套素材 + 一套提示词。导出时导出的是当前方案。'));
    const bar = el('div', 'tgm-row');
    const bNew = el('div', 'tgm-btn tgm-primary', '新建方案');
    const bCopy = el('div', 'tgm-btn', '复制当前');
    bar.append(bNew, bCopy); p.appendChild(bar);
    bNew.addEventListener('click', async () => { const n = await askText('新建方案', '给这个方案起个名字。', '新方案', '方案名字'); if (n == null) return; cur = await createProject(String(n).trim() || '新方案'); refresh(); });
    bCopy.addEventListener('click', async () => { if (!cur) return; const c = JSON.parse(JSON.stringify(cur)); c.id = newProject('').id; c.name = cur.name + ' 副本'; await putProjectData(c); const l = await listProjects(); l.push({ id: c.id, name: c.name, createdAt: c.createdAt, updatedAt: c.updatedAt }); await saveProjects(l); cur = c; refresh(); });

    const list = el('div', 'tgm-list');
    p.appendChild(list);
    listProjects().then(items => {
      list.innerHTML = '';
      items.forEach(it => {
        const row = el('div', 'tgm-item' + (cur && it.id === cur.id ? ' tgm-on' : ''));
        row.append(el('span', 'tgm-iname', it.name), el('span', 'tgm-imeta', new Date(it.updatedAt || it.createdAt).toLocaleString()));
        const bRen = el('div', 'tgm-btn', '重命名'); const bDel = el('div', 'tgm-btn tgm-danger', '删除');
        row.append(bRen, bDel);
        row.addEventListener('click', async e => { if (e.target === bRen || e.target === bDel) return; cur = await loadProject(it.id); refresh(); });
        bRen.addEventListener('click', async e => { e.stopPropagation(); const n = await askText('重命名方案', '改成什么名字？', it.name, '方案名字'); if (n == null) return; await renameProject(it.id, String(n).trim() || it.name); if (cur && cur.id === it.id) cur.name = String(n).trim() || it.name; refresh(); });
        bDel.addEventListener('click', async e => { e.stopPropagation(); const ok = await askConfirm('删除方案', '「' + it.name + '」和它下面的素材都会被删掉，不能撤销。', true); if (!ok) return; await removeProject(it.id); if (cur && cur.id === it.id) cur = null; refresh(); });
        list.appendChild(row);
      });
    });

    const PRESETS = [
      ['single', '单角色（不需要站位字段）', []],
      ['double', '双角色（left / right）', ['left', 'right']],
      ['triple', '三角色（left / middle / right）', ['left', 'middle', 'right']],
      ['custom', '自定义…', null],
    ];
    const cfg = el('div', 'tgm-card');
    cfg.appendChild(el('div', 'tgm-h2', '立绘站位'));
    cfg.appendChild(el('div', 'tgm-hint', '一个界面里最多能出现几个角色立绘。选了几个，AI 就要在每行最后多写一个站位字段。'));
    const r = el('div', 'tgm-row'); r.appendChild(el('label', '', '预设'));
    const sel = el('select', 'tgm-sel');
    PRESETS.forEach(([v, t]) => { const o = el('option', '', t); o.value = v; sel.appendChild(o); });
    sel.value = cur.slotsPreset || 'single';
    r.appendChild(sel); cfg.appendChild(r);

    const r2 = el('div', 'tgm-row'); r2.appendChild(el('label', '', '站位词'));
    const inp = el('input', 'tgm-in'); inp.type = 'text';
    inp.placeholder = '用逗号分隔，例：left,middle,right';
    inp.value = (cur.slots || []).join(',');
    r2.appendChild(inp); cfg.appendChild(r2);
    const r3 = el('div', 'tgm-row'); r3.appendChild(el('label', '', ''));
    const prev = el('span', 'tgm-hint', '');
    r3.appendChild(prev); cfg.appendChild(r3);
    function syncSlots() {
      const isCustom = sel.value === 'custom';
      r2.style.display = isCustom ? '' : 'none';
      prev.textContent = '当前：' + (cur.slots && cur.slots.length
        ? '每行最后多写一个站位，可选 ' + cur.slots.join(' / ')
        : '单角色，不需要站位字段');
    }
    sel.addEventListener('change', async () => {
      const hit = PRESETS.find(x => x[0] === sel.value);
      cur.slotsPreset = sel.value;
      if (hit && hit[2]) cur.slots = hit[2].slice();
      else if (sel.value !== 'custom') cur.slots = [];
      if (sel.value !== 'custom') inp.value = (cur.slots || []).join(',');
      await putProjectData(cur); syncSlots(); renderPrompt();
    });
    inp.addEventListener('input', async () => {
      cur.slotsPreset = 'custom';
      cur.slots = inp.value.split(/[,，、s]+/).map(x => x.trim().toLowerCase()).filter(Boolean);
      await putProjectData(cur); syncSlots(); renderPrompt();
    });
    const r4 = el('div', 'tgm-row'); r4.appendChild(el('label', '', ''));
    const bEdit = el('div', 'tgm-btn tgm-primary', '编辑站位（拖动）');
    r4.appendChild(bEdit); cfg.appendChild(r4);
    bEdit.addEventListener('click', async () => {
      const r = await slotEditor(cur);
      if (!r) return;
      cur.slotPos = r.pos; cur.slotPreview = r.preview;
      await putProjectData(cur); syncSlots(); flash2('站位已保存 ✓');
    });
    function flash2(t) { prev.textContent = t; setTimeout(syncSlots, 1600); }
    p.appendChild(cfg);
    syncSlots();
  }

  /* ---- 提示词页 ---- */
  function renderPrompt() {
    const p = UI.panes.prompt; if (!p || !cur) return;
    p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '格式提示词（4A）'), el('div', 'tgm-hint', '这段会注入到发给 AI 的请求里。留空 = 用下面自动生成的默认版本；改了就以你的为准。导出脚本时，这段会直接写进脚本。'));
    const base = promptBase(cur);
    const stale = !!(cur.prompt && cur.prompt.trim()) && cur.promptBaseHash && cur.promptBaseHash !== hs(base);
    if (stale) {
      const warn = el('div', 'tgm-warn');
      warn.append(el('span', '', '素材变了，你保存的提示词里还是旧素材名。'));
      const bSync = el('div', 'tgm-btn tgm-primary', '用新素材重新生成');
      warn.appendChild(bSync);
      p.appendChild(warn);
      bSync.addEventListener('click', async () => { cur.prompt = ''; cur.promptBaseHash = ''; await putProjectData(cur); renderPrompt(); });
    }
    const card = el('div', 'tgm-card');
    const ta = el('textarea', 'tgm-ta');
    ta.value = buildPrompt(cur);
    ta.addEventListener('input', () => { cur.prompt = (ta.value.trim() === base.trim()) ? '' : ta.value; });
    card.appendChild(ta);
    const bar = el('div', 'tgm-row');
    const bSave = el('div', 'tgm-btn tgm-primary', '保存');
    const bReset = el('div', 'tgm-btn', '恢复默认');
    const bCopy = el('div', 'tgm-btn', '复制');
    const st = el('span', 'tgm-status', '');
    bar.append(bSave, bReset, bCopy, st); card.appendChild(bar);
    const flash = t => { st.textContent = t; setTimeout(() => { if (st.textContent === t) st.textContent = ''; }, 1800); };
    bSave.addEventListener('click', async () => {
      cur.prompt = (ta.value.trim() === base.trim()) ? '' : ta.value;
      cur.promptBaseHash = hs(base);                 // 记下当时的自动版, 以后素材变了好提示
      await putProjectData(cur); flash(cur.prompt ? '已保存（以你的为准）' : '与自动版一致');
    });
    bReset.addEventListener('click', async () => { cur.prompt = ''; cur.promptBaseHash = ''; await putProjectData(cur); renderPrompt(); flash('已恢复自动生成'); });
    bCopy.addEventListener('click', () => { navigator.clipboard.writeText(ta.value).then(() => flash('已复制 ✓'), () => flash('复制失败')); });
    p.appendChild(card);
  }



  /* ---- 页面排版页: 三层 HTML/CSS/JS 可替换 ---- */
  const TPL_BRIDGE = [
    '(function(){',
    '  var ctx={kind:"",lines:[],bg:null,cast:[],backgrounds:{},faces:{},bubbles:{},bubblePos:{},slots:[],slotPos:{},name:"",text:"",avatar:"",size:{},ready:false,_h:{}};',
    '  ctx._post=function(t,a){try{parent.postMessage({__gv:1,type:t,arg:a},"*")}catch(e){}};',
    '  ctx.setBg=function(k){this._post("setBg",k)};ctx.say=function(i){this._post("say",i)};',
    '  ctx.next=function(){this._post("next")};ctx.prev=function(){this._post("prev")};',
    '  ctx.fx=function(n){this._post("fx",n)};ctx.bubble=function(n){this._post("bubble",n)};',
    '  ctx.setSize=function(w,h){this._post("setSize",{w:w,h:h})};',
    '  ctx.on=function(e,f){(this._h[e]=this._h[e]||[]).push(f)};',
    '  ctx.log=function(){var a=[].slice.call(arguments).map(String);try{console.log.apply(console,a)}catch(e){}this._post("log",a)};',
    '  function fire(e,a){(ctx._h[e]||[]).forEach(function(f){try{f(a)}catch(x){ctx._post("error",String(x&&x.message||x))}})}',
    '  function fit(){try{ctx._post("resize",Math.max(24,document.documentElement.scrollHeight))}catch(e){}}',
    '  window.ctx=ctx;',
    '  window.addEventListener("error",function(e){ctx._post("error",String(e.message))});',
    '  window.addEventListener("message",function(e){var d=e.data;if(!d||d.__gv!==1)return;',
    '    if(d.type==="init"){var __p=d.payload||d.arg||{};for(var k in __p)ctx[k]=__p[k];ctx.ready=true;fire("init",ctx);fit()}',
    '    else if(d.type==="line"){ctx.index=d.arg;fire("line",d.arg)}',
'    else if(d.type==="res"){try{(function(items){var map={};for(var i=0;i<items.length;i++){var it=items[i];try{map[it.token]=URL.createObjectURL(new Blob([it.buf],{type:it.type||"application/octet-stream"}))}catch(e){}}window.__gvRes=map;',
'      function rep(v){var o=String(v==null?"":v);for(var k in map)o=o.split(k).join(map[k]);return o}',
'      var st=document.querySelectorAll("style");for(var a=0;a<st.length;a++)st[a].textContent=rep(st[a].textContent);',
'      var els=document.querySelectorAll("[src],[href],[style]");for(var b=0;b<els.length;b++){var e=els[b];',
'        ["src","href"].forEach(function(at){try{if(e.hasAttribute(at)){var v=e.getAttribute(at);if(v&&map[v]){if(e.tagName==="SCRIPT"){var ns=document.createElement("script");for(var q=0;q<e.attributes.length;q++){ns.setAttribute(e.attributes[q].name,e.attributes[q].value)}ns.setAttribute(at,map[v]);document.head.appendChild(ns);e.parentNode&&e.parentNode.removeChild(e);}else e.setAttribute(at,map[v])}else if(v&&v.indexOf("__gv")>=0)e.setAttribute(at,rep(v))}}catch(x){}});',
'        try{var s2=e.getAttribute("style");if(s2&&s2.indexOf("__gvres")>=0)e.setAttribute("style",rep(s2))}catch(x){}}',
'    })(d.items||[])}catch(e){ctx._post("error","res:"+e.message)}}',
    '    else{fire(d.type,d.arg)}});',
    '  window.addEventListener("load",function(){fit();setTimeout(fit,120);setTimeout(fit,700)});',
    '  try{new ResizeObserver(fit).observe(document.documentElement)}catch(e){}',
    '  ctx._post("ready");',
    '})();'
  ].join('\n');
  const TPL_BASE = '*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0}' +
    'body{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif}img{display:block;max-width:100%}';

  /* ★ 外链库支持 (和酒馆助手一个思路: 把库搬进沙箱): FA 全量图标字体内联在 /galgame/fa-inline.css,
     取一次缓存起来注进每个预览 iframe —— 模板里写 <i class="fa-solid fa-heart"> 就能直接显示 */
  let _faCss = null;
  async function libsCss() {
    if (_faCss != null) return _faCss;
    _faCss = '';
    const list = ['/galgame/fa-inline.css', '/galgame/libs/highlight.css', '/galgame/libs/animate.css'];
    for (let i = 0; i < list.length; i++) {
      try { const r = await fetch(list[i]); if (r.ok) _faCss += '\n' + await r.text(); } catch (e) {}
    }
    return _faCss;
  }
  /* ★ 自适应缩放: 容器比设计宽度(400)窄就整块 transform: scale 缩小, 宽了就按原尺寸。
     宿主直接注入沙箱 —— 老快照 / 别人写的模板也自动有 (模板自己写了也不冲突, 算出来的比例一样) */
  const GV_FIT = '<script data-gv-fit="1">(function(){try{if(window.__gvFit)return;window.__gvFit=1;var DW=400;try{document.documentElement.style.overflowX="hidden";}catch(e){}function f(){try{var a=document.documentElement.clientWidth||0;var s=(a>0)?Math.min(1,a/DW):1;var r=document.querySelector(".gv-root");if(!r)return;r.style.setProperty("--gv-scale",String(s));var p=document.getElementById("phone");if(p){p.style.width=s<1?(DW+"px"):"";p.style.maxWidth=s<1?"none":"";p.style.flex=s<1?"0 0 auto":"";}try{document.documentElement.style.overflow=s<1?"hidden":"";}catch(e2){}var q=p?p.getBoundingClientRect():null;if(q&&q.width>40){parent.postMessage({__gv:1,type:"frameSize",arg:{w:Math.round(a),h:Math.round(q.height)}},"*");parent.postMessage({__gv:1,type:"resize",arg:Math.round(q.height)},"*");}}catch(e){}}var ph=document.getElementById("phone");if(window.ResizeObserver&&ph)new ResizeObserver(f).observe(ph);window.addEventListener("load",function(){setTimeout(f,300);setTimeout(f,1000)});f();}catch(e){}})();<\/script>';
  function previewSrcdoc(t, libs) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + TPL_BASE + '\n' + String(t.css || '') + '</style>' + (libs ? '<style data-gv-libs="1">' + libs + '</style>' : '') + '</head><body>' +
      String(t.html || '') + GV_FIT + '<script>' + TPL_BRIDGE + '<\/script><script>\ntry{\n' + String(t.js || '') + '\n}catch(e){ ctx._post("error", String(e && e.message || e)); }\n<\/script></body></html>';
  }
  /* ---- 预览用的虚拟楼层: 预览里点「编辑」改的就是它, 不动真实聊天 ---- */
  /* 内置演示台词 (有音频/无音频两套默认都从它长出来) */
  const VFLOOR_DEMO = [
    /* 预览台词: 带 | 的按脚本格式解析(角色名|表情|台词|效果), 不带 | 的直接当旁白。
       {{角色}}/{{表情}}/{{表情2}} 会换成「演示角色」选中的那个角色 ✅ 你可以直接改成自己的名字 */
    '旁白||十二月的第一场雪落下来的时候，书店的暖气片正发出很轻的响。|',
    '{{角色}}|{{表情}}|……我猜你今天会来。所以，多留了一盏灯。|',
    '{{角色}}|{{表情2}}|靠窗那个位置，我一直给你留着。|bubble:love',
    '{{user}}|外面雪好大，我一路踩过来，鞋都湿透了。',
  ];
  /* ★ 有音频 / 无音频 = 【两套编辑内容】, 分开存 (byMode):
       有音频: 默认内容顶上写 【bgm:第一首】, 末尾写 【se:第一个音效】 —— 名字跟着素材走
       无音频: 默认内容一个音频字都不出现 (纯台词) */
  const vFloor = {
    user: { name: '', text: '外面雪好大，我一路踩过来，鞋都湿透了。' },
    char: { lines: [], byMode: {} },
  };
  function vfMode() { return (cur && cur.audioMode === 'without') ? 'without' : 'with'; }
  function vfDemo(m) {
    const out = VFLOOR_DEMO.slice();
    if (m !== 'without') {
      const b = (cur && (cur.audioList || [])[0]) ? ((cur.audioList[0].mood) || cur.audioList[0].name) : '';
      const s = (cur && (cur.seList || [])[0]) ? cur.seList[0].name : '';
      if (b) out.unshift('【bgm:' + b + '】');
      if (s) out.push('【se:' + s + '】');
    }
    return out;
  }
  function vfSlot(m) {
    const k = (m === 'without' || m === 'with') ? m : vfMode();   // ★ 不传 = 当前这套 (以前写死成了 with)
    vFloor.char.byMode = vFloor.char.byMode || {};
    const s = vFloor.char.byMode[k] || (vFloor.char.byMode[k] = { lines: null, dirty: false });
    /* 你没改过 -> 每次按当前素材现算 (所以素材页导入了新素材, 这边默认内容自己就带上了) */
    if (!s.lines || !s.dirty) s.lines = vfDemo(k);
    return s;
  }
  function vfLines(m) { const s = vfSlot(m); vFloor.char.lines = s.lines; return s.lines; }
  function vfSetLines(m, rows) { const s = vfSlot(m); s.lines = rows; s.dirty = true; vFloor.char.lines = s.lines; saveVFloor(); }
  /* 虚拟楼层的台词/正文: 存 localStorage —— 以前只存在内存里, 一刷新就回到内置演示台词,
     于是"我改完它又变回去了" (不是被谁改的, 是根本没存下来) */
  const VFLOOR_KEY = 'gv_vfloor_v1';
  function saveVFloor() {
    try {
      const w = vFloor.char.byMode.with || {}, wo = vFloor.char.byMode.without || {};
      localStorage.setItem(VFLOOR_KEY, JSON.stringify({
        mode: vfMode(),
        with: { lines: w.lines || null, dirty: !!w.dirty },
        without: { lines: wo.lines || null, dirty: !!wo.dirty },
        lines: vFloor.char.lines,            // 兼容: 旧版本只认这一个
        userText: vFloor.user.text,
      }));
    } catch (e) {}
  }
  function loadVFloor() {
    try {
      const s = JSON.parse(localStorage.getItem(VFLOOR_KEY) || 'null');
      if (s && typeof s.userText === 'string' && s.userText) vFloor.user.text = s.userText;
      const take = v => (v && Object.prototype.toString.call(v.lines) === '[object Array]' && v.lines.length) ? { lines: v.lines.map(String), dirty: !!v.dirty } : null;
      const w = take(s && s.with), wo = take(s && s.without);
      if (w) vFloor.char.byMode.with = w;
      if (wo) vFloor.char.byMode.without = wo;
      /* 旧存档 (只有一个 lines): 当成"有音频"那套, 并且算你改过 —— 不能丢你写过的台词 */
      if (!w && !wo && s && Object.prototype.toString.call(s.lines) === '[object Array]' && s.lines.length) {
        vFloor.char.byMode.with = { lines: s.lines.map(String), dirty: true };
      }
    } catch (e) {}
  }

  loadVFloor();      // ★ 启动就把你上次改的虚拟楼层读回来 (以前漏了这一步, 等于白存)

  /* ★ 「同步 BGM 名」只在你于【素材】页动手的时候做一次 (导入 / 添加 / 改名 / 删除 BGM):
       楼层里没写 BGM -> 把第一首补进去; 写的那首在素材里已经没了 -> 换成现在这第一首。
     平常刷新预览、改台词、改页面都不碰它 —— 所以你把 【bgm:】 那行删掉之后, 它就一直不放,
     直到你自己再去素材页动一次 (那才是"同步一遍")。 */
  function syncFloorBgm(renamed) {
    try {
      const list = (cur && cur.audioList) || [];
      const first = list.length ? (list[0].mood || list[0].name) : '';
      const lines = vfLines('with');            // 同步只针对【有音频】那套 (无音频那套里不该出现音频名)
      const isBgm = l => /【\s*bgm\s*[:：]/i.test(l);
      /* 改名: 楼层里写的就是被你改的那首 -> 只把那行改成新名字 (不要跳到第一首去) */
      if (renamed && renamed.from && renamed.to && renamed.from !== renamed.to) {
        const hit = lines.filter(isBgm).some(l => l.indexOf(renamed.from) >= 0);
        if (hit) { vfSetLines('with', lines.map(l => isBgm(l) && l.indexOf(renamed.from) >= 0 ? '【bgm:' + renamed.to + '】' : l)); previewSoon(false); }
        return;      // ★ 只是改个名字: 楼层里写过的才跟着改, 没写就不替它加 (不然你改个名它凭空多一行)
      }
      const has = lines.some(isBgm);
      if (!first) {
        if (has) { vfSetLines('with', lines.filter(l => !isBgm(l))); previewSoon(false); }
        return;
      }
      if (!has) { vfSetLines('with', ['【bgm:' + first + '】'].concat(lines)); previewSoon(false); return; }
      const now = (lines.find(isBgm).match(/【\s*bgm\s*[:：]\s*([^】]*)/i) || [])[1];
      const alive = list.some(a => (a.mood || a.name) === String(now || '').trim());
      if (!alive) { vfSetLines('with', lines.map(l => isBgm(l) ? '【bgm:' + first + '】' : l)); previewSoon(false); }
    } catch (e) {}
  }

  /* 预览里的"虚拟酒馆楼层": 上移/下移/删除/头像开关都作用在它身上, 刷新预览就复位 */
  const vChat = {
    order: ['user', 'char'],           // 楼层顺序 (u 在上 / char 在下)
    deleted: { user: false, char: false },
    showUA: true,
    panel: [
      { id: 0, name: '裴砚舟', raw: '【状态栏】时间：深夜 23:40　地点：昼短旧书店　天气：雪\n好感度：■■■■□ 42%　体力：■■■□□ 61%\n【当前任务】把上次翻过的那本书放回桌上。\n【备注】他今天第三次擦同一个杯子了。',
        html: '<b>【状态栏】</b>时间：深夜 23:40　地点：昼短旧书店　天气：雪<br>好感度：■■■■□ 42%　体力：■■■□□ 61%<br><b>【当前任务】</b>把上次翻过的那本书放回桌上。<br><b>【备注】</b>他今天第三次擦同一个杯子了。', story: true },
      { id: 1, name: '旁白', raw: '暖气片咔地响了一下。窗外的雪比刚才更密，路灯把雪照成一团一团的黄。\n柜台上那罐姜糖少了两颗。',
        html: '暖气片咔地响了一下。窗外的雪比刚才更密，路灯把雪照成一团一团的黄。<br>柜台上那罐姜糖少了两颗。', story: false },
    ],
  };
  let vPanelOffset = null;      // 预览里悬浮窗被拖到哪 (重画时还原, 刷新预览清零)
  function resetVChat() {
    vPanelOffset = null;
    vChat.order = ['user', 'char'];
    vChat.deleted = { user: false, char: false };
    vChat.showUA = true;
    vChat.panel = [
      { id: 0, name: '裴砚舟', raw: '【状态栏】时间：深夜 23:40　地点：昼短旧书店　天气：雪\n好感度：■■■■□ 42%　体力：■■■□□ 61%\n【当前任务】把上次翻过的那本书放回桌上。\n【备注】他今天第三次擦同一个杯子了。',
        html: '<b>【状态栏】</b>时间：深夜 23:40　地点：昼短旧书店　天气：雪<br>好感度：■■■■□ 42%　体力：■■■□□ 61%<br><b>【当前任务】</b>把上次翻过的那本书放回桌上。<br><b>【备注】</b>他今天第三次擦同一个杯子了。', story: true },
      { id: 1, name: '旁白', raw: '暖气片咔地响了一下。窗外的雪比刚才更密，路灯把雪照成一团一团的黄。\n柜台上那罐姜糖少了两颗。',
        html: '暖气片咔地响了一下。窗外的雪比刚才更密，路灯把雪照成一团一团的黄。<br>柜台上那罐姜糖少了两颗。', story: false },
      /* ★ 演示一条【带围栏的附加内容】: 预览里直接看出富渲染 (html 围栏 -> 活 iframe, 里面的脚本照跑) */
      (function(){
        var NL = String.fromCharCode(10), FENCE = String.fromCharCode(96, 96, 96);
        var card = [
          '<div id="gv-demo-sum" style="cursor:pointer;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.25);font-size:13px;line-height:1.7">',
          '📜摘要📜 <b>会朝历三百零七年 · 三月十五</b>',
          '<div class="gv-demo-body" style="display:none;margin-top:6px;opacity:.85">辰时三刻至巳时二刻。宫里来人传话，说太后今日心情好。</div>',
          '<div style="margin-top:6px;font-size:12px;opacity:.6">（点一下这行字，它会展开 —— 预览里也该能点）</div>',
          '</div>',
          '<script>document.getElementById("gv-demo-sum").addEventListener("click", function(){ var b=this.querySelector(".gv-demo-body"); b.style.display = (b.style.display === "none" ? "block" : "none"); this.setAttribute("data-clicked", "1"); });<\/script>',
        ].join(NL);
        var src = '【摘要】会朝历三百零七年 · 三月十五' + NL + FENCE + 'html' + NL + card + NL + FENCE;
        return { id: 2, name: '旁白', raw: src, html: src, story: false };
      })(),
    ];
  }
  async function openPreviewEditor(kind) {
    if (kind === 'user') {
      const v = vFloor.user;
      const nIn = el('input', 'tgm-in'); nIn.type = 'text'; nIn.value = v.name || '';
      nIn.placeholder = '楼层名（留空 = 酒馆用户名）';
      const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.style.minHeight = '120px'; ta.value = v.text || '';
      const box = el('div');
      box.append(el('div', 'tgm-hint', '名字'), nIn, el('div', 'tgm-hint', '正文'), ta);
      const ok = await dialog({
        title: '编辑 User 楼层（预览）',
        text: '预览里点「编辑」弹的就是这个框 —— 改的是预览用的虚拟楼层，不会动真实聊天。',
        extra: box, okText: '保存',
      });
      if (!ok) return false;
      v.name = nIn.value.trim(); v.text = ta.value;
      return true;
    }
    if (kind === 'char') {
      const v = vFloor.char;
      const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.style.minHeight = '140px';
      ta.value = (v.lines || []).join('\n');
      const box = el('div');
      box.append(el('div', 'tgm-hint', '一行一句，**怎么写就怎么演**：带竖线的按脚本格式（角色名|表情|台词|效果，也可以只写 角色名|台词），不带竖线的直接当旁白；{{角色}}/{{表情}}/{{表情2}} 会自动换成「演示角色」的名字和两张立绘。改完保存，预览立刻刷新。'), ta);
      const ok = await dialog({
        title: '编辑 Char 楼层（预览）',
        text: '预览里点「编辑」弹的就是这个框 —— 改的是预览用的虚拟楼层，不会动真实聊天。',
        extra: box, okText: '保存',
      });
      if (!ok) return false;
      v.lines = ta.value.split('\n').map(s => s.trim()).filter(Boolean);
      if (!v.lines.length) v.lines = [''];
      return true;
    }
    return false;
  }
  /* ★ 多站位选角: { 站位: 角色组id } (cur.demoCast) -> [{slot, group}]。单人模式返回空数组 (= 走老那一套) */
  function demoCastList() {
    const slots = (cur.slots || []).filter(Boolean);
    if (slots.length < 2) return [];
    const groups = (cur.spriteGroups || []).filter(function (gr) { return (gr.faces || []).length; });
    const map = cur.demoCast || {};
    const out = [];
    slots.forEach(function (s) { const gr = groups.find(function (x) { return x.id === map[s]; }); if (gr) out.push({ slot: s, group: gr }); });
    return out;
  }
  async function demoPayload(kind) {
    const bg = (cur.bgList || [])[0];
    /* 演示用哪个角色: 优先「演示角色」里选的那个, 没选就用第一个有立绘的组 */
    const _byGroup = (cur.spriteGroups || []).filter(function (gr) { return (gr.faces || []).length; });
    /* ★ 多人模式: 每个站位各一个角色, 台词沿用旧的那套, 只换"这句是谁说的" */
    const _cast = (kind === 'char') ? demoCastList() : [];
    const _castGrp = {};
    _cast.forEach(function (c) { _castGrp[c.group.id] = 1; });
    const g = _byGroup.find(function (gr) { return gr.id === cur.previewGroup; }) || (_cast[0] ? _cast[0].group : null) || _byGroup[0] || null;
    /* ★ 先扫一遍【这一屏真正会用到】的素材名 (和贴纸那条一个思路):
       以前这里把【所有】背景 + 所有立绘原尺寸内联进 payload —— 10 张 10MB 的背景就是 130MB 字符串,
       每次刷新预览还要克隆一遍, 素材一多必然卡死/白屏。现在只带用到的, 而且先降采样 (previewSmall) */
    const _bgUsed = {}, _faceUsed = {};
    (vChat.deleted.char ? [] : vfLines()).forEach(function (t) {
      const s = String(t == null ? '' : t).trim();
      const mb = /^[【\[]\s*(?:bg|背景|scene)\s*[:：]?\s*([^】\]]+?)\s*[】\]]\s*$/i.exec(s);
      if (mb) _bgUsed[String(mb[1]).trim()] = 1;
      if (s.indexOf('|') < 0) return;
      const seg = s.split('|');
      const n2 = String(seg[0] || '').trim(), f2 = String(seg[1] || '').trim();
      if (n2 && f2) _faceUsed[n2 + '|' + f2] = 1;
    });
    const backgrounds = {};
    /* 方案里没有背景就真的空着 (预览全黑) —— 不塞内置示例图, 更不能拿别的方案的图顶上 */
    const _bgList = (cur.bgList || []);
    if (_bgList[0]) _bgUsed[_bgList[0].name] = 1;      // 一句 【bg:】 都没写时, 拿第一张兜底
    for (const _b of _bgList) {
      if (!_bgUsed[_b.name]) continue;
      try { const _u = await previewSmall(_b, 1000); if (_u) backgrounds[_b.name] = { url: _u, fit: _b.fit || null }; } catch (e) {}
    }
    /* 映射表里放: 台词点名的脸 + 演示角色这一组全部 + 其它每组第一张 (别的角色说话时至少有张脸); 裸名字兜底先到先得 */
    const faces = {};
    for (const gr of (cur.spriteGroups || [])) {
      /* 没单独调过取景的立绘, 继承这一组的【定位图】的取景 (和素材页那套 f.fit || anchor.fit 一致),
         否则换第二张脸时位置会跳回默认 —— 之前预览/卡里都漏了这一步 */
      const _anchor = (gr.faces || []).find(function (x) { return x.id === gr.anchorFace; }) || (gr.faces || [])[0] || null;
      const _anchorFit = (_anchor && _anchor.fit) ? _anchor.fit : null;
      const _fl = (gr.faces || []);
      for (let _i = 0; _i < _fl.length; _i++) {
        const f = _fl[_i];
        const _need = (gr === g) || (_i === 0) || _castGrp[gr.id] || _faceUsed[gr.name + '|' + f.key];   // ★ 参演角色的脸全带上
        if (!_need) continue;
        const fe = { url: await previewSmall(f, 800), fit: f.fit || _anchorFit };   // ★ 预览也要带取景
        faces[gr.name + '|' + f.key] = fe;
        if (!faces[f.key]) faces[f.key] = fe;      // 裸名字兜底 (和卡里 applyPack 一样), 否则会掉进哈希随机
      }
    }
    /* 预览的 iframe 是 sandbox(独立源): http 图片一律加载不了(onerror) -> 气泡贴纸也必须先转成 data:,
       否则 AI 写 bubble:love 时预览里【什么都不弹】(这就是"改了提示词却看不到气泡"的原因)。
       只转【这几行真正用到的】+ 默认两张: 20 张全转有 7.9MB, 每次刷新预览都塞进 srcdoc 太重 */
    const bubbles = {};
    const _visBub = stickerList(cur);
    const _usedBub = {};
    _visBub.slice(0, 2).forEach(function (s) { _usedBub[s[0]] = 1; });    // 默认留两张看得见的, 方便随手试
    (vChat.deleted.char ? [] : vfLines()).forEach(function (t) {
      String(t == null ? '' : t).replace(/(?:bubble|气泡)[:：]([^|,，、+\s]+)/g, function (m, n) { _usedBub[n] = 1; return m; });
    });
    Object.keys(cur.bubbleAnim || {}).forEach(function (n) { _usedBub[n] = 1; });
    for (const _bn of Object.keys(_usedBub)) {
      const _bi = _visBub.find(function (s) { return s[0] === _bn; });
      if (_bi) bubbles[_bn] = await previewSmall(await previewRemoteUrl(stickerUrl(_bn)), 320);
      else {
        const _im = (cur.stickers || []).find(function (s) { return s.name === _bn; });
        if (_im) bubbles[_bn] = await previewSmall(await previewRemoteUrl(_im.url || ''), 320);
      }
    }
    const nm = g ? g.name : '角色';
    /* 演示台词: 同一个角色的两张立绘 —— 第 1 句用第 1 张, 第 3 句用第 2 张 (只有一张就都用它)。
       名字完全跟着你导入的立绘走 (叫 ABCD 就用 ABCD), 不写死 平静/微笑 */
    const allFaces = [];
    (cur.spriteGroups || []).forEach(function (gr) { (gr.faces || []).forEach(function (fc) { allFaces.push({ g: gr, f: fc }); }); });
    const _pickA = g && g.faces[0] ? { g: g, f: g.faces[0] } : null;
    const _pickB = g && g.faces[1] ? { g: g, f: g.faces[1] } : _pickA;
    const _dialogue = { name: _pickA ? _pickA.g.name : nm, face: _pickA ? _pickA.f.key : '' };
    const _dialogue2 = { name: _pickB ? _pickB.g.name : _dialogue.name, face: _pickB ? _pickB.f.key : _dialogue.face };
    /* ★ 虚拟楼层的每一行: 标签行(【bg:】/【bgm:】/【se:】)当事件, 不当台词 ——
       以前 【bgm:xxx】 会被当成"不带竖线的裸句子"塞进旁白, 你在编辑器里写的 BGM 就跑到旁白里去了 ❌ */
    const _bgmAt = [], _seAt = [], _bgAt = [], _bgTag = { v: null };
    let _ln = 0;          // ★ 不能用 _lines.length: const 在 map 里还没初始化(TDZ), 会直接把整段解析打断
    const _lines = (vChat.deleted.char ? [] : vfLines()).map(function (t, i) {
      /* ★ 用户在楼层里手写的东西最有话语权:
         _tpl = 这行用了 {{角色}} 占位 (说话人交给"演示角色"决定) ; _exp = 这行自己写了站位字段 */
      var _tpl = /\{\{\s*角色\s*\}\}/.test(String(t == null ? '' : t));
      var raw = String(t == null ? '' : t)
        .replace(/\{\{\s*角色\s*\}\}/g, _dialogue.name || '')
        .replace(/\{\{\s*表情2\s*\}\}/g, _dialogue2.face || _dialogue.face || '')
        .replace(/\{\{\s*表情\s*\}\}/g, _dialogue.face || '');
      /* ★ 长的放前面: bg 会抢先匹配掉 bgm → 【bgm:x】 被当成 bg(m:x) ❌ */
      var tag = /^[【\[]\s*(bgm|音乐|se|音效|bg|背景|scene)\s*[:：]?\s*([^】\]]+?)\s*[】\]]\s*$/i.exec(raw.trim());
      if (tag) {
        var tk = tag[1].toLowerCase(), tv = String(tag[2] || '').trim();
        if (tk === 'bg' || tk === '背景' || tk === 'scene') { if (_bgTag.v == null) _bgTag.v = tv; _bgAt.push({ at: _ln, name: tv }); return null; }   // ★ 按行换背景: 每条都记下来
        if (tk === 'bgm' || tk === '音乐') { _bgmAt.push({ at: _ln, name: tv }); return null; }
        if (tk === 'se' || tk === '音效') { _seAt.push({ at: _ln, name: tv }); return null; }
      }
      if (raw.indexOf('|') >= 0) {
        var seg = raw.split('|');
        var nm2 = String(seg[0] || '').trim();
        var fc2 = String(seg[1] || '').trim();
        var tx2, fx2, se2 = '', slot2 = '';
        if (seg.length >= 3) {
          tx2 = String(seg[2] == null ? '' : seg[2]); fx2 = String(seg[3] == null ? '' : seg[3]).trim();
          /* 后面还有字段: 站位 / 音效 (顺序: …|演出效果|站位|音效) */
          var rest = seg.slice(4).map(function (x) { return String(x == null ? '' : x).trim(); }).filter(Boolean);
          rest.forEach(function (x) {
            var bare = x.replace(/^(se|音效)\s*[:：]\s*/i, '');
            if (bare !== x || ((cur.seList || []).some(function (s) { return s.name === x; }))) se2 = bare;
            else if ((cur.slots || []).indexOf(x.toLowerCase()) >= 0) slot2 = x.toLowerCase();
          });
        } else { tx2 = fc2; fc2 = ''; fx2 = ''; }          // 只写"角色|台词"也行
        /* 旁白|文字| (第 3 段空着) / 旁白| (只有名字) -> 别把文字丢了, 更别显示成空台词 */
        if (!String(tx2 == null ? '' : tx2).trim() && fc2 && (!nm2 || nm2 === '旁白')) { tx2 = fc2; fc2 = ''; }
        _ln++;
        return {
          name: nm2 || '旁白',
          face: nm2 ? fc2 : '',
          text: tx2,
          fx: fx2,
          se: se2,
          slot: slot2 || (nm2 ? ((cur.slots || [])[0] || '') : ''),
          exp: !!slot2,          // ★ 站位是用户自己写的
          tpl: _tpl,             // ★ 角色名来自 {{角色}} 占位
          isNarr: !nm2,
        };
      }
      _ln++;
      return { name: '旁白', face: '', text: raw, fx: '', se: '', slot: '', exp: false, tpl: false, isNarr: true };
    }).filter(Boolean);
    /* ★ 多站位: 把每句台词的说话人轮着分给参演角色 (从「谁在说话」选的那个站位开始), 台词本身一个字不改。
       表情在各自角色自己的立绘里按句序轮换; 观众看到的就是 A 说话时 B 的立绘按下去、切一下反过来 */
    if (_cast.length) {
      const _bySlot = {}; _cast.forEach(function (c) { _bySlot[c.slot] = c; });
      const _slotOrder = _cast.map(function (c) { return c.slot; });
      let _start = _slotOrder.indexOf(cur.demoSpeaker); if (_start < 0) _start = 0;
      const _fk = function (c, i) { const fs = (c.group.faces || []); return ((fs[i % Math.max(1, fs.length)] || {}).key) || ''; };
      let _k = 0;
      _lines.forEach(function (l) {
        if (l.isNarr || !l.name) return;                       // 旁白不动
        /* ★ 用户自己写了站位 -> 就按那个站位的人来演 (不参与轮换) */
        if (l.exp) {
          if (!l.tpl) return;                                  // 名字和站位都是手写的 -> 完全不动
          const c = _bySlot[l.slot];                           // {{角色}} + 手写站位 -> 用"站在那个站位的人"来演
          if (c) { l.name = c.group.name; const k2 = _fk(c, 0); if (k2) l.face = k2; }
          return;
        }
        /* ★ 手写了角色名、又没写站位 -> 一个字都不动 (只有 {{角色}} 占位才交给"演示角色"决定) */
        if (!l.tpl) return;
        const c = _cast[(_start + _k) % _cast.length];
        const k3 = _fk(c, Math.floor(_k / _cast.length));
        l.name = c.group.name;
        l.slot = c.slot;
        if (k3) l.face = k3;
        _k++;
      });
    }
    /* 和背景一个道理: 你楼层里没写 【bgm:】 就自动用导入的第一首 (只影响播放, 不动你写的文本) */
    /* ★ 这里【不再】自动补第一首 BGM: 楼层里没写就不放 —— 同步只在素材页改动时做一次 (syncFloorBgm) */
    return {
      kind: kind, bg: _bgTag.v || Object.keys(backgrounds)[0], bgBlack: !bg,   // 没背景 -> 预览纯黑, 不放示例素材

      frameSize: (cur.frameSize && cur.frameSize.w && cur.frameSize.h) ? { w: cur.frameSize.w, h: cur.frameSize.h } : { w: 400, h: 867 },
      /* ★ 编辑器里【看到的就是同步后的真名字】:
         {{角色}}/{{表情}} 换成素材那边真实的角色组名和表情名, 并且把"第一个背景 / 第一首 BGM"也写成两行放进来。
         注意: 这只是一次【显示】(每次打开/刷新都按当前素材重新算); 你没点保存, 存档里的文本一字不动。 */
      rawText: (function () {
        const out = [];
        const bgName = _bgTag.v || Object.keys(backgrounds)[0];
        if (bgName) out.push('【bg:' + bgName + '】');
        if (_bgmAt[0] && _bgmAt[0].name) out.push('【bgm:' + _bgmAt[0].name + '】');
        if (_seAt[0] && _seAt[0].name) out.push('【se:' + _seAt[0].name + '】');   // 音效名也同步进来 (无音频那套没有这些行)
        if (!_lines.length) return (vChat.deleted.char ? [] : vfLines()).join('\n');
        _lines.forEach(function (l) {
          if (l.isNarr || !l.name) out.push('旁白||' + String(l.text || '') + '|' + (l.se ? '|' + l.se : ''));
          else out.push(l.name + '|' + String(l.face || '') + '|' + String(l.text || '') + '|' + String(l.fx || '')
            + (l.slot ? '|' + l.slot : '') + (l.se ? '|' + l.se : ''));
        });
        return out.join('\n');
      })(),
      previewFaces: allFaces.map(function (x) { return x.g.name + '|' + x.f.key; }),   // 调试: 预览取脸的顺序
      /* 重命名过的内置演出: 新名字 -> 内置动画类名 (预览靠这个播放) */
      fxAliases: (function () { const m = {}; Object.keys(cur.fxAliases || {}).forEach(function (k) { const nm = cur.fxAliases[k]; if (nm) m[nm] = 'gv-' + k; }); return m; })(),
      /* ★ 自定义演出组 (名字 -> {css, cls, target, duration, js}): 模板按这个自己 applyFx,
         和导出脚本塞给卡的那份是同一个表 —— 预览里能播, 导出的自包含脚本里也能播 */
      effects: fxMap(cur),
      /* ★ 按【每行自己写的内容】解析, 不再按行号硬猜谁是旁白 —— 你在编辑器里怎么写就怎么演:
         角色名|表情|台词|效果 / 角色名|台词 / 直接一句话(=旁白);
         {{角色}} {{表情}} {{表情2}} 会换成当前「演示角色」的名字和两张立绘的表情名 */
      lines: _lines,
      /* ★ 这两行以前漏了: 模板/宿主都读 ctx.bgmAt (真机的引擎会给), 预览的 payload 里没有它 ->
         宿主 refreshPreview 拿到 undefined -> 直接 pvStopBgm() -> 预览里【BGM 永远不响】(音效是每行自己的 se 字段, 所以没事) */
      bgmAt: _bgmAt, seAt: _seAt, bgAt: _bgAt,      // ★ 预览也按行换背景 (以前预览没有 bgAt)
      backgrounds: backgrounds, faces: faces, bubbles: bubbles,
      bubblePos: cur.bubblePos || { x: 78, y: 24, scale: 1 },
      bubblePosEach: cur.bubblePosEach || {},          // 单个气泡单独调过的落点
      bubblePosSlot: cur.bubblePosSlot || {},          // ★ 每个站位各一套落点 (多人站位时用)
      bubbleAnim: cur.bubbleAnim || {},                // 每张贴纸选的入场动画 (预览要照着播)
      bubbleCss: bubbleCssText(cur),                   // 改过的/自己写的气泡演出 CSS
      /* ★ 声音也走 data: (虚拟楼层是沙箱, 自己取不到 http/blob, 只有 data: 能放) */
      audioBgm: await (async function () { const m = {}; for (const a of (cur.audioList || [])) { const u = await previewUrl(a); if (u) m[a.mood || a.name] = u; } return m; })(),
      audioSe: await (async function () { const m = {}; for (const a of (cur.seList || [])) { const u = await previewUrl(a); if (u) m[a.name] = u; } return m; })(),
      slots: cur.slots || [], slotPos: cur.slotPos || {},
      slotBoxes: cur.slotBoxes || {},        // ★ 占位排版: 每个站位的画框 (预览和真机同一套)
      name: vFloor.user.name || (function(){ try { return SillyTavern.getContext().name1 || '{{user}}'; } catch (e) { return '{{user}}'; } })(),
      text: vChat.deleted.user ? '' : vFloor.user.text,
      avatar: vChat.showUA ? (await previewPersonaUrl()) : '',
      /* 引擎/模板两套字段都带上, 预览才不会和真实楼层不一样 */
      userName: (function(){ try { return SillyTavern.getContext().name1 || '{{user}}'; } catch (e) { return '{{user}}'; } })(),
      /* ★ 预览时演示的那个角色名: 人设名和它撞车时, 角色台词要保住立绘 (和真机一套规则) */
      charName: ((g && g.name) || (function(){ try { return SillyTavern.getContext().name2 || ''; } catch (e) { return ''; } })()),
      userAvatar: vChat.showUA ? (await previewPersonaUrl()) : '',
      userAliases: (function(){ try { var c = SillyTavern.getContext(); var out = [String(c.name1 || '')]; (c.chat || []).forEach(function(m){ if (m && m.is_user && m.name) out.push(String(m.name)); }); return out.filter(Boolean); } catch (e) { return []; } })(),
      index: 0,
      /* ★ 悬浮楼层的附加内容也走富渲染 (richHtml 由引擎同步进来): 预览里围栏 = 活 iframe, 和真机一套 */
      floors: vChat.panel.map(function (e) {
        var h = e.html || e.raw || '';
        try { h = richHtml(String(h), e.id); } catch (err) {}
        return { id: e.id, name: e.name || nm, raw: e.raw, html: h, story: e.story };
      }),
      order: vChat.order.slice(),
      showUA: vChat.showUA,
      /* 悬浮窗那三个页面要用的数据: 全在插件这边, 不依赖脚本 */
      prompt: (function(){ try { return buildPrompt(cur); } catch (e) { return ''; } })(),
      convertCfg: (function(){ try { return JSON.parse(localStorage.getItem('gv_convert_api_v1') || '{}'); } catch (e) { return {}; } })(),
    };
  }

  let tplTab = 'char';
  /* ---- 直接调酒馆核心: import 主模块 script.js, 不去点原生按钮 ---- */
  let _coreP = null;
  function stCore() {
    if (!_coreP) _coreP = Promise.resolve().then(() => import('/script.js')).catch(() => null);
    return _coreP;
  }
  /* 预览里点「编辑」-> 真的打开酒馆原生编辑 (messageEdit 是核心导出, 不是模拟点击) */
  async function openNativeEdit(isUser) {
    const core = await stCore();
    if (!core || typeof core.messageEdit !== 'function') return false;
    const list = core.chat || [];
    const inDom = i => !!document.querySelector('#chat > .mes[mesid="' + i + '"]');
    let target = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      if (!!list[i].is_user !== !!isUser) continue;
      if (!inDom(i)) continue;
      target = i; break;
    }
    if (target < 0) return false;
    try { document.querySelector('#chat > .mes[mesid="' + target + '"]').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    await core.messageEdit(target);
    return true;
  }
  /* 从模板 CSS 里自动找定位框尺寸, 找不到就用默认 */
  function guessFrameSize(css) {
    const out = { w: 400, h: 867, auto: true };
    const s = String(css || '');
    /* ★ 模板里手机框的类名是 .gv-phone (只有很老的模板才叫 .phone)。
       以前只找 .phone -> 匹配不到就退化成"在整份 CSS 里找第一个 max-width",
       结果读到的是名字框那条 (max-width:70% / 200px) -> 定位框被写成 200x433、预览缩成一小块。 */
    const block = /\.gv-phone[^{]*\{([^}]*)\}/i.exec(s) || /\.phone[^{]*\{([^}]*)\}/i.exec(s);
    const body = block ? block[1] : s;
    /* 正宽度优先: width: 400px / width: min(100%, 400px) / width: min(400px, 100%) */
    /* ★ 取这条声明里【最后一个 3~4 位数字】: width: min(100%, 400px) -> 400 ; width: 100% -> 没有 >=200 的数 -> 不算 */
    const pick = (re) => {
      const m = re.exec(body); if (!m) return 0;
      const nums = String(m[1]).match(/\d{3,4}/g) || [];
      for (let i = nums.length - 1; i >= 0; i--) { if (Number(nums[i]) >= 200) return Number(nums[i]); }
      return 0;
    };
    const w1 = pick(/(?:^|[;{\s])width\s*:\s*([^;}]+)/i);
    const w2 = pick(/max-width\s*:\s*([^;}]+)/i);
    if (w1) out.w = w1; else if (w2) out.w = w2;
    const ar = /aspect-ratio\s*:\s*([\d.]+)\s*\/\s*([\d.]+)/i.exec(body);
    if (ar) out.h = Math.round(out.w * (Number(ar[2]) / Number(ar[1])));      // 宽高比 -> 直接算成高
    else { const mh = /max-height\s*:\s*(\d{3,4})/i.exec(body); if (mh) out.h = Number(mh[1]); }
    return out;
  }
  /* ---------------- ★ 第 8 条: 多人占位排版 (给每个站位画一块框) ----------------
     框存成整块的百分比 { x, y, w, h } (x/y = 左上角), 引擎/模板/导出都按它站位; 没画的站位还是老算法。
     编辑器: 点空处新建 / 拖框移动 / 拖四条边或四个角改大小 / 全部平分 / 清除 */
  function slotBoxEditor(pick) {
    return new Promise(async function (resolve) {
      const slots = (cur.slots || []).filter(Boolean);
      if (slots.length < 2) { await dialog({ title: '先设站位', text: '占位排版是给多人用的：先去「演出素材 → 立绘站位」把站位设成 2 个以上（left / middle / right 之类），再回来画框。', okText: '知道了' }); return resolve(false); }
      const ar = (cur.frameSize && cur.frameSize.w && cur.frameSize.h) ? (cur.frameSize.w / cur.frameSize.h) : (cur.layout === 'landscape' ? 16 / 9 : 9 / 19.5);
      const maxW = Math.min(340, Math.max(200, (window.innerWidth || 900) - 420));
      let cw = Math.round(maxW), ch = Math.round(cw / ar);
      const maxH = Math.max(200, Math.min(420, (window.innerHeight || 800) - 300));
      if (ch > maxH) { ch = maxH; cw = Math.round(ch * ar); }
      const boxes = {};
      slots.forEach(function (k) { const b = (cur.slotBoxes || {})[k]; if (b && b.w > 0 && b.h > 0) boxes[k] = { x: b.x, y: b.y, w: b.w, h: b.h }; });
      let active = (pick && slots.indexOf(pick) >= 0) ? pick : slots[0];
      const COLORS = ['#ff8fb1', '#7fd1ff', '#ffd479', '#a6f0c6', '#c9a7ff', '#ff9f7f'];
      const mask = el('div', 'tgm-dlg-mask');
      const bx = el('div', 'tgm-dlg');
      bx.appendChild(el('div', 'tgm-dlg-head', '占位排版：给每个站位画一块框'));
      const body = el('div', 'tgm-dlg-body');
      body.appendChild(el('div', 'tgm-dlg-text', '框 = 这个站位能站的地方（百分比，跟着整块界面缩放）。立绘以框为准：居中对齐框、底边贴框底、宽高就是框。没画框的站位还是按老算法自动平分。'));
      const chips = el('div', 'tgm-row'); chips.style.flexWrap = 'wrap';
      const mkChip = function (k, i) {
        const c = el('div', 'tgm-btn' + (k === active ? ' tgm-primary' : ''), k + (boxes[k] ? ' ✓' : ''));
        c.style.borderColor = COLORS[i % COLORS.length];
        c.addEventListener('click', function () { active = k; drawChips(); paint(); });
        return c;
      };
      const drawChips = function () { chips.innerHTML = ''; slots.forEach(function (k, i) { chips.appendChild(mkChip(k, i)); }); };
      drawChips(); body.appendChild(chips);
      const stage = el('div', 'tgm-boxstage');
      stage.style.width = cw + 'px'; stage.style.height = ch + 'px';
      try { const _b = (cur.bgList || [])[0]; const _u = _b ? await previewUrl(_b) : ''; if (_u) { const _im = el('img', 'tgm-boxbd'); _im.src = _u; stage.appendChild(_im); } } catch (e) {}
      body.appendChild(stage);
      const row2 = el('div', 'tgm-row');
      const bSplit = el('div', 'tgm-btn', '全部平分');
      const bDel = el('div', 'tgm-btn', '清除这块');
      const bClr = el('div', 'tgm-btn tgm-danger', '清除全部');
      row2.append(bSplit, bDel, bClr, el('span', 'tgm-imeta', '点框里拖动 = 移动；拖四条边 / 四个角 = 改大小（贴到画面边线就停）；点空白 = 新建'));
      body.appendChild(row2);
      const foot = el('div', 'tgm-dlg-foot');
      const bCancel = el('div', 'tgm-btn', '取消');
      const bOk = el('div', 'tgm-btn tgm-primary', '保存');
      foot.append(bCancel, bOk);
      bx.append(body, foot); mask.appendChild(bx); document.body.appendChild(mask);
      const rects = {};
      function paint() {
        Object.keys(rects).forEach(function (k) { rects[k].remove(); delete rects[k]; });
        slots.forEach(function (k, i) {
          const b = boxes[k]; if (!b) return;
          const d = el('div', 'tgm-boxrect');
          d.style.left = b.x + '%'; d.style.top = b.y + '%';
          d.style.width = b.w + '%'; d.style.height = b.h + '%';
          d.style.borderColor = COLORS[i % COLORS.length];
          if (k !== active) d.style.opacity = '.45';
          const lb = el('div', 'tgm-boxlabel', k); lb.style.background = COLORS[i % COLORS.length]; d.appendChild(lb);
          if (k === active) {
            /* ★ 8 个把手: 四条边 + 四个角都能拖着改大小 (和移动一样夹在画面里) */
            ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].forEach(function (dir) {
              const hd = el('div', 'tgm-boxhandle tgm-bh-' + dir);
              hd.addEventListener('pointerdown', function (e) { e.stopPropagation(); startDrag(e, k, dir); });
              d.appendChild(hd);
            });
          }
          d.addEventListener('pointerdown', function (e) { e.stopPropagation(); active = k; drawChips(); paint(); startDrag(e, k, 'move'); });
          stage.appendChild(d); rects[k] = d;
        });
      }
      /* mode: 'move' = 整块搬走; 'n'/'s'/'e'/'w'/'nw'... = 拖那条边(或角)改大小
         改大小按「两条边」算: 只动你拖的那条, 另一条边不动; 全程夹在画面里(拖到边线就停), 最小 6% */
      function startDrag(e, k, mode) {
        const r = stage.getBoundingClientRect();
        const b = boxes[k] || (boxes[k] = { x: 20, y: 50, w: 30, h: 45 });
        const sx = e.clientX, sy = e.clientY, o = { x: b.x, y: b.y, w: b.w, h: b.h };
        const MINW = 6, MINH = 6;
        const move = function (ev) {
          const dx = (ev.clientX - sx) / r.width * 100, dy = (ev.clientY - sy) / r.height * 100;
          if (mode === 'move') {
            b.x = Math.max(0, Math.min(100 - b.w, o.x + dx));
            b.y = Math.max(0, Math.min(100 - b.h, o.y + dy));
            return paint();
          }
          let x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;   /* 左/上/右/下 四条边 */
          if (mode.indexOf('w') >= 0) x1 = Math.min(o.x + dx, x2 - MINW);
          if (mode.indexOf('e') >= 0) x2 = Math.max(o.x + o.w + dx, x1 + MINW);
          if (mode.indexOf('n') >= 0) y1 = Math.min(o.y + dy, y2 - MINH);
          if (mode.indexOf('s') >= 0) y2 = Math.max(o.y + o.h + dy, y1 + MINH);
          x1 = Math.max(0, x1); y1 = Math.max(0, y1); x2 = Math.min(100, x2); y2 = Math.min(100, y2);
          if (x2 - x1 < MINW) { if (mode.indexOf('w') >= 0) x1 = Math.max(0, x2 - MINW); else x2 = Math.min(100, x1 + MINW); }
          if (y2 - y1 < MINH) { if (mode.indexOf('n') >= 0) y1 = Math.max(0, y2 - MINH); else y2 = Math.min(100, y1 + MINH); }
          b.x = x1; b.y = y1; b.w = x2 - x1; b.h = y2 - y1;
          paint();
        };
        const up = function () { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      }
      stage.addEventListener('pointerdown', function (e) {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
        boxes[active] = { x: Math.max(0, Math.min(94, x - 15)), y: Math.max(0, Math.min(94, y - 20)), w: 30, h: 40 };
        drawChips(); paint();
      });
      bSplit.addEventListener('click', function () {
        const n = slots.length, w = Math.floor(96 / n);
        slots.forEach(function (k, i) { boxes[k] = { x: 2 + i * w, y: 42, w: w - 2, h: 56 }; });
        paint(); drawChips();
      });
      bDel.addEventListener('click', function () { delete boxes[active]; drawChips(); paint(); });
      bClr.addEventListener('click', function () { slots.forEach(function (k) { delete boxes[k]; }); drawChips(); paint(); });
      bCancel.addEventListener('click', function () { mask.remove(); resolve(false); });
      bOk.addEventListener('click', async function () {
        const out = {};
        Object.keys(boxes).forEach(function (k) { const b = boxes[k]; out[k] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) }; });
        cur.slotBoxes = out;
        try { await putProjectData(cur); } catch (e) {}
        mask.remove(); resolve(true);
      });
      paint();
    });
  }
  /* ---------------- ★ 第 8 条: 「立绘站位」页 (§G.5 第 4 个 tab) ----------------
     这里只管排站位/画框; 单人预设没有这一页 (标签也不出现) */
  function renderSlotsPage(p) {
    const slots = (cur.slots || []).filter(Boolean);
    p.appendChild(el('div', 'tgm-h2', '立绘站位'));
    p.appendChild(el('div', 'tgm-hint', '多人时每个站位一块框：立绘只会站在这块框里。框用百分比存（跟着整块界面缩放），引擎 / 模板 / 导出的脚本都按它站位。'));
    const card = el('div', 'tgm-card');
    const row = el('div', 'tgm-row');
    row.appendChild(el('div', 'tgm-h2', '占位排版'));
    const sp = el('span'); sp.style.flex = '1'; row.appendChild(sp);
    const bBox = el('div', 'tgm-btn tgm-primary', '画框');
    bBox.addEventListener('click', async () => { const ok = await slotBoxEditor(); if (ok) renderPages(); });
    row.appendChild(bBox); card.appendChild(row);
    card.appendChild(el('div', 'tgm-dlg-text', '点「画框」：上面选站位 → 在画面里拖框（拖边 / 拖角改大小）→「全部平分」可以一键铺开 → 保存。'));
    slots.forEach(function (k) {
      const b = (cur.slotBoxes || {})[k];
      const r2 = el('div', 'tgm-row');
      r2.appendChild(el('span', 'tgm-gname', k));
      r2.appendChild(el('span', 'tgm-imeta', b ? ('框：' + b.x + ',' + b.y + '　' + b.w + '×' + b.h + '（整块百分比）') : '还没画框'));
      const sp2 = el('span'); sp2.style.flex = '1'; r2.appendChild(sp2);
      const bE = el('div', 'tgm-btn', b ? '改这块' : '画这块');
      bE.addEventListener('click', async () => { const ok = await slotBoxEditor(k); if (ok) renderPages(); });
      r2.appendChild(bE);
      card.appendChild(r2);
    });
    p.appendChild(card);
    if (!slots.length) p.appendChild(el('div', 'tgm-dlg-text', '这个方案还没有站位关键词：去「演出素材 → 立绘站位」加。'));
  }
  async function renderPages() {
    const p = UI.panes.pages; if (!p || !cur) return;
    p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '页面排版'),
      el('div', 'tgm-hint', '三层界面完全由你写。你的 HTML/CSS/JS 跑在沙箱 iframe 里，引擎只负责喂数据、接动作、调高度 —— 想做成什么样都行（加返回按钮、做 APP 二级页、改尺寸都可以）。'));
    const tabs = el('div', 'tgm-row');
    /* ★ §G.5: 多人（站位 ≥2）时标签行是 char 楼层 | User 楼层 | 悬浮楼层 | 立绘站位 —— 第 4 个 tab 才是排站位/画框的地方
       单人预设没有框也没有限制, 所以那个 tab 干脆不出现 */
    const _multiSlot = (cur.slots || []).filter(Boolean).length > 1;
    const TABLIST = [['char', 'char 楼层'], ['user', 'User 楼层'], ['panel', '悬浮楼层']];
    if (_multiSlot) TABLIST.push(['slots', '立绘站位']);
    if (tplTab === 'slots' && !_multiSlot) tplTab = 'char';
    TABLIST.forEach(([k, t]) => {
      const b = el('div', 'tgm-btn' + (tplTab === k ? ' tgm-primary' : ''), t);
      b.addEventListener('click', () => { tplTab = k; renderPages(); });
      tabs.appendChild(b);
    });
    p.appendChild(tabs);
    /* 第 4 个 tab: 只画「立绘站位 · 占位排版」这一页, 不碰三层模板那套 */
    if (tplTab === 'slots') { renderSlotsPage(p); return; }

    cur.pages = cur.pages || { char: null, user: null, panel: null };
    /* ★ 版式: 单人默认竖版, 多人(站位>1)默认横版; 用户选过就以他选的为准 */
    cur.layout = cur.layout || (((cur.slots || []).length > 1) ? 'landscape' : 'portrait');
    const pk = pagesKey(tplTab);          // ★ 当前层在当前版式下存哪一格 (char 横版 -> charLand)
    /* ★ 有音频 / 无音频 两套默认模板: 音频相关的块用标记圈出来, 剥皮函数 stripAudio 在下面统一定义 */
    cur.audioMode = cur.audioMode || (((cur.audioList || []).length || (cur.seList || []).length) ? 'with' : 'without');
    const def = tplDefOf(tplTab);
    /* ★ 老方案里保存过页面排版的话, 新加的功能块(比如"调整音量")是缺的 —— 用新默认里的三块补上,
       不动你自己写过的任何东西 (缺什么补什么) */
    try {
      const _nd = tplDefOf(tplTab) || {};
      cur.pages[pk] = cur.pages[pk] || null;
      if (cur.pages[pk]) {
        const _t = cur.pages[pk];
        /* ★ 自检: 保存过的模板如果连自己的根节点都没了 (被清空/写坏), 用默认模板的 HTML 补回来 ——
           不然后面"缺什么补什么"会补成一个只有音量面板、没有画面的空壳 */
        const _rootMark = { char: 'gv-root', user: 'gv-userbar-wrap', panel: 'gv-panel' }[tplTab];
        if (_rootMark && String(_t.html || '').indexOf(_rootMark) < 0 && _nd.html && String(_nd.html).indexOf(_rootMark) >= 0) {
          _t.html = _nd.html;
        }
        const _pick = (src, from, to) => { const a = String(src || '').indexOf(from); const b = String(src || '').indexOf(to); return (a >= 0 && b > a) ? String(src).slice(a, b) : ''; };
        if (!/id="volPos"/.test(String(_t.html || ''))) { const blk = _pick(_nd.html, '<div class="gv-vol"', '<div class="gv-editor"'); if (blk) _t.html = String(_t.html || '') + '\n' + blk; }
        /* 音量面板样式: 没打 v2 标记就追加新的一份 (后加的规则覆盖旧的, 位置就从"挡对话框"改成"画面上半部分") */
        if (!/gv-vol-v4/.test(String(_t.css || ''))) { const blk = _pick(_nd.css, '/* 音量面板', '.gv-editor {'); if (blk) _t.css = String(_t.css || '') + '\n' + blk; }
        /* ★ 用得到 $ 但文件里没有定义 (老快照被改过/复制过一段) -> 在最前面补兜底:
           不然后面每一块都会 ReferenceError, 音量面板/暂停按钮全都装不上 */
        if (/\$\(/.test(String(_t.js || '')) && !/function\s+\$/.test(String(_t.js || '')) && !/__gvDollarShim__/.test(String(_t.js || ''))) {
          _t.js = '/*__gvDollarShim__*/ try { if (typeof window.$ !== "function") window.$ = function (id) { return document.getElementById(id); }; } catch (e) {}\n' + String(_t.js || '');
        }
        /* 声音块: 老方案里可能是"沙箱自己播"的旧版(永远 NotAllowedError) —— 没打新标记就追加新的,
           同名的 function 声明后定义的生效, 所以直接追加就能覆盖旧的 */
        if (!/__gvAudioV4__/.test(String(_t.js || ''))) { const blk = _pick(_nd.js, '/* ---- 声音: 自己播', '/*gv-audio*/'); if (blk) _t.js = String(_t.js || '') + '\n' + blk; }
        /* ★ 幂等保险: 上面那段只要被判成"没补过"就会追加, 万一标记又漂了就会越叠越多 ->
           这里按【整段文字】去重, 只留第一份 (老方案里已经叠了二十几份的, 一打开就被清掉) */
        const _dedup = (txt, blk) => {
          if (!blk) return String(txt || '');
          let s = String(txt || '');
          const first = s.indexOf(blk);
          if (first < 0) return s;
          let idx = s.indexOf(blk, first + 1), guard = 0;
          while (idx >= 0 && guard++ < 300) { s = s.slice(0, idx) + s.slice(idx + blk.length); idx = s.indexOf(blk, first + 1); }
          return s;
        };
        _t.js = _dedup(_t.js, _pick(_nd.js, '/* ---- 声音: 自己播', '/*gv-audio*/'));
        _t.html = _dedup(_t.html, _pick(_nd.html, '<div class="gv-vol"', '<div class="gv-editor"'));
        _t.css = _dedup(_t.css, _pick(_nd.css, '/* 音量面板', '.gv-editor {'));
        /* 老快照的 show() 不认 bgmAt (只有新模板认) -> 楼层开头的 BGM 不会放; 没有就补一小段:
           有 BGM 就放, 没有就叫宿主停 (★ 把楼层里那行删掉之后必须停, 靠的就是这句) */
        if (!/bgmAt/.test(String(_t.js || ''))) _t.js = String(_t.js || '') + '\n/* 旧模板补丁: 按楼层的 BGM 事件播放 / 没有就停 */\ntry { if (typeof playBgm === "function") { var _b0 = (ctx.bgmAt || [])[0]; if (_b0) playBgm(_b0.name); else ctx._post("bgm", ""); } } catch (e) {}';
        /* 老快照没有"暂停"按钮 -> 把新默认里那一块原样补进去 (老模板也自动多一个按钮) */
        if (!/volPause/.test(String(_t.js || ''))) { const pb = _pick(_nd.js, '/*gv-pause*/', '/*/gv-pause*/'); if (pb) _t.js = String(_t.js || '') + '\n' + pb; }
        /* 老快照的 reportSize 只在 load 报一次 -> 补一个"尺寸一变就报" (宿主靠它同步「定位框」和外框) */
        /* 尺寸上报补丁: 老快照里可能压根没有 reportSize, 或者只在 load 报一次 -> 无条件补一个
           (宿主拿实测尺寸同步「方案的定位框」和预览外框, 这样你改 CSS 的比例它才会跟着变) */
        /* 尺寸上报 + 自适应缩放补丁: 老快照里可能没有 autoFit / 只在 load 报一次 -> 无条件补一个 */
        if (!/gvAutoFit/.test(String(_t.css || ''))) _t.css = String(_t.css || '') + '\n/*gvAutoFit*/ .gv-root { transform: scale(var(--gv-scale, 1)); transform-origin: 50% 0; } html, body { overflow-x: hidden; }';
        if (!/gvSizePatch/.test(String(_t.js || ''))) _t.js = String(_t.js || '') + '\n/*gvSizePatch*/ try { var DESIGN_W = 400; function autoFit() { try { var a = document.documentElement.clientWidth || 0; var s = a > 0 ? Math.min(1, a / DESIGN_W) : 1; var r0 = document.querySelector(".gv-root"); if (r0) r0.style.setProperty("--gv-scale", String(s)); var ph0 = document.getElementById("phone"); if (ph0) { ph0.style.width = s < 1 ? (DESIGN_W + "px") : ""; ph0.style.maxWidth = s < 1 ? "none" : ""; ph0.style.flex = s < 1 ? "0 0 auto" : ""; } try { document.documentElement.style.overflow = s < 1 ? "hidden" : ""; } catch (e2) {} return s; } catch (e) { return 1; } } /* ★ 老快照里的 reportSize 会把"缩放后的手机宽"报给宿主 -> 一轮轮越缩越小; 这里统一改成"容器宽" */ try { if (ctx && !ctx.__gvPostFix) { ctx.__gvPostFix = 1; var _op = ctx._post.bind(ctx); ctx._post = function (t, a) { if (t === "frameSize") { var aa = document.documentElement.clientWidth || 0; var p9 = document.getElementById("phone"); var r9 = p9 ? p9.getBoundingClientRect() : null; a = { w: Math.round(aa || (a && a.w) || 0), h: Math.round(r9 ? r9.height : ((a && a.h) || 0)) }; } return _op(t, a); }; } } catch (e) {} var _rp = function () { try { autoFit(); } catch (e) {} if (typeof reportSize === "function") { reportSize(); } else { try { var p0 = document.getElementById("phone"); if (!p0) return; var r1 = p0.getBoundingClientRect(); if (r1.width > 40) { ctx._post("frameSize", { w: Math.round(document.documentElement.clientWidth || r1.width), h: Math.round(r1.height) }); ctx._post("resize", Math.round(r1.height)); } } catch (e) {} } }; var _ph = document.getElementById("phone"); if (window.ResizeObserver && _ph) { new ResizeObserver(function () { _rp(); }).observe(_ph); } _rp(); setTimeout(_rp, 300); setTimeout(_rp, 1200); } catch (e) {}';
      }
    } catch (e) {}
    const curT = cur.pages[pk] || (def ? { html: def.html, css: def.css, js: def.js } : { html: '', css: '', js: '' });

    const card = el('div', 'tgm-card');
    const tas = {};
    [['html', 'HTML'], ['css', 'CSS'], ['js', 'JS']].forEach(([k, label]) => {
      const r = el('div', 'tgm-row'); r.style.alignItems = 'flex-start';
      r.appendChild(el('label', '', label));
      const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.style.minHeight = '130px';
      ta.value = curT[k] || '';
      ta.addEventListener('input', () => {
        cur.pages[pk] = cur.pages[pk] || {};
        cur.pages[pk][k] = ta.value;
      });
      tas[k] = ta; r.appendChild(ta); card.appendChild(r);
    });
    const bar = el('div', 'tgm-row');
    const bSave = el('div', 'tgm-btn tgm-primary', '保存');
    const bPrev = el('div', 'tgm-btn', '刷新预览');
    const bReset = el('div', 'tgm-btn', '恢复默认');
    /* ★ 第 6 条: 「清空（用引擎自带长相）」删掉 (和「恢复默认」屏幕上没区别, 见需求 §F.1), 位置给「从本地导入素材」 */
    const bAsset = el('div', 'tgm-btn', '从本地导入素材');
    bAsset.title = '导入本地图片给这一层的模板用：模板里写 __gvasset:名字__ 就会换成这张图（预览和导出都换）';
    const st = el('span', 'tgm-status', '');
    bar.append(bSave, bPrev, bAsset, st); card.appendChild(bar);
    /* ★ 第 3 条: 代码编辑器的导入能力 —— 粘贴整段自动拆围栏 / 从文件导入 / 单段复制·导出 */
    const splitBundle = (raw) => {
      const out = { html: '', css: '', js: '', got: '' };
      const t = String(raw || '');
      const fence = /```([a-zA-Z]*)[ \t]*\r?\n([\s\S]*?)```/g;
      let m, hit = 0;
      while ((m = fence.exec(t)) !== null) {
        const lang = String(m[1] || '').toLowerCase();
        const key = (lang.indexOf('html') === 0 || lang === 'htm') ? 'html'
          : (lang.indexOf('css') === 0) ? 'css'
          : (lang.indexOf('js') === 0 || lang === 'javascript') ? 'js' : '';
        if (!key) continue;
        out[key] += (out[key] ? '\n' : '') + m[2].replace(/\s+$/, '') + '\n';
        hit++;
      }
      if (hit) { out.got = ['html', 'css', 'js'].filter(k => out[k]).join(' / '); return out; }
      if (/<html[\s>]/i.test(t) || /<body[\s>]/i.test(t) || /<style[\s>]/i.test(t)) {
        const stx = /<style[^>]*>([\s\S]*?)<\/style>/i.exec(t);
        const scx = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(t);
        if (stx) out.css = stx[1].replace(/^\s+|\s+$/g, '') + '\n';
        if (scx) out.js = scx[1].replace(/^\s+|\s+$/g, '') + '\n';
        out.html = t.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '').replace(/<script[^>]*>[\s\S]*?<\/script>/i, '').replace(/^\s+|\s+$/g, '') + '\n';
        if (out.css || out.js) { out.got = ['html', 'css', 'js'].filter(k => out[k]).join(' / '); return out; }
      }
      const s = t.replace(/^\s+|\s+$/g, '');
      if (!s) return out;
      if (s.charAt(0) === '<') { out.html = s + '\n'; out.got = 'html'; return out; }
      if (/function|=>|\bvar \b|\bconst \b|\blet \b|ctx\./.test(s)) { out.js = s + '\n'; out.got = 'js'; return out; }
      out.css = s + '\n'; out.got = 'css';
      return out;
    };
    const rowIO = el('div', 'tgm-row');
    const stIO = el('span', 'tgm-status', '');
    const applyBundle = (raw) => {
      const r = splitBundle(raw);
      ['html', 'css', 'js'].forEach(k => {
        if (!r[k]) return;
        tas[k].value = r[k];
        tas[k].dispatchEvent(new Event('input', { bubbles: true }));
      });
      stIO.textContent = r.got ? ('已填进 ' + r.got.toUpperCase() + ' 框（点「保存」才写进方案）')
        : '没认出内容：整段贴的时候带上 ```html / ```css / ```js 围栏最稳';
    };
    const bPaste = el('div', 'tgm-btn tgm-primary', '粘贴导入');
    const bFileIn = el('div', 'tgm-btn', '从文件导入');
    bPaste.addEventListener('click', async () => {
      const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.style.minHeight = '200px';
      ta.placeholder = '整段粘进来：带围栏会自动分到三个框；整个 HTML 文件也行（自动抠 <style> / <script>）';
      const ok = await dialog({ title: '粘贴导入（' + tplTab + ' 这一层）', text: '粘进来点确定，会填进 HTML / CSS / JS 三个框（还要点一次「保存」才写进方案）。', extra: ta, okText: '填进去' });
      if (ok) applyBundle(ta.value);
    });
    bFileIn.addEventListener('click', async () => {
      const f = await pickFile('.txt,.html,.htm,.css,.js,.md'); if (!f) return;
      let txt = ''; try { txt = await f.text(); } catch (e) { stIO.textContent = '读文件失败：' + e.message; return; }
      applyBundle(txt);
    });
    const miniBtn = (label, title, fn) => { const b = el('span', 'tgm-btn', label); b.title = title; b.addEventListener('click', fn); return b; };
    rowIO.append(bPaste, bFileIn);
    [['html', 'HTML'], ['css', 'CSS'], ['js', 'JS']].forEach(function (pair) {
      const k = pair[0], label = pair[1];
      rowIO.append(el('span', 'tgm-imeta', label),
        miniBtn('导出', '把这一段存成文件（' + label + '）', () => {
          const blob = new Blob([tas[k].value || ''], { type: 'text/plain' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = (cur.name || '方案') + '.' + tplTab + '.' + k + '.txt';
          document.body.appendChild(a); a.click(); a.remove();
        }));
    });
    rowIO.appendChild(stIO);
    card.appendChild(rowIO);
    /* ★ 这一层的提示词：切到哪一层就只有哪一层的按钮（拿给别的 AI，照着写这一层的模板） */
    const LAYER_NAME = { char: '仿文字游戏的 CHAR 楼层', user: '与 CHAR 楼层配套的 USER 楼层', panel: '与 CHAR 楼层配套的悬浮窗' };
    const bPrompt = el('div', 'tgm-btn', '指导提示词');
    bPrompt.title = '拿这一层的指导提示词给别的 AI（或导出成 txt）：它会回带围栏的 html / css / js 代码，粘回「粘贴导入」自动分框';
    bPrompt.addEventListener('click', async () => {
      const pkey = promptKey(tplTab);
      const combo = (tplTab === 'char')
        ? ((cur.layout === 'landscape' ? '横版' : '竖版') + ' · ' + (cur.audioMode === 'without' ? '无音频' : '有音频'))
        : '';
      const txt = String((PAGE_PROMPTS || {})[pkey] || (PAGE_PROMPTS || {})[tplTab] || '');
      const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.readOnly = true;
      ta.style.minHeight = '320px'; ta.value = txt;
      const info = el('span', 'tgm-status', txt ? (txt.length + ' 字' + (combo ? '（' + combo + '）' : '')) : '这一层还没有提示词');
      const cp = el('span', 'tgm-btn tgm-primary', '复制');
      cp.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(ta.value); info.textContent = '已复制 ' + ta.value.length + ' 字'; }
        catch (e) { try { ta.focus(); ta.select(); document.execCommand('copy'); info.textContent = '已复制（fallback）'; } catch (x) { info.textContent = '复制失败：手动全选复制'; } }
      });
      const dl = el('span', 'tgm-btn', '导出成 TXT');
      dl.addEventListener('click', () => {
        try {
          const blob = new Blob([ta.value || ''], { type: 'text/plain;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (cur.name || '方案') + '.' + tplTab + (combo ? '.' + combo.replace(/ · /g, '-') : '') + '.指导提示词.txt';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 8000);
          info.textContent = '已导出 ' + ta.value.length + ' 字';
        } catch (e) { info.textContent = '导出失败：' + e.message; }
      });
      const box = el('div'); const row = el('div', 'tgm-row'); row.append(cp, dl, info); box.append(ta, row);
      await dialog({ title: '指导提示词：' + (LAYER_NAME[tplTab] || tplTab) + (combo ? '（' + combo + '）' : ''), text: '整份复制（或导出成 txt）给别的 AI。它回的那几段带围栏的代码，整段粘回「粘贴导入」自动分进三个框。', extra: box, okText: '关闭' });
    });
    rowIO.insertBefore(bPrompt, stIO);      // ★ 放在 JS「导出」后面 (状态那一格之前), 不再单独占一行
    /* ★ 第 12 条: 「恢复默认」留在这行最后; 四套预设的选择挪到下面的「恢复默认用」那一行 (版式 + 音频 两个下拉) */
    bar.appendChild(bReset);
    bar.appendChild(st);        // 状态那一格挪到最后
    p.appendChild(card);

    /* ---------- ★ 第 7 条: 本地素材库 (页面排版用图) ---------- */
    const aCard = el('div', 'tgm-card');
    const aHead = el('div', 'tgm-row');
    aHead.appendChild(el('div', 'tgm-h2', '本地素材（页面用图）'));
    const aSp = el('span'); aSp.style.flex = '1'; aHead.appendChild(aSp);
    const aCount = el('span', 'tgm-imeta', '');
    aHead.appendChild(aCount); aCard.appendChild(aHead);
    aCard.appendChild(el('div', 'tgm-dlg-text',
      '模板里写 __gvasset:名字__（例如 background-image: url(__gvasset:房间__)）—— 预览和导出时都会换成这张图的 data URL。'
      + '外面的路径（http / 相对路径 / file://）在预览的沙箱 iframe 里加载不出来，本地图只能走这里。'));
    const aGrid = el('div', 'tgm-grid'); aCard.appendChild(aGrid);
    const aBox = el('div'); aCard.appendChild(aBox);
    p.appendChild(aCard);
    const renderPageAssetCard = async () => {
      const list = pageAssetList(cur);
      aCount.textContent = list.length ? ('已导入 ' + list.length + ' 张') : '还没导入';
      aGrid.innerHTML = ''; aBox.innerHTML = '';
      if (!list.length) { aGrid.appendChild(el('div', 'tgm-dlg-text', '还没有本地素材。点上面的「从本地导入素材」加图。')); return; }
      const used = new Set();
      ['html', 'css', 'js'].forEach(k => {
        const m = String(tas[k].value || '').match(PAGE_ASSET_RE) || [];
        m.forEach(x => used.add(String(x).replace(/^__gvasset:/, '').replace(/__$/, '').trim()));
      });
      for (const a of list) {
        const t = el('div', 'tgm-thumb');
        const im = el('img'); im.src = await entryUrl(a); im.loading = 'lazy';
        t.append(im, el('div', 'tgm-tname', a.name + (used.has(a.name) ? ' · 被引用中' : '')));
        const ops = el('div', 'tgm-thumb-ops');
        const o1 = el('div', 'tgm-btn', '复制引用');
        const o2 = el('div', 'tgm-btn tgm-danger', '删除');
        ops.append(o1, o2); t.appendChild(ops);
        o1.title = '复制 __gvasset:' + a.name + '__';
        o1.addEventListener('click', async () => {
          const tok = '__gvasset:' + a.name + '__';
          try { await navigator.clipboard.writeText(tok); flash('已复制 ' + tok); } catch (e) { flash('手动复制：' + tok); }
        });
        o2.addEventListener('click', async () => {
          const ok = await askConfirm('删除本地素材', '「' + a.name + '」会被删掉。模板里还在用 __gvasset:' + a.name + '__' + ' 的话，那块会空着。', true);
          if (!ok) return;
          await dropEntry(a);
          _pageAssetCache.delete(a.blobId);
          cur.pageAssets = pageAssetList(cur).filter(x => x !== a);
          await putProjectData(cur); renderPageAssetCard(); previewSoon(false);
        });
        aGrid.appendChild(t);
      }
      const mb = list.reduce((s, x) => s + (Number(x.size) || 0), 0) / 1048576;
      aBox.appendChild(el('div', 'tgm-status', list.length + ' 张' + (mb >= 0.05 ? ' · 合计约 ' + mb.toFixed(2) + ' MB' : '') + '　（导出脚本里是内联 data URL：图越大脚本越大）'));
    };
    bAsset.addEventListener('click', async () => {
      const f = await pickFile('image/*'); if (!f) return;
      const e = await fileEntry(f);
      const base = String(f.name || '图').replace(/\.[^.]+$/, '').replace(/[<>"'\s]+/g, '-').replace(/^-+|-+$/g, '').trim() || '图';
      const names = pageAssetList(cur).map(x => String(x.name));
      let nm = base, i = 2;
      while (names.indexOf(nm) >= 0) { nm = base + '-' + (i++); }        // 重名自动 -2 / -3
      const ext = (String(f.name || '').match(/\.([^.]+)$/) || [0, 'png'])[1].toLowerCase();
      cur.pageAssets = pageAssetList(cur);
      cur.pageAssets.push({ id: newId('pa'), name: nm, ext: ext, size: f.size || 0, kind: e.kind, blobId: e.blobId });
      await putProjectData(cur);
      await renderPageAssetCard(); previewSoon(false);
      flash(f.size > 1572864 ? ('已导入 ' + nm + '（这张 ' + (f.size / 1048576).toFixed(1) + ' MB，导出脚本会变大）') : ('已导入 ' + nm));
    });
    await renderPageAssetCard();

    /* 定位框尺寸: 只有 char 楼层有(手机框), 直接给 宽/高(px) */
    const gs = guessFrameSize((cur.pages[pk] || def || {}).css || '');
    cur.frameSize = Object.assign({ w: gs.w, h: gs.h }, cur.frameSize || {});
    /* ★ 版式和定位框比例对不上就纠正一下 (切横版时如果沿用竖版那套 400 宽, 会把自己锁死在 400 宽) */
    if (tplTab === 'char') {
      const _wantW = (cur.layout === 'landscape') ? 640 : 400;
      const _wantH = (cur.layout === 'landscape') ? 360 : 867;
      const _r = _wantW / _wantH, _c = (Number(cur.frameSize.w) || 0) / (Number(cur.frameSize.h) || 1);
      if (!cur.frameSize.w || !cur.frameSize.h || Math.abs(_c - _r) > _r * 0.12) cur.frameSize = { w: _wantW, h: _wantH };
    }
    if (tplTab === 'char') {
      /* ★ 第 9 条 + 有/无音频 = 4 套默认预设: 竖版有音频 / 竖版无音频 / 横版有音频 / 横版无音频
         这一行只管「恢复默认给哪一套」+「指导提示词给哪一套」; 竖版和横版的编辑内容各存各的 */
      const lrow = el('div', 'tgm-row');
      lrow.appendChild(el('span', 'tgm-imeta', '恢复默认用：'));
      const lsel = el('select', 'tgm-sel');
      [['portrait', '竖版（手机 · 400×867）'], ['landscape', '横版（宽屏 · 640×360）']].forEach(function (o) {
        const op = el('option', '', o[1]); op.value = o[0]; lsel.appendChild(op);
      });
      lsel.value = cur.layout;
      lsel.addEventListener('change', async () => {
        const v = lsel.value === 'landscape' ? 'landscape' : 'portrait';
        if (v === cur.layout) return;
        cur.layout = v;
        cur.frameSize = (v === 'landscape') ? { w: 640, h: 360 } : { w: 400, h: 867 };
        await putProjectData(cur); renderPages(); previewSoon(false);
        flash(v === 'landscape' ? '已切到横版（这套编辑内容是独立的）' : '已切回竖版');
      });
      /* 音频: 同样用"点一下出下拉"的原生 select (有音频 / 无音频) */
      const asel = el('select', 'tgm-sel');
      [['with', '有音频'], ['without', '无音频']].forEach(function (o) {
        const op = el('option', '', o[1]); op.value = o[0]; asel.appendChild(op);
      });
      asel.value = cur.audioMode;
      asel.title = '有音频 = 恢复默认给"带音量面板 / BGM / 音效"那套；无音频 = 给"一点音频都不带"那套';
      asel.addEventListener('change', async () => {
        const v = asel.value === 'without' ? 'without' : 'with';
        if (v === cur.audioMode) return;
        cur.audioMode = v; await putProjectData(cur); renderPages();
        vfLines();              // 预览台词也分两套存
        previewSoon(false);
        flash(v === 'without' ? '已切到「无音频」那套预设（代码也跟着换了）' : '已切到「有音频」那套预设（代码也跟着换了）');
      });
      lsel.title = '竖版 = 手机 400×867；横版 = 宽屏 640×360（两套的编辑内容分开存，切过去不会互相覆盖）';
      lrow.append(lsel, asel);
      card.appendChild(lrow);
      card.appendChild(el('div', 'tgm-hint',
        '上面两个下拉 = 4 套默认预设：竖版有音频 / 竖版无音频 / 横版有音频 / 横版无音频。'
        + '选哪套，「恢复默认」就重置成哪套；「指导提示词」给的也是那一套（比如选横版 + 有音频，'
        + '提示词里就会让对方直接按横版、带音量面板来写）。切「版式」或切「音频」都会【立刻换成那一套的编辑内容】'
        + '（四套各存一份，切回来还是你改过的样子；没写过的就是那一套的默认模板）。「恢复默认」是兜底：把当前这一套冲回默认。'));
      card.appendChild(el('div', 'tgm-hint', '定位框跟着版式走：竖版 400×867，横版 640×360（模板 CSS 里有比例就会自动读出来）。'));

      const frow = el('div', 'tgm-row');
      frow.appendChild(el('label', '', '定位框'));
      const wI = el('input', 'tgm-in'); wI.type = 'number'; wI.value = String(cur.frameSize.w); wI.style.maxWidth = '90px';
      const hI = el('input', 'tgm-in'); hI.type = 'number'; hI.value = String(cur.frameSize.h); hI.style.maxWidth = '90px';
      frow.append(el('span', 'tgm-imeta', '宽'), wI, el('span', 'tgm-imeta', 'px　×　高'), hI, el('span', 'tgm-imeta', 'px'));
      const bG = el('div', 'tgm-btn', '重新读取');
      frow.appendChild(bG);
      const saveFrame = async () => {
        cur.frameSize = { w: Number(wI.value) || 400, h: Number(hI.value) || 867 };
        await putProjectData(cur);
        frame.style.width = Math.min(700, Math.max(200, cur.frameSize.w)) + 'px';
        frame.style.height = Math.max(160, cur.frameSize.h) + 'px';
        q('pages', () => refreshPreview(false));      // 改完立刻按新尺寸预览
      };
      wI.addEventListener('change', saveFrame); hI.addEventListener('change', saveFrame);
      bG.addEventListener('click', () => { const g2 = guessFrameSize((cur.pages[pk] || def || {}).css || ''); wI.value = String(g2.w); hI.value = String(g2.h); saveFrame(); });
      /* 定位框这一行先不塞, 等下面「演示角色」塞完再塞 —— 用户要求定位框紧挨着它自己的说明文字 */
      /* 演示角色: 单人 = 选一个组; 多人(有站位) = 每个站位各选一个角色 + 选「现在谁在说话」(只影响预览) */
      const grow = el('div', 'tgm-row');
      grow.appendChild(el('label', '', '演示角色'));
      const groups = (cur.spriteGroups || []).filter(function (gr) { return (gr.faces || []).length; });
      const slotsAll = (cur.slots || []).filter(Boolean);
      const multi = slotsAll.length > 1;
      const curGrp = groups.find(function (gr) { return gr.id === cur.previewGroup; }) || groups[0] || null;
      const castNow = function () {
        const map = cur.demoCast || {}, out = [];
        slotsAll.forEach(function (s) { const gr = groups.find(function (x) { return x.id === map[s]; }); if (gr) out.push({ slot: s, group: gr }); });
        return out;
      };
      const grpMeta = el('span', 'tgm-imeta', groups.length
        ? (multi
          ? (castNow().length ? ('当前：' + castNow().map(function (c) { return c.slot + '·' + c.group.name; }).join('　') + '　共 ' + groups.length + ' 个角色')
                              : ('还没选角　共 ' + groups.length + ' 个角色'))
          : ('当前：' + (curGrp ? curGrp.name : '（未选）') + '　共 ' + groups.length + ' 个角色'))
        : '还没有导入立绘');
      const openCastDialog = function () {
        const lb = el('div');
        slotsAll.forEach(function (s) {
          const row = el('div');
          row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:10px;';
          const lb2 = el('label', '', s); lb2.style.minWidth = '64px';
          row.appendChild(lb2);
          const sel = document.createElement('select');
          sel.className = 'tgm-in'; sel.style.minWidth = '200px';
          const o0 = document.createElement('option'); o0.value = ''; o0.textContent = '（这个站位不出现）'; sel.appendChild(o0);
          groups.forEach(function (gr) {
            const o = document.createElement('option'); o.value = gr.id; o.textContent = gr.name + '（' + gr.faces.length + ' 张立绘）'; sel.appendChild(o);
          });
          sel.value = (cur.demoCast || {})[s] || '';
          sel.addEventListener('change', async function () {
            cur.demoCast = cur.demoCast || {};
            if (sel.value) cur.demoCast[s] = sel.value; else delete cur.demoCast[s];
            const list = castNow();
            if (!list.some(function (c) { return c.slot === cur.demoSpeaker; })) cur.demoSpeaker = (list[0] || {}).slot || '';
            await putProjectData(cur);
            mask2.remove(); q('pages', renderPages);      // 重画这一页, 顺带把「谁在说话」刷新出来
          });
          row.appendChild(sel);
          lb.appendChild(row);
        });
        const mask2 = el('div', 'tgm-dlg-mask');
        const box2 = el('div', 'tgm-dlg');
        const body2 = el('div', 'tgm-dlg-body');
        body2.appendChild(el('div', 'tgm-dlg-text', '给每个站位挑一个角色（同一个角色也可以占多个站位）。这只影响预览，不会写进导出的脚本。'));
        body2.appendChild(lb);
        box2.append(el('div', 'tgm-dlg-head', '选演示角色（按站位）'), body2);
        const foot2 = el('div', 'tgm-dlg-foot');
        const cx = el('div', 'tgm-btn', '关闭'); cx.addEventListener('click', () => mask2.remove());
        foot2.appendChild(cx); box2.appendChild(foot2); mask2.appendChild(box2); document.body.appendChild(mask2);
      };
      const bGrp = el('div', 'tgm-btn', multi ? '选角…' : '选择…');
      if (!multi) bGrp.addEventListener('click', async () => {
        if (!groups.length) { await dialog({ title: '还没有立绘', text: '先去「图片素材」建角色组、加立绘，再回来选演示角色。' }); return; }
        const lb = el('div');
        groups.forEach(function (gr) {
          const b = el('div', 'tgm-btn' + (curGrp && gr.id === curGrp.id ? ' tgm-primary' : ''), gr.name + '（' + gr.faces.length + ' 张立绘）');
          b.style.display = 'block'; b.style.marginTop = '6px';
          b.addEventListener('click', async () => {
            /* ★ 换「演示角色」= 虚拟楼层里【上一个演示角色】的名字也跟着换成新角色:
               只换行首那个名字完全等于上一个角色的行 —— 旁白 / {{user}} / 别的角色 一律不动。
               （你手写别的角色演多人的情况不会被破坏；想让它永远跟着选, 就把名字写成 {{角色}}） */
            const prevName = curGrp ? String(curGrp.name || '').trim() : '';
            cur.previewGroup = gr.id;
            try {
              if (prevName && prevName !== gr.name) {
                const rows = vfLines().slice();
                let hit = 0;
                const nx = rows.map(function (t) {
                  const s = String(t == null ? '' : t);
                  const m = /^([^|\n]*)\|/.exec(s);
                  if (!m || m[1].trim() !== prevName) return t;
                  hit++;
                  return s.replace(prevName, gr.name);
                });
                if (hit) vfSetLines('char', nx);
              }
            } catch (e) {}
            await putProjectData(cur); mask2.remove(); q('pages', renderPages);
          });
          lb.appendChild(b);
        });
        const mask2 = el('div', 'tgm-dlg-mask');
        const box2 = el('div', 'tgm-dlg');
        const body2 = el('div', 'tgm-dlg-body'); body2.appendChild(lb);   // el() 的第三个参数是文本, 不能用它塞节点
        box2.append(el('div', 'tgm-dlg-head', '选演示角色'), body2);
        const foot2 = el('div', 'tgm-dlg-foot');
        const cx = el('div', 'tgm-btn', '关闭'); cx.addEventListener('click', () => mask2.remove());
        foot2.appendChild(cx); box2.appendChild(foot2); mask2.appendChild(box2); document.body.appendChild(mask2);
      });
      else bGrp.addEventListener('click', async () => {
        if (!groups.length) { await dialog({ title: '还没有立绘', text: '先去「图片素材」建角色组、加立绘，再回来选。' }); return; }
        openCastDialog();
      });
      grow.append(bGrp, grpMeta);
      card.append(grow, frow);      // ★ 演示角色在上, 定位框在下 -> 定位框的说明文字正好挨着它
      /* ★ 谁在说话: 只在多人 + 已经选了角的时候出现。切到谁, 谁就正常显示, 其它站位的立绘自动 gv-idle 淡下去 */
      const _castNow = castNow();
      if (multi && _castNow.length) {
        const srow = el('div', 'tgm-row');
        srow.appendChild(el('label', '', '谁在说话'));
        const sel2 = document.createElement('select');
        sel2.className = 'tgm-in'; sel2.style.minWidth = '200px';
        _castNow.forEach(function (c) {
          const o = document.createElement('option'); o.value = c.slot; o.textContent = c.slot + ' · ' + c.group.name; sel2.appendChild(o);
        });
        sel2.value = _castNow.some(function (c) { return c.slot === cur.demoSpeaker; }) ? cur.demoSpeaker : _castNow[0].slot;
        if (sel2.value !== cur.demoSpeaker) { cur.demoSpeaker = sel2.value; putProjectData(cur); }
        sel2.addEventListener('change', async function () { cur.demoSpeaker = sel2.value; await putProjectData(cur); refreshPreview(); });
        srow.appendChild(sel2);
        srow.appendChild(el('span', 'tgm-imeta', '切到谁，谁就正常显示，其它站位的立绘自动淡下去'));
        card.appendChild(srow);
      }
      card.appendChild(el('div', 'tgm-hint',
        '定位框 = 整块楼层界面（虚拟手机屏幕）的尺寸，宽 × 高、单位 px。图片「取景 / 立绘定位」的框按这个比例显示（只是按比例缩小到对话框里，不会真按这个像素铺开）。'));
      /* （占位排版已经挪到第 4 个 tab「立绘站位」, 这里不再重复放一张卡片） */
    }
    const pv = el('div', 'tgm-preview');
    const frame = document.createElement('iframe');
    frame.className = 'tgm-preview-frame';
    frame.setAttribute('sandbox', 'allow-scripts');
    /* ★ 沙箱(独立源)的 iframe 默认没有"自动播放"权限 -> 点它也不出声; 这里把权限授下去 */
    frame.setAttribute('allow', 'autoplay');
    frame.setAttribute('scrolling', 'no');   // 预览框自己不要滚动条
    pv.appendChild(frame); p.appendChild(pv);
    const logs = el('div', 'tgm-logs'); p.appendChild(logs);
    let payload = null;
    const flash = t => { st.textContent = t; setTimeout(() => { if (st.textContent === t) st.textContent = ''; }, 1800); };
    async function refreshPreview(reset) {
      if (reset) resetVChat();          // 「刷新预览」= 虚拟楼层复位
      if (tplTab === 'panel') { frame.className = 'tgm-preview-frame tgm-fill'; frame.style.width = ''; frame.style.height = ''; } else { frame.className = 'tgm-preview-frame'; }
      if (tplTab === 'char' && cur.frameSize && cur.frameSize.w) {
        frame.style.width = Math.min(700, Math.max(200, Number(cur.frameSize.w) || 400)) + 'px';   // 宽度跟「定位框」走 (竖版/横版都行)
        frame.style.height = Math.max(160, Number(cur.frameSize.h) || 460) + 'px';
      } else if (tplTab !== 'panel') {
        frame.style.width = '';
      }
      payload = await demoPayload(tplTab);
      /* ★ 重建之后宿主自己按这一楼的 BGM 事件对齐播放状态 (不依赖 iframe 里那套有没有触发):
         有 BGM 就放, 换了另一首就换, 这一楼没有 BGM 就停 —— 你在虚拟楼层里把 【bgm:】 那行删掉, 它就停 */
      try {
        const _want = (payload.bgmAt || [])[0];
        if (!_want) pvStopBgm();
        else if (_want.name !== _pvBgmName || !_pvBgm || _pvBgm.paused) pvPlayBgm(_want.name);
      } catch (e) {}
      if (tplTab === 'panel' && vPanelOffset) payload.panelOffset = vPanelOffset;
      /* 用【当前编辑框里的内容】预览 —— 没改过时就是默认模板, 不是空 */
      const live = await withPageAssets({ html: tas.html.value, css: tas.css.value, js: tas.js.value });   // ★ 本地素材 __gvasset:名字__ -> data URL
      /* ★ 字节桥: 模板里写的 http 资源先换成 __gvresN__ 占位符, 插件取成字节, 由 iframe 自己造 blob 再换回去。
         这样 CSS 里写的外链图 / 大音频都能用 (不用 base64); 取不到(第三方无 CORS)就静默留着, 和以前一样 */
      const _items = [];
      _pvRes = _items;
      _pvMiss = []; const _missList = _pvMiss;      // ★ 这一轮取不到的外链, 等会儿在预览下面写出来
      const _tok = {};
      const _sub = (txt) => String(txt || '').replace(/https?:\/\/[^\s"'()<>\\]+/g, function (u) {
        if (_tok[u]) return _tok[u];
        const t = '__gvres' + _items.length + '__';
        _tok[u] = t; _items.push({ token: t, url: u, buf: null, type: '' });
        return t;
      });
      /* ★ 跟酒馆助手对齐: 这几个库随插件搬进沙箱 —— JS 走字节桥 (iframe 自己造 blob 再执行), CSS 上面已内联 */
      const _LJS = ['/galgame/libs/tailwind-cdn.js', '/galgame/libs/highlight.js', '/galgame/libs/mermaid.js'];
      const _libTags = _LJS.map(function (u) {
        const tk = '__gvlib' + _items.length + '__';
        _items.push({ token: tk, url: u, buf: null, type: '' });
        return '<script src="' + tk + '"><\/script>';
      }).join('');
      frame.srcdoc = previewSrcdoc({ html: _libTags + _sub(live.html), css: _sub(live.css), js: _sub(live.js) }, await libsCss());
      /* ★ 外链取不到时给一句人话 (以前是静默的: 图不显示 / 音频不出声, 你还以为是插件坏了) */
      setTimeout(function () {
        if (!_missList.length) return;
        const show = _missList.slice(0, 5);
        show.forEach(function (m) {
          const line = el('div', 'tgm-log tgm-logwarn',
            '外链取不到（' + (m.why || '取不到') + '）：' + m.u.slice(0, 72)
            + '　—— 这个外链资源在预览里显示不出来；要稳定用就从「演出素材」本地导入，或者换一个允许跨域的图床');
          logs.appendChild(line);
        });
        if (_missList.length > show.length) logs.appendChild(el('div', 'tgm-log tgm-logwarn', '（还有 ' + (_missList.length - show.length) + ' 个外链取不到，省略）'));
        logs.scrollTop = logs.scrollHeight;
      }, 2600);
      /* ★ 外链 CSS 支持: 取回来的 CSS 里若还有 url(...) (字体/图片), 按 CSS 自己的地址补全、取回、换成 data: —— */
      /*   沙箱只认 data: 和它自己造的 blob:(宿主造的 blob 它用不了), 所以这里一律内联成 data: 再交给它 */
      _items.forEach(function (it) {
        fetchBytes(it.url).then(async function (d) {
          if (!d) return;
          it.buf = d.buf; it.type = d.type;
          try {
            if (/css/i.test(String(d.type || '')) || /\.css(\?|#|$)/i.test(it.url)) {
              const dec = new TextDecoder(), enc = new TextEncoder();
              let txt = dec.decode(d.buf);
              const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
              const map = {};
              const refs = []; txt.replace(re, function (m, q, u) { refs.push(u); return m; });
              const uniq = [];
              refs.forEach(function (u) {
                const s = String(u || '').trim();
                if (!s || /^(data:|blob:|#)/i.test(s)) return;
                let abs = s; try { abs = new URL(s, it.url).href; } catch (e) { return; }
                if (uniq.indexOf(abs) < 0) uniq.push(abs);
              });
              /* ★ 同一套字体的 ttf / eot / svg 回退不用抓 (woff2 已经内联了): 少抓一半、少挂一半 */
              const _w2 = {};
              uniq.forEach(function (u) { if (/\.woff2(\?|#|$)/i.test(u)) _w2[u.replace(/\.woff2(\?|#|$)/i, '')] = 1; });
              const want = uniq.filter(function (u) { return !(/\.(ttf|eot|otf|svg)(\?|#|$)/i.test(u) && _w2[u.replace(/\.(ttf|eot|otf|svg)(\?|#|$)/i, '')]); });
              for (let k = 0; k < want.length; k += 4) {
                await Promise.all(want.slice(k, k + 4).map(async function (abs) {
                  map[abs] = '';
                  let dd = await fetchBytes(abs);
                  if (!dd || !dd.buf) dd = await fetchBytes(abs);          // 失败重试一次
                  if (!dd || !dd.buf) return;
                  try { const b = new Uint8Array(dd.buf); let str = ''; for (let i2 = 0; i2 < b.length; i2++) str += String.fromCharCode(b[i2]); map[abs] = 'data:' + (dd.type || 'application/octet-stream') + ';base64,' + btoa(str); } catch (e) {}
                }));
              }
              txt = txt.replace(re, function (m, q, u) { const s = String(u || '').trim(); let abs = s; try { abs = new URL(s, it.url).href; } catch (e) { return m; } return map[abs] ? 'url(' + map[abs] + ')' : m; });
              it.buf = enc.encode(txt).buffer; it.type = 'text/css';
            }
          } catch (e) {}
          pushRes();
        });
      });
    }
    previewRebuild = refreshPreview;      // ★ 让外面(切方案/改素材)也能重建预览
    window.addEventListener('message', e => {
      if (e.source !== frame.contentWindow) return;
      /* ★ 切版式/重画之后, 老那个 iframe 的监听还挂在 window 上: 它再报一次尺寸就会把「定位框」写回旧值
         (表现就是切到横版还是 400×225)。已经脱离文档的 frame 一律不理 */
      if (!frame.isConnected) return;
      const d = e.data; if (!d || d.__gv !== 1) return;
      if (d.type === 'ready') { try { const pl = payload || {}; pl.volume = pvVolume(); if (tplTab === 'panel') pl.panelBox = { h: Math.max(240, frame.clientHeight || 640) }; frame.contentWindow.postMessage({ __gv: 1, type: 'init', payload: pl }, '*'); } catch (x) {} return; }
      if (d.type === 'res') return;                                   // iframe 侧的字节桥回执(不用管)
      if (d.type === 'volume') { pvSetVolume(d.arg); return; }      // 预览里的音量滑块
      if (d.type === 'bgm') {                                  // 预览里放/停 BGM (插件替它放)
        if (!_pvWinOpen) return;                               // ★ 插件已经关了: 预览还在自动演, 别理它
        if (d.arg) pvPlayBgm(d.arg); else pvStopBgm(); return;
      }
      if (d.type === 'bgmQuery') { try { frame.contentWindow.postMessage({ __gv: 1, type: 'bgmState', arg: pvBgmState() }, '*'); } catch (x) {} return; }
      if (d.type === 'bgmSeekPct') { try { if (_pvBgm && isFinite(_pvBgm.duration) && _pvBgm.duration > 0) _pvBgm.currentTime = Math.max(0, Math.min(1, Number(d.arg) || 0)) * _pvBgm.duration; } catch (x) {} return; }
      if (d.type === 'bgmReplay') { try { if (_pvBgm && _pvBgm.src) { _pvBgm.currentTime = 0; _pvBgm.volume = pvVolume().bgm; _pvBgm.play().catch(function () {}); } } catch (x) {} return; }
      if (d.type === 'bgmPause') { pvToggleBgm(); return; }          // 暂停 / 继续 (音量面板上的按钮)
      if (d.type === 'se') { if (!_pvWinOpen) return; pvPlaySe(d.arg); return; }   // 预览里放音效 (关着也不理)
      if (d.type === 'resize') { frame.style.height = Math.max(60, Number(d.arg) || 200) + 'px'; return; }
      if (d.type === 'frameSize' && d.arg && d.arg.w) {
        cur.frameSize = { w: Number(d.arg.w) || 400, h: Number(d.arg.h) || 867 };
        try { putProjectData(cur); } catch (x) {}
        /* ★ 模板 CSS 决定比例: 它报上来多大, 预览外框立刻跟到多大 (不用等下一次重建) */
        try {
          frame.style.width = Math.min(700, Math.max(200, cur.frameSize.w)) + 'px';
          frame.style.height = Math.max(160, cur.frameSize.h) + 'px';
        } catch (x) {}
        if (tplTab === 'char') {
          /* ★ 只认「定位框」那两个数字框: 以前是 .tgm-row input -> 那一行里后来多了单选圆框(有音频/无音频),
             它会把这俩圆框的 value 写成 400/867 (圆框选中的是哪一个就跟着乱) */
          const inputs = [...p.querySelectorAll('.tgm-row input.tgm-in')].filter(i => i.type === 'number');
          if (inputs[0]) inputs[0].value = String(cur.frameSize.w);
          if (inputs[1]) inputs[1].value = String(cur.frameSize.h);
        }
        return;
      }
      if (d.type === 'wantSize' && tplTab !== 'panel') {
        /* 悬浮窗自己报了它需要多大 -> 预览外框跟着撑开, 这样它才挪得开 */
        const a = d.arg || {};
        const maxW = 420;
        frame.style.width = Math.min(maxW, Math.max(240, Number(a.w) || 0)) + 'px';
        frame.style.height = Math.max(90, Number(a.h) || 200) + 'px';
        return;
      }
      if (d.type === 'save') {
        /* 自带编辑器里点"确认修改": 预览里就改虚拟楼层, 立刻重画 */
        const txt = String(d.arg || '');
        if (tplTab === 'user') {
          vFloor.user.text = txt; saveVFloor();         // User 楼层: 改的就是那一行的正文
        } else {
          const rows = txt.split('\n').map(x => x.trim()).filter(Boolean);
          /* ★ 你写什么就存什么 (含 【bg:】/【bgm:】/【se:】 标签行) —— 标签行在解析时当事件, 不会变成旁白 ❌ */
          if (rows.length) { vfSetLines(vfMode(), rows); }     // ★ 存进当前这套 (有音频/无音频各存各的)
        }
        const tmsg = '保存成功（预览：只更新了这边的虚拟楼层，没写进真实聊天）';
        const line = el('div', 'tgm-log', tmsg);
        logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
        refreshPreview();
        setTimeout(() => { try { frame.contentWindow.postMessage({ __gv: 1, type: 'toast', arg: tmsg }, '*'); } catch (x) {} }, 900);
        return;
      }
      /* ★ 悬浮窗「包」里的"清除本机素材包缓存": 预览里也真的清 (= 同一个浏览器同一个库), 清完重画预览 */
      if (d.type === 'clearPackCache') {
        clearPackCache().then(function (n) {
          const txt = '已清除本机素材包缓存（' + n + ' 项）';
          const line = el('div', 'tgm-log', txt); logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
          setTimeout(() => { try { frame.contentWindow.postMessage({ __gv: 1, type: 'toast', arg: txt }, '*'); } catch (x) {} }, 60);
          refreshPreview();
        }).catch(function (e) {
          const line = el('div', 'tgm-log tgm-logerr', '清除失败: ' + e.message); logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
        });
        return;
      }
      if (d.type === 'setPrompt' || d.type === 'convertCfg' || d.type === 'packFile' || d.type === 'redraw') {
        if (d.type === 'convertCfg') { try { localStorage.setItem('gv_convert_api_v1', JSON.stringify(d.arg || {})); } catch (x) {} }
        if (d.type === 'redraw') refreshPreview();
        const txt = d.type === 'setPrompt' ? '保存成功（预览：没有真的写入；真实聊天里会写回提示词）'
          : d.type === 'convertCfg' ? '保存成功（预览：没有真的存到本机；真实聊天里会存进浏览器）'
          : d.type === 'packFile' ? ('导入成功：' + ((d.arg && d.arg.name) || '') + '（预览：没有真的解包）')
          : '已重绘（预览）';
        setTimeout(() => { try { frame.contentWindow.postMessage({ __gv: 1, type: 'toast', arg: txt }, '*'); } catch (x) {} }, 60);
        const line = el('div', 'tgm-log', txt);
        logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
        return;
      }
      if (d.type === 'move') { vPanelOffset = d.arg || null; return; }   // 记下悬浮窗位置
      if (d.type === 'mini') return;
      if (d.type === 'edit') {
        /* 悬浮窗的编辑由模板自己把它那一格整块变成编辑器, 宿主不插界面 */
        const line = el('div', 'tgm-log', '编辑：这一格已经变成编辑器（改完点「确认修改」）');
        logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
        return;
      }
      if (d.type === 'copy' || d.type === 'up' || d.type === 'down' || d.type === 'delete' || d.type === 'toggle-user-avatar') {
        /* 这些按钮作用在【虚拟楼层】上, 点了就真的变, 刷新预览恢复 */
        const inPanel = (tplTab === 'panel') && d.arg != null;
        let msg = '';
        if (d.type === 'toggle-user-avatar') {
          vChat.showUA = !vChat.showUA;
          msg = vChat.showUA ? '虚拟楼层：显示 User 头像' : '虚拟楼层：隐藏 User 头像';
        } else if (d.type === 'delete') {
          if (inPanel) { vChat.panel = vChat.panel.filter(e => String(e.id) !== String(d.arg)); msg = '虚拟楼层：删掉 #' + d.arg + ' 的附加内容'; }
          else { vChat.deleted[tplTab === 'user' ? 'user' : 'char'] = true; msg = '虚拟楼层：这一层被删掉了（点「刷新预览」恢复）'; }
        } else if (d.type === 'up' || d.type === 'down') {
          if (inPanel) {
            const i = vChat.panel.findIndex(e => String(e.id) === String(d.arg));
            const j = d.type === 'up' ? i - 1 : i + 1;
            if (i >= 0 && j >= 0 && j < vChat.panel.length) { const t = vChat.panel[i]; vChat.panel[i] = vChat.panel[j]; vChat.panel[j] = t; msg = '虚拟楼层：附加内容 ' + (d.type === 'up' ? '上移' : '下移') + ' 了一格'; }
            else msg = '虚拟楼层：已经在' + (d.type === 'up' ? '最上面' : '最下面') + '了';
          } else {
            vChat.order = vChat.order.slice().reverse();
            msg = '虚拟楼层：和另一层换了位置（' + vChat.order.join(' → ') + '）';
          }
        } else if (d.type === 'copy') {
          let txt = '';
          if (inPanel) { const e = vChat.panel.find(x => String(x.id) === String(d.arg)); txt = (e && (e.raw || '')) || ''; }
          else txt = (tplTab === 'user') ? vFloor.user.text : vfLines().join('\n');
          try { navigator.clipboard.writeText(txt); } catch (x) {}
          msg = '虚拟楼层：已复制 ' + txt.length + ' 字';
        }
        const line = el('div', 'tgm-log', msg);
        logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
        refreshPreview(false);
        return;
      }
      if (d.type === 'error' || d.type === 'log') {
        const line = el('div', 'tgm-log' + (d.type === 'error' ? ' tgm-logerr' : ''), (d.type === 'error' ? '错误：' : '') + (Array.isArray(d.arg) ? d.arg.join(' ') : String(d.arg)));
        logs.appendChild(line); logs.scrollTop = logs.scrollHeight;
      }
    });
    bPrev.addEventListener('click', () => refreshPreview(true));
    bSave.addEventListener('click', async () => { await putProjectData(cur); flash('已保存 ✓'); });
    bReset.addEventListener('click', async () => {
      if (!def) return flash('这一层没有默认模板');   // def 已按「有音频 / 无音频」选好
      cur.pages[pk] = { html: def.html, css: def.css, js: def.js };
      await putProjectData(cur); renderPages();
      flash('这一层已恢复默认并保存 ✓');
    });
    await refreshPreview(true);
    await refreshPreview(true);
  }

  /* ---- 特殊演出页 ---- */
  /* 内置演出: 名字只显示英文 (AI 就写这个), 中文只作为弹窗里的"作用解释" */
  const BUILTIN_FX = [
    ['shake', '抖动', '立绘左右快速抖两下 —— 被吓到 / 被戳到 / 生气时用。'],
    ['jump', '弹跳', '立绘向上弹一下再落回原位 —— 雀跃、被吓一跳。'],
    ['zoom', '放大', '镜头推近（轻微放大后回位）—— 强调某一句。'],
    ['dim', '变暗', '立绘整体压暗 —— 情绪低落、或退到背景里。'],
    ['flash', '闪白', '整屏闪一下白 —— 惊吓 / 雷光 / 转场强调。'],
    ['bubble', '文字气泡', '在立绘旁边弹一个表情气泡 —— AI 写 bubble:贴纸名 指定贴哪张。'],
  ];
  function fxNameOf(id) { return ((cur && cur.fxNames) || {})[id] || id; }
  function fxIsHidden(id) { return !!((cur && cur.fxHidden) || []).includes(id); }
  /* 内置演出的 CSS: 从引擎样式表里抠出来给用户看 */
  async function builtinFxCss(id) {
    try {
      const css = await fetchText('/galgame/galgame.css');
      const out = [];
      const kf = new RegExp('@keyframes\\s+gv-' + id + '\\s*\\{[\\s\\S]*?\\n\\}', 'g');
      const cl = new RegExp('[^{}]*\\.gv-' + id + '\\b[^{}]*\\{[^}]*\\}', 'g');
      let m; while ((m = kf.exec(css))) out.push(m[0].trim());
      while ((m = cl.exec(css))) out.push(m[0].trim());
      return out.join('\n\n') || ('/* galgame.css 里没有 gv-' + id + ' 的样式块 */');
    } catch (e) { return '/* 读取 galgame.css 失败: ' + ((e && e.message) || e) + ' */'; }
  }
  /* 点一下内置演出 -> 说明 + CSS + 重命名/重置/删除 */
  async function openBuiltinFx(id) {
    const def = BUILTIN_FX.find(x => x[0] === id) || [id, '', ''];
    const shown = fxNameOf(id);
    const css = await builtinFxCss(id);
    const ta = el('textarea', 'tgm-ta'); ta.readOnly = true; ta.spellcheck = false;
    ta.style.minHeight = '170px'; ta.value = css;
    const mask = el('div', 'tgm-dlg-mask');
    const box = el('div', 'tgm-dlg');
    box.appendChild(el('div', 'tgm-dlg-head', '内置演出：' + shown));
    const body = el('div', 'tgm-dlg-body');
    body.appendChild(el('div', 'tgm-dlg-text', def[2] || ''));
    body.appendChild(el('div', 'tgm-dlg-text', '下面是实现它的 CSS（只读）。AI 在台词第 4 个字段里写「' + shown + '」就会播放。'));
    body.appendChild(ta);
    box.appendChild(body);
    const foot = el('div', 'tgm-dlg-foot');
    const bRen = el('div', 'tgm-btn', '重命名');
    const bRst = el('div', 'tgm-btn', '重置');
    const bDel = el('div', 'tgm-btn tgm-danger', '删除');
    const bX = el('div', 'tgm-btn', '关闭');
    foot.append(bRen, bRst, bDel, bX); box.appendChild(foot);
    mask.appendChild(box); document.body.appendChild(mask);
    const close = () => mask.remove();
    bX.addEventListener('click', close);
    bRen.addEventListener('click', async () => {
      const n = await askText('重命名内置演出', '新名字（建议英文；AI 就写这个名字）。原来是「' + id + '」。', shown, '例如 quake');
      if (n == null) return;
      const nm = String(n).trim(); if (!nm) return;
      cur.fxNames = cur.fxNames || {}; cur.fxAliases = cur.fxAliases || {};
      if (nm === id) { delete cur.fxNames[id]; delete cur.fxAliases[id]; }
      else { cur.fxNames[id] = nm; cur.fxAliases[id] = nm; }
      await putProjectData(cur); close(); renderEffects();
    });
    bRst.addEventListener('click', async () => {
      if (cur.fxNames) delete cur.fxNames[id];
      if (cur.fxAliases) delete cur.fxAliases[id];
      if (cur.fxHidden) cur.fxHidden = cur.fxHidden.filter(x => x !== id);
      await putProjectData(cur); close(); renderEffects();
    });
    bDel.addEventListener('click', async () => {
      const ok = await askConfirm('删除内置演出', '「' + shown + '」会从这一页和提示词里去掉（以后可以「重置」找回来）。', true);
      if (!ok) return;
      cur.fxHidden = cur.fxHidden || []; if (cur.fxHidden.indexOf(id) < 0) cur.fxHidden.push(id);
      await putProjectData(cur); close(); renderEffects();
    });
  }
  const BUBBLE_ANIMS = [
    ['pop', '弹出（上下）'], ['left', '左右滑入'], ['diag', '斜向飞入'],
    ['blink', '闪烁两下'], ['none', '不做动画'],
  ];
  /* ---- 气泡演出(E 区): 内置五个可以改名/改 CSS/隐藏, 也能自己写新的 ----
     命名规则和内置演出一样: 动画键 k 对应 CSS 类 gv-b-k (引擎里就是这么加的类) */
  function bubbleAnimName(k) { return ((cur && cur.bubbleAnimNames) || {})[k] || k; }
  function bubbleAnimIsHidden(k) { return !!((cur && cur.bubbleAnimHidden) || []).includes(k); }
  function bubbleAnimCustom(k) { return ((cur && cur.bubbleFx) || []).find(function (x) { return x && x.key === k; }) || null; }
  /* [键, 中文说明, 显示名, 是不是自己写的] —— includeHidden 给新建时的查重留口子 */
  function bubbleAnimList(includeHidden) {
    const out = [];
    BUBBLE_ANIMS.forEach(function (x) {
      if (!includeHidden && bubbleAnimIsHidden(x[0])) return;
      out.push([x[0], x[1], bubbleAnimName(x[0]), false]);
    });
    ((cur && cur.bubbleFx) || []).forEach(function (x) { if (x && x.key) out.push([x.key, x.name || x.key, x.name || x.key, true]); });
    return out;
  }
  /* CSS 里从某个 '{' 开始按括号配对切整块 (正则写法在"内联花括号的 keyframes"上会漏掉) */
  function cssBlockAt(css, idx) {
    let d = 0;
    for (let i = idx; i < css.length; i++) {
      const ch = css[i];
      if (ch === '{') d++;
      else if (ch === '}') { d--; if (!d) return css.slice(idx, i + 1); }
    }
    return '';
  }
  /* 内置气泡演出的 CSS: 和 A 区一样从引擎样式表里抠出来给用户看/改 */
  async function builtinBubbleCss(k) {
    try {
      const css = await fetchText('/galgame/galgame.css');
      const out = [];
      const kf = css.search(new RegExp('@keyframes\\s+gv-b-' + k + '\\s*\\{'));
      if (kf >= 0) { const ki = css.indexOf('{', kf); out.push(css.slice(kf, ki).trim() + ' ' + cssBlockAt(css, ki)); }
      const re = new RegExp('\\.gv-b-' + k + '\\b', 'g');
      let m;
      while ((m = re.exec(css))) {
        const bi = css.indexOf('{', m.index);
        if (bi < 0) break;
        let s = m.index; while (s > 0 && '};'.indexOf(css[s - 1]) < 0) s--;
        const head = css.slice(s, bi).trim();
        if (head.indexOf('@keyframes') >= 0) continue;
        out.push(head + ' ' + cssBlockAt(css, bi));
      }
      return out.join('\n\n') || ('/* galgame.css 里没有 gv-b-' + k + ' 的样式块 */');
    } catch (e) { return '/* 读取 galgame.css 失败: ' + ((e && e.message) || e) + ' */'; }
  }
  async function bubbleAnimCss(k) {
    const own = ((cur && cur.bubbleAnimCss) || {})[k];
    if (own != null && String(own).trim()) return own;
    const cx = bubbleAnimCustom(k);
    if (cx) return cx.css || '';
    return await builtinBubbleCss(k);
  }
  /* ★ 自定义演出 (特殊演出 → B) 的映射表: 名字 -> {css, cls, target, duration, js}
     重命名过的内置演出也一起进 (cls 指向内置那个类) —— 预览 payload 和导出脚本共用这一个, 保证所见即所得 */
  function fxMap(p) {
    const out = {};
    Object.keys((p && p.fxAliases) || {}).forEach(function (k) { const nm = p.fxAliases[k]; if (nm) out[nm] = { css: '', cls: 'gv-' + k, target: 'sprite', duration: 900 }; });
    ((p && p.effects) || []).forEach(function (e) {
      if (e && e.name) out[e.name] = { css: e.css || '', cls: e.cls || ('gv-fx-' + e.name), target: e.target || 'sprite', duration: e.duration || 900, js: e.js || '' };
    });
    return out;
  }
  /* 交给引擎/预览的额外气泡 CSS: 改过的内置 + 自己写的(没被覆盖的) */
  function bubbleCssText(p) {
    const out = [], own = (p && p.bubbleAnimCss) || {};
    Object.keys(own).forEach(function (k) { if (own[k] && String(own[k]).trim()) out.push('/* ' + k + ' */\n' + own[k]); });
    ((p && p.bubbleFx) || []).forEach(function (x) { if (x && x.key && x.css && !(own[x.key] && String(own[x.key]).trim())) out.push('/* ' + x.key + ' */\n' + x.css); });
    return out.join('\n\n');
  }
  /* 气泡演出的弹窗: 看/改 CSS + 重命名 / 重置 / 删除 / 关闭 */
  async function openBubbleAnim(key) {
    const cx0 = bubbleAnimCustom(key);
    const cn = (BUBBLE_ANIMS.find(function (x) { return x[0] === key; }) || [])[1] || '自己写的';
    const ta = el('textarea', 'tgm-ta'); ta.spellcheck = false; ta.style.minHeight = '190px';
    ta.value = await bubbleAnimCss(key);
    const mask = el('div', 'tgm-dlg-mask');
    const box = el('div', 'tgm-dlg');
    box.appendChild(el('div', 'tgm-dlg-head', '气泡演出：' + bubbleAnimName(key) + (cx0 ? '（自己写的）' : '（内置 · ' + cn + '）')));
    const body = el('div', 'tgm-dlg-body');
    body.appendChild(el('div', 'tgm-dlg-text', '这段就是贴纸入场时播的动画，类名固定是 gv-b-' + key + '（引擎给贴纸加的就是这个类）。改完点保存；去「C · 气泡位置」那边点「展示气泡动画」能直接看效果。'));
    body.appendChild(ta);
    box.appendChild(body);
    const foot = el('div', 'tgm-dlg-foot');
    const bSave = el('div', 'tgm-btn tgm-primary', '保存');
    const bRen = el('div', 'tgm-btn', '重命名');
    const bRst = el('div', 'tgm-btn', '重置');
    const bDel = el('div', 'tgm-btn tgm-danger', '删除');
    const bX = el('div', 'tgm-btn', '关闭');
    foot.append(bSave, bRen, bRst, bDel, bX); box.appendChild(foot);
    mask.appendChild(box); document.body.appendChild(mask);
    const close = () => mask.remove();
    const st = el('div', 'tgm-dlg-text', ''); body.appendChild(st);
    const flash = t => { st.textContent = t; setTimeout(function () { if (st.textContent === t) st.textContent = ''; }, 1800); };
    bX.addEventListener('click', close);
    bSave.addEventListener('click', async () => {
      cur.bubbleAnimCss = cur.bubbleAnimCss || {};
      cur.bubbleAnimCss[key] = ta.value;
      const cx = bubbleAnimCustom(key); if (cx) { cx.css = ta.value; cx.name = cx.name || key; }
      await putProjectData(cur); flash('已保存 ✓'); renderEffects();
    });
    bRen.addEventListener('click', async () => {
      const n = await askText('重命名气泡演出', cx0 ? '新名字（英文更稳，CSS 里的类名会一起改）。' : '只改显示名，CSS 类名还是 gv-b-' + key + '。', bubbleAnimName(key), '例如 wiggle');
      if (n == null) return;
      const nm = String(n).trim(); if (!nm) return;
      if (cx0) {
        const nk = nm.replace(/[^\w-]/g, ''); if (!nk) return;
        const css = String(ta.value || '').split('gv-b-' + key).join('gv-b-' + nk);
        cur.bubbleFx = (cur.bubbleFx || []).filter(function (x) { return x.key !== key; });
        cur.bubbleFx.push({ key: nk, name: nm, css: css });
        if (cur.bubbleAnimCss && cur.bubbleAnimCss[key] != null) { cur.bubbleAnimCss[nk] = css; delete cur.bubbleAnimCss[key]; }
        const bm = cur.bubbleAnim || {}; Object.keys(bm).forEach(function (id) { if (bm[id] === key) bm[id] = nk; });
      } else {
        cur.bubbleAnimNames = cur.bubbleAnimNames || {};
        if (nm === key) delete cur.bubbleAnimNames[key]; else cur.bubbleAnimNames[key] = nm;
      }
      await putProjectData(cur); close(); renderEffects();
    });
    bRst.addEventListener('click', async () => {
      if (cur.bubbleAnimCss) delete cur.bubbleAnimCss[key];
      if (cur.bubbleAnimNames) delete cur.bubbleAnimNames[key];
      await putProjectData(cur);
      ta.value = await bubbleAnimCss(key);
      flash('已恢复默认 CSS');
      renderEffects();
    });
    bDel.addEventListener('click', async () => {
      if (cx0) {
        const ok = await askConfirm('删除气泡演出', '「' + bubbleAnimName(key) + '」会被删掉；用到它的贴纸会自动换成「弹出（上下）」。', true);
        if (!ok) return;
        cur.bubbleFx = (cur.bubbleFx || []).filter(function (x) { return x.key !== key; });
        if (cur.bubbleAnimCss) delete cur.bubbleAnimCss[key];
        const bm = cur.bubbleAnim || {}; Object.keys(bm).forEach(function (id) { if (bm[id] === key) delete bm[id]; });
      } else {
        const ok = await askConfirm('删除内置气泡演出', '「' + bubbleAnimName(key) + '」会从这一页和贴纸动画下拉里去掉（以后可以「重置全部」找回来）。', true);
        if (!ok) return;
        cur.bubbleAnimHidden = cur.bubbleAnimHidden || []; if (cur.bubbleAnimHidden.indexOf(key) < 0) cur.bubbleAnimHidden.push(key);
      }
      await putProjectData(cur); close(); renderEffects();
    });
  }

  /* ★ 指导提示词: 自定义演出 (B 区) —— 照引擎 applyFx 的真实行为写:
     CONFIG.effects[名字] -> 给目标元素加 cls||gv-fx-名字 -> 强制重排 -> duration 后移除; js 走 new Function(el, ctx) */
  function fxPromptText() {
    const builtin = BUILTIN_FX.filter(function (x) { return !fxIsHidden(x[0]); })
      .map(function (x) { return fxNameOf(x[0]) + '（' + x[1] + '）'; }).join('、');
    const mine = (cur.effects || []).map(function (e) { return e && e.name; }).filter(Boolean);
    return [
      '文字游戏楼层 · 自定义演出组（教 AI 写 CSS / 可选 JS）',
      '======================================================================',
      '',
      '【这段给谁看】给帮你写演出效果的 AI。整份复制过去，让它只回代码，你直接粘进制作器。',
      '',
      '一、演出是怎么被用起来的',
      '楼层台词的一行是：',
      '  角色名|表情|台词|演出效果|站位|音效        （多人预设；单人没有「站位」那一格）',
      '第 4 格「演出效果」里写一个词，引擎就播这个名字的演出；一行可以写多个，用 , ， 、 + 空格 分开。',
      '内置这几个引擎自带，不用你写：' + builtin, 
      (mine.length ? '这个方案里已经做过的自定义演出（别重名）：' + mine.join('、') : '这个方案里还没有自定义演出。'),
      '',
      '二、你要输出什么',
      '① 一段 CSS（必须）：@keyframes 定义 + 一个类选择器',
      '② 一段 JS（可选）：演出触发的那一刻执行一次',
      '',
      '三、类名规则（最关键）',
      '使用者给演出起的英文名 = 引擎加在目标元素上的类名后缀。名字叫 glow，引擎就是给目标元素加上 gv-fx-glow 这个 class，所以 CSS 必须写：',
      '',
      '  @keyframes gv-fx-glow-kf {',
      '    0%   { transform: translateY(0);   opacity: 1; }',
      '    50%  { transform: translateY(-6%); opacity: .85; }',
      '    100% { transform: translateY(0);   opacity: 1; }',
      '  }',
      '  .gv-fx-glow { animation: gv-fx-glow-kf .6s ease; }',
      '',
      '@keyframes 的名字随你起（建议带上这个名字，别撞内置的 gv-shake / gv-jump / gv-zoom / gv-dim / gv-flash / gv-bubble）。',
      '',
      '四、作用元素 + 时长',
      '制作器里要选一个「作用在」：立绘（立绘那块元素，class gv-sprite）/ 背景 / 整个画面（舞台那一层）。',
      '引擎的动作固定是：加类 → 强制重排 → 播动画 → 到「时长(ms)」之后把类去掉。由此：',
      '  1. animation 的时长要和你填的「时长(ms)」对得上，不然动画播一半就被掐掉',
      '  2. 别指望 animation-fill-mode: forwards 把元素留在终态 —— 类一移除就回原样',
      '  3. 同一个演出连写两次 = 从头再播一次',
      '（注意：自定义演出是楼层引擎播放的。如果把这一层换成了自己写的页面模板，要在模板的 applyFx 里自己加一段 —— 照内置那几个的样子写。）',
      '',
      '五、硬限制（写了也不生效的）',
      '· 楼层跑在沙箱 iframe 里：不能引外链 / CDN / @import / 外部字体和图片。要图形就用内联 SVG 或 data: URI 的小图。',
      '· 只动 transform / opacity / filter 最稳。别改 position / display / width / height / margin（会把排版搞乱，动画结束后也不会自动恢复）。',
      '· 别写 :hover / :active / :focus（演出是自动播放的，没有鼠标交互）。',
      '· JS 那段的执行方式是 new Function，形参固定两个：第一个是 el（被作用的元素），第二个是 ctx（现在只有 name 和 slot，两个都还是空字符串，别依赖）。',
      '  JS 里出错只会写进浏览器控制台，不会中断剧情；所以别发网络请求、也别留 setInterval（页面销毁不会帮你清）。',
      '',
      '六、风格建议（不是硬规定）',
      '· 时长一般 300–1200ms；一次只表达一个情绪（受惊就抖一下，别又抖又闪又转）',
      '· 幅度小一点更耐看：位移用百分比（相对元素自身），缩放 1.05–1.3',
      '· 和内置的思路对齐：抖动 / 弹跳 / 推近 / 压暗 / 闪白，各管一种情绪',
      '',
      '七、请这样回我',
      '只回代码，用围栏分成两段（没有 JS 就只回第一段）：第一段 css（@keyframes + .gv-fx-名字），第二段 js（可选）。',
      '不要额外解释，我要直接把两段粘进制作器的两个框里。',
    ].join('\n');
  }

  /* ★ 指导提示词: 气泡演出 (E 区) —— 照引擎/模板 showSticker 的真实行为写:
     贴纸 reset 成 .gv-sticker -> 重排 -> 加 gv-on + gv-b-键 -> BUBBLEMS(1900ms) 后去掉 gv-on */
  function bubbleAnimPromptText() {
    const keys = bubbleAnimList(true).map(function (it) { return it[0] + '（' + it[1] + '）'; }).join('、');
    return [
      '文字游戏楼层 · 气泡演出（情绪气泡贴纸的入场动画）',
      '======================================================================',
      '',
      '【这段给谁看】给帮你写气泡动画的 AI。整份复制过去，让它只回一段 CSS。',
      '',
      '一、它是怎么播的',
      '楼层里 AI 写 bubble:名字 就弹出一张情绪气泡贴纸（内置 20 张 + 使用者自己导入的）。每张贴纸可以配一个入场动画。',
      '贴纸出现时引擎的动作：class 重置成只有 gv-sticker → 强制重排 → 加上 gv-on gv-b-键 → 1.9 秒后移除 gv-on（贴纸收起）。',
      '贴纸一直在 DOM 里，靠 opacity 显隐；没有淡出过渡，时间到就直接不见。',
      '',
      '二、贴纸的 DOM 和几何（写之前必须知道）',
      '  div.gv-sticker 里面一张 img',
      '  .gv-sticker 的固定样式（引擎样式表里的，别去改它）：',
      '    position: absolute; left: var(--gv-bx); top: var(--gv-by); width: 30%;',
      '    transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); transform-origin: 50% 50%; opacity: 0;',
      '    .gv-sticker.gv-on { opacity: 1; }',
      '也就是说：贴纸的静止状态 = 中心落在 (--gv-bx, --gv-by) 那个点、大小 = --gv-bs（制作器里那个缩放）。',
      '入场动画就是从这个状态之外飞进来 / 弹出来，最后回到这个状态。',
      '',
      '三、类名规则（最关键）',
      '动画键（英文）= 引擎加在贴纸上的类名后缀：CSS 写 .gv-sticker.gv-b-键 { animation: ... }。',
      '内置这几种（别重名）：' + keys, 
      '',
      '四、两条必须遵守的',
      '1. 每个关键帧都要写全 transform，基线是 translate(-50%, -50%) scale(var(--gv-bs, 1))：',
      '     0%   { transform: translate(calc(-50% + 60px), -50%) scale(calc(var(--gv-bs, 1) * .6)); opacity: 0; }',
      '     100% { transform: translate(-50%, -50%) scale(var(--gv-bs, 1)); opacity: 1; }',
      '   漏掉 translate(-50%,-50%) 气泡会跑到左上角（那是它居中用的偏移）；要缩放就在 scale 里乘 --gv-bs，别写死数字，使用者可能把气泡缩到 0.5×。',
      '2. 用 animation-fill-mode: forwards，最后一帧必须是上面那个「回到基线」的状态；动画总时长建议 0.3–0.9 秒（贴纸只显示 1.9 秒，太长会被收起掐掉）。',
      '',
      '五、硬限制',
      '· 沙箱里没有外链：不能引 CDN / @import / 外部字体图片；要图形就用内联 SVG 或 data: URI',
      '· 只动 transform / opacity / filter；别改 position / width / height',
      '· 别写 :hover 之类交互态（动画是自动播的）',
      '',
      '六、请这样回我',
      '只回一段用围栏包起来的 css：@keyframes 加 .gv-sticker.gv-b-键，不要额外解释，我要直接粘进制作器的气泡演出框。',
    ].join('\n');
  }

  async function renderEffects() {
    const p = UI.panes.effects; if (!p || !cur) return;
    p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '特殊演出'),
      el('div', 'tgm-hint', '两组：对「立绘/画面」做的演出，和「情绪气泡贴纸」。演出名字就是 AI 写在台词第 4 个字段里的词。'));

    /* A. 内置 */
    const c1 = el('div', 'tgm-card');
    const hA = el('div', 'tgm-row');
    hA.appendChild(el('div', 'tgm-h2', 'A · 内置演出'));
    const spA = el('span'); spA.style.flex = '1'; hA.appendChild(spA);
    const bRstAll = el('div', 'tgm-btn', '重置全部');
    hA.appendChild(bRstAll); c1.appendChild(hA);
    c1.appendChild(el('div', 'tgm-dlg-text', '点一下看它的说明和 CSS（可重命名 / 重置 / 删除）。AI 在台词第 4 个字段写这个名字就会播放。'));
    const chips = el('div', 'tgm-row'); chips.style.flexWrap = 'wrap';
    BUILTIN_FX.forEach(([k, cn, desc]) => {
      if (fxIsHidden(k)) return;
      const s = el('span', 'tgm-chip', fxNameOf(k));      // 名字只写英文, 中文只在弹窗里当解释
      s.style.cursor = 'pointer'; s.title = cn;
      s.addEventListener('click', () => openBuiltinFx(k));
      chips.appendChild(s);
    });
    c1.appendChild(chips);
    p.appendChild(c1);
    bRstAll.addEventListener('click', async () => {
      cur.fxNames = {}; cur.fxAliases = {}; cur.fxHidden = [];
      await putProjectData(cur); renderEffects();
    });

    /* B. 自定义演出 */
    const c2 = el('div', 'tgm-card');
    const h2 = el('div', 'tgm-row');
    h2.appendChild(el('div', 'tgm-h2', 'B · 自定义演出'));
    const sp = el('span'); sp.style.flex = '1'; h2.appendChild(sp);
    const bNew = el('div', 'tgm-btn tgm-primary', '新建演出组');
    /* ★ 指导提示词: 给写演出 CSS/JS 的 AI 看 (形式和页面排版那边一样: 复制 / 导出 txt) */
    const bFxPrompt = el('div', 'tgm-btn', '指导提示词');
    bFxPrompt.title = '复制 / 导出这段提示词给别的 AI：它会回一段 CSS（可选 JS），粘进「新建演出组」里就能用';
    bFxPrompt.addEventListener('click', () => showPromptBox({
      title: '指导提示词：自定义演出',
      hint: '整份复制（或导出成 txt）给别的 AI。它回的那段 CSS（@keyframes + .gv-fx-名字）直接粘进「新建演出组」的 CSS 框里。',
      text: fxPromptText(), file: '自定义演出.指导提示词',
    }));
    h2.append(bFxPrompt, bNew); c2.appendChild(h2);
    c2.appendChild(el('div', 'tgm-dlg-text', '写一段 CSS（keyframes + 类名），引擎会把它注入进来；AI 在台词里写这个名字就会播放。'));
    p.appendChild(c2);
    cur.effects = cur.effects || [];
    if (!cur.effects.length) c2.appendChild(el('div', 'tgm-dlg-text', '还没有自定义演出。'));
    cur.effects.forEach((e, i) => {
      const row = el('div', 'tgm-row');
      row.append(el('span', 'tgm-gname', e.name), el('span', 'tgm-imeta', e.target + ' · ' + (e.duration || 900) + 'ms'));
      const s2 = el('span'); s2.style.flex = '1'; row.appendChild(s2);
      const bE = el('div', 'tgm-btn', '编辑'); const bD = el('div', 'tgm-btn tgm-danger', '删除');
      row.append(bE, bD); c2.appendChild(row);
      bE.addEventListener('click', () => editEffect(i));
      bD.addEventListener('click', async () => { cur.effects.splice(i, 1); await putProjectData(cur); renderEffects(); });
    });
    bNew.addEventListener('click', () => editEffect(-1));

    /* C. 气泡位置 */
    const c3 = el('div', 'tgm-card');
    const h3 = el('div', 'tgm-row');
    h3.appendChild(el('div', 'tgm-h2', 'C · 气泡位置 / 大小'));
    const sp3 = el('span'); sp3.style.flex = '1'; h3.appendChild(sp3);
    const bPos = el('div', 'tgm-btn tgm-primary', '编辑位置（拖动）');
    h3.appendChild(bPos); c3.appendChild(h3);
    /* ★ 多站位: 气泡落点可以【每个站位各调一套】(默认进来调第一个站位那一套)。
       立绘站位那边不能这么干(排版必须跟提示词里的站位词一致), 但气泡只是个小贴纸, 每个站位都能单独摆。 */
    const _slotsC = cur.slots || [];
    const _slotPick = _slotsC.length >= 2
      ? ((cur.bubbleSlotPick && _slotsC.indexOf(cur.bubbleSlotPick) >= 0) ? cur.bubbleSlotPick : _slotsC[0])
      : '';
    if (_slotsC.length >= 2) {
      const rSl = el('div', 'tgm-row');
      rSl.appendChild(el('div', 'tgm-code', '调整哪个站位'));
      _slotsC.forEach(function (s) {
        const b = el('div', 'tgm-btn' + (s === _slotPick ? ' tgm-primary' : ''), s);
        b.title = '这一套落点只对站在「' + s + '」的角色生效（拖的时候垫底立绘也站在这个位置）';
        b.addEventListener('click', async () => { cur.bubbleSlotPick = s; await putProjectData(cur); renderEffects(); });
        rSl.appendChild(b);
      });
      c3.appendChild(rSl);
    }
    const _bpSlot = (cur.bubblePosSlot || {})[_slotPick] || null;   // 这个站位单独调过就用它自己的
    const bp = _bpSlot || cur.bubblePos || { x: 78, y: 24, scale: 1 };
    const _bpEach = cur.bubblePosEach || {};
    const _bpKeys = Object.keys(_bpEach);
    c3.appendChild(el('div', 'tgm-dlg-text', (_slotPick ? '「' + _slotPick + '」站位：' : '默认 ') + 'x ' + Math.round(bp.x) + '% / y ' + Math.round(bp.y) + '% / ' + Number(bp.scale).toFixed(2) + '×'
      + (_slotPick && !_bpSlot ? '（还没单独调过，现在跟默认一样）' : '')
      + (_bpKeys.length ? '　·　' + _bpKeys.length + ' 个气泡单独调过：' + _bpKeys.slice(0, 6).join('、') + (_bpKeys.length > 6 ? '…' : '') : '　·　还没有单独调过的气泡')));
    c3.appendChild(el('div', 'tgm-hint', '编辑器里的框 = 你在「页面排版 → 定位框」填的宽高；框里垫着第一张背景 + 第一张立绘（「切换角色 / 切换立绘」逐个对照）。多人站位时上面多一排「调整哪个站位」：每个站位各有一套落点，垫底的立绘也会站在那个站位上。框里还有「切换气泡 ⇄」（每个贴纸单独摆位）和「展示气泡动画 ▶」（直接看它配的入场动画）。气泡中心点落 x/y、宽度固定 30%，和引擎 .gv-sticker 同一套规则。'));
    p.appendChild(c3);
    bPos.addEventListener('click', async () => {
      /* 气泡清单: 「默认」+ 内置 20 张 + 自己导入的 —— 每个都能单独摆位
         ★ 「默认」不是贴纸: 用一张透明占位图 + 虚线框(见 .tgm-frame-pt-def)。
         以前这里借的是第一张贴纸的图(还写死 pop 动画), 于是列表里出现"两张闪光、动画不一样", 数目也多算了 1 */
      const _eachB = cur.bubblePosEach || {};
      const _base = bp;                       /* 本档基准 = 这个站位单独调过的, 没有就用默认 */
      const _visB = stickerList(cur);
      const _bubs = [{ key: '', label: '默认（所有气泡）', url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', fit: _base || { x: 78, y: 24, scale: 1 }, anim: 'pop' }];
      _visB.forEach(function (s) {
        _bubs.push({ key: s[0], label: s[0] + '（' + s[1] + '）', url: stickerUrl(s[0]),
          fit: _eachB[s[0]] || _base || { x: 78, y: 24, scale: 1 }, anim: (cur.bubbleAnim || {})[s[0]] || 'pop' });
      });
      (cur.stickers || []).forEach(function (s) {
        _bubs.push({ key: s.name, label: s.name + '（自己导入）', url: s.url,
          fit: _eachB[s.name] || _base || { x: 78, y: 24, scale: 1 }, anim: (cur.bubbleAnim || {})[s.name] || 'pop' });
      });
      const _bIdx = Math.max(0, _bubs.findIndex(function (b) { return b.key === (cur.bubblePick || ''); }));
      /* 垫底素材: 和实际渲染同一套算法算出来的站位/取景, 这样对着角色摆的位置就是真机上的位置 */
      const _bd0 = (cur.bgList || [])[0];
      const _bdu = _bd0 ? await previewUrl(_bd0) : '';
      const _slots = cur.slots || [];
      const _sps = [];
      for (const _gr of (cur.spriteGroups || [])) {
        const _an = (_gr.faces || []).find(function (x) { return x.id === _gr.anchorFace; }) || (_gr.faces || [])[0] || null;
        const _af = (_an && _an.fit) ? _an.fit : { x: 0, y: 0, scale: 1 };
        for (const _f of (_gr.faces || [])) {
          const _sk = _slotPick || (cur.slotPreview && cur.slotPreview[_f.id]) || _slots[0] || '';   /* ★ 多站位: 垫底立绘站在你正在调的那个站位上 */
          const _ps = (cur.slotPos || {})[_sk] || null;
          const _ix = _slots.indexOf(_sk), _nn = Math.max(1, _slots.length);
          const _bx2 = _ps && typeof _ps.x === 'number' ? _ps.x : (_nn <= 1 || _ix < 0 ? 50 : Math.round(20 + _ix / (_nn - 1) * 60));
          const _by2 = _ps && typeof _ps.y === 'number' ? _ps.y : 100;
          const _bs2 = _ps && _ps.scale ? _ps.scale : 1;
          _sps.push({ group: _gr.name, face: _f.key, label: _gr.name + ' · ' + _f.key, url: await entryUrl(_f), fit: _f.fit || _af,
            base: { x: _bx2, y: _by2, scale: _bs2, w: _slots.length ? '74%' : '100%' } });
        }
      }
      const r = await frameEditor({ title: '气泡位置' + (_slotPick ? '（' + _slotPick + ' 站位）' : '') + '：' + (_bubs.length - 1) + ' 张气泡可以逐个摆（第 1 项「默认」管这个站位下所有没单独调过的）', src: _bubs[_bIdx].url, fit: _bubs[_bIdx].fit,
        place: 'point', minScale: 0.05, backdrop: _bdu, sprites: _sps, bubbles: _bubs, bubbleIndex: _bIdx,
        aspect: ((cur.frameSize && cur.frameSize.h) ? (cur.frameSize.w / cur.frameSize.h) : 9 / 19.5), maxW: cur.frameSize && cur.frameSize.w });
      if (r && r.__bubbles) {
        cur.bubblePosEach = cur.bubblePosEach || {};
        const d = cur.bubblePos || { x: 78, y: 24, scale: 1 };
        const _sameAs = (a, b) => Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01 && Math.abs(a.scale - b.scale) < 0.001;
        r.__bubbles.forEach(function (b) {
          if (!b.key) {
            /* 「默认（所有气泡）」= 当前这一档: 多站位写进那个站位的格子, 单人写全局 */
            if (_slotPick) {
              cur.bubblePosSlot = cur.bubblePosSlot || {};
              if (_sameAs(b.fit, d)) delete cur.bubblePosSlot[_slotPick];   // 和全局默认一样就不存
              else cur.bubblePosSlot[_slotPick] = b.fit;
            } else { cur.bubblePos = b.fit; }
            return;
          }
          const base = _base || d;
          if (_sameAs(b.fit, base)) delete cur.bubblePosEach[b.key]; else cur.bubblePosEach[b.key] = b.fit;   // 和基准一样就不存, 省得一堆重复
        });
        if (r.__bubbleKey) cur.bubblePick = r.__bubbleKey;
        await putProjectData(cur); renderEffects();
      }
    });

    /* D. 气泡贴纸 + 入场动画 */
    const c4 = el('div', 'tgm-card');
    const h4 = el('div', 'tgm-row');
    h4.appendChild(el('div', 'tgm-h2', 'D · 情绪气泡贴纸'));
    const sp4 = el('span'); sp4.style.flex = '1'; h4.appendChild(sp4);
    const bRstS = el('div', 'tgm-btn', '重置');          // 把叉掉的内置贴纸全部找回来
    const bImp = el('div', 'tgm-btn tgm-primary', '导入贴纸');
    const bLink = el('div', 'tgm-btn', '从链接添加');     // ★ 图床链接的贴纸 (纯 URL 模式要用)
    bLink.title = '贴纸也可以直接粘图床直链，不占本地空间、导出脚本时直接写进映射表';
    h4.append(bRstS, bImp, bLink); c4.appendChild(h4);
    const _hidS = cur.stickersHidden || [];
    c4.appendChild(el('div', 'tgm-dlg-text', '内置 20 张情绪气泡，随插件走、离线可用（就是下面这一排）。点一张贴纸就能单独配它的入场动画；AI 写 bubble:名字 就会弹出来。每张右上角的 × = 删掉这张（提示词和导出包里都不再带它），删错了点上面的「重置」找回来。'
      + (_hidS.length ? '　当前已删掉 ' + _hidS.length + ' 张：' + _hidS.slice(0, 8).join('、') + (_hidS.length > 8 ? '…' : '') : '')));
    bRstS.addEventListener('click', async () => {
      if (!(cur.stickersHidden || []).length) { await askConfirm('没删过贴纸', '内置气泡贴纸一张都没删，不用重置。'); return; }
      cur.stickersHidden = []; await putProjectData(cur); renderEffects();
    });
    p.appendChild(c4);
    const grid = el('div', 'tgm-grid'); c4.appendChild(grid);
    cur.bubbleAnim = cur.bubbleAnim || {};
    const _visS = stickerList(cur);
    if (!_visS.length) grid.appendChild(el('div', 'tgm-dlg-text', '内置贴纸都被你删光了（点上面的「重置」能全找回来）。'));
    _visS.forEach(([id, cn]) => {
      const t = el('div', 'tgm-thumb');
      const im = el('img'); im.src = stickerUrl(id); im.loading = 'lazy';
      t.append(im, el('div', 'tgm-tname', cn + ' · ' + (cur.bubbleAnim[id] || 'pop')));
      const ops = el('div', 'tgm-thumb-ops');
      const bX = el('div', 'tgm-btn tgm-danger', '×'); ops.appendChild(bX); t.appendChild(ops);
      t.style.cursor = 'pointer';
      bX.addEventListener('click', async ev => {
        ev.stopPropagation();
        cur.stickersHidden = cur.stickersHidden || [];
        if (cur.stickersHidden.indexOf(id) < 0) cur.stickersHidden.push(id);
        await putProjectData(cur); renderEffects();
      });
      t.addEventListener('click', async ev => {
        if (ev.target === bX) return;
        const sel = el('select', 'tgm-sel');
        bubbleAnimList(false).forEach(([v, tx, nm]) => { const o = el('option', '', nm + (nm === v ? '' : '（' + tx + '）')); o.value = v; sel.appendChild(o); });
        sel.value = cur.bubbleAnim[id] || 'pop';
        const ok = await dialog({ title: '「' + cn + '」的入场动画', text: 'bubble:' + id + '　（动画在「E · 气泡演出」里能看 CSS / 改 / 加新的）', extra: sel, okText: '保存' });
        if (!ok) return;
        cur.bubbleAnim[id] = sel.value; await putProjectData(cur); renderEffects();
      });
      grid.appendChild(t);
    });
    /* 自己导入的贴纸 */
    (cur.stickers || []).forEach((s, i) => {
      const t = el('div', 'tgm-thumb');
      const im = el('img'); im.src = s.url; im.loading = 'lazy';
      t.append(im, el('div', 'tgm-tname', s.name + ' · ' + (cur.bubbleAnim[s.name] || 'pop')));
      const ops = el('div', 'tgm-thumb-ops');
      const bD = el('div', 'tgm-btn tgm-danger', '×'); ops.appendChild(bD); t.appendChild(ops);
      t.style.cursor = 'pointer';
      t.addEventListener('click', async ev => {
        if (ev.target === bD) return;
        const sel = el('select', 'tgm-sel');
        bubbleAnimList(false).forEach(([v, tx, nm]) => { const o = el('option', '', nm + (nm === v ? '' : '（' + tx + '）')); o.value = v; sel.appendChild(o); });
        sel.value = cur.bubbleAnim[s.name] || 'pop';
        const ok = await dialog({ title: '「' + s.name + '」的入场动画', text: 'bubble:' + s.name + '　（动画在「E · 气泡演出」里能看 CSS / 改 / 加新的）', extra: sel, okText: '保存' });
        if (!ok) return;
        cur.bubbleAnim[s.name] = sel.value; await putProjectData(cur); renderEffects();
      });
      bD.addEventListener('click', async ev => { ev.stopPropagation(); cur.stickers.splice(i, 1); await putProjectData(cur); renderEffects(); });
      grid.appendChild(t);
    });
    bImp.addEventListener('click', async () => {
      const n = await askText('导入贴纸', '给它起个名字（AI 就写 bubble:名字）。', '', '例如 脸红'); if (!n) return;
      const f = await pickFile('image/*'); if (!f) return;
      const url = URL.createObjectURL(f);
      cur.stickers = cur.stickers || []; cur.stickers.push({ name: String(n).trim(), url: url, file: f });
      await putProjectData(cur); renderEffects();
    });
    bLink.addEventListener('click', async () => {
      const n = await askText('从链接添加贴纸', '给它起个名字（AI 就写 bubble:名字）。', '', '例如 脸红'); if (!n) return;
      const u = await askText('从链接添加贴纸', '粘贴图片直链（http/https 开头）。', '', 'https://...');
      if (!u) return;
      const s = String(u).trim();
      if (!/^https?:/i.test(s)) { await dialog({ title: '链接不对', text: '要以 http:// 或 https:// 开头。', okText: '知道了' }); return; }
      cur.stickers = cur.stickers || []; cur.stickers.push({ name: String(n).trim(), url: s, kind: 'url' });
      await putProjectData(cur); renderEffects();
    });

    /* E. 气泡演出 (和 A 区一个形式: 点开看 CSS, 可改可重命名可删, 也能自己写新的) */
    const c5 = el('div', 'tgm-card');
    const h5 = el('div', 'tgm-row');
    h5.appendChild(el('div', 'tgm-h2', 'E · 气泡演出'));
    const sp5 = el('span'); sp5.style.flex = '1'; h5.appendChild(sp5);
    const bRstB = el('div', 'tgm-btn', '重置全部');
    const bNewB = el('div', 'tgm-btn tgm-primary', '新建气泡演出');
    /* ★ 指导提示词 (按用户要求放在「重置全部」左边): 教 AI 写贴纸的入场动画 CSS */
    const bBPrompt = el('div', 'tgm-btn', '指导提示词');
    bBPrompt.title = '复制 / 导出这段提示词给别的 AI：它会回 @keyframes + .gv-sticker.gv-b-键 的 CSS';
    bBPrompt.addEventListener('click', () => showPromptBox({
      title: '指导提示词：气泡演出（贴纸入场动画）',
      hint: '整份复制（或导出成 txt）给别的 AI。它给的每段 CSS 粘进「新建气泡演出」（或改内置那几段）就能用。',
      text: bubbleAnimPromptText(), file: '气泡演出.指导提示词',
    }));
    h5.append(bBPrompt, bRstB, bNewB); c5.appendChild(h5);
    c5.appendChild(el('div', 'tgm-dlg-text', '贴纸入场动画就这几个（贴纸自己的动画在 D 里选）。点一下看说明和 CSS —— 可以改、重命名、重置、删除；也能自己写一段 @keyframes 当新演出。改完去 C 那边点「展示气泡动画」直接看效果。'));
    const chipsB = el('div', 'tgm-row'); chipsB.style.flexWrap = 'wrap';
    bubbleAnimList(false).forEach(function (it) {
      const s = el('span', 'tgm-chip', it[2] + (it[2] === it[0] ? '' : ' · ' + it[0]));   // 改过名的把原键也写出来, 免得 AI 那边对不上
      s.style.cursor = 'pointer'; s.title = it[1];
      s.addEventListener('click', function () { openBubbleAnim(it[0]); });
      chipsB.appendChild(s);
    });
    if (!chipsB.children.length) chipsB.appendChild(el('div', 'tgm-dlg-text', '（都被你删光了，「重置全部」能找回来）'));
    c5.appendChild(chipsB);
    p.appendChild(c5);
    bRstB.addEventListener('click', async () => { cur.bubbleAnimNames = {}; cur.bubbleAnimHidden = []; cur.bubbleAnimCss = {}; await putProjectData(cur); renderEffects(); });
    bNewB.addEventListener('click', async () => {
      const n = await askText('新建气泡演出', '起个名字（英文更稳，会变成 CSS 类名 gv-b-名字，在 CSS 里就写这个类）。', '', '例如 wiggle');
      if (n == null) return;
      const key = String(n).trim().replace(/[^\w-]/g, ''); if (!key) return;
      if (BUBBLE_ANIMS.find(function (x) { return x[0] === key; })) { await askConfirm('这个名字被内置占了', '内置演出里已经有「' + key + '」了，换个名字（或者直接点内置那个去改它的 CSS）。'); return; }
      cur.bubbleFx = cur.bubbleFx || [];
      if (!cur.bubbleFx.find(function (x) { return x.key === key; })) cur.bubbleFx.push({ key: key, name: key, css: '' });
      await putProjectData(cur); renderEffects(); openBubbleAnim(key);
    });
  }

  async function editEffect(i) {
    const isNew = i < 0;
    cur.effects = cur.effects || [];
    const e = isNew ? { name: '', target: 'sprite', duration: 900, css: '', js: '' } : cur.effects[i];
    const nameI = el('input', 'tgm-in'); nameI.value = e.name; nameI.placeholder = '英文名，AI 就写这个词';
    const tgt = el('select', 'tgm-sel');
    [['sprite', '立绘'], ['bg', '背景'], ['phone', '整个画面']].forEach(([v, t]) => { const o = el('option', '', t); o.value = v; tgt.appendChild(o); });
    tgt.value = e.target || 'sprite';
    const dur = el('input', 'tgm-in'); dur.type = 'number'; dur.value = e.duration || 900;
    const wrap = el('div');
    [['名字', nameI], ['作用在', tgt], ['时长(ms)', dur]].forEach(([l, node]) => {
      const r = el('div', 'tgm-row'); r.appendChild(el('label', '', l)); r.appendChild(node); wrap.appendChild(r);
    });
    const ok = await dialog({
      title: isNew ? '新建演出组' : ('编辑演出：' + e.name),
      text: 'CSS 里写 @keyframes + 一个类名，类名随意（引擎会自己包一层 gv-fx-名字）。也可以留空只用 JS。',
      extra: wrap, code: e.css || '', rows: 8, okText: '下一步',
    });
    if (ok == null) return;
    const jsOk = await dialog({ title: '可选：JS 代码', text: '这段会在演出触发时执行，参数 el 是被作用的元素、ctx 带当前角色名。留空就是纯 CSS。', code: e.js || '', rows: 6, okText: '保存' });
    if (jsOk == null) return;
    const obj = { name: String(nameI.value).trim(), target: tgt.value, duration: Number(dur.value) || 900, css: String(ok), js: String(jsOk) };
    if (!obj.name) return;
    if (isNew) cur.effects.push(obj); else cur.effects[i] = obj;
    await putProjectData(cur); renderEffects();
  }

  /* ---- 图片素材页 ---- */
  async function renderAssets() {
    const p = UI.panes.assets; if (!p || !cur) return;
    previewSoon(false);      // 素材变了 -> 预览跟着变 (保留虚拟楼层状态)
    p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '演出素材'),
      el('div', 'tgm-hint', '图片和声音都存在浏览器本地（IndexedDB），不上传、不公开、不跟角色卡走。背景 / 立绘 / 音频 / 音效都支持「本地文件」或「外链」，导出时本地文件会打进素材包。'));

    /* ---------- 背景 ---------- */
    const bgCard = el('div', 'tgm-card');
    const bgHead = el('div', 'tgm-row');
    bgHead.append(el('div', 'tgm-h2', '背景'));
    const bAdd = el('div', 'tgm-btn tgm-primary', '导入图片');
    const bUrl = el('div', 'tgm-btn', '从链接添加');
    const bgSp = el('span', 'tgm-spacer'); bgSp.style.flex = '1';
    bgHead.append(bgSp, bAdd, bUrl);
    bgCard.appendChild(bgHead);
    p.appendChild(bgCard);

    cur.bgList = cur.bgList || [];
    if (!cur.bgList.length) bgCard.appendChild(el('div', 'tgm-dlg-text', '还没有背景。导入一张，或者直接粘图床链接。'));
    const bgGrid = el('div', 'tgm-grid'); bgCard.appendChild(bgGrid);
    for (const b of cur.bgList) {
      const t = el('div', 'tgm-thumb tgm-bgthumb');
      const u = await entryUrl(b);
      const im = el('img'); im.src = u; im.loading = 'lazy';
      if (b.kind === 'url') im.referrerPolicy = 'no-referrer';
      const paint = () => { const f = b.fit || {}; im.style.transform = 'translate(' + (f.x || 0) + '%,' + (f.y || 0) + '%) scale(' + (f.scale || 1) + ')'; };
      paint();
      t.append(im, el('div', 'tgm-tname', b.name));
      const ops = el('div', 'tgm-thumb-ops');
      const o1 = el('div', 'tgm-btn', '取景'); const o2 = el('div', 'tgm-btn', '改名'); const o3 = el('div', 'tgm-btn tgm-danger', '删除');
      ops.append(o1, o2, o3); t.appendChild(ops);
      o1.addEventListener('click', async () => {
        const fit = await frameEditor({ title: '背景取景：' + b.name, src: u, fit: b.fit, aspect: ((cur.frameSize && cur.frameSize.h) ? (cur.frameSize.w / cur.frameSize.h) : 9 / 19.5), maxW: cur.frameSize && cur.frameSize.w });
        if (fit) { b.fit = fit; await putProjectData(cur); renderAssets(); }
      });
      o2.addEventListener('click', async () => { const n = await askText('重命名背景', '', b.name); if (n == null) return; b.name = String(n).trim() || b.name; await putProjectData(cur); renderAssets(); });
      o3.addEventListener('click', async () => { const ok = await askConfirm('删除背景', '「' + b.name + '」会被删掉。', true); if (!ok) return; await dropEntry(b); cur.bgList = cur.bgList.filter(x => x.id !== b.id); await putProjectData(cur); renderAssets(); });
      bgGrid.appendChild(t);
    }
    bAdd.addEventListener('click', async () => { const b = await addBgFromFile(); if (b) { renderAssets(); } });
    bUrl.addEventListener('click', async () => {
      const u = await askText('从链接添加背景', '粘贴图片直链（http/https 开头）。', '', 'https://...');
      if (!u) return; const s = String(u).trim(); if (!/^https?:/i.test(s)) return;
      await addBgFromUrl(s); renderAssets();
    });

    /* ---------- 立绘 ---------- */
    const spCard = el('div', 'tgm-card');
    const spHead = el('div', 'tgm-row');
    spHead.appendChild(el('div', 'tgm-h2', '立绘'));
    const spSp = el('span'); spSp.style.flex = '1'; spHead.appendChild(spSp);
    const gAdd = el('div', 'tgm-btn tgm-primary', '新建角色组');
    spHead.appendChild(gAdd); spCard.appendChild(spHead);
    spCard.appendChild(el('div', 'tgm-dlg-text', '一个角色组 = 一个角色。组里每张立绘用一个情绪名（开心 / 委屈 / 生气…），AI 就按这个名字调用。'));
    p.appendChild(spCard);
    gAdd.addEventListener('click', async () => { const n = await askText('新建角色组', '角色叫什么？', '', '角色名'); if (n == null) return; await addGroup(String(n).trim() || '新角色'); renderAssets(); });

    cur.spriteGroups = cur.spriteGroups || [];
    if (!cur.spriteGroups.length) spCard.appendChild(el('div', 'tgm-dlg-text', '还没有角色组。'));
    for (const g of cur.spriteGroups) {
      const box = el('div', 'tgm-group');
      const h = el('div', 'tgm-row');
      const nm = el('div', 'tgm-gname', g.name);
      h.appendChild(nm);
      const sp2 = el('span'); sp2.style.flex = '1'; h.appendChild(sp2);
      const bFace = el('div', 'tgm-btn tgm-primary', '加表情');
      const bFaceUrl = el('div', 'tgm-btn', '链接加表情');   // ★ 图床链接的立绘 (纯 URL 模式要用)
      const bPos = el('div', 'tgm-btn', '调整定位');
      const bRen = el('div', 'tgm-btn', '改名');
      const bDel = el('div', 'tgm-btn tgm-danger', '删除组');
      h.append(bFace, bFaceUrl, bPos, bRen, bDel);
      box.appendChild(h);
      bFaceUrl.title = '立绘也可以直接粘图床直链，导出脚本时直接写进 faceMap';
      bFaceUrl.addEventListener('click', async () => {
        const k = await askText('从链接添加立绘', '这张是什么情绪？（AI 就用这个名字调用，例如 平静 / 开心）。', '', '开心'); if (!k) return;
        const u = await askText('从链接添加立绘', '粘贴图片直链（http/https 开头）。', '', 'https://...');
        if (!u) return;
        const s = String(u).trim();
        if (!/^https?:/i.test(s)) { await dialog({ title: '链接不对', text: '要以 http:// 或 https:// 开头。', okText: '知道了' }); return; }
        g.faces = g.faces || [];
        const face = { id: newId('f'), key: String(k).trim(), kind: 'url', src: s, fit: null };
        g.faces.push(face);
        if (!g.anchorFace) g.anchorFace = face.id;
        await putProjectData(cur); renderAssets();
      });

      const anchor = g.faces.find(f => f.id === g.anchorFace) || g.faces[0];
      box.appendChild(el('div', 'tgm-imeta',
        g.faces.length
          ? ('定位图：' + (anchor ? anchor.key : '未设') + '　（其余立绘默认跟它一个位置和大小，单张可以单独覆盖）')
          : '还没有立绘。'));
      const grid = el('div', 'tgm-grid'); box.appendChild(grid);
      for (const f of g.faces) {
        const t = el('div', 'tgm-thumb' + (anchor && f.id === anchor.id ? ' tgm-anchor' : ''));
        const u = await entryUrl(f);
        const im = el('img'); im.src = u; im.loading = 'lazy';
        const ef = f.fit || (anchor ? anchor.fit || { x: 0, y: 0, scale: 1 } : { x: 0, y: 0, scale: 1 });
        im.style.transform = 'translate(' + (ef.x || 0) + '%,' + (ef.y || 0) + '%) scale(' + (ef.scale || 1) + ')';
        t.append(im, el('div', 'tgm-tname', f.key + (anchor && f.id === anchor.id ? ' ★' : '')));
        const ops = el('div', 'tgm-thumb-ops');
        const o1 = el('div', 'tgm-btn', '★'); const o2 = el('div', 'tgm-btn', '定位'); const o3 = el('div', 'tgm-btn', '改名'); const o4 = el('div', 'tgm-btn tgm-danger', '×');
        ops.append(o1, o2, o3, o4); t.appendChild(ops);
        o1.addEventListener('click', async () => { g.anchorFace = f.id; await putProjectData(cur); renderAssets(); });
        o2.addEventListener('click', async () => {
          const u2 = await entryUrl(f);
          const _slots = cur.slots || [];
          const _slotKey = (cur.slotPreview && cur.slotPreview[f.id]) || _slots[0] || '';
          const _pos = (cur.slotPos || {})[_slotKey] || null;
          const _i = _slots.indexOf(_slotKey), _n = Math.max(1, _slots.length);
          /* ★ 这段必须和真机 mkSprite / .gv-sprite 一字不差, 否则弹窗和真机就会"对不上":
             占位框在 -> x=框中心, y=框底, 宽高=框; 没框 -> 落点 slotPos, 再没写才是默认间距 20+i/(n-1)*60 */
          /* ★ 单人(站位 ≤1): 和真机一样, 站位/框都不参与, 直接居中 */
          const _single = _slots.filter(Boolean).length <= 1;
          const _box = _single ? null : ((cur.slotBoxes || {})[_slotKey] || null);
          const _hasBox = !!(_box && Number(_box.w) > 0 && Number(_box.h) > 0);
          const _bx = _hasBox ? (Number(_box.x) + Number(_box.w) / 2)
                              : (_single ? 50 : (_pos && typeof _pos.x === 'number' ? _pos.x : (_n <= 1 || _i < 0 ? 50 : Math.round(20 + _i / (_n - 1) * 60))));
          const _by = _hasBox ? (Number(_box.y) + Number(_box.h))
                              : (_pos && typeof _pos.y === 'number' ? _pos.y : 100);
          const _bs = _pos && _pos.scale ? _pos.scale : 1;   // 站位缩放: 有没有框都照用 (和真机一样)
          const fit = await frameEditor({ title: '立绘定位：' + g.name + ' · ' + f.key + (_slotKey ? '（站位 ' + _slotKey + '）' : ''), src: u2, fit: ef, fitMode: 'natural',
            slotPick: true, slotKey: _slotKey,
            base: { x: _bx, y: _by, scale: _bs, w: _hasBox ? (Number(_box.w) + '%') : (_slots.length ? '74%' : '100%'), h: _hasBox ? Number(_box.h) : null }, aspect: ((cur.frameSize && cur.frameSize.h) ? (cur.frameSize.w / cur.frameSize.h) : 9 / 19.5), maxW: cur.frameSize && cur.frameSize.w });
          if (fit) { f.fit = fit; await putProjectData(cur); renderAssets(); }
        });
        o3.addEventListener('click', async () => { const n = await askText('重命名表情', '用情绪命名，AI 就按这个名字调用。', f.key); if (n == null) return; f.key = String(n).trim() || f.key; await putProjectData(cur); renderAssets(); });
        o4.addEventListener('click', async () => { const ok = await askConfirm('删除立绘', '「' + f.key + '」会被删掉。', true); if (!ok) return; await dropEntry(f); g.faces = g.faces.filter(x => x.id !== f.id); if (g.anchorFace === f.id) g.anchorFace = g.faces[0] ? g.faces[0].id : null; await putProjectData(cur); renderAssets(); });
        grid.appendChild(t);
      }
      bFace.addEventListener('click', async () => {
        /* 和背景一个顺序: 先把图导进来, 再弹改名框 (默认用文件名), 之后也能用「改名」二次改 */
        const face = await addFace(g, null);
        if (!face) return;
        renderAssets();
        const k = await askText('给这张立绘起个名字', 'AI 用这个名字调用表情，要和提示词里的表情表对得上（平静 / 微笑 / 害羞 / 惊讶 / 生气 / 悲伤…）。', face.key, '情绪名');
        if (k != null && String(k).trim()) { face.key = String(k).trim(); await putProjectData(cur); }
        renderAssets();
      });
      bPos.addEventListener('click', async () => {
        if (!anchor) { await askConfirm('还没有立绘', '先给这个组加一张立绘吧。'); return; }
        const u2 = await entryUrl(anchor);
        const fit = await frameEditor({ title: '定位：' + g.name, src: u2, fit: g.anchor.fit || { x: 0, y: 0, scale: 1 }, aspect: ((cur.frameSize && cur.frameSize.w) ? (cur.frameSize.h / cur.frameSize.w) : 9 / 19.5), maxW: cur.frameSize && cur.frameSize.w });
        if (fit) { g.anchor = fit; g.faces.forEach(x => { if (!x.fit) x.fit = null; }); await putProjectData(cur); renderAssets(); }
      });
      bRen.addEventListener('click', async () => { const n = await askText('重命名角色组', '', g.name); if (n == null) return; g.name = String(n).trim() || g.name; await putProjectData(cur); renderAssets(); });
      bDel.addEventListener('click', async () => { const ok = await askConfirm('删除角色组', '「' + g.name + '」和它下面所有立绘都会被删掉。', true); if (!ok) return; for (const f of g.faces) await dropEntry(f); cur.spriteGroups = cur.spriteGroups.filter(x => x.id !== g.id); await putProjectData(cur); renderAssets(); });
      spCard.appendChild(box);
    }

    /* ---------- 音频（BGM）/ 音效（SE）: 外链 + 本地文件都行 ---------- */
    const AUDIO_EXT = ['mp3', 'ogg', 'm4a', 'wav', 'flac', 'aac', 'opus', 'webm'];
    const extOf = n => { const e = String(n || '').split('.').pop().toLowerCase(); return AUDIO_EXT.indexOf(e) >= 0 ? e : 'mp3'; };
    function audioCard(kind) {
      const isBgm = kind === 'bgm';
      const list = () => (isBgm ? (cur.audioList = cur.audioList || []) : (cur.seList = cur.seList || []));
      const keyOf = a => (isBgm ? (a.mood || a.name) : a.name);
      const card = el('div', 'tgm-card');
      const head = el('div', 'tgm-row');
      head.appendChild(el('div', 'tgm-h2', isBgm ? '音频（BGM）' : '音效（SE）'));
      const sp = el('span'); sp.style.flex = '1'; head.appendChild(sp);
      const bFile = el('div', 'tgm-btn', isBgm ? '导入音频' : '导入音效');
      const bUrl = el('div', 'tgm-btn tgm-primary', isBgm ? '添加音频' : '添加音效');
      head.append(bFile, bUrl); card.appendChild(head);
      card.appendChild(el('div', 'tgm-dlg-text', isBgm
        ? 'BGM 可以外链，也可以直接导入本地音频文件（本地文件导出时会打进素材包）。每首标一个「情绪含义」，提示词里只告诉 AI 有哪些情绪，让 AI 按剧情点歌。'
        : '音效可以外链，也可以导入本地文件（导出时打进素材包）。AI 需要时会把音效名写在那行的最后：角色名|表情|台词|演出效果|站位|音效。'));
      p.appendChild(card);
      if (!list().length) card.appendChild(el('div', 'tgm-dlg-text', isBgm ? '还没有音频。' : '还没有音效。'));
      list().forEach(a => {
        const row = el('div', 'tgm-row');
        row.appendChild(el('span', 'tgm-gname', keyOf(a)));
        const src = a.kind === 'file' ? ('本地文件 · ' + (a.fileName || a.ext || 'audio')) : String(a.url || '').slice(0, 46);
        const u = el('span', 'tgm-imeta', src); u.style.flex = '1'; u.style.overflow = 'hidden';
        const bRen = el('div', 'tgm-btn', '改名');
        const bD = el('div', 'tgm-btn tgm-danger', '删除');
        row.append(u, bRen, bD); card.appendChild(row);
        bRen.addEventListener('click', async () => {
          const k0 = keyOf(a);                        // ★ 先记下旧名字, 改完再算就已经是新名字了
          const n = await askText(isBgm ? '重命名音频' : '重命名音效', '', k0, isBgm ? '例如 温柔' : '例如 开门');
          if (n == null) return;
          const nm = String(n).trim(); if (!nm) return;
          if (isBgm) { a.mood = nm; a.name = nm; } else a.name = nm;
          const ak0 = isBgm ? 'audio' : 'se';
          const arr = cur.assets[ak0] || [];
          cur.assets[ak0] = arr.map(x => (x === k0 ? nm : x));
          if (cur.assets[ak0].indexOf(nm) < 0) cur.assets[ak0].push(nm);
          if (isBgm) syncFloorBgm({ from: k0, to: nm });   // 改过名字 -> 楼层里那行跟着改 (别的都不动)
          await putProjectData(cur); renderAssets();
        });
        bD.addEventListener('click', async () => {
          const k = keyOf(a);
          if (isBgm) cur.audioList = cur.audioList.filter(x => x !== a); else cur.seList = cur.seList.filter(x => x !== a);
          const ak = isBgm ? 'audio' : 'se';
          cur.assets[ak] = (cur.assets[ak] || []).filter(x => x !== k);
          if (a.blobId) { try { await dropEntry(a); } catch (e) {} }
          if (isBgm) syncFloorBgm();          // 删过素材 -> 同步一次
          await putProjectData(cur); renderAssets();
        });
      });
      const addToList = async (entry) => {
        const n = await askText(isBgm ? '添加 BGM' : '添加音效',
          isBgm ? '这首曲子是什么情绪？（AI 就按这个情绪点歌）' : '这个音效叫什么？（AI 写在每行最后）',
          '', isBgm ? '例如 温柔 / 紧张 / 欢快' : '例如 开门 / 脚步 / 玻璃碎');
        if (n == null) { if (entry.blobId) { try { await dropEntry(entry); } catch (e) {} } return; }
        const nm = String(n).trim();
        if (!nm) { if (entry.blobId) { try { await dropEntry(entry); } catch (e) {} } return; }
        const key = isBgm ? 'audioList' : 'seList';
        cur[key] = cur[key] || [];
        const item = Object.assign({ name: nm }, entry);
        if (isBgm) item.mood = nm;
        cur[key].push(item);
        const ak = isBgm ? 'audio' : 'se';
        cur.assets[ak] = cur.assets[ak] || []; if (cur.assets[ak].indexOf(nm) < 0) cur.assets[ak].push(nm);
        if (isBgm) syncFloorBgm();            // 导入/添加过 BGM -> 同步一次
        await putProjectData(cur); renderAssets();
      };
      bFile.addEventListener('click', async () => {
        const f = await pickFile('audio/*'); if (!f) return;
        const e = await fileEntry(f);
        await addToList({ kind: 'file', blobId: e.blobId, ext: extOf(f.name), fileName: f.name });
      });
      bUrl.addEventListener('click', async () => {
        const u = await askText(isBgm ? '音频外链' : '音效外链', '粘贴直链（http/https 开头，mp3 / ogg / m4a 都行）。', '', 'https://...');
        if (!u) return;
        const s = String(u).trim(); if (!/^https?:/i.test(s)) return;
        await addToList({ kind: 'url', url: s });
      });
    }
    audioCard('bgm');
    audioCard('se');

    /* 内置情绪气泡不在这一页显示 —— 统一在「特殊演出 → D · 情绪气泡贴纸」里看/配 */
  }


  /* ============================================================
     素材包：自己写的最小 ZIP 打包器（store 模式，不压缩 —— PNG 本来就压过了）
     ============================================================ */
  const _crcTable = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = _crcTable[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

  function zipStore(files) {   /* files: [{ name, data: Uint8Array }] */
    const enc = new TextEncoder();
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
    const parts = [], central = [];
    let offset = 0, count = 0;
    for (const f of files) {
      const name = enc.encode(f.name);
      const data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
      count++;
    }
    let cdSize = 0; central.forEach(x => cdSize += x.length);
    const eo = new DataView(new ArrayBuffer(22));
    eo.setUint32(0, 0x06054b50, true); eo.setUint16(4, 0, true); eo.setUint16(6, 0, true);
    eo.setUint16(8, count, true); eo.setUint16(10, count, true);
    eo.setUint32(12, cdSize, true); eo.setUint32(16, offset, true); eo.setUint16(20, 0, true);
    const all = parts.concat(central, [new Uint8Array(eo.buffer)]);
    let total = 0; all.forEach(x => total += x.length);
    const out = new Uint8Array(total);
    let p = 0; all.forEach(x => { out.set(x, p); p += x.length; });
    return out;
  }

  function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 60) || 'unnamed'; }
  function guessMime(name) {
    const e = String(name || '').toLowerCase().split('.').pop();
    if (e === 'png') return 'image/png';
    if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
    if (e === 'webp') return 'image/webp';
    if (e === 'gif') return 'image/gif';
    if (e === 'mp3') return 'audio/mpeg';
    if (e === 'ogg') return 'audio/ogg';
    if (e === 'wav') return 'audio/wav';
    if (e === 'm4a') return 'audio/mp4';
    return 'application/octet-stream';
  }
  /* ★ 读 zip（导入工程包用）: stored(0) 和 deflate(8) 都认 —— 自己的导出器写的是 stored,
     别人用压缩软件重新打过包就是 deflate, 两种都得能读 */
  async function unzip(u8) {
    const b = u8 instanceof Uint8Array ? u8 : new Uint8Array(u8);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let eocd = -1;
    for (let i = b.length - 22; i >= 0 && i > b.length - 22 - 65558; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error('这不是一个 zip 文件');
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const out = [];
    for (let n = 0; n < count; n++) {
      if (off + 46 > b.length || dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const csize = dv.getUint32(off + 20, true);
      const nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const name = new TextDecoder().decode(b.subarray(off + 46, off + 46 + nlen));
      const lnlen = dv.getUint16(lho + 26, true), lelen = dv.getUint16(lho + 28, true);
      const start = lho + 30 + lnlen + lelen;
      let data = b.subarray(start, start + csize);
      if (method === 8) {
        data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      } else if (method !== 0) throw new Error('这个 zip 用了不支持的压缩方式：' + method);
      if (!/\/$/.test(name)) out.push({ name: name, data: data });
      off += 46 + nlen + elen + clen;
    }
    return out;
  }
  async function blobBytes(e) {
    if (!e) return null;
    if (e.kind === 'file' && e.blobId) { const b = await blobGet(e.blobId); return b ? new Uint8Array(await b.arrayBuffer()) : null; }
    if (e.kind === 'url') { const r = await fetch(e.src); if (!r.ok) throw new Error('下载失败 ' + e.src); return new Uint8Array(await r.arrayBuffer()); }
    return null;
  }

  /* 素材包 = 背景 + 立绘 + 内置气泡 + 清单。和脚本导出是两件独立的事 */
  /* withProject = true 时多塞两份东西（工程包）：
     project.json = 整个方案（页面模板 / 站位 / 取景 / 提示词 / 素材清单…，里面只有 blobId 引用，没有图片本体）
     files.json   = blobId / 贴纸名 -> 包内文件路径 的对照表（导入时按原 id 放回 IndexedDB，方案 json 一个字都不用改）
     另外工程包还要带上「页面排版 → 本地素材」那批图（玩家素材包里本来不需要它们） */
  async function buildAssetPack(p, withProject) {
    const files = [], manifest = { name: p.name, version: 1, exportedAt: new Date().toISOString(), bg: [], sprites: [], stickers: [], slots: p.slots || [], assets: p.assets || {}, mode: p.mode };
    for (const b of (p.bgList || [])) {
      try { const d = await blobBytes(b); if (!d) continue; const n = 'assets/bg/' + safeName(b.name) + '.png';
        files.push({ name: n, data: d }); manifest.bg.push({ name: b.name, file: n, fit: b.fit || null, source: b.kind }); } catch (e) {}
    }
    for (const g of (p.spriteGroups || [])) {
      const gm = { name: g.name, anchor: g.anchor || null, anchorKey: null, faces: [] };
      const anchor = g.faces.find(f => f.id === g.anchorFace);
      gm.anchorKey = anchor ? anchor.key : null;
      for (const f of g.faces) {
        try { const d = await blobBytes(f); if (!d) continue; const n = 'assets/chara/' + safeName(g.name) + '/' + safeName(f.key) + '.png';
          files.push({ name: n, data: d }); gm.faces.push({ key: f.key, file: n, fit: f.fit || null }); } catch (e) {}
      }
      manifest.sprites.push(gm);
    }
    for (const [id, cn] of stickerList(p)) {      // 被叉掉的内置贴纸不进包
      try { const r = await fetch(stickerUrl(id)); const d = new Uint8Array(await r.arrayBuffer());
        const n = 'assets/sticker/' + id + '.png'; files.push({ name: n, data: d }); manifest.stickers.push({ key: id, cn: cn, file: n }); } catch (e) {}
    }
    /* 自己导入的贴纸 */
    for (const s of (p.stickers || [])) {
      try {
        const d = s.file ? new Uint8Array(await s.file.arrayBuffer()) : new Uint8Array(await (await fetch(s.url)).arrayBuffer());
        const n = 'assets/sticker/' + safeName(s.name) + '.png';
        files.push({ name: n, data: d }); manifest.stickers.push({ key: s.name, cn: s.name, file: n });
      } catch (e) {}
    }
    manifest.effects = {};
    (p.effects || []).forEach(e => { if (e && e.name) manifest.effects[e.name] = { css: e.css || '', cls: e.cls || ('gv-fx-' + e.name), target: e.target || 'sprite', duration: e.duration || 900, js: e.js || '' }; });
    /* ★ 占位排版也进素材包 (manifest.slotBoxes) */
    manifest.slotBoxes = p.slotBoxes || {};
    manifest.bubbles = { pos: p.bubblePos || { x: 78, y: 24, scale: 1 }, posEach: p.bubblePosEach || {}, posSlot: p.bubblePosSlot || {},
      anim: p.bubbleAnim || {}, ms: 1900, css: bubbleCssText(p) };
    /* BGM / 音效: 本地文件打进 assets, 外链只带链接 */
    const packSound = async (list, dir) => {
      const out = [];
      for (const a of (list || [])) {
        const nm = String((a && (a.mood || a.name)) || '').trim();
        if (!nm) continue;
        try {
          if (a.kind === 'file' && a.blobId) {
            const d = await blobBytes({ kind: 'file', blobId: a.blobId });
            if (!d) continue;
            const file = dir + '/' + safeName(nm) + '.' + (a.ext || 'mp3');
            files.push({ name: file, data: d });
            out.push({ name: nm, mood: nm, file: file });
          } else if (a.url) {
            out.push({ name: nm, mood: nm, url: a.url });
          }
        } catch (e) {}
      }
      return out;
    };
    manifest.audio = await packSound(p.audioList, 'assets/bgm');
    manifest.se = await packSound(p.seList, 'assets/se');
    files.push({ name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
    if (withProject) {
      /* 本地素材（页面用图）: 玩家素材包里没有这批, 工程包必须带 */
      const _blobs = {};
      for (const pa of (p.pageAssets || [])) {
        const n = 'assets/page/' + safeName(pa.name) + '.' + (pa.ext || 'png');
        try {
          const d = pa.blobId ? await blobBytes({ kind: 'file', blobId: pa.blobId }) : null;
          if (!d) continue;
          files.push({ name: n, data: d });
          if (pa.blobId) _blobs[pa.blobId] = n;
        } catch (e) {}
      }
      const _mark = (e, n) => { if (e && e.kind === 'file' && e.blobId && n) _blobs[e.blobId] = n; };
      (p.bgList || []).forEach(b => _mark(b, 'assets/bg/' + safeName(b.name) + '.png'));
      (p.spriteGroups || []).forEach(g => (g.faces || []).forEach(f => _mark(f, 'assets/chara/' + safeName(g.name) + '/' + safeName(f.key) + '.png')));
      (p.audioList || []).forEach(a => _mark(a, 'assets/bgm/' + safeName(a.mood || a.name) + '.' + (a.ext || 'mp3')));
      (p.seList || []).forEach(a => _mark(a, 'assets/se/' + safeName(a.name) + '.' + (a.ext || 'mp3')));
      const _stk = {};
      (p.stickers || []).forEach(s => { if (s && s.name && (s.file || s.blobId)) _stk[s.name] = 'assets/sticker/' + safeName(s.name) + '.png'; });
      files.push({ name: 'project.json', data: new TextEncoder().encode(JSON.stringify(p)) });
      files.push({ name: 'files.json', data: new TextEncoder().encode(JSON.stringify({ blobs: _blobs, stickers: _stk }, null, 1)) });
    }
    return { zip: zipStore(files), count: files.length, manifest: manifest };
  }

  /* ★ 第 8 条: 多人（站位 ≥2）必须先把每块框画好, 不然导出的卡上立绘会按老算法乱站 -> 不让导出 */
  async function boxGuard() {
    try {
      const slots = (cur.slots || []).filter(Boolean);
      if (slots.length < 2) return true;
      const miss = slots.filter(function (k) { const b = (cur.slotBoxes || {})[k]; return !(b && b.w > 0 && b.h > 0); });
      if (!miss.length) return true;
      const ok = await dialog({
        title: '还没画占位框',
        text: '这套方案有 ' + slots.length + ' 个站位，但「' + miss.join('、') + '」还没画框。多人立绘没有框会按老算法乱站 —— 先去「页面排版 → 立绘站位 · 占位排版」把这些框画好（弹窗里有「全部平分」可以一键铺开），再导出。',
        okText: '去画框', cancelText: '返回'
      });
      if (ok) { const t = document.querySelector('.tgm-nav-item[data-tab=\'pages\']'); if (t) t.click(); }
      return false;
    } catch (e) { return true; }
  }
  async function exportAssetPack() {
    if (!(await boxGuard())) return;
    const st = document.getElementById('tgm-exp-status');
    const set = t => { if (st) st.textContent = t; };
    try {
      set('正在打包素材…');
      const { zip, count } = await buildAssetPack(cur);
      const blob = new Blob([zip], { type: 'application/zip' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = safeName(cur.name) + '-素材包.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      set('素材包已导出：' + count + ' 个文件，' + (zip.length / 1048576).toFixed(2) + ' MB');
    } catch (e) { set('素材包导出失败：' + e.message); }
  }

  /* ★ 导入工程包 (.zip): 方案 json + 素材一起进来 —— 素材按原 blobId 放回 IndexedDB, 所以 project.json 一个字都不用改 */
  async function importProjectPackZip(file) {
    const items = await unzip(new Uint8Array(await file.arrayBuffer()));
    const get = n => { const it = items.find(x => x.name === n); return it ? it.data : null; };
    const pj = get('project.json');
    if (!pj) throw new Error('这个 zip 里没有 project.json —— 它看起来只是给玩家用的素材包（那种要在悬浮窗里「导入素材包」）');
    const proj = JSON.parse(new TextDecoder().decode(pj));
    let map = { blobs: {}, stickers: {} };
    const fj = get('files.json');
    if (fj) { try { map = Object.assign(map, JSON.parse(new TextDecoder().decode(fj))); } catch (e) {} }
    let put = 0, miss = 0;
    for (const id of Object.keys(map.blobs || {})) {
      const it = items.find(x => x.name === map.blobs[id]);
      if (!it) { miss++; continue; }
      await blobPut(id, new Blob([it.data], { type: guessMime(it.name) }));
      put++;
    }
    const np = await createProject(String(proj.name || '导入的方案') + '（导入）');
    Object.assign(np, proj, { id: np.id });
    /* 本地文件类的贴纸: json 里存不了 File -> 用包里的字节造回来 */
    (np.stickers || []).forEach(function (s) {
      const p2 = (map.stickers || {})[s.name];
      if (!p2) return;
      const it = items.find(x => x.name === p2);
      if (!it) return;
      try { s.file = new File([it.data], String(s.name) + '.' + (p2.split('.').pop() || 'png'), { type: guessMime(p2) }); s.url = URL.createObjectURL(s.file); } catch (e) {}
    });
    await putProjectData(np);
    return { name: np.name, blobs: put, miss: miss, files: items.length };
  }

  /* ★ 导出工程包: 「方案 + 全部素材」打成一个 zip, 给别的制作器用（搬机器 / 发给别人接着做） */
  async function exportProjectPack() {
    if (!(await boxGuard())) return;
    const st = document.getElementById('tgm-exp-status');
    const set = t => { if (st) st.textContent = t; };
    try {
      set('正在打包整个方案（含素材）…');
      const { zip, count } = await buildAssetPack(cur, true);
      const blob = new Blob([zip], { type: 'application/zip' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = safeName(cur.name) + '-工程包.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      set('工程包已导出：' + count + ' 个文件，' + (zip.length / 1048576).toFixed(2) + ' MB（别人在「导出」页点「导入方案 / 工程包」选这个 zip）');
    } catch (e) { set('工程包导出失败：' + e.message); }
  }

  /* ---------------- 导出：自包含的酒馆助手脚本 ---------------- */
  async function fetchText(u) { const r = await fetch(u + '?v=' + Date.now()); if (!r.ok) throw new Error('读取失败 ' + u + ' ' + r.status); return await r.text(); }

  /* ★ 有音频 / 无音频: 把模板里圈了 <!--gv-audio--> / /*gv-audio*\/ 的块剥掉
     (没打闭合标记的那段一路剥到文件末尾 —— 音量面板那一整块就是这样)
     页面排版和导出脚本两边都用这一个, 规则不会跑偏 */
const stripAudio = (t) => {
  const rep = (s) => String(s || '')
    .replace(/<!--gv-audio-->[\s\S]*?<!--\/gv-audio-->/g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*$/g, '')
    /* ★ 老方案被"缺什么补什么"补过的那几块没有开头标记 (截取时只截到结尾标记) -> 按开头那句话再剥一遍,
       否则还留着一堆 $('volBgm') 死代码 (HTML 已经被剥掉, 跑起来就是 null 报错) */
    .replace(/\/\* ---- 声音: 自己播[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-pause\*\/[\s\S]*?(?:\/\*\/gv-pause\*\/|$)/g, '')
    .replace(/\/\* 音量面板[\s\S]*?(?=\.gv-editor \{|$)/g, '');
  return { html: rep(t.html), css: rep(t.css), js: rep(t.js) };
};
  async function buildExportScript(p) {
    const B = '/galgame/';
    const [engine, card, css, panelCss] = await Promise.all([
      fetchText(B + 'galgame.js'), fetchText(B + 'galgame-script.js'),
      fetchText(B + 'galgame.css'), fetchText(B + 'galgame-panel.css'),
    ]);
    /* ★ 导出要跟着「有音频 / 无音频」走:
         无音频 = 三层模板里的音频块剥掉 + 不带 BGM 外链映射 + 提示词里也不提 BGM/音效 */
    const noAudio = (p.audioMode === 'without');
    const pView = noAudio ? Object.assign({}, p, { audioList: [], seList: [], assets: Object.assign({}, p.assets || {}, { audio: [], se: [] }) }) : p;
    /* ★ 自定义提示词里没有 BGM/音效那几行时, 导出时补上 (关键词表里有名字才补) */
    const promptText = ensureAudioPromptLines(buildPrompt(pView), pView.assets);
    const allCss = css + '\n' + panelCss;
    const report = [];
    /* ★ 旧引擎导出的脚本, 悬浮窗还是旧样子 (别人下载到坏脚本的根源) -> 明确报出来 */
    report.push(engine.indexOf("ENGINE_REV = '") >= 0 ? 'ok 引擎版本' : '!! 你酒馆里的引擎文件是旧版：把仓库 engine/ 重新复制到 public/galgame/（或跑 tools/install-engine.mjs），刷新页面再导出');
    const sub = (src, re, rep, tag) => {
      if (!re.test(src)) { report.push('MISS ' + tag); return src; }
      report.push('ok ' + tag); return src.replace(re, rep);
    };

    let e = engine;
    /* ★ 导出时不带本机那套演示素材映射: 别人拿到脚本后, 映射只来自他自己导入的素材包 */
    e = sub(e, /const BASE = '[^']*';/, "const BASE = '';   /* 导出脚本不引用任何内置素材目录 */", 'engine.base');
    /* ★ 纯 URL 模式: 图床链接类的素材【直接写进脚本映射表】(BASE 保持空), 本地文件类的仍然只进素材包。
       两类混用时各走各的 —— 全图床的人只发这一个脚本就够了, 不用发素材包 */
    const _isUrl = u => /^https?:\/\//i.test(String(u || ''));
    const urlBg = {}, urlFace = {}, urlBubble = {}, urlPool = [];
    (p.bgList || []).forEach(b => {
      if (!b || !b.name || !_isUrl(b.src)) return;
      const f = b.fit || {}, moved = (f.x || f.y || (f.scale && f.scale !== 1));
      urlBg[b.name] = moved ? { url: b.src, fit: { x: f.x || 0, y: f.y || 0, scale: f.scale || 1 } } : b.src;
    });
    /* ★ 立绘的「取景/定位」(fit: x/y/scale) 以前【整个没导出】—— 只写了 url 字符串。
       于是插件里把立绘缩到 0.83×、拖到某个位置, 到了真机就变回 1× 居中; 用户看到的就是
       "卡片里的站位/大小跟我插件里设的不一样"。这里和背景同规则: 有位移/缩放才写 {url, fit},
       没调过的立绘【继承本组定位图(anchorFace)的取景】(和预览、素材页那套一致, 不然换张脸位置会跳)。 */
    const fitOf = (fa, ap) => {
      const f = (fa && fa.fit) || ap || null;
      if (!f) return null;
      const x = Number(f.x) || 0, y = Number(f.y) || 0, s = Number(f.scale) || 1;
      return (x || y || s !== 1) ? { x: x, y: y, scale: s } : null;
    };
    const anchorFitOf = g => {
      const fl = (g && g.faces) || [];
      const a = fl.find(x => x && x.id === (g && g.anchorFace)) || fl[0] || null;
      return (a && a.fit) || null;
    };
    (p.spriteGroups || []).forEach(g => {
      const nm = String((g && g.name) || '').trim();
      const _ap = anchorFitOf(g);
      ((g && g.faces) || []).forEach(fa => {
        if (!fa || !fa.key || !_isUrl(fa.src)) return;
        const _fit = fitOf(fa, _ap);
        const _val = _fit ? { url: fa.src, fit: _fit } : fa.src;
        if (!nm || !(nm + '|' + fa.key in urlFace)) urlFace[(nm ? nm + '|' : '') + fa.key] = _val;
        if (nm && !(fa.key in urlFace)) urlFace[fa.key] = _val;
        if (urlPool.indexOf(fa.src) < 0) urlPool.push(fa.src);
      });
    });
    (p.stickers || []).forEach(s => { if (s && s.name && _isUrl(s.url)) urlBubble[s.name] = s.url; });

    /* ★ 便携版烘焙: 本地文件类素材转成 data: 写进脚本 (图 ≤900px webp), 让拿到脚本的人【不导包也有图】。
       对方之后导入素材包 ZIP 时以包为准 (包里走 1440 高清), 这里只是开箱即用的兜底。
       音频: 只烘 ≤2MB 的 (浏览器里没有 mp3 编码器, MediaRecorder 只能实时录 —— 大 BGM 重编码不现实), 超过的列出来。 */
    const bakeStat = { img: 0, imgKB: 0, audio: 0, audioKB: 0, skipAudio: [], saved: [], how: {} };
    /* ★ 小图会被 _resizeSmall 原样退回来(没走 canvas) —— 那时拿到的是地址而不是 data:,
       以前这里直接当失败扔掉: 内置那 20 张气泡贴纸全是小图 -> bubbleMap 烘成空 -> 真机气泡不出现 (2026-09-26 的 bug)。
       所以兜一层: 不是 data: 就抓成 data: 再写进脚本。 */
    const urlToDataUrl = async (u) => {
      try {
        const r = await fetch(u, { credentials: 'same-origin' });
        if (!r.ok) return '';
        const b = await r.blob();
        return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || '')); fr.onerror = () => res(''); fr.readAsDataURL(b); });
      } catch (e) { return ''; }
    };
    const bake = async (e, cap) => {
      try {
        const d = await previewSmall(e, Number(cap) || 900, true);   // force: 小图也重编码成 webp, 别把原图 PNG 塞进脚本
        if (d && d.indexOf('data:') === 0) { bakeStat.img++; bakeStat.imgKB += Math.round(d.length / 1024); return d; }
        if (d) {                                   // 本来就小: 拿回来的是地址 -> 抓成 data: 再用
          const u = await urlToDataUrl(d);
          if (u && u.indexOf('data:') === 0) { bakeStat.img++; bakeStat.imgKB += Math.round(u.length / 1024); return u; }
        }
      } catch (err) {}
      return '';
    };
    for (const b of (p.bgList || [])) {
      if (!b || !b.name || _isUrl(b.src) || (b.name in urlBg)) continue;
      const d = await bake(b); if (!d) continue;
      const f = b.fit || {}, moved = (f.x || f.y || (f.scale && f.scale !== 1));
      urlBg[b.name] = moved ? { url: d, fit: { x: f.x || 0, y: f.y || 0, scale: f.scale || 1 } } : d;
    }
    for (const g of (p.spriteGroups || [])) {
      const nm = String((g && g.name) || '').trim();
      const _ap2 = anchorFitOf(g);
      for (const fa of ((g && g.faces) || [])) {
        if (!fa || !fa.key || _isUrl(fa.src)) continue;
        const d = await bake(fa); if (!d) continue;
        const _fit2 = fitOf(fa, _ap2);            // ★ 同上: 烘成 data: 也要把取景带上
        const _val2 = _fit2 ? { url: d, fit: _fit2 } : d;
        if (nm && !(nm + '|' + fa.key in urlFace)) urlFace[nm + '|' + fa.key] = _val2;
        if (nm && !(fa.key in urlFace)) urlFace[fa.key] = _val2;
        if (urlPool.indexOf(d) < 0) urlPool.push(d);
      }
    }
    /* ★ 气泡贴纸给 512 就够 (贴纸显示出来也就一两百像素) —— 20 张从 10MB 压到 ~1MB */
    for (const s of (p.stickers || [])) { if (s && s.name && !_isUrl(s.url) && !(s.name in urlBubble)) { const d = await bake(s, 512); if (d) urlBubble[s.name] = d; } }
    try { for (const [id, cn] of stickerList(p)) { if (cn && !(id in urlBubble)) { const d = await bake(stickerUrl(id), 512); if (d) urlBubble[id] = d; } } } catch (e) { report.push('!! 气泡贴纸烘焙出错: ' + e.message); }
    /* ★ 报出来: 气泡一直"静默不出现"就是因为以前这里没人看 (lesson 35) */
    report.push(Object.keys(urlBubble).length
      ? ('气泡贴纸: ' + Object.keys(urlBubble).length + ' 张进脚本 · 约 ' + Math.round(Object.values(urlBubble).join('').length / 1024) + 'KB')
      : '!! 气泡贴纸: 一张都没烘进去 (脚本里 bubbleMap 会是空的, 真机点 bubble:名字 不会出现)');
    const fileDataUrl = async (blobId) => {
      const b = await blobGet(blobId); if (!b) return '';
      return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || '')); fr.onerror = () => res(''); fr.readAsDataURL(b); });
    };
    /* ============================================================
       音频压缩: WebCodecs(AudioEncoder) 编 Opus + 自己封 Ogg
       —— 浏览器里没有 mp3 编码器(实测), 但 Opus 有, 而且比实时快几十倍:
          64kbps Opus 的听感和 320kbps mp3 接近, 体积约 1/5 —— 几 MB 的歌压完就能塞进脚本。
       —— 输出是标准 Ogg Opus (实测 <audio> 能播: duration 对得上, decodeAudioData 也能解)。
       ============================================================ */
    const OGG_CRC_T = (function () {
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) { let c = n << 24; for (let k = 0; k < 8; k++) c = (c & 0x80000000) ? ((c << 1) ^ 0x04c11db7) : (c << 1); t[n] = c >>> 0; }
      return t;
    })();
    const oggCrc = u8 => { let c = 0; for (let i = 0; i < u8.length; i++) c = ((c << 8) >>> 0) ^ OGG_CRC_T[((c >>> 24) ^ u8[i]) & 0xff]; return c >>> 0; };
    function oggPage(serial, seq, granule, flags, packets) {
      const segs = [], body = []; let total = 0;
      packets.forEach(p => { let n = p.length; while (n >= 255) { segs.push(255); n -= 255; } segs.push(n); body.push(p); total += p.length; });
      const head = new Uint8Array(27 + segs.length);
      head[0] = 79; head[1] = 103; head[2] = 103; head[3] = 83; head[4] = 0; head[5] = flags;
      let g = granule; for (let i = 0; i < 8; i++) { head[6 + i] = g & 0xff; g = Math.floor(g / 256); }
      head[14] = serial & 0xff; head[15] = (serial >> 8) & 0xff; head[16] = (serial >> 16) & 0xff; head[17] = (serial >> 24) & 0xff;
      head[18] = seq & 0xff; head[19] = (seq >> 8) & 0xff; head[20] = (seq >> 16) & 0xff; head[21] = (seq >> 24) & 0xff;
      head[26] = segs.length; for (let j = 0; j < segs.length; j++) head[27 + j] = segs[j];
      const out = new Uint8Array(head.length + total); out.set(head, 0);
      let at = head.length; body.forEach(b => { out.set(b, at); at += b.length; });
      const crc = oggCrc(out);
      out[22] = crc & 0xff; out[23] = (crc >> 8) & 0xff; out[24] = (crc >> 16) & 0xff; out[25] = (crc >>> 24) & 0xff;
      return out;
    }
    function oggOpusBlob(packets, ch, rate, preSkip) {
      const serial = (Math.random() * 0x7fffffff) | 0, parts = [];
      const head = new Uint8Array(19), magic = [79, 112, 117, 115, 72, 101, 97, 100];   /* OpusHead */
      for (let i = 0; i < 8; i++) head[i] = magic[i];
      head[8] = 1; head[9] = ch; head[10] = preSkip & 0xff; head[11] = (preSkip >> 8) & 0xff;
      head[12] = rate & 0xff; head[13] = (rate >> 8) & 0xff; head[14] = (rate >> 16) & 0xff; head[15] = (rate >> 24) & 0xff;
      parts.push(oggPage(serial, 0, 0, 2, [head]));
      const ven = new TextEncoder().encode('TextGameMaker');
      const tags = new Uint8Array(12 + ven.length + 4), tm = [79, 112, 117, 115, 84, 97, 103, 115];   /* OpusTags */
      for (let i = 0; i < 8; i++) tags[i] = tm[i];
      tags[8] = ven.length & 0xff; tags[9] = (ven.length >> 8) & 0xff; tags.set(ven, 12);
      parts.push(oggPage(serial, 1, 0, 0, [tags]));
      let seq = 2, batch = [], bytes = 0, lastEnd = 0;
      packets.forEach(p => {
        batch.push(p.data); bytes += p.data.length; lastEnd = p.endSample;
        if (bytes >= 4000) { parts.push(oggPage(serial, seq++, lastEnd + preSkip, 0, batch)); batch = []; bytes = 0; }
      });
      if (batch.length) parts.push(oggPage(serial, seq++, lastEnd + preSkip, 4, batch));
      else { const last = parts[parts.length - 1]; last[5] = last[5] | 4; }
      return new Blob(parts, { type: 'audio/ogg' });
    }
    /* 把一个音频 Blob 重编码成 Opus (返回 null = 这台浏览器做不了, 调用方回退原样) */
    async function opusCompress(blob, kbps) {
      try {
        if (typeof AudioEncoder === 'undefined') return null;
        const ab = await blob.arrayBuffer();
        const dec = new OfflineAudioContext(1, 1, 48000);      /* 只用它解码: 不需要用户手势 */
        let buf; try { buf = await dec.decodeAudioData(ab.slice(0)); } catch (e) { try { console.warn('[tgm] 音频解码失败(压缩跳过)', String(e)); } catch (e2) {} return null; }
        const SR = 48000, ch = Math.min(2, buf.numberOfChannels || 1);
        const frames = Math.max(1, Math.round(buf.duration * SR));
        const oac = new OfflineAudioContext(ch, frames, SR);
        const src = oac.createBufferSource(); src.buffer = buf; src.connect(oac.destination); src.start();
        const rendered = await oac.startRendering();
        const cfg = { codec: 'opus', sampleRate: SR, numberOfChannels: ch, bitrate: Math.max(16000, (Math.round(kbps) || 64) * 1000) };
        const sup = await AudioEncoder.isConfigSupported(cfg);
        if (!sup.supported) { try { console.warn('[tgm] Opus 配置不支持', cfg); } catch (e2) {} return null; }
        const chunks = []; let err = null;
        const enc = new AudioEncoder({
          output: c => { const u = new Uint8Array(c.byteLength); c.copyTo(u); chunks.push({ data: u, dur: c.duration }); },
          error: e => { err = String((e && e.message) || e); },
        });
        enc.configure(cfg);
        const FR = 960;                                        /* 20ms @48k */
        for (let off = 0; off < rendered.length; off += FR) {
          const n = Math.min(FR, rendered.length - off);
          const f = new Float32Array(n * ch);
          for (let c = 0; c < ch; c++) { const s = rendered.getChannelData(c); for (let k = 0; k < n; k++) f[k * ch + c] = s[off + k]; }
          const ad = new AudioData({ format: 'f32', sampleRate: SR, numberOfFrames: n, numberOfChannels: ch, timestamp: Math.round(off / SR * 1e6), data: f });
          enc.encode(ad); ad.close();
        }
        await enc.flush(); try { enc.close(); } catch (e) {}
        if (err || !chunks.length) { try { console.warn('[tgm] Opus 编码没出数据', err || 'empty'); } catch (e2) {} return null; }
        const preSkip = 312; let acc = 0;
        const pk = chunks.map(c => { acc += Math.round((c.dur || 20000) * SR / 1e6); return { data: c.data, endSample: acc }; });
        const out = oggOpusBlob(pk, ch, SR, preSkip);
        return (out && out.size) ? out : null;
      } catch (e) { try { console.warn('[tgm] 压缩音频出错', String(e && e.message || e)); } catch (e2) {} return null; }
    }
    const blobToDataUrl2 = b => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || '')); fr.onerror = () => res(''); fr.readAsDataURL(b); });
    const mbTxt = n => (n / 1048576).toFixed(1) + 'MB';
    /* ★ 本地音频怎么进脚本 (方案里存 audioOpus):
        64 / 96 = 先压成 Opus 再烘 (推荐; 几 MB 的歌压到 1/5, 拿到脚本的人不导包也有 BGM)
        0       = 原样烘 (脚本很大)
        -1      = 不烘 (只进素材包)
       以前写死 2MB 直接跳过 —— 用户导了歌、真机静音, 状态里还看不到任何解释。 */
    const bakeAudio = async (a, nm) => {
      if (!a || !a.blobId || a.kind !== 'file') return '';
      try {
        const b = await blobGet(a.blobId);
        if (!b) return '';
        const mode = (p && p.audioOpus === undefined) ? 64 : Number(p.audioOpus);
        if (mode < 0) { bakeStat.skipAudio.push(nm + '(设置成不烘)'); return ''; }
        let use = b, how = '原样';
        if (mode > 0 && b.size > 1048576) {                  /* 1MB 以下压了也白压 (Opus 有固定头开销) */
          const o = await opusCompress(b, mode);
          if (o && o.size && o.size < b.size) { use = o; how = 'Opus' + mode + 'k'; bakeStat.saved.push(nm + ' ' + mbTxt(b.size) + '→' + mbTxt(o.size)); }
          else { try { console.warn('[tgm] 压缩没变小或失败', nm, b.size, o && o.size); } catch (e2) {} }
        }
        if (use.size > 12 * 1048576) { bakeStat.skipAudio.push(nm + '(' + mbTxt(use.size) + ')'); return ''; }
        const d = await blobToDataUrl2(use);
        if (d && d.indexOf('data:') === 0) { bakeStat.audio++; bakeStat.audioKB += Math.round(d.length / 1024); bakeStat.how[nm] = how; return d; }
      } catch (e) {}
      return '';
    };
    /* ★ 烘焙失败必须喊出来: 素材字节读不到(换了浏览器/清了站点数据) -> 烘 0 张, 导出的脚本里就【没有背景】,
       而画面上只表现为"背景没了", 完全看不出原因。这里直接写进导出状态行。 */
    bakeStat.wantBg = (p.bgList || []).length;
    bakeStat.wantFace = (p.spriteGroups || []).reduce(function (n, gg) { return n + ((gg && gg.faces) || []).length; }, 0);
    report.push('baked 图 ' + bakeStat.img + ' 张/' + Math.round(bakeStat.imgKB / 1024) + 'MB'
      + '（方案里背景 ' + bakeStat.wantBg + ' / 立绘 ' + bakeStat.wantFace + '）'
      + (bakeStat.audio ? ' 音频 ' + bakeStat.audio + ' 个/' + Math.round(bakeStat.audioKB / 1024) + 'MB' : '')
      + (bakeStat.skipAudio.length ? ' 音频太大未烘: ' + bakeStat.skipAudio.join(' ') : ''));
    if (bakeStat.wantBg + bakeStat.wantFace > 0 && bakeStat.img === 0) {
      bakeStat.fail = true;
      report.push('!! 一张图都没烘进去：方案素材的字节没读到（换过浏览器 / 清过站点数据 / 素材是链接）—— 去「演出素材」重新导入图片，再导出');
    }
    e = sub(e, /bgMap: \{[\s\S]*?\n    \},/, 'bgMap: ' + JSON.stringify(urlBg) + ',', 'engine.bgMap(url' + Object.keys(urlBg).length + ')');
    e = sub(e, /faceMap: \{[\s\S]*?\n    \},/, 'faceMap: ' + JSON.stringify(urlFace) + ',', 'engine.faceMap(url' + Object.keys(urlFace).length + ')');
    e = sub(e, /facePool: \[[^\n]*\n/, 'facePool: ' + JSON.stringify(urlPool) + ',\n', 'engine.facePool(url' + urlPool.length + ')');
    e = sub(e, /bubbleMap: \{\},/, 'bubbleMap: ' + JSON.stringify(urlBubble) + ',', 'engine.bubbleMap(url' + Object.keys(urlBubble).length + ')');
    e = sub(e, /slots: \['left', 'middle', 'right'\],/,
      'slots: ' + JSON.stringify(p.slots && p.slots.length ? p.slots : ['left', 'middle', 'right']) + ',', 'engine.slots');

    let c = card;
    c = sub(c, /const ASSETS = \{[\s\S]*?\n\};/,
      'const ASSETS = ' + JSON.stringify(p.assets || DEFAULT_ASSETS, null, 2) + ';', 'assets');
    c = sub(c, /slots: \['left', 'middle', 'right'\],/,
      'slots: ' + JSON.stringify(p.slots || []) + ',', 'card.slots');
    c = sub(c, /slotPos: \{\},/,
      'slotPos: ' + JSON.stringify(p.slotPos || {}) + ',', 'card.slotPos');
    /* ★ 占位排版: 卡里也带上每个站位的画框 */
    c = sub(c, /slotBoxes: \{\},/, 'slotBoxes: ' + JSON.stringify(p.slotBoxes || {}) + ',', 'card.slotBoxes');
    /* 自定义演出: 名字 -> {css, cls, target, duration, js} (和预览 payload 共用 fxMap) */
    c = sub(c, /effects: \{\},/, 'effects: ' + JSON.stringify(fxMap(p)) + ',', 'card.effects');
    c = sub(c, /bubbleAnim: \{\},/, 'bubbleAnim: ' + JSON.stringify(p.bubbleAnim || {}) + ',', 'card.bubbleAnim');
    c = sub(c, /bubblePosEach: \{\},/, 'bubblePosEach: ' + JSON.stringify(p.bubblePosEach || {}) + ',', 'card.bubblePosEach');
    c = sub(c, /bubblePosSlot: \{\},/, 'bubblePosSlot: ' + JSON.stringify(p.bubblePosSlot || {}) + ',', 'card.bubblePosSlot');
    c = sub(c, /bubbleCss: '',/, 'bubbleCss: ' + JSON.stringify(bubbleCssText(p)) + ',', 'card.bubbleCss');
    /* ★ 三层模板: 没存过就用【当前模式】的默认 (原来存的是 null -> 真机上就退回原生楼层, 音量面板/暂停全没有);
       选了"无音频"就把已存模板里的音频块剥掉 —— 导出的就是无音频那一套 */
    const _pages = {}, _pageSrc = {};
    for (const k of ['char', 'user', 'panel']) {
      /* ★ 第 9 条: 方案选了横版就导横版那套 (pages.charLand) */
      const slot = pagesKey(k, p);
      const d = DEFAULT_TPL[slot] || DEFAULT_TPL[k];
      const savedPage = (p.pages || {})[slot] || null;
      let t = savedPage || (d ? { html: d.html, css: d.css, js: d.js } : null);
      /* ★ 方案里存过这一层 -> 导出的就是它, 不是插件默认。和当前默认不一样就记下来, 导出时提醒
         ("我明明更新了默认模板, 为什么导出的还是旧的" 就是这个: 方案里那份一直盖着) */
      _pageSrc[k] = !savedPage ? 'default'
        : ((String(savedPage.html || '') !== String((d || {}).html || '')
          || String(savedPage.css || '') !== String((d || {}).css || '')
          || String(savedPage.js || '') !== String((d || {}).js || '')) ? 'saved-diff' : 'saved-same');
      if (t && k === 'char' && noAudio) t = stripAudio(t);
      /* ★ 本地素材: __gvasset:名字__ -> data URL (导出的脚本要能脱离插件跑, 所以图是内联进去的) */
      _pages[k] = t ? await withPageAssets(t, p) : null;
    }
    report.push('三层模板: ' + ['char', 'user', 'panel'].map(function (k) {
      return ({ char: 'char', user: 'User', panel: '悬浮' })[k] + '=' + (_pageSrc[k] === 'default' ? '插件默认' : '方案里存的');
    }).join(' '));
    c = sub(c, /pages: \{ char: null, user: null, panel: null \},/,
      'pages: ' + JSON.stringify(_pages) + ',', 'card.pages');
    /* ★ 定位框宽高比也带进卡: 模板用它定手机比例 (不带就用模板自己的默认), 预览和真机才一致 */
    c = sub(c, /frameSize: null,/,
      'frameSize: ' + JSON.stringify(p.frameSize || null) + ',', 'card.frameSize');
    /* BGM: 情绪 -> 外链 */
    const audioMap = {};
    if (!noAudio) for (const a of (p.audioList || [])) {
      const nm = a && (a.mood || a.name); if (!nm) continue;
      if (_isUrl(a.url)) { audioMap[nm] = a.url; continue; }
      const d = await bakeAudio(a, nm); if (d) audioMap[nm] = d;
    }
    c = sub(c, /audioMap: \{\},/, 'audioMap: ' + JSON.stringify(audioMap) + ',', 'card.audioMap(url' + Object.keys(audioMap).length + ')');
    /* ★ 音效同理: 外链类写进脚本的 seMap (以前导出脚本里音效永远是空的 -> 真机上放不出来);
       本地文件类的照旧只进素材包 (manifest.se), 卡脚本读包时合并 */
    const seMap = {};
    if (!noAudio) for (const s of (p.seList || [])) {
      const nm = s && s.name; if (!nm) continue;
      if (_isUrl(s.url)) { seMap[nm] = s.url; continue; }
      const d = await bakeAudio(s, nm); if (d) seMap[nm] = d;
    }
    c = sub(c, /seMap: \{\},/, 'seMap: ' + JSON.stringify(seMap) + ',', 'card.seMap(url' + Object.keys(seMap).length + ')');
    /* ★ 音频的账要在这里报 (上面那行 `baked 图…` 跑在音频烘焙之前, 所以"太大未烘"永远不会出现在状态里 ——
       用户导了歌、导出后真机静音, 却看不到任何解释) */
    report.push('音频: BGM ' + Object.keys(audioMap).length + ' 首 / 音效 ' + Object.keys(seMap).length + ' 个进脚本'
      + (bakeStat.audio ? '（共 ' + Math.round(bakeStat.audioKB / 1024) + 'MB）' : '')
      + (bakeStat.saved.length ? ' · 压缩: ' + bakeStat.saved.join('、') : '')
      + (bakeStat.skipAudio.length ? ' · 没进脚本: ' + bakeStat.skipAudio.join(' ') + '（它们仍然跟着「导出素材包 .zip」走）' : ''));
    c = sub(c, /bubblePos: \{ x: 78, y: 24, scale: 1 \},/,
      'bubblePos: ' + JSON.stringify(p.bubblePos || { x: 78, y: 24, scale: 1 }) + ',', 'card.bubblePos');
    /* ★ 楼层角落那个 ⋯（点了整页切回原生楼层）一律关掉 —— 不管源脚本里写的是什么 */
    c = sub(c, /rawToggle: (?:true|false),/, 'rawToggle: false,', 'card.rawToggle');
    c = sub(c, /const ov = loadPromptOverride\(\);/,
      'const ov = loadPromptOverride() || GV_BAKED_PROMPT;', 'bakedPrompt');
    c = sub(c, /async function loadCssText\(\) \{[\s\S]*?\n\}/,
      'async function loadCssText() { GV_CSS = GV_BAKED_CSS; return GV_CSS; }\n' +
      'const GV_BAKED_CSS = ' + JSON.stringify(allCss) + ';', 'bakedCss');
    c = sub(c, /function injectDocCss\(\) \{[\s\S]*?\n\}/,
      "function injectDocCss() { if (doc.getElementById('gv-style')) return; const st = doc.createElement('style'); st.id='gv-style'; st.textContent = GV_BAKED_CSS; doc.head.appendChild(st); }", 'bakedInjectCss');
    c = sub(c, /async function ensureEngine\(\) \{[\s\S]*?\n\}/,
      'async function ensureEngine() { if (P.Galgame) P.Galgame.assetVersion = CONFIG.assetVersion; }', 'skipFetchEngine');

    /* ★ 引擎+脚本的构建指纹: 导出脚本靠它判断父窗口里那份引擎要不要换 (内容一变指纹就变) */
    let _bh = 2166136261;
    {
      const _bs = e + '\u0000' + c;
      for (let i = 0; i < _bs.length; i++) { _bh ^= _bs.charCodeAt(i); _bh = Math.imul(_bh, 16777619); }
    }
    const GV_BUILD = ('0000000' + ((_bh >>> 0).toString(16))).slice(-8);
    report.push('build ' + GV_BUILD);
    /* 注意顺序: 三个 const 必须先声明再执行 —— const 的 TDZ 否则会直接 ReferenceError */
    const parts = [
      '/* ============================================================',
      '   ' + PLUGIN.name + ' 导出脚本',
      '   方案：' + (p.name || '未命名'),
      '   导出时间：' + new Date().toLocaleString(),
      '   —— 自包含：引擎 / 样式 / 提示词 / 素材清单 全部内联，不依赖 /galgame/ 目录',
      '   —— 用法：酒馆助手 → 角色脚本 → 新建 → 把下面全部粘进去',
      '   ============================================================ */',
      'const GV_BAKED_PROMPT = ' + JSON.stringify(promptText) + ';',
      'const GV_ENGINE = ' + JSON.stringify(e) + ';',
      'const GV_SCRIPT = ' + JSON.stringify(c) + ';',
      'const GV_BUILD = ' + JSON.stringify(GV_BUILD) + ';   /* 引擎+脚本的指纹 */',
      '',
      '/* ---- 先装引擎 ---- */',
      '/* 角色脚本跑在 iframe 里: window.Galgame 其实是父窗口的 P.Galgame,',
      '   所以必须把父窗口的 window/document 当参数喂给引擎, 否则会装到 iframe 自己身上 */',
      'var P = window.parent || window;',
      'try {',
      '  /* ★ 引擎要连 build 一起校验: 以前只在 P.Galgame 【不存在】时装载 —— 同一个页面里换脚本时',
      '     (重新导入一份新导出的脚本、或同一张卡换版本), 父窗口里那份【旧引擎】会一直活着,',
      '     表现就是「悬浮窗是新的, 但楼层还是老背景 / 老站位」—— 背景表、站位、画框全在引擎的 CONFIG 里。',
      '     现在指纹不一样就换掉旧引擎, 楼层脚本随后会自己重画。 */',
      '  var _engineNeed = !P.Galgame || !P.Galgame.version || P.Galgame.build !== GV_BUILD;',
      '  if (_engineNeed) {',
      '    try { if (P.Galgame && P.Galgame.teardown) P.Galgame.teardown(); } catch (e1) {}',
      '    try { P.Galgame = null; } catch (e2) {}',
      '    (new Function("window", "document", "self", GV_ENGINE))(P, P.document, P);',
      '    try { if (P.Galgame) P.Galgame.build = GV_BUILD; } catch (e3) {}',
      '    if (typeof toastr !== "undefined") toastr.info("楼层引擎已更新 (build " + GV_BUILD + ")");',
      '  }',
      '} catch (err) { console.error("[TGM] 引擎装载失败", err); }',
      '/* ---- 再跑楼层脚本 (烘焙的提示词要用参数传进去, new Function 是独立作用域) ---- */',
      "(new Function('GV_BAKED_PROMPT', GV_SCRIPT))(GV_BAKED_PROMPT);",
    ];
    return { text: parts.join(String.fromCharCode(10)) + String.fromCharCode(10), report: report };
  }


  /* ★ 导出成【酒馆助手脚本库】能直接导入的 .json —— 裸 .js 是进不去脚本库的。
     格式照 JS-Slash-Runner 的 src/type/scripts.ts (zod Script) 写:
       { type:'script', enabled, name, id, content, info, button:{enabled,buttons[]}, data, export_with:{data,button} }
     它的导入按钮只收 .json (Toolbar.vue: handleImport -> JSON.parse -> ScriptTree.parse) */
  async function exportTavernScript() {
    if (!(await boxGuard())) return;
    const st = document.getElementById('tgm-exp-status');
    const set = t => { if (st) st.textContent = t; };
    try {
      set('正在打包…');
      const { text, report } = await buildExportScript(cur);
      const obj = {
        type: 'script',
        enabled: true,
        name: (cur.name || '文字游戏') + ' · 页面脚本',
        content: text,
        info: '由「文字游戏页面制作器」导出：引擎 / 样式 / 提示词 / 素材清单 / 页面排版三层模板全部内联，别人不装插件也能跑。'
          + ' 本地文件类的素材（背景 / 立绘 / 贴纸 / 音频 / 音效）跟着素材包 .zip 走，在悬浮窗里「导入素材包」。',
        button: { enabled: true, buttons: [
          { name: '重绘Galgame', visible: true },
          { name: 'Galgame开关', visible: true },
          { name: '格式转换', visible: true },
        ] },
        data: {},
        export_with: { data: true, button: true },
      };
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = safeName(cur.name) + '.酒馆助手脚本.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      const _warn = report.filter(function (x) { return /^!!/.test(x); }).join(' ');
      set('已导出酒馆助手脚本 ' + (blob.size / 1024).toFixed(1) + ' KB（酒馆助手 → 脚本库 → 导入，选这个 .json）｜ ' + report.join(' '));
      if (_warn && typeof toastr !== 'undefined') toastr.error(_warn.slice(0, 300), '导出提醒：素材没烘进去', { timeOut: 15000 });
    } catch (e) { set('导出失败：' + e.message); }
  }

  function renderExport() {
    const p = UI.panes.export; if (!p || !cur) return;
    p.innerHTML = '';
    p.append(el('div', 'tgm-h2', '导出'), el('div', 'tgm-hint',
      '导出一个自包含的酒馆助手脚本：引擎、样式、提示词、素材清单全部内联，别人不装插件也能用。'
      + '　装到别人机器上：酒馆助手 → 脚本库 → 导入，选导出的那个 .json。'));
    /* ★ 引擎文件不跟着扩展更新走: 旧引擎导出的脚本, 别人拿到的悬浮窗还是旧样子 —— 当面查一次并警告 */
    (async function () {
      try {
        const e = await fetchText('/galgame/galgame.js');
        if (String(e).indexOf("ENGINE_REV = '") >= 0) return;
        const w = el('div', 'tgm-warn');
        w.appendChild(el('span', '', '你酒馆里的引擎文件（' + '<酒馆>/public/galgame/galgame.js' + '）是旧版：用这份引擎导出的脚本，别人装上去悬浮窗还是旧样子。把仓库里的 engine/ 重新复制一份到 <酒馆>/public/galgame/（或者跑一次 tools/install-engine.mjs），刷新页面再导出。'));
        p.insertBefore(w, p.children[2] || null);
      } catch (err) {}
    })();
    const card = el('div', 'tgm-card');
    const r1 = el('div', 'tgm-row');
    const b0 = el('div', 'tgm-btn tgm-primary', '导出酒馆助手脚本 (.json)');
    b0.title = '酒馆助手脚本库能导入的就是这种 .json（脚本库 → 导入）。裸 .js 文件脚本库不认';
    const b2 = el('div', 'tgm-btn', '复制脚本');
    const b3 = el('div', 'tgm-btn', '导出方案 (.json)');
    r1.append(b0, b2, b3); card.appendChild(r1);
    const b5 = el('div', 'tgm-btn tgm-primary', '导入工程包 / 方案 (.json / .zip)');
    b5.title = '别人给你的「工程包 .zip」（方案 + 全部素材）或只有设置的「方案 .json」，导进来都会新建一个方案，不覆盖你现在的';
    r1.appendChild(b5);
    b5.addEventListener('click', async () => {
      const st = document.getElementById('tgm-exp-status');
      const f = await pickFile('.json,.zip');
      if (!f) return;
      try {
        /* ★ 工程包 zip: 方案 + 素材一起搬进来 */
        if (/\.zip$/i.test(f.name || '')) {
          const okz = await dialog({ title: '导入工程包', text: '会把整个方案（页面模板 / 站位 / 取景 / 提示词 + 背景 / 立绘 / 音频 / 音效 / 贴纸 / 页面素材）搬进来，新建一个方案，不覆盖你现在这个。', okText: '导入' });
          if (!okz) return;
          const rz = await importProjectPackZip(f);
          if (st) st.textContent = '已导入工程包：' + rz.name + '（' + rz.blobs + ' 个素材' + (rz.miss ? '，' + rz.miss + ' 个对不上' : '') + '）';
          await refresh();
          return;
        }
        const obj = JSON.parse(await f.text());
        if (!obj || typeof obj !== 'object' || (!obj.pages && !obj.audioList && !obj.assets)) throw new Error('这不像一份方案 json');
        const ok = await dialog({ title: '导入方案', text: '会新建一个方案（名字后面加「（导入）」），不会覆盖你现在这个。', okText: '导入' });
        if (!ok) return;
        const np = await createProject(String(obj.name || '导入的方案') + '（导入）');
        Object.assign(np, obj, { id: np.id });
        await putProjectData(np);
        if (st) st.textContent = '已导入：' + np.name;
        await refresh();
      } catch (e) { if (st) st.textContent = '导入失败：' + e.message; }
    });
    const r2 = el('div', 'tgm-row');
    const b4 = el('div', 'tgm-btn tgm-primary', '导出素材包 (.zip)');
    /* ★ 工程包 = 给「制作器」用的: 方案本身 + 全部素材, 一个 zip 搬走 */
    const b4b = el('div', 'tgm-btn', '导出工程包 (.zip)');
    b4b.title = '把当前这个方案连素材一起打包（方案 json + 背景 / 立绘 / 音频 / 音效 / 贴纸 / 页面素材），别人在「导入工程包 / 方案」里选这个 zip 就能接着做';
    r2.append(b4, b4b); card.appendChild(r2);
    /* ★ 清「本机素材包缓存」: 角色脚本打开时会把以前导入过的素材包从 IndexedDB 里自动恢复,
       而且和脚本自带素材【合并】(同名以包为准) —— 于是"这次导出没带的背景"还会顽固地显示。
       这个按钮只删那份缓存, 不动方案里的素材、也不动脚本。 */
    const r2b = el('div', 'tgm-row');
    const b6 = el('div', 'tgm-btn', '清除本机素材包缓存');
    b6.title = '角色脚本会把导入过的素材包存在浏览器里(IndexedDB), 每次打开自动恢复。旧包里同名素材会盖住新脚本里的 —— 这就是"没放进脚本的旧背景还在"的原因。这里只清缓存, 不动你的方案素材。';
    b6.addEventListener('click', async () => {
      const okz = await dialog({ title: '清除本机素材包缓存', text: '删掉浏览器里存的那份"导入过的素材包"（背景/立绘/音频）。不会动你方案里的素材，也不会动脚本。清完刷新页面/重开聊天，就只剩脚本自带的素材了。', okText: '清除' });
      if (!okz) return;
      const st2 = document.getElementById('tgm-exp-status');
      try {
        const n = await clearPackCache();
        if (st2) st2.textContent = '已清除本机素材包缓存（' + n + ' 项）。刷新页面 / 重开聊天后生效。';
      } catch (e) { if (st2) st2.textContent = '清除失败：' + e.message; }
    });
    r2b.appendChild(b6); card.appendChild(r2b);
    card.appendChild(el('div', 'tgm-dlg-text',
      '【导出酒馆助手脚本】出来的是一份【自包含】的脚本：本地图片（背景 / 立绘 / 贴纸）都会【按低清烘一份】一起内联进去，'
      + '本地音频 / 音效按上面选的「本地音频上限」一起烘进去 —— 别人只拿这一个 .json 就能跑，不用再传别的东西。'
      + '超过上限的音频不进脚本（导出状态里会列出来），它们跟着素材包 .zip 走：对方在悬浮窗「素」→「① 导入高清素材包」里导入即可。'
      + '　【导出素材包 .zip】是可选的：里面装的是【原图（高清）】+ manifest.json。'
      + '低清和高清摆在手机框里看几乎没差别，所以平时直接导脚本就够了；只有你想让别人拿到高清原图时才另外导素材包。'
      + '　给「制作器」用（别人还要接着改方案）才导【工程包】：方案 json + 全部素材打成一个 zip。'));
    b4.addEventListener('click', exportAssetPack);
    b4b.addEventListener('click', exportProjectPack);
    /* ★ 本地音频怎么进脚本: 默认压成 Opus 64k (听感接近 320k mp3, 体积约 1/5) */
    const rAu = el('div', 'tgm-row');
    rAu.appendChild(el('div', 'tgm-code', '本地音频'));
    [['64', '压缩 Opus 64k（推荐）'], ['96', 'Opus 96k（音质更好）'], ['0', '原样烘（脚本很大）'], ['-1', '不烘（只进素材包）']].forEach(function (o) {
      const curV = (cur.audioOpus === undefined) ? 64 : Number(cur.audioOpus);
      const b = el('div', 'tgm-btn' + (curV === Number(o[0]) ? ' tgm-primary' : ''), o[1]);
      b.title = '本地文件类的 BGM / 音效怎么进脚本：压成 Opus 可以小到 1/5（浏览器里实测：30 秒立体声压完只要 0.8 秒，<audio> 正常播放）。选「不烘」的话它们只跟着「导出素材包 .zip」走。';
      b.addEventListener('click', async () => { cur.audioOpus = Number(o[0]); await putProjectData(cur); renderExport(); });
      rAu.appendChild(b);
    });
    card.appendChild(rAu);
    card.appendChild(el('div', 'tgm-status', '')).id = 'tgm-exp-status';
    b0.addEventListener('click', exportTavernScript);
    b2.addEventListener('click', async () => {
      if (!(await boxGuard())) return;
      const st = document.getElementById('tgm-exp-status');
      try { const { text, report } = await buildExportScript(cur); await navigator.clipboard.writeText(text); if (st) st.textContent = '已复制脚本代码 ' + (text.length/1024).toFixed(1) + ' KB（自己往酒馆助手的脚本内容框里粘）｜ ' + report.join(' '); }
      catch (e) { if (st) st.textContent = '复制失败：' + e.message; }
    });
    b3.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(cur, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = (cur.name || '方案') + '.json'; document.body.appendChild(a); a.click(); a.remove();
    });
    p.appendChild(card);
    /* ★ 小尾巴 (需求整理 §十九.B.5): 这里原来挂的"待做(P2/P3/P4)"那三条早就做完了, 换成真实状态;
       顺便把 manifest.json 是什么写清楚, 以及现在导出的到底是哪一套 (有音频 / 无音频) */
    const noAudio = (cur.audioMode === 'without');
    p.appendChild(el('div', 'tgm-todo', [
      '这一份脚本里已经内联好了（拿到脚本的人什么都不用装）：',
      '· 引擎 + 页面排版三层模板（现在导出的是「' + (noAudio ? '无音频' : '有音频') + '」那一套' + (noAudio ? '：音量面板 / 暂停这些块会被剥掉' : '：带音量面板 / 暂停 / 进度 / 重播') + '）',
      '· 样式 + 提示词（' + (noAudio ? '无音频：不带 BGM 名字表 / 音效规则' : '含 BGM 名字表 / 音效写在行尾的规则（有导入才会出现）') + '）',
      '· 图像：本地文件类的背景 / 立绘 / 贴纸按【低清 webp】烘进脚本，外链类直接写原地址 —— 只拿脚本就有图',
      '· 音频：外链类写原地址；本地文件里 2MB 以内的烘进脚本（更大的烘不进去，会列在导出状态里让你看到）',
      '· 参数：多人站位坐标 / 占位画框、立绘取景 fit（位置 + 缩放）、气泡落点与入场动画、自定义演出、气泡 CSS',
      '· 按行换背景（消息里多处【bg:】会跟着演到哪一行切）、名字对不上时会明确提示"方案里没有"、不会随便拿别的图顶',
      '· 导出前会校验：多人排版缺画框 / 缺站位会拦下来提示，char 竖版横版两套都在',
      '',
      '【素材包 .zip】是可选的"高清补充"：里面是原图 + manifest.json（名字 → 文件路径、每张图的 fit / 锚点 / 气泡参数…）。',
      '别人拿到脚本后如果还想要高清，就在悬浮窗「素」里导入素材包 —— 同名素材以包里的为准（包 = 高清，脚本里烘的 = 低清兜底）。',
      '低清和高清在手机框里几乎看不出差别；不导包也完全能玩。',
      '',
      '不在脚本里、跟着浏览器走的：悬浮窗「转」里的兜底转换 API 设置、音量偏好（存在本机 localStorage，换浏览器要重设一次）。',
    ].join('\n')));
  }

  /* ---------------- 顶部按钮 ---------------- */
  function mountButton() {
    if (document.getElementById('tgm-topbtn')) return true;
    const holder = document.getElementById('top-settings-holder');
    const anchor = document.getElementById('extensions-settings-button');
    /* ★ 图标做成和酒馆其它顶部图标【一模一样的结构】: 字体图标类直接挂在 .drawer-icon 自己身上
       (酒馆的 .drawer-icon 规则给 display/padding/font-size: var(--topBarIconSize), fa-fw 给固定宽度),
       颜色靠 currentColor 继承主题 —— 以前是 emoji 🎬 塞在里层, 尺寸/颜色都不跟这一排走, 看着突兀。 */
    const btn = el('div', 'drawer-icon fa-solid fa-clapperboard fa-fw interactable closedIcon'); btn.id = 'tgm-topbtn';
    btn.title = PLUGIN.name;
    btn.addEventListener('click', e => { e.stopPropagation(); open(); });
    if (holder && anchor && anchor.parentElement === holder) holder.insertBefore(btn, anchor.nextSibling);
    else if (holder) holder.appendChild(btn);
    else return false;
    return true;
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    let tries = 0;
    const t = setInterval(() => {
      if (mountButton() || ++tries > 40) clearInterval(t);
    }, 500);
  }
  if (window.jQuery) jQuery(() => boot()); else window.addEventListener('DOMContentLoaded', boot);
  window.TextGameMaker = { version: PLUGIN.version, open, get project() { return cur; }, STICKERS, buildPrompt, __unzip: unzip, __buildAssetPack: buildAssetPack,
    buildExportScript: (p) => buildExportScript(p || cur),
    buildAssetPack: (p) => buildAssetPack(p || cur) };
})();
