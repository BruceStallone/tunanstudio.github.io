class HeroVideoBackground {
  constructor() {
    this.video = null;
    this.container = null;
    this.fallback = null;
    this.config = null;
    this.isInitialized = false;
    this.hasError = false;
    this.isLoading = true;
    this.reducedMotion = false;
    
    this.defaultConfig = {
      src: 'video/hero.mp4',
      webmSrc: 'video/hero.webm',
      poster: 'img/hero/hero-bg.jpg',
      muted: true,
      loop: true,
      preload: 'auto',
      objectFit: 'cover',
      zIndex: 0,
      overlayOpacity: 0.5,
      fallbackBgColor: '#1A1A1A',
      fallbackBgImage: 'img/hero/hero-bg.jpg',
      loadTimeout: 10000,
      retryAttempts: 2
    };
    
    this.retryCount = 0;
    this.loadTimeoutId = null;
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.video = document.getElementById('hero-video');
    this.container = document.getElementById('hero-video-container');
    this.fallback = document.getElementById('hero-video-fallback');
    
    if (!this.video || !this.container) {
      console.warn('[HeroVideo] 未找到视频容器元素');
      return;
    }
    
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.reducedMotion) {
      console.log('[HeroVideo] 检测到 prefers-reduced-motion，使用静态背景');
      this.showFallback();
      return;
    }
    
    this.parseConfig();
    this.applyConfig();
    this.bindEvents();
    this.startLoading();
    
    this.isInitialized = true;
    console.log('[HeroVideo] 视频背景初始化完成');
  }
  
  parseConfig() {
    try {
      const configAttr = this.video.dataset.videoConfig;
      if (configAttr) {
        this.config = { ...this.defaultConfig, ...JSON.parse(configAttr) };
      } else {
        this.config = { ...this.defaultConfig };
      }
    } catch (error) {
      console.warn('[HeroVideo] 配置解析失败，使用默认配置:', error);
      this.config = { ...this.defaultConfig };
    }
  }
  
  applyConfig() {
    const { muted, loop, preload, poster, objectFit, zIndex } = this.config;
    
    this.video.muted = muted;
    this.video.loop = loop;
    this.video.preload = preload;
    this.video.poster = poster;
    this.video.style.objectFit = objectFit;
    this.video.style.zIndex = zIndex;
    
    if (this.fallback && this.config.fallbackBgImage) {
      this.fallback.style.backgroundImage = `url('${this.config.fallbackBgImage}')`;
    }
    if (this.fallback && this.config.fallbackBgColor) {
      this.fallback.style.backgroundColor = this.config.fallbackBgColor;
    }
    
    const overlay = document.querySelector('.hero-overlay');
    if (overlay && this.config.overlayOpacity !== undefined) {
      overlay.style.setProperty('--overlay-opacity', this.config.overlayOpacity);
    }
  }
  
  bindEvents() {
    this.video.addEventListener('loadeddata', this.handleLoadedData.bind(this));
    this.video.addEventListener('canplay', this.handleCanPlay.bind(this));
    this.video.addEventListener('playing', this.handlePlaying.bind(this));
    this.video.addEventListener('error', this.handleError.bind(this));
    this.video.addEventListener('stalled', this.handleStalled.bind(this));
    this.video.addEventListener('suspend', this.handleSuspend.bind(this));
    
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.handleReducedMotion();
      } else {
        this.handleNormalMotion();
      }
    });
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  startLoading() {
    this.container.classList.add('video-loading');
    
    this.loadTimeoutId = setTimeout(() => {
      if (this.isLoading) {
        console.warn('[HeroVideo] 视频加载超时，切换到降级方案');
        this.handleLoadTimeout();
      }
    }, this.config.loadTimeout);
  }
  
  handleLoadedData() {
    console.log('[HeroVideo] 视频数据已加载');
  }
  
  handleCanPlay() {
    console.log('[HeroVideo] 视频可以播放');
    this.clearLoadTimeout();
    this.container.classList.remove('video-loading');
    this.isLoading = false;
  }
  
  handlePlaying() {
    console.log('[HeroVideo] 视频正在播放');
    this.clearLoadTimeout();
    this.container.classList.remove('video-loading');
    this.isLoading = false;
    this.hasError = false;
  }
  
  handleError(e) {
    const error = this.video.error;
    let errorMessage = '未知错误';
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = '视频加载被中止';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = '网络错误导致视频加载失败';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = '视频解码失败';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = '视频格式不支持';
          break;
        default:
          errorMessage = `错误代码: ${error.code}`;
      }
    }
    
    console.error(`[HeroVideo] 视频加载失败: ${errorMessage}`, e);
    
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++;
      console.log(`[HeroVideo] 尝试重新加载 (${this.retryCount}/${this.config.retryAttempts})`);
      setTimeout(() => {
        this.video.load();
      }, 1000);
      return;
    }
    
    this.showFallback();
    this.hasError = true;
  }
  
  handleStalled() {
    console.warn('[HeroVideo] 视频加载停滞');
  }
  
  handleSuspend() {
    console.log('[HeroVideo] 视频加载被挂起');
  }
  
  handleLoadTimeout() {
    this.showFallback();
    this.container.classList.add('video-error');
    this.container.classList.remove('video-loading');
    this.isLoading = false;
    this.hasError = true;
  }
  
  handleReducedMotion() {
    console.log('[HeroVideo] 用户偏好减少动画，暂停视频');
    this.video.pause();
    this.showFallback();
  }
  
  handleNormalMotion() {
    console.log('[HeroVideo] 用户偏好正常动画，恢复视频');
    this.hideFallback();
    this.video.play().catch(err => {
      console.warn('[HeroVideo] 恢复播放失败:', err);
    });
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.video.pause();
    } else if (!this.reducedMotion && !this.hasError) {
      this.video.play().catch(err => {
        console.warn('[HeroVideo] 恢复播放失败:', err);
      });
    }
  }
  
  handleResize() {
    this.adjustVideoPosition();
  }
  
  adjustVideoPosition() {
    if (!this.video || !this.container) return;
    
    const containerRatio = this.container.offsetWidth / this.container.offsetHeight;
    const videoRatio = this.video.videoWidth / this.video.videoHeight;
    
    if (containerRatio > videoRatio) {
      this.video.style.width = '100%';
      this.video.style.height = 'auto';
    } else {
      this.video.style.width = 'auto';
      this.video.style.height = '100%';
    }
  }
  
  showFallback() {
    if (this.fallback) {
      this.fallback.classList.add('active');
    }
    this.container.classList.add('video-error');
    this.container.classList.remove('video-loading');
  }
  
  hideFallback() {
    if (this.fallback) {
      this.fallback.classList.remove('active');
    }
    this.container.classList.remove('video-error');
  }
  
  clearLoadTimeout() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.applyConfig();
    
    if (newConfig.src || newConfig.webmSrc) {
      this.retryCount = 0;
      this.hasError = false;
      this.isLoading = true;
      this.hideFallback();
      this.container.classList.remove('video-error');
      this.startLoading();
      this.video.load();
    }
    
    console.log('[HeroVideo] 配置已更新:', this.config);
  }
  
  play() {
    if (this.video && !this.hasError && !this.reducedMotion) {
      return this.video.play();
    }
    return Promise.reject(new Error('无法播放视频'));
  }
  
  pause() {
    if (this.video) {
      this.video.pause();
    }
  }
  
  destroy() {
    this.clearLoadTimeout();
    
    if (this.video) {
      this.video.removeEventListener('loadeddata', this.handleLoadedData);
      this.video.removeEventListener('canplay', this.handleCanPlay);
      this.video.removeEventListener('playing', this.handlePlaying);
      this.video.removeEventListener('error', this.handleError);
      this.video.removeEventListener('stalled', this.handleStalled);
      this.video.removeEventListener('suspend', this.handleSuspend);
      this.video.pause();
      this.video.src = '';
    }
    
    this.isInitialized = false;
    console.log('[HeroVideo] 视频背景已销毁');
  }
}

window.heroVideoBackground = new HeroVideoBackground();

window.updateHeroVideoConfig = (config) => {
  window.heroVideoBackground.updateConfig(config);
};

window.playHeroVideo = () => {
  return window.heroVideoBackground.play();
};

window.pauseHeroVideo = () => {
  window.heroVideoBackground.pause();
};

export default HeroVideoBackground;
