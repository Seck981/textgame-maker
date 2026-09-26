/* ============================================================
   酒馆助手 · 角色脚本: Galgame 楼层渲染（整层替换）
   - 原生楼层(头像/角色名/外框/正文)整个剥掉, 楼层只剩游戏画面
   - 自建工具条: 平时只有一个「编辑」, 点开才展开 复制/删除/上移/下移/头像开关 (防误触)
   - 悬浮窗自己造轮子渲染: 只借用预设的正则规则, 不调用酒馆的渲染管线
   - 鲁棒性: AI 不按格式走时, 用 generateRaw + json_schema 做二次转换 (API 层强制)
   ============================================================ */

const CONFIG = {
  depth: 60,
  userFloor: 'minimal',
  fullReplace: true,
  rawToggle: false,                  // ★ 不要那个 ⋯（点了会整页切回酒馆原生楼层）—— 演出有三层兜底, 不需要这个逃生口
  sweepMs: 2500,
  thinkTags: ['thinking', 'think', 'analysis', 'reasoning'],
  hideTags: ['finish'],
  /* 兜底转换: key/接口地址等在悬浮窗"转"里填, 存在 localStorage (gv_convert_api_v1) */
  convert: { enabled: true, maxChars: 5000, model: '', debugApi: false },
  /* 格式提示词注入到倒数第几条消息 (0 = 紧贴最后一条) */
  promptDepth: 1,
  /* 立绘站位关键词: 由制作器写入导出脚本; 空 = 单角色不需要站位字段 */
  slots: ['left', 'middle', 'right'],
  /* ★ 占位排版: 每个站位的画框 { left:{x,y,w,h}, ... } (百分比), 由制作器导出时写入 */
  slotBoxes: {},
  /* 每个站位的落点 { left:{x,y,scale} }, 由制作器拖动决定 */
  slotPos: {},
  /* 情绪气泡: 默认落点/大小, 每个贴纸单独调过的落点, 每个贴纸的入场动画, 显示时长 */
  bubblePos: { x: 78, y: 24, scale: 1 },
  bubblePosEach: {},
  bubblePosSlot: {},          /* 每个站位各一套气泡落点 (制作器「气泡位置 → 调整哪个站位」) */
  bubbleAnim: {},
  /* 改过的内置气泡演出 / 自己写的气泡演出 (CSS), 由制作器导出时写入 */
  bubbleCss: '',
  bubbleMs: 1900,
  /* BGM: 情绪 -> 外链 */
  audioMap: {},
  /* 音效: 名字 -> 外链 (制作器导出时写入; 本地文件类的跟着素材包 manifest.se 走) */
  seMap: {},
  /* 自定义演出组 { 名字: {css, cls, target, duration, js} } */
  effects: {},
  /* P4 页面排版: 三层模板 { char:{html,css,js}, user:{...}, panel:{...} }, 空 = 用引擎自带长相 */
  pages: { char: null, user: null, panel: null },
  /* ★ 定位框宽高比 {w,h} (制作器「页面排版 → 定位框」里那两格), 导出时写入; 模板拿它定手机比例 */
  frameSize: null,
  assetVersion: '112',
};


/* ============================================================
   提示词: 不再写在角色卡里, 由脚本根据素材清单生成并通过 injectPrompts 发给 AI
   - 可在悬浮窗「词」里查看/编辑; 编辑过就以编辑的为准 (存 localStorage)
   ============================================================ */
const PROMPT_KEY = 'gv_format_prompt_v1';
const PROMPT_ID = 'galgame-format';
/* 素材清单: 以后由 Game 插件写入; 现在先给默认值 */
const ASSETS = {
  bg: ['海', '夜', '天空', '酒馆', '房间'],
  face: ['平静', '微笑', '害羞', '惊讶', '生气', '悲伤'],
  fx: ['shake', 'jump', 'zoom', 'dim', 'flash'],
  bubble: [],
  audio: [],       // BGM: 情绪名
  se: [],          // 音效名
};
function loadPromptOverride() { try { return localStorage.getItem(PROMPT_KEY) || ''; } catch (e) { return ''; } }
function savePromptOverride(t) {
  try { if (t && t.trim()) localStorage.setItem(PROMPT_KEY, t); else localStorage.removeItem(PROMPT_KEY); return true; }
  catch (e) { return false; }
}
function buildPrompt() {
  const ov = loadPromptOverride();
  if (ov && ov.trim()) return ov;
  const a = ASSETS;
  const slots = (CONFIG.slots || []).length > 1 ? CONFIG.slots : [];
  const fxList = a.fx || [];
  const exFx = fxList.indexOf('zoom') >= 0 ? 'zoom' : (fxList[0] || '');
  const exBg = (a.bg || [])[0] || '房间';
  const L = [];
  L.push('【正文脚本格式】');
  L.push('其他部分继续遵守当前预设要求的整体结构，但其中的正文部分，必须改写为以下的程式化脚本。');
  L.push('');
  if (a.audio && a.audio.length) {
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
  L.push('- 表情只能从这些里选：' + (a.face || []).join('、'));
  L.push('- 台词直接写，不用加引号，不要写成“他说：……”');
  L.push('- 内心独白/心理描写走旁白，写成： 旁白||文字| ；不要写不带竖线的裸句子');
  L.push('- 没有立绘的角色（路人 / 只露一次脸的店小二之类）：名字照写、表情那一格【留空】，例： 店小二||客官里边请。| —— 引擎不会给他配立绘，和旁白一个待遇（只有上面立绘表里的角色才写表情名）');
  L.push('- 根据剧情自由调用素材：场景换了才换背景，角色情绪变了才换表情，不要每行都换');
  L.push('- 只能从上面列出的名字里选，不要自己新造素材名');
  L.push('- 每次 4~8 行');
  L.push('- {{user}} 说话时，角色名写 {{user}}');
  if (slots.length) L.push('- 站位字段只能写：' + slots.join('、') + '（角色站在画面的哪个位置）');
  if (slots.length) L.push('- 站位跟着角色走：同一个角色在同一段剧情里尽量一直用同一个站位');
  if (a.bubble && a.bubble.length) L.push('- 情绪气泡：把演出效果写成 bubble:名字，可选的名字有：' + a.bubble.join('、'));
  if (a.audio && a.audio.length) L.push('- BGM 的情绪只能从上面列的里选，不要自己编造');
  if (hasSe) L.push('- 音效：需要时把音效名写在最后，可选的名字有：' + a.se.join('、'));
  if (fxList.length) L.push('- 可用演出效果：' + fxList.join('、'));
  L.push('');
  L.push('示例（正文里的内容）：');
  if (a.audio && a.audio.length) L.push('【bgm:' + a.audio[0] + '】');
  L.push('【bg:' + exBg + '】');
  L.push('角色|平静|来了。|');
  L.push('旁白||暖气片发出很轻的响。|');
  L.push('店小二||客官里边请。|');            // ★ 路人示例: 表情留空, 不配立绘
  L.push('角色|微笑|靠窗那个位置，我给你留着。|' + exFx + (slots.length ? '|' + slots[0] : '') + (hasSe ? '|' + a.se[0] : ''));
  return L.join('\n');
}
function injectFormat() {
  try {
    if (typeof uninjectPrompts === 'function') uninjectPrompts([PROMPT_ID]);
    if (typeof injectPrompts !== 'function') return false;
    injectPrompts([{ id: PROMPT_ID, position: 'in_chat', depth: CONFIG.promptDepth, role: 'system', content: buildPrompt(), should_scan: false }]);
    return true;
  } catch (e) { console.warn('[gv] 提示词注入失败', e); return false; }
}

const P = window.parent;
const doc = P.document;
const mounted = new Map();
const handled = new Set();
const converting = new Set();
let enabled = true;
let GV_CSS = '';
let showUserAvatar = false;
try { showUserAvatar = localStorage.getItem('gv_show_user_avatar') === '1'; } catch (e) {}

/* ---------- 用户名字 / 头像 ---------- */
const userName = () => { try { return String(P.SillyTavern.getContext().name1 || '你'); } catch (e) { return '你'; } };

let __uaCache = { url: '', t: 0 };
/* ★ 模板跑在 sandbox iframe(srcdoc) 里: 根相对地址会解析成 about:srcdoc/... , 头像/图永远裂开 -> 统一转成绝对地址 */
function absUrl(u) {
  const s = String(u || '');
  if (!s) return '';
  try { if (/^(https?:|data:|blob:)/i.test(s)) return s; return new URL(s, P.location && P.location.href || location.href).href; } catch (e) { return s; }
}
/* force=true: 跳过 15 秒缓存, 用来比对"人设是否换了" */
function userAvatarUrl(force) {
  const now = Date.now();
  if (!force && __uaCache.url && now - __uaCache.t < 15000) return __uaCache.url;
  let file = '';
  try {
    const ctx = P.SillyTavern.getContext();
    const me = String(ctx.name1 || '');
    const pu = ctx.powerUserSettings || {};
    const personas = pu.personas || ctx.personas || {};
    const keys = Object.keys(personas || {});
    /* ★ 先问酒馆"当前人设是哪个文件": 人设池里重名很常见(实测有两个都叫 Save),
       只按名字反查会永远翻到第一个 -> 换了人设头像也不变 */
    const chId = Number(ctx.characterId);
    const ch0 = (ctx.characters || [])[chId] || null;
    const cands = [ch0 && ch0.persona, pu.default_persona, ctx.user_avatar];
    for (const v of cands) { if (v && v !== 'none' && personas[v] !== undefined) { file = String(v); break; } }
    // personas 的 key 就是头像文件名, value 里有 name
    for (const k of keys) {
      const p = personas[k] || {};
      if (String(p.name || '') === me) { file = String(p.avatar || k); break; }
    }
    if (!file) for (const k of keys) { if (String(k) === me) { file = k; break; } }
    if (!file) { const ua = ctx.user_avatar; if (ua && ua !== 'none') file = ua; }
    /* ★ 兜底一: 聊天里那条 user 消息自带的头像 —— 只有它对应的人设名 == 当前人设名 才采信。
       以前无条件采信 -> 你早期用「迎九」人设发过的楼层, 之后换任何人设都一直显示迎九的头像 (实测就是这个)。 */
    const _nameOf = f => String((personas[f] && personas[f].name) || personas[f] || '');
    if (!file || _nameOf(file) !== me) {
      const el = doc.querySelector('#chat .mes[is_user="true"] .avatar img');
      const src = el && (el.getAttribute('src') || el.src);
      const mm = /[?&]file=([^&]+)/.exec(String(src || ''));
      const f2 = mm ? decodeURIComponent(mm[1]) : '';
      if (f2 && personas[f2] !== undefined && _nameOf(f2) === me) file = f2;
    }
    /* ★ 兜底二: 人设管理面板里"当前选中"那张, 同样要求名字对得上 */
    if (!file) {
      const sel = doc.querySelector('#user_avatar_block .avatar.selected img, #persona_pool .avatar.selected img');
      const src = sel && (sel.getAttribute('src') || sel.src);
      const mm2 = /[?&]file=([^&]+)/.exec(String(src || ''));
      const f3 = mm2 ? decodeURIComponent(mm2[1]) : '';
      if (f3 && personas[f3] !== undefined && _nameOf(f3) === me) file = f3;
    }
  } catch (e) {}
  const url = file ? '/thumbnail?type=persona&file=' + encodeURIComponent(file) : '';
  __uaCache = { url: absUrl(url), t: now };
  return absUrl(url);
}

/* ---------- 自己实现的正则应用 ---------- */
function regexFromString(input) {
  try {
    const m = String(input).match(/(\/?)(.+)\1([a-z]*)/i);
    if (!m) return null;
    if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) return new RegExp(input);
    return new RegExp(m[2], m[3]);
  } catch (e) { return null; }
}
function filterTrim(s, trims) { let t = String(s == null ? '' : s); for (const x of trims) { if (!x) continue; t = t.split(x).join(''); } return t; }
function runOneRegex(r, raw) {
  const re = regexFromString(r.find_regex);
  if (!re) return raw;
  const trims = r.trim_strings || [];
  return raw.replace(re, function () {
    const args = [...arguments];
    const whole = args[0], groups = args[args.length - 1];
    const rep = String(r.replace_string == null ? '' : r.replace_string).replace(/{{match}}/gi, '$0');
    return rep.replaceAll(/\$(\d+)|\$<([^>]+)>/g, (_, num, gname) => {
      let m2 = whole;
      if (num !== undefined) m2 = args[Number(num)];
      else if (gname) m2 = groups && typeof groups === 'object' ? groups[gname] : undefined;
      if (!m2) return '';
      return filterTrim(m2, trims);
    });
  });
}
function collectRegexes() {
  const list = [];
  const push = a => { if (Array.isArray(a)) list.push(...a); };
  try { push(getTavernRegexes({ type: 'global' })); } catch (e) {}
  try { push(getTavernRegexes({ type: 'character' })); } catch (e) {}
  try { push(getTavernRegexes({ type: 'preset', name: 'in_use' })); } catch (e) {}
  return list;
}
function applyDisplayRegexes(raw, depth) {
  let out = String(raw == null ? '' : raw);
  for (const r of collectRegexes()) {
    if (!r || !r.enabled) continue;
    if (!r.source || !r.source.ai_output) continue;
    if (!r.destination || !r.destination.display) continue;
    if (r.min_depth !== null && r.min_depth !== undefined && depth < r.min_depth) continue;
    if (r.max_depth !== null && r.max_depth !== undefined && depth > r.max_depth) continue;
    try { out = runOneRegex(r, out); } catch (e) {}
  }
  try { if (typeof substituteParams === 'function') out = substituteParams(out); } catch (e) {}
  return out;
}
/* 面板里的文本一律走酒馆自己的显示管线 (全局/角色/预设正则全都按酒馆的规矩来),
   拿不到 TavernHelper 时才回落到自己那份等价实现 —— 不做任何针对某个预设的特判 */
