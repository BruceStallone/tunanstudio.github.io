class TextAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      translateX: 12,
      translateY: -8,
      rotateY: 8,
      opacity: 0.85,
      duration: 350,
      perspective: 800,
      ...options
    };
    
    this.chars = [];
    this.isAnimating = false;
    this.originalContent = element.textContent;
    
    this.onMouseEnter = this.animateIn.bind(this);
    this.onMouseLeave = this.animateOut.bind(this);
    this.onFocus = this.animateIn.bind(this);
    this.onBlur = this.animateOut.bind(this);
  }

  init() {
    this.wrapChars();
    this.bindEvents();
    return this;
  }

  wrapChars() {
    const text = this.element.textContent;
    this.element.innerHTML = '';
    
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre';
    span.textContent = text;
    this.element.appendChild(span);
    
    this.chars = [this.element.querySelector('span')];
  }

  bindEvents() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
      this.element.addEventListener('mouseenter', this.onMouseEnter);
      this.element.addEventListener('mouseleave', this.onMouseLeave);
    }

    this.element.addEventListener('focus', this.onFocus, true);
    this.element.addEventListener('blur', this.onBlur, true);
    
    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'button');
    
    if (!this.element.getAttribute('aria-label')) {
      this.element.setAttribute('aria-label', this.originalContent);
    }
  }

  animateIn() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const { translateX, translateY, rotateY, opacity, duration, perspective } = this.options;
    const char = this.chars[0];
    
    char.style.willChange = 'transform, opacity';
    char.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    char.style.transform = `perspective(${perspective}px) translateX(${translateX}px) translateY(${translateY}px) rotateY(${rotateY}deg)`;
    char.style.opacity = opacity;

    setTimeout(() => {
      this.isAnimating = false;
    }, duration);
  }

  animateOut() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const { duration } = this.options;
    const char = this.chars[0];
    
    char.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    char.style.transform = 'perspective(800px) translateX(0) translateY(0) rotateY(0)';
    char.style.opacity = '1';

    setTimeout(() => {
      char.style.willChange = 'auto';
      this.isAnimating = false;
    }, duration);
  }

  destroy() {
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('focus', this.onFocus, true);
    this.element.removeEventListener('blur', this.onBlur, true);
    this.element.innerHTML = this.originalContent;
  }
}

class HeroAnimations {
  constructor() {
    this.heroTexts = [];
    this.isMobile = window.innerWidth < 768;
    this.initialized = false;
    this.resizeHandler = null;
    this.scrollObserver = null;
  }

  init() {
    if (!this.resizeHandler) {
      this.resizeHandler = this.handleResize.bind(this);
      window.addEventListener('resize', this.resizeHandler);
    }

    this.destroyBrandAnimations();
    this.initBrandAnimations();

    this.ensureScrollObserver();
    this.observeAnimateTargets();

    this.handleResize();
    this.initialized = true;
  }

  initBrandAnimations() {
    const brandElements = document.querySelectorAll('[data-brand-animation]');
    
    brandElements.forEach(el => {
      const animation = new TextAnimation(el, {
        translateX: el.dataset.translateX ? parseInt(el.dataset.translateX) : 12,
        translateY: el.dataset.translateY ? parseInt(el.dataset.translateY) : -8,
        rotateY: el.dataset.rotateY ? parseInt(el.dataset.rotateY) : 8,
        opacity: el.dataset.opacity ? parseFloat(el.dataset.opacity) : 0.85,
        duration: el.dataset.duration ? parseInt(el.dataset.duration) : 350,
        perspective: el.dataset.perspective ? parseInt(el.dataset.perspective) : 800
      });
      
      animation.init();
      this.heroTexts.push(animation);
    });
  }

  initScrollAnimations() {
    this.ensureScrollObserver();
    this.observeAnimateTargets();
  }

  ensureScrollObserver() {
    if (!this.scrollObserver) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            this.scrollObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
    }
  }

  observeAnimateTargets() {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animate-target');
      this.scrollObserver.observe(el);
    });
  }

  destroyBrandAnimations() {
    this.heroTexts.forEach(anim => anim.destroy());
    this.heroTexts = [];
  }

  dispose() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    this.destroyBrandAnimations();
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
    this.initialized = false;
  }

  handleResize() {
    this.isMobile = window.innerWidth < 768;
    
    if (this.isMobile) {
      this.heroTexts.forEach(animation => {
        animation.element.style.transform = 'none';
        animation.element.style.opacity = '1';
      });
    }
  }
}

class LazyImageLoader {
  constructor() {
    this.observer = null;
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px'
      });

      document.querySelectorAll('[data-lazy]').forEach(img => {
        this.observer.observe(img);
      });
    } else {
      document.querySelectorAll('[data-lazy]').forEach(img => {
        this.loadImage(img);
      });
    }
  }

  loadImage(img) {
    const src = img.dataset.lazy;
    const srcset = img.dataset.srcset;
    
    if (src) {
      img.src = src;
    }
    
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.add('loaded');
    img.removeAttribute('data-lazy');
  }
}

