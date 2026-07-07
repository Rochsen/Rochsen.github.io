---
title: Agent调试、运维与系统集成
date: 2026-07-04
categories: [教程, 知乎]
tags: [AI, Agent, 低代码]
---

<!-- more -->

## 1. 概述与学习目标

本课程聚焦 **Agent 进阶与集成**，涵盖从低代码到高代码的完整 Agent 开发链路：

- **批处理**：对同类型多任务进行批量并行处理
- **Coze 应用**：构建带 UI 表单的应用级 Agent
- **数据表使用**：结构化数据的动态查询与写入
- **多 Agents 模式**：分诊台 + 专业子 Agent 的协作架构
- **多工作流复杂应用**：嵌套工作流、跨工作流数据传递
- **Agent 集成**：通过 API 将 Agent 嵌入现有业务系统

```mermaid
mindmap
  root((Agent 进阶与集成))
    批处理
      大模型批处理
      插件批处理
      代码节点批处理
    Coze 应用
      表单设计
      事件绑定
      页面跳转
    数据表
      SQL 查询
      动态写入
      字段索引
    多 Agents
      分诊台路由
      营销专员
      投诉专员
    API 集成
      Coze API
      Dify API
      流式/阻塞
    高代码框架
      LangChain
      LangGraph
      AutoGen
      Qwen-Agent
```

## 2. Agent 核心架构

### 2.1 Agent 组成公式

```
Agent = System Prompt + RAG（知识库） + 数据表 + 工具（插件/工作流）
```

```mermaid
flowchart LR
    A[用户输入] --> B[Agent 运行时]
    B --> C{RAG 检索}
    C -->|首次运行| D[知识库召回 Top-K Chunks]
    D --> E[System Prompt 扩展]
    E --> F[LLM 推理]
    B --> G{工具调用}
    G --> H[插件/工作流]
    G --> I[数据表查询/写入]
    H --> J[结果汇总]
    I --> J
    F --> J
    J --> K[输出响应]
```

### 2.2 Agent 运行时流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant A as Agent 调度器
    participant R as RAG 检索
    participant L as LLM
    participant T as 工具/插件
    participant D as 数据表

    U->>A: 发送问题
    A->>R: 启动 RAG 检索（只执行一次）
    R-->>A: 返回 Top-K 相关切片
    A->>L: System Prompt + RAG Chunks + User Prompt
    L->>T: 判断需要调用工具
    T-->>L: 返回工具结果
    L->>D: 如需查询/写入数据
    D-->>L: 返回数据
    L->>A: 汇总最终回答
    A->>U: 输出响应
```

---

## 3. 低代码 Agent 开发平台对比

| 特性     | **Coze（扣子）**               | **Dify**                   |
| -------- | ------------------------------ | -------------------------- |
| 开发商   | 字节跳动                       | 开源社区                   |
| 定位     | AI Agent 智能体开发平台        | LLM 应用开发平台           |
| 应用类型 | 智能体、应用（App）            | 对话流、工作流、文本生成   |
| 批处理   | ✅ 支持（大模型/插件/代码节点） | ✅ 支持                     |
| 多 Agent | ✅ 原生多 Agents 模式           | ⚠️ 通过工作流编排           |
| 数据库   | ✅ 内置数据表（SQL 查询）       | ✅ 知识库 + 外部数据库      |
| API 集成 | `cozepy` SDK / REST API        | REST API（标准 SSE）       |
| 部署方式 | SaaS（coze.cn / coze.com）     | SaaS（Dify Cloud）/ 自部署 |
| 适用人群 | 业务人员 + 低代码开发者        | 开发者 + 技术团队          |

```mermaid
quadrantChart
    title "低代码 vs 高代码 Agent 平台定位"
    x-axis "简单场景 --> 复杂场景"
    y-axis "低代码 --> 高代码"
    quadrant-1 "企业级方案"
    quadrant-2 "深度开发"
    quadrant-3 "快速原型"
    quadrant-4 "灵活定制"
    "Coze 低代码": [0.5, 0.25]
    "Dify": [0.55, 0.4]
    "LangChain": [0.65, 0.7]
    "LangGraph": [0.8, 0.8]
    "AutoGen": [0.85, 0.85]
    "Qwen-Agent": [0.7, 0.75]
```

---

## 4. CASE 1：古诗词绘画（批处理）

### 4.1 业务场景

用户输入完整古诗词，AI 自动拆解为 4 个场景，对每个场景进行文生图提示词制作，最终生成 4 张绘画作品。

### 4.2 工作流架构

```mermaid
flowchart TD
    START([用户输入古诗词]) --> LLM1[大模型节点<br/>场景描述生成]
    LLM1 --> CODE[代码节点<br/>正则切分场景]
    CODE --> BATCH_LLM[大模型批处理<br/>文生图提示词制作]
    BATCH_LLM --> BATCH_PLUGIN[插件批处理<br/>text2image 文生图]
    BATCH_PLUGIN --> END_NODE([输出 4 张图片])
```

### 4.3 核心代码实现

#### 场景切分代码节点（Python）

```python
import re

