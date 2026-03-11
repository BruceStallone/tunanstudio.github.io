# Hero 图片资源规范文档

## 1. 概述

本文档详细说明 `img/hero/` 目录下所有图片资源的用途、加载策略、分辨率适配规则及性能优化考量。

---

## 2. 图片清单

### 2.1 hero-bg（全屏背景图）

| 文件名 | 格式 | 用途 | 建议分辨率 | 最大体积 |
|--------|------|------|------------|----------|
| `hero-bg.webp` | WebP | 首屏全屏背景（默认） | 2560×1440 | ≤300KB |
| `hero-bg@2x.webp` | WebP | Retina屏幕（2x DPR） | 3840×2160 | ≤300KB |
| `hero-bg@3x.webp` | WebP | 超高清屏幕（3x DPR） | 5120×2880 | ≤300KB |
| `hero-bg.jpg` | JPEG | WebP不支持时的回退 | 2560×1440 | ≤300KB |
| `hero-bg@2x.jpg` | JPEG | Retina回退 | 3840×2160 | ≤300KB |
| `hero-bg@3x.jpg` | JPEG | 超高清回退 | 5120×2880 | ≤300KB |

### 2.2 product-*（产品封面图）

| 文件名 | 格式 | 用途 | 建议分辨率 | 最大体积 |
|--------|------|------|------------|----------|
| `product-1.webp` | WebP | 产品1封面 | 800×450 | ≤150KB |
| `product-1@2x.webp` | WebP | 产品1 Retina | 1600×900 | ≤150KB |
| `product-1@3x.webp` | WebP | 产品1 3x | 2400×1350 | ≤150KB |
| `product-1.jpg` | JPEG | 产品1回退 | 800×450 | ≤150KB |

（product-2, product-3 同理）

---

## 3. 加载策略

### 3.1 srcset 响应式加载

项目使用 HTML5 `<picture>` 元素配合 `srcset` 实现响应式图片加载：

```html
<picture>
  <!-- WebP 格式优先 -->
  <source 
    srcset="
      img/hero/hero-bg@3x.webp 3x,
      img/hero/hero-bg@2x.webp 2x,
      img/hero/hero-bg.webp
    " 
    type="image/webp"
  >
  <!-- JPEG 回退 -->
  <source 
    srcset="
      img/hero/hero-bg@3x.jpg 3x,
      img/hero/hero-bg@2x.jpg 2x,
      img/hero/hero-bg.jpg
    " 
    type="image/jpeg"
  >
  <!-- 默认图片 -->
  <img 
    src="img/hero/hero-bg.jpg" 
    alt=""
    class="hero-bg-img"
    width="2560"
    height="1440"
    loading="eager"
    fetchpriority="high"
  >
</picture>
```

### 3.2 加载优先级

| 图片类型 | loading 属性 | fetchpriority 属性 | 说明 |
|----------|--------------|-------------------|------|
| hero-bg | `eager` | `high` | 首屏关键图片，立即加载 |
| product-* | `lazy` | `auto` | 非首屏，懒加载 |
| team-* | `lazy` | `auto` | 非首屏，懒加载 |

---

## 4. 分辨率适配规则

### 4.1 设备像素比（DPR）映射

| DPR | 加载的文件 | 典型设备 |
|-----|-----------|----------|
| 1x | `hero-bg.webp` | 标准桌面显示器 |
| 2x | `hero-bg@2x.webp` | Retina MacBook, 高端手机 |
| 3x | `hero-bg@3x.webp` | 超高清手机, 某些平板 |

### 4.2 屏幕尺寸映射（可选增强）

如果需要根据屏幕宽度而非 DPR 加载图片，可以使用 `sizes` 属性：

```html
<img
  srcset="
    hero-bg.webp 1280w,
    hero-bg@2x.webp 1920w,
    hero-bg@3x.webp 2560w
  "
  sizes="(max-width: 768px) 100vw, 2560px"
  src="hero-bg.jpg"
  alt=""
>
```

