# Rochsen.github.io

罗浩森的个人博客，记录 AI 应用、生物信息、编程与日常工具。站点地址：[https://blog.rochsen.cn/](https://blog.rochsen.cn/)。

基于 [VuePress](https://vuejs.press/zh/) 与 [vuepress-theme-hope](https://theme-hope.vuejs.press/zh/) 搭建，中文为主，并保留英文入口。

## 栏目

| 路径 | 内容 |
| --- | --- |
| `src/notes/` | 笔记：部署、AI 应用、生物信息、计算机基础、Python |
| `src/softwares/` | 正在使用的软件与工具 |
| `src/investment/` | 投资记录 |
| `src/games/` | 游戏记录 |
| `src/friendLink/` | 友链 |
| `src/navigation/` | 书签与导航 |
| `src/en/` | 英文页面 |

主题、导航和侧边栏在 `src/.vuepress/`。

## 本地开发

需要 Node.js 24 与 pnpm 11。

```powershell
pnpm install
pnpm docs:dev
```

开发服务默认端口为 `8888`。清理缓存后启动：

```powershell
pnpm docs:clean-dev
```

本地构建：

```powershell
pnpm docs:build
```

产物在 `src/.vuepress/dist/`。

## 部署

推送到 `main` 后，GitHub Actions 会执行 `pnpm docs:build`，并把静态文件发布到 `blog_pages` 分支。仓库需配置名为 `ACCESS_TOKEN` 的个人访问令牌，且该令牌具备仓库写入权限。

## 许可

[MIT](./LICENSE)