async def main(args: Args) -> Output:
    params = args.params
    # 提取场景文本
    scenes_text = params['input']
    # 使用正则表达式匹配场景
    scene_pattern = r'场景\d+：([^场景]+)'
    scenes = []

    # 查找所有匹配
    for match in re.finditer(scene_pattern, scenes_text, re.DOTALL):
        scene_text = match.group(1).strip()
        scenes.append(scene_text)

    # 构建输出对象
    ret: Output = {
        "scenes": scenes,       # 场景数组
        "scene_count": len(scenes),  # 场景数量
    }
    return ret
```

#### 数据流转示意

```mermaid
flowchart LR
    subgraph Step1[场景描述]
        A["离离原上草"] -->|大模型| B["场景1: 辽阔原野...<br/>场景2: 季节更替...<br/>场景3: 野火蔓延...<br/>场景4: 春风拂过..."]
    end
    subgraph Step2[场景切分]
        B -->|代码节点| C["scenes[0]: 辽阔的原野上...<br/>scenes[1]: 随着季节更替...<br/>scenes[2]: 不知何时...<br/>scenes[3]: 寒冷冬天过去..."]
    end
    subgraph Step3[批处理-提示词]
        C -->|批处理大模型| D["提示词1<br/>提示词2<br/>提示词3<br/>提示词4"]
    end
    subgraph Step4[批处理-绘图]
        D -->|批处理text2image| E["🖼️ 图片1<br/>🖼️ 图片2<br/>🖼️ 图片3<br/>🖼️ 图片4"]
    end
```

### 4.4 关键技术点

| 技术点           | 说明                                                |
| ---------------- | --------------------------------------------------- |
| **批处理模式**   | 将数组数据拆分为 item，对每个 item 并行执行相同逻辑 |
| **代码节点**     | 在 Coze IDE 中使用 `Ctrl+I` 调用 AI 辅助编写代码    |
| **输出变量传递** | `scenes` 和 `scene_count` 作为节点间数据桥梁        |
| **插件选择**     | `text2image` 插件，`model_type=1` 提高出图质量      |

---

## 5. CASE 2：智能投顾助手（风险评测与推荐）

### 5.1 业务场景

用户通过表单填写风险评测问卷，AI 根据风险等级从知识库中匹配最合适的 3 款金融产品，并通过流式输出展示推荐结果。

### 5.2 应用架构

```mermaid
flowchart TD
    subgraph 用户界面
        FORM[表单页面<br/>client_id / 年龄 / 投资经验 / 风险偏好]
        RESULT[结果页面<br/>流式展示推荐产品]
    end

    subgraph 工作流 product_rec
        START_NODE[开始节点<br/>接收 age, exp_level, risk_tolerance, client_id]
        DB[数据库节点<br/>写入 client_risk_assessment 表]
        LLM_KB[大模型 + 知识库<br/>匹配推荐 3 款产品]
        END_NODE[结束节点<br/>Markdown 流式输出]
    end

    FORM -->|提交事件| START_NODE
    START_NODE --> DB
    DB --> LLM_KB
    LLM_KB --> END_NODE
    END_NODE -->|流式输出| RESULT
```

### 5.3 风险评测问卷设计

| 字段     | 问题                                  | 变量名           | 类型   | 验证  |
| -------- | ------------------------------------- | ---------------- | ------ | ----- |
| 客户 ID  | 请输入客户 ID                         | `client_id`      | String | —     |
| 年龄     | 请输入您的年龄（18-70 岁）            | `age`            | Number | 18-70 |
| 投资经验 | 投资经验：1. <1 年 2. 1-3 年 3. >3 年 | `exp_level`      | Number | 1/2/3 |
| 风险偏好 | 最大本金亏损比例：A.10% B.20% C.30%   | `risk_tolerance` | String | A/B/C |

### 5.4 产品推荐 Prompt

```
你是一名证券投顾，根据客户的风险测评结果，从知识库中筛选最匹配的3款产品：
- 年龄：{{age}}岁
- 投资经验：{{exp_level}}级（1=新手，3=资深）
- 风险偏好：{{risk_tolerance}}（能承受的最大本金亏损比例，A=10%, B=20%, C=30%）

筛选规则：
1. 优先匹配风险等级（R1/R2/R3对应A/B/C）。
2. 新手客户（exp_level=1）避免推荐复杂衍生品。
3. 返回格式：
**产品名称**（代码）
- 匹配理由：结合客户年龄和风险偏好说明
```

### 5.5 ABC 证券产品矩阵

```mermaid
graph LR
    subgraph 保守型 R1
        P3[ABC优质债券基金<br/>年化4%-5%<br/>最大回撤3%]
        P6[ABC货币市场基金<br/>年化2%-3%<br/>最大回撤0.5%]
    end
    subgraph 稳健型 R2
        P1[ABC稳健增长混合基金<br/>年化5%-7%<br/>最大回撤8%]
        P4[ABC沪深300指数基金<br/>年化7%-9%<br/>最大回撤12%]
        P8[ABC可转债基金<br/>年化6%-10%<br/>最大回撤12%]
    end
    subgraph 积极型 R3
        P2[ABC科技先锋股票基金<br/>年化8%-12%<br/>最大回撤18%]
        P5[ABC全球精选QDII基金<br/>年化6%-10%<br/>最大回撤15%]
        P7[ABC量化对冲基金<br/>年化8%-12%<br/>最大回撤10%]
    end
