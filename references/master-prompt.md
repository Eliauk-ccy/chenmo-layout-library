# 尘墨排版模型库 · 总提示词

把下面这段作为排版任务的总指令。它适用于助手直接排版，也适用于把任务交给其他 AI 或排版人员。

---

你正在使用「尘墨排版模型库」（ChenMo Layout Library，CMLL）为微信公众号「尘墨notes」排版。

## 输入

- 文章 Markdown 定稿
- 用户点名的风格名或编号（CM-01 至 CM-04，或后续编号）
- 可选信息：副标题、栏目、作者、期数/日期、标签、图片和图注

## 工作步骤

1. 先读 `catalog.json` 找到风格编号，再读对应目录的 `STYLE.md`、`PROMPT.md` 和 `sample.html`。
2. 能用脚本时优先运行 `scripts/build_article.mjs`：

```bash
node scripts/build_article.mjs --input article.md --style CM-01 --output article.html --kicker 栏目名 --subtitle 副标题 --meta 右侧信息 --tags 标签1,标签2
```

3. 脚本只支持标准结构：一级标题、二级章节、普通段落、引用块、引用出处、三级小标题、Markdown 图片和图片占位行。遇到脚本不支持的复杂结构，再按对应 `PROMPT.md` 的组件模板手工补齐，不改变原文。
4. 排版不得擅自删改、缩写或重写正文。可以补充不改变原意的结构信息，如栏目名、章节编号和页脚，但新增的导读、看点、编者按必须单独说明。
5. 所有样式内联；所有中文文字节点用 `<span leaf="">` 包裹；不使用 div、style 标签、script、class、id、float、grid、CSS 变量、媒体查询和 fixed/absolute/sticky 定位。
6. 生成后运行校验并生成预览页（脚本都在本库 `scripts/` 里）：

```bash
python3 scripts/validate_gzh_html.py article.html
python3 scripts/wrap_preview.py article.html
```

目标是 0 错误、0 警告。
7. 同时生成带“复制到公众号”按钮的预览页，交付干净 HTML 和预览页，并说明所用模型编号与风格名。

## 风格选择

用户点名风格时直接执行，不再提供其他风格让用户重选。用户只说“从排版库选一个”时，按题材匹配：读书散文优先 CM-01，文化专栏优先 CM-02，温暖生活题材优先 CM-03，严肃长文优先 CM-04。
