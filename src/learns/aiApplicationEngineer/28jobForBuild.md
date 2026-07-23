---
title: 部署及提效相关简历+面试问题辅导
date: 2026-07-23
categories: [教程, 知乎]
tags: [AI, Agent, 低代码]
---

<!-- more -->

## 1. Agent 平台：Coze、Dify 与 Agent 进阶集成

### 1.1 什么是 LLM Agent？

**定义**：LLM Agent = LLM + 工具 + 记忆 + 规划循环。

| 维度     | 单轮 LLM 调用                      | LLM Agent                                    |
| -------- | ---------------------------------- | -------------------------------------------- |
| 过程     | 输入 Prompt → 输出文本，一次性完成 | 自主决定调用哪些工具、读取哪些数据、何时结束 |
| 能力     | 文本生成                           | Reasoning + Tool Use + Memory                |
| 典型范式 | —                                  | ReAct（Reason + Act）                        |

**Agent 的三大核心能力**：

```mermaid
graph LR
    A[LLM Agent] --> B[Reasoning<br/>决定下一步做什么]
    A --> C[Tool Use<br/>调用API/函数/数据库]
    A --> D[Memory<br/>短期:对话历史<br/>长期:向量库/知识库]
```

**ReAct 执行示例**：

```
Thought: 我要回答这个问题，需要查股票实时价格
Action: call get_stock_price("AAPL")
Observation: 188.34
Thought: 现在已经拿到价格，可以回答了
Final Answer: 苹果当前股价188.34美元
```

> **思考题**：Agent 与 Function Calling 是一回事吗？
>
> Function Calling 是 Agent 的一项能力（让 LLM 输出结构化的工具调用）；Agent 是更上层的概念，包含判断是否需要调用、调用后是否继续、何时结束的整个循环。没有 Function Calling 的 Agent（纯 Prompt 工程）也存在，但实用性差。

### 1.2 Coze 核心组件

Coze（扣子）是字节跳动推出的零代码/低代码 AI Agent 开发平台。

| 组件                | 作用                                                     |
| ------------------- | -------------------------------------------------------- |
| Bot                 | 完整 Agent，包含人设、模型、插件、知识库、工作流         |
| 插件（Plugin）      | 工具——官方插件（搜索、画图、地图）或自定义 HTTP API      |
| 知识库（Knowledge） | 文档/数据，自动切分 + 向量化 + 检索                      |
| 工作流（Workflow）  | 可视化流程编排，含 LLM、代码、知识库检索、条件判断、循环 |
| 卡片（Card）        | 富媒体输出（图片、按钮、表单）                           |
| 数据库              | Bot 自带轻量级数据存储，跨会话持久化                     |
| 触发器              | 定时/事件触发 Bot 执行（如每天早 8 点推送早报）          |

#### 应用案例：抖音爆款文案生成器

```mermaid
flowchart LR
    A[输入:商品名称+卖点] --> B[节点1:搜索插件<br/>搜索抖音同类爆款文案Top10]
    B --> C[节点2:知识库检索<br/>检索预存文案模板库]
    C --> D[节点3:LLM节点<br/>角色:抖音运营专家<br/>生成3条不同风格文案]
    D --> E[节点4:代码节点<br/>计算字数/emoji/CTA检查]
    E --> F[节点5:LLM节点<br/>打分排序,推荐最佳]
    F --> G[输出:JSON+推荐理由]
```

**关键技巧**：

- 知识库存放历史爆款的开头模板、转折模板、结尾 CTA
- 代码节点做硬性规则（字数 < 200、必须有 CTA）
- LLM 节点只负责创意部分

> 为什么不能直接让一个 LLM 一步到位？因为一步到位容易遗漏要求（少了 CTA、超字数）。拆分成多个节点后，每个节点目标单一，可控、可调试、可替换模型。关键节点用好模型，省钱节点用便宜模型。

### 1.3 Coze 知识库工作原理（RAG）

```mermaid
flowchart LR
    A[文档上传<br/>PDF/Word/MD/Excel] --> B[文档解析<br/>提取文本和表格]
    B --> C[分块Chunking<br/>200-1000 token/块]
    C --> D[向量化<br/>Embedding模型]
    D --> E[(向量库)]
    
    F[用户提问] --> G[Query Embedding]
    G --> H[向量相似度检索<br/>Top-K]
    H --> I[可选Rerank<br/>精排]
    I --> J[拼接Prompt<br/>LLM回答]
    E --> H
```

**分块策略**：

- **自动分块**：按段落 + 重叠（默认 800 token，重叠 100）
- **自定义分块**：按章节标题/自定义分隔符
- **层级分块**：保留章节结构，检索时返回所属章节标题

**最佳实践**：

- 重叠 10-20% 减少边界信息丢失
- 表格/代码块单独分块，否则被截断
- 召回 Top-K = 5 通常最优，过大污染 Context
- 开启 Rerank（BGE-Reranker）可让 hit@1 提升 15%+

**幻觉控制**：

- Prompt 中强制要求 LLM 引用片段编号（如"根据资料[1]"）
- 命中率太低时先优化分块（按语义而非固定字数）
- 设置"找不到答案就说不知道"的指令
- 关键场景做 Rerank + 多次召回融合