```

### 5.6 关键技术点

| 技术点         | 说明                                                    |
| -------------- | ------------------------------------------------------- |
| **数据表**     | `client_risk_assessment` 持久化存储用户评测结果         |
| **知识库分段** | 使用 `###产品` 作为自定义分段标识，确保产品信息完整召回 |
| **流式输出**   | 结束节点开启 Markdown 流式输出，提升用户交互体验        |
| **Coze 应用**  | 表单组件 + 事件绑定 + 页面跳转，构建完整 App            |

---

## 6. CASE 3：客户分层营销助手

### 6.1 业务场景

AI 助手根据客户资产、交易频率及风险偏好自动生成分层标签，匹配个性化营销策略（时机、渠道、话术），提升客户营销效率。

### 6.2 数据架构

```mermaid
erDiagram
    USER_TAG {
        string user_id PK "客户ID"
        string asset_scale "资产规模"
        string trading_frequency "交易频率"
        string risk_preference "风险偏好"
    }
    USER_BEHAVIOR_EVENT {
        string user_id FK "客户ID"
        string event_time "事件时间"
        string event_type "事件类型（登录/点击等）"
        string event_detail "事件详情"
    }
    MARKETING_STRATEGY {
        string tag "客户标签"
        string timing "营销时机"
        string channel "推荐渠道"
        string script "话术示例"
    }
    USER_TAG ||--o{ USER_BEHAVIOR_EVENT : "产生"
    USER_TAG ||--o{ MARKETING_STRATEGY : "匹配"
```

### 6.3 Agent 工作流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant A as 营销助手 Agent
    participant DB as 数据表
    participant KB as 知识库（营销策略）

    U->>A: 为客户设计营销策略<br/>user_id: 7501691024880730112
    A->>KB: RAG 检索营销策略
    KB-->>A: 返回策略匹配参考
    A->>DB: 查询 user_tag 表（资产/交易/风险）
    DB-->>A: 客户标签数据
    A->>DB: 查询 user_behavior_event 表（近期行为）
    DB-->>A: 行为事件数据
    A->>A: 生成分层标签 + 匹配策略
    A->>U: 输出标签 + 营销时机 + 渠道 + 话术
```

### 6.4 Agent 人设 Prompt（核心部分）

```
# 角色
你是一个智能营销助手，能够依据客户的资产规模、交易频率以及风险偏好，
自动精准生成分层标签。同时，可根据客户行为，匹配与之对应的营销策略，
涵盖营销时机、渠道以及合适的话术。

## 技能
### 技能1: 生成分层标签
根据客户资产规模、交易频率、风险偏好，生成匹配的分层标签。
例如：若客户资产规模大、交易频率高且风险偏好高，
生成"高价值高活跃高风险偏好客户"标签。

### 技能2: 匹配营销策略
1. 结合客户近期行为数据（如浏览产品种类、咨询频率）
2. 筛选最适配的营销策略：
   - 最佳营销时机（如客户浏览特定产品后的24小时内）
   - 合适的营销渠道（短信、邮件、电话等）
   - 针对性营销话术（根据客户偏好定制）

## 限制
- 仅围绕客户分层标签生成和营销策略匹配相关内容操作
- 输出内容需条理清晰
- 所有操作基于给定的客户数据和策略库
```

### 6.5 关键技术点

| 技术点                  | 说明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| **知识库+数据表双通道** | 知识库存储营销策略文档（RAG 召回），数据表存储用户动态数据（SQL 查询） |
| **RAG 执行时机**        | RAG 只在 Agent 启动时执行一次，作为 System Prompt 的拓展     |
| **Few-Shot**            | 在提示词中说明标签范围，防止 Agent 超出标签范围生成结果      |
| **标签召回**            | 知识库需要设置标签才能进行有效召回                           |

---

## 7. CASE 4：智能客服 Agent（多 Agent 模式）

### 7.1 业务场景

设置两个智能体（营销专员 + 投诉专员）和一个分诊台路由 Agent，实现产品咨询和投诉处理的自动化分流，提供 7×24 小时客户服务。

### 7.2 多 Agent 协作架构

```mermaid
flowchart TD
    U[用户输入] --> TRIAGE{分诊台 Agent<br/>意图判断}

    TRIAGE -->|产品咨询/基础问题| MARKETING[营销专员 Agent]
    TRIAGE -->|投诉/个人信息/操作问题| COMPLAINT[投诉专员 Agent]

    subgraph 营销专员能力
        MKB[证券知识库<br/>- 港股交易规则<br/>- 上交所交易规则<br/>- 理财产品文档]
        M_SKILL[技能：产品介绍 / 交易规则解答 / 组合推荐]
        MKB --> M_SKILL
    end

    subgraph 投诉专员能力
        CDB1[user_behavior_event<br/>用户行为事件表]
        CDB2[user_tag<br/>用户标签表]
        CDB3[user_complain<br/>投诉记录表]
        C_SKILL[技能：行为核查 / 共情安抚 / 投诉录入]
        CDB1 --> C_SKILL
        CDB2 --> C_SKILL
        C_SKILL --> CDB3
    end

    MARKETING --> M_SKILL
    COMPLAINT --> C_SKILL
    M_SKILL --> OUTPUT[输出响应]
    C_SKILL --> OUTPUT
```

### 7.3 分诊台 Agent Prompt

```
# Role:
- 智能客服分诊台

# Background:
- 用于判断用户提出的问题是否为产品咨询（营销类），还是投诉问题。

# Goals:
- 判断用户问题的类别：营销问题，投诉问题

