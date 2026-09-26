import fs from 'node:fs';
const T = 'D:/toomanybug/galgame/tpl-build/tpl/';
const OUT = 'D:/toomanybug/galgame/docs/页面模板提示词-草稿.txt';
const rd = f => fs.readFileSync(T + f, 'utf8').replace(/\s+$/, '');
const F = String.fromCharCode(96).repeat(3);
const SEP = '='.repeat(70);

const common = [
'通用规则（三份提示词里都写了，改的时候三份一起改）',
'',
'沙箱限制（很容易踩）',
'  1) iframe 是 sandbox="allow-scripts"（独立源）：只能加载 data: 和它自己造的 blob:，',
'     外链图片 / 字体 / @import 一律加载不出来。不要写外链资源，图片走宿主给的映射表。',
'  2) 不能用 position: fixed（会被裁掉）；不要用 vh / vw 当主要高度（宿主按内容量算高）；',
'     不要给 html / body 定死宽高。宽度由宿主给（char 默认 400px 竖版）。',
'  3) 类名一律 gv- 前缀；下面列出的 id / 类名 / data-a 必须保留、不能改名。',
'',
'输出格式（硬要求，一次回复就把三块给全）',
'  【一次回复里给三段代码，各自一个围栏代码块，顺序固定：先 html、再 css、最后 js】。',
'  三个围栏的语言标记必须分别写 html / css / js —— 宿主就是按围栏语言把三段分别塞进三个输入框的，',
'  写错或漏写就会进错框 / 加载失败。',
'    · html 那块：只写结构，不写 <style>、不写 <script>、不写完整 HTML 文档（不要 <html>/<head>/<body>）。',
'    · css 那块：只写 CSS，不写 <style> 标签。',
'    · js 那块：只写 JS，不写 <script> 标签。',
'  三段是【分开的三块】，不要拼成一坨、不要在 html 里内联样式/脚本、也不要只给一两段',
'  （"其余同上""省略""按上面自己补"都不行 —— 三块都得给全，一次给完）。',
'  每块开头可以写一行注释说明这块干什么，但块与块之间不要夹大段解释文字。',
'  三部分各自的体积参考：CSS 不超过 25KB、JS 不超过 30KB。',
  '     （var / function）就行。',
  '',
  '沙箱里能用什么 / 不能用什么（宿主已经把一些库搬进沙箱了，直接用就行）',
  '  能用：',
  '  能用（宿主已经把下面这些搬进沙箱了（预览和真机都一样），直接用，不用自己引）：',
  '    · Font Awesome 全套图标 —— <i class="fa-solid fa-heart"></i> / <i class="fa-regular fa-star"></i> / <i class="fa-brands fa-github"></i>',
  '    · Tailwind CSS —— 直接写 class（flex / p-4 / text-xl / grid …）',
  '    · highlight.js —— <pre><code class="language-js">…</code></pre>，代码高亮（配色已带）',
  '    · Mermaid —— <div class="mermaid">graph TD; A-->B;</div> 之类，画流程图',
  '    · animate.css —— class="animate__animated animate__bounce" 之类的入场动画',
  '    · 内联 SVG、<img src="data:...">、CSS 里的 data: 背景图',
  '    · 占位排版：多人时宿主会给 ctx.slotBoxes = { 站位名: {x,y,w,h} }（整块的百分比，x/y 是左上角）。',
  '      有框就按框站：居中对齐框、底边贴框底、宽高就是框（写 CSS 变量时记得 height 也要跟框走，别写死 100%）。',
  '    · 本地素材：模板里写 __gvasset:名字__（名字 = 制作器里「页面排版 → 从本地导入素材」导入的图），预览和导出',
  '      都会换成那张图的 data URL —— 例如 background-image: url(__gvasset:房间__) 或 <img src="__gvasset:房间__">。',
  '      本地图只能走这个：直接写文件路径 / 相对路径 / file:// 在沙箱里一律加载不出来',
  '    · <link rel="stylesheet" href="https://..."> 引别处的外链 CSS：宿主会把那个 CSS 取回来（连同它里面的',
  '      字体 / 图片一起内联）再给页面用 —— 但那个站必须允许跨域（jsdelivr 这类带 Access-Control-Allow-Origin 的可以）',
  '    · 不带跨域头的外链图片 / 字体（宿主取不回来，就会空着）',
  '  一句话：能用 class / SVG / data: 就优先用；要引外部库就写 <link>，让宿主去搬。',
].join('\n');