### 1.4 Coze vs Dify 选型

| 维度     | Coze                            | Dify                                      |
| -------- | ------------------------------- | ----------------------------------------- |
| 开源     | 闭源（SaaS）                    | 开源（Apache 2.0）                        |
| 部署     | 只能云端                        | 私有化（Docker Compose 一键起）           |
| 模型     | 豆包 + 几个国内模型             | 全开放，支持 OpenAI/Anthropic/Ollama/vLLM |
| UI       | 颜值高、交互好、对小白友好      | 略偏极客，但功能完整                      |
| 工作流   | 图形化、节点丰富、版本管理弱    | 图形化 + 工作流版本 + 调试日志            |
| 数据安全 | 数据上字节云                    | 数据完全自有                              |
| 适合     | 个人/小团队快速 Demo、内容/电商 | 企业私有化、数据合规敏感场景              |

**选型建议**：

- 数据敏感/要私有化 → **Dify**
- 快速做抖音 Bot / 个人小工具 → **Coze**
- 想要最强生态 + 完全免费 → **Dify**
- 想要最低成本快速上线 → **Coze**

### 1.5 Docker Compose 一键部署 Dify

```bash
# 1. 拉取 Dify
git clone https://github.com/langgenius/dify.git
cd dify/docker

# 2. 复制配置
cp .env.example .env

# 3. 启动（包含 dify-api、dify-worker、dify-web、postgres、redis、weaviate、nginx）
docker compose up -d

# 4. 访问 http://localhost → Dify Web 控制台
```

**向量库选型**：

| 方案     | 特点                          | 适用场景               |
| -------- | ----------------------------- | ---------------------- |
| Weaviate | 开源轻量，Dify 默认集成       | 中小规模 RAG           |
| Milvus   | 亿级向量，分布式架构          | 生产高并发检索         |
| Qdrant   | Rust 实现，高性能低占用       | 延迟敏感的中大规模场景 |
| PGVector | PostgreSQL 扩展，SQL 操作向量 | 已有 PG 的团队         |

切换方法：修改 `.env` 中 `VECTOR_STORE=milvus` 并重启。

### 1.6 Workflow vs Chatflow

| 维度     | Workflow                     | Chatflow                            |
| -------- | ---------------------------- | ----------------------------------- |
| 触发方式 | 手动/API 一次性触发          | 多轮对话                            |
| 状态     | 无状态（每次重新跑）         | 有对话状态                          |
| 输入     | 任意结构化输入               | 用户消息                            |
| 节点     | 全部节点                     | Workflow 节点 + 对话历史 + 引用展示 |
| 适用     | 数据处理、批量任务、定时任务 | 客服、问答助手、Agent 对话          |

**实战场景**：

- **Workflow**：每天定时跑一次，把过去 24 小时新闻爬下来 → LLM 生成早报 → 发飞书
- **Chatflow**：用户在网页对话框输入"我想要 7 天减肥食谱" → 多轮对话收集体重/口味/过敏 → 输出方案

### 1.7 多 Agent 协作模式

```mermaid
graph TD
    subgraph "Pipeline 流水线"
        A1[Agent A<br/>搜索] --> B1[Agent B<br/>摘要] --> C1[Agent C<br/>写作]
    end
    
    subgraph "Manager-Worker 经理-员工"
        M[Manager Agent<br/>拆任务+汇总] --> W1[Worker A<br/>基金选股]
        M --> W2[Worker B<br/>估值分析]
        M --> W3[Worker C<br/>风险评估]
    end
    
    subgraph "Debate 辩论"
        D1[Agent A<br/>观点1] --> J[Judge Agent<br/>仲裁]
        D2[Agent B<br/>观点2] --> J
        D3[Agent C<br/>观点3] --> J
    end
    
    subgraph "Group Chat 群组"
        G1[编剧Agent] <--> G2[导演Agent]
        G2 <--> G3[制片人Agent]
        G1 <--> G3
    end
```

**多 Agent vs 复杂 Agent**：

- 一个复杂需求（如量化交易系统）：**单 Agent** 负责决策 → Planning 拆解 → 派活给 SubAgent + Skills → AgentLoop 多轮迭代
- **多 Agent**：数据员采集舆情/行情 → 分析师看多/看空 → 风控官检查 ST/亏损 → 交易员执行

**主流框架**：

| 框架             | 特点                      |
| ---------------- | ------------------------- |
| AutoGen（微软）  | 群组聊天 / Manager-Worker |
| CrewAI           | 易上手的多 Agent 编排     |
| LangGraph        | 基于图的状态机，控制力强  |
| Qwen-Agent       | 阿里生态                  |
| LlamaIndex Agent | 数据索引驱动的 Agent 框架 |

### 1.8 MCP 协议与外部系统集成

**接入方式**：

1. **HTTP 节点 + 自定义 API**：Workflow 中直接调 OA 系统的 REST API
2. **自定义工具（Tool）**：在 Dify 控制台定义 OpenAPI Schema，Agent 自动学会调用
3. **MCP（Model Context Protocol）**：Dify 1.0+ 支持，企业把 OA/CRM/ERP 暴露为 MCP Server