# Skills:
- 理解用户问题分类

# Constrains:
- 不做任何回复，只需要转到适合的Agent（营销专员，投诉专员）
- 当用户输入：投诉相关，产品使用不成功，用户问题涉及到个人信息，
  以及需要后台记录的信息时跳转到"投诉专员"
- 当用户输入：产品使用疑问，怎么使用，或者产品咨询等问题和基础问题时，
  跳转到"营销专员"节点
```

### 7.4 投诉专员 Prompt（核心部分）

```
# 角色定位:
- 专业投诉处理顾问（证券公司客户投诉处理智能体）

# 目标:
1. 首条回应话术：以共情安抚客户，表达积极解决态度。
2. 关于软件的操作，需要根据客户的情况，进行核实并反馈，
   使用 user_behavior_event 数据表进行查询
3. 关于客户投诉，需要添加到 user_complain 数据表
   complain_type：产品使用 / 系统故障 / 业务办理

# 约束:
- 添加投诉前，先需要进行核实用户行为，并进行反馈。
  如果确实是有问题，再添加到投诉中
- 回复必须体现共情和积极解决态度。
- 遵守证券行业合规要求，避免承诺投资建议。
```

### 7.5 多 Agent 切换规则

```mermaid
stateDiagram-v2
    [*] --> 分诊台
    分诊台 --> 营销专员: 产品咨询/基础问题/怎么使用
    分诊台 --> 投诉专员: 投诉/个人信息/操作失败/后台记录
    营销专员 --> [*]: 产品介绍/交易规则/推荐
    投诉专员 --> [*]: 行为核查/共情安抚/投诉录入
```

### 7.6 知识库文档清单

| 文档                         | 类型 | 用途             |
| ---------------------------- | ---- | ---------------- |
| 港股交易规则介绍.pdf         | PDF  | 港股交易规则知识 |
| 上海证券交易所交易规则.pdf   | PDF  | A股交易规则知识  |
| 平安财富日添利理财产品.doc   | DOC  | 理财产品信息     |
| 中国平安金裕人生理财产品.doc | DOC  | 理财产品信息     |

---

## 8. CASE 5：市场舆情监测 Agent

### 8.1 业务场景

用户输入查询日期 → 获取新浪财经新闻、APP 评论等舆情数据 → 数据分析 → 生成词云图（热点词云/好评词云/差评词云）→ 数据整合生成日报 → 生成 PDF 并返回链接。

### 8.2 工作流全景架构

```mermaid
flowchart TD
    U[用户输入日期] --> SEC[工作流 Securities<br/>主控工作流]

    subgraph SEC[工作流 Securities]
        S1[插件: securities_past<br/>抓取新浪财经新闻] --> S2[批处理: 日期筛选<br/>JS 代码判断同日]
        S2 --> S3[大模型: 新闻摘要]
        S3 --> S4[代码: 数据清洗]
        S4 --> S5[大模型: 热词/风险词提取]
        S5 --> S6[大模型: 去停用词]
        S6 --> S7[插件: WordCloud 生成热点词云]
        S7 --> S8[调用子工作流 AppStoreEstimate]
        S7 --> S9[调用子工作流 GenerateDailyReports]
    end

    subgraph APP[工作流 AppStoreEstimate]
        A1[插件: AppStorePast<br/>抓取 App 评论] --> A2[批处理: 评论分类<br/>好评/中性/差评]
        A2 --> A3[代码: 筛选好评/差评]
        A3 --> A4[大模型: 去停用词]
        A4 --> A5[插件: WordCloud<br/>好评词云+差评词云]
    end

    subgraph REPORT[工作流 GenerateDailyReports]
        R1[大模型: 整理热点新闻] --> R2[大模型: 整理用户评论分析]
        R2 --> R3[大模型: 整理好评/差评]
        R3 --> R4[文本处理: 字符串拼接整合]
        R4 --> R5[大模型: 日报撰写]
        R5 --> R6[插件: create_document<br/>生成 PDF]
    end

    S8 --> APP
    APP --> S9
    S9 --> REPORT
    REPORT --> PDF[输出 PDF 链接]
```

### 8.3 核心插件代码

#### 新浪财经新闻抓取（securities_past.py）

```python
from runtime import Args
from typings.securities_past.securities_past import Input, Output
import requests
from bs4 import BeautifulSoup

def get_news_list(page=1, logger=None):
    url = f"https://feed.mix.sina.com.cn/api/roll/get?pageid=186&lid=1746&num=10&page={page}"
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers, timeout=10)
    data = resp.json()
    return data.get("result", {}).get("data", [])

def get_news_detail(news_url, logger=None):
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(news_url, headers=headers, timeout=10)
    resp.encoding = resp.apparent_encoding
    soup = BeautifulSoup(resp.text, "lxml")
    # 发布时间提取（多选择器兼容）
    pub_time = ""
    for sel in [
        ("span", {"class": "date"}),
        ("span", {"id": "pub_date"}),
        ("meta", {"property": "article:published_time"}),
    ]:
        tag = soup.find(*sel)
        if tag:
            pub_time = tag.get("content") if tag.name == "meta" else tag.text.strip()
            if pub_time: break
    # 正文提取（多选择器兼容）
    content = ""
    for sel in [
        ("div", {"id": "artibody"}),
        ("div", {"class": "article"}),
    ]:
        div = soup.find(*sel)
        if div:
            content = "\n".join([p.text.strip() for p in div.find_all("p") if p.text.strip()])
            if content: break
    return pub_time, content

