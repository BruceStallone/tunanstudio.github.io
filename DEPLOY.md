# 部署手册

本文档提供图南工作室官网的部署指南，包括CDN缓存策略、图片懒加载阈值和404回退规则。

## 1. 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 2. 开发环境启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或使用指定端口
npm run serve
```

开发服务器将在 http://localhost:3000 启动。

## 3. 生产构建

```bash
# 构建生产版本
npm run build

# 构建产物位于 dist/ 目录
```

## 4. CDN缓存策略

### 4.1 静态资源缓存

| 资源类型 | 缓存时间 | 缓存策略 |
|---------|---------|---------|
| JS/CSS文件 | 1年 | immutable + hash |
| 图片文件 | 1年 | immutable + hash |
| 语言JSON | 1小时 | must-revalidate |
| HTML文件 | 0 | no-cache |

### 4.2 缓存配置示例（Nginx）

```nginx
# JS/CSS/图片 - 长期缓存
location ~* \.(js|css|png|jpg|jpeg|webp|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 语言文件 - 短期缓存
location ~* \.(json)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

# HTML - 不缓存
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

### 4.3 缓存配置示例（Vercel）

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/img/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/Text/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

## 5. 图片懒加载配置

### 5.1 懒加载阈值

- 首屏图片：立即加载（fetchpriority="high"）
- 非首屏图片：距离视口 50px 时开始加载
- 移动端：距离视口 100px 时开始加载

### 5.2 图片格式优先级

1. WebP（优先）
2. JPEG（回退）
3. PNG（图标）

### 5.3 响应式图片srcset

```html
<picture>
  <source srcset="hero-bg@3x.webp 3x, hero-bg@2x.webp 2x, hero-bg.webp" type="image/webp">
  <source srcset="hero-bg@3x.jpg 3x, hero-bg@2x.jpg 2x, hero-bg.jpg" type="image/jpeg">
  <img src="hero-bg.jpg" alt="" loading="eager">
</picture>
```

### 5.4 图片尺寸要求

| 用途 | 最小尺寸 | 最大体积 | 格式 |
|-----|---------|---------|------|
| 背景图 | 2560×1440 | 300KB | WebP |
| 产品封面 | 800×450 | 150KB | WebP |
| 团队头像 | 200×200 | 50KB | WebP |
| 图标 | 64×64 | 20KB | SVG |

## 6. 404回退规则

### 6.1 SPA回退配置

对于单页应用路由，需要配置所有子路径回退到index.html：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 6.2 Vercel配置（vercel.json）

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6.3 自定义404页面

当资源完全不存在时，显示友好错误页面：

```html
<!-- public/404.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>404 - 页面未找到</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .error { text-align: center; }
    h1 { font-size: 4rem; color: #2D3436; margin: 0; }
    p { color: #636E72; margin: 1rem 0; }
    a { color: #74B9FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="error">
    <h1>404</h1>
    <p>抱歉，您访问的页面不存在</p>
    <a href="/">返回首页</a>
  </div>
</body>
</html>
```

## 7. 性能优化建议

### 7.1 关键指标目标

| 指标 | 目标值 |
|-----|-------|
| Lighthouse | ≥95分 |
| FCP | ≤1.8s |
| LCP | ≤2.5s |
| FID | ≤100ms |
| CLS | ≤0.1 |

### 7.2 优化措施

1. 启用Gzip/Brotli压缩
2. 使用CDN分发静态资源
3. 预连接外部域名
4. 预加载关键资源
5. 实施资源提示

## 8. 监控与告警

### 8.1 推荐监控工具

- Vercel Analytics（已集成）
- Google PageSpeed Insights
- Lighthouse CI

### 8.2 关键指标监控

建议设置自动化监控，检测以下指标：
- LCP > 2.5s
- FID > 100ms
- 任何JavaScript错误

## 9. 回滚流程

如需回滚到上一版本：

```bash
# 查看版本历史
git log

# 回滚到上一个版本
git revert HEAD

# 或指定版本
git revert <commit-hash>

# 重新部署
npm run build
```

## 10. 联系方式

如有问题，请联系技术支持。
