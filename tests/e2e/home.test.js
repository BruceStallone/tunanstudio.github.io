describe('I18nEngine 单元测试', () => {
  let i18n;

  beforeEach(() => {
    i18n = new window.I18nEngine();
    localStorage.clear();
  });

  afterEach(() => {
    i18n.destroy();
  });

  describe('构造函数', () => {
    test('应正确初始化默认属性', () => {
      expect(i18n.currentLang).toBe('zh-CN');
      expect(i18n.defaultLang).toBe('zh-CN');
      expect(i18n.translations).toEqual({});
      expect(i18n.isInitialized).toBe(false);
      expect(i18n.isLoading).toBe(false);
    });
  });

  describe('isSupported', () => {
    test('应正确判断支持的语言', () => {
      expect(i18n.isSupported('zh-CN')).toBe(true);
      expect(i18n.isSupported('en')).toBe(true);
      expect(i18n.isSupported('ja')).toBe(false);
      expect(i18n.isSupported('zh')).toBe(false);
      expect(i18n.isSupported('')).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    test('应正确检测中文', () => {
      expect(i18n.detectLanguage('zh-CN')).toBe('zh-CN');
      expect(i18n.detectLanguage('zh')).toBe('zh-CN');
      expect(i18n.detectLanguage('ZH-CN')).toBe('zh-CN');
    });

    test('应正确检测英文', () => {
      expect(i18n.detectLanguage('en')).toBe('en');
      expect(i18n.detectLanguage('en-US')).toBe('en');
      expect(i18n.detectLanguage('EN')).toBe('en');
    });

    test('应返回默认语言', () => {
      expect(i18n.detectLanguage('ja')).toBe('zh-CN');
      expect(i18n.detectLanguage('fr')).toBe('zh-CN');
      expect(i18n.detectLanguage('')).toBe('zh-CN');
      expect(i18n.detectLanguage(null)).toBe('zh-CN');
      expect(i18n.detectLanguage(undefined)).toBe('zh-CN');
    });
  });

  describe('事件系统', () => {
    test('应能订阅和取消订阅事件', () => {
      const callback = jest.fn();
      const unsubscribe = i18n.on('test', callback);
      
      i18n.emit('test', { data: 'test' });
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
      
      unsubscribe();
      i18n.emit('test', { data: 'test2' });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('应能处理事件监听器中的错误', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      
      i18n.on('test', errorCallback);
      
      expect(() => {
        i18n.emit('test', {});
      }).not.toThrow();
    });
  });

  describe('getSupportedLanguages', () => {
    test('应返回支持的语言列表', () => {
      const langs = i18n.getSupportedLanguages();
      expect(langs).toContain('zh-CN');
      expect(langs).toContain('en');
      expect(langs).not.toContain('ja');
    });
  });
});

describe('语言切换功能集成测试', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  describe('页面初始化', () => {
    test('页面应正确加载', async () => {
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('i18n引擎应正确初始化', async () => {
      const isInitialized = await page.evaluate(() => window.i18n.isInitialized);
      expect(isInitialized).toBe(true);
    });

    test('默认语言应为中文', async () => {
      const currentLang = await page.evaluate(() => window.i18n.getCurrentLang());
      expect(currentLang).toBe('zh-CN');
    });
  });

  describe('语言切换按钮', () => {
    test('应有中文和英文切换按钮', async () => {
      const zhBtn = await page.$('[data-lang="zh-CN"]');
      const enBtn = await page.$('[data-lang="en"]');
      
      expect(zhBtn).toBeTruthy();
      expect(enBtn).toBeTruthy();
    });

    test('不应有日语切换按钮', async () => {
      const jaBtn = await page.$('[data-lang="ja"]');
      expect(jaBtn).toBeNull();
    });

    test('切换按钮应为可点击状态', async () => {
      const enBtn = await page.$('[data-lang="en"]');
      const isDisabled = await page.evaluate(el => el.disabled, enBtn);
      expect(isDisabled).toBe(false);
    });
  });

  describe('语言切换功能', () => {
    test('点击英文按钮应切换到英文', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const currentLang = await page.evaluate(() => window.i18n.getCurrentLang());
      expect(currentLang).toBe('en');
    });

    test('切换英文后导航文案应更新', async () => {
      const navProducts = await page.textContent('[data-i18n="nav.products"]');
      expect(navProducts).toBe('Products');
    });

    test('切换英文后"向下滚动"文案应更新', async () => {
      const scrollText = await page.textContent('[data-i18n="hero.scroll"]');
      expect(scrollText).toBe('Scroll Down');
    });

    test('切换英文后品牌文案应更新', async () => {
      const brandEn = await page.textContent('[data-i18n="brand.en"]');
      expect(brandEn).toBe('TunanStudio');
    });

    test('点击中文按钮应切换回中文', async () => {
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(600);
      
      const currentLang = await page.evaluate(() => window.i18n.getCurrentLang());
      expect(currentLang).toBe('zh-CN');
      
      const navProducts = await page.textContent('[data-i18n="nav.products"]');
      expect(navProducts).toBe('产品介绍');
    });

    test('切换到相同语言应无效', async () => {
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(300);
      
      const consoleLogs = [];
      page.on('console', msg => consoleLogs.push(msg.text()));
      
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(300);
      
      const alreadyLog = consoleLogs.some(log => log.includes('Already on language'));
      expect(alreadyLog).toBe(true);
    });
  });

  describe('按钮状态', () => {
    test('激活按钮应有active类', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const enActive = await page.$eval('[data-lang="en"]', el => el.classList.contains('active'));
      const zhActive = await page.$eval('[data-lang="zh-CN"]', el => el.classList.contains('active'));
      
      expect(enActive).toBe(true);
      expect(zhActive).toBe(false);
    });

    test('切换语言后按钮aria-pressed应正确', async () => {
      const enPressed = await page.$eval('[data-lang="en"]', el => el.getAttribute('aria-pressed'));
      expect(enPressed).toBe('true');
    });
  });

  describe('持久化', () => {
    test('语言设置应保存到localStorage', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const savedLang = await page.evaluate(() => localStorage.getItem('tunan-lang'));
      expect(savedLang).toBe('en');
    });

    test('刷新页面应保持语言设置', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      await page.reload();
      await page.waitForTimeout(600);
      
      const currentLang = await page.evaluate(() => window.i18n.getCurrentLang());
      expect(currentLang).toBe('en');
      
      const navProducts = await page.textContent('[data-i18n="nav.products"]');
      expect(navProducts).toBe('Products');
    });
  });

  describe('路由切换后功能', () => {
    test('产品页应能切换语言', async () => {
      await page.click('[data-nav="products"]');
      await page.waitForTimeout(600);
      
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const navProducts = await page.textContent('[data-i18n="nav.products"]');
      expect(navProducts).toBe('Products');
    });

    test('团队页应能切换语言', async () => {
      await page.click('[data-nav="team"]');
      await page.waitForTimeout(600);
      
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const navTeam = await page.textContent('[data-i18n="nav.team"]');
      expect(navTeam).toBe('Team');
    });

    test('路由切换后按钮状态应同步', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      await page.click('[data-nav="products"]');
      await page.waitForTimeout(600);
      
      const enActive = await page.$eval('[data-lang="en"]', el => el.classList.contains('active'));
      expect(enActive).toBe(true);
    });
  });

  describe('用户反馈', () => {
    test('切换成功应显示Toast', async () => {
      await page.click('[data-lang="zh-CN"]');
      await page.waitForTimeout(600);
      
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const toast = await page.$('.language-toast');
      expect(toast).toBeTruthy();
      
      const toastText = await page.textContent('.language-toast');
      expect(toastText).toContain('English');
    });

    test('Toast应在约2.5秒后消失', async () => {
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const toast = await page.$('.language-toast');
      expect(toast).toBeTruthy();
      
      await page.waitForTimeout(3000);
      
      const toastAfter = await page.$('.language-toast');
      expect(toastAfter).toBeNull();
    });
  });

  describe('错误处理', () => {
    test('控制台应有正确日志', async () => {
      const consoleLogs = [];
      page.on('console', msg => consoleLogs.push(msg.text()));
      
      await page.click('[data-lang="en"]');
      await page.waitForTimeout(600);
      
      const hasInitLog = consoleLogs.some(log => log.includes('[i18n]'));
      expect(hasInitLog).toBe(true);
    });
  });
});

describe('浏览器兼容性测试', () => {
  test('应支持现代浏览器', async () => {
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toBeTruthy();
  });

  test('i18n功能应使用ES6+特性', async () => {
    const hasMap = await page.evaluate(() => {
      const map = new Map();
      map.set('test', 'value');
      return map.get('test') === 'value';
    });
    expect(hasMap).toBe(true);
  });

  test('应支持async/await', async () => {
    const result = await page.evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return true;
    });
    expect(result).toBe(true);
  });
});

describe('移动端兼容性', () => {
  test('移动端视图应有语言切换按钮', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    const zhBtn = await page.$('[data-lang="zh-CN"]');
    expect(zhBtn).toBeTruthy();
  });

  test('桌面端视图应有语言切换按钮', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    
    const zhBtn = await page.$('[data-lang="zh-CN"]');
    expect(zhBtn).toBeTruthy();
  });
});
