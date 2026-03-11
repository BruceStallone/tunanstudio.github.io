class Router {
  constructor() {
    this.routes = new Map();
    this.currentPath = window.location.pathname;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    
    window.addEventListener('popstate', (e) => {
      this.handleRouteChange();
    });
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  navigate(path, options = {}) {
    const shouldReplace = options.replace || false;
    
    if (shouldReplace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    
    this.handleRouteChange();
  }

  handleRouteChange() {
    const path = window.location.pathname;
    this.currentPath = path;
    
    this.beforeEachHooks.forEach(hook => {
      if (hook && typeof hook === 'function') {
        hook(path);
      }
    });

    const route = this.routes.get(path) || this.routes.get('/');
    
    if (route && typeof route === 'function') {
      route();
    } else {
      this.handle404();
    }

    this.afterEachHooks.forEach(hook => {
      if (hook && typeof hook === 'function') {
        hook(path);
      }
    });

    this.scrollToTop();
  }

  handle404() {
    console.warn(`Route not found: ${this.currentPath}, redirecting to home`);
    this.navigate('/', { replace: true });
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
    return this;
  }

  afterEach(hook) {
    this.afterEachHooks.push(hook);
    return this;
  }

  getCurrentPath() {
    return this.currentPath;
  }

  init() {
    this.handleRouteChange();
  }
}

window.router = new Router();
