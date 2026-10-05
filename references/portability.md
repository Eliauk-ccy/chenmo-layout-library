# 迁移与封装说明

这套内容有三种带走方式，按目标平台选一种。

## 方式一：封装成 Skill（推荐，适合 Muse 和支持 Skill 的 Agent）

现成成品：`workspace/skills/chenmo-layout-library/`，打包文件 `chenmo-layout-library-skill-v1.1.zip`。

迁移步骤：

1. 把 ZIP 解压到目标环境的 skills 目录，保持 `chenmo-layout-library/` 这一层文件夹完整。
2. 在新环境里说“用纸书散文风排版这篇”或“用 CM-02 排版”，Agent 会读 SKILL.md 自动执行。
3. 依赖只有 Node.js（跑排版脚本）和 Python 3（跑校验/预览脚本），不需要联网和账号。

Skill 包是自包含的：SKILL.md 是入口指令，references/ 放模型规则、提示词和样张，bin/ 放排版、校验、预览三个脚本。

## 方式二：普通文件夹带走（适合任何 AI 工具或人工排版）

打包文件：`chenmo-layout-library-v1.1.zip`，就是模型库原目录。

- 给 AI 用：把 `PROMPT.md`（总提示词）+ 对应风格目录的 `PROMPT.md` 和 `STYLE.md` + 文章一起发给它。
- 自己跑脚本：解压后在目录内执行 `node scripts/build_article.mjs --input 文章.md --style CM-01 --output 成品.html`。
- 人工排版：照各风格 `sample.html` 的成品效果和 `STYLE.md` 的规则仿排。

## 方式三：只带提示词（最轻，适合临时用一次）

只复制总提示词 `PROMPT.md` 和某一个风格的 `PROMPT.md`，粘贴到任意 AI 对话里，再贴文章。缺点是没有脚本和样张兜底，排版精度和校验要靠对方模型自觉，不如前两种稳。

## 注意

- 模型库本体（风格、提示词、脚本、样张）可以自由带走；校验和预览脚本来自开源项目 gzh-design-skill（AGPL 许可证），随包附了许可证文件，对外公开分发时保留它。
- 带走后两边是两个独立副本：在一边新增的 CM-05 等新风格不会自动同步到另一边，需要手动拷过去或重新打包。
