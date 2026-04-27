# Health Agent Static

这是一个独立的纯前端静态展示版，适合单独上传到 GitHub，并部署到 GitHub Pages 或 Vercel。

它不依赖原项目的后端、不依赖 API 文件、不需要环境变量。所有数据都保存在浏览器 `localStorage` 中。

## 文件结构

```text
health-agent-static/
  package.json
  index.html
  vite.config.js
  public/
    illustrations/
      health-agent-hero.svg
  src/
    main.jsx
    App.jsx
    styles.css
  README.md
```

## 本地启动

```bash
npm install
npm run dev
```

打开终端显示的本地地址，例如：

```text
http://127.0.0.1:5173
```

## 构建

```bash
npm run build
```

构建产物会生成在：

```text
dist/
```

## 部署到 GitHub Pages

1. 把 `health-agent-static` 文件夹作为一个独立 GitHub 仓库上传。
2. 在仓库中安装依赖并构建：

```bash
npm install
npm run build
```

3. 推荐使用 GitHub Pages + Actions。可以在仓库中新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy static site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. 在 GitHub 仓库 `Settings -> Pages` 中选择 GitHub Actions。

## 部署到 Vercel

1. 在 Vercel 导入这个独立仓库。
2. Framework Preset 选择 `Vite`。
3. Build Command:

```bash
npm run build
```

4. Output Directory:

```text
dist
```

无需配置环境变量。

## 说明

- 本项目仅用于静态展示和交互体验。
- 分诊、趋势分析、报告解读都是前端本地演示逻辑。
- 不诊断、不开药、不替代医生。
