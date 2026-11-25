import { sidebar } from "vuepress-theme-hope";
import { gamesSideBar } from "./games/index.js";
import { NoteSideBar, zhihuAiSideBar } from "./notes/index.ts";
import {
  InvestmentSideBar,
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
  // 投资首页列出分类；stock/fund 等用更长前缀单独开栏
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

  // 番剧 - 侧边栏
  "/anime/": "structure",

  // 电影 - 侧边栏
  "/movie/": "structure",
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