function regexedText(raw, depth) {
  try {
    if (typeof formatAsTavernRegexedString === 'function') {
      const r = formatAsTavernRegexedString(raw, 'ai_output', 'display', { depth });
      if (typeof r === 'string') return r;
    }
  } catch (e) {}
  return applyDisplayRegexes(raw, depth);
}
function postProcess(html) {
  let t = String(html);
  for (const tag of CONFIG.hideTags) {
    t = t.replace(new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*?<\\/' + tag + '>', 'gi'), '');
    t = t.replace(new RegExp('<' + tag + '\\b[^>]*\\/?>', 'gi'), '');
  }
  for (const tag of CONFIG.thinkTags) {
    t = t.replace(new RegExp('<' + tag + '\\b[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'gi'),
      (m, inner) => '<details class="gv-think"><summary>思维链</summary><div class="gv-think-body">' + inner + '</div></details>');
  }
  t = t.replace(/<!--\s*Start the ECoT\s*-->([\s\S]*?)(?=<!--\s*End the ECoT\s*-->|$)/gi,
    (m, inner) => '<details class="gv-think"><summary>ECoT</summary><div class="gv-think-body">' + inner + '</div></details>');
  t = t.replace(/<!--\s*End of The ECoT\s*-->/gi, '').replace(/<!--\s*End the ECoT\s*-->/gi, '');
  return t;
}

/* ---------- API 层: generateRaw + json_schema 二次转换 ---------- */
function looksLikeProse(text) {
  const t = String(text || '');
  if (t.length < 40) return false;
  if (/【\s*(bg|背景)/i.test(t)) return false;
  // 英文为主 -> 是思维链/推演, 不是正文
  const cjk = (t.match(/[\u3400-\u9fff\u3040-\u30ff]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  if (cjk < 30 || latin > cjk * 0.6) return false;
  if (/^\s*[|｜].*[|｜]/m.test(t)) return false;
  const pipes = t.split(/\r?\n/).filter(l => (l.match(/\|/g) || []).length >= 2).length;
  return pipes < 2;
}
/* 送给转换 API 的正文:
   ① 跨预设定位正文范围 (有 <content> 用 <content>, 没有就砍思维链 + 停在附加块前)
   ② 剥掉 AI 自我迭代的 <!-- draft --> 注释 (引擎里的 stripComments)
   ③ ★ 再走一遍酒馆的显示正则 (和悬浮窗/原生楼层同一套管线), 把八股/标记洗掉
   ④ 正则可能产出 HTML/围栏, 再剥一次
   —— 送过去的是"被正则清洗过一遍的正文", 不是原始文本 */
function extractProse(text, depth) {
  const raw = String(text == null ? '' : text);
  let body = raw;
  try { body = P.Galgame.bodyOf(raw); } catch (e) {}
  try { body = regexedText(body, depth || 0); } catch (e) {}
  return String(body)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
/* 兜底转换用的规则: 清单跟着【实际素材】走, 不再写死 (以前写死的表里还留着已删掉的 in / bright) */
function convertSys() {
  const a = ASSETS;
  const slots = (CONFIG.slots || []).length > 1 ? CONFIG.slots : [];
  const L = ['你是格式转换器。把用户给的小说正文改写成指定的脚本格式，只输出 JSON。', '规则：',
    '- bg：场景背景，只能从 ' + (a.bg || []).join(' / ') + ' 里挑一个',
    '- face：表情，只能从 ' + (a.face || []).join(' / ') + ' 里挑一个',
    '- fx：演出效果，只能从 ' + (a.fx || []).join(' / ') + ' 里挑一个，或留空字符串'];
  if ((a.bubble || []).length) L.push('- 情绪气泡：fx 写成 bubble:名字，名字只能从这里挑：' + a.bubble.join(' / '));
  if (slots.length) L.push('- slot：站位，只能从 ' + slots.join(' / ') + ' 里挑一个');
  L.push('- name：角色名；旁白的 name 写 "旁白"；{{user}} 说话时写 {{user}}');
  L.push('- 台词保持原文，不要加引号', '- 按原文顺序切分成 4~12 行');
  return L.join('\n');
}

async function convertToScript(text) {
  const slots = (CONFIG.slots || []).length > 1 ? CONFIG.slots : [];
  const lineProps = { name: { type: 'string' }, face: { type: 'string' }, text: { type: 'string' }, fx: { type: 'string' } };
  const lineReq = ['name', 'face', 'text', 'fx'];
  if (slots.length) { lineProps.slot = { type: 'string' }; lineReq.push('slot'); }   // 多人方案: 站位也要转出来
  const schema = { name: 'galgame_floor', strict: true, value: {
    type: 'object',
    properties: {
      bg: { type: 'string' },
      lines: { type: 'array', items: { type: 'object',
        properties: lineProps, required: lineReq, additionalProperties: false } },
    },
    required: ['bg', 'lines'], additionalProperties: false } };
  const cfg = {
    user_input: String(text).slice(0, CONFIG.convert.maxChars),
    ordered_prompts: [{ role: 'system', content: convertSys() }, 'user_input'],
    json_schema: schema, should_silence: true,
  };
  // 子 API: 在悬浮窗"转"里填了密钥就用那个, 没填就返回 null -> 用酒馆当前主 API
  let subApi = null;
  try { subApi = P.Galgame.convertApiOf ? P.Galgame.convertApiOf() : null; } catch (e) {}
  if (subApi) cfg.custom_api = subApi;
  else if (CONFIG.convert.model) cfg.custom_api = { model: CONFIG.convert.model };
  if (CONFIG.convert.debugApi) console.log('[gv] 转换使用:', subApi ? subApi : '主 API', cfg.custom_api || '');
  const raw = await generateRaw(cfg);
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const lines = (obj && obj.lines) || [];
  if (!lines.length) throw new Error('转换结果为空');
  return '【bg:' + (obj.bg || '房间') + '】\n' + lines.map(l =>
    String(l.name || '旁白') + '|' + String(l.face || '平静') + '|' + String(l.text || '').replace(/\|/g, '丨') + '|' + String(l.fx || '')
    + (slots.length ? '|' + String(l.slot || slots[0]) : '')     // 多人方案: 补上站位
  ).join('\n');
}


/* ============================================================
   素材包导入: 读 zip -> 存进 IndexedDB -> 重建素材映射 -> 喂给引擎
   zip 自带解包器, 支持 store 和 deflate 两种, 不依赖任何库
   ============================================================ */
const PACK_KEY = 'gv_pack_manifest';
const PACK_PREFIX = 'gvpack:';
function u8ToStr(u8) { return new TextDecoder('utf-8').decode(u8); }

async function unzip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  /* 从尾部找 EOCD (0x06054b50) */
  let eocd = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('不是有效的 zip');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = {};
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const cmtLen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = u8ToStr(u8.subarray(p + 46, p + 46 + nameLen));
    /* 本地头: 拿到真实数据起点 */
    const lNameLen = dv.getUint16(lho + 26, true);
    const lExtraLen = dv.getUint16(lho + 28, true);
    const ds = lho + 30 + lNameLen + lExtraLen;
    const raw = u8.subarray(ds, ds + csize);
    if (name.endsWith('/')) { p += 46 + nameLen + extraLen + cmtLen; continue; }
    if (method === 0) out[name] = raw.slice();
    else if (method === 8) {
      const ds2 = new DecompressionStream('deflate-raw');
      const buf = await new Response(new Blob([raw]).stream().pipeThrough(ds2)).arrayBuffer();
      out[name] = new Uint8Array(buf);
    }
    p += 46 + nameLen + extraLen + cmtLen;
  }
  return out;
}

/* 把素材包内容变成引擎要的映射 */
async function applyPack(manifest, files) {
  const urlOf = async (path) => {
    const d = files[path];
    if (!d) return null;
    const key = PACK_PREFIX + path;
    await gvIdbPut(key, new Blob([d]));
    return URL.createObjectURL(new Blob([d]));
  };
  const bg = {};
  for (const b of (manifest.bg || [])) {
    const u = await urlOf(b.file); if (!u) continue;
    const e = { url: u, fit: b.fit || null };
    bg[b.name] = e;
    for (const piece of String(b.name).split(/[\/、,，\s]+/)) if (piece) bg[piece] = e;
  }
  const face = {};
  for (const g of (manifest.sprites || [])) {
    for (const f of g.faces) {
      const u = await urlOf(f.file); if (!u) continue;
      const e = { url: u, fit: f.fit || null };   // ★ 立绘的取景(位置/缩放)一起带上, 别丢
      face[g.name + '|' + f.key] = e;
      if (!face[f.key]) face[f.key] = e;      // 没有角色名时的兜底
    }
  }
  const bubble = {};
  for (const s of (manifest.stickers || [])) { const u = await urlOf(s.file); if (u) bubble[s.key] = u; }
  /* 音频 / 音效: 本地文件走素材包, 外链直接用链接 */
  const audio = {};
  for (const a of (manifest.audio || [])) {
    const u = a.file ? await urlOf(a.file) : a.url;
    if (u) audio[a.mood || a.name] = u;
  }
  const se = {};
  for (const s of (manifest.se || [])) {
    const u = s.file ? await urlOf(s.file) : s.url;
    if (u) se[s.name] = u;
  }
  /* ★ 合并而不是覆盖: 脚本里已经写死的链接类素材不能被素材包清掉 (同名的以素材包为准) */
  /* ★ 合并而不是覆盖 (两边都并): 脚本里烘好的便携版素材 + 素材包里的高清素材, 同名以【素材包】为准 ——
     这样"导了包 = 换高清", 包里没有的那些仍然用脚本自带的 */
  const C0 = (P.Galgame.CONFIG || {});
  P.Galgame.setAssets({ bg: Object.assign({}, C0.bgMap, bg), face: Object.assign({}, C0.faceMap, face), bubble: Object.assign({}, C0.bubbleMap, bubble),
    audio: Object.assign({}, C0.audioMap, CONFIG.audioMap, audio), se: Object.assign({}, C0.seMap, CONFIG.seMap, se) });
  if (manifest.slots) P.Galgame.setSlots(manifest.slots);
  if (manifest.slotPos) P.Galgame.setSlotPos(manifest.slotPos);
  const sb = manifest.slotBoxes || manifest.slotBox;   /* 老素材包兼容: 旧键名 slotBox */
  if (sb) P.Galgame.setSlotBoxes(sb);
  if (manifest.effects) P.Galgame.setEffects(manifest.effects);
  if (manifest.bubbles) P.Galgame.setBubbles(manifest.bubbles);
  return { bg: Object.keys(bg).length, face: Object.keys(face).length, bubble: Object.keys(bubble).length };
}

/* 简单 KV (复用插件那套 IndexedDB, 名字一样就共用) */
function gvIdb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('textgame_maker', 2);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function gvIdbPut(k, v) { const d = await gvIdb(); return new Promise((res, rej) => { const q = d.transaction('blobs', 'readwrite').objectStore('blobs').put(v, k); q.onsuccess = () => res(); q.onerror = () => rej(q.error); }); }
async function gvIdbGet(k, store) { const d = await gvIdb(); return new Promise((res, rej) => { const q = d.transaction(store || 'kv', 'readonly').objectStore(store || 'kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }

/* 素材包字节 -> 导入 -> 记下清单 (选文件的和从悬浮窗模板发过来的都走这一个) */
async function applyPackBytes(u8) {
  const files = await unzip(u8);
  const mf = files['manifest.json'];
  if (!mf) throw new Error('包里没有 manifest.json');
  const manifest = JSON.parse(u8ToStr(mf));
  const stat = await applyPack(manifest, files);
  /* 素材本体已经进 blobs 了, 下次开页面直接用, 不用再导一次 */
  const keep = { manifest: manifest, files: Object.keys(files) };
  await gvIdbPut(PACK_KEY, keep);
  return stat;
}
/* ★ 清掉本机存的"导入过的素材包"(manifest + 每个素材的 blob), 别的键不碰 */
async function clearPackCache() {
  let n = 0;
  try {
    const d = await gvIdb();
    await new Promise((res, rej) => {
      const tx = d.transaction('blobs', 'readwrite'); const st = tx.objectStore('blobs');
      st.delete(PACK_KEY); n++;
      const c = st.openCursor();
      c.onsuccess = () => { const cur = c.result; if (!cur) return; if (String(cur.key).indexOf(PACK_PREFIX) === 0) { cur.delete(); n++; } cur.continue(); };
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error || new Error('删除失败'));
    });
  } catch (e) { if (typeof toastr !== 'undefined') toastr.error('清除失败: ' + e.message); return; }
  __uaCache = { url: '', t: 0 };
  if (typeof toastr !== 'undefined') toastr.success('已清除本机素材包缓存（' + n + ' 项），正在按脚本自带素材重画');
  try { nukeAll(); later(scan, 300, 'scan'); later(scan, 1500, 'scan2'); } catch (e) {}
}
/* 打开文件选择框 -> 读 zip -> 导入 -> 记下清单 */
async function importPack() {
  const f = await pickPackFile(); if (!f) return null;
  return await applyPackBytes(new Uint8Array(await f.arrayBuffer()));
}
/* ★ 悬浮窗模板发来的素材包 (字节走 postMessage 过来): 以前这里没人接 -> 悬浮窗里「导入素材包」点了没反应 */
async function importPackFromMsg(arg) {
  try {
    if (!arg || !arg.buf) throw new Error('没收到文件内容（悬浮窗那边只发了文件名）');
    const stat = await applyPackBytes(new Uint8Array(arg.buf));
    try { if (typeof toastr !== 'undefined') toastr.success('素材包已导入：' + String((arg && arg.name) || '') + '（背景 ' + (stat.bg || 0) + ' / 立绘 ' + (stat.face || 0) + ' / 气泡 ' + (stat.bubble || 0) + '）'); } catch (e) {}
    console.log('[gv] 素材包已导入', stat);
    /* ★ 素材换了要把楼层按新素材重画一遍 (引擎面板那条路一直有这一步, 模板悬浮窗这条路以前漏了 -> 导入完楼层还是旧的/空了回不来) */
    try { nukeAll(); later(scan, 400, 'scan'); } catch (e) {}
  } catch (e) {
    try { if (typeof toastr !== 'undefined') toastr.error('素材包导入失败：' + e.message); } catch (x) {}
    console.warn('[gv] 素材包导入失败', e);
  }
}

function pickPackFile() {
  return new Promise(res => {
    const i = doc.createElement('input');
    i.type = 'file'; i.accept = '.zip,application/zip'; i.id = 'gv-packpicker';
    i.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    doc.body.appendChild(i);
    let done = false;
    const fin = v => { if (done) return; done = true; try { i.remove(); } catch (e) {} res(v); };
    i.onchange = () => fin(i.files && i.files[0] ? i.files[0] : null);
    P.addEventListener('focus', () => setTimeout(() => { if (!i.files || !i.files.length) fin(null); }, 800), { once: true });
    i.click();
  });
}

/* 启动时: 如果之前导过素材包, 直接用存在 IndexedDB 里的 blob 重建映射 */
async function restorePack() {
  try {
    const keep = await gvIdbGet(PACK_KEY, 'blobs');   // ★ 写进的是 blobs, 之前从 kv 读 -> 刷新后永远恢复不了
    if (!keep || !keep.manifest) return false;
    const files = {};
    for (const path of (keep.files || [])) {
      const b = await gvIdbGet(PACK_PREFIX + path, 'blobs');
      if (b) files[path] = new Uint8Array(await b.arrayBuffer());
    }
    if (!Object.keys(files).length) return false;
    await applyPack(keep.manifest, files);
    console.log('[gv] 已从本地恢复素材包:', keep.manifest.name);
    return true;
  } catch (e) { console.warn('[gv] 恢复素材包失败', e); return false; }
}

/* ---------- 样式 ---------- */
async function loadCssText() {
  if (GV_CSS) return GV_CSS;
  const a = await fetch('/galgame/galgame.css?v=' + CONFIG.assetVersion);
  GV_CSS = await a.text();
  try { const b = await fetch('/galgame/galgame-panel.css?v=' + CONFIG.assetVersion); GV_CSS += '\n' + (await b.text()); } catch (e) {}
  GV_CSS += ['.gv-root{margin:0 !important;padding:18px 0 !important;}', '.gv-userbar-wrap{padding:16px 0 !important;}', '.gv-shadow-mount{display:block;}'].join('\n');
  return GV_CSS;
}
function injectDocCss() {
  if (!doc.getElementById('gv-style')) { const l = doc.createElement('link'); l.id='gv-style'; l.rel='stylesheet'; l.href='/galgame/galgame.css?v='+CONFIG.assetVersion; doc.head.appendChild(l); }
  if (!doc.getElementById('gv-style-panel')) { const l2 = doc.createElement('link'); l2.id='gv-style-panel'; l2.rel='stylesheet'; l2.href='/galgame/galgame-panel.css?v='+CONFIG.assetVersion; doc.head.appendChild(l2); }
}
function shadowMount(host) {
  if (!host.shadowRoot) host.attachShadow({ mode: 'open' });
  const sr = host.shadowRoot;
  if (!sr.querySelector('style.gv-style')) { const st = doc.createElement('style'); st.className='gv-style'; st.textContent = GV_CSS; sr.appendChild(st); }
  let mount = sr.querySelector('.gv-shadow-mount');
  if (!mount) { mount = doc.createElement('div'); mount.className='gv-shadow-mount'; sr.appendChild(mount); }
  return { sr, mount };
}
async function ensureEngine() {
  if (P.Galgame && P.Galgame.assetVersion === CONFIG.assetVersion) return;
  await new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    s.src = '/galgame/galgame.js?v=' + CONFIG.assetVersion;
    s.onload = resolve; s.onerror = () => reject(new Error('galgame.js 加载失败'));
    doc.head.appendChild(s);
  });
  if (P.Galgame) P.Galgame.assetVersion = CONFIG.assetVersion;
}

/* ---------- 清理 ---------- */
function nukeAll() {
  for (const app of mounted.values()) { try { app.destroy(); } catch (e) {} }
  mounted.clear(); handled.clear();
  doc.querySelectorAll('.gv-floor-host').forEach(h => h.remove());
  doc.querySelectorAll('#chat > .mes.gv-full').forEach(m => { m.classList.remove('gv-full'); m.removeAttribute('data-gv'); });
  doc.querySelectorAll('#chat > .mes .mes_text.gv-hide').forEach(t => t.classList.remove('gv-hide'));
}
/* ---------- 人设(persona)变更: 已挂好的楼层不会自己换头像/换名 ----------
   ★ 酒馆的 events.js 里没有 persona 变更事件(只有 IMPERSONATE_READY), 所以按 sweep 的节奏
     (2.5 秒一次, 一次只读几个字符串)比一次解析结果, 变了就把受影响的楼层重挂。
     受影响的: user 楼层(头像+名字) / ai 楼层(模板的名字框里也有 {{user}} 的名字) */
let __uaSig = null, __uaAt = 0;
function avatarWatch() {
  let av = '', nm = '';
  try { av = userAvatarUrl(true); nm = userName(); } catch (e) { return; }
  const sig = { av: av || '', nm: nm || '', on: showUserAvatar ? 1 : 0 };
  if (!__uaSig) { __uaSig = sig; return; }
  const prev = __uaSig;
  if (prev.av === sig.av && prev.nm === sig.nm && prev.on === sig.on) return;
  /* 5 秒内最多重挂一次: 抖动时【不】更新基线, 下一轮 sweep 再试 —— 防止来回重挂把楼层刷爆 */
  if (Date.now() - __uaAt < 5000) return;
  __uaSig = sig; __uaAt = Date.now();
  __uaCache = { url: '', t: 0 };                       // 换人了 -> 缓存作废
  const ids = [];
  handled.forEach(id => {
    const m = $floor(id); if (!m) return;
    const k = m.getAttribute('data-gv');
    /* ★ char 楼层里"轮到 User 说话"时显示的那个人设头像也在 payload 里(userAvatar),
       所以头像换了要连 ai 楼层一起重挂 —— 以前只在"名字变了"时才重挂 ai, 头像变了不管 */
    if (k === 'user' || k === 'ai') ids.push(id);
  });
  if (!ids.length) return;
  later(() => { ids.forEach(id => { try { unmount(id); mount(id); } catch (e) {} }); }, 30, 'uawatch');
}

function sweep() {
  doc.querySelectorAll('.gv-floor-host').forEach(h => {
    const mes = h.closest('#chat > .mes');
    if (!mes) { h.remove(); return; }
    const id = Number(mes.getAttribute('mesid'));
    if (!handled.has(id)) {
      /* ★ 挂载是异步的(tplPayload 要转图/data URL), 而这里每 2.5 秒跑一次。
         原来直接删 -> 刚 ensureHost 建好、handled 还没加上的 host 被自己人删掉, User 楼层就此整层消失 (真机实测过)。
         改成: 第一次见到先记一笔, 下一轮还在才算真孤儿。 */
      /* ★ 挂载是异步的, 慢的时候要好几秒 —— 素材包里 13MB 背景 / 10MB 立绘要 fetch + 缩放,
         还要顺序转好几张。只要时间戳还新就绝不能删: 删了就是"char 楼层视觉上消失、音频还在响"(真机实测过)。
         只有超过 30 秒还没挂完的才算真孤儿。 */
      const pend = Number(h.getAttribute('data-gv-pending') || 0);
      if (pend && Date.now() - pend < 30000) return;
      h.remove(); return;
    }
    h.removeAttribute('data-gv-pending');
    const hosts = mes.querySelectorAll('.gv-floor-host');
    for (let i = 1; i < hosts.length; i++) hosts[i].remove();
  });
  doc.querySelectorAll('#chat > .mes.gv-full').forEach(m => {
    const id = Number(m.getAttribute('mesid'));
    if (!handled.has(id)) { m.classList.remove('gv-full'); m.removeAttribute('data-gv'); }
  });
  /* ★ 人设变更的检查必须放最后: 重挂是异步的(mountFloorTemplate 里要 await tplPayload), 挂到一半
     会被上面那段"没在 handled 里的 host 就删掉"的清理误删 —— 实测踩过 */
  try { avatarWatch(); } catch (e) {}
}

/* ---------- 楼层基础 ---------- */
const $floor = id => doc.querySelector('#chat > .mes[mesid="' + id + '"]');
const isEditing = id => { const m = $floor(id); return !!(m && m.querySelector('#curEditTextarea, .edit_textarea, .reasoning_edit_textarea')); };
const setFull = (id, on) => { const m = $floor(id); if (m) m.classList.toggle('gv-full', !!on && CONFIG.fullReplace); };
function unmount(id) {
  const app = mounted.get(id);
  if (app) { try { app.destroy(); } catch (e) {} mounted.delete(id); }
  handled.delete(id);
  const m = $floor(id); if (!m) return;
  m.classList.remove('gv-full');
  m.querySelectorAll('.gv-floor-host').forEach(h => h.remove());
  const t = m.querySelector('.mes_text'); if (t) t.classList.remove('gv-hide');
  muffleStyles(m, false);
  m.removeAttribute('data-gv');
  panelSoon();
}
function inDepth(id) {
  if (CONFIG.depth === 0) return true;
  let last = 0; try { last = getLastMessageId(); } catch (e) { return true; }
  if (!Number.isFinite(last)) return true;
  return id > last - CONFIG.depth;
}
function ensureHost(floor) {
  const hosts = floor.querySelectorAll('.gv-floor-host');
  for (let i = 1; i < hosts.length; i++) hosts[i].remove();
  let host = hosts[0];
  if (!host) {
    const text = floor.querySelector('.mes_text'); if (!text) return null;
    host = doc.createElement('div'); host.className = 'gv-floor-host';
    /* ★ 盖上"挂载中"的时间戳: sweep 看到它就不删, 直到挂完(handled 里有了)或超过 30 秒 */
    host.setAttribute('data-gv-pending', String(Date.now()));
    text.parentNode.insertBefore(host, text.nextSibling);
  }
  return host;
}
/* 隐藏的 .mes_text 里的 <style> 照样会全局生效 -> 先消音, 卸载时还原 */
function muffleStyles(floor, on) {
  const t = floor.querySelector('.mes_text');
  if (!t) return;
  t.querySelectorAll('style').forEach(s => {
    if (on) {
      if (!s.hasAttribute('data-gv-media')) {
        s.setAttribute('data-gv-media', s.getAttribute('media') || '');
        s.setAttribute('media', 'not all');
      }
    } else if (s.hasAttribute('data-gv-media')) {
      const m = s.getAttribute('data-gv-media');
      if (m) s.setAttribute('media', m); else s.removeAttribute('media');
      s.removeAttribute('data-gv-media');
    }
  });
}

function makeRawToggle(floor) {
  const btn = doc.createElement('div');
  btn.className = 'gv-raw-toggle'; btn.textContent = '⋯'; btn.title = '显示酒馆原生楼层';
  btn.addEventListener('click', e => { e.stopPropagation(); btn.textContent = floor.classList.toggle('gv-full') ? '⋯' : '✕'; });
  return btn;
}

/* ---------- 玩家楼层: 平时只有一个「编辑」 ---------- */
function renderUserFloor(id, msg, floor, text) {
  const host = ensureHost(floor); if (!host) return;
  const { sr, mount: box } = shadowMount(host);
  box.innerHTML = "";
  sr.querySelectorAll(".gv-raw-toggle").forEach(e => e.remove());
  if ((CONFIG.pages || {}).user) {
    const ua = showUserAvatar ? userAvatarUrl() : "";
    mountFloorTemplate('user', box, id, floor, text, { name: userName(), text: String(msg.message || ""), avatar: ua });
    return;
  }
  if (CONFIG.rawToggle) sr.appendChild(makeRawToggle(floor));

  const mk = (tag, cls, txt) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const wrap = mk("div", "gv-userbar-wrap");
  const bar = mk("div", "gv-userbar");

  /* --- 黑色那一行 --- */
  const main = mk("div", "gv-ubar-main");
  const ua = showUserAvatar ? userAvatarUrl() : "";
  if (ua) { const av = mk("img", "gv-uava"); av.src = ua; main.appendChild(av); }
  const txt = mk("div", "gv-utext");
  txt.appendChild(mk("b", "", userName()));
  txt.appendChild(doc.createTextNode(String(msg.message || "").replace(/^\s*[（(][^）)]*[）)]\s*/, "")));
  main.appendChild(txt);
  const editBtn = mk("span", "gv-ubar-btn", "编辑");
  editBtn.title = "展开操作";
  main.appendChild(editBtn);
  bar.appendChild(main);

  /* --- 展开区: 黑色行下面的半透明部分 --- */
  const extra = mk("div", "gv-ubar-extra");
  const acts = mk("div", "gv-ubar-actions");
  const ta = doc.createElement("textarea");
  ta.value = String(msg.message || "");
  const ed = mk("div", "gv-ubar-editor");
  const row = mk("div", "row");
  const bSave = mk("span", "gv-tb gv-primary", "确认修改");
  const bCancel = mk("span", "gv-tb", "退出修改");
  row.append(bSave, bCancel);
  ed.append(ta, row);

  const mkAct = (label, action, cls) => {
    const e = mk("span", "gv-tb" + (cls ? " " + cls : ""), label);
    e.addEventListener("click", ev => {
      ev.stopPropagation();
      if (action === "edit") { ed.classList.toggle("gv-open"); if (ed.classList.contains("gv-open")) ta.focus(); return; }
      if (action === "save") { floorAction("save", ta.value, id); ed.classList.remove("gv-open"); wrap.classList.remove("gv-open"); editBtn.textContent = "编辑"; return; }
      if (action === "close") { ed.classList.remove("gv-open"); wrap.classList.remove("gv-open"); editBtn.textContent = "编辑"; return; }
      floorAction(action, undefined, id);
    });
    acts.appendChild(e);
    return e;
  };
  mkAct("编辑", "edit", "gv-primary");
  mkAct("复制", "copy");
  mkAct("上移", "up");
  mkAct("下移", "down");
  const uaBtn = mkAct(showUserAvatar ? "关闭头像" : "显示头像", "toggle-user-avatar", "gv-toggle");
  if (showUserAvatar) uaBtn.classList.add("gv-on");
  mkAct("删除", "delete", "gv-danger");
  mkAct("关闭", "close");

  extra.append(acts, ed);
  bar.appendChild(extra);
  wrap.appendChild(bar);
  box.appendChild(wrap);

  editBtn.addEventListener("click", ev => {
    ev.stopPropagation();
    const open = wrap.classList.toggle("gv-open");
    editBtn.textContent = open ? "关闭" : "编辑";
    if (!open) ed.classList.remove("gv-open");
  });
  bSave.addEventListener("click", ev => { ev.stopPropagation(); floorAction("save", ta.value, id); ed.classList.remove("gv-open"); wrap.classList.remove("gv-open"); editBtn.textContent = "编辑"; });
  bCancel.addEventListener("click", ev => { ev.stopPropagation(); ed.classList.remove("gv-open"); });

  text.classList.add("gv-hide");
  setFull(id, true); handled.add(id);
  floor.setAttribute("data-gv", "user");
  panelSoon();
}

/* ---------- AI 楼层 ---------- */
/* 把数据打包喂给使用者的模板 */
/* ★ 模板跑在 sandbox iframe 里 —— 实测(就在这台机器上): http 图 0、父页面造的 blob: 也是 0, 只有 data: 能显示。
   所以素材包导入后的图(blob:)和 http 图都必须先转成 data:, 否则模板那一层全是裂图(音频没事, 音频是宿主在放)。
   只转【这一楼用得到的】+ 每个角色第一张, 并缩到长边 900px: 不然几百 MB 的 payload 每次挂楼层都要克隆一遍 */
const _tplData = new Map();
async function toDataUrl(u) {
  const s = String(u || '');
  if (!s || s.slice(0, 5) === 'data:') return s;
  if (_tplData.has(s)) return _tplData.get(s);
  let out = s;
  try {
    const r = await fetch(s, { credentials: 'same-origin' });
    if (r.ok) {
      const b = await r.blob();
      const d = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || s)); fr.onerror = () => res(s); fr.readAsDataURL(b); });
      /* ★ 1440: 本机导入素材包里的原图按这个上限转 (比烘进脚本的便携版 900 清楚);
         data: 开头的(烘进脚本的那份)直接原样返回, 不走这里 */
      out = await smallDataUrl(d, 1440);
    }
  } catch (e) {}
  _tplData.set(s, out);
  return out;
}
/* 长边超过 cap 就缩一下 (webp, 带透明通道); 本来就不大就原样返回 */
function smallDataUrl(d, cap) {
  return new Promise(function (res) {
    if (!d || d.slice(0, 5) !== 'data:') return res(d);
    try {
      const im = new Image();
      im.onload = function () {
        try {
          const w = im.naturalWidth || 0, h = im.naturalHeight || 0;
          const k = Math.min(1, (Number(cap) || 900) / Math.max(w || 1, h || 1));
          if (!w || !h || k >= 1) return res(d);
          const cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          let o = '';
          try { o = cv.toDataURL('image/webp', 0.88); } catch (e) { o = ''; }
          if (!o || o.indexOf('data:image/') !== 0) o = cv.toDataURL('image/png');
          res(o || d);
        } catch (e) { res(d); }
      };
      im.onerror = function () { res(d); };
      im.src = d;
    } catch (e) { res(d); }
  });
}
function _u(v) { return v && typeof v === 'object' ? String(v.url || '') : String(v || ''); }
/* ★ 素材名对不上是常态: 包里键是文件名(主殿.png), 剧本写的是【bg:主殿】。
   精确 -> 去扩展名 -> 互相包含, 和引擎/模板那套模糊规则保持一致 (以前精确查不到就只剩"表里第一张") */
