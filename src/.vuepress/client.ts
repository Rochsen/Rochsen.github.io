import { defineClientConfig, useRoute } from "vuepress/client";
import { watch } from "vue";

// 全量引入Antdv-next
import AntdvNext from "antdv-next";
import "antdv-next/dist/antd.css";

// 每日一言：只请求一次并缓存，SPA 路由切换后页脚会重建，从缓存重新写入
let hitokotoText = "";

const writeFooter = (text: string, retries = 10): void => {
  const footer = document.querySelector(".vp-footer");
  if (footer) footer.innerHTML = text;
  // 若请求返回早于页脚渲染完成，稍后重试
  else if (retries > 0) setTimeout(() => writeFooter(text, retries - 1), 200);
};

const writeHitokoto = (): void => {
  if (hitokotoText) {
    writeFooter(hitokotoText);
    return;
  }
  fetch("https://v1.hitokoto.cn/?c=d&encode=json")
    .then((res) => res.json())
    .then(({ hitokoto, from }: { hitokoto: string; from: string }) => {
      hitokotoText = `${hitokoto} ——「${from}」`;
      writeFooter(hitokotoText);
    })
    .catch(() => {
      // 请求失败时保留主题默认页脚文案
    });
};

export default defineClientConfig({
  enhance({ app }) {
    // 注册AntdV-next
    app.use(AntdvNext);
  },
  setup() {
    const route = useRoute();
    // 首次加载与每次路由切换：flush: "post" 保证在 Vue 更新 DOM（重建页脚占位文字）之后再写入一言
    watch(
      () => route.path,
      () => writeHitokoto(),
      { immediate: true, flush: "post" },
    );
  },
});
