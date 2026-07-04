---
title: 大模型应用开发学习笔记
icon: code
article: false
category:
  - 教程
tag:
  - AI
star: true
---

> [!tip]
> 所有内容为AI Agent编写，仅供个人学习和研究，请勿用于商业用途
> 
> 目前文档用到的Agent举例：Kimi、千问、Minimax、GLM等
> 

## 第一部分: 现在的AI是什么

- [第一节：公开课](./1techOfBigModel.md)
- [第二节：从提示词工程到RAG：构建大模型的知识和交互基础](./2promptEngToRag.md)
- [第三节：Agent：从可控性到自主反省](./3agentfromControl2selfthink.md)
- [第四节：多模态AI](./4multimodalAI.md)
- [第五节：AI概念通俗解释大全](./5aiNameProduce.md)


## 第二部分: langchain 开发基础

- [第六节：langchain 多任务应用开发](./6langchainApp.md)
- [第七节：AI框架设计与选型](./7langchainDesign.md)
- [第八节：HuggingFace生态实战：从模型应用到高效微调](./8langchainOptimize.md)

## 第三部分: 深度学习

- [第九节：神经网络基础与Tensorflow实战](./9networkbaseTensorflow.md)
- [第十节：pytorch与视觉检测](./10cnnPytorch.md)

## 第四部分: LLM模型微调

- [第十二节：LLM微调原理](./12llmFineTune.md)
- [第十三节：高质量微调数据工程与评估](./13llmFineTuneEval.md)
- [第十四节：LLM模型蒸馏与微调实操](./14llmFineTunePr.md)
- [第十五节：视觉与多模态模型](./15cvandMultiModal.md)
- [第十六节：项目实战：AI质检](./16aiChecK.md)

## 第五部分: AI部署

- [第十八节：企业级AI部署：从硬件选型到框架选择](./18aiDeployCompany.md)
- [第十九节：AI服务核心：高并发原理与性能监控调优](./19aiServiceCore.md)
- [第二十节：SQLang深度优化：Radix缓存与复杂任务的极致吞吐](./20SQLangOpt.md)
- [第二十一节：Coze工作原理与应用实例](./21aiCozeExample.md)
- [第二十二节：Dify本地化部署和应用](./22aiDifyDeploy.md)

## 第六部分: AI应用

- [第二十三节：Agent调试、运维与系统集成](./23aiAgentRetry.md)
- [第二十四节：智能编码革命：AI辅助编程](./24aihelpCoding.md)
- [第二十五节：AI赋能的智能测试与质量保障](./25aiTestAndProtect.md)
- [第二十六节：从Text-to-SQL到数据智能](./26test2Sql.md)
- [第二十七节：项目实战：ChatBI开发实战](./27chatBI.md)

## 第七部分: 模型优化

- [第二十九节：Embeddings和向量数据库](./29embeddingsAndVectorDB.md)
- [第三十节：RAG技术与应用](./30ragTechAndApp.md)
- [第三十一节：RAG多模态数据处理](./31ragMultiModal.md)
- [第三十二节：RAG调优](./32ragOpt.md)
- [第三十三节：项目实战：企业知识库（企业RAG大赛冠军项目）](./33ragKnowledgeProject.md)

## 第八部分: 模型的协调能力

- [第三十五节：Function Calling 与 MCP](./35functionCallingMCP.md)
- [第三十六节：Agent的自主规划与工具开发](./36Coord.md)
- [第三十七节：构建Agent的数据决策能力](./37knowledgeGraphQA.md)
- [第三十八节：Agent的能力优化与效果评估](./38agentOptimize.md)
- [第三十九节：项目实战：OpenManus开发实战](./39openManusProject.md)


<!-- 
## 第九部分: 模型预训练

- [第四十一节：预训练+微调的训练凡是 开原生态OpenAI的差异详解](./41pretrainBase.md)
- [第四十二节：探索神经网络的奥秘](./42nnSecret.md)
- [第四十三节：揭秘Transformer的真面目-1](./43transformer-1.md)
- [第四十四节：揭秘Transformer的真面目-2](./44transformer-2.md)
- [第四十五节：多模态领域的Transformer——创意生成的基座原理](./45transformerFromMulModal.md)

## 第十部分: 识别和图像生成

- [第四十六节：揭开文字、人脸、精密零件、无人驾驶的智能识别面纱](./46intellientFromcv.md)
- [第四十七节：探索DALL·E、StableDiffusion如何编织创意图像的魔法](./47dallSD.md)
- [第四十八节：类Sora模型：解锁动态视觉艺术的密码](./48soraModelDynamic.md)
- [第四十九节：人体姿态识别模型-Meta Sapiens](./49metaSapiens.md)

## 第十一部分: 模型推理
- [第五十节：MOE架构在Scaling Law之后继续提升大模型能力](./50moeAfterSL.md)
- [第五十一节：Deepseek性价比之王背后的极致压缩技术MLA](./51dsMLA.md)
- [第五十二节：超级引擎：英伟达GPU与CUDA相关的必备知识点](./52gpuCUDA.md)
- [第五十三节：推理模型是如何训练出来的 - DeepSeek R1 与 V3](./53dsR1V3.md)
- [第五十四节：如何训练自动操作电脑和手机的Agent-智谱AutoGLM](./54AutoGLM.md)
- [第五十五节：文件自动处理AutoGPT](./55autoGPT.md)
- [第五十六节：项目实战：支小助](./56zhiXiaoZhu.md)

## 第十二部分: 大模型应用开发教学DEMO

- [第五十七节：教育行业核心demo实战1——拍照搜知识点视频](./57educationDemo-1.md)
- [第五十八节：教育行业核心demo实战2——自动化出题与智能组卷](./58educationDemo-2.md)
- [第五十九节：教育行业核心demo实战3——知识点学握程度检验](./59educationDemo-3.md)
- [第六十节：财务部门核心demo实战1——AI识别财务表格的数字](./60financeDemo-1.md)
- [第六十一节：财务部门核心demo实战2——AI财务表格准确率的提升](./61financeDemo-2.md)
- [第六十二节：人力资源部门核心demo实战-1——数字人培训视频](./62hrdemo-1.md)
- [第六十三节：人力资源部门核心demo实战-2——AI培训对练](./63hrdemo-2.md)
- [第六十四节：电商行业核心demo实战1——电商评论区互动助手](./64ecomDemo-1.md)
- [第六十五节：泛娱乐内容行业核心demo实战1——AI生成视频工作流](./65entertainmentDemo-1.md) -->

## 就业培训系列

- [第十一节：开发框架相关简历+面试问题辅导](./11aiJobInterview.md)
- [第三十四节：RAG相关简历+面试问题辅导](./34ragJobInterview.md)
- [第四十节：Agent相关简历+面试问题辅导](./40agentJobInterview.md)