/* ★ 开工前先对齐需求: 用户没说的话先问清楚再动手 (三份提示词都带这一段, 放在最前面) */
const ask = [
'开工之前（先别写代码）',
'  用户如果没明确说过，先用一小段话跟他确认下面几件事，等他回答之后再动手写：',
'    1) 风格：像素 / 手绘 / 极简 / 赛博朋克 / 古风 / 二次元 / 写实 …（也可以让他丢个参考图或参考游戏）',
'    2) 配色：主色 + 强调色 + 底色（可以直接给两三套配色让他挑，别让他自己报色号）',
'    3) 额外功能：要不要音量面板 / 自动播放 / 重播 / 进度点 / 气泡贴纸 / 立绘切换 / 这一楼自带的编辑器 …',
'    4) 版式尺寸：竖版还是横版（手机框比例），要不要跟着宿主的定位框走',
'  用户已经说清楚的项就别再问；他说"你看着办"就自己定，但要在回复开头用一两行写清你定的风格和配色。',
'  只问这四件事，别把整份提示词再复述一遍，也别在没确认之前就先甩一版代码出来。',
].join('\n');

const head = [
'页面排版：三份提示词草稿（CHAR 楼层 / 配套的 USER 楼层 / 配套的悬浮窗，各一份）',
'',
'用途：别人（或你自己）想让别的 AI 帮忙做页面模板时，把那一层的提示词整份复制过去。',
'每份提示词里都带了那一层当前默认模板的 HTML / CSS / JS 全文当参考。',
'',
'怎么用',
'  1) 「页面排版」页 → 切到要改的那一层（CHAR 楼层 / USER 楼层 / 悬浮窗）→ 点那一层的',
'     「提示词」按钮（这个按钮做进插件后只在你切到那一层时才出现）。',
'  2) 整份粘给 AI，后面再加一句你想要的效果，例如"做成赛博朋克风、对话框半透明"。',
'  3) AI 会回 2~3 段带围栏的代码 → 整段复制 → 回插件点「粘贴导入」→ 自动进对应的框 → 点「保存」。',
'',
'三份的差别',
'  · 一、仿文字游戏的 CHAR 楼层：角色说话那一层（演出主界面）。最复杂：手机框 / 背景 /',
'    音量面板 / 自带编辑器，还要跟宿主同步音频。',
'  · 二、与 CHAR 楼层配套的 USER 楼层：玩家那一层。就一条 userbar（头像 + 名字 + 正文）+ 展开后的操作和编辑器，',
'    没有背景立绘音频。',
'  · 三、与 CHAR 楼层配套的悬浮窗：制作器那个浮窗。列表 + 自带三个内嵌页面（提示词 / 兜底转换 API / 导入素材包），',
'    还要能拖动、改大小、收小球。',
].join('\n');

function build(no, title, what, cssReq, jsReq, msgTable, files) {

  const L = [SEP, no + '、' + title + '（提示词）', SEP, '', ask, '', '这一层是什么 / 要做什么 / HTML 结构要求', what, '', common, '',
    'CSS 部分的要求', cssReq, '', 'JS 部分的要求', jsReq, '', '消息协议（宿主认这些类型名，不能自己发明）', msgTable, '',
    '输出：按上面「输出格式」写，给这一层的 html / css / js 各一段围栏。', '',
    '参考：这一层当前默认模板全文（照它写最稳）', F + 'html', rd(files[0]), F, F + 'css', rd(files[1]), F, F + 'js', rd(files[2]), F];
  return L.join('\n');
}