function _bareName(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\.(png|jpe?g|webp|gif|bmp|avif)$/i, ''); }
function pickAsset(map, key) {
  if (!map || !key) return null;
  const k = String(key).trim();
  if (map[k]) return { k: k, v: map[k] };
  const kb = _bareName(k), keys = Object.keys(map);
  let hit = keys.filter(x => _bareName(x) === kb)[0];
  if (!hit) hit = keys.filter(x => { const xb = _bareName(x); return xb && (kb.indexOf(xb) >= 0 || xb.indexOf(kb) >= 0); })[0];
  return hit ? { k: hit, v: map[hit] } : null;
}
async function tplPayload(kind, data) {
  const G = P.Galgame, C = G.CONFIG;
  /* ★ 这批字段以前只有「插件预览」那份 payload 有, 卡 / 导出脚本这条路上漏了 ——
     结果真机模板楼层里: 占位排版(slotBoxes) / 单个气泡落点(bubblePosEach) / 自定义气泡动画(bubbleCss) /
     按行切 BGM·音效(bgmAt·seAt) / 手机宽高比(frameSize) / 「这句是不是我说的」(userAliases) /
     编辑器原文本(rawText) / 空方案纯黑(bgBlack) 全都不生效。预览那边有, 这边就必须有, 不然所见非所得 */
  const _aliases = (function () {
    try {
      const c = P.SillyTavern.getContext(), out = [String(c.name1 || '')];
      /* ★ 立绘表里有的名字 = 角色, 绝不当成"我"。
         以前把聊天里所有 user 消息的 name 都当别名 -> 用户早期用「饮酒」人设测过,
         之后哪怕换成别人设, 剧本里叫「饮酒」的角色行也会被判成 User -> 立绘永远出不来。 */
      const chars = {};
      const fm = (P.Galgame && P.Galgame.CONFIG && P.Galgame.CONFIG.faceMap) || {};
      Object.keys(fm).forEach(function (k) {
        const i = k.indexOf('|');
        if (i > 0) chars[k.slice(0, i)] = 1; else if (k.charAt(0) === '@') chars[k.slice(1)] = 1;
      });
      const cn0 = String(c.name2 || '').trim(); if (cn0) chars[cn0] = 1;
      (c.chat || []).forEach(function (m) { if (m && m.is_user && m.name && !chars[m.name] && out.indexOf(m.name) < 0) out.push(m.name); });
      return out.filter(Boolean);
    } catch (e) { return []; }
  })();
  const base = { kind: kind, slots: C.slots || [], slotPos: C.slotPos || {},

    /* ★ 自定义演出组 + 占位排版 + 单个气泡落点 + 自定义气泡 CSS: 模板自己要用 */
    effects: C.effects || {},
    slotBoxes: C.slotBoxes || {},
    bubblePosEach: C.bubblePosEach || {},
    bubblePosSlot: C.bubblePosSlot || {},   /* ★ 每个站位一套气泡落点 (模板按当前行的 slot 选) */
    bubbleCss: CONFIG.bubbleCss || '',
    /* ★ 这一楼的音乐/音效切换点 + 原始文本 (引擎那条路是 parse() 给的, 模板这条路要手动带) */
    bgmAt: (data && data.bgmAt) || [], seAt: (data && data.seAt) || [],
    rawText: (data && data.raw != null) ? data.raw : null,
    /* ★ 定位框宽高比 (导出时写进卡): 模板用它定手机比例, 不带给就用模板自己的默认比例 */
    frameSize: CONFIG.frameSize || null,
    /* ★ 「哪句是我说的」判定要的用户名别名 (模板拿它决定显示谁的名字/头像) */
    userAliases: _aliases,
    /* ★ 当前角色名 (name2): 人设名和角色名撞车时, 角色的台词要靠它保住自己的立绘 */
    charName: (function () { try { return String(P.SillyTavern.getContext().name2 || '').trim(); } catch (e) { return ''; } })(),
    backgrounds: C.bgMap || {}, faces: C.faceMap || {}, bubbles: C.bubbleMap || {},
    /* ★ 模板读的是这几个名字, 卡这条路以前只给 backgrounds/faces/audioMap —— 于是:
       · 重命名过的内置演出(ctx.fxAliases)在真机上不生效;
       · 模板 hasLocalAudio() 永远 false -> 有音频的卡在真机上也被当成"没本地音频";
       · backgrounds/faces 一旦被"只带用得到的"那张挤成空表, 名字就再也查不到(fit 也跟着丢)。
       全表一起带上: 名字先查得到, data: 在沙箱里本来就能加载。 */
    fxAliases: C.fxAliases || {},
    audioBgm: C.audioMap || {}, audioSe: C.seMap || {},
    bgMap: C.bgMap || {}, faceMap: C.faceMap || {},
    bubblePos: C.bubblePos || {}, bubbleAnim: C.bubbleAnim || {}, audioMap: C.audioMap || {},
    volume: (G.getVolume ? G.getVolume() : { bgm: 0.8, se: 0.8 }) };   // 音量面板要显示当前值
  if (kind === 'char') {
    base.lines = data.lines || []; base.bg = data.bg || null; base.bgm = data.bgm || null; base.index = 0;
    /* ★ 按行换背景: 引擎 parse 给的换景事件 (和 bgmAt/seAt 同一套); 模板按行号切 */
    base.bgAt = (data && data.bgAt) || [];
    /* 空方案: 让模板画纯黑, 别去用模板自带的那张占位背景图 */
    base.bgBlack = !(base.bg || Object.keys(C.bgMap || {})[0]);
    base.userName = userName();                       // 酒馆里当前用户名 ({{user}})
    base.userAvatar = showUserAvatar ? await toDataUrl(userAvatarUrl()) : '';   // ★ 头像也要 data: 才显示得出来
    /* ★ 图一律转 data: 且只带这一楼用得到的 (沙箱只能加载 data:, 见 toDataUrl 上面那段注释) */
    const _bgUse = {}, _faceUse = {}, _bubUse = {};
    const _bg0 = base.bg || Object.keys(C.bgMap || {})[0];
    if (_bg0) _bgUse[_bg0] = 1;
    /* ★ 中途换到的每一张背景也要转成 data:, 否则模板切过去时表里没有那张 */
    (base.bgAt || []).forEach(function (ev) { if (ev && ev.name) _bgUse[ev.name] = 1; });
    (base.lines || []).forEach(function (l) {
      const nm = String((l && l.name) || '').trim();
      if (nm) _faceUse['@' + nm] = 1;
      if (nm && l && l.face) _faceUse[nm + '|' + String(l.face).trim().toLowerCase()] = 1;
      /* ★ 台词和效果字段【都要扫】: 解析器修好之后气泡名在 fx 里(不再混在台词里),
         只扫 text 就扫不到 -> 给模板的气泡表里缺这张 -> 真机报"素材对不上"、气泡也不弹 (2026-09-26) */
      const _scanBub = (s) => String(s == null ? '' : s).replace(/(?:bubble|气泡)[:：]([^|,，、+\s]+)/g, function (m, n) { _bubUse[n] = 1; return m; });
      _scanBub(l && l.text);
      _scanBub(l && l.fx);
    });
    /* ★ 并行转图: 一张 13MB 背景 + 几张 10MB 立绘顺序转要好几秒, 顺序转的时候楼层一直是"挂载中",
       慢到 sweep 收工就会被清掉。并行之后总耗时 ≈ 最慢的那一张。 */
    const _bg = {}, _bgJobs = [], _bgMissed = [];
    for (const k of Object.keys(_bgUse)) {
      const hit = pickAsset(C.bgMap, k);
      if (hit) _bgJobs.push([hit.k, hit.v]);
      else if (Object.keys(C.bgMap || {}).length) _bgMissed.push(k);
    }
    /* ★ 「只带这一楼用得到的那张」有个致命的坑: 名字对不上(pickAsset 没命中)时表就**空了**,
       模板拿到 ctx.backgrounds = {} —— 于是消息里就算写了【bg:天机阁】也永远查不到, 直接显示空背景。
       (实测: 消息首行 bg=永宁宫-宫前云台, 方案里只有 天机阁/炼丹房 -> 空表 -> 什么都不显示)
       修: ① 一张都没命中就至少把表里第一张转出来, 保证表非空; ② 名字对不上要明说。 */
    if (!_bgJobs.length && Object.keys(C.bgMap || {}).length) {
      const _k0 = Object.keys(C.bgMap)[0];
      _bgJobs.push([_k0, C.bgMap[_k0]]);
    }
    await Promise.all(_bgJobs.map(async (jb) => { _bg[jb[0]] = { url: await toDataUrl(_u(jb[1])), fit: (jb[1] && jb[1].fit) || null }; }));
    base.backgrounds = _bg;
    if (_bgMissed.length) {
      const _have = Object.keys(C.bgMap || {});
      const _key = 'bg|' + _bgMissed.join(',');
      try { console.warn('[gv] 消息里的背景名对不上: ' + _bgMissed.join(' / ') + '（方案里现有: ' + _have.slice(0, 8).join(' / ') + (_have.length > 8 ? ' …' : '') + '）'); } catch (e) {}
      if (!missWarnedOnce[_key]) {
        missWarnedOnce[_key] = 1;
        try { if (typeof toastr !== 'undefined') toastr.warning('背景「' + _bgMissed[0] + '」方案里没有（现有：' + _have.slice(0, 6).join(' / ') + '）', '素材对不上', { timeOut: 9000 }); } catch (e) {}
      }
    }
    /* ★ 以前把"说到的角色"的【所有表情】都转一遍 (5 张 10MB 立绘 = 5 秒), 现在只转这一楼真用到的表情,
       再加每个角色第一张兜底脸 (模板的表情对不上时要用它), 而且并行转。 */
    const _fm = C.faceMap || {}, _fc = {}, _seen = {}, _faceJobs = [];
    for (const k of Object.keys(_fm)) {
      const i = k.indexOf('|');
      let need = false;
      if (i > 0) {
        const nm = k.slice(0, i);
        need = !!(_faceUse[k] || (_faceUse['@' + nm] && !_seen[nm]));
        _seen[nm] = 1;
      } else need = !!_faceUse['@' + k];
      if (need) _faceJobs.push([k, _fm[k]]);
    }
    await Promise.all(_faceJobs.map(async (jb) => { _fc[jb[0]] = { url: await toDataUrl(_u(jb[1])), fit: (jb[1] && jb[1].fit) || null }; }));
    if (Object.keys(_fc).length) base.faces = _fc;
    const _bb = {}, _bubJobs = [];
    for (const k of Object.keys(_bubUse)) { const v = (C.bubbleMap || {})[k]; if (v) _bubJobs.push([k, v]); }
    await Promise.all(_bubJobs.map(async (jb) => { _bb[jb[0]] = await toDataUrl(_u(jb[1])); }));
    if (Object.keys(_bb).length) base.bubbles = _bb;
  }
  else if (kind === 'user') { base.name = data.name || ''; base.text = data.text || ''; base.avatar = await toDataUrl(data.avatar || ''); }
  return base;
}
async function mountFloorTemplate(kind, box, id, floor, text, data) {
  const t = P.Galgame.mountTemplate ? P.Galgame.mountTemplate(box, kind, await tplPayload(kind, data), {
    minH: kind === 'user' ? 60 : 320,
    /* ★ 模板楼层里的按钮(保存/复制/上移/下移/删除/头像开关/… 都是 postMessage 给宿主的)以前只有 'edit' 被接住,
       其它全被丢掉 —— 所以模板楼层里「编辑」改完点保存等于没点。现在一律转给 floorAction (和引擎自带界面同一条路) */
    onAction(action, arg) {
      try {
        if (action === 'edit') { floorAction('edit', undefined, id); return; }
        /* ★ 模板里发现"消息里写的素材名在方案里没有"(以前会 hash 随便挑一张, 用户完全看不出):
           宿主这边弹一次明确的提示 —— 消息里的名字 vs 方案里现有的名字 */
        if (action === 'missingAsset') {
          const a = arg || {};
          const key = 'miss|' + a.kind + '|' + a.name;
          if (!missWarnedOnce[key]) {
            missWarnedOnce[key] = 1;
            if (typeof toastr !== 'undefined') toastr.warning(a.kind + '「' + a.name + '」脚本自带素材里没有（现有：' + (a.have || []).slice(0, 6).join(' / ') + '）', '素材对不上', { timeOut: 9000 });
          }
          return;
        }
        floorAction(action, arg, id);
      } catch (e) { console.warn('[gv] 模板动作失败', action, e); }
    },
  }) : null;
  if (!t) return false;
  handled.add(id);
  try { if (CONFIG.rawToggle) { const tg = makeRawToggle(floor); tg.style.display = 'none'; floor.appendChild(tg); } } catch (e) {}
  floor.setAttribute('data-gv', kind === 'user' ? 'user' : 'ai');
  text.classList.add('gv-hide');
  setFull(id, true);
  if (kind !== 'user') muffleStyles(floor, true);
  const prev = mounted.get(id);
  if (prev) { try { prev.destroy(); } catch (e) {} }
  mounted.set(id, { destroy() { t.destroy(); } });
  panelSoon();
  return true;
}

