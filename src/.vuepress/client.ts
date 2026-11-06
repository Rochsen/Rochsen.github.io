import { defineClientConfig } from "vuepress/client";
import { setupTransparentNavbar } from "vuepress-theme-hope/presets/transparentNavbar.js";
import { setupSnowFall } from "vuepress-theme-hope/presets/snowFall.js";
import { setupRunningTimeFooter } from "vuepress-theme-hope/presets/footerRunningTime.js";
import Blog from "./layouts/Blog.vue";

export default defineClientConfig({
  setup() {
    // 透明导航栏
    setupTransparentNavbar({ type: "homepage" });
    // 下雪
    setupSnowFall();
    // 在页脚 footer 显示站点运行时间
    setupRunningTimeFooter(
      new Date("2026-01-21"),
      {
        "/en/":
          "Running time: :day days :hour hours :minute minutes :second seconds",
        "/": "已运行 :day 天 :hour 小时 :minute 分钟 :second 秒",
      },
      // 是否保留原有页脚内容
      false,
    );
  },

  // 布局
  layouts: {
    Blog,
  },
});