def handler(args: Args[Input]) -> Output:
    logger = getattr(args, "logger", None)
    all_news = []
    for page in range(1, 21):  # 抓取前 20 页
        news_list = get_news_list(page, logger=logger)
        for news in news_list[:3]:  # 每页取前 3 条
            title = news.get("title")
            url = news.get("url")
            try:
                pub_time, content = get_news_detail(url, logger=logger)
                all_news.append({
                    "title": title,
                    "publish_time": pub_time,
                    "content": content,
                    "url": url
                })
            except Exception as e:
                if logger:
                    logger.error(f"解析失败: {e}")
    return {"data": all_news}
```

#### App Store 评论抓取（AppStorePast.py）

```python
from runtime import Args
from typings.AppStorePast.AppStorePast import Input, Output
import requests
from bs4 import BeautifulSoup

def handler(args: Args[Input]) -> Output:
    app_id = '1042567321'  # 招商证券 APP
    comments = []
    page = 1
    url = f'https://itunes.apple.com/cn/rss/customerreviews/page={page}/id={app_id}/sortBy=mostRecent/xml'
    response = requests.get(url)
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.content, 'xml')
    entries = soup.find_all('entry')[1:]  # 跳过第一个 entry

    for entry in entries:
        author = entry.find('name').text
        rating = entry.find('im:rating').text
        title = entry.find('title').text
        content = entry.find('content').text
        updated = entry.find('updated').text
        comments.append({
            'author': author,
            'rating': rating,
            'title': title,
            'content': content,
            'updated': updated
        })

    print(f"共获取到{len(comments)}条评论：\n")
    return {"comments": comments}
```

#### 日期筛选（代码.js）

```javascript
async function main({ params }: Args): Promise<Output> {
    const now_time = params.now_time;        // 例如 "3月2日"
    const publish_time = params.publish_time; // 例如 "2025年03月02日 22:32"

    function parseNowMonthDay(str) {
        const match = str.match(/(\d{1,2})月(\d{1,2})日/);
        if (match) {
            return { month: parseInt(match[1], 10), day: parseInt(match[2], 10) };
        }
        return { month: null, day: null };
    }

    function parsePublishMonthDay(str) {
        const month = parseInt(str.slice(5, 7), 10);
        const day = parseInt(str.slice(8, 10), 10);
        return { month, day };
    }

    const now = parseNowMonthDay(now_time);
    const pub = parsePublishMonthDay(publish_time);
    const same_month_day = (now.month === pub.month && now.day === pub.day) ? 1 : 0;
    const ret = { same_month_day };
    return ret;
}
```

#### 评论分类筛选（AppStorePast-代码1.py）

```python
from typing import Any
async def main(args: Args) -> Output:
    params = args.params
    input_list = params['input_list']
    key0 = []  # 好评
    key1 = []  # 差评
    for obj in input_list:
        for item in obj['output']:
            if item['estimate'] == '好评':
                key0.append(item)
            elif item['estimate'] == '差评':
                key1.append(item)

    ret: Output = {
        "key0_good": key0,
        "key1_bad": key1,
    }
    return ret
```

### 8.4 日报生成 Prompt（核心）

```
# Role:
- 舆情日报编写专家

# Goals:
- 分析证券新闻热点、AppStore用户评论、新闻热词、舆情风向等信息
- 总结并生成一份专业的证券行业市场舆情监控日报

# Workflows:
1. 根据已有数据确定报告生成时间和数据来源
2. 分析新闻热点信息，提炼热点内容，总结近期热点事件
3. 分析评论数据，确定舆情导向，对舆情内容分类并思考解决方案
4. 整理数据内容，将数据量化，用百分比生成对比表格
5. 生成"市场舆情监控日报"大纲
6. 按照大纲要求进行日报撰写

# Constrains:
- 按照大纲撰写文章，不得随意编写
- 数据要求有理有据，不得捏造
- 输出报告详细完整，并提供相关优化和风控建议
- 将词云图插入到报告中
```

---

## 9. Agent API 集成

### 9.1 Coze API 集成

Coze 提供 `cozepy` Python SDK，支持三种对话模式。

#### 安装与配置

```python
# config.py
COZE_API_TOKEN = "pat_xxxx...你的令牌"
COZE_BOT_ID = "你的bot_id"
COZE_CN_BASE_URL = "https://api.coze.cn"
DEFAULT_USER_ID = "user_12345"
```

```bash
pip install cozepy>=0.16.2
```

#### 三种对话模式

```mermaid
flowchart TD
    subgraph 模式1[普通模式 chat]
        C1[发送消息] --> C2[create_and_poll<br/>阻塞等待]
        C2 --> C3[返回完整回复]
    end

    subgraph 模式2[流式模式 chat_stream]
        S1[发送消息] --> S2[SSE 事件流]
        S2 --> S3[MESSAGE_DELTA<br/>逐字返回]
        S3 --> S4[实时展示]
    end

    subgraph 模式3[历史对话模式 chat_with_history]
        H1[构建消息历史] --> H2[传入 additional_messages]
        H2 --> H3[带上下文回复]
    end
