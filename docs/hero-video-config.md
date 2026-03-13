# Hero 视频背景配置说明

## 概述

Hero 视频背景模块提供了一个可配置的视频背景解决方案，支持自动播放、循环播放、错误降级和响应式布局。该模块完全替代了原有的静态图片背景方案。

---

## 视频文件放置路径规范

### 推荐目录结构

```
OFFICIALWEB/
├── video/
│   ├── hero.mp4          # 主视频文件 (MP4 格式)
│   ├── hero.webm         # 主视频文件 (WebM 格式，可选但推荐)
│   └── hero-poster.jpg   # 视频封面图 (可选)
├── img/
│   └── hero/
│       └── hero-bg.jpg   # 降级背景图片
└── ...
```

### 视频文件要求

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| 分辨率 | 1920×1080 (1080p) | 支持 4K 但会增加加载时间 |
| 时长 | ≤ 20 秒 | 短视频加载更快，循环播放效果更好 |
| 码率 | ≤ 8 Mbps | 平衡质量与文件大小 |
| 格式 | MP4 (H.264) + WebM (VP9) | WebM 作为首选，MP4 作为兼容备选 |
| 文件大小 | ≤ 10 MB | 建议压缩到 5 MB 以内 |

### 视频编码建议

- **MP4**: H.264 编码，AAC 音频（虽然静音但仍需编码）
- **WebM**: VP9 编码，Opus 音频
- **关键帧间隔**: 建议 2 秒一个关键帧，便于循环播放

---

## 可配置参数列表

### HTML data 属性配置

通过 `data-video-config` 属性在 HTML 中配置：

```html
<video 
  id="hero-video"
  data-video-config='{
    "src": "video/hero.mp4",
    "webmSrc": "video/hero.webm",
    "poster": "img/hero/hero-bg.jpg",
    "muted": true,
    "loop": true,
    "preload": "auto",
    "objectFit": "cover",
    "zIndex": 0,
    "overlayOpacity": 0.5
  }'
>
```

### 参数详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableVideo` | boolean | `true` | 是否启用视频播放。为 `false` 时只显示海报图片，彻底跳过视频文件 I/O，适用于需要禁用视频的场景 |
| `src` | string | `video/hero.mp4` | MP4 视频源路径 |
| `webmSrc` | string | `video/hero.webm` | WebM 视频源路径 |
| `poster` | string | `img/hero/hero-bg.jpg` | 视频封面图片路径 |
| `muted` | boolean | `true` | 是否静音（必须为 true 才能自动播放） |
| `loop` | boolean | `true` | 是否循环播放 |
| `preload` | string | `auto` | 预加载策略: `none` / `metadata` / `auto` |
| `objectFit` | string | `cover` | 视频填充方式: `cover` / `contain` / `fill` |
| `zIndex` | number | `0` | 视频层级 |
| `overlayOpacity` | number | `0.5` | 遮罩透明度 (0-1) |
| `fallbackBgColor` | string | `#1A1A1A` | 降级背景色 |
| `fallbackBgImage` | string | `img/hero/hero-bg.jpg` | 降级背景图片 |
| `loadTimeout` | number | `10000` | 加载超时时间 (毫秒) |
| `retryAttempts` | number | `2` | 加载失败重试次数 |

---

## 示例代码片段

### HTML5 `<video>` 标签完整示例

```html
<section class="hero" id="hero">
  <div class="hero-bg" id="hero-bg">
    <div class="hero-video-container" id="hero-video-container">
      <video 
        id="hero-video"
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        poster="img/hero/hero-bg.jpg"
        data-video-config='{
          "src": "video/hero.mp4",
          "webmSrc": "video/hero.webm",
          "poster": "img/hero/hero-bg.jpg",
          "muted": true,
          "loop": true,
          "preload": "auto",
          "objectFit": "cover",
          "zIndex": 0,
          "overlayOpacity": 0.5
        }'
      >
        <source src="video/hero.webm" type="video/webm">
        <source src="video/hero.mp4" type="video/mp4">
      </video>
      <div class="hero-video-fallback" id="hero-video-fallback"></div>
    </div>
    <div class="hero-overlay"></div>
  </div>
  
  <div class="hero-content">
    <!-- 页面内容 -->
  </div>
</section>
```

### CSS 全屏覆盖写法

```css
.hero-video-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1A1A1A;
}

.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  object-position: center;
  z-index: 0;
}

.hero-video-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #1A1A1A;
  background-image: url('../img/hero/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
}

.hero-video-fallback.active {
  opacity: 1;
}
```

### JavaScript 初始化与事件监听

```javascript
import HeroVideoBackground from './hero-video.js';

window.heroVideoBackground = new HeroVideoBackground();
window.heroVideoBackground.init();

window.updateHeroVideoConfig = (config) => {
  window.heroVideoBackground.updateConfig(config);
};

window.playHeroVideo = () => {
  return window.heroVideoBackground.play();
};

window.pauseHeroVideo = () => {
  window.heroVideoBackground.pause();
};
```

### 动态更新配置

```javascript
window.updateHeroVideoConfig({
  src: 'video/new-hero.mp4',
  webmSrc: 'video/new-hero.webm',
  poster: 'img/hero/new-poster.jpg',
  overlayOpacity: 0.7
});
```

