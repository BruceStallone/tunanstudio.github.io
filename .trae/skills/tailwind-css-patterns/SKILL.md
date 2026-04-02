---
name: "tailwind-css-patterns"
description: "Tailwind CSS v4.1+开发模式指南。提供响应式设计、组件模式、暗色模式等最佳实践。当用户需要样式化组件、构建响应式布局或实现设计系统时使用。"
---

# Tailwind CSS 开发模式

提供可操作的响应式、accessible用户界面模式，基于Tailwind CSS v4.1+。

## 何时使用

- 样式化React/Vue/Svelte组件
- 构建响应式布局和网格
- 实现设计系统
- 添加暗色模式支持
- 优化CSS工作流

## 快速参考

### 响应式断点

| 前缀 | 最小宽度 | 描述 |
|------|----------|------|
| sm: | 640px | 小屏幕 |
| md: | 768px | 平板 |
| lg: | 1024px | 桌面 |
| xl: | 1280px | 大屏幕 |
| 2xl: | 1536px | 超大屏幕 |

## 常用模式

### 居中内容

```html
<div class="flex items-center justify-center min-h-screen">
  内容
</div>
```

### 响应式网格

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 项目 -->
</div>
```

### 卡片组件

```html
<div class="bg-white rounded-lg shadow-lg p-6">
  <h3 class="text-xl font-bold">标题</h3>
  <p class="text-gray-600">描述</p>
</div>
```

### 响应式卡片组件

```jsx
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden sm:flex">
      <img 
        className="h-48 w-full object-cover sm:h-auto sm:w-48" 
        src={product.image} 
      />
      <div className="p-6">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          加入购物车
        </button>
      </div>
    </div>
  );
}
```

### 暗色模式切换

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 class="dark:text-white">标题</h1>
</div>
```

### 表单输入

```html
<input
  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="you@example.com"
/>
```

## 使用说明

1. **移动优先**：为基础样式编写移动端样式，使用响应式前缀(sm:, md:, lg:)适配更大屏幕
2. **使用设计令牌**：利用Tailwind的spacing、color和typography系统
3. **组合工具类**：组合多个工具类实现复杂样式
4. **提取组件**：将重复模式提取为可复用组件类
5. **配置主题**：在tailwind.config.js或使用@theme自定义设计令牌
6. **验证更改**：使用DevTools响应式模式在每个断点测试

## 最佳实践

- **一致的Spacing**：使用Tailwind的spacing系统(4, 8, 12, 16等)
- **颜色系统**：坚持Tailwind的颜色系统以保持一致性
- **组件提取**：将重复模式提取为可复用组件
- **工具类组合**：优先使用工具类而非@apply以保持可维护性
- **语义HTML**：使用带有Tailwind类的适当HTML元素
- **性能**：确保内容路径包含所有模板文件以优化清除
- **无障碍**：包含focus样式、ARIA标签，并尊重用户偏好(reduced-motion)

## 故障排除

### 类不生效

- 检查内容路径：确保所有模板文件包含在content: []配置中
- 验证构建：运行npm run build重新生成清除后的CSS
- 开发模式：使用npx tailwindcss -o和--watch标志进行实时更新

### 响应式样式不工作

- 顺序很重要：响应式前缀必须在非响应式之前(如md:flex而非flex md:flex)
- 检查断点值：验证断点是否匹配你的设计要求
- DevTools：使用浏览器DevTools响应式模式在每个断点测试

### 暗色模式问题

- 验证配置：确保darkMode: 'class'或'media'设置正确
- 切换实现：使用class策略时使用document.documentElement.classList.toggle('dark')
- 初始闪烁：在<body>渲染前给<html>添加dark类

## 约束和警告

- **类膨胀**：长类字符串降低可读性；提取为组件
- **内容路径**：配置错误的路径会导致生产环境中的类被清除
- **任意值**：谨慎使用；优先使用设计令牌以保持一致性
- **特异性问题**：避免与复杂选择器一起使用@apply
- **暗色模式**：需要正确配置(class或media策略)
- **浏览器支持**：查看Tailwind文档了解兼容性说明

## 参考资源

- [Tailwind CSS官方文档](https://tailwindcss.com)
- [Tailwind UI](https://tailwindui.com)
- [Tailwind Play](https://play.tailwindcss.com)