```

#### 流式事件流程

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Coze API

    C->>API: chat.stream(message)
    API-->>C: CONVERSATION_CHAT_CREATED (chat_id)
    API-->>C: CONVERSATION_CHAT_IN_PROGRESS
    API-->>C: CONVERSATION_MESSAGE_DELTA (思考/回复文本)
    API-->>C: CONVERSATION_MESSAGE_COMPLETED (FUNCTION_CALL)
    API-->>C: CONVERSATION_MESSAGE_COMPLETED (TOOL_RESPONSE)
    API-->>C: CONVERSATION_MESSAGE_DELTA (最终回复)
    API-->>C: CONVERSATION_MESSAGE_COMPLETED (FOLLOW_UP)
    API-->>C: CONVERSATION_CHAT_COMPLETED
```

#### 事件类型说明

| 事件类型                         | 消息类型        | 说明                                      |
| -------------------------------- | --------------- | ----------------------------------------- |
| `CONVERSATION_CHAT_CREATED`      | —               | 对话创建，返回 `chat_id`                  |
| `CONVERSATION_CHAT_IN_PROGRESS`  | —               | 对话开始处理                              |
| `CONVERSATION_MESSAGE_DELTA`     | `ANSWER`        | 流式文本片段，逐字/逐词返回               |
| `CONVERSATION_MESSAGE_COMPLETED` | `FUNCTION_CALL` | 插件/工具调用信息（JSON，含插件名、参数） |
| `CONVERSATION_MESSAGE_COMPLETED` | `TOOL_RESPONSE` | 工具返回结果（JSON，含输出内容）          |
| `CONVERSATION_MESSAGE_COMPLETED` | `ANSWER`        | 完整最终回复文本                          |
| `CONVERSATION_MESSAGE_COMPLETED` | `FOLLOW_UP`     | 智能体推荐的后续问题                      |
| `CONVERSATION_CHAT_COMPLETED`    | —               | 对话结束                                  |
| `CONVERSATION_CHAT_FAILED`       | —               | 对话失败                                  |

#### CozeClient 核心类

```python
from cozepy import Coze, TokenAuth, Message, ChatEventType, MessageType, ChatStatus

class CozeClient:
    def __init__(self, api_token, bot_id, base_url):
        self.coze = Coze(
            auth=TokenAuth(token=api_token),
            base_url=base_url,
        )

    # 流式聊天
    def chat_stream(self, message, user_id=None, verbose=False):
        for event in self.coze.chat.stream(
            bot_id=self.bot_id,
            user_id=user_id,
            additional_messages=[Message.build_user_question_text(message)],
        ):
            if event.event == ChatEventType.CONVERSATION_MESSAGE_DELTA:
                if event.message.type == MessageType.ANSWER:
                    yield event.message.content

    # 普通聊天（阻塞模式）
    def chat(self, message, user_id=None):
        chat_poll = self.coze.chat.create_and_poll(
            bot_id=self.bot_id,
            user_id=user_id,
            additional_messages=[Message.build_user_question_text(message)],
        )
        if chat_poll.chat.status == ChatStatus.COMPLETED:
            for msg in chat_poll.messages:
                if msg.role == "assistant" and msg.content:
                    return msg.content
```

### 9.2 Dify API 集成

Dify 提供标准的 REST API，支持三种应用类型。

#### 整体架构

```mermaid
flowchart TD
    subgraph Dify 应用类型
        CHAT[对话流 Chat<br/>POST /chat-messages<br/>多轮对话 + conversation_id]
        WF[工作流 Workflow<br/>POST /workflows/run<br/>一次性执行 + inputs/outputs]
        COMP[文本生成 Completion<br/>POST /completion-messages<br/>单轮文本生成]
    end

    CLIENT[DifyAgentClient] --> CHAT
    CLIENT --> WF
    CLIENT --> COMP
```

#### 对话流 vs 工作流对比

| 特性     | **工作流 Workflow**                                          | **对话流 Chat**                     |
| -------- | ------------------------------------------------------------ | ----------------------------------- |
| API 端点 | `/workflows/run`                                             | `/chat-messages`                    |
| 输入方式 | `inputs` 字典（自定义 key）                                  | `query` 字符串                      |
| 多轮对话 | ❌ 不支持                                                     | ✅ 支持（`conversation_id`）         |
| 返回格式 | `data.outputs`（结构化）                                     | `answer`（文本回复）                |
| 适用场景 | 一次性任务（生成图片、数据处理）                             | 交互式对话、客服问答                |
| 流式支持 | SSE 事件：`workflow_started` → `text_chunk` → `workflow_finished` | SSE 事件：`message` → `message_end` |

#### Dify 流式事件类型

```mermaid
sequenceDiagram
    participant C as Client
    participant D as Dify API

    C->>D: POST /workflows/run (streaming)
    D-->>C: workflow_started (workflow_run_id)
    D-->>C: node_started (node_id, type, title)
    D-->>C: text_chunk (流式文本)
    D-->>C: node_finished (outputs, status)
    D-->>C: workflow_finished (final outputs)
    D-->>C: ping (每10秒心跳)
```

#### DifyAgentClient 核心类（工作流调用示例）