**MCP 协议核心价值**：

- 统一接口：所有数据源/工具用同一套协议
- 解耦：企业系统变更不影响 Agent 代码
- 生态：MCP Server 将成为 AI 时代的 Web Server
- 类比：从 REST API 的散乱时代到协议级统一

### 1.9 批处理 Agent（Batch Agent）

一次任务对一批数据逐项调用 LLM Agent。典型场景：

| 场景             | 说明                                    |
| ---------------- | --------------------------------------- |
| 简历批量打分     | 1000 份简历逐份提取 + 打分 + 写理由     |
| 客户邮件批量分类 | 全年客服邮件批量打标签 + 分配优先级     |
| 批量发票审核     | 批量识别发票 + 校验金额/税号 + 标注异常 |
| 数据清洗         | 地址归一等脏数据标准化                  |

> **Agent ETL vs 传统 ETL**：传统 ETL 规则明确，SQL/脚本可写死；Agent ETL 处理非结构化+模糊规则数据（自然语言简历、邮件、合同）。Agent ETL 成本是 LLM Token，需控制单条任务 Token 预算（典型 < 2000 Token）。

---

## 2. AI 提效：智能编码与质量保障

### 2.1 AI 编程工具全景

| 工具                   | 类型         | 核心特点                                    | 适合场景       |
| ---------------------- | ------------ | ------------------------------------------- | -------------- |
| **Cursor**             | VS Code Fork | 模型最丰富，Composer 多文件编辑，生态最成熟 | 通用全栈开发   |
| **Claude Code**        | 官方 CLI     | SWE-bench 80.8% 行业第一，最强自主任务执行  | 复杂工程重构   |
| **Codex**              | 官方 CLI     | OpenAI 编程模型，终端自主任务执行           | 多语言代码生成 |
| **GitHub Copilot**     | IDE 插件     | 用户最广，深度集成 GitHub/Azure             | 企业合规首选   |
| **Trae**               | IDE          | 字节出品，国内版完全免费，中文深度适配      | 国内开发者     |
| **Lingma（通义灵码）** | IDE 插件     | 阿里出品，支持 VS Code/JetBrains            | 国内开发者     |

### 2.2 Cursor 四种工作模式

```mermaid
graph TD
    subgraph "Cursor Work Modes"
        A[Agent 智能体] --> A1[自主执行多步骤任务<br/>编辑多文件+运行命令+测试]
        B[Plan 规划] --> B1[先分析需求制定计划<br/>用户审阅后再执行]
        C[Debug 调试] --> C1[分析堆栈定位根因<br/>提供修复方案+自动补丁]
        D[Ask 询问] --> D1[纯咨询不修改代码<br/>解释/审查/架构讨论]
    end
```

### 2.3 Cursor Rules

Rules = 固定写入 system prompt 的项目规约，让 AI 始终遵守编码规范。

**规则配置方式**：

- **全局 Rules**：Cursor Settings → Rules（对所有项目生效）
- **项目 Rules**：`.cursor/rules/*.mdc`（只在当前项目生效）

**文件格式**（`.mdc`）：

```yaml
---
description: Python 编码规范
globs: ["**/*.py"]
alwaysApply: true
---
- 使用 Python 3.11+ 语法
- 所有函数必须有 type hint 和 docstring（Google 风格）
- 优先用 pathlib 而不是 os.path
- 数据处理优先用 polars 而不是 pandas
- 注释一律用中文
```

**经验规则**：

- 每条 Rule < 100 行
- `alwaysApply: true` 控制在 ~2000 tokens（1-2 条核心）
- 用 globs 精准匹配，避免无关 Rule 挤进 context

### 2.4 Cursor Memory

Memory 自动从对话中提取长期偏好，跨 Session 保留。例如你说"这个项目都用 polars" → 下次打开新对话会自动遵守。

**实战用法**：

- 项目级共识（架构图、技术栈、编码规范）→ 写进 `.cursor/rules`
- 个人级偏好（函数式风格、注释习惯）→ 交给 Memory 自动记忆

### 2.5 Prompt 给 AI 编程的 Best Practice

1. **目标一句话说清**：做什么、输入是什么、输出格式是什么
2. **上下文直接丢**：用 `@file` / `@folder` 把相关代码、文档贴进去
3. **约束写死**：语言版本、必用/禁用库、编码风格、异常处理方式
4. **验收标准量化**：测试通过条件、输出格式、性能指标、边界情况

> ❌ 避免模糊指令："帮我写个爬虫" → AI 会脑补技术栈与格式，导致返工
>
> ✅ 正确示例：用 Python 3.11 + httpx + BeautifulSoup 写一个爬虫，输入 URL list，并发 10，下载 HTML 后提取 `.article-content` 文本，输出 JSONL 到 `output/`。失败重试 3 次，超时 5s。`@requirements.txt @output_schema.json`

### 2.6 模型选择策略

