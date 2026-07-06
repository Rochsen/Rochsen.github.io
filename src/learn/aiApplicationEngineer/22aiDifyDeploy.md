---
title: Dify本地化部署和应用
date: 2026-07-04
categories: [教程, 知乎]
tags: [AI, Agent, 低代码]
---

<!-- more -->

## 1. Dify 平台概述

### 1.1 什么是 Dify？

Dify 是一个开源的大语言模型（LLM）应用开发平台，融合了 **Agent**、**AI Workflow**、**RAG（检索增强生成）** 等核心能力，帮助开发者快速构建和部署 AI 原生应用。它可视化了 LangChain 的核心理念，降低了 AI 应用开发的门槛。

```mermaid
mindmap
  root((Dify 平台))
    LLM 应用
      对话应用 Chat App
      文本生成 Completion
      工作流 Workflow
    Agent
      工具调用 Tool Calling
      推理与规划
    RAG
      知识库管理
      Embedding 检索
      Rerank 重排序
    API 集成
      RESTful API
      SDK 调用
      Webhook 触发器
    私有化部署
      Docker Compose
      本地模型接入
      数据安全合规
```

### 1.2 Dify vs 其他平台

| 维度           | Dify                     | Coze                    | LangChain            |
| -------------- | ------------------------ | ----------------------- | -------------------- |
| **定位**       | 开源 LLM 应用平台        | 字节跳动智能体平台      | LLM 开发框架         |
| **部署方式**   | 私有化 Docker / Cloud    | 云端 SaaS / Coze Studio | 代码库集成           |
| **企业适用**   | ✅ 高（私有化、数据安全） | 中（国内生态好）        | 高（灵活但开发量大） |
| **低代码程度** | 高（可视化编排）         | 高（拖拽式）            | 低（纯代码）         |
| **工作流**     | ChatFlow + Workflow      | 单一流程                | 完全自定义           |
| **开源**       | ✅ 是                     | ❌ 否                    | ✅ 是                 |

---

## 2. Dify 本地化部署

### 2.1 部署架构

```mermaid
flowchart TB
    subgraph 用户环境["🖥️ 用户本地/服务器环境"]
        direction TB
        A[Docker Engine] --> B[Docker Compose]
        B --> C1[PostgreSQL 容器]
        B --> C2[Redis 容器]
        B --> C3[Weaviate/Qdrant 向量数据库]
        B --> C4[Dify API 容器]
        B --> C5[Dify Worker 容器]
        B --> C6[Dify Web 容器]
        B --> C7[Nginx 反向代理容器]
    end

    D[GitHub: langgenius/dify.git] -->|git clone| A
    E[.env 配置文件] --> B
    F[云端大模型 API<br/>OpenAI / Qwen / Anthropic] <-..->|API 调用| C4

    G[🌐 用户浏览器] -->|http://IP| C7
```

### 2.2 环境要求

| 资源     | 最低配置                   | 推荐配置           |
| -------- | -------------------------- | ------------------ |
| **内存** | ≥ 4 GB                     | ≥ 16 GB            |
| **CPU**  | ≥ 2 核                     | ≥ 4 核             |
| **硬盘** | 2-3 GB（仅 Dify）          | 10 GB+（含模型）   |
| **网络** | 需访问 Docker Hub / GitHub | 科学上网或国内镜像 |

### 2.3 部署步骤

#### Step 1：克隆 Dify 源码

```bash
git clone https://github.com/langgenius/dify.git
```

#### Step 2：配置 Docker 环境

```bash
cd dify/docker
cp .env.example .env
```

编辑 `.env` 文件，关键配置项：

```ini
# Dify 访问地址（生产环境替换为实际 IP）
APP_URL=http://localhost

# 大模型 API Keys
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
DASHSCOPE_API_KEY=sk-xxxxx     # 通义千问

# 数据库与中间件（保持默认即可）
DB_USERNAME=postgres
DB_PASSWORD=difyai123456
REDIS_PASSWORD=difyai123456
```

#### Step 3：启动 Dify

```bash
docker compose up -d
```

