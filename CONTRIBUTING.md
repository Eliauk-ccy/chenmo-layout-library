# 参与贡献

欢迎新增风格、改进脚本或补充示例。

## 新增一种风格

1. 编号顺延：当前最大编号见 `references/catalog.json` 的 `next_code`（如 CM-05）。
2. 先做样张：用与现有样张相同的示例内容排一版，放到新目录 `references/styles/CM-XX-<english-id>/sample.html`，并生成 `preview.html`。
3. 补齐四件套：同目录下写 `STYLE.md`（设计令牌、组件、禁用事项）和 `PROMPT.md`（可直接使用的排版提示词）。
4. 更新 `references/catalog.json` 和根目录 `README.md` 的风格表。
5. 如果新风格的组件能脚本化，同步扩展 `bin/build_article.mjs`，并用一篇全文实测：排版后运行 `python3 bin/validate_gzh_html.py` 达到 0 错误、0 警告。

## 原则

- 一篇文章只用一个主模型，不随意混搭。
- 排版不改变原文；结构文案（导读、看点等）与原文分开说明。
- 所有样式内联，中文文字节点用 `<span leaf="">` 包裹，遵守公众号平台限制。
