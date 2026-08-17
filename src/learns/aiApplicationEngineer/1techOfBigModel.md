---
title: AI 大模型应用公开课
date: 2026-01-22
category: [教程, 知乎]
tag: [AI]
sticky: true
# article: false
---

<!-- more -->

## 产品举例

- 支小助
- AiPPT
- HeyGen数字人
- 美团-小美AI Agent
- 星野-AI陪聊智能体
- meitu

## 入行需要的步骤

1. 首先要了解AI的模型和技术应用知识（作用：从基座模型二开）
2. 熟练使用AI开发工具
3. 要构建AI驱动的原型，需要将概念转化为实际应用
4. 保持AI最新技能同步
5. 不断学习和做项目实战

## 需要掌握什么技术？

```mermaid
mindmap
  root((大模型应用开发工程师))
    基础能力
      提示词工程
      AI Agent
      RAG
      Function Calling
      Embedding
    进阶能力
      Fine-tuning
      数据决策
      LangChain/LangGraph
      Coze/Dify
```

## AI技术介绍

### Agent

从无状态，到特定状态的定义和识别

状态：（报出的回答结构化）

巴黎奥运会的金牌回答，可以按照金银铜牌的数量回答给用户

### Prompt

提示词工程，用户输入

### Function Call

与外部函数或API交互的能力，通过理解语义来结构化调用信息，询问用户补全信息，然后结构化调用工具，基于返回的结构化信息，整合生成回复

１.　理解语义，自主决策使用天气查询工具

２.　结构化调用，需要结构化信息

３.　询问用户，补全信息

４.　结构化调用天气查询工具

５.　基于返回的结构化天气信息，整合生成回复

面试题：如果Function Call的成功率比较低，需要怎么解决？

答案：考虑从LLM基座模型或者选型上去思考

### RAG

通过从外部资源或数据库中纳入相关信息来实现

### Fine Tuning

微调（可能不需要，但是复杂场景需要，可以先考虑模型的选型）

```mermaid
flowchart TD
    subgraph Step1["Step 1: 收集示范数据，制定监督策略"]
        P1["从 prompt 数据集中采样 prompt<br/>如: Explain the moon landing to a 6 year old"]
        L1["标注员演示期望的输出行为"]
        SFT["用监督学习微调 GPT-3<br/>(SFT)"]
        P1 --> L1 --> SFT
    end

    subgraph Step2["Step 2: 收集比较数据，训练奖励模型"]
        P2["采样 prompt + 多个模型输出<br/>A: Explain gravity...<br/>B: Explain war...<br/>C: Moon is natural satellite...<br/>D: People went to the moon..."]
        L2["标注员对输出进行排序<br/>D > C > A = B"]
        RM["训练奖励模型<br/>(Reward Model)"]
        P2 --> L2 --> RM
    end

    subgraph Step3["Step 3: 使用强化学习针对奖励模型优化策略"]
        RL["基于奖励模型<br/>使用强化学习优化策略<br/>(RLHF)"]
    end

    SFT --> Step2
    RM --> Step3

    style Step1 fill:#e3f2fd,stroke:#1565c0
    style Step2 fill:#fff3e0,stroke:#e65100
    style Step3 fill:#e8f5e9,stroke:#2e7d32
```



```mermaid
flowchart LR
    A["Step 1<br/>收集示范数据<br/>监督微调 SFT"] --> B["Step 2<br/>收集比较数据<br/>训练奖励模型 RM"] --> C["Step 3<br/>强化学习<br/>优化策略 RLHF"]

    A1["采样 Prompt"] --> A2["标注员示范"] --> A3["监督学习微调"]
    B1["采样多个输出"] --> B2["标注员排序"] --> B3["训练奖励模型"]
    C1["奖励模型打分"] --> C2["RL 优化策略"]

    A3 -.-> B1
    B3 -.-> C1
```