| 场景                | Cursor 推荐模型         | Trae 推荐模型            |
| ------------------- | ----------------------- | ------------------------ |
| 日常编码最快最省    | Composer 2（Kimi K2.5） | Doubao-Seed-2.0-Code     |
| 复杂算法/架构设计   | Opus 4.7（Anthropic）   | GLM-5.1（智谱）          |
| 性价比平衡          | Sonnet 4.6              | MiniMax-M2.7             |
| Agent 多步/长上下文 | GPT-5.5（1M Context）   | Kimi-K2.6 / Qwen3.6-Plus |
| 测试生成/CI-CD      | GPT-5.3 Codex           | Qwen3.6-Plus             |

### 2.7 SDD（Specification-Driven Development）

**定义**：先把需求和接口规范写清楚，再让 AI 去实现。

```
需求 → 写规范文档(Spec) → 让 AI 基于 Spec 生成代码 → 验证代码符合 Spec
```

**Spec 包含内容**：

- 接口定义：函数签名、输入输出、字段类型
- 业务规则：什么情况返回什么
- 错误处理：出错怎么办
- 示例：样本输入 + 期望输出

> 为什么 SDD 在 AI 时代特别重要？AI 写代码很快但理解需求容易偏。一份清晰的 Spec = 给 AI 的靶子。Spec 也是测试的依据（Spec 即测试用例）。Spec 跨人协作（产品/开发/测试）使用同一份真相。

### 2.8 TDD（Test-Driven Development）

```mermaid
flowchart LR
    subgraph "Red-Green-Refactor 循环"
        R[🔴 Red<br/>写测试→运行失败] --> G[🟢 Green<br/>写最少代码→测试通过]
        G --> F[🔵 Refactor<br/>保持绿下重构代码]
        F -.-> R
    end
    
    G -.->|继续迭代| R
```

**AI 时代 TDD 升级版**：

1. 让 AI 根据 Spec 先写测试（Red）
2. 让 AI 写实现让测试通过（Green）
3. 让 AI 重构 + 你 Review（Refactor）
4. 每一步都可以在 Cursor 通过 Prompt 完成

> TDD 是不是太慢了？短期写测试占 30% 时间看似慢，但长期看：Bug 在编码时就被发现，调试时间下降 60%+；重构有保障；测试本身就是 living documentation。

### 2.9 AI 在 CI/CD 中的应用

| 应用               | 说明                                              |
| ------------------ | ------------------------------------------------- |
| 自动代码审查       | PR 提交后 AI 自动检查代码风格、潜在 Bug、安全漏洞 |
| 测试失败自动定位   | AI 自动读报错日志、定位根因、给出修复建议         |
| 不稳定测试自动隔离 | 自动识别时好时坏的测试用例，标记隔离              |
| 发布说明自动生成   | 根据代码变更和提交记录自动写 Release Notes        |
| 依赖漏洞自动修复   | 扫描到第三方库漏洞后自动升级版本、适配 API        |

**风险提示**：

- 过度信任：AI 审查意见可能错误，保留人审环节
- Token 成本：每个 PR 都跑 AI review 累计成本可观
- 隐私：敏感项目用本地模型，避免数据外泄

### 2.10 用 AI 重构遗留代码

**四步走策略**：

```mermaid
flowchart LR
    A[① AI读旧代码写文档<br/>翻译成业务流程图] --> B[② 补行为快照测试<br/>记录当前输入输出]
    B --> C[③ 渐进替换<br/>搭新模块,并行运行] --> D[④ 逐函数小步重构<br/>改一点测一点]
```

**面试考察点**：

- 工程化重构思维（渐进替换而非推倒重来）
- AI 工具落地能力（用 AI 辅助文档、测试、代码生成）
- 风险控制意识（先锁定行为再迁移，保证业务连续性）

### 2.11 评估 AI 编程工具的真实收益

| 维度 | 指标                                          |
| ---- | --------------------------------------------- |
| 效率 | 人均周 PR 数与代码量是否提升                  |
| 质量 | 首次 Review 通过率、千行 Bug 数、紧急修复频率 |
| 胆量 | 团队是否敢重构以前不敢碰的遗留模块            |
| 成长 | 新人 Onboarding 到独立提 PR 的天数是否缩短    |

**经验数据**：

- 接入后人均生产力提升 30-55%
- 前端/数据/脚本类工作收益 > 后端业务
- Bug 密度无显著下降 → 强测试 + AI Review 必不可少

> AI 编程工具会让初级工程师贬值吗？短期初级岗位需求减少，长期分化更剧烈。价值不再是写得多快，而是看得多准 + 设计得多好 + Spec 写得多清晰。你要能 review AI 写的所有代码。

---

## 3. 数据智能：Text-to-SQL 与 ChatBI 实战

### 3.1 什么是 Text-to-SQL？

把自然语言转成可执行的 SQL。例如：

```
输入：最近30天销售额最高的5个商品
输出：SELECT product_name, SUM(amount) FROM sales 
      WHERE date >= NOW()-INTERVAL 30 DAY 
      GROUP BY product_name ORDER BY 2 DESC LIMIT 5
```

**LLM 之前为什么没做好**：

| 问题             | 说明                                         |
| ---------------- | -------------------------------------------- |
| Schema 理解差    | 模型不知道"销售额"映射到 amount 还是 revenue |
| 复杂 JOIN 搞不定 | 多表 JOIN 关系无法稳定生成                   |
| 泛化差           | 训练数据集覆盖有限，新数据库基本无效         |
| 没有反馈循环     | 写错了不能自我纠错                           |