function renderAiFloor(id, msg, floor, text, story) {
  const host = ensureHost(floor); if (!host) return;
  const { sr, mount: box } = shadowMount(host);
  box.innerHTML = '';
  sr.querySelectorAll('.gv-raw-toggle').forEach(e => e.remove());
  if ((CONFIG.pages || {}).char) {
    /* ★ 挂载失败以前是静默的(异常被事件回调吞掉) -> 楼层直接不出现。现在把错抛到台面上 */
    mountFloorTemplate('char', box, id, floor, text, story).catch(e => {
      console.error('[gv] char 楼层挂载失败', e);
      if (typeof toastr !== 'undefined') toastr.error('角色楼层挂载失败: ' + (e && e.message));
    });
    return;
  }
  if (CONFIG.rawToggle) sr.appendChild(makeRawToggle(floor));
  const app = P.Galgame.create(story, {
    inline: true, userName: userName(), userAvatar: userAvatarUrl(), showUserAvatar,
    rawText: msg.message,
    onAction: (action, payload) => floorAction(action, payload, id),
  });
  box.appendChild(app.el);
  if (mounted.has(id)) { try { mounted.get(id).destroy(); } catch (e) {} }
  mounted.set(id, app);
  handled.add(id);
  muffleStyles(floor, true);
  floor.setAttribute('data-gv', 'ai');
  text.classList.add('gv-hide');
  setFull(id, true);
  panelSoon();
}

