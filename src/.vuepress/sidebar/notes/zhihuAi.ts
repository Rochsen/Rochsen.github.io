import { arraySidebar } from "vuepress-theme-hope";

export const zhihuAiSideBar = arraySidebar([
  "",
  {
    text: "AI通识",
    children: [
      "0aiNameProduce",
      "1promptEngToRag",
      "2agentfromControl2selfthink",
      "3multimodalAI",
    ],
  },
  {
    text: "LangChain基础",
    children: [
      "5aiAssistCoding",
      "6langchainApp",
      "7langchainDesign",
      "8langchainOptimize",
    ],
  },
  {
    text: "深度学习专题",
    children: ["9networkbaseTensorflow", "10cnnPytorch"],
  },
  {
    text: "LLM模型微调",
    children: [
      "12llmFineTune",
      "13llmFineTuneEval",
      "14llmFineTunePr",
      "15cvandMultiModal",
      "16aiChecK",
    ],
  },
  {
    text: "RAG专题",
    children: [
      "18Embeddings",
      "19RAGTechApply",
      "20RAGmutilProcess",
      "21RAGenhance",
      "22KnowledgeDataBase",
      "23partofReplaceRAG",
      "24LLMWiki",
    ],
  },
  {
    text: "Ai Coding协作",
    children: [
      "26aiCodingExp",
      "27aiCodingForBigProj",
      "28aiTeamMode",
      "30gatewayAgentIM",
    ],
  },
  {
    text: "Agent专题",
    children: [
      "31FunctionCallingMCP",
      "32AgentRuler",
      "33AgentEnchance",
      "34OpenManusProj",
    ],
  },
  {
    text: "Harness专题",
    children: [
      "35HarnessEngineering",
      "36HermesAgentAbility",
      "37HermesAgentRuler",
    ],
  },
  {
    text: "面试辅导",
    children: [
      "11jobForFrame",
      "28jobForBuild",
      "25jobForRAG",
      "38jobForAgent",
    ],
  },
  {
    text: "企业化部署",
    children: ["39aiDeployCompany", "40aiServiceCore", "41SQLangOpt"],
  },
  {
    text: "时代的眼泪",
    children: [
      "91aiCozeExample",
      "92aiDifyDeploy",
      "93agentDebug",
      "94aiforIntelTest",
      "95text2SQL-DataIntel",
      "96ChatBI",
    ],
  },
]);
