import { defineUserConfig } from "vuepress";
import type { UserConfig } from "vuepress";
import theme from "./theme.js";
// import { cachePlugin } from "@vuepress/plugin-cache";
import { searchPlugin } from "@vuepress/plugin-search";

export default <UserConfig>defineUserConfig({
  // github仓库重命名为 Rochsen.github.io
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "欢迎来到我的博客",
    },

    "/en/": {
      lang: "en-US",
      title: "Welocome to My Blog",
    },
  },

  theme,

  // host: "127.0.0.1",

  port: 8888,

  plugins: [
    // 轻量化搜索
    searchPlugin({
      // 配置项
      locales: {
        "/": {
          placeholder: "搜索",
        },
        "/en/": {
          placeholder: "Search",
        },
      },
    }),
  ],

  // 和 PWA 一起启用
  // shouldPrefetch: false,

  // title: "Rochsen's Blog",
  // description: "个人博客",
});
