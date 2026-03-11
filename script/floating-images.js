/**
 * 浮动图片特效模块
 * 提供交互式浮动图片组件，支持旋转、悬停、拖拽等功能
 */

class FloatingImages {
  constructor(options = {}) {
    this.images = options.images || [];
    this.containerSelector = options.containerSelector || '.hero-bg';
    this.rotationSpeed = options.rotationSpeed || 45;
    this.minSpeed = options.minSpeed || 30;
    this.maxSpeed = options.maxSpeed || 60;
    this.safeMargin = options.safeMargin || 10;
    this.imageSize = options.imageSize || 120;
    this.storageKey = options.storageKey || 'tunan-floating-images';
    this.textSafeMargin = options.textSafeMargin || 20;
    this.maxOverlapRatio = options.maxOverlapRatio || 0.15;

    this.container = null;
    this.imageElements = [];
    this.animationFrameId = null;
    this.lastTimestamp = 0;
    this.isPageVisible = true;
    this.imageStates = [];
    this.textBounds = null;
    this.debugMode = options.debugMode || false;
    this._onVisibilityChange = null;

    this.dragState = {
      isDragging: false,
      currentImage: null,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
      offsetX: 0,
      offsetY: 0
    };

    this.init();
  }

  init() {
    this.container = document.querySelector(this.containerSelector);
    if (!this.container) {
      console.warn('[FloatingImages] 容器不存在');
      return;
    }

    this.limitImageCount();
    
    if (!this.validateImages()) {
      console.warn('[FloatingImages] 图片配置无效');
      return;
    }

    this.detectTextBounds();
    this.setupVisibilityObserver();
    this.createImages();
    this.startAnimation();
    this.loadPositions();
    
    if (this.debugMode) {
      this.logDebugInfo();
    }
  }

  detectTextBounds() {
    const textElement = document.querySelector('.brand-title');
    if (!textElement) {
      console.log('[FloatingImages] 未找到文字元素，使用默认布局');
      return;
    }

    const containerRect = this.container.getBoundingClientRect();
    const textRect = textElement.getBoundingClientRect();

    this.textBounds = {
      x: textRect.left - containerRect.left,
      y: textRect.top - containerRect.top,
      width: textRect.width,
      height: textRect.height,
      right: textRect.right - containerRect.left,
      bottom: textRect.bottom - containerRect.top
    };

    console.log('[FloatingImages] 文字区域坐标:', {
      x: this.textBounds.x,
      y: this.textBounds.y,
      width: this.textBounds.width,
      height: this.textBounds.height
    });
  }

  getTextSafeArea() {
    if (!this.textBounds) return null;

    return {
      x: this.textBounds.x - this.textSafeMargin,
      y: this.textBounds.y - this.textSafeMargin,
      width: this.textBounds.width + this.textSafeMargin * 2,
      height: this.textBounds.height + this.textSafeMargin * 2,
      centerX: this.textBounds.x + this.textBounds.width / 2,
      centerY: this.textBounds.y + this.textBounds.height / 2
    };
  }

  calculateOverlapRatio(imgPos, textSafeArea) {
    if (!textSafeArea) return 0;

    const imgLeft = imgPos.x;
    const imgRight = imgPos.x + this.imageSize;
    const imgTop = imgPos.y;
    const imgBottom = imgPos.y + this.imageSize;

    const textLeft = textSafeArea.x;
    const textRight = textSafeArea.x + textSafeArea.width;
    const textTop = textSafeArea.y;
    const textBottom = textSafeArea.y + textSafeArea.height;

    const overlapLeft = Math.max(imgLeft, textLeft);
    const overlapRight = Math.min(imgRight, textRight);
    const overlapTop = Math.max(imgTop, textTop);
    const overlapBottom = Math.min(imgBottom, textBottom);

    if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
      return 0;
    }

    const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
    const imgArea = this.imageSize * this.imageSize;

