---
name: "tailwindcss-advanced-layouts"
description: "Tailwind CSS高级布局技术指南。涵盖CSS Grid精通、Holy Grail布局、Subgrid、容器查询等进阶布局模式。当用户需要构建复杂布局、数据仪表板或需要容器查询功能时使用。"
---

# Tailwind CSS 高级布局技术

专注于复杂布局实现的进阶技术指南。

## CSS Grid精通

### Holy Grail布局

```html
<!-- 经典Holy Grail布局 -->
<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
  <header class="bg-white shadow">Header</header>
  <div class="grid grid-cols-[250px_1fr_300px]">
    <aside class="bg-gray-50 p-4">Sidebar</aside>
    <main class="p-6">Main Content</main>
    <aside class="bg-gray-50 p-4">Right Sidebar</aside>
  </div>
  <footer class="bg-gray-800 text-white">Footer</footer>
</div>
```

### 响应式Holy Grail

```html
<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
  <header>Header</header>
  <div class="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_300px]">
    <aside class="order-2 md:order-1">Sidebar</aside>
    <main class="order-1 md:order-2">Main</main>
    <aside class="order-3 hidden lg:block">Right</aside>
  </div>
  <footer>Footer</footer>
</div>
```

### 网格模板区域

```css
@utility grid-areas-dashboard {
  grid-template-areas:
    "header header header"
    "nav main aside"
    "nav footer footer";
}

@utility area-header { grid-area: header; }
@utility area-nav { grid-area: nav; }
@utility area-main { grid-area: main; }
@utility area-aside { grid-area: aside; }
@utility area-footer { grid-area: footer; }
```

```html
<div class="grid grid-areas-dashboard grid-cols-[200px_1fr_250px] grid-rows-[60px_1fr_40px] min-h-screen">
  <header class="area-header bg-white shadow">Header</header>
  <nav class="area-nav bg-gray-100">Navigation</nav>
  <main class="area-main p-6">Main Content</main>
  <aside class="area-aside bg-gray-50 p-4">Sidebar</aside>
  <footer class="area-footer bg-gray-800 text-white">Footer</footer>
</div>
```

### Auto-Fill和Auto-Fit网格

```html
<!-- Auto-fill: 创建尽可能多的轨道，即使空的 -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
  <div class="bg-white rounded-lg shadow p-4">Card 1</div>
  <div class="bg-white rounded-lg shadow p-4">Card 2</div>
  <div class="bg-white rounded-lg shadow p-4">Card 3</div>
</div>

<!-- Auto-fit: 折叠空轨道 -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
  <!-- 卡片拉伸填充可用空间 -->
</div>

<!-- 使用任意值处理边缘情况 -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
  <!-- 处理容器小于minmax最小值的情况 -->
</div>
```

### Subgrid

```css
/* 在v4中启用subgrid */
@utility subgrid-cols {
  grid-template-columns: subgrid;
}

@utility subgrid-rows {
  grid-template-rows: subgrid;
}
```

```html
<div class="grid grid-cols-4 gap-4">
  <!-- 跨越2列但对齐子元素到父网格 -->
  <div class="col-span-2 grid subgrid-cols gap-4">
    <div>对齐到父列1</div>
    <div>对齐到父列2</div>
  </div>
</div>
```

## 高级Flexbox模式

### 空间分配

```html
<!-- 两端对齐，首尾元素在边缘 -->
<div class="flex justify-between">
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</div>

<!-- 均匀分配，包括边缘 -->
<div class="flex justify-around">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<!-- 元素间双倍间距 -->
<div class="flex justify-evenly">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

### 弹性项目大小

```html
<!-- 项目平均分配空间 -->
<div class="flex">
  <div class="flex-1">1/3</div>
  <div class="flex-1">1/3</div>
  <div class="flex-1">1/3</div>
</div>

<!-- 第一个项目占2倍空间 -->
<div class="flex">
  <div class="flex-[2]">2/4</div>
  <div class="flex-1">1/4</div>
  <div class="flex-1">1/4</div>
</div>

<!-- 固定+弹性 -->
<div class="flex">
  <div class="w-64 shrink-0">固定 256px</div>
  <div class="flex-1 min-w-0">弹性(可收缩)</div>
</div>

<!-- 防止收缩带文本溢出 -->
<div class="flex min-w-0">
  <div class="shrink-0">Icon</div>
  <div class="min-w-0 truncate">应截断的非常长的文本</div>
</div>
```

### Flexbox实现Masonry布局

```html
<!-- 基于列的masonry -->
<div class="flex flex-col flex-wrap h-[800px] gap-4">
  <div class="w-[calc(33.333%-1rem)] h-48">Item 1</div>
  <div class="w-[calc(33.333%-1rem)] h-64">Item 2</div>
  <div class="w-[calc(33.333%-1rem)] h-32">Item 3</div>
  <!-- 项目垂直流动然后换行到下一列 -->
</div>
```

## 容器查询

### 基础容器查询

```html
@plugin "@tailwindcss/container-queries";

<!-- 定义容器 -->
<div class="@container">
  <!-- 响应容器宽度 -->
  <div class="flex flex-col @md:flex-row @lg:grid @lg:grid-cols-3 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
</div>
```

### 命名容器

```html
<!-- 多个命名容器 -->
<div class="@container/sidebar">
  <nav class="@[200px]/sidebar:flex-col @[300px]/sidebar:flex-row">
    Navigation
  </nav>
</div>

<div class="@container/main">
  <article class="@[600px]/main:prose-lg @[900px]/main:prose-xl">
    Content
  </article>
</div>
```

### 容器查询单位

```html
<!-- 相对于容器的尺寸 -->
<div class="@container">
  <h1 class="text-[5cqw]">随容器宽度缩放</h1>
  <p class="text-[3cqi]">随容器内联轴缩放</p>
</div>
```

## 使用场景

### 何时使用这些技术

- **复杂多栏布局**：使用Grid和Flexbox组合
- **数据仪表板**：使用grid-template-areas
- **响应式卡片网格**：使用auto-fill/auto-fit
- **对齐要求严格的布局**：使用Subgrid
- **组件级响应式**：使用容器查询而非视口查询
- **Masonry画廊**：使用flexbox换行

### 性能考虑

- Grid通常比flexbox更适合二维布局
- Subgrid可减少嵌套网格的数量
- 容器查询减少媒体查询数量
- 避免过度嵌套的flex容器

### 浏览器支持

- CSS Grid Level 1: 主流浏览器支持
- Subgrid: 现代浏览器支持(2023+)
- 容器查询: 现代浏览器支持(2023+)
- 容器查询单位: 渐进增强使用

## 故障排除

### 布局不按预期工作

- 检查grid/flex容器是否正确定义
- 验证子元素是否正确放置
- 使用浏览器DevTools检查网格轨道

### 响应式行为异常

- 确认断点值符合预期
- 检查顺序类(order-*)是否正确
- 验证hidden类在正确断点生效

### Subgrid不工作

- 确保父网格定义了网格轨道
- 检查浏览器是否支持Subgrid
- 考虑降级方案

## 参考资源

- [MDN CSS Grid指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout)
- [CSS容器查询文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_container_queries)
- [Subgrid指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout/Subgrid_Sample)