**LLM 时代为什么准确率从 60% 跃升到 90%+**：

- 真懂语义：不是关键词匹配，而是理解业务意图
- In-Context Learning：Schema + 示例塞进 Prompt，零样本适配新库
- Chain-of-Thought：先拆解逻辑再生成 SQL
- 自我修正：执行报错 → LLM 分析错误 → 重写 SQL

### 3.2 核心难点与应对方案

| 难点                                                  | 方案                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| Schema 太大塞不进 Context                             | Schema Linking——RAG 语义检索召回相关表/字段                |
| 业务术语 ≠ 字段名（如 GMV ≠ gross_merchandise_value） | 维护业务词典/指标定义文档作为 RAG 知识库                   |
| 歧义/模糊问题（最近一周是 7 天还是自然周？）          | 让 LLM 先做澄清问题，与用户对话                            |
| 复杂 JOIN / 嵌套（5 表 JOIN + 子查询 + 窗口函数）     | Few-shot 示例覆盖典型模式 + 输出 CTE 提升可读性 + 错误重试 |
| 结果验证（SQL 跑通不代表语义正确）                    | 让 LLM 推理结果是否合理 + 抽样人审                         |

### 3.3 LangChain SQL Copilot 标准流程

```mermaid
flowchart LR
    A[用户自然语言问题] --> B[list_tables<br/>查所有表]
    B --> C[schema_query<br/>查相关表Schema]
    C --> D[query_checker<br/>LLM自检SQL合法性]
    D --> E[query_db<br/>执行SQL]
    E --> F{执行成功?}
    F -->|是| G[observation<br/>结果总结为自然语言]
    F -->|否| H[失败重试<br/>错误丢回LLM修复]
    H --> D
```

**代码示例**：

```python
from langchain.chat_models import ChatOpenAI
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase

db = SQLDatabase.from_uri("postgresql://user:pass@host/db")
llm = ChatOpenAI(model="gpt-4o", temperature=0)
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
agent = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True,
    handle_parsing_errors=True,
)
answer = agent.run("最近30天销售额最高的5个商品是哪些？")
```

> 直接用 LangChain 的现成 Agent 够生产用吗？**不够**。主要短板：中文业务理解弱、Schema 召回粗放、缺业务语义层、输出体验差、安全风险高。生产级 ChatBI 一定要在 LangChain 之上做大量定制，或者直接自研。

### 3.4 RAG Schema Linking 流程

```mermaid
flowchart LR
    subgraph "离线建索引"
        A["每张表生成NL描述<br>表名+字段+注释+示例值"] --> B["Embedding向量化"]
        B --> C[("向量库")]
    end
    
    subgraph "在线检索"
        D["用户问题"] --> E["Query Embedding"]
        E --> F["向量相似度Top-K<br>K=10-20"]
        F --> G["Reranker精排<br>Top-5"]
        G --> H["业务词典补强<br>GMV=SUM(order_amount)-..."]
        C --> F
        H --> I["拼接Prompt<br>供LLM生成SQL"]
    end
```

**效果对比**：

| 方案                | Token 用量 | 准确率   |
| ------------------- | ---------- | -------- |
| 全 Schema 塞 Prompt | 30K+ Token | ~70%     |
| RAG 召回 Top-5 表   | 3K Token   | ~88%     |
| Token 成本下降      | **90%**    | **↑18%** |

### 3.5 Few-shot 示例对 Text-to-SQL 的影响

| 策略                          | 准确率   |
| ----------------------------- | -------- |
| 0-shot（无示例）              | ~65%     |
| 静态 5-shot（固定示例）       | ~78%     |
| 动态 Few-shot（按相似度检索） | **~89%** |

**动态 Few-shot 实现**：

1. 维护历史【问题 + SQL】标注集
2. 每个问题做 Embedding，存向量库
3. 用户新问题 → 检索 Top-5 最相似的历史【问题 + SQL】
4. 拼到 Prompt 作为 examples

**挑选示例原则**：

- 覆盖典型 SQL 模式：JOIN、GROUP BY、窗口函数、CTE 至少各 1 个
- 覆盖业务领域：电商/财务/用户分析等各有代表
- 难度梯度：从简单到复杂

### 3.6 ChatBI（对话式商业智能）

```mermaid
flowchart LR
    A[用户自然语言提问] --> B[意图路由<br/>Intent Router]
    B --> C[数据查询<br/>Text-to-SQL]
    B --> D[指标计算<br/>Polars/Pandas]
    B --> E[对比分析<br/>归一化/回撤]
    C --> F[数据处理层]
    D --> F
    E --> F
    F --> G[LLM总结点评]
    G --> H[图表生成<br/>Matplotlib]
    H --> I[统一输出<br/>文本+图片+数据表]
```

**ChatBI vs 传统 BI**：

| 维度   | 传统 BI                | ChatBI                 |
| ------ | ---------------------- | ---------------------- |
| 交互   | 拖拽/SQL               | 自然语言               |
| 用户   | 数据分析师             | 业务人员（不懂 SQL）   |
| 主动性 | 被动（用户搭看板）     | 主动（系统总结洞察）   |
| 时效   | 隔天/周报              | 实时问答               |
| 成本   | 重型（Tableau/FineBI） | 轻量（聊天界面 + LLM） |