    return overlapArea / imgArea;
  }

  findNonOverlappingPosition(containerRect, textSafeArea, imgWidth, imgHeight, existingPositions) {
    const maxAttempts = 100;
    const minPos = this.safeMargin;
    const maxX = containerRect.width - imgWidth - this.safeMargin;
    const maxY = containerRect.height - imgHeight - this.safeMargin;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidatePos = {
        x: Math.random() * (maxX - minPos) + minPos,
        y: Math.random() * (maxY - minPos) + minPos
      };

      if (textSafeArea) {
        const overlapRatio = this.calculateOverlapRatio(candidatePos, textSafeArea);
        if (overlapRatio > this.maxOverlapRatio) {
          continue;
        }
      }

      if (!this.checkOverlap(candidatePos, existingPositions, imgWidth, imgHeight)) {
        return { position: candidatePos, overlapRatio: textSafeArea ? this.calculateOverlapRatio(candidatePos, textSafeArea) : 0 };
      }
    }

    return this.findPositionAroundText(containerRect, textSafeArea, imgWidth, imgHeight, existingPositions);
  }

  findPositionAroundText(containerRect, textSafeArea, imgWidth, imgHeight, existingPositions) {
    if (!textSafeArea) {
      return {
        position: this.getRandomPosition(containerRect, imgWidth, imgHeight),
        overlapRatio: 0
      };
    }

    const directions = [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    const baseDistance = Math.max(textSafeArea.width, textSafeArea.height) / 2 + imgWidth;

    for (let ring = 1; ring <= 4; ring++) {
      const distance = baseDistance * ring * 0.8;

      for (const dir of directions) {
        const candidatePos = {
          x: textSafeArea.centerX + dir.x * distance - imgWidth / 2,
          y: textSafeArea.centerY + dir.y * distance - imgHeight / 2
        };

        const clampedX = Math.max(this.safeMargin, Math.min(candidatePos.x, containerRect.width - imgWidth - this.safeMargin));
        const clampedY = Math.max(this.safeMargin, Math.min(candidatePos.y, containerRect.height - imgHeight - this.safeMargin));

        const finalPos = { x: clampedX, y: clampedY };
        const overlapRatio = this.calculateOverlapRatio(finalPos, textSafeArea);

        if (overlapRatio <= this.maxOverlapRatio && !this.checkOverlap(finalPos, existingPositions, imgWidth, imgHeight)) {
          return { position: finalPos, overlapRatio };
        }
      }
    }

    return {
      position: this.getRandomPosition(containerRect, imgWidth, imgHeight),
      overlapRatio: 1
    };
  }

  generateSmartPositions(containerRect, count, imgWidth, imgHeight) {
    const textSafeArea = this.getTextSafeArea();
    const positions = [];
    const overlapRatios = [];

    for (let i = 0; i < count; i++) {
      const result = this.findNonOverlappingPosition(
        containerRect,
        textSafeArea,
        imgWidth,
        imgHeight,
        positions
      );

      positions.push(result.position);
      overlapRatios.push(result.overlapRatio);

      if (this.debugMode) {
        console.log(`[FloatingImages] 图片 ${i + 1}:`, {
          x: Math.round(result.position.x),
          y: Math.round(result.position.y),
          width: imgWidth,
          height: imgHeight,
          overlapRatio: (result.overlapRatio * 100).toFixed(1) + '%'
        });
      }
    }

    if (this.debugMode) {
      console.log('[FloatingImages] 位置生成完成:', {
        totalImages: count,
        avgOverlapRatio: (overlapRatios.reduce((a, b) => a + b, 0) / count * 100).toFixed(1) + '%',
        maxOverlapRatio: (Math.max(...overlapRatios) * 100).toFixed(1) + '%'
      });
    }

    return positions;
  }

  limitImageCount() {
    const maxImages = 18;
    if (this.images.length > maxImages) {
      console.warn(`[FloatingImages] 图片数量超过限制 ${maxImages}，将截取前 ${maxImages} 张`);
      this.images = this.images.slice(0, maxImages);
    }
  }

  validateImages() {
    if (!Array.isArray(this.images) || this.images.length < 3 || this.images.length > 18) {
      console.warn('[FloatingImages] 图片数量必须在 3-18 张之间');
      return false;
    }
    return true;
  }

  setupVisibilityObserver() {
    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }

    this._onVisibilityChange = () => {
      this.isPageVisible = !document.hidden;
      if (this.isPageVisible) {
        this.lastTimestamp = 0;
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    };

    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  getRandomPosition(containerRect, imgWidth, imgHeight) {
    const maxX = containerRect.width - imgWidth - this.safeMargin * 2;
    const maxY = containerRect.height - imgHeight - this.safeMargin * 2;
    const minPos = this.safeMargin;

    return {
      x: Math.random() * (maxX - minPos) + minPos,
      y: Math.random() * (maxY - minPos) + minPos
    };
  }

  checkOverlap(newPos, existingPositions, imgWidth, imgHeight) {
    const overlapMargin = 30;

    for (const pos of existingPositions) {
      const overlapX = Math.abs(newPos.x - pos.x) < imgWidth + overlapMargin;
      const overlapY = Math.abs(newPos.y - pos.y) < imgHeight + overlapMargin;

      if (overlapX && overlapY) {
        return true;
      }
    }
    return false;
  }

  generateGridPositions(containerRect, count, imgWidth, imgHeight) {
    const cols = Math.ceil(Math.sqrt(count * (containerRect.width / containerRect.height)));
    const rows = Math.ceil(count / cols);
    
    const cellWidth = (containerRect.width - this.safeMargin * 2) / cols;
    const cellHeight = (containerRect.height - this.safeMargin * 2) / rows;
    
    const positions = [];
    const usedCells = new Set();
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const cellKey = `${col}-${row}`;
      let offsetX, offsetY;
      
      if (!usedCells.has(cellKey)) {
        offsetX = (Math.random() - 0.5) * (cellWidth - imgWidth) * 0.6;
        offsetY = (Math.random() - 0.5) * (cellHeight - imgHeight) * 0.6;
        usedCells.add(cellKey);
      } else {
        offsetX = (Math.random() - 0.5) * (cellWidth - imgWidth) * 0.4;
        offsetY = (Math.random() - 0.5) * (cellHeight - imgHeight) * 0.4;
      }
      
      const x = this.safeMargin + col * cellWidth + (cellWidth - imgWidth) / 2 + offsetX;
      const y = this.safeMargin + row * cellHeight + (cellHeight - imgHeight) / 2 + offsetY;
      
      const clampedX = Math.max(this.safeMargin, Math.min(x, containerRect.width - imgWidth - this.safeMargin));
      const clampedY = Math.max(this.safeMargin, Math.min(y, containerRect.height - imgHeight - this.safeMargin));
      
      positions.push({ x: clampedX, y: clampedY });
    }
    
    return positions;
  }

  generateUniquePositions(containerRect, count, imgWidth, imgHeight) {
    if (this.textBounds) {
      return this.generateSmartPositions(containerRect, count, imgWidth, imgHeight);
    }

    const positions = [];
    const maxAttempts = 100;
    
    const useGridFallback = (containerRect.width < imgWidth * 3 || containerRect.height < imgHeight * 3);
    
    if (useGridFallback || count > 6) {
      return this.generateGridPositions(containerRect, count, imgWidth, imgHeight);
    }

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let position;

      do {
        position = this.getRandomPosition(containerRect, imgWidth, imgHeight);
        attempts++;
      } while (this.checkOverlap(position, positions, imgWidth, imgHeight) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        console.warn(`[FloatingImages] 为第 ${i + 1} 张图片生成位置时达到最大尝试次数，切换到网格布局`);
        return this.generateGridPositions(containerRect, count, imgWidth, imgHeight);
      }

      positions.push(position);
    }

    return positions;
  }

  logDebugInfo() {
    console.log('='.repeat(50));
    console.log('[FloatingImages] 调试信息');
    console.log('='.repeat(50));
    console.log('文字区域边界:', this.textBounds || '未检测到');
    console.log('安全边距:', this.textSafeMargin + 'px');
    console.log('最大重叠率:', (this.maxOverlapRatio * 100) + '%');
    console.log('图片尺寸:', this.imageSize + 'px');
    console.log('图片数量:', this.images.length);
    console.log('='.repeat(50));
  }

  createImages() {
    const containerRect = this.container.getBoundingClientRect();
    const positions = this.generateUniquePositions(
      containerRect,
      this.images.length,
      this.imageSize,
      this.imageSize
    );

    this.images.forEach((imgUrl, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'floating-image-wrapper';
      imgWrapper.dataset.index = index;

      const img = document.createElement('img');
      img.src = imgUrl;
      img.className = 'floating-image';
      img.alt = `浮动图片 ${index + 1}`;
      img.draggable = false;

      Object.assign(imgWrapper.style, {
        position: 'absolute',
        width: `${this.imageSize}px`,
        height: `${this.imageSize}px`,
        left: `${positions[index].x}px`,
        top: `${positions[index].y}px`,
        transform: 'translate(0, 0)',
        willChange: 'transform',
        touchAction: 'none'
      });

      imgWrapper.appendChild(img);
      this.container.appendChild(imgWrapper);

      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);

      this.imageElements.push(imgWrapper);
      this.imageStates.push({
        rotation: Math.random() * 360,
        direction,
        speed,
        isPaused: false,
        isDragging: false,
        position: { ...positions[index] }
      });

      this.attachImageEvents(imgWrapper, index);
    });
  }

  attachImageEvents(imgWrapper, index) {
    const handleStart = (e) => {
      e.preventDefault();
      this.startDrag(e, imgWrapper, index);
    };

    imgWrapper.addEventListener('mousedown', handleStart);
    imgWrapper.addEventListener('touchstart', handleStart, { passive: false });

    imgWrapper.addEventListener('mouseenter', () => {
      if (!this.dragState.isDragging || this.dragState.currentImage !== imgWrapper) {
        this.pauseRotation(index);
      }
    });

    imgWrapper.addEventListener('mouseleave', () => {
      if (!this.dragState.isDragging || this.dragState.currentImage !== imgWrapper) {
        this.resumeRotation(index);
      }
    });
  }

  startDrag(e, imgWrapper, index) {
    const touch = e.touches ? e.touches[0] : e;

    this.dragState.isDragging = true;
    this.dragState.currentImage = imgWrapper;
    this.dragState.startX = touch.clientX;
    this.dragState.startY = touch.clientY;
    this.dragState.offsetX = 0;
    this.dragState.offsetY = 0;

    const state = this.imageStates[index];
    this.dragState.initialX = state.position.x;
    this.dragState.initialY = state.position.y;

    state.isPaused = true;
    state.isDragging = true;
    imgWrapper.classList.add('dragging');

    const handleMove = (e) => this.handleDrag(e, index);
    const handleEnd = (e) => this.endDrag(e, index);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    imgWrapper._handleMove = handleMove;
    imgWrapper._handleEnd = handleEnd;
  }

  handleDrag(e, index) {
    if (!this.dragState.isDragging) return;

    const touch = e.touches ? e.touches[0] : e;
    const containerRect = this.container.getBoundingClientRect();

    const deltaX = touch.clientX - this.dragState.startX;
    const deltaY = touch.clientY - this.dragState.startY;

    let newX = this.dragState.initialX + deltaX;
    let newY = this.dragState.initialY + deltaY;

    const maxX = containerRect.width - this.imageSize - this.safeMargin;
    const maxY = containerRect.height - this.imageSize - this.safeMargin;
    const minPos = this.safeMargin;

    newX = Math.max(minPos, Math.min(newX, maxX));
    newY = Math.max(minPos, Math.min(newY, maxY));

    this.dragState.offsetX = newX - this.dragState.initialX;
    this.dragState.offsetY = newY - this.dragState.initialY;

    const imgWrapper = this.imageElements[index];
    imgWrapper.style.left = `${newX}px`;
    imgWrapper.style.top = `${newY}px`;

    this.imageStates[index].position.x = newX;
    this.imageStates[index].position.y = newY;
  }

  endDrag(e, index) {
    const imgWrapper = this.imageElements[index];

    document.removeEventListener('mousemove', imgWrapper._handleMove);
    document.removeEventListener('mouseup', imgWrapper._handleEnd);
    document.removeEventListener('touchmove', imgWrapper._handleMove);
    document.removeEventListener('touchend', imgWrapper._handleEnd);

    delete imgWrapper._handleMove;
    delete imgWrapper._handleEnd;

    const state = this.imageStates[index];
    state.isDragging = false;
    state.isPaused = false;

    imgWrapper.classList.remove('dragging');

    this.dragState.isDragging = false;
    this.dragState.currentImage = null;

    this.savePositions();
  }

  pauseRotation(index) {
    const state = this.imageStates[index];
    if (!state.isDragging) {
      state.isPaused = true;
      const imgWrapper = this.imageElements[index];
      const currentRotation = state.rotation;
      imgWrapper.style.transform = `rotate(${currentRotation}deg)`;
    }
  }

  resumeRotation(index) {
    const state = this.imageStates[index];
    if (!state.isDragging) {
      state.isPaused = false;
    }
  }

  startAnimation() {
    if (this.animationFrameId) return;

    const animate = (timestamp) => {
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      if (this.isPageVisible) {
        this.updateRotations(deltaTime);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  updateRotations(deltaTime) {
    this.imageElements.forEach((imgWrapper, index) => {
      const state = this.imageStates[index];

      if (!state.isPaused && !state.isDragging) {
        const rotationDelta = state.speed * state.direction * deltaTime;
        state.rotation = (state.rotation + rotationDelta) % 360;

        if (state.rotation < 0) {
          state.rotation += 360;
        }
      }

      if (!state.isPaused) {
        imgWrapper.style.transform = `rotate(${state.rotation}deg)`;
      }
    });
  }

  resetToFront(index) {
    const state = this.imageStates[index];
    state.rotation = 0;
    const imgWrapper = this.imageElements[index];
    imgWrapper.style.transform = 'rotate(0deg)';
  }

  savePositions() {
    const positions = this.imageStates.map(state => ({
      x: state.position.x,
      y: state.position.y,
      rotation: state.rotation
    }));

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(positions));
    } catch (e) {
      console.warn('[FloatingImages] 保存位置失败:', e);
    }
  }

  loadPositions() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;

      const positions = JSON.parse(saved);
      if (!Array.isArray(positions) || positions.length !== this.images.length) return;

      positions.forEach((pos, index) => {
        if (this.imageElements[index] && this.imageStates[index]) {
          const imgWrapper = this.imageElements[index];
          imgWrapper.style.left = `${pos.x}px`;
          imgWrapper.style.top = `${pos.y}px`;

          this.imageStates[index].position.x = pos.x;
          this.imageStates[index].position.y = pos.y;
          this.imageStates[index].rotation = pos.rotation || 0;
        }
      });
    } catch (e) {
      console.warn('[FloatingImages] 加载位置失败:', e);
    }
  }

  clearPositions() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('[FloatingImages] 清除位置失败:', e);
    }
  }

  destroy() {
    this.stopAnimation();

    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
      this._onVisibilityChange = null;
    }

    this.imageElements.forEach((imgWrapper) => {
      if (imgWrapper._handleMove) {
        document.removeEventListener('mousemove', imgWrapper._handleMove);
        document.removeEventListener('touchmove', imgWrapper._handleMove);
      }
      if (imgWrapper._handleEnd) {
        document.removeEventListener('mouseup', imgWrapper._handleEnd);
        document.removeEventListener('touchend', imgWrapper._handleEnd);
      }
      imgWrapper.remove();
    });

    this.imageElements = [];
    this.imageStates = [];
  }
}

window.FloatingImages = FloatingImages;

export default FloatingImages;
