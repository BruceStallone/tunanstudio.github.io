---
name: "unocss"
description: "UnoCSS即时原子CSS引擎指南。提供规则、快捷方式、主题和变体的配置指南，是Tailwind的超集。当用户需要轻量级原子CSS、定制化CSS工具或集成UnoCSS到Vite/Nuxt项目时使用。"
---

# UnoCSS - 即时原子CSS引擎

UnoCSS是一个即时原子CSS引擎，设计上灵活且可扩展。核心是无主见的 - 所有CSS工具都通过预设(presets)提供。它是Tailwind CSS的超集，因此可以复用Tailwind知识用于基本语法。

**重要**：在编写UnoCSS代码前，应检查项目中是否有`uno.config.*`或`unocss.config.*`文件，了解可用的预设、规则和快捷方式。如果项目设置不明确，应避免使用attributify模式和其他高级功能 - 坚持使用基本类用法。

本技能基于UnoCSS 66.x版本。

## 核心概念

### 主要话题

| 话题 | 描述 | 参考 |
|------|------|------|
| Configuration | 配置文件设置和所有配置选项 | core-config |
| Rules | 生成CSS工具的静态和动态规则 | core-rules |
| Shortcuts | 将多个规则组合为单个简写 | core-shortcuts |
| Theme | 主题系统用于颜色、断点和设计令牌 | core-theme |
| Variants | 应用hover:、dark:、响应式等变体 | core-variants |
| Extracting | 如何从源代码提取工具 | core-extracting |
| Safelist & Blocklist | 强制包含或排除特定工具 | core-safelist |
| Layers & Preflights | CSS层排序和原始CSS注入 | core-layers |

## 主要预设

### 核心预设

| 话题 | 描述 | 参考 |
|------|------|------|
| Preset Wind3 | Tailwind CSS v3 / Windi CSS兼容预设(最常用) | preset-wind3 |
| Preset Wind4 | Tailwind CSS v4兼容预设，带现代CSS特性 | preset-wind4 |
| Preset Mini | 最小化预设，包含自定义构建的基本工具 | preset-mini |

### 功能预设

| 话题 | 描述 | 参考 |
|------|------|------|
| Preset Icons | 使用Iconify的纯CSS图标，支持任何图标集 | preset-icons |
| Preset Attributify | 将工具分组在HTML属性中而非class | preset-attributify |
| Preset Typography | 文章排版默认样式 | preset-typography |
| Preset Web Fonts | 轻松集成Google Fonts等网页字体 | preset-web-fonts |
| Preset Tagify | 使用工具作为HTML标签名 | preset-tagify |
| Preset Rem to Px | 将rem单位转换为px用于工具 | preset-rem-to-px |

## 转换器(Transformers)

### 可用转换器

| 话题 | 描述 | 参考 |
|------|------|------|
| Variant Group | 使用共同前缀分组工具的简写 | transformer-variant-group |
| Directives | CSS指令: @apply, @screen, theme(), icon() | transformer-directives |
| Compile Class | 将多个类编译为一个哈希类 | transformer-compile-class |
| Attributify JSX | 在JSX/TSX中支持无值attributify | transformer-attributify-jsx |

## 集成

### 框架集成

| 话题 | 描述 | 参考 |
|------|------|------|
| Vite Integration | 设置UnoCSS与Vite和框架特定技巧 | integrations-vite |
| Nuxt Integration | Nuxt应用程序的UnoCSS模块 | integrations-nuxt |

## 基础使用

### 基本配置

```typescript
// uno.config.ts
import { defineConfig, presetWind, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
})
```

### 基本工具类

```html
<!-- 类似Tailwind的工具类 -->
<div class="flex items-center justify-center min-h-screen">
  <h1 class="text-4xl font-bold text-gray-900">Hello UnoCSS</h1>
</div>
```

### 快捷方式

```typescript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
    'btn-red': 'btn bg-red-500 hover:bg-red-600',
  }
})
```

```html
<button class="btn">Click me</button>
<button class="btn-red">Delete</button>
```

### 自定义规则