### 3.7 ChatBI 实战避坑指南

1. **LLM 自己算数算错**：所有数值用 Polars/NumPy 算好，再喂给 LLM 总结

2. **SQL/代码注入风险**：参数化查询 + 白名单 + 只允许 SELECT

3. **数据时效**：Tushare 接口有延迟，UI 必须显示数据时间戳

4. **实体识别误差**："茅台"可能是股票（600519）也可能是基金，需要澄清

5. **Matplotlib 中文乱码**：

   ```python
   import matplotlib
   matplotlib.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei"]
   matplotlib.rcParams["axes.unicode_minus"] = False
   ```

---

## 4. 企业级 AI 部署

### 4.1 CPU vs GPU 在 LLM 推理中的角色

| 维度       | CPU                                  | GPU                                   |
| ---------- | ------------------------------------ | ------------------------------------- |
| 核心数     | 数十核，单核能力强                   | 数千小型核心（H100: 16896 CUDA 核心） |
| 设计目标   | 顺序指令、复杂逻辑控制               | 大规模并行矩阵运算                    |
| LLM 中角色 | 并发请求调度、Tokenization、前后处理 | 核心推理（矩阵乘法，如 Q×K^T）        |

**工业建议**：每 1 张 GPU 配 16-32 核 CPU + 512GB-1TB DRAM。CPU 负载过高或 DRAM 不足会导致 GPU "饥饿等待"。

### 4.2 推理框架选型

| 框架             | 核心创新                             | 适用场景                             | 协议       |
| ---------------- | ------------------------------------ | ------------------------------------ | ---------- |
| **vLLM**         | PagedAttention（页式 KV Cache 管理） | 高吞吐、大批量 Prompt 的生产环境     | Apache 2.0 |
| **SGLang**       | RadixAttention（前缀树 KV 复用）     | 多轮对话、Agent/CoT/RAG 等复杂交互   | Apache 2.0 |
| **TensorRT-LLM** | 硬件原生优化、自定义 CUDA 核         | NVIDIA GPU 极致性能（Blackwell FP4） | Apache 2.0 |
| **Ollama**       | 极简封装（基于 llama.cpp）           | 本地开发、边缘设备、CPU 推理         | Apache 2.0 |

**选型建议**：

- 新手/快速验证 → **Ollama**（2 分钟跑起来）
- 生产环境通用场景 → **vLLM**（生态最全，文档最丰富）
- 长上下文/Agent/多轮对话 → **SGLang**（前缀复用率 90%+）

### 4.3 本地知识库与 RAG 部署

**笔记中提到的 RAG 流程**：

```
原始知识(1G文件) => 切分 1000万个chunks => 向量数据库
query => query embedding
1000万chunks => 召回1000个(相似度计算) => 重排序(10个)

类比：1000万简历 => 快速筛选1000个 => 面试10个
```

**技术栈建议**：

- **LangChain** 框架搭建 RAG
- **FAISS** 或 **Milvus** 做向量库
- CPU 部署推荐 **Ollama + 量化模型**

> 常见错误：CPU 跑量化大模型时，注意内存不足、Embedding 模型选择、Chunk 大小调优等问题。建议先在云 GPU 调试通过再迁移到 CPU 环境。

---

## 5. 项目简历与实战案例

### 5.1 项目一：市场舆情监测 Agent

**项目描述**：金融行业市场舆情自动化分析 Agent，每日由用户输入查询日期触发，系统自动从新浪财经抓取证券新闻、从 AppStore 抓取证券类 App 用户评论，做热词分析、情感分类、舆情趋势研判后，生成包含财经热点词云、好评/差评词云、舆情解读的「市场舆情监测日报」并以 PDF 链接形式交付。原先靠分析师人工汇编的日报，从约 4 小时缩短到分钟级。

**技术栈**：多工作流嵌套编排、自定义插件、新浪财经/AppStore 数据采集、词云分析、情感分析、PDF 生成插件

**架构图**：

```mermaid
flowchart LR
    subgraph "入口工作流: Securities"
        A[用户输入日期] --> B[证券新闻抓取<br/>新浪财经]
        B --> C[关键词提取<br/>情感打标]
        C --> D[生成热点词云]
    end
    
    subgraph "子工作流: AppStoreEstimate"
        E[AppStore评论抓取] --> F[好评/差评分类]
        F --> G[生成词云]
    end
    
    subgraph "子工作流: GenerateDailyReports"
        D --> H[多源数据汇总]
        G --> H
        H --> I[LLM撰写日报]
        I --> J[PDF生成+链接交付]
    end
```

**亮点**：

- 多工作流分层架构：三个工作流协作，主 Agent 只需调用一次，复杂度对外屏蔽
- 多源数据采集与处理：新闻 + App 评论两路并行
- 可视化资产产出：三类词云图（热点、好评、差评）
- 报告交付：Markdown → PDF → 外部可访问链接

### 5.2 项目二：私有化部署的智能客服 ChatFlow