function mount(id) {
  id = Number(id);
  if (!enabled || !P.Galgame || !Number.isFinite(id) || id < 0) return;
  if (!inDepth(id)) { unmount(id); return; }
  if (isEditing(id)) { unmount(id); return; }
  const msg = (getChatMessages(id) || [])[0];
  if (!msg || msg.is_hidden) { unmount(id); return; }
  const floor = $floor(id); if (!floor) return;
  const text = floor.querySelector('.mes_text'); if (!text) return;

  if (msg.role === 'user') {
    if (CONFIG.userFloor === 'native') { unmount(id); return; }
    renderUserFloor(id, msg, floor, text);
    return;
  }

  const ex = P.Galgame.extract(msg.message);
  if (ex.story) { renderAiFloor(id, msg, floor, text, ex.story); return; }

  const cached = msg.data && msg.data.gvScript;
  if (cached) {
    const st = P.Galgame.parse(cached);
    if (st) { renderAiFloor(id, msg, floor, text, st); return; }
  }
  const convOn = (() => { try { return P.Galgame.convertEnabled ? P.Galgame.convertEnabled() : true; } catch (e) { return true; } })();
  if (CONFIG.convert.enabled && convOn && !converting.has(id)) {
    let lastId = 0; try { lastId = getLastMessageId(); } catch (e) {}
    const prose = extractProse(msg.message, Math.max(0, lastId - id));
    const range = (() => { try { return P.Galgame.bodyRange(msg.message); } catch (e) { return { confident: false }; } })();
    if (range.confident && looksLikeProse(prose)) {
      converting.add(id);
      if (typeof toastr !== 'undefined') toastr.info('第 ' + id + ' 楼格式不符, 正在用 API 层转换…');
      convertToScript(prose)
        .then(script => setChatMessages([{ message_id: id, data: Object.assign({}, msg.data || {}, { gvScript: script }) }], { refresh: 'none' }))
        .then(() => { converting.delete(id); mount(id); if (typeof toastr !== 'undefined') toastr.success('第 ' + id + ' 楼已转成脚本格式'); })
        .catch(e => { converting.delete(id); if (typeof toastr !== 'undefined') toastr.warning('格式转换失败: ' + e.message); });
    }
  }
  unmount(id);
}

