import { sidebar } from "vuepress-theme-hope";
import { gamesSideBarConfig } from "./games/index.js";
import { learnSideBar, deploy, zhihuAi } from "./learn/index.js";

export const sideBarConfig = sidebar({
  "/learn/": learnSideBar,
  "/learn/deploy/": deploy,
  "/learn/aiApplicationEngineer": zhihuAi,
  "/games/": gamesSideBarConfig,

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
});