const charP = build('一', '仿文字游戏的 CHAR 楼层',
['  这一层是【仿文字游戏的 CHAR 楼层】：角色说话那一层。手机框 + 背景层 + 立绘层 + 对话框 + 气泡贴纸 + HUD + 工具条菜单 +',
 '  音量面板 + 模板自带的"改这一楼"编辑器。',
 '  必须有的结构（宿主 / 模板自己都会找这些 id）：',
 '    gv-root + #phone（最外层和手机框，宿主靠 gv-root 判断模板是否完整）',
 '    #bgA #bgB（两层背景，交叉淡入） #dim #flash（压暗 / 闪白） #stage（立绘层）',
 '    #sticker + #stickerImg（气泡贴纸）',
 '    #box 里：#uava（头像）#name（名字）#text（正文，内部要有 #caret 光标）#next（继续箭头）',
 '    #dots（进度点）#auto（自动）#replay（重播）',
 '    .gv-toolbar + #btnEdit + #popup，菜单项用 data-a：edit / copy / up / down /',
 '    toggle-user-avatar / volume / delete（宿主按这个认功能，名字不能改）',
 '    #vol 音量面板：#volBgm #volSe（滑块）#volBgmPc #volSePc（百分比）#volPos #volPosPc（进度）',
 '    #volReplay #volPause #volX',
 '    #editor + #ta + #bSave + #bCancel（模板自带的编辑器）'].join('\n'),
  ['  尺寸与比例（【比例由你自己的 CSS 定，任意比例都要能做】）：',
  '    · 手机框的宽高比写在 CSS 里：默认竖版 aspect-ratio: 9 / 19.5（400px 宽 → 约 867px 高）。',
  '      要做横版就写 16 / 9（常见 640×360、960×540），方形写 1 / 1（常见 600×600）—— 随你。',
  '    · 宽度别写死：用 width: 100%（撑满宿主给的那点宽度，默认 400px）；高度交给 aspect-ratio。',
  '      · 制作器里「版式」选横版时，这一层用的是 640×360 的宽屏模板（同一套 HTML/JS，只是 CSS 覆盖成横屏；',
  '        设计宽度 640）—— 你写的时候只要保证「比例由 CSS 定、能自适应」这两条，横竖都能跑。',
  '      宿主允许的范围：宽约 200~700px、高约 260~1200px。',
  '    · 宿主会把你渲染出来的手机框实测尺寸记成「方案的定位框 宽/高」（预览外框跟着它走），',
  '      所以你 CSS 里写什么比例，成品就是什么比例 —— 别写 min(100%, 960px) 这种硬编码宽度，也别用 vh / vw。',
  '    · 所有层（#bgA #bgB / #stage / #box / #sticker）都必须【在手机框里面】用 position: absolute 定位',
  '      （相对 .gv-phone），不要贴到 body / iframe 上。',
  '    · 对话框那一块（.gv-ui > .gv-box）贴在手机框底部：left:0; right:0; bottom:0，别让它溢出手机框。',
  '    · 参考模板里这几条必须保留（颜色圆角随便改，定位别改）：',
  '      .gv-bgs { position:absolute; inset:0; }   .gv-ui { position:absolute; left:0; right:0; bottom:0; }',
  '      .gv-stage { position:absolute; inset:0; }   .gv-phone { aspect-ratio: 9 / 19.5; }（默认竖版，你想换比例就改这一行）',
 '  状态类：.gv-on（开着）.gv-hide（藏起来）.gv-open（音量面板展开）',
 '  音量面板：.gv-vol 及内部 .gv-vol-row .gv-vol-lb .gv-vol-rng .gv-vol-pc .gv-vol-btn .gv-vol-x',
 '  演出效果类：.gv-shake .gv-flashin .gv-zoom .gv-fade 之类（AI 在台词里写"演出效果"时挂上去的）',
 '  气泡入场动画：.gv-b-xxx 一类（名字要跟 JS 里 showSticker 用的对得上）'].join('\n'),
['  1) 握手：ctx._post("ready")；ctx.on("init", payload => …) 拿数据；之后交互都用 ctx._post。',
 '  2) 逐行渲染：payload.lines[]（每行 {name, face, text, fx, slot, se, isNarr}）→ 打字机 →',
 '     点一下 / 自动播放推进；旁白和角色行样式不同。',
 '  3) 背景 / 立绘：payload.backgrounds 按 【bg:】 事件切换（#bgA/#bgB 交叉淡入）；',
 '     payload.faces + 每张图的 fit（x/y/scale）写进 transform。',
 '  4) 气泡贴纸：payload.bubbles（名字 → 图）→ 在 .gv-phone 里按百分比摆一张。落点是【三档，按优先级取】：',
 '     payload.bubblePosEach[贴纸名]  →  payload.bubblePosSlot[当前行的 slot]  →  payload.bubblePos（默认）',
 '     每档都是 {x, y, scale}（x/y 是气泡【中心点】的百分比）。当前行的站位 = line.slot；旁白、以及没写站位的行，',
 '     slot 是空串 —— 那就别去查 bubblePosSlot，直接用默认那档。入场动画 payload.bubbleAnim[贴纸名]、自定义动画 payload.bubbleCss。',
 '  5) 演出效果：payload.fxAliases / 自定义 effects → 给角色或整屏加类。',
 '  6) 声音：payload.bgmAt / seAt（{at: 行号, name}）→ ctx._post("bgm", 名字) / ("se", 名字)。',
 '     地址可能是 data: 也可能是 http；格式可能是 mp3，也可能是 opus(ogg)（制作器导出时会把大的音频压成 Opus）——',
 '     你只管把宿主给的地址交给 <audio> / new Audio()，不要按扩展名做判断。',
 '     ★ 暂停 / 继续只发 ctx._post("bgmPause")。不要在 document 上挂 click / touchstart 去「补播」音频：',
 '       浏览器自动播放限制宿主已经处理了，自己补播会把用户按下的暂停冲掉（真机上实测过这个坑：暂停后点哪都重新响）。',
 '  7) 音量面板：滑块 / 进度 / 重播 / 暂停都走消息（见下表）。',
 '  8) 菜单：data-a 那些项点了发对应消息；9) 编辑器 #bSave → ctx._post("save", 文本)。',
 ' 10) 高度上报：量【.gv-phone 的 getBoundingClientRect()】发 ctx._post("frameSize", {w,h})（量 body 会算错）；出错 try/catch 后',
 '     ctx._post("error", 消息)，不要静默失败。',
  ' 11) 自适应（重要）：设计宽度自己定一个（默认 400px，和 CSS 里手机框那套尺寸对齐）。容器比它窄时整块等比缩小：',
  '     在 #phone 外面的根节点上写 .gv-root { transform: scale(取小(容器宽 / 设计宽, 1)); transform-origin: 50% 0; }',
  '     （比例最好用 CSS 变量 --gv-scale 传进去）。下面三条必须一起做，少一条就是 bug：',
  '     ① 缩小时把手机框 width 钉成设计宽（400px）+ max-width: none + flex: 0 0 auto —— 不然 flex / 百分比先把它压扁，',
  '        再乘一次 scale 就成「缩两次」，看起来越缩越小；',
  '     ② 缩小时给 html 加 overflow: hidden —— transform 不改布局盒，缩完下面会多出一截空白滚动区；',
  '     ③ 上报尺寸：宽度一律报【容器宽】(document.documentElement.clientWidth)，绝对不能报缩放后的手机宽 ——',
  '        宿主 / 预览会拿它当外框宽，等于把缩放结果又喂回去，会一轮轮越缩越小（300→225→169→127）；',
  '        高度报【缩放后的视觉高度】(rect.height)，并同时发 ctx._post("resize", 高度)（真机的外框高度靠它）。',
 '',
 '可选功能：演出之外的「第二个页面」（默认模板里【没有】这个，用户要求、或者你自己先问一句再加）',
 '  做法：演出页上加一个返回按钮，点了退出演出、进到另一个页面；在那个页面上再点返回，就回到演出。',
 '',
 '  那一页放什么要看卡的类型 —— 别自己硬编内容，先问用户三件事：',
 '    ① 要不要这个返回页  ② 页面上要显示什么  ③ 里面的数字从哪来',
 '  举例：',
 '    · 经营类的卡 → 返回页做成「经营菜单」（金钱 / 库存 / 菜单 / 雇员 / 今日流水…）',
 '    · 冒险类的卡 → 返回页做成「地图界面」（地点列表 / 已探索 / 当前所在…）',
 '    · 别的：状态栏、角色图鉴、背包、小游戏（猜谜 / 翻牌 / 数字游戏）都行',
 '',
 '  数字从哪来：酒馆里的变量系统 MVU（不了解也没关系，按下面两行写就行）',
 '    简单说：MVU 让角色卡能"记事"——剧情进度、金钱、好感度这些存成这一层楼的变量，剧情推进时由 AI 更新。',
 '    读法就两行：var data = Mvu.getMvuData(); 然后 _.get(data, "路径") 取值（路径看变量结构，比如 stat_data.金钱）。',
 '    取到之后：固定字段填格子，列表类遍历着填；MVU 更新完会通知前端，界面跟着重画。',
 '    拿不到 Mvu（对方没装 MVU / 这层楼没有变量）要优雅降级：显示占位文字，别报错白屏。',
 '',
 '  实现提示（都在同一个模板里做，不要跳转页面）',
 '    · 演出页和返回页是「同一个 iframe 里的两个视图」：用一个 class（例如 .gv-view-menu）切换；',
 '      点返回时切视图，不要用 location / window.open（沙箱里会失败）。',
 '    · 返回按钮放工具条或画面角落，id 自己起（不要占用上面那张"必须保留的 id"表）。',
 '    · 返回页的样式照这一层的风格写，不要引入外链字体 / 图片。',
  '',
  '交卷前自检（这几条不过就别交）：',
  '  1) 比例是你在 CSS 里定的（默认竖版 9/19.5；换横版/方形就改 .gv-phone 的 aspect-ratio），宽度是 width:100%，没写死 px；',
  '  2) 对话框贴在手机框最底部、没有超出手机框；背景 / 立绘 / 贴纸全在手机框内；',
  '  3) 没有用 vh / vw / position: fixed；',
  '  4) 有 ctx._post("frameSize", {w,h})（量【.gv-phone 缩放后的 rect】）+ ctx._post("resize", 高度)；',
  '  5) 上面那张“必须保留的 id”表里的 id 一个都没少（尤其 #vol* 那一串和 data-a 那七个）。',
].join('\n'),
['  模板 → 宿主   ready                加载好了，把数据给我',
 '  宿主 → 模板   init(payload)        lines / backgrounds / faces / bubbles / bgmAt / seAt / volume …',
 '  模板 → 宿主   bgm(名字) / se(名字)  放歌 / 放音效；名字为空 = 停',
 '  模板 → 宿主   volume({bgm,se})     两个音量（0~1）',
 '  模板 → 宿主   bgmQuery             问当前进度；宿主回 bgmState({name,t,dur,paused})',
 '  模板 → 宿主   bgmSeekPct(0~1)      拖进度    bgmReplay / bgmPause  重播 / 暂停·继续',
 '  模板 → 宿主   save(文本)           保存这一楼文本',
 '  模板 → 宿主   frameSize({w,h})     上报尺寸   error(消息)  出错上报',
 '  模板 → 宿主   edit / copy / up / down / delete / toggle-user-avatar   菜单按钮'].join('\n'),
['char.html', 'char.css', 'char.js']);