/* ★ "素材名对不上"的提示: 同一个名字只弹一次 */
const missWarnedOnce = {};

/* ---------- 悬浮窗 ---------- */
let panelHost = null, panel = null, panelTimer = null, scanTimer = null;
const panelSoon = () => { clearTimeout(panelTimer); panelTimer = setTimeout(updatePanel, 320); };
const scanSoon = () => { clearTimeout(scanTimer); scanTimer = setTimeout(scan, 200); };let panelClosed = false;
function closePanel() {
  panelClosed = true;
  try { if (panelHost) panelHost.remove(); } catch (e) {}
  try { if (panel && panel.el && panel.el.remove) panel.el.remove(); } catch (e) {}
  panel = null; panelHost = null;
}
function reopenPanel() { panelClosed = false; }

function ensurePanel() {
  if (panelClosed) return null;
  if (panel) return panel;
  /* 同时只允许一个悬浮窗 */
  try { [...doc.querySelectorAll("#gv-float-host")].forEach(el => { if (el !== panelHost) el.remove(); }); } catch (e) {}
  panelHost = doc.createElement('div'); panelHost.id = 'gv-float-host';
  /* ★ 悬浮窗的"画布"= 整个窗口: 宿主铺满窗口但自己不吃鼠标(pointer-events:none),
     里面那层 iframe 也是整窗口大小、由引擎用 clip-path 只留出面板那一块 ——
     面板因此能拖到窗口任何位置, 面板以外的地方照样能点聊天。
     (以前宿主是跟在正文后面的小方块: 活动范围就那一点点, 面板缩小/收小球后还会跑到框外点不到) */
  panelHost.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none;';
  const sr = panelHost.attachShadow({ mode: 'open' });   // ★ 隔离: 预设的 <style> 只作用于面板内部
  const st = doc.createElement('style'); st.textContent = GV_CSS; sr.appendChild(st);
  const m = doc.createElement('div'); m.className = 'gv-shadow-mount';
  m.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
  sr.appendChild(m);
  /* 悬浮楼层也支持自定义模板: 有模板就用模板, 没有就用引擎自带的面板 */
  if ((CONFIG.pages || {}).panel && P.Galgame.mountTemplate) {
    let ctl = null;
    /* ★ 先把宿主放进文档再挂模板: 模板里的 fitSelf() 要量自己的尺寸, 不在文档里量出来全是 0 */
    doc.body.appendChild(panelHost);
    panel = {
      el: m,
      setFloors(list) { if (ctl) ctl.send('floors', list || []); },
      show() {}, hide() {}, collapse() {}, destroy() { if (ctl) ctl.destroy(); },
    };
    /* ★ 面板模板要的初始数据: 楼层 + 格式提示词 + 转换设置。
       以前这里只给了 floors —— 悬浮窗「词」里永远是空的, 用户以为提示词没存进去。
       (引擎自带面板那条路是传 getPrompt() 的, 所以只有模板面板会缺这一份) */
    const panelInit = () => ({
      kind: 'panel', floors: [],
      prompt: buildPrompt(),
      convertCfg: (function () {
        try { return P.Galgame.loadConvertCfg ? P.Galgame.loadConvertCfg() : JSON.parse(localStorage.getItem('gv_convert_api_v1') || '{}'); } catch (e) { return {}; }
      })(),
    });
    ctl = P.Galgame.mountTemplate(m, 'panel', panelInit(), {
      minH: 90,
      canvas: true,      // ★ 整窗口画布 + clip-path 抠出面板 (活动范围 = 整个窗口)
      /* ★ 悬浮层【直挂】进酒馆页面(引擎的 mountTemplateInline + shadow DOM 隔离样式):
         这样它里面那些活 iframe 的 window.parent 就是【酒馆页面本身】——
         卡片脚本里 window.parent.document.querySelector('#send_textarea') / window.parent.triggerSlash 直接可用,
         和旧版"引擎自带面板"完全一致, 不再依赖假 parent + postMessage 转发。 */
      inlineHost: true,
      /* ★ 悬浮窗模板发过来的动作 (以前一个都没接: 「导入素材包」点了等于没点) */
      onAction(action, arg) {
        /* ★ 悬浮窗模板实际会发的动作: 一条条都得接住 (以前只接了 packFile, 其余全静默丢弃) */
        if (action === 'packFile') { importPackFromMsg(arg); return; }
        if (action === 'saveFloor') { const a = arg || {}; floorAction('save', a.text, a.id); return; }
        /* ★ 悬浮窗「包」里的"清除本机素材包缓存": 只删角色脚本存在本机的素材包缓存,
           删完按脚本自带素材重画一遍楼层 (作者更新卡后删掉/改名素材时用) */
        if (action === 'clearPackCache') { clearPackCache(); return; }
        if (action === 'closePanel' || action === 'close') { closePanel(); return; }
        if (action === 'setPrompt') { savePromptOverride(String(arg == null ? '' : arg)); injectFormat(); if (ctl) ctl.send('prompt', buildPrompt()); if (typeof toastr !== 'undefined') toastr.success('提示词已保存'); return; }
        if (action === 'convertCfg') { if (P.Galgame && P.Galgame.setConvertCfg) P.Galgame.setConvertCfg(arg); else { try { localStorage.setItem('gv_convert_api_v1', JSON.stringify(arg || {})); } catch (e) {} } if (typeof toastr !== 'undefined') toastr.success('转换设置已保存'); return; }
        if (action === 'redraw') { nukeAll(); later(scan, 250, 'scan'); if (typeof toastr !== 'undefined') toastr.success('已重绘'); return; }
        if (action === 'move' || action === 'wantSize') return;   // 模板自己拖/自己算宽, 宿主不用管
        try { panelAction(action, arg); } catch (e) { console.warn('[gv] 悬浮窗动作失败', action, e); }
      },
    });
    /* ★ 这里以前没有 return, 于是刚挂好的模板面板被下面那句【引擎自带面板】整个覆盖掉了:
       真机上看到的永远是引擎那套老悬浮窗(没有「素」), 和旧脚本长得一模一样 —— 就是这个坑。 */
    return panel;
  }
  panel = P.Galgame.createPanel({
    onAction: panelAction,
    onClose: closePanel,
    convertOn: !!CONFIG.convert.enabled,
    getPrompt: () => buildPrompt(),
    isPromptEdited: () => !!loadPromptOverride().trim(),
    setPrompt: t => { savePromptOverride(t); injectFormat(); },
    resetPrompt: () => { savePromptOverride(''); injectFormat(); },
    onToggle(kind, val) {
      if (kind === 'pack') {
        importPack()
          .then(stat => {
            if (!stat) return;
            if (typeof toastr !== 'undefined') toastr.success('素材包已导入：背景 ' + stat.bg + ' / 立绘 ' + stat.face + ' / 气泡 ' + stat.bubble);
            /* ★ 素材刚落地, 多扫一遍 —— 一次扫描若在素材就绪前跑完, 就只剩一部分楼层 (实测: 只显示 User 楼层) */
            nukeAll(); later(scan, 400, 'scan'); later(scan, 1800, 'scan2');
          })
          .catch(e => { if (typeof toastr !== 'undefined') toastr.error('素材包导入失败: ' + e.message); });
        return;
      }
      if (kind === 'convert') {
        CONFIG.convert.enabled = !!val;
        if (typeof toastr !== 'undefined') toastr.info('散文楼层自动转脚本: ' + (val ? '开' : '关'));
        if (val) scanSoon();
      }
      else if (kind === 'redraw') { nukeAll(); P.Galgame && later(scan, 250, 'scan'); toastr.success('已重绘'); }
    },
  });
  m.appendChild(panel.el);
  doc.body.appendChild(panelHost);
  return panel;
}
function panelEntries() {
  const list = [];
  const last = (() => { try { return getLastMessageId(); } catch (e) { return 0; } })();
  doc.querySelectorAll('#chat > .mes').forEach(m => {
    const id = Number(m.getAttribute('mesid'));
    if (!Number.isFinite(id)) return;
    const msg = (getChatMessages(id) || [])[0];
    if (!msg || msg.role === 'user') return;
    const ex = P.Galgame.extract(msg.message);
    const hasRest = !!(ex.rest && ex.rest.trim());
    const hasReasoning = !!(msg.extra && msg.extra.reasoning && String(msg.extra.reasoning).trim());
    if (!hasRest && !hasReasoning) return;
    let text = ex.rest;
    try { text = regexedText(text, Math.max(0, last - id)); } catch (e) {}
    text = postProcess(text);
    // 思维链: 先从 Tavern Helper 的返回值拿, 拿不到就直接读聊天数据 (酒馆的推理格式化会把它抽到 extra.reasoning)
    let reasoning = msg.extra && msg.extra.reasoning;
    if (!reasoning) {
      try {
        const raw = P.SillyTavern.getContext().chat[id];
        reasoning = raw && raw.extra && raw.extra.reasoning;
        if (!reasoning && raw && raw.swipe_info && raw.swipe_info[raw.swipe_id || 0]) {
          reasoning = raw.swipe_info[raw.swipe_id || 0].extra && raw.swipe_info[raw.swipe_id || 0].extra.reasoning;
        }
      } catch (e) {}
    }
    /* ★ 富渲染: 围栏交给引擎切分 —— html 围栏变成活 iframe (和酒馆助手那套一样), 其它围栏变代码块。
       以前这里直接 innerHTML: 三个反引号原样露在面板里, 围栏里的脚本也不执行 (摘要卡点不动就是这个)。 */
    let html = text;
    try { if (P.Galgame && P.Galgame.richHtml) html = P.Galgame.richHtml(text, id); } catch (e) {}
    if (reasoning && String(reasoning).trim()) {
      html = '<details class="gv-think"><summary>思维链（酒馆推理格式化）</summary><div class="gv-think-body">'
        + String(reasoning).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</div></details>' + html;
    }
    list.push({ id, name: msg.name, raw: ex.rest, html, story: !!ex.story });
  });
  return list;
}
function updatePanel() {
  if (!P.Galgame) return;
  const p = ensurePanel();
  if (!p) return;
  p.setFloors(enabled ? panelEntries() : []);
}

