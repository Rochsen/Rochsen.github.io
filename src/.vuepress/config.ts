import { defineUserConfig } from "vuepress";
import type { UserConfig } from "vuepress";
import theme from "./theme.js";
// import { cachePlugin } from "@vuepress/plugin-cache";

export default <UserConfig>defineUserConfig({
  base: "/VVBP/",

  locales: {
    "/": {
      lang: "zh-CN",
      // title: "Rochsen",
    },

    "/en/": {
      lang: "en-US",
      // title: "My name is Rochsen",
    },
  },

  theme,

  // host: "127.0.0.1",

  port: 8888,

  // 和 PWA 一起启用
  shouldPrefetch: false,

  // title: "Rochsen's Blog",
  // description: "个人博客",
  // plugins: [cachePlugin({ type: "filesystem" })],
});
