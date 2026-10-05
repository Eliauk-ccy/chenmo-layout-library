import fs from 'node:fs';
import path from 'node:path';
const argv = process.argv.slice(2);
const opts = { style: 'CM-01', kicker: '读书随笔', author: '尘墨notes', meta: '', subtitle: '', tags: '' };
for (let i = 0; i < argv.length; i++) {
const a = argv[i];
if (a === '--input') opts.input = argv[++i];
else if (a === '--output') opts.output = argv[++i];
else if (a === '--style') opts.style = argv[++i];
else if (a === '--kicker') opts.kicker = argv[++i];
else if (a === '--author') opts.author = argv[++i];
else if (a === '--meta') opts.meta = argv[++i];
else if (a === '--subtitle') opts.subtitle = argv[++i];
else if (a === '--tags') opts.tags = argv[++i];
else if (a === '--help') opts.help = true;
}
if (opts.help || !opts.input || !opts.output) {
console.log('用法: node build_article.mjs --input article.md --style CM-01 --output article.html');
console.log('可选: --subtitle 副标题 --kicker 栏目 --author 作者 --meta 右侧信息 --tags 标签1,标签2');
process.exit(opts.help ? 0 : 1);
}
const styleAliases = { 'CM-01': 'CM-01', 'paper-prose': 'CM-01', '纸书散文风': 'CM-01', 'CM-02': 'CM-02', 'magazine-column': 'CM-02', '杂志专栏风': 'CM-02', 'CM-03': 'CM-03', 'warm-life': 'CM-03', '温暖生活感': 'CM-03', 'CM-04': 'CM-04', 'minimal-manuscript': 'CM-04', '极简原稿风': 'CM-04' };
const styleCode = styleAliases[opts.style];
if (!styleCode) throw new Error('未知风格: ' + opts.style);
const L = (s) => '<span leaf="">' + s + '</span>';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function cleanText(s) {
return String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
}
function inline(text, boldStyle = 'font-weight:700;') {
const parts = cleanText(text).split('**');
return parts.map((part, i) => {
const t = esc(part);
if (!t) return '';
return i % 2 ? '<strong style="' + boldStyle + '">' + L(t) + '</strong>' : L(t);
}).join('');
}
function dropInline(text, color, size) {
const t = cleanText(text);
if (!t) return '';
const first = Array.from(t)[0];
const rest = Array.from(t).slice(1).join('');
return '<span style="font-size:' + size + 'px;line-height:0.95;color:' + color + ';font-weight:800;">' + L(esc(first)) + '</span>' + inline(rest);
}
const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function cn(n) {
if (n <= 10) return n === 10 ? '十' : CN_DIGITS[n];
if (n < 20) return '十' + CN_DIGITS[n - 10];
const tens = Math.floor(n / 10);
const ones = n % 10;
return CN_DIGITS[tens] + '十' + (ones ? CN_DIGITS[ones] : '');
}
function parseHeading(text) {
const t = cleanText(text);
if (t === '写在最后' || t === '结语' || t === '尾声') return { kind: 'final', title: t, num: null };
const m = t.match(/^(\d{1,2})[\s、.．:：-]*(.*)$/);
if (m) return { kind: 'chapter', num: parseInt(m[1], 10), title: m[2] || '' };
const m2 = t.match(/^第([一二三四五六七八九十]+)[章节句][\s、.．:：-]*(.*)$/);
if (m2) return { kind: 'chapter', num: null, cnLabel: m2[1], title: m2[2] || '' };
return { kind: 'chapter', num: null, title: t };
}
function parseMarkdown(md) {
const lines = md.replace(/\r\n/g, '\n').split('\n');
const doc = { title: '未命名文章', blocks: [] };
let i = 0;
let titleDone = false;
while (i < lines.length) {
const raw = lines[i];
const line = raw.trim();
if (!line || line === '---' || line === '***') { i++; continue; }
if (line.startsWith('# ') && !titleDone && doc.blocks.length === 0) {
doc.title = cleanText(line.slice(2));
titleDone = true;
i++;
continue;
}
if (line.startsWith('## ')) {
doc.blocks.push({ type: 'heading', ...parseHeading(line.slice(3)) });
i++;
continue;
}
if (line.startsWith('### ')) {
doc.blocks.push({ type: 'subheading', title: cleanText(line.slice(4)) });
i++;
continue;
}
if (line.startsWith('>')) {
const q = [];
while (i < lines.length && lines[i].trim().startsWith('>')) {
q.push(lines[i].trim().replace(/^>\s?/, ''));
i++;
}
doc.blocks.push({ type: 'quote', text: cleanText(q.join('')) });
continue;
}
const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
if (img) {
doc.blocks.push({ type: 'image', alt: cleanText(img[1]), src: img[2] });
i++;
continue;
}
if (line.startsWith('IMAGE-PLACEHOLDER')) {
doc.blocks.push({ type: 'image', alt: cleanText(line.replace(/^IMAGE-PLACEHOLDER-?\d*\s*/, '')), src: '' });
i++;
continue;
}
const p = [line];
i++;
while (i < lines.length) {
const next = lines[i].trim();
if (!next || next.startsWith('#') || next.startsWith('>') || next.startsWith('![') || next.startsWith('IMAGE-PLACEHOLDER') || next === '---' || next === '***') break;
p.push(next);
i++;
}
const text = cleanText(p.join(''));
const prev = doc.blocks[doc.blocks.length - 1];
if (text.startsWith('——') && prev && prev.type === 'quote') doc.blocks.push({ type: 'attribution', text });
else doc.blocks.push({ type: 'paragraph', text });
}
return doc;
}
function tagsArray() {
return opts.tags ? opts.tags.split(',').map((s) => s.trim()).filter(Boolean) : [];
}
function header01(doc) {
let h = '<section style="max-width:677px;margin:0 auto;background:#fbf7ed;color:#403a30;font-family:\'Songti SC\',\'STSong\',\'Noto Serif CJK SC\',\'SimSun\',serif;line-height:1.9;letter-spacing:0.6px;padding:38px 30px 42px;box-sizing:border-box;">';
h += '<section style="text-align:center;margin-bottom:28px;"><p style="margin:0 0 14px;font-size:11px;letter-spacing:5px;color:#9a8d76;">' + L(esc(opts.author + ' · ' + opts.kicker)) + '</p><span style="display:inline-block;width:34px;height:34px;line-height:34px;background:#a33b32;color:#fff8ec;font-size:18px;font-weight:700;border-radius:3px;">' + L('墨') + '</span></section>';
h += '<h1 style="font-size:27px;line-height:1.45;font-weight:700;text-align:center;color:#2f2a23;margin:0 0 16px;letter-spacing:1px;">' + inline(doc.title) + '</h1>';
if (opts.subtitle) h += '<p style="text-align:center;font-size:13px;color:#8a7c66;margin:0 0 28px;">' + inline(opts.subtitle) + '</p>';
h += '<section style="height:1px;background:#d8c9ab;margin:0 38px 30px;">' + L('<br>') + '</section>';
return h;
}
function block01(block, state) {
if (block.type === 'paragraph') {
state.para++;
if (state.para === 1 && state.beforeHeading) return '<p style="font-size:16px;margin:0 0 18px;text-align:justify;">' + dropInline(block.text, '#a33b32', 34) + '</p>';
return '<p style="font-size:16px;margin:0 0 18px;text-align:justify;text-indent:2em;">' + inline(block.text) + '</p>';
}
if (block.type === 'subheading') return '<p style="font-size:17px;font-weight:700;color:#2f2a23;margin:26px 0 14px;">' + inline(block.title) + '</p>';
if (block.type === 'heading') {
state.beforeHeading = false;
if (block.kind === 'final') return '<section style="text-align:center;margin-top:36px;"><p style="color:#a33b32;font-size:15px;margin:0 0 8px;">' + L('❦') + '</p><p style="font-size:20px;font-weight:700;letter-spacing:4px;color:#2f2a23;margin:0 0 22px;">' + inline(block.title) + '</p></section>';
state.chapter++;
const label = block.cnLabel || cn(block.num || state.chapter);
let h = '<section style="text-align:center;margin:34px 0 24px;"><span style="display:inline-block;border:1px solid #a33b32;color:#a33b32;width:30px;height:30px;line-height:30px;border-radius:50%;font-size:15px;margin-bottom:10px;">' + L(esc(label)) + '</span>';
if (block.title) h += '<p style="font-size:20px;font-weight:700;letter-spacing:4px;color:#2f2a23;margin:0;">' + inline(block.title) + '</p>';
h += '</section>';
return h;
}
if (block.type === 'quote') return '<section style="border-top:1px solid #d8c9ab;border-bottom:1px solid #d8c9ab;padding:22px 18px;margin:0 0 14px;text-align:center;"><p style="font-size:19px;line-height:1.8;color:#5d342c;margin:0;font-weight:700;">' + L('「') + inline(block.text, 'font-weight:700;color:#5d342c;') + L('」') + '</p></section>';
if (block.type === 'attribution') return '<p style="font-size:13px;color:#8a7c66;text-align:right;margin:0 0 26px;">' + inline(block.text) + '</p>';
if (block.type === 'image') return imageBlock(block, 'border:1px solid #d8c9ab;padding:10px;background:#fffdf6;', 'background:linear-gradient(135deg,#ddd0b6,#f4ead3);color:#8a7c66;', '#9a8d76', '图注：');
return '';
}
function header02(doc) {
let h = '<section style="max-width:677px;margin:0 auto;background:#ffffff;color:#222222;font-family:\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;line-height:1.85;letter-spacing:0.3px;padding:30px 28px 40px;box-sizing:border-box;">';
h += '<section style="border-top:5px solid #7d2434;padding-top:18px;margin-bottom:26px;"><p style="font-size:11px;letter-spacing:4px;color:#7d2434;font-weight:700;margin:0 0 12px;">' + L(esc('COLUMN · ' + opts.kicker)) + '</p>';
h += '<h1 style="font-size:31px;line-height:1.3;font-weight:900;color:#151515;margin:0 0 14px;">' + inline(doc.title) + '</h1>';
if (opts.subtitle) h += '<p style="font-size:15px;line-height:1.8;color:#666666;margin:0 0 18px;">' + inline(opts.subtitle) + '</p>';
h += '<section style="display:flex;justify-content:space-between;border-top:1px solid #e5e0dc;border-bottom:1px solid #e5e0dc;padding:9px 0;font-size:11px;color:#99918c;"><span>' + L(esc('文 / ' + opts.author)) + '</span><span>' + L(esc(opts.meta || opts.kicker)) + '</span></section></section>';
return h;
}
function block02(block, state) {
if (block.type === 'paragraph') {
state.para++;
if (state.para === 1 && state.beforeHeading) return '<p style="font-size:16px;margin:0 0 18px;text-align:justify;">' + dropInline(block.text, '#7d2434', 38) + '</p>';
if (state.para === 3 && state.beforeHeading) return '<section style="background:#f7f3f1;border-left:4px solid #7d2434;padding:18px 20px;margin:24px 0 30px;"><p style="font-size:15px;line-height:1.85;color:#4c4340;margin:0;">' + inline(block.text) + '</p></section>';
return '<p style="font-size:16px;margin:0 0 18px;text-align:justify;">' + inline(block.text) + '</p>';
}
if (block.type === 'subheading') return '<p style="font-size:17px;font-weight:800;color:#151515;margin:26px 0 14px;padding-left:10px;border-left:3px solid #7d2434;">' + inline(block.title) + '</p>';
if (block.type === 'heading') {
state.beforeHeading = false;
if (block.kind === 'final') return '<section style="display:flex;align-items:flex-end;gap:16px;margin:36px 0 22px;"><p style="font-size:44px;line-height:0.9;font-weight:900;color:#e8ded9;margin:0;">' + L('∞') + '</p><section><p style="font-size:10px;letter-spacing:3px;color:#7d2434;font-weight:700;margin:0 0 3px;">' + L('THE END') + '</p><h2 style="font-size:22px;line-height:1.35;color:#151515;margin:0;">' + inline(block.title) + '</h2></section></section>';
state.chapter++;
const num = String(block.num || state.chapter).padStart(2, '0');
let h = '<section style="display:flex;align-items:flex-end;gap:16px;margin:36px 0 22px;"><p style="font-size:44px;line-height:0.9;font-weight:900;color:#e8ded9;margin:0;">' + L(esc(num)) + '</p><section><p style="font-size:10px;letter-spacing:3px;color:#7d2434;font-weight:700;margin:0 0 3px;">' + L('PART ' + esc(num)) + '</p>';
if (block.title) h += '<h2 style="font-size:22px;line-height:1.35;color:#151515;margin:0;">' + inline(block.title) + '</h2>';
h += '</section></section>';
return h;
}
if (block.type === 'quote') return '<section style="text-align:center;padding:8px 24px 10px;"><p style="font-size:42px;line-height:0.5;color:#7d2434;margin:0 0 16px;">' + L('“') + '</p><p style="font-size:20px;line-height:1.75;font-weight:800;color:#2b2321;margin:0;">' + inline(block.text, 'font-weight:800;color:#2b2321;') + '</p></section>';
if (block.type === 'attribution') return '<p style="font-size:13px;color:#99918c;text-align:right;margin:0 0 26px;">' + inline(block.text) + '</p>';
if (block.type === 'image') return imageBlock(block, '', 'background:linear-gradient(120deg,#3c3432,#7d2434);color:rgba(255,255,255,0.88);', '#99918c', '图注 / ');
return '';
}
function header03(doc) {
const tags = tagsArray();
let h = '<section style="max-width:677px;margin:0 auto;background:#fffaf3;color:#50463c;font-family:\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;line-height:1.85;letter-spacing:0.4px;padding:28px 24px 38px;box-sizing:border-box;">';
h += '<section style="background:#ffffff;border-radius:22px;padding:28px 24px 24px;box-shadow:0 10px 30px rgba(146,105,66,0.10);margin-bottom:24px;">';
if (tags.length) {
h += '<section style="display:flex;gap:8px;margin-bottom:18px;">';
const colors = [['#f3dfc9', '#96643a'], ['#e5ecd9', '#68784f']];
tags.slice(0, 2).forEach((tag, i) => { h += '<span style="background:' + colors[i % 2][0] + ';color:' + colors[i % 2][1] + ';font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;">' + L(esc(tag)) + '</span>'; });
h += '</section>';
}
h += '<h1 style="font-size:27px;line-height:1.4;font-weight:800;color:#3e342b;margin:0 0 12px;">' + inline(doc.title) + '</h1>';
if (opts.subtitle) h += '<p style="font-size:15px;line-height:1.85;color:#887a6b;margin:0;">' + inline(opts.subtitle) + '</p>';
h += '</section>';
return h;
}
function block03(block, state) {
if (block.type === 'paragraph') {
state.para++;
return '<section style="padding:0 6px;"><p style="font-size:16px;margin:0 0 18px;text-align:justify;">' + inline(block.text) + '</p></section>';
}
if (block.type === 'subheading') return '<p style="font-size:17px;font-weight:800;color:#3e342b;margin:26px 6px 14px;">' + inline(block.title) + '</p>';
if (block.type === 'heading') {
state.beforeHeading = false;
if (block.kind === 'final') return '<section style="display:flex;align-items:center;gap:12px;margin:26px 6px 20px;"><span style="background:#68784f;color:#ffffff;font-size:12px;font-weight:800;padding:7px 12px;border-radius:999px;">' + L('写在最后') + '</span></section>';
state.chapter++;
const label = '第' + (block.cnLabel || cn(block.num || state.chapter)) + '节';
let h = '<section style="display:flex;align-items:center;gap:12px;margin:26px 6px 20px;"><span style="background:#68784f;color:#ffffff;font-size:12px;font-weight:800;padding:7px 12px;border-radius:999px;">' + L(esc(label)) + '</span>';
if (block.title) h += '<h2 style="font-size:21px;color:#3e342b;margin:0;">' + inline(block.title) + '</h2>';
h += '</section>';
return h;
}
if (block.type === 'quote') return '<section style="background:#ffffff;border:1px solid #f0dfca;border-radius:18px;padding:24px 22px;box-shadow:0 6px 18px rgba(146,105,66,0.07);margin-bottom:14px;text-align:center;"><p style="font-size:20px;line-height:1.8;font-weight:800;color:#76553a;margin:0;">' + L('「') + inline(block.text, 'font-weight:800;color:#76553a;') + L('」') + '</p></section>';
if (block.type === 'attribution') return '<p style="font-size:13px;color:#a08f7d;text-align:right;margin:0 6px 26px;">' + inline(block.text) + '</p>';
if (block.type === 'image') return imageBlock(block, 'border-radius:18px;', 'background:#e9e3d4;color:#7c705e;border-radius:18px;', '#a08f7d', '');
return '';
}
function header04(doc) {
let h = '<section style="max-width:677px;margin:0 auto;background:#ffffff;color:#333333;font-family:Georgia,\'Times New Roman\',\'Songti SC\',\'STSong\',serif;line-height:2;letter-spacing:0.2px;padding:34px 30px 42px;box-sizing:border-box;">';
h += '<p style="font-size:12px;color:#999999;margin:0 0 42px;">' + L(esc(opts.author + ' / ' + opts.kicker)) + '</p>';
h += '<h1 style="font-size:28px;line-height:1.5;font-weight:700;color:#111111;margin:0 0 14px;">' + inline(doc.title) + '</h1>';
if (opts.subtitle) h += '<p style="font-size:13px;color:#999999;margin:0 0 34px;">' + inline(opts.subtitle) + '</p>';
h += '<section style="height:1px;background:#111111;margin:0 0 34px;">' + L('<br>') + '</section>';
return h;
}
function block04(block, state) {
if (block.type === 'paragraph') {
state.para++;
return '<p style="font-size:16px;margin:0 0 20px;text-align:justify;text-indent:2em;">' + inline(block.text) + '</p>';
}
if (block.type === 'subheading') return '<p style="font-size:17px;font-weight:700;color:#111111;margin:28px 0 14px;">' + inline(block.title) + '</p>';
if (block.type === 'heading') {
state.beforeHeading = false;
if (block.kind === 'final') return '<section style="height:1px;background:#dddddd;margin:36px 0 24px;">' + L('<br>') + '</section><h2 style="font-size:21px;font-weight:700;color:#111111;margin:0 0 26px;">' + inline(block.title) + '</h2>';
state.chapter++;
const label = block.cnLabel || cn(block.num || state.chapter);
let h = '<p style="font-size:13px;letter-spacing:4px;color:#999999;margin:30px 0 8px;">' + L(esc(label)) + '</p>';
if (block.title) h += '<h2 style="font-size:21px;font-weight:700;color:#111111;margin:0 0 26px;">' + inline(block.title) + '</h2>';
return h;
}
if (block.type === 'quote') return '<section style="border-left:2px solid #111111;padding:2px 0 2px 20px;margin:0 0 14px;"><p style="font-size:18px;line-height:1.9;color:#111111;margin:0;">' + inline(block.text) + '</p></section>';
if (block.type === 'attribution') return '<p style="font-size:13px;color:#999999;text-align:right;margin:0 0 28px;">' + inline(block.text) + '</p>';
if (block.type === 'image') return imageBlock(block, 'border:1px solid #dddddd;', 'color:#aaaaaa;', '#999999', '');
return '';
}
function imageBlock(block, frameStyle, placeholderStyle, captionColor, captionPrefix) {
const label = block.alt || '文中配图';
let h = '';
if (block.src) {
h += '<section style="margin:0 0 8px;' + frameStyle + '"><span leaf=""><img src="' + esc(block.src) + '" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section>';
} else {
h += '<section style="margin:0 0 8px;' + frameStyle + '"><section style="height:160px;display:flex;align-items:center;justify-content:center;font-size:13px;letter-spacing:1px;' + placeholderStyle + '">' + L(esc('文中图位置 · ' + label)) + '</section></section>';
}
if (block.alt) h += '<p style="font-size:12px;color:' + captionColor + ';text-align:center;margin:0 0 30px;">' + inline(captionPrefix + block.alt) + '</p>';
return h;
}
function footer(style) {
if (style === 'CM-01') return '<section style="text-align:center;margin-top:34px;"><p style="font-size:12px;color:#9a8d76;letter-spacing:3px;margin:0;">' + L(esc(opts.author)) + '</p></section></section>';
if (style === 'CM-02') return '<section style="border-top:1px solid #e5e0dc;margin-top:30px;padding-top:16px;"><p style="font-size:12px;color:#99918c;margin:0;">' + L('—— 本篇完 ——') + '</p></section></section>';
if (style === 'CM-03') return '<section style="text-align:center;margin-top:28px;"><p style="font-size:12px;color:#a08f7d;letter-spacing:3px;margin:0;">' + L(esc(opts.author + ' · 慢慢来')) + '</p></section></section>';
return '<section style="height:1px;background:#dddddd;margin:34px 0 18px;">' + L('<br>') + '</section><p style="font-size:12px;color:#999999;margin:0;">' + L(esc(opts.author)) + '</p></section>';
}
const md = fs.readFileSync(path.resolve(opts.input), 'utf8');
const doc = parseMarkdown(md);
const state = { para: 0, chapter: 0, beforeHeading: true };
let html = '';
if (styleCode === 'CM-01') html = header01(doc) + doc.blocks.map((b) => block01(b, state)).join('') + footer(styleCode);
if (styleCode === 'CM-02') html = header02(doc) + doc.blocks.map((b) => block02(b, state)).join('') + footer(styleCode);
if (styleCode === 'CM-03') html = header03(doc) + doc.blocks.map((b) => block03(b, state)).join('') + footer(styleCode);
if (styleCode === 'CM-04') html = header04(doc) + doc.blocks.map((b) => block04(b, state)).join('') + footer(styleCode);
fs.mkdirSync(path.dirname(path.resolve(opts.output)), { recursive: true });
fs.writeFileSync(path.resolve(opts.output), html + '\n', 'utf8');
console.log('已生成 ' + opts.output + '，风格 ' + styleCode + '，字符 ' + html.length);
