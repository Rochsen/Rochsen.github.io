---
title: 整理个人使用的skill
order: 4
category: [AI]
tag: [skill]
date: 2026-11-09

---

<!-- more -->

本机个人 Agent Skills 主目录是 `C:\Users\10291\.agents\skills\`，该目录仍有 **48** 个 skill（均有 `SKILL.md`）。下文一至四节按 **Agently / Firecrawl / Vue / 其他** 整理这 48 个；第五节补录本机其他位置、且**未收录于** `.agents\skills` 的 skill（另计 **28** 个：Cursor 个人独有 2 + Cursor 内置 `skills-cursor` 26）。同名联接/副本（如 `.cursor\skills`、`.copilot\skills`、`.claude\skills` 里的 firecrawl 或 junction）不当作新 skill 展开，只在对应小节说明路径关系。内容均从各处 `SKILL.md` 提取；未写安装命令的，按本机约定记为「已位于本地目录，由 Agent Skills 规范被工具发现」，并可用 `local-skill-location` 给 Cursor 建目录联接。

## 通用安装约定

本机个人 skill 的标准落点见 `local-skill-location`：

1. 正文放在 `C:\Users\10291\.agents\skills\<skill-name>\`（必须含 `SKILL.md`）
2. 为 Cursor 建立联接：

```powershell
New-Item -ItemType Junction -Path "C:\Users\10291\.cursor\skills\<skill-name>" -Target "C:\Users\10291\.agents\skills\<skill-name>"
```

生态内公开 skill 常用 Skills CLI：

```bash
npx skills find [query]
npx skills add <owner/repo@skill> -g -y
npx skills update
```

浏览目录：<https://skills.sh/>

---

## 一、Agently 系列（7）

面向 Agently 框架的产品行为路由、请求契约、运行时扩展、编排与迁移。文档普遍未写独立安装命令，当前均在 `C:\Users\10291\.agents\skills\agently*`。

### agently

- **作用**：当「模型驱动的产品 / 助手 / 自动化 / 评测 / 工作流」还需要选定正确的 Agently owner、执行形态或项目边界时作为入口；也覆盖低频的 TaskDAG / DynamicTask。请求不必点名 Agently。
- **安装**：已位于本地 `~/.agents/skills/agently`，按 Agent Skills 规范被工具发现。
- **用法示例**：先把需求压成目标、输入输出、副作用与生命周期，再按 owner 分流——单次请求族用 `agently-request`，跨节点设计用 `agently-design`，运行时扩展用 `agently-runtime`，本地 Stage 用 `agently-stage`，可见多阶段编排用 `agently-triggerflow`，从 LangChain 等迁移用 `agently-migration`。

### agently-design

- **作用**：设计、理解、调优或审计非平凡模型工作流：模型节点职责、输入输出完整性、数据流对错/冗余、Model vs Host 归属、拓扑、证据、生命周期、并发与观测效果。不必说「Prompt review」。
- **安装**：已位于本地 `~/.agents/skills/agently-design`。
- **用法示例**：跨 owner 的架构与交接契约评审；单请求族细节交给 `agently-request`，已定可执行编排细节交给 `agently-triggerflow`。

### agently-migration

- **作用**：把已有 LangChain / LangGraph / LlamaIndex / CrewAI 系统迁入 Agently，把源行为映射到真实的 request、runtime、context/storage 或 TriggerFlow owner。
- **安装**：已位于本地 `~/.agents/skills/agently-migration`。
- **用法示例**：先盘点源框架可观测语义，再一对一映射到 Agently owner，并保留迁移前后代表性证据；不要按类名硬翻。

### agently-request

- **作用**：请求侧设置与契约——模型设置、Prompt/入出参、效果调优、上下文缺失或冗余、结构化输出、LongContent、auto_continue、流式、TTS/STT、会话记忆、embedding 与检索（同一请求族内）。
- **安装**：已位于本地 `~/.agents/skills/agently-request`。
- **用法示例**：工作可由一个 `ModelRequest` 族承载时使用；后续步骤依赖工具结果、审批、分支/并发/暂停恢复时改走 `agently-triggerflow`。

### agently-runtime

- **作用**：运行时扩展——AgentExecution 插件与最终策略、Actions/MCP、Shell/BashExecutor 与 PowerShell 权限、ExecutionResource、TaskWorkspace、RecordStore、auto_func/KeyWaiter、FastAPIHelper、DevTools 观测等。
- **安装**：已位于本地 `~/.agents/skills/agently-runtime`。
- **用法示例**：请求或工作流 owner 已明确后，再扩展插件、Actions、资源生命周期；可见多阶段图仍归 `agently-triggerflow`。

### agently-stage

- **作用**：进程内任务生命周期与 sync/async 互操作：Stage 作用域与句柄、结算/取消、StageCallBridge/StageStream、Tunnel 回放通道、本地 EventEmitter。即使在 TriggerFlow 内，只要是「把异步 SDK 桥成同步调用」也优先用 Stage。
- **安装**：已位于本地 `~/.agents/skills/agently-stage`。文档注明 Agently 4.1.4.7+ 需要 `agently-stage>=0.3.8,<0.4.0`。
- **用法示例**：为外部异步 SDK 包一层同步桥接，或管理进程本地任务结算与回放；应用级编排与持久化仍用 TriggerFlow。

### agently-triggerflow

- **作用**：开发者自有、可检查的多阶段执行：分支、并发、join、等待、审批、重试、运行时流、暂停/恢复、恢复与混合 sync/async 编排。
- **安装**：已位于本地 `~/.agents/skills/agently-triggerflow`。
- **用法示例**：应用需要可见的多阶段语义时选用；单次有界请求用 ModelRequest/AgentExecution；仅桥接异步 SDK 时改用 `agently-stage`。

---

## 二、Firecrawl 系列（28）

### 总述与安装

Firecrawl 系列围绕 **Firecrawl CLI** 做网页搜索、抓取、站点地图、批量爬取、交互、监控，以及一批「产出型」工作流（研报、SEO、线索、知识库等）。CLI 官方安装文档（`firecrawl/rules/install.md`）推荐：

```bash
npx -y firecrawl-cli@latest init -y --browser
```

也可手动：

```bash
npm install -g firecrawl-cli@latest
firecrawl login --browser
firecrawl --status
```

Skills 可再装：

```bash
firecrawl setup skills
firecrawl setup workflows
firecrawl setup build   # 应用集成类，独立一步
```

本机这批 `firecrawl*` 目录即 CLI/setup 装下的核心与工作流技能，**统一根路径**为 `C:\Users\10291\.agents\skills\`（例如 `C:\Users\10291\.agents\skills\firecrawl\`）。另在 `C:\Users\10291\.cursor\skills\` 与 `C:\Users\10291\.copilot\skills\` 各有同名 28 个目录副本（与 agents 侧 `SKILL.md` 哈希一致，属联接/安装副本，下文不重复展开）。子 skill 多数不再重复写安装命令，共用上述 CLI。

**CLI 能力速查（`firecrawl` 主 skill）**

| 需求           | 命令                  | 说明                |
| -------------- | --------------------- | ------------------- |
| 按主题找网页   | `search`              | 尚无具体 URL        |
| 读已知页面     | `scrape`              | 静态或 JS 渲染页    |
| 站内找 URL     | `map`                 | 知道站点不知子页    |
| 批量抽一节站点 | `crawl`               | 如整站 `/docs`      |
| AI 结构化抽取  | `agent`               | 复杂站点导航抽取    |
| 点击/表单/登录 | `scrape` + `interact` | 需要交互            |
| 下载为本地文件 | `x download`          | 离线文档            |
| 本地文件转 md  | `parse`               | PDF/DOCX 等，非 URL |
| 变更告警       | `monitor`             | 周期性检查          |

示例：

```bash
firecrawl search "react hooks" -o .firecrawl/search-react-hooks.json --json
firecrawl scrape "<url>" -o .firecrawl/page.md
```

### 核心 CLI 子 skill

#### firecrawl

- **作用**：任意实时网页任务入口（搜索、读页、找源、map、crawl、下载、监控、需点击/登录的页面）；本地文件转 `firecrawl-parse`；论文用 `firecrawl-research-index`；库/API/报错用 `firecrawl-developer-index`。
- **安装**：见上文 CLI 安装；skill 已在本地 `firecrawl/`。
- **用法示例**：普通网页调研即使不提 Firecrawl 也优先走它；按 search → scrape → map → crawl → monitor → interact 升级。

#### firecrawl-search

- **作用**：网页检索，返回相关摘录（可 `--scrape` 全文），并发现工作流/数据 API/索引。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl search "your query" -o .firecrawl/result.json --json
firecrawl search "your query" --scrape -o .firecrawl/scraped.json --json
firecrawl search "your query" --sources news --tbs qdr:d -o .firecrawl/news.json --json
```

