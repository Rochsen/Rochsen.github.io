import { navbar } from "vuepress-theme-hope";

export default navbar([
  // 主页
  // "/",
  // 笔记
  "/learns/",
  // 游戏
  "/games/",
  // 音乐
  {
    text: "音乐",
    link: "/songs/",
    icon: "music",
  },
  // 导航
  "/navigation/",
  // 关于
  {
    text: "关于",
    link: "/about/",
    icon: "at",
  },
  
  // 示例
  // {
  //   text: "攻略",
  //   // icon: "pen-to-square",
  //   prefix: "/strategy/",
  //   children: [
  //     "games/"
  //     {
  //       text: "游戏",
  //       // icon: "person-running",
  //       prefix: "games/",
  //       children: [
  //         {
  //           text: "艾尔登法环 黑夜君临",
  //           // icon: "person-running",
  //           link: "nightReign/bossAnti",
  //         },
  //         {
  //           text: "背包乱斗：福西法的宝藏",
  //           // icon: "person-running",
  //           link: "backpackBattle/itemsFunc",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // example from hope
  // "/demo/",
  // {
  //   text: "博文",
  //   icon: "pen-to-square",
  //   prefix: "/posts/",
  //   children: [
  //     {
  //       text: "苹果",
  //       icon: "pen-to-square",
  //       prefix: "apple/",
  //       children: [
  //         { text: "苹果1", icon: "pen-to-square", link: "1" },
  //         { text: "苹果2", icon: "pen-to-square", link: "2" },
  //         "3",
  //         "4",
  //       ],
  //     },
  //     {
  //       text: "香蕉",
  //       icon: "pen-to-square",
  //       prefix: "banana/",
  //       children: [
  //         {
  //           text: "香蕉 1",
  //           icon: "pen-to-square",
  //           link: "1",
  //         },
  //         {
  //           text: "香蕉 2",
  //           icon: "pen-to-square",
  //           link: "2",
  //         },
  //         "3",
  //         "4",
  //       ],
  //     },
  //     { text: "樱桃", icon: "pen-to-square", link: "cherry" },
  //     { text: "火龙果", icon: "pen-to-square", link: "dragonfruit" },
  //     "tomato",
  //     "strawberry",
  //   ],
  // },
  // {
  //   text: "V2 文档",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