```python
from dify_agent_client import DifyAgentClient

BASE_URL = "https://api.dify.ai/v1"
API_KEY = "app-xxxxxxxxxxxxx"

client = DifyAgentClient(BASE_URL, API_KEY)

# 调用工作流
result = client.run_workflow(
    inputs={"input": "离离原上草"},
    user_id="demo_user",
)

# 处理返回结果（如图片文件）
if not result.get("error"):
    outputs = result.get("outputs", {})
    for item in outputs.get("output", []):
        if item.get("type") == "image":
            print(f"图片URL: {item.get('url')}")
```

#### 多轮对话示例

```python
# 多轮对话通过 conversation_id 维持上下文
conversation_id = None
questions = [
    "可以在上海证券交易所挂牌交易有哪些？",
    "我的用户id：7501690985227960354，我在5月4日登录了软件，但是没有成功",
    "今天天气怎样？",
]

for question in questions:
    result = client.chat_completion(
        user_input=question,
        user_id="demo_user",
        conversation_id=conversation_id,  # 首轮为 None
        app_type="chat",
    )
    conversation_id = result.get("conversation_id")  # 保存用于下轮
    print(result.get("answer"))
```

---

## 10. 高代码 Agent 开发框架

根据课程笔记中提到的技术栈，当前主流高代码 Agent 框架：

```mermaid
graph TD
    subgraph 编排框架
        LC[LangChain<br/>链式调用/工具编排]
        LG[LangGraph<br/>有状态图编排/多Agent]
        LI[LlamaIndex<br/>RAG 数据索引]
        QA[Qwen-Agent<br/>通义千问 Agent 框架]
    end

    subgraph 多Agent协作
        AG[AutoGen<br/>微软多Agent对话]
        CT[CrewAI<br/>角色扮演式多Agent]
    end

    subgraph 单Agent+技能
        OC[OpenClaw<br/>单Agent + Skills]
        NB[NanoBot<br/>轻量级Agent + SubAgents]
    end

    subgraph 测试与监控
        LS[LangSmith<br/>LLM 应用监控]
        LF[LangFuse<br/>开源可观测平台]
    end

    subgraph AI编程工具
        CC[Claude Code]
        CS[Cursor]
        TR[Trae 国内版]
        CB[CodeBuddy]
        LM[Lingma]
    end
```

### 框架选型建议

| 框架                   | 适用场景                   | 复杂度 |
| ---------------------- | -------------------------- | ------ |
| **LangChain**          | RAG 应用、工具链编排       | ⭐⭐⭐    |
| **LangGraph**          | 有状态多 Agent、复杂工作流 | ⭐⭐⭐⭐   |
| **AutoGen**            | 多 Agent 对话协作          | ⭐⭐⭐⭐   |
| **Qwen-Agent**         | 通义千问生态、中文场景     | ⭐⭐⭐    |
| **OpenClaw / NanoBot** | 单 Agent + 子技能          | ⭐⭐     |

---

## 11. 知识库 vs 数据表

这是课程中反复强调的核心设计原则：

```mermaid
flowchart TD
    subgraph 知识库 RAG
        direction TB
        KB1[适合存储文档/策略/规则等非结构化文本]
        KB2[通过向量检索召回相关 Chunk]
        KB3[在 Agent 启动时首先执行、只执行一次]
        KB4[相当于 System Prompt 的动态拓展]
        KB5[适合标签化内容，需要标签才能召回]
    end

    subgraph 数据表 Database
        direction TB
        DB1[适合存储结构化用户数据]
        DB2[通过 SQL 进行精确查询]
        DB3[在需要时动态调用]
        DB4[支持增删改查全操作]
        DB5[适合用户标签、行为日志、业务记录]
    end

    知识库 -->|Few-Shot 拓展| SystemPrompt[System Prompt]
    数据表 -->|动态查询| Tools[工具调用]
```

### 选择决策矩阵

| 数据类型                  | 推荐存储 | 原因                      |
| ------------------------- | -------- | ------------------------- |
| 产品介绍文档              | 知识库   | 非结构化文本，需语义检索  |
| 交易规则说明              | 知识库   | 文档型内容，RAG 检索      |
| 营销策略模板              | 知识库   | 策略型文档，需标签召回    |
| 用户标签（资产/风险偏好） | 数据表   | 结构化字段，需精确查询    |
| 用户行为事件日志          | 数据表   | 时序数据，需 SQL 条件查询 |
| 投诉记录                  | 数据表   | 需动态写入和查询          |
| 客户风险评测结果          | 数据表   | 结构化数据，需持久化      |

---

## 12. 多 Agent 协作模式

### 12.1 三种协作架构

```mermaid
flowchart TD
    subgraph 模式A[单 Agent + Skills 模式]
        A1[主 Agent] --> A2[Skill 1]
        A1 --> A3[Skill 2]
        A1 --> A4[Skill 3]
    end

    subgraph 模式B[主 Agent + SubAgents 模式]
        B1[主 Agent/分诊台] --> B2[子 Agent 1]
        B1 --> B3[子 Agent 2]
        B1 --> B4[子 Agent 3]
    end

    subgraph 模式C[AutoGen 多 Agent 对话模式]
        C1[Agent 1] <--> C2[Agent 2]
        C2 <--> C3[Agent 3]
        C1 <--> C3
    end
```

### 12.2 适用场景对比