```typescript
// uno.config.ts
export default defineConfig({
  rules: [
    ['custom-bg', { 'background': 'linear-gradient(45deg, #667eea, #764ba2)' }],
    [/^custom-size-(\d+)$/, ([, d]) => ({ width: `${d}px`, height: `${d}px` })],
  ]
})
```

```html
<div class="custom-bg"></div>
<div class="custom-size-100"></div>
```

## 变体(Variants)

### 常用变体

```html
<!-- 悬停 -->
<button class="hover:bg-blue-500">Hover me</button>

<!-- 激活 -->
<button class="active:bg-blue-700">Click me</button>

<!-- 焦点 -->
<input class="focus:ring-2 focus:ring-blue-500" />

<!-- 暗色模式 -->
<div class="dark:text-white dark:bg-gray-900"></div>

<!-- 响应式 -->
<div class="md:flex lg:grid-cols-3"></div>

<!-- 组悬停 -->
<div class="group hover:bg-gray-100">
  <p class="group-hover:text-blue-500">文字</p>
</div>
```

### 自定义变体

```typescript
// uno.config.ts
export default defineConfig({
  variants: [
    (matcher) => {
      if (!matcher.startsWith('important:'))
        return matcher
      return {
        matcher: matcher.slice(11),
        body: (body) => {
          return Object.fromEntries(
            Object.entries(body).map(([k, v]) => [k, `$${k} !important`])
          )
        },
      }
    },
  ],
})
```

```html
<div class="important:bg-red-500"></div>
```

## 主题配置

### 颜色系统

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
  },
})
```

```html
<div class="bg-primary text-secondary"></div>
```

### 断点

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
})
```

## Attributify模式

### 基本用法

```html
<div 
  m="2" 
  p="4"
  text="center white"
  bg="blue-500"
>
  内容
</div>
```

### 带值的属性

```html
<button 
  text="sm white"
  bg="blue-500 hover:blue-600"
  p="2 4"
>
  按钮
</button>
```

## 图标集成

### 使用Iconify图标

```typescript
// uno.config.ts
import { presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
})
```

```html
<!-- 使用Iconify图标 -->
<div class="i-carbon-sun text-yellow-500"></div>
<div class="i-mdi-account text-blue-500"></div>
<div class="i-logos-vue text-green-500"></div>
```

## Layers和Preflights

### CSS层

```typescript
// uno.config.ts
export default defineConfig({
  layers: {
    components: 1,
    shortcuts: 50,
    utilities: 100,
  },
})
```

```css
/* 使用CSS层 */
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-lg p-6;
  }
}
```

### Preflight

```typescript
// uno.config.ts
export default defineConfig({
  preflights: [
    {
      layer: 'default',
      getCSS: () => `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `,
    },
  ],
})
```

## Safelist和Blocklist

### Safelist

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    'text-red-500',
    'bg-blue-500',
    /^icon-/,
  ],
})
```

### Blocklist

```typescript
// uno.config.ts
export default defineConfig({
  blocklist: [
    'container',
    'justify-center',
  ],
})
```

## Vite集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
})
```

```typescript
// main.ts
import 'virtual:uno.css'
```

## Nuxt集成

```typescript
// nuxt.config.ts
export default defineConfig({
  modules: [
    '@unocss/nuxt',
  ],
  uno: {
    // UnoCSS配置
  },
})
```

## 性能优化

### 关键优化

- **Tree-shaking**: UnoCSS自动只包含使用的工具
- **Safelist**: 谨慎使用以避免膨胀
- **Layers**: 合理组织CSS层顺序
- **CDN**: 对于图标使用CDN加速加载

### 生产构建

```bash
# 构建优化
npx unocss build
```

## 故障排除

### 工具不工作

- 检查uno.config.*文件是否正确配置
- 验证预设是否正确添加
- 清除缓存并重新构建

### 图标不显示

- 确认presetIcons已安装和配置
- 检查图标名称是否正确(使用完整的Iconify名称)
- 验证CDN链接是否可访问

### 性能问题

- 减少safelist大小
- 使用更具体的规则
- 考虑按需加载而非全部导入

## 参考资源

- [UnoCSS官方文档](https://unocss.dev)
- [UnoCSS GitHub](https://github.com/unocss/unocss)
- [Iconify图标库](https://icon-sets.iconify.design/)