/* ---------- 动作 ---------- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    try {
      const ta = doc.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      doc.body.appendChild(ta); ta.select(); doc.execCommand('copy'); ta.remove(); return true;
    } catch (e2) { return false; }
  }
}
async function floorAction(action, payload, id) {
  try {
    if (action === 'save') {
      const want = String(payload == null ? '' : payload);
      await setChatMessages([{ message_id: id, message: want }]);
      /* ★ 不能只靠 MESSAGE_UPDATED 事件来重画: 模板楼层的 iframe 里那份 payload 是旧的,
         事件不来(或来晚了)就会看到"点了确认修改, 文字没变"。这里自己重挂这一楼, 保证屏幕上真的换掉。 */
      try { unmount(id); } catch (e) {}
      later(() => mount(id), 80, 'save' + id);
      let after = null;
      try { const m = (getChatMessages(id) || [])[0]; after = m ? String(m.message) : null; } catch (e) {}
      if (typeof toastr !== 'undefined') {
        if (after != null && after !== want) toastr.error('第 ' + id + ' 楼没写进去（读回来还是旧文字）');
        else toastr.success('第 ' + id + ' 楼已保存');
      }
      return;
    }
    if (action === 'toggle-user-avatar') {
      showUserAvatar = !showUserAvatar;
      try { localStorage.setItem('gv_show_user_avatar', showUserAvatar ? '1' : '0'); } catch (e) {}
      __uaCache = { url: '', t: 0 };
      const app = mounted.get(id);
      if (app && app.setUserAvatar) app.setUserAvatar(showUserAvatar);
      scanSoon(); panelSoon();
      if (typeof toastr !== 'undefined') toastr.info(showUserAvatar ? '已显示头像' : '已隐藏头像');
      return;
    }
    if (action === 'copy') {
      const msg = (getChatMessages(id) || [])[0];
      const ok = await copyText(msg ? msg.message : '');
      if (typeof toastr !== 'undefined') { ok ? toastr.success('已复制第 ' + id + ' 楼') : toastr.error('复制失败'); }
      return;
    }
    if (action === 'up') { if (id > 0) await rotateChatMessages(id - 1, id, id + 1); return; }
    if (action === 'down') { if (id < getLastMessageId()) await rotateChatMessages(id, id + 1, id + 2); return; }
    if (action === 'delete') { await deleteChatMessages([id]); return; }
  } catch (e) { if (typeof toastr !== 'undefined') toastr.error('操作失败: ' + e.message); }
}
/* 悬浮窗里"整块变编辑器": 把那一格的正文区换成 textarea + 确认/退出 (和 char 那套一个风格) */
function panelInlineEdit(id) {
  try {
    const sr = panelHost && panelHost.shadowRoot;
    if (!sr) return false;
    const items = [...sr.querySelectorAll('.gv-panel-item')];
    const item = items.find(it => {
      const b = it.querySelector('.gv-panel-item-head b');
      return b && Number(String(b.textContent).replace('#', '')) === Number(id);
    });
    if (!item) return false;
    const body = item.querySelector('.gv-panel-item-body');
    if (!body) return false;
    if (body.querySelector('.gv-panel-inline-edit')) return true;
    const msg = (getChatMessages(id) || [])[0];
    /* ★ 编辑时别缩: 锁住整块高度, 编辑框撑满 */
    const rootEl = sr.querySelector('.gv-panel');
    const whole = rootEl ? Math.max(220, Math.round(rootEl.getBoundingClientRect().height)) : 0;
    if (rootEl && !rootEl.style.height) rootEl.style.height = whole + 'px';
    const prevBodyH = body.style.minHeight;
    if (whole) body.style.minHeight = Math.max(160, whole - 210) + 'px';
    const prev = body.innerHTML;
    item.classList.add('gv-editing');                   // 让这一格撑满面板(面板改大编辑框也跟着大)
    const wrap = doc.createElement('div'); wrap.className = 'gv-panel-inline-edit';
    const ta = doc.createElement('textarea'); ta.className = 'gv-panel-inline-ta';
    ta.value = msg ? String(msg.message || '') : String(body.textContent || '');
    const row = doc.createElement('div'); row.className = 'gv-panel-inline-btns';
    const ok = doc.createElement('span'); ok.className = 'gv-tb gv-primary'; ok.textContent = '确认修改';
    const no = doc.createElement('span'); no.className = 'gv-tb'; no.textContent = '退出修改';
    row.append(ok, no); wrap.append(ta, row);
    body.innerHTML = ''; body.appendChild(wrap);
    no.addEventListener('click', ev => { ev.stopPropagation(); body.innerHTML = prev; body.style.minHeight = prevBodyH; item.classList.remove('gv-editing'); });
    ok.addEventListener('click', async ev => {
      ev.stopPropagation();
      await floorAction('save', ta.value, id);      // 和 char 编辑器同一个保存路径
      body.innerHTML = prev;
      body.style.minHeight = prevBodyH;
      item.classList.remove('gv-editing');
      nukeAll(); later(scan, 300, 'scan');          // 楼层按新内容重画
    });
    ta.addEventListener('click', ev => ev.stopPropagation());
    ta.focus();
    return true;
  } catch (e) { return false; }
}

