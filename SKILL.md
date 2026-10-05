---
name: "chenmo_layout_library"
description: "Use when the user asks to typeset a WeChat Official Account article with the ChenMo Layout Library （尘墨排版模型库）, names a style such as 纸书散文风/杂志专栏风/温暖生活感/极简原稿风， or gives a code CM-01 to CM-04. Converts Markdown into validated, paste-ready WeChat HTML in that exact style."
---

# 尘墨排版模型库 ChenMo Layout Library

## Purpose
把 Markdown 文章按「尘墨排版模型库」的指定模型排成可直接粘贴到微信公众号编辑器的 HTML，并生成可预览、可复制的预览页。

## Workflow
1. 从用户的话里确定模型：纸书散文风=CM-01，杂志专栏风=CM-02，温暖生活感=CM-03，极简原稿风=CM-04。用户点名后直接执行，不再推荐其他风格。
2. 读 `references/catalog.json` 确认模型，再读对应 `references/styles/<目录>/STYLE.md` 与 `PROMPT.md`，需要对照视觉时打开同目录 `sample.html`。
3. 优先用脚本排版（路径相对于本 skill 目录）：

```bash
node bin/build_article.mjs --input article.md --style CM-01 --output article.html --kicker 栏目名 --subtitle 副标题 --meta 右侧信息 --tags 标签1,标签2
```

4. 脚本不支持的复杂结构，按对应 `PROMPT.md` 的组件规则手工补齐；不得删改、缩写或重写原文。新增导读、看点、编者按等结构文案时要向用户说明。
5. 校验并生成预览页：

```bash
python3 bin/validate_gzh_html.py article.html
python3 bin/wrap_preview.py article.html
```

目标：0 错误、0 警告。预览页文件名是原文件名加 `_预览.html`。
6. 交付干净 HTML 和预览页，并注明模型编号和风格名。

## Output Contract
- 一份全内联样式的公众号 HTML（正文片段，不带 html/head 外壳）。
- 一份带一键复制按钮的预览 HTML。
- 一句说明：所用模型、校验结果、图片是真实图片还是占位。

## Operating Rules
1. 所有中文文字节点必须用 `<span leaf="">` 包裹；不用 div、style/script 标签、class、id、float、grid、CSS 变量、媒体查询和 fixed/absolute/sticky 定位。
2. 一篇文章只用一个主模型；用户明确要求混搭时记录来源和位置。
3. 图片只放进模型规定的图片位置，不改比例和内容；没有真实图片时保留占位并明说。
4. 新增模型从 CM-05 起编号，先做同内容样张经用户确认，再补齐 STYLE.md、PROMPT.md、sample.html、preview.html 并更新 catalog。
5. `bin/validate_gzh_html.py` 与 `bin/wrap_preview.py` 来自开源项目 gzh-design-skill（AGPL），许可证见 `references/third-party-license-gzh-design-skill.txt`；其余内容为本库自有。
