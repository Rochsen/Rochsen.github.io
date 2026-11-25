import { sidebar } from "vuepress-theme-hope";
import { gamesSideBar } from "./games/index.js";
import { NoteSideBar, zhihuAiSideBar } from "./notes/index.ts";
import { InvestmentSideBar } from "./investment/investment.ts";
import {
  assetsSideBar,
  bondSideBar,
  fundSideBar,
  insuranceSideBar,
  stockSideBar,
} from "./investment/index.ts";
// import { SoftwaresSideBar } from "./softwares/softwares.ts";

export const zhSideBarConfig = sidebar({
  // 学习 - 侧边栏
  "/notes/": NoteSideBar,
  "/notes/workbench/": "structure",
  "/notes/aiApplicationEngineer": zhihuAiSideBar,
  "/notes/bioinformatics/": "structure",
  "/notes/computerSci/": "structure",
  "/notes/py/": "structure",
  // 投资：一级列出分类，更长前缀匹配后只显示对应分类
  "/notes/investment/": InvestmentSideBar,
  "/notes/investment/stock/": stockSideBar,
  "/notes/investment/bond/": bondSideBar,
  "/notes/investment/fund/": fundSideBar,
  "/notes/investment/assets/": assetsSideBar,
  "/notes/investment/insurance/": insuranceSideBar,

  // 游戏 - 侧边栏
  "/games/": gamesSideBar,

  // 软件 - 侧边栏
  "/softwares/": "structure",
});

// 英文语言下的侧边栏
export const enSidebarConfig = sidebar({
  "/en/notes/": [""],

  // fallback
  "/en/": ["", "notes/"],
});

// 中文语言下的侧边栏部分示例保留
//
// 示例：左侧折叠
// "/strategy/": [
//   "",
//   {
//     text: "游戏",
//     icon: "gamepad",
//     prefix: "games/",
//     children: gamesSideBar,
//     collapsible: true,
//   },
// ],
// 官方示例
// "/about/": "structure",
//   "/": [
//     // "",
//     // {
//     //   text: "如何使用",
//     //   icon: "laptop-code",
//     //   prefix: "demo/",
//     //   link: "demo/",
//     //   children: "structure",
//     // },
//     // {
//     //   text: "文章",
//     //   icon: "book",
//     //   prefix: "posts/",
//     //   children: "structure",
//     // },
//     // "intro",
//     // {
//     //   text: "幻灯片",
//     //   icon: "person-chalkboard",
//     //   link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
//     // },
//   ],
