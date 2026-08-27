import { navbar } from "vuepress-theme-hope";

export const zhNavbarConfig = navbar([
  "/",
  "/learns/",
  "/games/",
  "/navigation/",
  {
    text: "关于",
    link: "https://rochsen.github.io/Intro/",
  },
  //   "/about/",
]);
export const enNavbarConfig = navbar([
  "/en/",
  "/en/learns/",
  {
    text: "About",
    link: "https://rochsen.github.io/Intro/",
  },
]);