**项目描述**：基于开源 Dify 平台私有化部署的多轮智能客服系统，对接企业产品知识库自动回答售前售后问题，支持多轮对话上下文记忆、答案引用归属、未命中兜底转人工。

**技术栈**：Dify、Docker Compose、ChatFlow 对话编排、RAG 知识库、Embedding、Rerank、LLM 节点、私有化模型接入

**架构图**：

```mermaid
flowchart LR
    A["用户提问"] --> B["意图识别"]
    B --> C{"意图类型"}
    C -->|"产品咨询"| D["RAG知识库检索<br>800token分块+重叠100"]
    C -->|"订单查询"| E["自定义工具节点<br>调企业OA/CRM"]
    C -->|"低置信度"| F["转人工"]
    D --> G["LLM回答<br>强制引用标注[1][2]"]
    G --> H["带引用归属展示"]
    E --> H
```

**亮点**：

- 私有化部署：模型层对接 vLLM，全部在企业内网完成
- ChatFlow 五段式编排：用户提问 → 意图识别 → 知识库检索 → LLM 回答 → 引用归属/兜底转人工
- RAG 工程化：800 token 分块 + 100 token 重叠 + Reranker 精排 Top-5
- 幻觉控制：强制标注引用编号，找不到回答明确说"不知道"并触发转人工

### 5.3 项目三：ChatBI 金融数据智能问答助手

**项目描述**：面向证券行业的对话式商业智能（ChatBI）助手，覆盖贵州茅台（600519.SH）、五粮液（000858.SZ）、国泰君安（601211.SH）、中芯国际（688981.SH）等典型标的。业务用户用自然语言提问，系统自动完成数据采集 → SQL 查询 → 指标计算 → 自然语言点评 → 图表可视化的完整链路。

**技术栈**：Tushare、Pandas/Polars、LangChain、自定义 ExcSQLTool 工具、LLM（DashScope/Claude）、Matplotlib、Gradio

**核心技能体系**：

```mermaid
flowchart LR
    subgraph "ChatBI 金融智能问答助手"
        A[Gradio Chat UI] --> B[Intent Router<br/>意图路由]
        B --> C1[历史价格查询<br/>ExcSQLTool]
        B --> C2[财务数据<br/>SQL查询]
        B --> C3[对比分析<br/>归一化]
        B --> C4[技术指标<br/>MACD/布林带]
        C1 --> D[数据处理层<br/>Polars/Pandas]
        C2 --> D
        C3 --> D
        C4 --> D
        D --> E[LLM总结点评<br/>+ 图表生成]
        E --> F[统一输出<br/>文本+图片+数据表]
    end
```

**亮点**：

- **整体架构**：Gradio Chat UI → Intent Router → 多类数据源 → 数据处理层 → LLM 总结 + 图表生成
- **自然语言到数据查询**：基于 LangChain 自定义 ExcSQLTool，将 NL → SQL → 数据 → 可视化封装为单个 Agent 工具
- **对比分析能力**：并行采集多标的历史价格，收盘价归一化（首日 = 0%）后绘制累计涨跌幅曲线，计算最大回撤、波动率、区间收益
- **数值正确性**：所有数值计算由 Polars/Pandas 完成后再喂给 LLM 总结，避免 LLM 自己算数出错
- **合规与生产化**：所有输出附带"以上为数据分析，非投资建议"声明 + 数据来源 + 时间戳

**工作区中实际实现的技能（nanobot 版）**：

| 技能          | 功能                   | 技术                         |
| ------------- | ---------------------- | ---------------------------- |
| stock-sql     | SQL 查询 + 自动走势图  | SQLite → Polars → Matplotlib |
| macd-analysis | 近一年买卖点与简易回测 | 股价 → MACD 计算 → 信号生成  |
| arima-predict | 未来 N 日价格预测      | ARIMA(5,1,5) → statsmodels   |
| bollinger     | 超买超卖与回测         | 布林带计算 → 买卖信号        |
| prophet-cycle | 趋势/周/年季节性分解   | Prophet 模型 → 成分分解      |
| rsi-analysis  | RSI 相对强弱指标       | RSI(14) → 超买超卖判断       |

**ARIMA 预测流程**：

```mermaid
flowchart LR
    A["输入: ts_code, n"] --> B["加载历史收盘价<br>SQLite查询"]
    B --> C["预处理<br>差分d=1+缺失值填充"]
    C --> D["拟合ARIMA(5,1,5)<br>最大似然估计"]
    D --> E["生成N日预测<br>get_forecast"]
    E --> F["绘制图表<br>历史蓝+预测红"]
    F --> G["输出JSON<br>predictions+chart"]
```

---

## 6. 面试与求职要点

### 6.1 Agent 上下文污染解决方案

当 Agent 在长时间对话中积累了过多冗余/无关信息时，会影响推理质量。

**常见解决方案**：

- **记忆管理**：对短期记忆做摘要压缩，长期记忆存向量库按需召回
- **分 Agent 职责**：每个 Agent 只关注自身领域，减少无关信息进入 context
- **Prompt 优化**：明确 Agent 在什么情况下应该忽略历史中的非相关信息
- **定期清理**：设置 Token 阈值，触发自动摘要和裁剪

