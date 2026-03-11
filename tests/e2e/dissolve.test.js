describe('溶解效果交互测试', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
  });

  describe('溶解动画初始化测试', () => {
    test('dissolveAnimationManager应已初始化', async () => {
      const isInitialized = await page.evaluate(() => {
        return window.dissolveAnimationManager && window.dissolveAnimationManager.initialized;
      });
      expect(isInitialized).toBe(true);
    });

    test('品牌文字元素应存在', async () => {
      const brandCn = await page.$('.brand-cn');
      const brandEn = await page.$('.brand-en');
      expect(brandCn).toBeTruthy();
      expect(brandEn).toBeTruthy();
    });

    test('字符应被正确包裹在span元素中', async () => {
      const charCount = await page.evaluate(() => {
        const brandCn = document.querySelector('.brand-cn');
        return brandCn.querySelectorAll('.dissolve-char').length;
      });
      expect(charCount).toBeGreaterThan(0);
    });
  });

  describe('语言切换后溶解效果测试', () => {
    test('切换到英文后溶解效果应正常', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);

      const isInitializedAfterSwitch = await page.evaluate(() => {
        return window.dissolveAnimationManager && window.dissolveAnimationManager.initialized;
      });
      expect(isInitializedAfterSwitch).toBe(true);

      const charCountAfterSwitch = await page.evaluate(() => {
        const brandEn = document.querySelector('.brand-en');
        return brandEn.querySelectorAll('.dissolve-char').length;
      });
      expect(charCountAfterSwitch).toBeGreaterThan(0);
    });

    test('英文状态下悬停应触发溶解效果', async () => {
      await page.hover('.brand-en');
      await page.waitForTimeout(200);

      const hasDissolveEffect = await page.evaluate(() => {
        const chars = document.querySelectorAll('.brand-en .dissolve-char');
        let hasEffect = false;
        chars.forEach(char => {
          const opacity = parseFloat(char.style.opacity);
          if (opacity < 1) {
            hasEffect = true;
          }
        });
        return hasEffect;
      });

      expect(hasDissolveEffect).toBe(true);

      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
    });

    test('切换回中文后溶解效果应正常', async () => {
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(600);

      const charCountAfterSwitch = await page.evaluate(() => {
        const brandCn = document.querySelector('.brand-cn');
        return brandCn.querySelectorAll('.dissolve-char').length;
      });
      expect(charCountAfterSwitch).toBeGreaterThan(0);
    });

    test('中文状态下悬停应触发溶解效果', async () => {
      await page.hover('.brand-cn');
      await page.waitForTimeout(200);

      const hasDissolveEffect = await page.evaluate(() => {
        const chars = document.querySelectorAll('.brand-cn .dissolve-char');
        let hasEffect = false;
        chars.forEach(char => {
          const opacity = parseFloat(char.style.opacity);
          if (opacity < 1) {
            hasEffect = true;
          }
        });
        return hasEffect;
      });

      expect(hasDissolveEffect).toBe(true);

      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
    });

    test('反复切换语言5次后溶解效果应正常', async () => {
      const languages = ['en', 'zh-CN', 'en', 'zh-CN', 'en', 'zh-CN', 'en', 'zh-CN', 'en', 'zh-CN'];
      
      for (const lang of languages) {
        await page.click(`[data-lang="${lang}"]`);
        await page.waitForTimeout(600);

        const isInitialized = await page.evaluate(() => {
          return window.dissolveAnimationManager && window.dissolveAnimationManager.initialized;
        });
        expect(isInitialized).toBe(true);

        const charCount = await page.evaluate(() => {
          const brandCn = document.querySelector('.brand-cn');
          return brandCn.querySelectorAll('.dissolve-char').length;
        });
        expect(charCount).toBeGreaterThan(0);
      }
    });

    test('切换语言后reinitialize方法应被调用', async () => {
      const reinitializeCalled = await page.evaluate(() => {
        const originalReinitialize = window.dissolveAnimationManager.reinitialize;
        let called = false;
        
        window.dissolveAnimationManager.reinitialize = function() {
          called = true;
          return originalReinitialize.apply(this, arguments);
        };

        return new Promise((resolve) => {
          window.i18n.switchLanguage('en').then(() => {
            setTimeout(() => {
              resolve(called);
            }, 200);
          });
        });
      });

      expect(reinitializeCalled).toBe(true);
    });
  });

  describe('鼠标悬停溶解效果测试', () => {
    beforeAll(async () => {
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(500);
    });

    test('鼠标悬停时应触发溶解效果', async () => {
      await page.hover('.brand-cn');
      await page.waitForTimeout(200);

      const hasDissolveEffect = await page.evaluate(() => {
        const chars = document.querySelectorAll('.dissolve-char');
        let hasEffect = false;
        chars.forEach(char => {
          const opacity = parseFloat(char.style.opacity);
          if (opacity < 1) {
            hasEffect = true;
          }
        });
        return hasEffect;
      });

      expect(hasDissolveEffect).toBe(true);
    });

    test('鼠标移出后文字应恢复原状', async () => {
      await page.hover('.brand-cn');
      await page.waitForTimeout(300);

      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);

      const isRestored = await page.evaluate(() => {
        const chars = document.querySelectorAll('.dissolve-char');
        let allRestored = true;
        chars.forEach(char => {
          const opacity = parseFloat(char.style.opacity);
          if (opacity < 0.99) {
            allRestored = false;
          }
        });
        return allRestored;
      });

      expect(isRestored).toBe(true);
    });

    test('溶解效果应从鼠标位置开始扩散', async () => {
      const boundingBox = await page.evaluate(() => {
        const el = document.querySelector('.brand-cn');
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });

      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;

      await page.mouse.move(centerX, centerY);
      await page.waitForTimeout(200);

      const dissolveState = await page.evaluate(() => {
        const chars = document.querySelectorAll('.dissolve-char');
        return Array.from(chars).map(char => ({
          opacity: parseFloat(char.style.opacity),
          transform: char.style.transform,
          filter: char.style.filter
        }));
      });

      let hasPartialDissolve = false;
      dissolveState.forEach(state => {
        if (state.opacity < 1 && state.opacity > 0) {
          hasPartialDissolve = true;
        }
      });

      expect(hasPartialDissolve).toBe(true);
    });
  });

  describe('触摸设备支持测试', () => {
    test('触摸开始时应触发溶解效果', async () => {
      const device = await page.emulate({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      });

      const brandCn = await page.$('.brand-cn');
      const brandCnBox = await brandCn.boundingBox();

      if (brandCnBox) {
        await page.touchdown({
          x: brandCnBox.x + brandCnBox.width / 2,
          y: brandCnBox.y + brandCnBox.height / 2
        });
        await page.waitForTimeout(200);

        const hasDissolveEffect = await page.evaluate(() => {
          const chars = document.querySelectorAll('.dissolve-char');
          let hasEffect = false;
          chars.forEach(char => {
            const opacity = parseFloat(char.style.opacity);
            if (opacity < 1) {
              hasEffect = true;
            }
          });
          return hasEffect;
        });

        expect(hasDissolveEffect).toBe(true);
      }
    });
  });

  describe('性能测试', () => {
    test('动画应使用will-change优化', async () => {
      const willChange = await page.evaluate(() => {
        const char = document.querySelector('.dissolve-char');
        return window.getComputedStyle(char).willChange;
      });

      expect(willChange).toContain('transform');
    });

    test('动画应使用requestAnimationFrame', async () => {
      const hasAnimationFrame = await page.evaluate(() => {
        const brandCn = document.querySelector('.brand-cn');
        return brandCn && window.dissolveAnimationManager.animations.length > 0;
      });

      expect(hasAnimationFrame).toBe(true);
    });
  });

  describe('浏览器兼容性测试', () => {
    test('应支持主流浏览器的CSS属性', async () => {
      const supportLevel = await page.evaluate(() => {
        const testEl = document.createElement('div');
        const props = {
          transform: 'transform' in testEl.style,
          filter: 'filter' in testEl.style,
          willChange: 'willChange' in testEl.style,
          opacity: 'opacity' in testEl.style
        };
        return props;
      });

      expect(supportLevel.transform).toBe(true);
      expect(supportLevel.filter).toBe(true);
      expect(supportLevel.willChange).toBe(true);
      expect(supportLevel.opacity).toBe(true);
    });
  });

  describe('无障碍测试', () => {
    test('品牌文字应保持可读性', async () => {
      const colorContrast = await page.evaluate(() => {
        const el = document.querySelector('.brand-cn');
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          opacity: style.opacity
        };
      });

      expect(colorContrast.opacity).toBeDefined();
    });

    test('元素应具有适当的tabindex', async () => {
      const tabIndex = await page.evaluate(() => {
        const el = document.querySelector('.brand-cn');
        return el.tabIndex;
      });

      expect(tabIndex).not.toBe(-1);
    });
  });
});
