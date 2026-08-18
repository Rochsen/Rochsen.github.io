---
title: 将静态博客部署到Github
date: 2026-01-21
order: 1
category: 部署
tag:
    - 指南
    - 博客
breadcrumb: true
sticky: true
star: true
---

<!-- more -->

## 第一步：本地创建项目
```powershell

PS D:\project> pnpm create vuepress-theme-hope ./Vuepress-Version-Blog-Pnpm
✔ Select a language to display / 选择显示语言 简体中文
✔ 选择包管理器 pnpm
✔ 你想要使用哪个打包器？ vite
生成 package.json...
✔ 设置应用名称 hello-vuepress
✔ 设置应用描述 no
✔ 设置应用版本号 2.0.0
✔ 设置协议 MIT
生成 tsconfig.json...
✔ 你想要创建什么类型的项目？ blog
✔ 项目需要用到多语言么? No
生成模板...
✔ 是否初始化 Git 仓库? Yes
✔ 是否需要一个自动部署文档到 GitHub Pages 的工作流？ Yes
安装依赖...
这可能需要数分钟，请耐心等待.
我们无法正确输出子进程的进度条，所以进程可能会看似未响应

   ╭───────────────────────────────────────────────────────────────────╮
   │                                                                   │
   │                Update available! 10.6.1 → 10.28.1.                │
   │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v10.28.1   │
   │                 Run "pnpm add -g pnpm" to update.                 │
   │                                                                   │
   ╰───────────────────────────────────────────────────────────────────╯

Packages: +353
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 438, reused 340, downloaded 20, added 353, done

devDependencies:
+ @vuepress/bundler-vite 2.0.0-rc.26
+ sass-embedded 1.97.2
+ vue 3.5.27
+ vuepress 2.0.0-rc.26
+ vuepress-theme-hope 2.0.0-rc.102

Done in 5.2s using pnpm v10.6.1
模板已成功生成!
✔ 是否想要现在启动 Demo 查看? Yes
启动开发服务器...
启动成功后，请在浏览器输入给出的开发服务器地址(默认为 'localhost:8080')

> hello-vuepress@2.0.0 docs:dev D:\project\Vuepress-Version-Blog-Pnpm
> vuepress-vite dev src

✔ Initializing and preparing data - done in 321ms
Port 8080 is in use, trying another one...

  vite v7.1.12 dev server running at:

  ➜  Local:   http://localhost:8081/
  ➜  Network: http://192.168.125.4:8081/
```

## 第二步：github新建仓库

- 输入名称
- 输入描述（可选）
- 设置公开
- 添加README

## 第三步：github仓库创建新的分支
- 作用：用于存储静态html编译好的代码
- 方法：在github点击分支创建，分支名称为blog_pages
## 第四步：需要让github支持对外访问
1. 点击仓库的Setting
2. 选择左侧侧边栏的`Github Pages `
3. 选择将什么分支映射为可访问的静态站点，选择刚才创建的新分支`blog_pages`
4. 点击save保存
## 第五步：去github生成一个Access Token
1. 点击你的头像
2. 选择下方的设置Settings
3. 选择左侧侧边栏的开发者设置`developer Settings`
4. 选择个人访问令牌（经典）
5. 点击生成新令牌，选择经典
6. 备注可以说明令牌的作用，令牌有效期选择无有效期
7. 勾选设置权限为repo，使得令牌可以支持修改发布你的仓库
8. 令牌复制，比如：XXXXXXXX

## 第六步：将令牌设置到博客仓库
1. 在左侧侧边栏，选择安全-机密和变量（secrets and variables）- 代码空间
2. 点击新建机密
3. 标题为ACCESS_TOKEN，将密钥复制到密钥处
4. 点击添加机密

## 第七步：vscode修改仓库.github/workflows下方的yml文件
1. 修改部署文档的分支
```yaml
- name: 部署文档
  uses: JamesIves/github-pages-deploy-action@v4
  env:
	  GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
  with:
	  # 部署文档
	  branch: blog_pages
	  folder: src\.vuepress\dist
```
## 第八步：绑定远程仓库
- 将远程仓库的git地址添加到远程仓库
- 将本地代码和远程的main分支进行合并
- 发布到远程
## 第九步：修改部署的bug
- 指定pnpm版本，如下
```shell
  - name: 设置 pnpm
	uses: pnpm/action-setup@v4
	with:
	  version: 10
```
- 将下斜杠windows的路径修改为上斜杠linux路径
## 第十步：修改src下的config.ts
- 已经可以访问，但是样式不对，所以需要修改
- 修改base键值，根据访问的github提供的名称
```ts
export default defineUserConfig({
  base: "/Vuepress-Version-Blog-Pnpm/",
  lang: "zh-CN",
  title: "博客演示",
  description: "vuepress-theme-hope 的博客演示", 
  theme,
  // 和 PWA 一起启用
  // shouldPrefetch: false,
});

```
- 重新上传