window.heroAnimations = new HeroAnimations();
window.lazyImageLoader = new LazyImageLoader();

class DissolveText {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      dissolveRadius: 150,
      maxOpacity: 0,
      maxScale: 1.5,
      particleCount: 12,
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      blurAmount: 8,
      translateAmount: 20,
      rotationAmount: 30,
      restoreEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      restoreDuration: 500,
      ...options
    };

    this.chars = [];
    this.originalContent = '';
    this.mousePos = { x: -1000, y: -1000 };
    this.isHovering = false;
    this.animationFrame = null;
    this.boundingRect = null;
    this.isDestroyed = false;
    this.lastFrameTime = 0;
    this.frameThrottle = 16;

    this.onMouseEnter = this.handleMouseEnter.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchMove = this.handleTouchMove.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);
  }

  init() {
    this.originalContent = this.element.textContent;
    this.wrapChars();
    this.bindEvents();
    return this;
  }

  wrapChars() {
    const text = this.element.textContent;
    this.element.innerHTML = '';
    this.element.style.position = 'relative';
    this.element.style.display = 'inline-block';

    const charArray = [...text];

    charArray.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'dissolve-char';
      span.style.display = 'inline-block';
      span.style.whiteSpace = 'pre';
      span.style.position = 'relative';
      span.style.transition = `opacity ${this.options.duration}ms ${this.options.easing}, 
                                transform ${this.options.duration}ms ${this.options.easing},
                                filter ${this.options.duration}ms ${this.options.easing}`;
      span.style.transformOrigin = 'center center';
      span.style.backfaceVisibility = 'hidden';
      span.style.webkitFontSmoothing = 'antialiased';
      span.textContent = char;
      this.element.appendChild(span);
      this.chars.push({
        element: span,
        char: char,
        index: index,
        seed: Math.random()
      });
    });

    this.addParticleStyles();
  }

  rewrapChars() {
    this.chars = [];
    this.wrapChars();
  }

  addParticleStyles() {
    let styleEl = document.getElementById('dissolve-particle-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dissolve-particle-styles';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent += `
      .dissolve-char {
        will-change: transform, opacity, filter;
      }
      .dissolve-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: currentColor;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
      }
    `;
  }

  bindEvents() {
    this.element.addEventListener('mouseenter', this.onMouseEnter);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mousemove', this.onMouseMove);

    this.element.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: true });
    this.element.addEventListener('touchend', this.onTouchEnd);

    this.element.style.cursor = 'default';
  }

  updateBoundingRect() {
    this.boundingRect = this.element.getBoundingClientRect();
  }

  handleMouseEnter(e) {
    this.isHovering = true;
    this.updateBoundingRect();
    this.updateMousePosition(e);
    this.startAnimation();
  }

  handleMouseLeave(e) {
    this.isHovering = false;
    this.mousePos = { x: -1000, y: -1000 };
    this.startAnimation();
  }

  handleMouseMove(e) {
    if (!this.isHovering) return;
    this.updateBoundingRect();
    this.updateMousePosition(e);
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      this.isHovering = true;
      this.updateBoundingRect();
      const touch = e.touches[0];
      this.updateMousePosition({ clientX: touch.clientX, clientY: touch.clientY });
      this.startAnimation();
    }
  }

  handleTouchMove(e) {
    if (!this.isHovering || e.touches.length === 0) return;
    const touch = e.touches[0];
    this.updateMousePosition({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleTouchEnd() {
    this.isHovering = false;
    this.mousePos = { x: -1000, y: -1000 };
    this.startAnimation();
  }

  updateMousePosition(e) {
    const rect = this.boundingRect;
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  startAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animate();
  }

  animate() {
    if (this.isDestroyed) return;
    
    const now = performance.now();
    if (now - this.lastFrameTime < this.frameThrottle) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastFrameTime = now;

    if (!this.isHovering && this.isAllRestored()) {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      return;
    }

    if (!this.boundingRect || this.boundingRect.width === 0 || this.boundingRect.height === 0) {
      this.updateBoundingRect();
      if (!this.boundingRect) {
        return;
      }
    }

    this.chars.forEach((charObj) => {
      const charRect = charObj.element.getBoundingClientRect();
      const elementRect = this.boundingRect;

      if (!charRect || !elementRect) return;

      const charCenterX = charRect.left - elementRect.left + charRect.width / 2;
      const charCenterY = charRect.top - elementRect.top + charRect.height / 2;

      const distance = this.calculateDistance(
        this.mousePos.x,
        this.mousePos.y,
        charCenterX,
        charCenterY
      );

      const { dissolveRadius, maxOpacity, maxScale, blurAmount, translateAmount, rotationAmount } = this.options;
      let dissolveFactor = 0;

      if (this.isHovering) {
        dissolveFactor = Math.max(0, 1 - distance / dissolveRadius);
        dissolveFactor = Math.pow(dissolveFactor, 1.5);
      }

      const opacity = 1 - dissolveFactor * (1 - maxOpacity);
      const scale = 1 + dissolveFactor * (maxScale - 1);
      const seed = charObj.seed;
      const translateX = dissolveFactor * (seed - 0.5) * translateAmount;
      const translateY = dissolveFactor * (seed - 0.5) * translateAmount - dissolveFactor * 10;
      const blur = dissolveFactor * blurAmount;
      const rotation = dissolveFactor * (seed - 0.5) * rotationAmount;

      charObj.element.style.opacity = opacity.toFixed(3);
      charObj.element.style.transform = `translate(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px) scale(${scale.toFixed(3)}) rotate(${rotation.toFixed(1)}deg)`;
      charObj.element.style.filter = `blur(${blur.toFixed(1)}px)`;

      if (dissolveFactor > 0.3) {
        this.createParticles(charObj.element, charCenterX, charCenterY, dissolveFactor, seed);
      }
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  isAllRestored() {
    return this.chars.every(charObj => {
      const style = charObj.element.style;
      const opacity = parseFloat(style.opacity);
      const transform = style.transform;
      const isOpacityRestored = isNaN(opacity) || opacity >= 0.99;
      const isTransformRestored = transform === 'none' || transform === '' || transform === 'translate(0px, 0px) scale(1) rotate(0deg)';
      return isOpacityRestored && isTransformRestored;
    });
  }

  createParticles(element, x, y, intensity, seed = Math.random()) {
    if (Math.random() > 0.3) return;

    const particleCount = Math.floor(this.options.particleCount * intensity);
    const existingParticles = element.querySelectorAll('.dissolve-particle');

    if (existingParticles.length > particleCount * 2) return;

    const directionX = (seed - 0.5) * 2;
    const directionY = -1 - seed * 0.5;
    const floatDistance = 30 + seed * 40;

    for (let i = 0; i < 2; i++) {
      const particle = document.createElement('span');
      particle.className = 'dissolve-particle';
      particle.style.left = `${x + (seed - 0.5) * 30}px`;
      particle.style.top = `${y + (seed - 0.5) * 20}px`;
      particle.style.opacity = intensity * 0.6;
      particle.style.width = `${3 + seed * 3}px`;
      particle.style.height = particle.style.width;
      particle.style.setProperty('--float-x', `${directionX * floatDistance}px`);
      particle.style.setProperty('--float-y', `${directionY * floatDistance}px`);
      particle.style.animation = `particleFloat ${this.options.duration}ms ease-out forwards`;
      element.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, this.options.duration);
    }
  }

  reset() {
    this.chars.forEach(charObj => {
      charObj.element.style.opacity = '1';
      charObj.element.style.transform = 'none';
      charObj.element.style.filter = 'none';
    });

    const particles = this.element.querySelectorAll('.dissolve-particle');
    particles.forEach(p => p.remove());
  }

  destroy() {
    this.isDestroyed = true;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);

    this.element.textContent = this.originalContent;
    this.element.style.position = '';
    this.element.style.display = '';
    this.element.style.cursor = '';
  }
}

class DissolveAnimationManager {
  constructor() {
    this.animations = [];
    this.initialized = false;
  }

  init() {
    this.destroy();
    this.initDissolveAnimations();
    this.addParticleAnimation();
    this.initialized = true;
  }

  initDissolveAnimations() {
    const brandElements = document.querySelectorAll('.brand-cn, .brand-en');
    
    if (brandElements.length === 0) {
      console.warn('[DissolveAnimation] 未找到品牌文字元素');
      return;
    }

    brandElements.forEach(el => {
      try {
        const animation = new DissolveText(el, {
          dissolveRadius: 120,
          maxOpacity: 0.05,
          maxScale: 1.8,
          particleCount: 8,
          duration: 400,
          blurAmount: 6,
          translateAmount: 15,
          rotationAmount: 25,
          restoreDuration: 450
        });
        animation.init();
        this.animations.push(animation);
      } catch (error) {
        console.error('[DissolveAnimation] 初始化失败:', error);
      }
    });
  }

  addParticleAnimation() {
    let styleEl = document.getElementById('dissolve-particle-animations');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dissolve-particle-animations';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      @keyframes particleFloat {
        0% {
          opacity: 0.6;
          transform: translate(0, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(var(--float-x, -30px), var(--float-y, -60px)) scale(0);
        }
      }
    `;
  }

  destroy() {
    this.animations.forEach(anim => anim.destroy());
    this.animations = [];
    this.initialized = false;
  }

  reinitialize() {
    if (this.animations.length === 0) {
      this.init();
      return;
    }

    this.animations.forEach(anim => {
      anim.rewrapChars();
    });
    console.log('[DissolveAnimation] 重新包装字符完成');
  }
}

window.dissolveAnimationManager = new DissolveAnimationManager();
