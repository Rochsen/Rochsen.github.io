import { navbar } from "vuepress-theme-hope";

export const zhNavbarConfig = navbar([
  "/",
  "/notes/",
  "/games/",
  "/navigation/",
  {
    text: "自我介绍",
    link: "https://rochsen.github.io/Intro/",
  },
  //   "/about/",
]);
export const enNavbarConfig = navbar([
  "/en/",
  "/en/notes/",
  {
    text: "Intro",
    link: "https://rochsen.github.io/Intro/",
  },
]);
