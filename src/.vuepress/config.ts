import { defineUserConfig } from "vuepress";
import type { UserConfig } from "vuepress";
import theme from "./theme.js";
import { cachePlugin } from "@vuepress/plugin-cache";

export default <UserConfig>defineUserConfig({
  base: "/VVBP/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "Rochsen",
      description: "只有风暴才能击倒大树",
    },

    "/en/": {
      lang: "en-US",
      title: "My name is Rochsen",
      description: "Only a storm can fell a greatwood.",
    },
  },

  theme,

  // host: "127.0.0.1",

  port: 8888,

  // 和 PWA 一起启用
  shouldPrefetch: false,

  // title: "Rochsen's Blog",
  // description: "个人博客",
  plugins: [cachePlugin({ type: "filesystem" })],
});
