# 图南工作官网

## 项目概述

图南工作室（TunanStudio）游戏公司官网，采用现代极简设计风格，展示游戏工作室形象与产品信息。

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript (ES6+)
- ES Module 模块化
- Rollup 生产构建
- Vite 开发服务器

## 目录结构

```
├── index.html              # 首页
├── page/                   # 页面目录
│   ├── product.html        # 产品介绍页
│   └── team.html           # 团队介绍页
├── css/                    # 样式目录
│   └── styles.css          # 主样式文件
├── script/                 # 脚本目录
│   ├── main.js             # 主入口
│   ├── i18n.js             # 多语言引擎
│   ├── router.js           # 路由管理
│   └── animation.js        # 动画效果
├── img/                    # 图片资源
│   ├── hero/               # 首屏背景图片
│   ├── icons/              # 图标文件
│   └── team/               # 团队成员照片
├── Text/                   # 多语言文件
│   ├── lang.json           # 中文
│   └── lang-en.json        # 英文
└── js/                     # 打包输出目录
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

### 代码检查

```bash
# ESLint
npm run lint

# Stylelint
npx stylelint "css/*.css"
```

### 运行测试

```bash
# 单元测试
npm test

# E2E测试
npm run test:e2e
```

## 功能特性

- **多语言支持**：中/英双语切换
- **响应式设计**：适配桌面/平板/移动端
- **高性能动画**：GPU加速的3D文字动效
- **无刷新导航**：history.pushState路由切换
- **无障碍设计**：WCAG 2.2 AA级对比度

## 需要的图片资源

在 `img/` 目录下需要添加以下图片：

> **详细规范请参阅 [img/hero/README.md](img/hero/README.md)**

### hero/ 目录
- `hero-bg.webp` / `hero-bg.jpg` - 2560×1440 全屏背景
- `hero-bg@2x.webp` / `hero-bg@2x.jpg` - @2x倍图
- `hero-bg@3x.webp` / `hero-bg@3x.jpg` - @3x倍图
- `product-1.webp` / `product-1.jpg` - 产品1封面
- `product-2.webp` / `product-2.jpg` - 产品2封面
- `product-3.webp` / `product-3.jpg` - 产品3封面

### team/ 目录
- `member-1.webp` / `member-1.jpg` - 团队成员1头像
- `member-2.webp` / `member-2.jpg` - 团队成员2头像
- `member-3.webp` / `member-3.jpg` - 团队成员3头像
- `member-4.webp` / `member-4.jpg` - 团队成员4头像

### icons/ 目录（如需要）
- SVG 图标文件

## 浏览器兼容

- Chrome ≥ 96
- Firefox ≥ 95
- Safari ≥ 14
- Edge ≥ 96
- IE11（优雅降级）

## 部署

详见 [DEPLOY.md](./DEPLOY.md)
