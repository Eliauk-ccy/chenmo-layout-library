# 尘墨排版模型库 · ChenMo Layout Library

一套为微信公众号长文准备的中文排版模型库：把 Markdown 一键排成可直接粘贴到公众号编辑器的 HTML。内置 4 种原创风格、每种风格的设计规则与提示词、一个零依赖的排版脚本，以及公众号合规校验和一键复制预览页生成。

> A WeChat Official Account layout library for Chinese long-form articles: Markdown in, paste-ready HTML out. Ships with 4 original styles, per-style design rules and prompts, a zero-dependency typesetting script, a compliance validator, and a one-click-copy preview generator.

## 内置风格

| 编号 | 风格 | 气质 | 适合题材 |
|---|---|---|---|
| CM-01 | 纸书散文风 | 米白纸面、宋体、朱砂点缀 | 读书笔记、散文、人物故事 |
| CM-02 | 杂志专栏风 | 刊头醒目、编辑部气质 | 文化专栏、人物特稿、观点长文 |
| CM-03 | 温暖生活感 | 暖色、柔和、圆角轻卡片 | 生活随笔、情感、治愈内容 |
| CM-04 | 极简原稿风 | 黑白灰、无卡片、只靠留白 | 严肃随笔、长文、评论 |

每种风格的样张在 `references/styles/<编号-风格>/sample.html`，浏览器预览在同目录 `preview.html`。

## 快速开始

环境要求：Node.js（排版脚本）、Python 3（校验与预览脚本），无需联网、无第三方依赖。

```bash
# 1. Markdown 排成指定风格的公众号 HTML
node bin/build_article.mjs --input article.md --style CM-01 --output article.html

# 可选参数：--subtitle 副标题 --kicker 栏目 --author 作者 --meta 右侧信息 --tags 标签1,标签2
# --style 可传编号、中文名或英文 ID，如 CM-01 / 纸书散文风 / paper-prose

# 2. 公众号合规校验（目标：0 错误、0 警告）
python3 bin/validate_gzh_html.py article.html

# 3. 生成带“一键复制到公众号”按钮的预览页
python3 bin/wrap_preview.py article.html
```

支持的 Markdown 结构：一级标题、二级章节（纯数字 / 数字+标题 / 中文数字 / 写在最后）、三级小标题、普通段落、引用块、紧跟引用的出处段落、图片与图片占位行、`**加粗**`。

`examples/` 里有一篇完整示例文章和它用 CM-01、CM-03 生成的成品 HTML。

## 作为 AI Skill 使用

本仓库根目录就是一个完整的 Skill：把整个文件夹放进你的 Agent 的 skills 目录，然后说“用纸书散文风排版这篇”或“用 CM-02 排”，Agent 会按 `SKILL.md` 自动完成排版、校验和预览生成。不用 Skill 的环境也可以：把 `references/master-prompt.md` 加对应风格目录里的 `PROMPT.md`、`STYLE.md` 和文章一起交给任意 AI 工具。

## 目录结构

```text
SKILL.md            Skill 入口指令
bin/                排版、校验、预览脚本（零依赖）
assets/             预览页模板
references/         模型目录 catalog、各风格的 STYLE/PROMPT/样张/预览
examples/           示例文章与成品
```

## 新增一种风格

新风格从 CM-05 起顺序编号，规则见 `CONTRIBUTING.md`：先用同一段示例内容做样张，再补齐设计规则、提示词和样张四件套。

## 许可证

- 本库原创内容（风格、提示词、`bin/build_article.mjs`、文档）使用 **MIT License**，见 `LICENSE`。
- `bin/validate_gzh_html.py`、`bin/wrap_preview.py` 与 `assets/preview-template.html` 来自开源项目 [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill)，遵循其 **AGPL** 许可证，见 `THIRD-PARTY-NOTICES.md` 与 `references/third-party-license-gzh-design-skill.txt`。

## 致谢

校验与预览脚本来自 gzh-design-skill；本库的四种风格为独立原创设计，与该项目的内置主题无关。