const userP = build('二', '与 CHAR 楼层配套的 USER 楼层',
['  这一层是【与 CHAR 楼层配套的 USER 楼层】：玩家那一层，平时只有一条 userbar（头像 + 名字 + 正文 + 「编辑」按钮），点「编辑」展开操作菜单和',
 '  一个文本框。没有背景 / 立绘 / 音频。',
 '  必须有的结构（宿主 / 模板自己都会找这些 id）：',
 '    .gv-userbar-wrap #wrap（最外层）  .gv-userbar  .gv-ubar-main',
 '    .gv-uava #uava（头像）  .gv-utext 里 <b id="uname">（名字）+ <span id="utext">（正文）',
 '    #editBtn（展开 / 收起那一行）',
 '    .gv-ubar-extra #extra（展开区）里 .gv-ubar-actions #acts，菜单项用 data-a：',
 '    edit / copy / up / down / toggle-user-avatar / delete / close',
 '    .gv-ubar-editor #ed 里：#ta（文本框）+ #bSave（确认修改）+ #bCancel（退出修改）'].join('\n'),
['  结构类：.gv-userbar-wrap .gv-userbar .gv-ubar-main .gv-uava .gv-utext .gv-ubar-btn .gv-ubar-extra',
 '          .gv-ubar-actions .gv-ubar-editor .gv-tb .gv-primary .gv-danger .gv-toggle',
 '  状态类：.gv-on / .gv-hide（宿主会加）',
 '  这一层的类名少，配色排版随便换，但上面这些名字不能改'].join('\n'),
['  1) 握手：ctx._post("ready")；ctx.on("init", …)（payload 里是 {name, text, avatar}）。',
 '  2) 把名字 / 正文 / 头像填进对应元素（没有头像就不显示 #uava）。',
 '  3) 「编辑」按钮：展开 / 收起 #extra；菜单项 [data-a] 保留给宿主处理（复制 / 上移 / 下移 /',
 '     删除 / 关闭 / 显示头像），模板不用自己实现。',
 '  4) #bSave → ctx._post("save", 文本框里的内容)；#bCancel 收起编辑器。',
 '  5) 高度上报 ctx._post("frameSize", {w,h})。'].join('\n'),
['  模板 → 宿主   ready        加载好了   宿主 → 模板   init({name, text, avatar})',
 '  模板 → 宿主   save(文本)   保存这一楼正文',
 '  模板 → 宿主   frameSize({w,h})  上报尺寸',
 '  模板 → 宿主   edit / copy / up / down / delete / close / toggle-user-avatar   菜单按钮'].join('\n'),
['user.html', 'user.css', 'user.js']);