async function panelAction(action, id) {
  if (action === 'edit') {
    if (panelInlineEdit(id)) return;          // 悬浮窗里就地编辑(整块变成编辑器)
    const m = $floor(id);
    if (!m) return;
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    /* 直接把这一层的编辑器打开: char 层是工具条里的编辑器, user 层是行内编辑器 */
    /* ★ 楼层的界面在 shadow DOM 里, 普通 querySelector 找不到 -> 递归找 */
    const deep = () => {
      const out = [];
      const go = n => { if (n.shadowRoot) go(n.shadowRoot); for (const c of (n.children || [])) { out.push(c); go(c); } };
      go(m); return out;
    };
    const has = (e, cls) => e.classList && e.classList.contains(cls);
    const byText = (list, txt) => list.find(e => String(e.textContent || '').trim() === txt) || null;
    let els = deep();
    const big = els.find(e => has(e, 'gv-tb') && has(e, 'gv-big'));
    if (big) {
      big.click();                                        // 展开"编辑"菜单
      const pe = byText(deep().filter(e => has(e, 'gv-tb') && e.parentNode && has(e.parentNode, 'gv-popup')), '编辑');
      if (pe) { pe.click(); return; }                      // 菜单里的"编辑" -> 整块界面变编辑界面
    }
    const ub = els.find(e => has(e, 'gv-ubar-btn'));
    if (ub) {
      ub.click();                                         // 展开玩家楼层的操作区
      const ue = byText(deep().filter(e => has(e, 'gv-tb') && e.parentNode && has(e.parentNode, 'gv-ubar-actions')), '编辑');
      if (ue) ue.click();
    }
    return;
  }
  return floorAction(action, undefined, id);
}

/* ---------- 扫描 / 事件 ---------- */
function scan() {
  if (!enabled) return;
  const last = (() => { try { return getLastMessageId(); } catch (e) { return 0; } })();
  const begin = CONFIG.depth === 0 ? 0 : Math.max(0, last - CONFIG.depth);
  doc.querySelectorAll('#chat > .mes').forEach(m => {
    const id = Number(m.getAttribute('mesid'));
    if (!Number.isFinite(id)) return;
    if (id < begin) { unmount(id); return; }
    mount(id);
  });
  sweep();
  updatePanel();
}
/* 按 key 分别防抖: 用单个共享定时器会让连续事件互相取消, 吞掉楼层 */
const timers = new Map();
const later = (fn, ms, key) => {
  const k = key || 'default';
  clearTimeout(timers.get(k));
  timers.set(k, setTimeout(() => { timers.delete(k); fn(); }, ms || 240));
};
const restart = ms => { nukeAll(); later(scan, ms || 700, 'scan'); };

eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, id => later(() => mount(id), 240, 'm' + id));
eventOn(tavern_events.USER_MESSAGE_RENDERED, id => later(() => mount(id), 240, 'm' + id));
eventOn(tavern_events.MESSAGE_SWIPED, id => { unmount(id); later(() => mount(id), 240, 'm' + id); });
eventOn(tavern_events.MESSAGE_UPDATED, id => { unmount(id); later(() => mount(id), 240, 'm' + id); });
eventOn(tavern_events.MESSAGE_EDITED, id => later(() => mount(id), 300, 'm' + id));
eventOn(tavern_events.MESSAGE_DELETED, () => later(scan, 300, 'scan'));
eventOn(tavern_events.MESSAGE_RECEIVED, id => later(() => mount(id), 400, 'm' + id));
eventOn(tavern_events.CHAT_CHANGED, () => { reopenPanel(); restart(700); injectFormat(); });
eventOn(tavern_events.CHARACTER_PAGE_LOADED, () => restart(900));
eventOn(tavern_events.MORE_MESSAGES_LOADED, () => later(scan, 400, 'scan'));
eventOn(tavern_events.GENERATION_ENDED, id => later(() => mount(id), 500, 'm' + id));

const obs = new MutationObserver(() => {
  doc.querySelectorAll('#chat > .mes').forEach(m => {
    const id = Number(m.getAttribute('mesid'));
    if (!Number.isFinite(id)) return;
    const editing = !!m.querySelector('#curEditTextarea, .edit_textarea');
    const host = m.querySelector('.gv-floor-host');
    const t = m.querySelector('.mes_text');
    if (editing && handled.has(id)) {
      const app = mounted.get(id);
      if (app) { try { app.destroy(); } catch (e) {} mounted.delete(id); }
      handled.delete(id);
      m.classList.remove('gv-full');
      if (host) host.style.display = 'none';
      if (t) t.classList.remove('gv-hide');
    } else if (!editing && host && host.style.display === 'none') {
      host.style.display = '';
      later(() => mount(id), 240, 'm' + id);
    }
  });
});
obs.observe(doc.getElementById('chat') || doc.body, { childList: true, subtree: true });
setInterval(() => { if (enabled) sweep(); }, CONFIG.sweepMs);

/* ★ 活 iframe 里的卡片想"点选项填进输入框"时, 它写的是
   window.parent.document.querySelector('#send_textarea').value = ... 或 window.parent.triggerSlash(...);
   但那个 iframe 的 parent 是我们模板所在的沙箱(独立源, 拿不到酒馆) —— 引擎在它里面把 window.parent 换成了假代理,
   动作 postMessage 到最外层页面(这里)。所以真正的落笔由我们来做: 填进输入框 / 执行斜杠命令。
   (插件预览那边有一份同样的监听; 两边都用 e.__gvTHDone 标记, 只让一个执行) */
window.addEventListener('message', function (e) {
  const d = e.data;
  if (!d || d.__gvTH !== 1 || e.__gvTHDone) return;
  if (!enabled) return;                       // 这一楼没开 Galgame: 不接
  e.__gvTHDone = 1;
  try {
    if (d.fn === 'setInput') {
      const ta = doc.querySelector('#send_textarea') || doc.querySelector('textarea#send_textarea');
      if (ta) { ta.value = String(d.arg == null ? '' : d.arg); ta.dispatchEvent(new Event('input', { bubbles: true })); try { ta.focus(); } catch (e2) {} }
    } else if (d.fn === 'triggerSlash') {
      if (typeof window.triggerSlash === 'function') window.triggerSlash(String(d.arg || ''));
      else { const ta = doc.querySelector('#send_textarea'); if (ta) { ta.value = String(d.arg || ''); ta.dispatchEvent(new Event('input', { bubbles: true })); } }
    } else if (d.fn === 'toast') {
      if (typeof toastr !== 'undefined') toastr.info(String(d.arg || ''));
    }
  } catch (err) { console.warn('[gv] 选项动作失败', err); }
});

(async () => {
  try { await ensureEngine(); await loadCssText(); injectDocCss(); }
  catch (e) { if (typeof toastr !== 'undefined') toastr.error('Galgame 引擎加载失败: ' + e.message); return; }
  later(scan, 800, 'scan');
  try { P.Galgame.setSlots(CONFIG.slots); } catch (e) {}
  try { P.Galgame.setSlotPos(CONFIG.slotPos); } catch (e) {}
  try { P.Galgame.setSlotBoxes(CONFIG.slotBoxes); } catch (e) {}
  try { P.Galgame.setEffects(CONFIG.effects); } catch (e) {}
  try { P.Galgame.setBubbles({ pos: CONFIG.bubblePos, posEach: CONFIG.bubblePosEach, posSlot: CONFIG.bubblePosSlot, anim: CONFIG.bubbleAnim, ms: CONFIG.bubbleMs, css: CONFIG.bubbleCss }); } catch (e) {}
  try { P.Galgame.setAssets({ audio: CONFIG.audioMap, se: CONFIG.seMap }); } catch (e) {}
  try { P.Galgame.setTemplates(CONFIG.pages); } catch (e) {}
  injectFormat();   // 格式提示词由脚本注入, 不再写在角色卡里
  restorePack().then(function (ok) { if (ok) later(scan, 300, 'scan'); });   // 之前导过素材包就直接恢复
  if (typeof appendInexistentScriptButtons === 'function') {
    appendInexistentScriptButtons([{ name: '重绘Galgame', visible: true }, { name: 'Galgame开关', visible: true }, { name: '格式转换', visible: true }]);
    eventOn(getButtonEvent('重绘Galgame'), () => { nukeAll(); ensureEngine().then(() => later(scan, 250, 'scan')); if (typeof toastr !== 'undefined') toastr.success('已重绘'); });
    eventOn(getButtonEvent('Galgame开关'), () => {
      enabled = !enabled;
      if (enabled) { later(scan, 250, 'scan'); if (typeof toastr !== 'undefined') toastr.success('Galgame 已开启'); }
      else { nukeAll(); updatePanel(); if (typeof toastr !== 'undefined') toastr.info('Galgame 已关闭'); }
    });
    eventOn(getButtonEvent('格式转换'), () => {
      CONFIG.convert.enabled = !CONFIG.convert.enabled;
      if (typeof toastr !== 'undefined') toastr.info('API 层格式转换: ' + (CONFIG.convert.enabled ? '开' : '关'));
      if (CONFIG.convert.enabled) later(scan, 200, 'scan');
    });
  }
})();
