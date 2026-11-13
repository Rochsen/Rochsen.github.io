---
title: 大模型应用开发学习笔记
icon: code
article: false
star: false
timeline: false
---

> [!tip]
> 所有内容为AI Agent编写，仅供个人学习和研究，请勿用于商业用途
>
> 目前文档用到的Agent举例：Kimi、Minimax、GLM、DeepSeek等

## AI通识

- [AI 概念通俗解释大全](./0aiNameProduce.md)
- [构建大模型的知识与交互基础](./1promptEngToRag.md)
- [Agent：从可控性到自主反思](./2agentfromControl2selfthink.md)
- [多模态AI入门指南](./3multimodalAI.md)

## LangChain基础

- [智能编码革命：AI辅助编程](./5aiAssistCoding.md)
- [langchain 多任务应用开发](./6langchainApp.md)
- [AI框架设计与选型](./7langchainDesign.md)
- [HuggingFace生态实战：从模型应用到高效微调](./8langchainOptimize.md)

## 深度学习

- [神经网络基础与Tensorflow实战](./9networkbaseTensorflow.md)
- [pytorch与视觉检测](./10cnnPytorch.md)

## LLM模型微调

- [LLM微调原理](./12llmFineTune.md)
- [高质量微调数据工程与评估](./13llmFineTuneEval.md)
- [LLM模型蒸馏与微调实操](./14llmFineTunePr.md)
- [视觉与多模态模型](./15cvandMultiModal.md)
- [项目实战：AI质检](./16aiChecK.md)

## RAG专题

- [Embeddings和向量数据库](./18Embeddings.md)
- [RAG技术与应用](./19RAGTechApply.md)
- [RAG多模态数据处理](./20RAGmutilProcess.md)
- [RAG调优](./21RAGenhance.md)
- [项目实战：企业知识库](./22KnowledgeDataBase.md)
- [部分场景中可以取代RAG的技术](./23partofReplaceRAG.md)
- [LLM Wiki](./24LLMWiki.md)

## Ai Coding协作

- [大厂优秀工程师使用AI Coding的最新方法与经验](./26aiCodingExp.md)
- [大型软件项目的AI开发与AI重构](./27aiCodingForBigProj.md)
- [AI Coding中的团队重新分工与新协作模式](./28aiTeamMode.md)
- [封装Gateway模块，让你的Agent和IM连通](./30gatewayAgentIM.md)

## Agent专题

- [Function Calling与MCP](./31FunctionCallingMCP.md)
- [Agent的自主规划与工具开发](./32AgentRuler.md)
- [Agent的能力优化与效果评估](./33AgentEnchance.md)
- [OpenManus开发实战](./34OpenManusProj.md)

## Harness专题

- [Harness Engineering](./35HarnessEngineering.md)
- [搭建Hermes Agent中的长期记忆和自进化能力](./36HermesAgentAbility.md)
- [实现Hermes中的多Agent协作、主Agent调度](./37HermesAgentRuler.md)

## 面试辅导

- [开发框架相关简历+面试问题辅导](./11jobForFrame.md)
- [部署及提效相关简历+面试问题辅导](./28jobForBuild.md)
- [RAG相关简历+面试问题辅导](./25jobForRAG.md)
- [Agent相关简历+面试问题辅导](./38jobForAgent.md)

## 企业化部署

- [企业级AI部署：从硬件选型到框架选择](./39aiDeployCompany.md)
- [AI服务核心：高并发原理与性能监控调优](./40aiServiceCore.md)
- [SQLang深度优化：Radix缓存与复杂任务的极致吞吐](./41SQLangOpt.md)

## 时代的眼泪

- [Coze工作原理与应用实例](./91aiCozeExample.md)
- [Dify本地化部署和应用](./92aiDifyDeploy.md)
- [Agent调试、运维与系统集成](./93agentDebug.md)
- [AI赋能的智能测试与质量保障](./94aiforIntelTest.md)
- [从Text-to-SQL到数据智能](./95text2SQL-DataIntel.md)
- [项目实战：ChatBI开发实战](./96ChatBI.md)

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
