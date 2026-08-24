import { defineUserConfig } from "vuepress";
import type { UserConfig } from "vuepress";
import theme from "./theme.js";
// import { cachePlugin } from "@vuepress/plugin-cache";

export default <UserConfig>defineUserConfig({
  // github仓库为VVBP
  // base: "/VVBP/",
  // github仓库重命名为Rochsen.github.io
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

  // 和 PWA 一起启用
  shouldPrefetch: false,

  // title: "Rochsen's Blog",
  // description: "个人博客",
  // plugins: [cachePlugin({ type: "filesystem" })],
});
