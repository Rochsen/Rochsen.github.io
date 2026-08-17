import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/VVBP/",

  lang: "zh-CN",
  title: "Rochsen's Blog",
  description: "个人博客",

  theme,

  host: '127.0.0.1',

  port: 9080,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
