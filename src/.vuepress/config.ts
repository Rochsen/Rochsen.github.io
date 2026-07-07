import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/VVBP/",

  lang: "zh-CN",
  title: "Rochsen's Blog",
  description: "vuepress-theme-hope 的博客演示",

  theme,

  port: 9080,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