### 6.2 数据权限实现

用户问：如何让"IT、HR"看不同的表格？

```python
# 规则提前写好，不让 AI 自行判断
def get_user_tables(user_type: str) -> list:
    if user_type == "HR":
        return ["employee_info", "salary", "attendance"]
    elif user_type == "IT":
        return ["server_status", "deploy_logs", "incident"]
    else:
        return ["public_data"]

# 封装成工具函数，Agent 调用即可
# 权限规则固定下来，与大模型无直接关系
```

**关键原则**：权限判断逻辑不要让 AI 动态生成，涉及数据安全时要走预定义的规则层。

### 6.3 简历与面试准备

**简历要点**：

- 准备 3 页详细简历 → 再精简为 1 页摘要版（对面试官友好）
- 加一个 Link：blog/github 网址，展示作品集
- 要做自己的个人网页，酷炫展示作品集
- 之前与 AI 弱相关的项目经验，写通用的：**项目管理经验、代码调试经验、架构思维逻辑**
- 技术关键词 + 场景关键词结合

**项目经历准备 checklist**：

| 项目                   | 重点准备                                                     |
| ---------------------- | ------------------------------------------------------------ |
| 市场舆情监测 Agent     | 多工作流嵌套编排、情感分析、Markdown 三段式人设、PDF 日报链  |
| Dify 智能客服 ChatFlow | 私有化部署架构、ChatFlow vs Workflow 选型、RAG 分块 + Rerank 调优、引用归属 |
| ChatBI 金融问答助手    | 五段式架构、ExcSQLTool 封装、归一化对比分析、Polars 计算而非 LLM 算数 |

**每个项目需要讲清楚**：

1. 场景是什么
2. 为什么选这个框架
3. 核心模块怎么串联
4. 遇到什么坑怎么解决

**关于 Coze/Dify 在求职中的定位**：

- 阶段 1：Coze/Dify 在企业中有需求，帮业务同事快速搭建 + 个性化定制 → 铺量，服务各个条线
- 阶段 2：重点突破——上限不高，个性化的开发需要 AI 编程工具

### 6.4 Coze/Dify 学习路径建议

> 项目（需求）驱动 → 用 AI 帮你干活、做项目。持续深入学习的最好方式是不断用项目场景驱动自己。

**企业级 Agent 面试话术**：

> 单 Agent（理解用户需求）+ Skills（调用相关工具）+ SubAgents（分配给专业的 Agent）

### 6.5 数据库选型建议

| 数据库         | 适用场景                                       |
| -------------- | ---------------------------------------------- |
| **PostgreSQL** | 企业级应用、复杂查询、金融系统（公司用得更多） |
| **MySQL**      | Web 应用、中小规模系统                         |
| **PGVector**   | 已有 PG 的团队做向量检索（推荐）               |

### 6.6 供应商智能推荐项目概览

如果面试问到供应商推荐系统：

```mermaid
flowchart LR
    A[供应商库<br/>数万条] --> B[特征工程<br/>合作年限/红灯次数<br/>供货及时性/价格分数]
    B --> C{推荐方法}
    C --> D[方法1: 规则打分<br/>AI辅助生成打分规则]
    C --> E[方法2: 监督学习<br/>历史数据打标→模型]
    D --> F[Top-10推荐]
    E --> F
```

---

## 附录

### A. 关键术语速查

| 术语           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| Agent          | 能够自主推理、使用工具、记忆上下文的 AI 系统                 |
| ReAct          | Reason + Act，最经典的 Agent 范式                            |
| RAG            | Retrieval Augmented Generation，检索增强生成                 |
| CTA            | Call to Action，行动号召（如"点赞关注"）                     |
| SDD            | Specification-Driven Development，规范驱动开发               |
| TDD            | Test-Driven Development，测试驱动开发                        |
| CTE            | Common Table Expression，公用表表达式，用 WITH 定义临时结果集 |
| MCP            | Model Context Protocol，模型上下文协议                       |
| ChatBI         | 对话式商业智能                                               |
| PR             | Pull Request，代码变更申请                                   |
| CI/CD          | 持续集成/持续交付部署                                        |
| Onboarding     | 新人从入职到独立产出的上手适应期                             |
| Schema Linking | 用语义检索召回相关数据库表/字段定义                          |
| Few-shot       | 在 Prompt 中提供少量示例指导模型输出                         |
| Rerank         | 对初次召回结果做精排以提高相关性                             |
| ETL            | Extract-Transform-Load，数据抽取转换加载                     |

### B. 推荐资源

- **AI 编程工具**：Cursor（通用）、Claude Code（复杂重构）、Trae（国内免费）、Lingma（阿里生态）
- **Agent 平台**：Coze（快速 Demo）、Dify（私有化部署）
- **推理框架**：vLLM（生产通用）、SGLang（长上下文）、Ollama（本地验证）
- **框架**：LangChain、LangGraph、CrewAI、AutoGen
- **模型连接**：QwenLM GitHub：[https://github.com/QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)
- **量化研究**：Qlib（微软开源因子研究工具）
- **数据源**：Tushare 金融数据、miniQMT 量化交易