const panelP = build('三', '与 CHAR 楼层配套的悬浮窗',
['  这一层是【与 CHAR 楼层配套的悬浮窗】（制作器那个浮窗，显示楼层的附加内容）：上面一条标题栏（计数 + 一排按钮），下面是内容列表；',
 '  它自己还带三个内嵌页面（提示词 / 兜底转换 API / 导入素材包），并且能拖动、改大小、收成小球。',
 '  必须有的结构：',
 '    .gv-panel #panel（最外层）  .gv-panel-head #head（标题栏）',
 '    标题栏按钮：.gv-panel-title  .gv-panel-count #count  .gv-panel-spacer',
 '    #btnRaw（渲染 / 源码） #btnPrompt（词） #btnPack（包） #btnConv（转） #btnRedraw（重绘）',
 '    #btnFold（收小球） #btnMini（关闭）',
 '    .gv-panel-body #body（内容列表）',
 '    内嵌页面 .gv-sheet #sheet 里：.gv-sheet-head #sheetTitle + #sheetX  .gv-sheet-body #sheetBody',
 '    .gv-sheet-foot #sheetFoot'].join('\n'),
['  结构类：.gv-panel .gv-panel-head .gv-panel-title .gv-panel-count .gv-panel-spacer .gv-panel-btn',
 '          .gv-panel-body .gv-sheet .gv-sheet-head .gv-sheet-x .gv-sheet-body .gv-sheet-foot',
 '  列表项：.gv-panel-item .gv-panel-item-head .gv-pitem-name .gv-pitem-len .gv-pitem-tag',
 '          .gv-panel-actions .gv-act .gv-panel-item-body .gv-panel-inline-edit .gv-panel-inline-ta',
 '  状态类：.gv-on / .gv-mini（收成小球）/ .gv-editing / .gv-collapsed',
 '  注意：这一层里不能用 position: fixed，定位由宿主给的外框决定'].join('\n'),
['  1) 握手：ctx._post("ready")；ctx.on("init", c) 拿 {floors, prompt, convertCfg, panelBox, panelOffset}；',
 '     之后 ctx.on("floors") 更新列表、ctx.on("toast") 弹提示。',
 '  2) 列表渲染：floors 里每项是 {id, name, raw, html, story}：raw = 原文（「源码」模式显示它）；',
 '     ★ html = 【已经渲染好的 HTML 串】—— 里面的围栏代码块已经被宿主换成了「活 iframe」（卡片里的脚本也已经在跑）。',
 '       你直接 item.innerHTML = html 就行，【不要】自己去切三反引号围栏，也别再套一层白名单过滤。',
 '     每项显示 #id + 名字 + 字数 + 「有剧情」标记，点标题折叠 / 展开；每项一组操作：',
 '     编辑（整块换成文本框，确认后 ctx._post("saveFloor", {id, text})）/ 复制 / 上移 / 下移 / 删除。',
 '  2b) 那些「活 iframe」的高度：它自己会用 parent.postMessage({__gvFit: 1, h}) 把内容高度报上来；',
 '     你监听 message，按 event.source 找到对应的 iframe.gv-rich-iframe，把高度设成 h + 10（h < 24 就当成空的收起来）。',
 '     不接这个上报，卡片会被压成一条缝、或者撑出一大截空白。',
'     ★ 这些 iframe 是【黑盒】：里面的卡片脚本点一下就能把选项填进酒馆的输入框（引擎在沙箱里给它们装了假 parent，动作 postMessage 到最外层页面）。',
'       所以别去清洗 / 重写 / 再包一层它的内容，也别给 iframe 加 sandbox、pointer-events: none、或自己截它的点击 —— 一拦，卡片里的按钮就又「点不开」了。',
'     ★ 引擎是按「上级里有没有 #send_textarea」决定要不要给这层 iframe 接管 parent 的 —— 所以面板模板里**别放 id="send_textarea" 的元素**：',
'       放了引擎会以为上级就是酒馆页面、不接管，卡片点选项就又变成"一点反应都没有"（v1.0.9 修的就是这个坑）。',
 '  3) 三个内嵌页面：提示词（保存 → ctx._post("setPrompt", 文本)）、兜底转换 API',
 '     （保存 → ctx._post("convertCfg", {...})）、导入素材包（选文件 → ctx._post("packFile", {name,size})）。',
 '  4) #btnRaw 切换"渲染 / 源码"显示；#btnRedraw → ctx._post("redraw")；',
 '     #btnMini → ctx._post("closePanel") 并把自己隐藏；#btnFold 收成小球 / 展开。',
 '  5) 拖动 → ctx._post("move", {dx,dy})；右下角拖动改大小；尺寸变化后上报',
 '     ctx._post("resize", 高度) + ctx._post("wantSize", {w,h})（宿主靠它撑外框）。',
 '  6) 出错 try/catch 后 ctx._post("error", 消息)。'].join('\n'),
['  模板 → 宿主   ready         宿主 → 模板   init({floors, prompt, convertCfg, panelBox, panelOffset})',
 '  宿主 → 模板   floors(列表) / toast(提示)',
 '  模板 → 宿主   saveFloor({id,text})   保存某一项',
 '  模板 → 宿主   setPrompt(文本) / convertCfg(配置) / packFile({name,size})',
 '  模板 → 宿主   redraw / closePanel   重绘 / 关闭浮窗',
 '  模板 → 宿主   move({dx,dy}) / resize(高度) / wantSize({w,h})',
 '  模板 → 宿主   error(消息)   出错上报'].join('\n'),
['panel.html', 'panel.css', 'panel.js']);

