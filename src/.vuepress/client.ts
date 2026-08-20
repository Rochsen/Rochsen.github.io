import { defineClientConfig, useRoute } from "vuepress/client";
import { watch } from "vue";

// 按需引入 Antdv-next
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Tooltip,
} from "antdv-next";

// 每日一言：只请求一次并缓存，SPA 路由切换后页脚会重建，从缓存重新写入
let hitokotoText = "";

const writeFooter = (text: string, retries = 10): void => {
  // 服务端渲染阶段没有 document，直接跳过，避免 SSR 构建报错
  if (typeof document === "undefined") return;
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
    // 按需注册 Antdv-next 组件
    app.use(Button);
    app.use(Card); // CardMeta 随 Card 一起注册
    app.use(Col);
    app.use(Input); // InputSearch 随 Input 一起注册
    app.use(Row);
    app.use(Space);
    app.use(Table);
    app.use(Tag);
    app.use(Timeline); // TimelineItem 随 Timeline 一起注册
    app.use(Tooltip);
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
