import { navbar } from "vuepress-theme-hope";

export const zhNavbarConfig = navbar([
  "/",
  "/notes/",
  "/games/",
  "/navigation/",
  {
    text: "关于",
    icon: "https://pic1.imgdb.cn/i/034EJkCaZlw3f8z0SxCckf.svg",
    link: "https://rochsen.github.io/Intro/",
  },
  //   "/about/",
]);
export const enNavbarConfig = navbar([
  "/en/",
  "/en/notes/",
  {
    text: "About",
    link: "https://rochsen.github.io/Intro/",
  },
]);