#### firecrawl-scrape

- **作用**：读取已知网页，或执行已发现的 workflow / data-provider capability。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl scrape "<url>" -o .firecrawl/page.md
firecrawl scrape "<url>" --only-main-content -o .firecrawl/page.md
firecrawl scrape "<url>" --wait-for 3000 -o .firecrawl/page.md
```

#### firecrawl-map

- **作用**：发现并列出站点 URL，可用 `--search` 过滤。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl map "<url>" --search "authentication" -o .firecrawl/filtered.txt
firecrawl map "<url>" --limit 500 --json -o .firecrawl/urls.json
```

#### firecrawl-crawl

- **作用**：从一个站点或栏目批量抽取多页（如「整个 /docs」）。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl crawl "<url>" --include-paths /docs --limit 50 --wait -o .firecrawl/crawl.json
firecrawl crawl "<url>" --max-depth 3 --wait --progress -o .firecrawl/crawl.json
```

#### firecrawl-agent

- **作用**：自主导航网站并跨页抽取结构化数据；无现成 workflow/provider 时使用。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl agent "extract all pricing tiers" --wait --json -o .firecrawl/pricing.json
firecrawl agent "extract products" --schema '{"type":"object","properties":{"name":{"type":"string"},"price":{"type":"number"}}}' --wait --json -o .firecrawl/products.json
```

