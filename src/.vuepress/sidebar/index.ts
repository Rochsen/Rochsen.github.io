import { sidebar } from "vuepress-theme-hope";
import { gamesSideBarConfig } from "./games/index.js";
import { NoteSideBar, zhihuAi } from "./notes/index.ts";

export const zhSideBarConfig = sidebar({
  // 学习 - 侧边栏
  "/notes/": NoteSideBar,
  "/notes/deploy/": "structure",
  "/notes/aiApplicationEngineer": zhihuAi,
  "/notes/bioinformatics/": "structure",
  "/notes/computerSci/": "structure",

  // 游戏 - 侧边栏
  "/games/": gamesSideBarConfig,
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
//     children: gamesSideBarConfig,
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
