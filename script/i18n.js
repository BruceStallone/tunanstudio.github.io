const SUPPORTED_LANGUAGES = ['zh-CN', 'en'];
const LANGUAGE_FILES = {
  'zh-CN': 'lang.json',
  'en': 'lang-en.json'
};

const I18nEventType = {
  INITIALIZED: 'initialized',
  LANGUAGE_BEFORE_SWITCH: 'beforeSwitch',
  LANGUAGE_SWITCHED: 'switched',
  LOAD_ERROR: 'loadError'
};

class I18nEngine {
  constructor() {
    this.currentLang = 'zh-CN';
    this.translations = {};
    this.defaultLang = 'zh-CN';
    this.listeners = new Map();
    this._isInitialized = false;
    this._isLoading = false;
    this._loadPromise = null;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get isLoading() {
    return this._isLoading;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[i18n] Event listener error for ${event}:`, error);
        }
      });
    }
  }

  async init() {
    if (this._isInitialized) {
      console.log('[i18n] Already initialized');
      return this;
    }

    console.log('[i18n] Initializing...');
    this._isLoading = true;

    try {
      const savedLang = localStorage.getItem('tunan-lang');

      if (savedLang && this.isSupported(savedLang)) {
        this.currentLang = savedLang;
        console.log(`[i18n] Using saved language: ${savedLang}`);
      } else {
        const browserLang = navigator.language || navigator.languages?.[0];
        this.currentLang = this.detectLanguage(browserLang);
        console.log(`[i18n] Detected browser language: ${browserLang}, using: ${this.currentLang}`);
      }

      await this._loadLanguageFile(this.currentLang);
      this.applyTranslations();
      this._isInitialized = true;
      this._isLoading = false;
      
      this.emit(I18nEventType.INITIALIZED, { lang: this.currentLang });
      console.log('[i18n] Initialization complete');
      
      return this;
    } catch (error) {
      console.error('[i18n] Initialization failed:', error);
      this._isLoading = false;
      this.translations = {};
      throw error;
    }
  }

  isSupported(lang) {
    return SUPPORTED_LANGUAGES.includes(lang);
  }

  detectLanguage(browserLang) {
    if (!browserLang) return this.defaultLang;

    const langCode = browserLang.toLowerCase();

    if (langCode.startsWith('zh')) return 'zh-CN';
    if (langCode.startsWith('en')) return 'en';

    return this.defaultLang;
  }

  async _loadLanguageFile(lang) {
    const filename = LANGUAGE_FILES[lang] || LANGUAGE_FILES[this.defaultLang];
    
    const response = await fetch(`Text/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    
    this.translations = await response.json();
    return this.translations;
  }

  async loadLanguage(lang) {
    if (this._isLoading) {
      console.warn('[i18n] Already loading, waiting...');
      return this._loadPromise;
    }

    this._isLoading = true;
    this._loadPromise = this._loadLanguageFile(lang)
      .then(translations => {
        this.translations = translations;
        this._isLoading = false;
        return translations;
      })
      .catch(error => {
        this._isLoading = false;
        throw error;
      });

    return this._loadPromise;
  }

  async switchLanguage(lang) {
    if (!this.isSupported(lang)) {
      console.warn(`[i18n] Unsupported language: ${lang}`);
      lang = this.defaultLang;
    }

    if (lang === this.currentLang) {
      console.log(`[i18n] Already on language: ${lang}`);
      return;
    }

    console.log(`[i18n] Switching from ${this.currentLang} to ${lang}`);
    this.emit(I18nEventType.LANGUAGE_BEFORE_SWITCH, { 
      from: this.currentLang, 
      to: lang 
    });

    try {
      this._isLoading = true;
      
      await this._loadLanguageFile(lang);
      this.currentLang = lang;
      
      try {
        localStorage.setItem('tunan-lang', lang);
      } catch (storageError) {
        console.warn('[i18n] Could not save to localStorage:', storageError);
      }
      
      this.applyTranslations();
      this._isLoading = false;
      
      this.emit(I18nEventType.LANGUAGE_SWITCHED, { lang });
      console.log(`[i18n] Switched to ${lang} successfully`);
      
    } catch (error) {
      this._isLoading = false;
      console.error(`[i18n] Failed to switch to ${lang}:`, error);
      this.emit(I18nEventType.LOAD_ERROR, { lang, error });
      throw error;
    }
  }

  get(key, fallback = null) {
    if (!this.translations || Object.keys(this.translations).length === 0) {
      console.warn('[i18n] No translations loaded');
      return fallback || key;
    }

    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return value || fallback || key;
  }

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    let appliedCount = 0;

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.get(key);

      if (translation && translation !== key) {
        if (element.tagName === 'INPUT' && element.type === 'placeholder') {
          element.placeholder = translation;
        } else if (element.hasAttribute('data-i18n-attr')) {
          const attr = element.getAttribute('data-i18n-attr');
          element.setAttribute(attr, translation);
        } else {
          element.textContent = translation;
        }
        appliedCount++;
      }
    });

    document.querySelectorAll('[data-i18n-cn]').forEach(element => {
      const key = element.getAttribute('data-i18n-cn');
      element.textContent = this.get(key);
    });

    document.querySelectorAll('[data-i18n-en]').forEach(element => {
      const key = element.getAttribute('data-i18n-en');
      element.textContent = this.get(key);
    });

    console.log(`[i18n] Applied ${appliedCount} translations`);
    return appliedCount;
  }

  getCurrentLang() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
  }

  destroy() {
    this.listeners.clear();
    this.translations = {};
    this._isInitialized = false;
    console.log('[i18n] Destroyed');
  }
}

window.I18nEngine = I18nEngine;
window.i18n = new I18nEngine();
window.I18nEventType = I18nEventType;