#### firecrawl-interact

- **作用**：在已 scrape 的页面上驱动浏览器：点击、填表、登录、翻页、无限滚动。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl scrape "<url>"
firecrawl interact "Click the login button"
firecrawl interact "Fill in the email field with test@example.com"
```

可用 `--profile` 保存登录态跨会话复用。

#### firecrawl-download

- **作用**：把站点或栏目存成本地文件（markdown、截图等）；命令为实验性 `firecrawl x download`。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl x download https://docs.example.com --screenshot --limit 20 -y
firecrawl x download https://docs.example.com --format markdown,links --screenshot --limit 20 -y
```

#### firecrawl-parse

- **作用**：把本地文件（PDF、DOCX、XLSX、HTML 等）转 markdown，或对文档提问。输入是文件路径而非 URL。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl parse ./paper.pdf -o .firecrawl/paper.md
firecrawl parse ./paper.pdf -S -o .firecrawl/paper-summary.md
firecrawl parse ./paper.pdf -Q "What are the main conclusions?" -o .firecrawl/paper-qa.md
```

#### firecrawl-monitor

- **作用**：按 webhook/邮件对网页变更告警——「monitor/watch/track/alert me when」类需求；已知 URL 周期性检查，或全网按目标搜新结果。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：

```bash
firecrawl monitor create --name "Blog" --schedule "every 30 minutes" \
  --goal "Alert when a new blog post is published." \
  --page https://example.com/blog \
  --email alerts@example.com
