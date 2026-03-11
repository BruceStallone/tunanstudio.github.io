import './i18n.js';
import './router.js';
import './animation.js';
import './floating-images.js';
import './hero-video.js';

class App {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await window.i18n.init();
    this.initRouter();
    this.initNavigation();
    this.initLanguageSwitcher();
    this.initLogoUpload();
    this.initFloatingImages();
    this.initHeroVideo();
    window.heroAnimations.init();
    window.lazyImageLoader.init();
    window.dissolveAnimationManager.init();
    
    this.initialized = true;
  }

  initRouter() {
    window.router
      .addRoute('/', () => this.renderHome())
      .addRoute('/products', () => this.renderProducts())
      .addRoute('/product', () => this.renderProducts())
      .addRoute('/team', () => this.renderTeam())
      .beforeEach((path) => this.beforeRouteChange(path))
      .afterEach((path) => this.afterRouteChange(path))
      .init();
  }

  initNavigation() {
    const navLinks = document.querySelectorAll('[data-nav]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.nav;
        this.navigateTo(target);
      });
    });
  }

  initLanguageSwitcher() {
    console.log('[App] Initializing language switcher...');
    
    const handleLanguageClick = async (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      
      if (window.i18n.isLoading) {
        console.warn('[App] Language is loading, please wait...');
        return;
      }
      
      const lang = btn.dataset.lang;
      if (!lang) return;
      
      if (lang === window.i18n.getCurrentLang()) {
        console.log(`[App] Already on language: ${lang}`);
        return;
      }
      
      this.setLanguageButtonsLoading(true);
      
      try {
        console.log(`[App] Switching to: ${lang}`);
        await window.i18n.switchLanguage(lang);
        this.updateLanguageButtons();
        this.showToast(`语言已切换为 ${lang === 'en' ? 'English' : '中文'}`);
        console.log(`[App] Language switched to ${lang}`);
      } catch (error) {
        console.error(`[App] Failed to switch language:`, error);
        this.showToast('语言切换失败，请重试', 'error');
      } finally {
        this.setLanguageButtonsLoading(false);
      }
    };
    
    document.addEventListener('click', handleLanguageClick, true);
    
    window.i18n.on(window.I18nEventType.LANGUAGE_SWITCHED, () => {
      this.updateLanguageButtons();
      this.refreshCurrentPageContent();
      setTimeout(() => {
        window.dissolveAnimationManager.reinitialize();
      }, 100);
    });
    
    window.i18n.on(window.I18nEventType.INITIALIZED, () => {
      this.updateLanguageButtons();
    });

    this.updateLanguageButtons();
    console.log('[App] Language switcher initialized');
  }

  setLanguageButtonsLoading(loading) {
    const langButtons = document.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
      btn.disabled = loading;
      btn.style.pointerEvents = loading ? 'none' : 'auto';
      if (loading) {
        btn.classList.add('loading');
      } else {
        btn.classList.remove('loading');
      }
    });
  }

  showToast(message, type = 'success') {
    const existing = document.querySelector('.language-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `language-toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '80px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  updateLanguageButtons() {
    const langButtons = document.querySelectorAll('[data-lang]');
    const currentLang = window.i18n.getCurrentLang();
    
    langButtons.forEach(btn => {
      const isActive = btn.dataset.lang === currentLang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  refreshCurrentPageContent() {
    const currentPath = window.router.getCurrentPath();
    
    if (currentPath === '/products' || currentPath === '/product') {
      const productsGrid = document.querySelector('.products-grid');
      if (productsGrid) {
        const container = productsGrid.parentElement;
        const pageHeader = container.querySelector('.page-header');
        if (pageHeader) {
          pageHeader.querySelector('.page-title').textContent = window.i18n.get('products.title');
          pageHeader.querySelector('.page-subtitle').textContent = window.i18n.get('products.subtitle');
        }
        productsGrid.innerHTML = this.generateProductCards();
        window.heroAnimations.init();
        window.lazyImageLoader.init();
      }
    } else if (currentPath === '/team') {
      const teamGrid = document.querySelector('.team-grid');
      if (teamGrid) {
        const container = teamGrid.parentElement;
        const pageTitle = container.querySelector('.page-title');
        if (pageTitle) {
          pageTitle.textContent = window.i18n.get('team.title');
        }
        teamGrid.innerHTML = this.generateTeamCards();
        window.heroAnimations.init();
        window.lazyImageLoader.init();
      }
    } else if (currentPath === '/') {
      const brandCn = document.querySelector('.brand-cn');
      const brandEn = document.querySelector('.brand-en');
      const brandTagline = document.querySelector('.brand-tagline');
      if (brandCn) brandCn.textContent = window.i18n.get('brand.cn');
      if (brandEn) brandEn.textContent = window.i18n.get('brand.en');
      if (brandTagline) brandTagline.textContent = window.i18n.get('brand.tagline');
    }
  }

  generateProductCards() {
    const products = window.i18n.get('products.items');
    const sortedProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return sortedProducts.map(product => {
      const hasHoverImage = product.hasHoverImage !== false;
      const imageContent = hasHoverImage ? `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <source srcset="img/hero/product-${product.id}@3x.jpg 3x, img/hero/product-${product.id}@2x.jpg 2x, img/hero/product-${product.id}.jpg" type="image/jpeg">
          <img class="product-img-default" src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
          <img class="product-img-hover" src="img/hero/product-${product.id}-hover.webp" alt="${product.title}" loading="lazy">
        </picture>
      ` : `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <img src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
        </picture>
      `;
      const imageLink = product.link ? `
        <a href="${product.link}" data-image-link="${product.link}" target="_blank" rel="noopener noreferrer" aria-label="查看${product.title}详情">
          ${imageContent}
        </a>
      ` : imageContent;
      return `
        <article class="product-card" data-animate>
          <div class="product-image" data-product-id="${product.id}" data-has-hover="${hasHoverImage}">
            ${imageLink}
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  generateTeamCards() {
    const team = window.i18n.get('team.members');
    return team.map(member => `
      <article class="team-card" data-animate>
        <div class="member-avatar">
          <picture>
            <source srcset="img/team/member-${member.id}@3x.webp 3x, img/team/member-${member.id}@2x.webp 2x, img/team/member-${member.id}.webp" type="image/webp">
            <img src="img/team/member-${member.id}.jpg" alt="${member.name}" loading="lazy">
          </picture>
        </div>
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      </article>
    `).join('');
  }

  initLogoUpload() {
    const brandLink = document.getElementById('navbar-brand');
    const logoInput = document.getElementById('logo-upload');
    const logoImg = document.getElementById('brand-logo-img');
    const brandMark = document.getElementById('brand-mark-default');
    
    if (!brandLink || !logoInput) return;
    
    const savedLogo = localStorage.getItem('tunan-custom-logo');
    if (savedLogo) {
      this.displayCustomLogo(savedLogo, logoImg, brandMark);
    }
    
    const handleLogoUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (file.size > 8 * 1024 * 1024) {
        alert('文件过大，请上传小于8MB的图片');
        logoInput.value = '';
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('仅支持 JPG、PNG、WebP 格式的图片');
        logoInput.value = '';
        return;
      }
      
      this.compressImage(file, (compressedDataUrl) => {
        localStorage.setItem('tunan-custom-logo', compressedDataUrl);
        this.displayCustomLogo(compressedDataUrl, logoImg, brandMark);
      });
    };
    
    logoInput.addEventListener('change', handleLogoUpload);
    
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      logoInput.click();
    });
    
    brandLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        logoInput.click();
      }
    });
  }

  initFloatingImages() {
    const container = document.getElementById('floating-images-container');
    if (!container) return;

    const enableRotation = this.getFloatingImageRotationConfig();
    
    if (!enableRotation) {
      if (window.floatingImagesInstance) {
        window.floatingImagesInstance.destroy();
        window.floatingImagesInstance = null;
      }
      container.innerHTML = '';
      console.log('[App] floating image 已禁用，不进行初始化');
      return;
    }

    if (window.floatingImagesInstance) {
      window.floatingImagesInstance.destroy();
      window.floatingImagesInstance = null;
    }

    const defaultImages = [
      '/img/floating/image1.png',
      '/img/floating/image2.png',
      '/img/floating/image3.png',
      '/img/floating/image4.png',
      '/img/floating/image5.png',
      '/img/floating/image6.png',
      '/img/floating/image7.png',
      '/img/floating/image8.png',
      '/img/floating/image9.png',
    ];

    const config = {
      images: defaultImages,
      containerSelector: '#floating-images-container',
      rotationSpeed: 45,
      minSpeed: 30,
      maxSpeed: 60,
      safeMargin: 10,
      imageSize: 100,
      textSafeMargin: 30,
      maxOverlapRatio: 0.15,
      debugMode: true,
      storageKey: 'tunan-floating-images',
      enableRotation: enableRotation
    };

    window.floatingImagesInstance = new window.FloatingImages(config);
  }

  initHeroVideo() {
    if (window.heroVideoBackground) {
      window.heroVideoBackground.init();
    }
  }

  getFloatingImageRotationConfig() {
    try {
      const stored = localStorage.getItem('floatingImageRotationEnabled');
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {
      console.warn('[App] 读取floatingImageRotationEnabled配置失败:', e);
    }
    return false;
  }

  setFloatingImageRotationConfig(enabled) {
    try {
      localStorage.setItem('floatingImageRotationEnabled', enabled ? 'true' : 'false');
      console.log(`[App] floatingImageRotationEnabled 已设置为: ${enabled}`);
    } catch (e) {
      console.warn('[App] 设置floatingImageRotationEnabled配置失败:', e);
    }
  }

  toggleFloatingImageRotation() {
    const current = this.getFloatingImageRotationConfig();
    this.setFloatingImageRotationConfig(!current);
    this.initFloatingImages();
    return !current;
  }

  compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxSize = 200;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => callback(reader.result);
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  displayCustomLogo(dataUrl, logoImg, brandMark) {
    if (logoImg && brandMark) {
      logoImg.src = dataUrl;
      logoImg.style.display = 'block';
      brandMark.style.display = 'none';
    }
  }

  navigateTo(target) {
    const routes = {
      'home': '/',
      'products': '/products',
      'product': '/products',
      'team': '/team'
    };
    
    const path = routes[target] || '/';
    window.router.navigate(path);
  }

  beforeRouteChange(path) {
    const content = document.getElementById('main-content');
    if (content) {
      content.classList.add('page-transition-out');
    }
  }

  afterRouteChange(path) {
    const content = document.getElementById('main-content');
    if (content) {
      setTimeout(() => {
        content.classList.remove('page-transition-out');
        content.classList.add('page-transition-in');
        
        setTimeout(() => {
          content.classList.remove('page-transition-in');
        }, 300);
      }, 50);
    }

    this.initFloatingImages();
    this.initHeroVideo();
    window.heroAnimations.init();
    window.lazyImageLoader.init();
    window.dissolveAnimationManager.init();
    this.updateLanguageButtons();
  }

  renderHome() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getHomeTemplate();
      this.attachHomeEvents();
    }
  }

  renderProducts() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getProductsTemplate();
      this.attachProductsEvents();
    }
  }

  renderTeam() {
    const content = document.getElementById('main-content');
    if (content) {
      content.innerHTML = this.getTeamTemplate();
      this.attachTeamEvents();
    }
  }

  getHomeTemplate() {
    return `
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
          <div class="floating-images-container" id="floating-images-container"></div>
        </div>
        <div class="hero-content">
          <h1 class="brand-title">
            <span class="brand-cn" data-i18n="brand.cn">${window.i18n.get('brand.cn')}</span>
            <span class="brand-divider">|</span>
            <span class="brand-en" data-i18n="brand.en">${window.i18n.get('brand.en')}</span>
          </h1>
          <p class="brand-tagline" data-i18n="brand.tagline">${window.i18n.get('brand.tagline')}</p>
          <div class="hero-actions">
          </div>
        </div>
        <div class="hero-scroll-indicator" aria-hidden="true">
          <span class="scroll-line"></span>
        </div>
      </section>
    `;
  }

  /**
   * 产品卡片模板生成器
   * 
   * Hover 图片命名约定：
   * - 基础版本: photo.jpg
   * - 2x 版本: photo@2x.jpg
   * - 3x 版本: photo@3x.jpg
   * - Hover 版本: photo-hover.jpg (基础), photo@2x-hover.jpg (@2x后), photo@3x-hover.jpg (@3x后)
   * 
   * @2x hover 命名规则: 原文件名 + @2x + -hover + 扩展名
   * 例如: product-2.jpg -> product-2@2x-hover.jpg
   */
  getProductsTemplate() {
    const products = window.i18n.get('products.items');
    const sortedProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const productCards = sortedProducts.map(product => {
      const hasHoverImage = product.hasHoverImage !== false;
      const imageContent = hasHoverImage ? `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <source srcset="img/hero/product-${product.id}@3x.jpg 3x, img/hero/product-${product.id}@2x.jpg 2x, img/hero/product-${product.id}.jpg" type="image/jpeg">
          <img class="product-img-default" src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
          <img class="product-img-hover" src="img/hero/product-${product.id}-hover.webp" alt="${product.title}" loading="lazy">
        </picture>
      ` : `
        <picture>
          <source srcset="img/hero/product-${product.id}@3x.webp 3x, img/hero/product-${product.id}@2x.webp 2x, img/hero/product-${product.id}.webp" type="image/webp">
          <img src="img/hero/product-${product.id}.jpg" alt="${product.title}" loading="lazy">
        </picture>
      `;
      const imageLink = product.link ? `
        <a href="${product.link}" data-image-link="${product.link}" target="_blank" rel="noopener noreferrer" aria-label="查看${product.title}详情">
          ${imageContent}
        </a>
      ` : imageContent;
      return `
        <article class="product-card" data-animate>
          <div class="product-image" data-product-id="${product.id}" data-has-hover="${hasHoverImage}">
            ${imageLink}
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return `
      <section class="page products-page">
        <div class="container">
          <header class="page-header" data-animate>
            <h1 class="page-title" data-i18n="products.title">${window.i18n.get('products.title')}</h1>
            <p class="page-subtitle" data-i18n="products.subtitle">${window.i18n.get('products.subtitle')}</p>
          </header>
          <div class="products-grid">
            ${productCards}
          </div>
        </div>
      </section>
    `;
  }

  getTeamTemplate() {
    const team = window.i18n.get('team.members');
    const memberCards = team.map(member => `
      <article class="team-card" data-animate>
        <div class="member-avatar">
          <picture>
            <source srcset="img/team/member-${member.id}@3x.webp 3x, img/team/member-${member.id}@2x.webp 2x, img/team/member-${member.id}.webp" type="image/webp">
            <img src="img/team/member-${member.id}.jpg" alt="${member.name}" loading="lazy">
          </picture>
        </div>
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      </article>
    `).join('');

    return `
      <section class="page team-page">
        <div class="container">
          <header class="page-header" data-animate>
            <h1 class="page-title" data-i18n="team.title">${window.i18n.get('team.title')}</h1>
          </header>
          <hr class="section-divider">
          <div class="team-grid">
            ${memberCards}
          </div>
        </div>
      </section>
    `;
  }

  attachHomeEvents() {
    this.initNavigation();
    this.initHeroVideo();
    window.heroAnimations.init();
    window.dissolveAnimationManager.init();
  }

  attachProductsEvents() {
    this.initNavigation();
  }

  attachTeamEvents() {
    this.initNavigation();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.appInstance = app;
  window.setFloatingImageRotation = (enabled) => app.setFloatingImageRotationConfig(enabled);
  window.toggleFloatingImageRotation = () => app.toggleFloatingImageRotation();
  window.getFloatingImageRotation = () => app.getFloatingImageRotationConfig();
  app.init();
});