### 禁用视频功能（只显示海报）

当需要禁用视频播放时，可以设置 `enableVideo` 为 `false`：

```html
<video 
  id="hero-video"
  data-video-config='{
    "enableVideo": false,
    "poster": "img/hero/hero-bg.jpg"
  }'
>
</video>
```

效果：
- 视频元素将被隐藏 (`display: none`)
- 不会发起任何视频文件请求
- 直接显示海报图片作为背景
- 彻底跳过 `video` 目录下的所有视频文件扫描

性能影响：
- **节省网络带宽**：不加载任何视频文件
- **加快首屏渲染**：跳过视频加载和初始化流程
- **降低内存占用**：无需维护视频播放状态

### 手动控制播放

```javascript
window.playHeroVideo()
  .then(() => console.log('视频开始播放'))
  .catch(err => console.error('播放失败:', err));

window.pauseHeroVideo();
```

---

## 性能优化建议

### 1. 视频压缩

使用 FFmpeg 压缩视频：

```bash
# MP4 压缩 (H.264)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart output.mp4

# WebM 压缩 (VP9)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 128k output.webm
```

参数说明：
- `-crf`: 质量参数，数值越大压缩率越高（MP4: 18-28，WebM: 30-40）
- `-preset`: 编码速度，`slow` 压缩率更高
- `-movflags +faststart`: 将元数据移到文件开头，便于流式播放

### 2. CDN 加速

将视频文件部署到 CDN：

```html
<source src="https://cdn.example.com/video/hero.webm" type="video/webm">
<source src="https://cdn.example.com/video/hero.mp4" type="video/mp4">
```

### 3. 懒加载策略

对于非首屏视频，可以使用 IntersectionObserver：

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      video.load();
      observer.unobserve(video);
    }
  });
});

document.querySelectorAll('.lazy-video').forEach(video => {
  observer.observe(video);
});
```

### 4. prefers-reduced-motion 媒体查询

尊重用户的无障碍偏好设置：

```css
@media (prefers-reduced-motion: reduce) {
  .hero-video {
    display: none;
  }
  
  .hero-video-fallback {
    opacity: 1;
  }
}
```

JavaScript 检测：

```javascript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (reducedMotion.matches) {
  // 使用静态背景
  this.showFallback();
}

reducedMotion.addEventListener('change', (e) => {
  if (e.matches) {
    this.video.pause();
    this.showFallback();
  } else {
    this.hideFallback();
    this.video.play();
  }
});
```

### 5. 页面可见性优化

当页面不可见时暂停视频：

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play();
  }
});
```

### 6. 响应式视频源

根据屏幕尺寸加载不同分辨率的视频：

```html
<video id="hero-video">
  <source media="(min-width: 1920px)" src="video/hero-4k.webm" type="video/webm">
  <source media="(min-width: 1920px)" src="video/hero-4k.mp4" type="video/mp4">
  <source media="(min-width: 1280px)" src="video/hero-1080p.webm" type="video/webm">
  <source media="(min-width: 1280px)" src="video/hero-1080p.mp4" type="video/mp4">
  <source src="video/hero-720p.webm" type="video/webm">
  <source src="video/hero-720p.mp4" type="video/mp4">
</video>
```

---

## 错误处理与降级策略

### 错误类型

| 错误代码 | 类型 | 处理方式 |
|----------|------|----------|
| `MEDIA_ERR_ABORTED` | 加载中止 | 重试加载 |
| `MEDIA_ERR_NETWORK` | 网络错误 | 重试后降级 |
| `MEDIA_ERR_DECODE` | 解码失败 | 直接降级 |
| `MEDIA_ERR_SRC_NOT_SUPPORTED` | 格式不支持 | 直接降级 |

### 降级流程

1. 视频加载超时（默认 10 秒）
2. 重试加载（默认 2 次）
3. 显示静态背景图片
4. 控制台输出警告信息

### 控制台警告示例

```
[HeroVideo] 视频加载超时，切换到降级方案
[HeroVideo] 视频加载失败: 网络错误导致视频加载失败
```

---

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 60+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| Safari | 11+ | ✅ 完全支持（需 `playsinline` 属性） |
| Firefox | 55+ | ✅ 完全支持 |
| IE 11 | - | ⚠️ 降级到静态背景 |
| iOS Safari | 10+ | ✅ 完全支持（需 `playsinline` 属性） |
| Android Chrome | 60+ | ✅ 完全支持 |

---

## 常见问题

### Q: 视频无法自动播放？

A: 现代浏览器要求视频必须静音才能自动播放。确保：
- 设置 `muted` 属性
- 添加 `playsinline` 属性（iOS 必须）
- 视频格式正确

### Q: 视频加载时间过长？

A: 建议：
- 压缩视频文件大小
- 使用 CDN 加速
- 设置合适的 `preload` 值
- 提供轻量级的 `poster` 图片

### Q: 移动端视频显示异常？

A: 确保：
- 添加 `playsinline` 属性
- 使用 `object-fit: cover` 样式
- 检查 `transform: translate(-50%, -50%)` 定位

---

## 更新日志

- **v1.1.0** - 新增 `enableVideo` 控制开关，支持禁用视频播放功能
- **v1.0.0** - 初始版本，支持视频背景、错误降级、响应式布局