```

### 索引与专项检索

#### firecrawl-developer-index

- **作用**：检索公开仓库、GitHub issues、已合并 PR、README 与精选文档索引，回答库/API/错误/已知 bug 类问题。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：编程问题优先查索引中的 issue/PR/官方文档段落，再退回开放网页搜索。（来自 description / SKILL 原则）

#### firecrawl-research-index

- **作用**：在 Firecrawl 论文索引里找回答研究问题的论文（偏生物医学/生命科学 PubMed、bioRxiv、medRxiv，以及 arXiv CS/物理/数学），经语义检索与正文核验；通过 `firecrawl research` 或对应 MCP，而非 `search --categories research`。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：任何文献查找/论文检索任务，优先返回较完整相关集合而非强行压成一篇。（来自 description）

#### firecrawl-research-papers

- **作用**：基于论文索引做文献综述/系统综述/研究态势综合，证据基是已发表论文而非普通网页。
- **安装**：随 Firecrawl CLI/skills。
- **用法示例**：用户要 literature review、研究综述或学术来源综合时使用；开放网页深度报告改用 `firecrawl-deep-research`。

### 产出型工作流（高度同构：先简短访谈 → 采集计划 → 交付物模板）

下列 skill 安装方式相同：**随 Firecrawl workflows/skills 安装，已位于本机对应目录**。用法均为自然语言描述目标，由 skill 推断上下文并只问阻塞问题，再产出结构化报告。

| Skill                          | 作用（摘要）                                                 | 用法示例                                                   |
| ------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| firecrawl-workflows            | 总路由：研究报告、文献综述、SEO、QA、线索、知识库、设计系统抽取等交付物 | 「用 Firecrawl 做一份 SEO 审计 / 线索列表 / 设计系统抽取」 |
| firecrawl-deep-research        | 复杂主题的严谨、带引用分析报告（非产品榜单、非论文综述）     | 「写一份关于 X 政策影响的正式深度研报」                    |
| firecrawl-seo-audit            | 站点 SEO：元数据、标题层级、sitemap/站点结构等审计           | 「给 https://example.com 做 SEO 审计」                     |
| firecrawl-qa                   | 对线上站点探索性 QA、表单/链接/响应式等质量评审              | 「上线前帮我测一下这个站点并出 QA 报告」                   |
| firecrawl-shop                 | 跨站产品调研与购物建议/可下单摘要                            | 「帮我对比几款笔记本并给购买建议」                         |
| firecrawl-lead-gen             | 从目录/潜客库生成结构化线索列表（CRM JSON/CSV）              | 「按行业和岗位筛一批可合法访问的潜客列表」                 |
| firecrawl-lead-research        | 会前线索情报简报（公司/人物/新闻/痛点/切入角度）             | 「明天见 Acme，给我一份会前 brief」                        |
| firecrawl-competitive-intel    | 竞品定价、功能、changelog、产品变更的持续情报                | 「盯住竞品 A/B 的定价页和更新日志」                        |
| firecrawl-company-directories  | 从 YC、Crunchbase、Product Hunt、G2 等目录抽公司列表         | 「把某目录里 SaaS 公司导出成 CSV」                         |
| firecrawl-market-research      | 市场/财务/财报/行业与公司指标结构化报告                      | 「整理某赛道公开市场与头部公司对比」                       |
| firecrawl-knowledge-base       | 把网页做成本地参考文档、RAG chunk、微调语料等                | 「把这批文档站做成 LLM 可用知识库」                        |
| firecrawl-knowledge-ingest     | 对 JS 重、需登录/翻页的文档门户做浏览器采集                  | 「登录后抓取内部帮助中心并结构化导出」                     |
| firecrawl-dashboard-reporting  | 从分析看板/内部工具抽可见指标与跨平台汇总                    | 「从这些看板拉一份本周指标汇总」                           |
| firecrawl-demo-walkthrough     | 走查产品关键流程，产出 UX/产品 walkthrough                   | 「走一遍注册到付费流程并写体验拆解」                       |
| firecrawl-website-design-clone | 用 scrape 证据把站点设计系统抽成 `DESIGN.md`                 | 「把这个网站的设计系统抽成 DESIGN.md」                     |

补充细节：

- **firecrawl-deep-research**：仅在用户明确要正式书面报告、且主题无法用短搜索回答时使用；生物医学等论文证据应走 `firecrawl-research-papers`。
- **firecrawl-workflows**：与 CLI skill 配套；应用代码集成另装 `firecrawl setup build`。

---

## 三、Vue 系列（7）

元数据作者多为 `github.com/vuejs-ai`。各 `SKILL.md` 未写独立安装命令；本机已落在 `C:\Users\10291\.agents\skills\vue-*`（Cursor 侧多为指向该目录的 Junction）。公开生态一般可用 Skills CLI 从对应仓库安装（也可用本机联接方式）。

### vue-best-practices

- **作用**：Vue 任务必用入口。默认 Composition API + `<script setup>` + TypeScript；覆盖 Vue 3、SSR、Volar、vue-tsc、Router、Pinia、Vite+Vue。除非项目明确要求 Options API，否则始终用 Composition API。
- **安装**：已位于本地 `vue-best-practices`（作者 vuejs-ai，version 19.1.0）。
- **用法示例**：任何 `.vue` / Vue 相关开发先读本 skill 的 workflow：确认架构 → 必读 reactivity/sfc/data-flow/composables → 按需加载 slots/Teleport 等可选参考 → 功能正确后再做性能优化。Options API 项目转 `vue-options-api-best-practices`，JSX 转 `vue-jsx-best-practices`。

### vue-debug-guides

- **作用**：Vue 3 运行时错误、警告、异步失败、SSR/hydration 等问题的调试与排错索引。
- **安装**：已位于本地 `vue-debug-guides`。
- **用法示例**：出现「ref 不更新」「解构后失去响应式」「watch 只触发一次」「hydration mismatch」等症状时，按分类打开对应 `reference/*.md`；开发规范仍用 `vue-best-practices`。

### vue-jsx-best-practices

- **作用**：Vue 中的 JSX 语法与 React JSX 差异（如 `class` vs `className`、插件配置）。
- **安装**：已位于本地 `vue-jsx-best-practices`。
- **用法示例**：把 React JSX 迁到 Vue 或属性类型报错时，查阅 `render-function-jsx-vue-vs-react` 参考。（来自 description / reference 索引）

### vue-options-api-best-practices

- **作用**：Vue 3 Options API 风格（`data()`、`methods`、`this`）；每条参考只给 Options API 解法。
- **安装**：已位于本地 `vue-options-api-best-practices`。
- **用法示例**：项目强制 Options API 时加载；处理 `defineComponent` 类型、`this` 严格模式、methods/生命周期里误用箭头函数等问题。

### vue-pinia-best-practices

- **作用**：Pinia store 搭建、状态模式、与 store 的响应式注意事项。
- **安装**：已位于本地 `vue-pinia-best-practices`。
- **用法示例**：遇到 `getActivePinia was called`、setup store 漏 return、解构破坏响应式、模板里方法丢绑定等时查对应 reference。

### vue-router-best-practices

- **作用**：Vue Router 4 模式、导航守卫、路由参数、路由与组件生命周期交互。
- **安装**：已位于本地 `vue-router-best-practices`。
- **用法示例**：同路由不同 params 不触发 `beforeEnter`、`beforeRouteEnter` 无 `this`、守卫未 await、无限重定向、params 变化无生命周期等坑点排查。

### vue-testing-best-practices

- **作用**：Vue 测试——Vitest、Vue Test Utils、组件测试、mock、模式，以及 Playwright E2E。
- **安装**：已位于本地 `vue-testing-best-practices`。
- **用法示例**：搭 Vitest、黑盒测组件、`flushPromises` 处理竞态、测带 inject/Pinia 的 composable、Suspense 异步组件、Teleported 内容查询、选用 Playwright 做 E2E。

### 附：create-adaptable-composable（归入 Vue 相关）

虽未以 `vue-` 前缀命名，同属 vuejs-ai、专做可适配 composable。

- **作用**：编写库级 Vue composable，输入接受 `MaybeRef` / `MaybeRefOrGetter`，在 `watch`/`watchEffect` 内用 `toValue()`/`toRef()` 规范化。
- **本机路径**：`C:\Users\10291\.agents\skills\create-adaptable-composable`
- **安装**：已位于本地（兼容 Vue 3+ / Nuxt 3+）。
- **用法示例**：用户要「可复用 / adaptable composable」时使用，例如只读标题：

```ts
export function useDocumentTitle(title: MaybeRefOrGetter<string>) {
  watch(toRef(title), (t) => { document.title = t }, { immediate: true })
}
```

---

## 四、其他 skill（6）

非 Agently / 非 Firecrawl / 非 `vue-*` 前缀的其余 skill。`create-adaptable-composable` 已在 Vue 附节展开，本节仅交叉引用。

### find-skills

- **作用**：用户问「怎么做 X」「有没有 skill 能…」「扩展能力」时，从开放 Agent Skills 生态发现并协助安装。
- **本机路径**：`C:\Users\10291\.agents\skills\find-skills`
- **安装**：自身已位于本地；其介绍的安装工具是 Skills CLI：`npx skills`。
- **用法示例**：

```bash
npx skills find react performance
npx skills add vercel-labs/agent-skills@react-best-practices
npx skills add <owner/repo@skill> -g -y
```

推荐前先看 <https://skills.sh/> 排行榜与安装量/来源信誉。

### local-skill-location

- **作用**：在本机创建、安装或移动 Agent Skill 时，把正文放到所有本地代理可读目录，并为 Cursor 建目录联接。
- **本机路径**：`C:\Users\10291\.agents\skills\local-skill-location`
- **安装**：已位于本地；其内容本身就是安装位置规范。
- **用法示例**：新建 skill 后执行 Junction 命令（见文首「通用安装约定」），不要只写在 `.cursor/skills/` 或项目内 `.cursor/skills/`（除非用户要求随仓提交）。

### edgeone-makers-tools

- **作用**：EdgeOne Makers 全栈开发技能包——AI Agent（DeepAgents、LangGraph、Claude SDK、OpenAI Agents、CrewAI）、云函数（Node/Go/Python）、边缘函数、KV、中间件与快速部署。`SKILL.md` 是路由器，按任务再读子能力。
- **本机路径**：`C:\Users\10291\.agents\skills\edgeone-makers-tools`
- **安装**（README）：

```bash
npx skills add TencentEdgeOne/edgeone-makers-tools
```

也可在 CodeBuddy/SkillHub 搜索安装，或 Claude Code：

```text
/plugin marketplace add TencentEdgeOne/edgeone-makers-tools
/plugin install edgeone-makers-tools@edgeone-makers
```

- **用法示例**：「Deploy my project to EdgeOne」「Create an API for user registration」「Write middleware to protect /api」「Set up Edge Functions with KV」「Create a Go API with Gin」。

### courseware-to-blog

- **作用**：把 PDF/PPT 课件、示例代码目录与课堂笔记整理成可发布博客长文 Markdown；常要求插入 Hugo/Hexo 的 `<!-- more -->` 下，无 TOC，标题仅 `##`/`###`/`####`，课件图改 mermaid，不实际跑代码。
- **本机路径**：`C:\Users\10291\.agents\skills\courseware-to-blog`（另有 Junction：`C:\Users\10291\.cursor\skills\courseware-to-blog`、`C:\Users\10291\.claude\skills\courseware-to-blog`，目标均指向 agents 侧）
- **安装**：已位于本地（个人工作流 skill）。
- **用法示例**：用户说「把这章课件整理成博客，写到某某 md 的 more 下面」时启用；流程含盘点素材 → 抽 PDF 文本 → 定大纲确认 → 按硬性约束写作 → 插入目标文件 → `check_blog_md.py` / `check_mermaid.mjs` 自检。

### travel-itinerary-sheet

- **作用**：根据已有行程生成单页 A4 可打印旅行规划表 HTML（标题、概览、详细时间表、交通、住宿餐饮、实用信息）。
- **本机路径**：`C:\Users\10291\.agents\skills\travel-itinerary-sheet`
- **安装**：已位于本地。
- **用法示例**：用户要「可打印行程单 / A4 规划表」时生成 `{目的地}-旅行规划表.html`；仅要文字行程时不要生成整页。可要求「上海一日游示例」使用文档内示例数据。

### create-adaptable-composable

见上文「Vue 系列 → 附：create-adaptable-composable」，此处不重复。

---

## 五、本机其他位置的 skill（未收录于 `.agents\skills`）

以下 skill **不在** `C:\Users\10291\.agents\skills\` 主目录，但本机其他路径可读到 `SKILL.md`。扫描时间：2026-11-09（Asia/Shanghai）。

### 5.1 路径关系总览（联接 / 副本，不当新 skill）

| 位置                              | 情况                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `C:\Users\10291\.cursor\skills\`  | 多数为指向 `.agents\skills` 的 **Junction**（如各 `vue-*`、`local-skill-location`、`courseware-to-blog`、`travel-itinerary-sheet`、`create-adaptable-composable`）；另有 **28** 个与 agents 同名的 `firecrawl*` **目录副本**（`SKILL.md` SHA256 与 agents 侧一致）。真正独有的只有下面 5.2 的 2 个。 |
| `C:\Users\10291\.copilot\skills\` | **28** 个 `firecrawl*` 同名副本 + `courseware-to-blog` Junction → agents；无额外新名字。 |
| `C:\Users\10291\.claude\skills\`  | 仅 `courseware-to-blog` Junction → `C:\Users\10291\.agents\skills\courseware-to-blog`。 |

### 5.2 Cursor 个人目录独有（2）

根路径：`C:\Users\10291\.cursor\skills\`

#### library-usage-note

- **本机路径**：`C:\Users\10291\.cursor\skills\library-usage-note`
- **作用**：按已安装库的源码和实际运行结果撰写中文使用说明。用户要写 Python 库/包使用文档、完善笔记里的库说明、在 `<!-- more -->` 下补示例，或核对文档代码块能否跑通时使用。
- **安装/来源**：个人 skill，直接落在 Cursor 个人 skills 目录（未联接到 `.agents\skills`）。
- **用法示例**：先读目标笔记与同目录已完成笔记，沿用前言与段落密度；正文写在 `<!-- more -->` 下。用 `importlib.metadata` 查发行包名后写 `pip install …`；读公开 API 与实现，在声明工作目录下实际跑每个代码块，把返回值/异常写成注释；路径库才写「外部导入」与找根相关 tip。核对通过前不声称文档已完成。

#### web-page-summary

- **本机路径**：`C:\Users\10291\.cursor\skills\web-page-summary`
- **作用**：抓取网页正文并用 AI 生成中文概要；通过本机「简阅」服务 `POST /api/summarize` 完成提取与 DeepSeek 总结。用户要网页总结、总结网址、概括链接内容或粘贴 URL 要摘要时使用。
- **安装/来源**：个人 skill；依赖本机项目（优先工作区 `web_summarizer`，否则 `d:\project\web_summarizer`）、`.env.local` 中的 `DEEPSEEK_API_KEY`，以及 `http://localhost:3000` 开发服务。
- **用法示例**：规范化 URL → 确认服务可用（必要时在项目目录 `npm run dev`）→ 调用接口：

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/summarize" `
  -ContentType "application/json" `
  -Body '{"url":"https://example.com/article"}'
```

成功返回 `{ title, summary, url, cached }`，按模板展示标题、来源与 `summary` 原文（不要二次改写）；失败原样告知 `error`。

### 5.3 Cursor 内置 / CLI skill（`skills-cursor`，26）

根路径：`C:\Users\10291\.cursor\skills-cursor\`。由 Cursor 自动管理；`create-skill` 文档明确 **不要** 往该目录手写个人 skill。另有 `.kits\cursor-pages\canvas\`，内容与内置 `canvas` 同主题 kit 副本，不另计为新 skill。

| Skill                  | 作用摘要                                                     | 本机路径                                                     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| agent-sdk-create-agent | 用 Agent SDK / `@grok/agent-sdk` / BDK 脚手架新建 bot/agent，短访谈后验证一轮并交给 hillclimb | `C:\Users\10291\.cursor\skills-cursor\agent-sdk-create-agent` |
| automate               | 创建 Cursor Automations                                      | `...\automate`                                               |
| autopilot              | 循环处理评论、冲突与 CI，保持 PR 可合并                      | `...\autopilot`                                              |
| canvas                 | 产出可旁开的 `.canvas.tsx` 分析型可视化产物（量化分析、审计、MCP 数据交付等） | `...\canvas`                                                 |
| create-hook            | 编写 hooks / `hooks.json`，围绕 agent 事件自动化             | `...\create-hook`                                            |
| create-rule            | 创建 Cursor rules（`.cursor/rules`、`AGENTS.md` 等）         | `...\create-rule`                                            |
| create-skill           | 编写 Agent Skills / 讲解 `SKILL.md` 结构                     | `...\create-skill`                                           |
| create-subagent        | 创建专用子代理（评审、调试、领域助手等）                     | `...\create-subagent`                                        |
| goal                   | 设定 Cursor 会追到完成的目标                                 | `...\goal`                                                   |
| loop                   | 在本会话按间隔循环跑 prompt/skill（如 `/loop 5m /foo`）      | `...\loop`                                                   |
| migrate-to-skills      | 把「智能应用」rules / slash commands 迁成 skills             | `...\migrate-to-skills`                                      |
| new-repo               | 为当前项目建 Cursor 托管仓库并 push（需 origin CLI）         | `...\new-repo`                                               |
| onboard                | `/onboard` 引导偏好、首个目标与下一步                        | `...\onboard`                                                |
| origin                 | 安装/登录/修复 Cursor 托管仓的 origin CLI                    | `...\origin`                                                 |
| rename-chat            | 仅在用户调用 `/rename-chat` 时重命名当前聊天                 | `...\rename-chat`                                            |
| review                 | 用 Bugbot 或 Security Review 子代理审代码变更                | `...\review`                                                 |
| review-bugbot          | 用 Bugbot 子代理审代码                                       | `...\review-bugbot`                                          |
| review-security        | 用 Security Review 子代理审代码                              | `...\review-security`                                        |
| sdk                    | Cursor SDK（`@cursor/sdk` / `cursor-sdk`）集成、流式、MCP、本地/云运行时等权威指引 | `...\sdk`                                                    |
| share                  | 在 Cursor 上保存/备份/分享当前项目（可自动建仓）             | `...\share`                                                  |
| shell                  | 仅当用户显式 `/shell` 时，把后续文本当字面命令执行           | `...\shell`                                                  |
| split-to-prs           | 把当前改动拆成可审的小 PR                                    | `...\split-to-prs`                                           |
| statusline             | 配置 CLI 自定义 status line                                  | `...\statusline`                                             |
| update-cli-config      | 查看/修改 `~/.cursor/cli-config.json`                        | `...\update-cli-config`                                      |
| update-cursor-settings | 改 Cursor/VS Code `settings.json`（主题、字号、formatOnSave 等） | `...\update-cursor-settings`                                 |
| visualize              | `/visualize` 在对话内做紧凑图表（Markdown/Mermaid/HTML）；耐久产物改用 Canvas | `...\visualize`                                              |

表中 `...\` 均相对于 `C:\Users\10291\.cursor\skills-cursor\`。

**稍展开（常用）：**

- **create-skill**：先问清目的、落点（个人 `~/.cursor/skills/` 或项目 `.cursor/skills/`）、触发场景与输出格式；目录需含 `SKILL.md`，可有 reference/examples/scripts。**禁止**写入 `skills-cursor`。用户给出的原文须 verbatim 写入。
- **create-rule**：在 `.cursor/rules/*.mdc` 建规则；frontmatter 含 `description` / `globs` / `alwaysApply`。未说明作用域时要问清是否 always apply 及 glob。
- **migrate-to-skills**：把有 `description`、无 `globs`、且非 `alwaysApply: true` 的 rules，以及全部 slash commands，迁到 `.cursor/skills/<name>/SKILL.md`；正文必须原样保留。
- **update-cursor-settings**：Windows 路径为 `%APPDATA%\Cursor\User\settings.json`；先读后改，只动用户要求的项，并校验 JSON（含注释）。例：`"editor.fontSize": 16`、`"editor.formatOnSave": true`。
- **shell**：仅 `/shell` 后文本为字面命令，立即执行，不改写、不先巡仓；无参数则询问要跑什么。
- **canvas**：向 `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx` 写入单一文件，只从 `cursor/canvas` 导入，数据内联、无 fetch；适合独立分析产物，不适合「去某工具建看板」或普通代码修复。

## 附录：完整目录清单

### A. `.agents\skills`（48）

根：`C:\Users\10291\.agents\skills\`

**Agently（7）**：agently, agently-design, agently-migration, agently-request, agently-runtime, agently-stage, agently-triggerflow

**Firecrawl（28）**：firecrawl, firecrawl-agent, firecrawl-company-directories, firecrawl-competitive-intel, firecrawl-crawl, firecrawl-dashboard-reporting, firecrawl-deep-research, firecrawl-demo-walkthrough, firecrawl-developer-index, firecrawl-download, firecrawl-interact, firecrawl-knowledge-base, firecrawl-knowledge-ingest, firecrawl-lead-gen, firecrawl-lead-research, firecrawl-map, firecrawl-market-research, firecrawl-monitor, firecrawl-parse, firecrawl-qa, firecrawl-research-index, firecrawl-research-papers, firecrawl-scrape, firecrawl-search, firecrawl-seo-audit, firecrawl-shop, firecrawl-website-design-clone, firecrawl-workflows

**Vue（7）**：vue-best-practices, vue-debug-guides, vue-jsx-best-practices, vue-options-api-best-practices, vue-pinia-best-practices, vue-router-best-practices, vue-testing-best-practices

**其他（6）**：courseware-to-blog, create-adaptable-composable, edgeone-makers-tools, find-skills, local-skill-location, travel-itinerary-sheet

### B. 其他位置（28，不含联接/同名副本）

**Cursor 个人独有（2）**：`C:\Users\10291\.cursor\skills\library-usage-note`，`C:\Users\10291\.cursor\skills\web-page-summary`

**Cursor 内置 skills-cursor（26）**：agent-sdk-create-agent, automate, autopilot, canvas, create-hook, create-rule, create-skill, create-subagent, goal, loop, migrate-to-skills, new-repo, onboard, origin, rename-chat, review, review-bugbot, review-security, sdk, share, shell, split-to-prs, statusline, update-cli-config, update-cursor-settings, visualize（根：`C:\Users\10291\.cursor\skills-cursor\`）

### 读取说明

- `.agents\skills` 的 48 个均成功读取 `SKILL.md`；另参考 `edgeone-makers-tools/README.md`、`firecrawl/rules/install.md`。
- 第五节新增 skill 均成功读取对应 `SKILL.md`（含 `skills-cursor` 26 个与 `.kits\cursor-pages\canvas` 对照）。已按个人使用范围去掉 LeetCode 插件与 VS Code 扩展内嵌 skill。
- 未把 Junction / firecrawl 同名副本计为新 skill。