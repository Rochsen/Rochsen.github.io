import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbarConfig, enNavbarConfig } from "./navbar.ts";
import { zhSideBarConfig, enSidebarConfig } from "./sidebar/index.ts";

// 社交媒体信息
export const mediasConfig = {
  BiliBili: "https://space.bilibili.com/361524948",
  GitHub: "https://github.com/Rochsen",
  Steam: "https://steamcommunity.com/profiles/76561199143139420/",
  Gmail: "mailto:rochsen1011@gmail.com",
  Zhihu: "https://www.zhihu.com/people/Rochsen",
};

// 主题选项
export default hopeTheme(
  {
    // 当前网站部署到的域名。暂时没有公网域名
    hostname: "https://rochsen-blog.com/VVBP",

    author: {
      name: "罗浩森",
      url: "https://rochsen.github.io/VVBP/",
    },

    // 浏览器图标
    favicon: "/logo.svg",

    // 博客首页 logo
    logo: "/favicon.ico",

    // 博客的GitHub仓库
    repo: "Rochsen/Rochsen.github.io",

    // 是否在导航栏展示仓库链接
    repoDisplay: true,

    // 是否展示全屏按钮
    fullscreen: false,

    // 导航栏布局
    navbarLayout: {
      start: ["Brand"],
      center: ["Links"],
      end: ["Language", "Repo", "Outlook"],
    },

    // 文档所在目录
    docsDir: "src",

    // 是否展示页脚
    displayFooter: true,

    // 默认页脚，这边已在client.ts设置
    footer: "src\.vuepress\client.ts",

    // 文档右下方的编辑此页
    metaLocales: {
      editLink: "编辑此页",
    },

    // 多语言配置 博客功能
    locales: {
      "/": {
        navbar: zhNavbarConfig,
        sidebar: zhSideBarConfig,
        blog: {
          description: "生物信息全栈开发工程师",
          intro: "https://rochsen.github.io/Intro/",
          medias: mediasConfig,
          timeline: "时光机",
        },
      },
      "/en/": {
        navbar: enNavbarConfig,
        sidebar: enSidebarConfig,
        blog: {
          description: "Bioinformatics full stack development engineer",
          intro: "https://rochsen.github.io/Intro/en/",
          medias: mediasConfig,
          timeline: "Time Machine",
        },
      },
    },

    // 此处开启了很多功能用于演示，你应仅保留用到的功能。
    markdown: {
      alert: true,
      align: true,
      attrs: true,
      codeTabs: true,
      component: true,
      demo: true,
      figure: true,
      hint: false,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      math: {
        type: "katex",
      },
      mermaid: true,
      plantuml: true,
      spoiler: true,
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,

      // 取消注释它们如果你需要 TeX 支持
      // math: {
      //   // 启用前安装 katex
      //   type: "katex",
      //   // 或者安装 @mathjax/src
      //   type: "mathjax",
      // },

      // 如果你需要幻灯片，安装 @vuepress/plugin-revealjs 并取消下方注释
      // revealjs: {
      //   plugins: ["highlight", "math", "search", "notes", "zoom"],
      // },

      // 在启用之前安装 chart.js
      // chartjs: true,

      // insert component easily

      // 在启用之前安装 echarts
      // echarts: true,

      // 在启用之前安装 flowchart.ts
      // flowchart: true,

      // 在启用之前安装 mermaid
      // mermaid: true,

      // playground: {
      //   presets: ["ts", "vue"],
      // },

      // 在启用之前安装 @vue/repl
      // vuePlayground: true,

      // 在启用之前安装 sandpack-vue3
      // sandpack: true,
    },

    // 在这里配置主题提供的插件
    plugins: {
      // 启动博客插件
      blog: true,

      // 框架自带的组件
      components: {
        components: ["Badge", "VPCard"],
      },

      feed: {
        atom: true,
        json: true,
        rss: true,
      },

      // 阿里云图标库，参考了作者的博客
      icon: {
        assets: "//at.alicdn.com/t/c/font_5224531_dnv00kxx81w.css",
      },

      // 前端导航栏扰动的根本原因
      // icon: {
      //   prefix: "fa6-solid:",
      // },

      // docsearch: {
      //   appId: "TFYC0LM59H",
      //   apiKey: "98079842ea4f4565e37eb23d80fb3adf",
      //   indexName: "VVBP",
      // },

      // 启用之前需安装 @waline/client
      // 警告：这是一个仅供演示的测试服务，在生产环境中请自行部署并使用自己的服务！
      // comment: {
      //   provider: "Waline",
      //   serverURL: "https://waline-comment.vuejs.press",
      // },

      // 如果你需要 PWA。安装 @vuepress/plugin-pwa 并取消下方注释
      // pwa: {
      //   favicon: "/favicon.ico",
      //   cacheHTML: true,
      //   cacheImage: true,
      //   appendBase: true,
      //   apple: {
      //     icon: "/assets/icon/apple-icon-152.png",
      //     statusBarColor: "black",
      //   },
      //   msTile: {
      //     image: "/assets/icon/ms-icon-144.png",
      //     color: "#ffffff",
      //   },
      //   manifest: {
      //     icons: [
      //       {
      //         src: "/assets/icon/chrome-mask-512.png",
      //         sizes: "512x512",
      //         purpose: "maskable",
      //         type: "image/png",
      //       },
      //       {
      //         src: "/assets/icon/chrome-mask-192.png",
      //         sizes: "192x192",
      //         purpose: "maskable",
      //         type: "image/png",
      //       },
      //       {
      //         src: "/assets/icon/chrome-512.png",
      //         sizes: "512x512",
      //         type: "image/png",
      //       },
      //       {
      //         src: "/assets/icon/chrome-192.png",
      //         sizes: "192x192",
      //         type: "image/png",
      //       },
      //     ],
      //     shortcuts: [
      //       {
      //         name: "Demo",
      //         short_name: "Demo",
      //         url: "/demo/",
      //         icons: [
      //           {
      //             src: "/assets/icon/guide-maskable.png",
      //             sizes: "192x192",
      //             purpose: "maskable",
      //             type: "image/png",
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // },
    },

    // 如果想要实时查看任何改变，启用它。注：这对更新性能有很大负面影响
    // hotReload: true,
  },
  // 主题行为选项（可选）
  { custom: true },
);