> `-d` 参数表示后台运行（守护进程模式）。

#### Step 4：初始化访问

- **初始化页面**: `http://<IP>/install`（首次设置管理员账号）
- **登录页面**: `http://<IP>/signin`
- **默认地址**: `http://localhost`（本地访问）

### 2.4 Dify 升级

```bash
cd dify/docker
git pull                          # 拉取最新代码
docker compose pull               # 拉取最新镜像
docker compose up -d              # 重新启动
```

### 2.5 部署生命周期

```mermaid
sequenceDiagram
    participant U as 用户
    participant G as GitHub
    participant D as Docker Engine
    participant DF as Dify 服务

    U->>G: git clone dify.git
    U->>D: cd dify/docker
    U->>D: cp .env.example .env
    Note over U,D: 配置 API Keys / 地址
    U->>D: docker compose up -d
    D->>DF: 拉取镜像 & 启动容器
    DF-->>U: http://IP/install 初始化
    U->>DF: 设置管理员账号
    DF-->>U: http://IP/signin 登录
    Note over U,DF: 正常使用...

    opt 升级流程
        U->>G: git pull
        U->>D: docker compose pull
        U->>D: docker compose up -d
    end
```

---

## 3. 核心概念：ChatFlow vs Workflow

Dify 提供两种核心应用编排模式，适用于不同的场景：

```mermaid
flowchart LR
    subgraph ChatFlow["💬 ChatFlow（对话流）"]
        direction TB
        CF1[用户输入] --> CF2[对话节点]
        CF2 --> CF3{条件判断}
        CF3 -->|分支 A| CF4[知识库检索]
        CF3 -->|分支 B| CF5[LLM 处理]
        CF4 --> CF6[回答节点]
        CF5 --> CF6
    end

    subgraph Workflow["⚙️ Workflow（工作流）"]
        direction TB
        WF1[输入参数] --> WF2[步骤 1: 数据处理]
        WF2 --> WF3[步骤 2: LLM 调用]
        WF3 --> WF4[步骤 3: 代码执行]
        WF4 --> WF5[输出结果]
    end

    ChatFlow -.- |"有状态（Memory）"| Note1[多轮对话记忆]
    Workflow -.- |"无状态（自动化）"| Note2[批处理 / 自动化管道]
```

### 对比总结

| 特性         | ChatFlow               | Workflow             |
| ------------ | ---------------------- | -------------------- |
| **核心场景** | 多轮对话、客服、咨询   | 自动化流程、数据处理 |
| **状态管理** | ✅ 有记忆（Memory）     | ❌ 无状态             |
| **交互方式** | 一问一答               | 一次输入 → 自动运行  |
| **输出节点** | 必须包含 "Answer" 节点 | 最终节点输出         |
| **适用举例** | 智能客服、AI 咨询      | 文档处理、批量分析   |

---

## 4. CASE 1：LLM — 联网搜索与关键词提取

### 4.1 场景描述

利用 Dify 构建一个**联网搜索智能问答系统**：用户输入问题 → 提取关键词 → 联网搜索 → 内容整理 → 返回答案。

### 4.2 工作流架构

```mermaid
flowchart TB
    INPUT[/"📥 输入：用户问题"/] --> LLM1["🤖 LLM 1 (qwen-turbo)<br/>任务：提取关键词<br/>多个关键词用空格隔开"]
    LLM1 --> KEYWORDS[/"🔑 关键词列表"/]
    KEYWORDS --> TAVILY["🔍 Tavily Search<br/>联网检索"]
    TAVILY --> LLM2["🤖 LLM 2 (qwen-turbo)<br/>任务：总结整理搜索结果<br/>回答用户问题"]
    LLM2 --> OUTPUT[/"📤 输出：最终答案"/]

    subgraph Prompt["📝 Prompt 设计"]
        P1["System Prompt:<br/>对网上搜索到的内容进行总结整理，来回答用户的问题"]
        P2["User Prompt:<br/>我的问题：{{LLM1.text}}<br/>网上的内容：{{tavily.text}}"]
    end

    LLM2 -.-> Prompt
```

