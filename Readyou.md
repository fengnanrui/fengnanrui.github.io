# Nanru1的技术博客

这是一个基于Jekyll的现代化技术博客，用于分享Azure云服务、DevOps实践和现代化开发技术。该博客设计为在GitHub Pages上运行，提供了响应式设计、深色模式和各种现代化的用户体验改进。

## 主要特性

- 响应式设计，完美支持移动端和桌面端
- 深色模式支持，根据系统偏好自动切换
- 现代化UI和流畅动画效果
- 优化的性能和加载速度
- 自定义模板页面
- PWA支持，实现离线访问
- 集成搜索功能

## 在GitHub Pages上部署

### 1. 创建仓库

创建一个名为 `username.github.io` 的仓库，其中 `username` 是你的GitHub用户名。

### 2. 克隆此仓库

```bash
git clone https://github.com/fengnanrui/fengnanrui.github.io.git
cd fengnanrui.github.io
```

### 3. 修改配置

编辑 `_config.yml` 文件，更改以下内容：

```yaml
title: "你的博客名称"
email: 你的邮箱地址
description: >-
  你的博客描述
baseurl: "" # 如果是用户站点，保持为空
url: "https://你的用户名.github.io"
github_username: 你的GitHub用户名

author:
  name: 你的名字
  email: 你的邮箱地址
  bio: "你的简介"
```

### 4. 提交并推送到GitHub

```bash
git add .
git commit -m "初始化博客"
git push origin main
```

### 5. 启用GitHub Pages

1. 在GitHub仓库页面，进入Settings选项卡
2. 在左侧边栏找到"Pages"选项
3. 在"Source"部分，选择"main"分支
4. 点击"Save"按钮
5. 等待几分钟后，你的网站将在 `https://你的用户名.github.io` 可以访问

### 6. 自定义域名（可选）

如果你想使用自定义域名：

1. 在DNS提供商处添加CNAME记录，指向 `你的用户名.github.io`
2. 在仓库根目录创建名为 `CNAME` 的文件，内容为你的域名
3. 在GitHub Pages设置中输入你的自定义域名并勾选"Enforce HTTPS"

## 添加博客文章

在 `_posts` 文件夹中创建新的Markdown文件，文件名格式为：`YYYY-MM-DD-标题.md`。在文件顶部添加Front Matter：

```yaml
---
layout: post
title: "文章标题"
date: YYYY-MM-DD HH:MM:SS +0800
categories: [分类]
tags: [标签1, 标签2]
image: /path/to/featured/image.jpg (可选)
---

这里是文章内容...
```

## 项目结构



## 技术栈

- Jekyll 静态站点生成器
- HTML5, CSS3, JavaScript
- 响应式设计
- 深色模式支持
- PWA功能
- Intersection Observer API

## 浏览器兼容性

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
- 支持PWA的现代浏览器

## 许可证

此项目使用[MIT许可证](LICENSE)