---

## 5. 性能优化考量

### 5.1 格式优先级

1. **WebP** - 优先使用，体积更小
2. **JPEG** - 回退方案，兼容性好

### 5.2 体积限制

| 图片类型 | 最大体积 | 压缩建议 |
|----------|----------|----------|
| hero-bg | 300KB | WebP 质量 80-85% |
| product-* | 150KB | WebP 质量 75-80% |
| team-* | 50KB | WebP 质量 70-75% |

### 5.3 懒加载阈值

```javascript
// IntersectionObserver 配置
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 距离视口 50px 时开始加载
      loadImage(entry.target);
    }
  });
}, {
  rootMargin: '50px'
});
```

---

## 6. 响应式设计配合

### 6.1 CSS 样式确保不变形

```css
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;      /* 保持比例填充 */
  object-position: center; /* 居中裁剪 */
}
```

### 6.2 响应式断点

| 断点 | 宽度范围 | 背景图适配 |
|------|----------|------------|
| Mobile | < 768px | 高度自适应，内容区压缩 |
| Tablet | 768px - 1024px | 标准 16:9 显示 |
| Desktop | > 1024px | 全尺寸 2560×1440 |

---

## 7. 检查清单

### 7.1 文件命名检查

- [ ] 文件名全部小写
- [ ] 使用连字符 `-` 分隔单词
- [ ] 倍图使用 `@2x`、`@3x` 后缀
- [ ] 扩展名为 `.webp` 或 `.jpg`

### 7.2 文件存在性检查

```bash
# 检查 hero-bg 相关文件
ls img/hero/hero-bg*
# 应输出:
# hero-bg.webp
# hero-bg@2x.webp
# hero-bg@3x.webp
# hero-bg.jpg
# hero-bg@2x.jpg
# hero-bg@3x.jpg
```

### 7.3 加载验证检查

- [ ] 浏览器 Network 面板显示正确的图片被加载
- [ ] Chrome DevTools 显示 WebP 格式被使用（现代浏览器）
- [ ] 切换不同 DPR 的设备，图片正确切换
- [ ] 懒加载图片在滚动时正确加载

### 7.4 性能检查

- [ ] Lighthouse 性能评分 ≥ 95
- [ ] LCP ≤ 2.5s
- [ ] 图片实际体积 ≤ 限制值

---

## 8. 命名规范

### 8.1 通用规则

```
{图片名称}-{修饰符}.{扩展名}

图片名称: 描述性英文名称（全部小写）
修饰符: @2x, @3x（可选）
扩展名: webp, jpg, png
```

### 8.2 示例

```
hero-bg.webp           # 基础版本
hero-bg@2x.webp       # 2倍分辨率
hero-bg@3x.webp       # 3倍分辨率

product-1.webp        # 产品1封面
product-1-hover.webp  # 产品1悬停状态（可选）
```

---

## 9. 维护指南

### 9.1 添加新图片

1. 创建对应分辨率的多个版本
2. 确保命名符合规范
3. 在 HTML 中更新 srcset
4. 运行性能测试

### 9.2 替换现有图片

1. 保持文件名不变
2. 确保新图片体积不超标
3. 验证加载正常
4. 检查 LCP 指标

### 9.3 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 图片不显示 | 文件路径错误 | 检查文件是否存在 |
| 加载错误 | MIME 类型不支持 | 确认 Web 服务器配置 |
| 体积过大 | 压缩不足 | 使用 TinyPNG 等工具压缩 |

---

## 10. 相关文件位置

| 文件 | 路径 |
|------|------|
| 背景图 HTML | `index.html:64-66` |
| SPA模板 | `script/main.js:239-241` |
| CSS样式 | `css/styles.css:352-357` |
| 部署配置 | `DEPLOY.md:128-135` |
