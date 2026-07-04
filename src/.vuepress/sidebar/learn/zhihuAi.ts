import { arraySidebar } from "vuepress-theme-hope";

export const zhihuAi = arraySidebar([
  "",
  {
    text: "现在的AI是什么",
    children: [
      "1techOfBigModel",
      "2promptEngToRag",
      "3agentfromControl2selfthink",
      "4multimodalAI",
      "5aiNameProduce",
    ],
  },
  {
    text: "LangChain基础",
    children: ["6langchainApp", "7langchainDesign", "8langchainOptimize"],
  },
  {
    text: "深度学习基础",
    children: ["9networkbaseTensorflow", "10cnnPytorch"],
  },
  {
    text: "LLM模型微调与企业化部署",
    children: [
      "12llmFineTune",
      "13llmFineTuneEval",
      "14llmFineTunePr",
      "15cvandMultiModal",
      "16aiChecK",
      "18aiDeployCompany",
      "19aiServiceCore",
      "20SQLangOpt",
      "21aiCozeExample",
      "22aiDifyDeploy",
      "23agentDebug",
      "24aiAssistCoding",
      "25aiforIntelTest",
      "26text2SQL-DataIntel",
      "27ChatBI",
    ],
  },
  {
    text: "RAG",
    children: [
      "29Embeddings",
      "30RAGTechApply",
      "31RAGmutilProcess",
      "32RAGenhance",
      "33KnowledgeDataBase",
      "34partofReplaceRAG",
      "35LLMWiki",
    ],
  },
  {
    text: "Ai Coding",
    children: [
      "37aiCodingExp",
      "38aiCodingForBigProj",
      "39aiTeamMode-DataIntel",
      "40dsv4inHuawei",
      "41FunctionCallingMCP"
    ],
  },
  {
    text: "Agent",
    children: [
      "42AgentRuler",
      "43AgentEnchance",
      "44OpenManusProj-DataIntel",
      "45HarnessEngineering",
      "46HermesAgentAbility",
      "47HermesAgentRuler"
    ]
  },
  {
    text: "面试辅导",
    children: [
      "11jobForFrame",
      "28jobForBuild",
      "36jobForRAG",
      "48jobForAgent"
    ]
  }
]);
