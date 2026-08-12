import pySvg from "/skills/py.svg";
import fastapiSvg from "/skills/fastapi.svg";
import databaseSvg from "/skills/sqlite.svg";
import vueSvg from "/skills/vue.svg";
import tsSvg from "/skills/typescript.svg";
import tailwindcssSvg from "/skills/tailwindcss.svg";
import html5Svg from "/skills/HTML5.svg";
import cssSvg from "/skills/css.svg";
import dockerSvg from "/skills/docker.svg";
import linuxSvg from "/skills/linux.svg";
import gitSvg from "/skills/git.svg";
import markdownSvg from "/skills/markdown.svg";
import pytorchSvg from "/skills/pytorch.svg";
import tensorflowSvg from "/skills/tensorflow.svg";
import elementPlusSvg from "/skills/element-plus.svg";
import antdSvg from "/skills/antd.svg";
import pandasSvg from "/skills/pandas.svg";
import nodejsSvg from "/skills/Node.js.svg";
import { GithubOutlined, BilibiliOutlined } from "@antdv-next/icons";

import {
  skillSchema,
  personalitySchema,
  contactMeSchema,
  educationSchema,
  CareerSchema,
} from "./schema.ts";

// 人格类型 ISTP
export const personality: personalitySchema = {
  name: "ISTP",
  img: "https://pic1.imgdb.cn/i/0345mMFuVE5qWysT0qr39Z.svg",
  url: "https://www.16personalities.com/ch/istp-%E4%BA%BA%E6%A0%BC",
};

// 技能图标
export const skills: skillSchema[] = [
  { name: "Linux", svg: linuxSvg, url: "https://www.linux.org/" },
  { name: "Git", svg: gitSvg, url: "https://git-scm.com/" },
  { name: "Python", svg: pySvg, url: "https://www.python.org/" },
  { name: "pandas", svg: pandasSvg, url: "https://pandas.pydata.org/" },
  { name: "FastApi", svg: fastapiSvg, url: "https://fastapi.tiangolo.com/" },
  {
    name: "Sqlite3",
    svg: databaseSvg,
    url: "https://www.sqlite.org/index.html",
  },
  { name: "Docker", svg: dockerSvg, url: "https://www.docker.com/" },
  { name: "PyTorch", svg: pytorchSvg, url: "https://pytorch.org/" },
  {
    name: "TensorFlow",
    svg: tensorflowSvg,
    url: "https://www.tensorflow.org/",
  },
  { name: "Node.js", svg: nodejsSvg, url: "https://nodejs.org/" },
  {
    name: "Vue3",
    svg: vueSvg,
    url: "https://cn.vuejs.org/",
  },
  {
    name: "Typescript",
    svg: tsSvg,
    url: "https://www.typescriptlang.org/",
  },
  {
    name: "Html",
    svg: html5Svg,
    url: "https://www.w3schools.com/html/",
  },
  {
    name: "Css",
    svg: cssSvg,
    url: "https://www.w3schools.com/css/",
  },
  {
    name: "TailwindCss",
    svg: tailwindcssSvg,
    url: "https://tailwind.nodejs.cn/docs",
  },
  {
    name: "Element-plus",
    svg: elementPlusSvg,
    url: "https://element-plus.org/",
  },
  {
    name: "Antd-next",
    svg: antdSvg,
    url: "https://www.antdv-next.com/index-cn",
  },
  { name: "Markdown", svg: markdownSvg, url: "https://www.markdownguide.org/" },
];

// 职业生涯记录 - 数据
export const career: CareerSchema[] = [
  {
    step: 1,
    title: "2021.09.13 - 2022.05.17",
    description: "华大生命科学研究院 - 国家基因库：实验室安全管理（实习）",
    state: "completed",
  },
  {
    step: 2,
    title: "2022.06.08 - 2023.12.31",
    description: "广州序源医学科技有限公司：生物信息助理工程师",
    state: "completed",
  },
  {
    step: 3,
    title: "2024.01.01 - 2026.01.09",
    description: "广州序源医学科技有限公司：生物信息分析工程师",
    state: "completed",
  },
  {
    step: 4,
    title: "To Be Continued...",
    description: "",
    state: "inactive",
  },
];

// 教育经历 - 数据
export const education: educationSchema[] = [
  {
    title: "仲恺农业工程大学",
    time: "2018.09 ~ 2022.06",
    desc: "种子科学与工程",
    img: "https://pic1.imgdb.cn/i/0345mMGkkw34P2CXa0etow.png",
  },
  {
    title: "中山市桂山中学",
    time: "2024.09 - 2026.06",
    desc: "理科 - 物化生",
    img: "https://pic1.imgdb.cn/i/0345mMH57yBoa1oLvUUwwG.png",
  },
];

// 联系我
export const contactMe: contactMeSchema[] = [
  {
    title: "Github",
    buttonColor: "default",
    icon: GithubOutlined,
    url: "https://github.com/Rochsen",
  },
  {
    title: "Bilibili",
    buttonColor: "pink",
    icon: BilibiliOutlined,
    url: "https://space.bilibili.com/361524948",
  },
];