| 模式                 | 代表实现             | 适用场景                | 课程 CASE          |
| -------------------- | -------------------- | ----------------------- | ------------------ |
| 单 Agent + Skills    | OpenClaw, NanoBot    | 任务明确、流程固定      | —                  |
| 主 Agent + SubAgents | Coze 多 Agents, Dify | 需按意图分流、专业分工  | CASE 4（智能客服） |
| 多 Agent 对话        | AutoGen, LangGraph   | 复杂协作、需要讨论/辩论 | —                  |

### 12.3 多 Agent vs 多工作流

| 维度     | 多 Agent              | 多工作流          |
| -------- | --------------------- | ----------------- |
| 本质     | 多个智能体分工协作    | 多个工具/流程编排 |
| 决策权   | 每个 Agent 有独立判断 | 流程预定义        |
| 路由方式 | LLM 语义判断分流      | 可视化工作流逻辑  |
| 灵活性   | 高（可动态切换）      | 中（预定义路径）  |
| 调试难度 | 较高                  | 较低              |

---

## 13. 最佳实践与总结

### 13.1 开发流程

```mermaid
flowchart LR
    A[需求分析] --> B[数据准备]
    B --> C[知识库/数据表设计]
    C --> D[Prompt 编写与测试]
    D --> E[工作流编排]
    E --> F[用户界面设计]
    F --> G[API 集成]
    G --> H[部署上线]
    H --> I[监控与迭代]
```

### 13.2 关键设计原则

| 原则              | 说明                                                    |
| ----------------- | ------------------------------------------------------- |
| **RAG 前置**      | RAG 在 Agent 启动时执行一次，作为 System Prompt 的拓展  |
| **数据表动态**    | 结构化数据使用数据表，支持 SQL 精确查询和写入           |
| **标签化召回**    | 知识库需要设置标签才能有效召回                          |
| **Few-Shot 约束** | 在提示词中明确标签范围，防止 Agent 超范围生成           |
| **分段策略**      | PDF/PPT 类建议先用 MinerU 转 Markdown；纯文本可直接使用 |
| **流式优先**      | Markdown 流式输出提升用户体验                           |
| **先验证后操作**  | 投诉录入前先核实用户行为数据                            |
| **过程提示**      | 长时间工作流增加输出节点提示进度                        |

### 13.3 工具链总览

```mermaid
flowchart TD
    subgraph 低代码平台
        COZE[Coze<br/>扣子]
        DIFY[Dify]
    end

    subgraph 高代码框架
        LC2[LangChain]
        LG2[LangGraph]
        AG2[AutoGen]
    end

    subgraph AI编程
        AI1[Claude Code / Cursor]
        AI2[Trae / CodeBuddy / Lingma]
    end

    subgraph 测试监控
        TM1[LangSmith]
        TM2[LangFuse]
    end

    subgraph 部署交付
        DP1[Coze API 发布]
        DP2[Dify 自部署]
        DP3[Web App / 移动端]
    end

    低代码平台 --> AI编程
    AI编程 --> 高代码框架
    高代码框架 --> 测试监控
    测试监控 --> 部署交付
```

### 13.4 面试与职业发展建议

根据课程笔记：

- **低代码方向**：掌握 Coze 和 Dify，可搜索 JD 了解市场要求
- **高代码方向**：核心技能包括 RAG、工具调用（Function Call）、MCP、Text2SQL
- **测试监控**：LangSmith、LangFuse 是加分项
- **AI 编程工具**：国外（Cursor、Claude Code）、国内（Trae、Lingma、CodeBuddy）
- **量化交易 Agent**：可使用 `miniQMT` 实现实盘自动买卖，需对接 API 而非模拟人操作
- **Agent 交付方式**：网页嵌入、API 调用、移动端 App 包装

---

## 附录：项目文件结构

```
21-Agent进阶与集成/
├── Agent进阶与集成.pdf              # 课程课件（122页）
├── ABC公司证券产品介绍.txt           # 证券产品知识库源数据
├── 笔记20260409.txt                   # 课程问答笔记
├── CASE-Coze API使用/
│   ├── config.py                     # Coze API 配置
│   ├── coze_client.py                # Coze API 客户端（支持三种模式）
│   └── requirements.txt
├── CASE-Dify API使用/
│   ├── dify_agent_client.py          # Dify API 客户端（Chat/Workflow/Completion）
│   ├── dify_chat_example.py          # 对话流多轮对话示例
│   ├── dify_workflow_example.py      # 工作流调用示例
│   └── requirements.txt
├── CASE-客户分层营销助手/
│   ├── user_behavior_event.xlsx      # 用户行为事件数据
│   ├── user_tag.xlsx                 # 用户标签数据
│   └── 营销策略.xlsx                  # 营销策略知识库
├── CASE-市场舆情监测Agent/
│   ├── AppStorePast.py               # App Store 评论抓取插件
│   ├── AppStorePast-代码1.py         # 评论分类筛选代码
│   ├── securities_past.py            # 新浪财经新闻抓取插件
│   ├── 代码.js                        # 日期筛选（JS 批处理节点）
│   └── 代码1.py                       # 无效数据过滤
└── CASE-智能客服Agent/
    ├── user_complain.xlsx            # 投诉记录数据表
    ├── 港股交易规则介绍.pdf           # 知识库：港股交易规则
    ├── 平安财富日添利理财产品.doc      # 知识库：理财产品
    ├── 上海证券交易所交易规则.pdf     # 知识库：A股交易规则
    └── 中国平安金裕人生理财产品.doc   # 知识库：理财产品
```