### 4.3 为什么需要关键词提取？

| 方法                       | 优点               | 缺点           |
| -------------------------- | ------------------ | -------------- |
| **LLM 自带联网搜索**       | 方便快捷           | 搜索质量不可控 |
| **关键词 + Tavily Search** | 搜索更精准、可调优 | 需要两步处理   |

> 直接传原始问题给搜索引擎可能导致检索结果不精确，先提取关键词可以提升搜索召回质量。

### 4.4 Tavily Search 配置

1. 访问 [https://tavily.com/](https://tavily.com/) 注册获取 API Key
2. 在 Dify 中添加 Tavily Search 工具插件
3. 在工作流中拖入 TavilySearch 节点，配置 API Key

---

## 5. CASE 2：Agent — AI 文生图（古诗词配画）

### 5.1 场景描述

用户输入一句古诗词 → Agent 将其翻译为英文（前缀 "ancient china"）→ 调用 AI 文生图模型生成配画。

### 5.2 工作流架构

```mermaid
flowchart TB
    INPUT[/"📥 输入：古诗词<br/>例：离离原上草"/] --> LLM1["🤖 LLM 1 (qwen-turbo)<br/>任务：描绘画面意境"]
    LLM1 --> DESC[/"🖼️ 画面描述"/]
    DESC --> LLM2["🤖 LLM 2 (qwen-turbo)<br/>任务：翻译成英文<br/>前缀 'ancient china'"]
    LLM2 --> EN_DESC[/"🌐 英文描述：<br/>ancient china + ..."/]
    EN_DESC --> FLUX["🎨 Flux (SiliconFlow)<br/>任务：文生图"]
    FLUX --> OUTPUT[/"🖼️ 输出：配画图片"/]
```

### 5.3 文生图模型选项

```mermaid
graph LR
    subgraph 模型选择
        A[Stable Diffusion] --> D[Dify 内置]
        B[Flux<br/>Black Forest Labs] --> E[SiliconFlow API]
        C[DALL·E] --> F[Dify 内置]
    end

    E --> G["优势：速度快、效果好"]
    D --> H["优势：本地可控"]
    F --> I["优势：质量最高"]
```

### 5.4 SiliconFlow 配置步骤

1. 注册 SiliconCloud 获取 API Key
2. 在 Dify 的工具区添加 SiliconFlow 凭据
3. 工作流中选择 "SiliconCloud → Flux / Stable Diffusion"

### 5.5 关键提示词设计

```
System Prompt (LLM 1):
用户给你一句古诗词，你来描绘一幅画面

System Prompt (LLM 2):
翻译成英文，前面加上 "ancient china"
```

> ⚠️ 注意：每次运行生成的图片结果会不一样，这是生成式 AI 的固有特性。

---

## 6. CASE 3：ChatFlow — 智能客服系统

### 6.1 场景描述

构建一个**金融智能客服系统**，融合知识库、用户行为分析和投诉处理能力：

- 🏦 **知识库**: 港股交易规则、理财产品文档
- 👤 **用户画像**: 用户标签 + 行为事件
- 💬 **意图分类**: 营销咨询 / 投诉处理
- 🤖 **智能回复**: 基于上下文的个性化应答

### 6.2 整体架构

```mermaid
flowchart TB
    subgraph Input["📥 输入层"]
        Q["用户问题"]
        UID["用户 ID"]
    end

    subgraph Step1["Step 1: 知识库分类"]
        LLM_C["🤖 LLM 分类<br/>判断问题类型"]
        CAT1["分类1: 营销咨询"]
        CAT2["分类2: 投诉处理"]
    end

    subgraph Step2["Step 2: 知识库检索（RAG）"]
        direction TB
        KB["📚 知识库<br/>txt/pdf/excel/doc"]
        EMB["Embedding<br/>向量化"]
        RET["检索匹配<br/>TopK 筛选"]
        RERANK["Rerank<br/>gte-rerank 重排序"]
        SCORE["Score 阈值<br/>过滤低分结果"]
    end

    subgraph Step3["Step 3: 信息提取"]
        LLM_E["🤖 LLM 提取<br/>user_id / event_time / event_type"]
    end

    subgraph Step4["Step 4: 用户数据查询"]
        EXCEL["📊 Excel 查询<br/>user_behavior_event.xlsx<br/>user_tag.xlsx"]
    end

    subgraph Step5["Step 5: 智能回复"]
        LLM_R["🤖 LLM 回复生成<br/>共情安抚 + 数据查询 + 建议"]
    end

    subgraph Output["📤 输出"]
        REPLY["个性化客服回复<br/>≤200字"]
    end

    Input --> Step1
    Step1 -->|投诉处理| Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step5 --> Output
```

### 6.3 RAG 知识库处理流程

```mermaid
sequenceDiagram
    participant Doc as 📄 文档
    participant Chunk as ✂️ 分段
    participant Embed as 🔢 Embedding
    participant Store as 🗄️ 向量库
    participant Query as 🔍 查询
    participant Rerank as 📊 Rerank
    participant LLM as 🤖 LLM

    Doc->>Chunk: 文档分段（10-20% 重叠）
    Chunk->>Embed: 向量化
    Embed->>Store: 存储向量 + 原文
    Query->>Store: 检索 query -> 向量相似度
    Store->>Rerank: 返回 TopK chunks
    Rerank->>Rerank: gte-rerank 重排序
    Rerank->>Rerank: Score 阈值过滤
    Rerank->>LLM: 高质量上下文
    Note over LLM: "[context] {{#context#}} [/context]"
```

### 6.4 知识库质量优化策略

```mermaid
flowchart LR
    A["📁 原始文档"] --> B["筛选<br/>按类型/来源"]
    B --> C["打标签<br/>自动分类"]
    C --> D["分段策略<br/>语义分段"]
    D --> E["高质量知识库"]

    F["⚠️ 问题"] --> G["知识库未命中"]
    G --> H["方案 1：LLM 兜底回答"]
    G --> I["方案 2：直接说不知道"]
```

### 6.5 信息提取 Prompt 设计

```
你是一个智能信息提取助手。
你的任务是从用户提供的文本中准确地提取以下信息：
1. user_id: 用户的唯一标识符。
2. event_time: 事件发生的时间，改成日期格式
3. event_type: 事件类型，包括：查看持仓、浏览产品、搜索、
   登录、委托交易、推送点击、查看行情、集合竞价、咨询客服、
   风险警示、查看收益、浏览广告、推送未读。

请严格按照以下格式输出：
user_id: {user_id}, event_time: {event_time}, event_type: {event_type}

如果某个信息在用户文本中没有找到，请将对应的值设为 null
```

### 6.6 回复生成 Prompt 设计

```
# 角色定位:
- 专业投诉处理顾问

# 背景:
- 需通过共情语言安抚客户情绪，积极解决问题。
- 需核查关键信息，确保问题准确定位。

# 目标:
1. 回应话术：以共情安抚客户，表达积极解决态度。
2. 反馈你从数据库中查询到的情况（筛选与该用户user_id匹配的信息，
   说明具体的event_detail。无关信息不要回答）
3. 针对用户的问题给出建议
4. 回答文字简洁，通常不超过200字

# 以下是从用户数据库中检索出的信息：
{{#context#}}
```

---

## 7. CASE 4：MinerU + Dify — 智能文档分析

### 7.1 场景描述

利用 MinerU 的 PDF 解析能力 + Dify 的 LLM 能力，实现对复杂 PDF 文档（如学术论文）的智能分析与问答。

### 7.2 工作流架构

```mermaid
flowchart TB
    INPUT1[/"📥 输入1：uploaded_pdf<br/>PDF 文件上传"/] --> MINERU["🔧 MinerU API<br/>Base URL: http://mineru.net/<br/>任务：PDF → 结构化文本"]
    INPUT2[/"📥 输入2：user_question<br/>用户问题（≤100字）"/] --> LLM2

    MINERU --> MINERU_OUT[/"📄 MinerU 输出：结构化文本"/]
    MINERU_OUT --> LLM1["🤖 LLM 1 (qwen-turbo)<br/>System: 总结文档核心内容<br/>任务：理解文档"]

    LLM1 --> LLM1_OUT[/"📝 文档理解摘要"/]
    LLM1_OUT --> LLM2["🤖 LLM 2 (qwen-turbo)<br/>任务：基于文档回答用户问题"]

    LLM2 --> OUTPUT[/"📤 输出：<br/>针对文档内容的精准回答"/]
```

### 7.3 MinerU 配置

| 配置项     | 值                                   |
| ---------- | ------------------------------------ |
| Base URL   | `http://mineru.net/`                 |
| Token 获取 | `https://mineru.net/apiManage/token` |

### 7.4 为什么用 MinerU 而不是直接让 LLM 读取 PDF？

```mermaid
flowchart LR
    subgraph 方案A["❌ 方案 A：LLM 直接读 PDF"]
        A1["PDF 上传"] --> A2["LLM 多模态读取"]
        A2 --> A3["⚠️ 文字提取不准<br/>表格/公式丢失<br/>大文件受限"]
    end

    subgraph 方案B["✅ 方案 B：MinerU + Dify"]
        B1["PDF 上传"] --> B2["MinerU 专业解析"]
        B2 --> B3["结构化 Markdown 文本"]
        B3 --> B4["LLM 精准理解"]
    end
```

> MinerU 专为 PDF 解析优化，能更好地提取文字、表格、公式等结构化内容，输出为标准 Markdown 格式。

---

## 8. Agent API 编程集成

### 8.1 Coze API（cozepy SDK）

Coze 提供了 Python SDK `cozepy`，可以方便地与 Coze 智能体进行交互。

#### 8.1.1 SDK 架构

```mermaid
classDiagram
    class CozeClient {
        -api_token: str
        -bot_id: str
        -base_url: str
        -coze: Coze
        +__init__(api_token, bot_id, base_url)
        +chat_stream(message, user_id) Generator
        +chat(message, user_id) Optional[str]
        +chat_with_history(messages, user_id) Optional[str]
        +get_bot_info() Optional[Dict]
    }

    class CozeSDK {
        <<cozepy>>
        +Coze(auth, base_url)
        +chat.stream() 流式聊天
        +chat.create_and_poll() 同步聊天
        +bots.retrieve() 获取智能体信息
    }

    CozeClient --> CozeSDK : 封装

    note for CozeClient "config.py 配置:<br/>COZE_API_TOKEN<br/>COZE_BOT_ID<br/>COZE_CN_BASE_URL"
```

#### 8.1.2 获取凭证

**Step 1: 获取 API Token**

访问 [https://www.coze.cn/open/oauth/pats](https://www.coze.cn/open/oauth/pats) → 创建 Personal Access Token → 复制保存。

**Step 2: 获取 Bot ID**

进入智能体发布页面，从 URL 中提取 Bot ID：

```
https://www.coze.cn/store/agent/7507272032905199655?bot_id=true
                                   ↑ Bot ID
```

#### 8.1.3 代码示例

**配置（config.py）**:

```python
# Coze API 配置
COZE_API_TOKEN = "pat_xxxxxxxxxxxxxxxxxxxxx"
COZE_BOT_ID = "7658520471843536930"
COZE_CN_BASE_URL = "https://api.coze.cn"
DEFAULT_USER_ID = "user_12345"
```

**流式聊天**:

```python
from cozepy import Coze, TokenAuth, Message, ChatEventType, MessageContentType

coze = Coze(
    auth=TokenAuth(token="your_api_token"),
    base_url="https://api.coze.cn"
)

# 流式接收回复
for event in coze.chat.stream(
    bot_id="your_bot_id",
    user_id="user_123",
    additional_messages=[Message.build_user_question_text("你好")]
):
    if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
        if event.message.content.type == MessageContentType.TEXT:
            print(event.message.content.text, end="", flush=True)
```

**普通聊天**:

```python
from cozepy import ChatStatus

chat_poll = coze.chat.create_and_poll(
    bot_id="your_bot_id",
    user_id="user_123",
    additional_messages=[Message.build_user_question_text("你好")]
)

if chat_poll.chat.status == ChatStatus.COMPLETED:
    for message in chat_poll.messages:
        if message.role == "assistant" and message.content:
            print(f"智能体: {message.content}")
```

**客户端封装使用**:

```python
from coze_client import CozeClient

client = CozeClient()

# 流式模式
for chunk in client.chat_stream("你好，请介绍一下自己"):
    print(chunk, end="", flush=True)

# 普通模式
response = client.chat("你好，请介绍一下自己")
print(response)
```

#### 8.1.4 Coze API 调用流程

```mermaid
sequenceDiagram
    participant App as Python 应用
    participant Client as CozeClient
    participant SDK as cozepy SDK
    participant API as Coze API
    participant Bot as Coze 智能体

    App->>Client: 初始化(api_token, bot_id)
    Client->>SDK: Coze(auth=TokenAuth, base_url)
    App->>Client: chat_stream("你好")
    Client->>SDK: coze.chat.stream()
    SDK->>API: POST /v3/chat
    API->>Bot: 触发智能体
    Bot-->>API: SSE 流式事件
    API-->>SDK: ChatEvent 事件流
    SDK-->>Client: yield 文本片段
    Client-->>App: 逐字输出
```

---

### 8.2 Dify API

Dify 提供了完整的 RESTful API，支持三种应用类型的调用。

#### 8.2.1 API 类型

```mermaid
graph TB
    subgraph DifyAPI["Dify API 端点"]
        direction LR
        EP1["/chat-messages<br/>💬 对话应用"]
        EP2["/completion-messages<br/>📝 文本生成应用"]
        EP3["/workflows/run<br/>⚙️ 工作流应用"]
    end

    Auth["🔐 认证方式<br/>Authorization: Bearer {api_key}"]

    Auth --> DifyAPI

    EP1 --> R1["支持 conversation_id<br/>多轮对话记忆"]
    EP2 --> R2["inputs 参数<br/>自定义变量"]
    EP3 --> R3["inputs 参数<br/>触发工作流"]
```

#### 8.2.2 获取 API 凭证

在 Dify 平台中：**应用 → 访问 API → API 密钥**，获取 API Key。

- **API Base URL**: `https://api.dify.ai/v1`（Cloud）或 `http://<你的IP>/v1`（本地部署）

#### 8.2.3 SDK 类设计

```mermaid
classDiagram
    class DifyAgentClient {
        -base_url: str
        -api_key: str
        -headers: dict
        +chat_completion(user_input, user_id, conversation_id, stream, app_type) Dict
        +run_workflow(inputs, user_id, stream) Dict
        +completion_message(user_input, user_id, stream, inputs) Dict
        +get_conversation_messages(conversation_id, user_id) Dict
        -_try_chat_endpoint() Dict
        -_try_completion_endpoint() Dict
        -_try_workflow_endpoint() Dict
        -_handle_blocking_response() Dict
        -_handle_streaming_response() Dict
        -_handle_workflow_blocking_response() Dict
        -_handle_workflow_streaming_response() Dict
    }

    note for DifyAgentClient "自动检测应用类型:<br/>chat → completion → workflow<br/>按优先级尝试"
```

#### 8.2.4 代码示例

**Chat App 调用（对话流）**:

```python
from dify_agent_client import DifyAgentClient

client = DifyAgentClient(
    base_url="https://api.dify.ai/v1",
    api_key="app-xxxxxxxxxxxx"
)

result = client.chat_completion(
    user_input="我的用户id：7501690985227960354，我在5月4日登录了软件，但是没有成功",
    user_id="demo_user",
    app_type="chat"  # 明确指定为对话流类型
)

if not result.get("error"):
    print(f"回复: {result['answer']}")
    print(f"会话ID: {result['conversation_id']}")
```

**Workflow 调用**:

```python
from dify_agent_client import DifyAgentClient

client = DifyAgentClient(
    base_url="https://api.dify.ai/v1",
    api_key="app-DoQ8YDcVNqGRdD6UqffkWq0B"
)

result = client.run_workflow(
    inputs={"input": "离离原上草"},
    user_id="demo_user"
)

if not result.get("error"):
    print(f"工作流回复: {result['answer']}")
    print(f"运行ID: {result['workflow_run_id']}")
```

#### 8.2.5 Dify API 调用流程

```mermaid
sequenceDiagram
    participant App as Python 应用
    participant Client as DifyAgentClient
    participant API as Dify API

    App->>Client: chat_completion(user_input, app_type="auto")

    alt 尝试 Chat 端点
        Client->>API: POST /chat-messages
        API-->>Client: 200 OK → 返回结果
        API-->>Client: 错误 (not_chat_app)
    end

    alt 尝试 Completion 端点
        Client->>API: POST /completion-messages
        API-->>Client: 200 OK → 返回结果
        API-->>Client: 错误 (app_unavailable)
    end

    alt 尝试 Workflow 端点
        Client->>API: POST /workflows/run
        API-->>Client: 200 OK → 返回结果
    end

    Client-->>App: 统一格式的响应 Dict
```

---

## 9. FAQ 常见问题汇总

```mermaid
graph TB
    subgraph 部署类
        Q1["Q: Dify 需要安装吗？"]
        A1["A: 需要，通过 git clone + docker compose 部署"]
        Q2["Q: 安装 Dify 需要什么规格主机？"]
        A2["A: 最低 4G 内存/2核 CPU，推荐 16G 内存"]
        Q3["Q: Dify 需要多大硬盘空间？"]
        A3["A: Dify 本身 2-3G，含模型建议 10G+"]
        Q4["Q: 怎么安装 Docker？"]
        A4["A: 官网 docker.com 下载 Docker Desktop"]
        Q5["Q: Dify 升级怎么操作？"]
        A5["A: git pull → docker compose pull → docker compose up -d"]
    end

    subgraph 使用类
        Q6["Q: Dify 适合企业应用吗？"]
        A6["A: 适合，支持私有化部署、数据安全、权限管理"]
        Q7["Q: Dify 能对接飞书吗？"]
        A7["A: 可以，通过 API/Webhook 对接"]
        Q8["Q: Dify 和 Coze 哪个好？"]
        A8["A: 企业用 Dify 多（私有化），Coze 更好上手"]
        Q9["Q: Dify 和 n8n 一样吗？"]
        A9["A: 不同，Dify 专注 LLM 应用，n8n 是通用自动化"]
    end

    subgraph 技术类
        Q10["Q: 为什么知识库是单独节点？"]
        A10["A: 检索 query → 知识库中筛选出 chunks"]
        Q11["Q: 没查知识库怎么走后续节点？"]
        A11["A: LLM 兜底回答或直接说不知道"]
        Q12["Q: 如何连接 Oracle 数据库？"]
        A12["A: 通过微服务或 MCP 做中转"]
        Q13["Q: 最轻量级知识库+远程AI方案？"]
        A13["A: qwen-agent / langchain / llamaindex"]
    end
```

### 更多 Q&A


<b>Q: Coze 200万的方案凭什么值200万？</b>


A: Coze 的 enterprise 解决方案包含专属部署、模型精调、运维支持和 SLA 保障，不仅是软件本身。



<b>Q: 低代码方便但不可预测性和掌控性差？</b>


A: 是的，这是固有取舍。低代码适合快速验证，纯代码（LangChain/LangGraph）适合复杂定制。实际项目中可以混合使用：低代码搭主体，代码做插件。



<b>Q: AI 智能体架构师需要哪些技能？</b>


1. **AI Agent 搭建**：RAG、工具调用、Workflow 编排
2. **模型微调**：LoRA、数据工程
3. **数据决策**：数据分析、策略设计



<b>Q: 什么时候用私有化大模型？</b>


1. **数据安全**：敏感数据不能上云
2. **模型微调**：需要定制化模型能力



<b>Q: Agent 可以 Coze + Trae 混合开发吗？怎么封装？</b>


- Coze 搭建主体流程
- Trae 进行插件搭建
- 最终通过 API 或 SDK 封装为统一服务
  

---

## 10. 附录：环境依赖与参考链接

### 10.1 Python 依赖

**Coze API 项目** (`requirements.txt`):

```
cozepy>=0.7.0
python-dotenv>=1.0.0
```

**Dify API 项目** (`requirements.txt`):

```
requests==2.31.0
python-dotenv==1.0.0
```

### 10.2 项目文件结构

```
20-Dify本地化部署和应用/
├── 1-Dify部署与应用.pdf              # 课程主文档
├── 笔记20260405.txt                   # 课堂问答笔记
├── CASE-Coze API使用/
│   ├── config.py                      # Coze API 配置
│   ├── coze_client.py                 # Coze 客户端封装
│   └── requirements.txt               # Python 依赖
├── CASE-Dify API使用/
│   ├── dify_agent_client.py           # Dify API 客户端
│   ├── dify_chat_example.py           # Chat App 示例
│   ├── dify_workflow_example.py       # Workflow 示例
│   └── requirements.txt               # Python 依赖
├── CASE-智能客服ChatFlow/
│   ├── user_behavior_event.xlsx       # 用户行为事件数据
│   ├── user_tag.xlsx                  # 用户标签数据
│   ├── 港股交易规则介绍.pdf           # 知识库文档
│   ├── 平安财富日添利理财产品.doc     # 知识库文档
│   ├── 上海证券交易所交易规则.pdf    # 知识库文档
│   └── 中国平安金裕人生理财产品.doc  # 知识库文档
└── CASE-智能文档分析助手/
    └── INTERNVIDEO2.5.pdf             # 学术论文分析案例
```

### 10.3 参考链接

| 资源           | 地址                                                         |
| -------------- | ------------------------------------------------------------ |
| Dify 官网      | [https://dify.ai](https://dify.ai)                           |
| Dify Cloud     | [https://cloud.dify.ai/apps](https://cloud.dify.ai/apps)     |
| Dify GitHub    | [https://github.com/langgenius/dify](https://github.com/langgenius/dify) |
| Coze 中国      | [https://www.coze.cn](https://www.coze.cn)                   |
| Coze API Token | [https://www.coze.cn/open/oauth/pats](https://www.coze.cn/open/oauth/pats) |
| Tavily Search  | [https://tavily.com](https://tavily.com)                     |
| MinerU         | [https://mineru.net](https://mineru.net)                     |
| Docker 官网    | [https://www.docker.com](https://www.docker.com)             |

### 10.4 技术栈总览

```mermaid
graph TB
    subgraph Platform["🏗️ 平台层"]
        Dify[Dify<br/>LLM 应用平台]
        Coze[Coze<br/>智能体平台]
    end

    subgraph LLM["🧠 模型层"]
        Qwen[通义千问 Qwen]
        GPT[OpenAI GPT]
        Claude[Anthropic Claude]
        DeepSeek[DeepSeek]
    end

    subgraph Tools["🔧 工具 & 服务"]
        Tavily[Tavily Search<br/>联网搜索]
        MinerU[MinerU<br/>PDF 解析]
        Flux[Flux / SD<br/>文生图]
        SiliconFlow[SiliconFlow<br/>模型 API 网关]
    end

    subgraph Infra["🖥️ 基础设施"]
        Docker[Docker Compose]
        PG[PostgreSQL]
        Redis[Redis]
        VectorDB[向量数据库]
    end

    subgraph SDK["💻 SDK"]
        Cozepy[Cozepy]
        Requests[Python Requests]
    end

    Dify --> Qwen
    Dify --> GPT
    Dify --> Claude
    Coze --> Qwen
    Coze --> DeepSeek

    Dify --> Tavily
    Dify --> MinerU
    Dify --> Flux
    Dify --> SiliconFlow

    Dify --> Docker
    Docker --> PG
    Docker --> Redis
    Docker --> VectorDB

    Coze --> Cozepy
    Dify --> Requests
```
