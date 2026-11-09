export function createDomSimulator() {
  const classList = new Set();
  const storage = new Map();
  const listeners = new Map();

  const mockWindow = {
    innerWidth: 1280,
    innerHeight: 800,
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, val) => storage.set(key, String(val)),
      removeItem: (key) => storage.delete(key),
      clear: () => storage.clear(),
    },
    addEventListener: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
    },
    removeEventListener: (event, handler) => {
      if (listeners.has(event)) {
        listeners.set(
          event,
          listeners.get(event).filter((h) => h !== handler)
        );
      }
    },
    dispatchEvent: (event) => {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach((h) => h(event));
      return true;
    },
  };

  const documentElement = {
    classList: {
      add: (cls) => classList.add(cls),
      remove: (cls) => classList.delete(cls),
      toggle: (cls, force) => {
        if (force !== undefined) {
          if (force) classList.add(cls);
          else classList.delete(cls);
          return force;
        }
        if (classList.has(cls)) {
          classList.delete(cls);
          return false;
        } else {
          classList.add(cls);
          return true;
        }
      },
      contains: (cls) => classList.has(cls),
      get length() {
        return classList.size;
      },
      toString: () => Array.from(classList).join(' '),
    },
  };

  function setViewport(width, height = 800) {
    mockWindow.innerWidth = width;
    mockWindow.innerHeight = height;
    mockWindow.dispatchEvent({
      type: 'resize',
      width,
      height,
    });
  }

  function simulateThemeToggle(nextTheme) {
    if (nextTheme === 'dark') {
      documentElement.classList.add('dark');
      mockWindow.localStorage.setItem('theme', 'dark');
    } else {
      documentElement.classList.remove('dark');
      mockWindow.localStorage.setItem('theme', 'light');
    }
  }

  return {
    window: mockWindow,
    documentElement,
    setViewport,
    simulateThemeToggle,
    isDarkMode: () => documentElement.classList.contains('dark'),
    getStoredTheme: () => mockWindow.localStorage.getItem('theme'),
  };
}
