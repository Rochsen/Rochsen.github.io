import { arraySidebar } from "vuepress-theme-hope";

/** 一级侧边栏 **/
export const NoteSideBar = arraySidebar([
  // "",
  "workbench/", // 工作台
  "aiApplicationEngineer/", // AI应用工程师笔记
  "bioinformatics/", // 生物信息学笔记
  "computerSci/", // 计算机科学笔记
  "py/", // Python编程笔记
  {
    text: "投资学习笔记",
    icon: "moneybagfill",
    prefix: "investment/",
    collapsible: true,
    expanded: false,
    children: [
      { text: "股票", icon: "gupiao", link: "stock/" },
      { text: "债券", icon: "zhaiquan", link: "bond/" },
      { text: "基金", icon: "jijin", link: "fund/" },
      { text: "资产", icon: "zichan", link: "assets/" },
      { text: "保险", icon: "baoxian", link: "insurance/" },
    ],
  },
]);
