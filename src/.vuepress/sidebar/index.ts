import { sidebar } from "vuepress-theme-hope";
import { gamesSideBar } from "./games/index.js";
import { NoteSideBar, zhihuAiSideBar } from "./notes/index.ts";
import { InvestmentSideBar } from "./investment/investment.ts";
import { SoftwaresSideBar } from "./softwares/softwares.ts";


export const zhSideBarConfig = sidebar({
  // 学习 - 侧边栏
  "/notes/": NoteSideBar,
  "/notes/deploy/": "structure",
  "/notes/aiApplicationEngineer": zhihuAiSideBar,
  "/notes/bioinformatics/": "structure",
  "/notes/computerSci/": "structure",

  // 游戏 - 侧边栏
  "/games/": gamesSideBar,

  // 投资 - 侧边栏
  "/investment/": InvestmentSideBar,
  "/investment/stock/": "structure",
  "/investment/fund/": "structure",
  "/investment/bond/": "structure",
  "/investment/insurance/": "structure",
  "/investment/assets/": "structure",

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