/* ★ 第 9 条 + 有/无音频: char 一共 4 套默认预设 —— 竖/横 × 有/无音频, 各出一份提示词 (选哪套, 这边就给哪套) */
const T0 = { html: rd('char.html'), css: rd('char.css'), js: rd('char.js') };
const landCss = rd('char-land.css');
const T_LA = { html: T0.html, css: T0.css + '\n' + landCss, js: T0.js.replace('var DESIGN_W = 400', 'var DESIGN_W = 640') };
const stripTxt = (t) => {
  const rep = (s) => String(s || '')
    .replace(/<!--gv-audio-->[\s\S]*?<!--\/gv-audio-->/g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-audio\*\/[\s\S]*$/g, '')
    .replace(/\/\* ---- 声音: 自己播[\s\S]*?\/\*\/gv-audio\*\//g, '')
    .replace(/\/\*gv-pause\*\/[\s\S]*?(?:\/\*\/gv-pause\*\/|$)/g, '')
    .replace(/\/\* 音量面板[\s\S]*?(?=\.gv-editor \{|$)/g, '');
  return { html: rep(t.html), css: rep(t.css), js: rep(t.js) };
};
const T_PN = stripTxt(T0), T_LN = stripTxt(T_LA);
const withVariant = (base, label, note, tpl) => {
  const marker = '参考：这一层当前默认模板全文（照它写最稳）';
  const i = base.indexOf(marker);
  const headTxt = base.slice(0, i).replace('（提示词）', '（提示词 · ' + label + '）');
  const tail = [marker, F + 'html', tpl.html, F, F + 'css', tpl.css, F, F + 'js', tpl.js, F].join('\n');
  return '★ 这一份是【' + label + '】的默认预设：' + note + '\n\n' + headTxt + tail;
};
const charPN = withVariant(charP, '竖版 · 无音频',
  '竖版 400×867，并且【不要】音量面板 / 进度条 / 播放·暂停按钮 / 【bgm:】【se:】那一整套，画面里也别出现音频按钮。', T_PN);
const charLA = withVariant(charP, '横版 · 有音频',
  '横版 640×360（aspect-ratio: 16 / 9）宽屏版式，并且【保留】音量面板 / BGM / 音效那一整套。下面示例里出现的 9 / 19.5、400px 是竖版数字，你按横版来。', T_LA);
const charLN = withVariant(charP, '横版 · 无音频',
  '横版 640×360（16 / 9）宽屏，而且【不要】音频那一整套（同「竖版 · 无音频」）。', T_LN);

const body = [head, charP, charPN, charLA, charLN, userP, panelP].join('\n\n' + SEP + '\n\n') + '\n';
fs.writeFileSync(OUT, body);
/* ★ 给插件用的那三份（不含文档开头，只有各自那一段） */
const JSONOUT = 'D:/toomanybug/galgame/tpl-build/page-prompts.json';
fs.writeFileSync(JSONOUT, JSON.stringify({ char: charP, charNoAudio: charPN, charLand: charLA, charLandNoAudio: charLN, user: userP, panel: panelP }, null, 0));
console.log('写出(给插件):', JSONOUT, '| char', charP.length, '| charNoAudio', charPN.length, '| charLand', charLA.length, '| charLandNoAudio', charLN.length, '| user', userP.length, '| panel', panelP.length);
console.log('写出:', OUT, '|', body.length, '字 /', body.split('\n').length, '行');
console.log('章节位置:');
body.split('\n').forEach((l, i) => { if (/^[一二三]、/.test(l)) console.log('  ', i + 1, l); });
console.log('围栏行:', body.split('\n').map((l, i) => [i + 1, l]).filter(x => /^```/.test(x[1])).map(x => x[0]).join(' '));
