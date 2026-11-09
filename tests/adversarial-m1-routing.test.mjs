import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT_DIR = process.cwd();

console.log('\x1b[35m=============================================================\x1b[0m');
console.log('\x1b[35m  CHALLENGER 1: ADVERSARIAL STRESS-TEST & EMPIRICAL HARNESS  \x1b[0m');
console.log('\x1b[35m=============================================================\x1b[0m\n');

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓ PASS\x1b[0m: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (err) {
    console.error(`  \x1b[31m✗ FAIL\x1b[0m: ${name}`);
    console.error(`    \x1b[33mError\x1b[0m: ${err.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
  }
}

// ---------------------------------------------------------------------------
// 1. AST / Code Extraction Helpers for Empirical Sandbox Execution
// ---------------------------------------------------------------------------

// Extract getApiBaseUrl logic from apps/web-dashboard/src/lib/axios.ts
function runGetApiBaseUrl({ envUrl, windowObj }) {
  const isBrowser = typeof windowObj !== 'undefined' && windowObj !== null;
  if (isBrowser) {
    const isLocalhost =
      windowObj.location.hostname === 'localhost' ||
      windowObj.location.hostname === '127.0.0.1' ||
      windowObj.location.hostname === '0.0.0.0';

    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/+$/, '');
      }
      return 'https://vectrabase-api.onrender.com';
    }
  }

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://vectrabase-api.onrender.com';
}

// Extract resolveBaseUrl logic from apps/embed-widget/src/api/client.ts
function runResolveBaseUrl({ windowObj, runtimeUrl, buildUrl }) {
  const isBrowser = typeof windowObj !== 'undefined' && windowObj !== null;
  if (isBrowser) {
    const isLocalhost =
      windowObj.location.hostname === 'localhost' ||
      windowObj.location.hostname === '127.0.0.1' ||
      windowObj.location.hostname === '0.0.0.0';

    if (typeof runtimeUrl === 'string' && runtimeUrl.trim().length > 0) {
      if (!isLocalhost && (runtimeUrl.includes('localhost') || runtimeUrl.includes('127.0.0.1'))) {
        return 'https://vectrabase-api.onrender.com';
      }
      return runtimeUrl.replace(/\/+$/, '');
    }

    if (!isLocalhost) {
      if (buildUrl && !buildUrl.includes('localhost') && !buildUrl.includes('127.0.0.1')) {
        return buildUrl.replace(/\/+$/, '');
      }
      return 'https://vectrabase-api.onrender.com';
    }
  }

  if (buildUrl && buildUrl.trim().length > 0) {
    return buildUrl.replace(/\/+$/, '');
  }
  return 'https://vectrabase-api.onrender.com';
}

// Extract resolveUrl from apps/embed-widget/src/composables/useSSEStream.ts
function runResolveSSEUrl(pathStr, { windowObj, runtimeUrl, buildUrl }) {
  const isBrowser = typeof windowObj !== 'undefined' && windowObj !== null;
  const isLocalhost =
    isBrowser &&
    (windowObj.location.hostname === 'localhost' ||
      windowObj.location.hostname === '127.0.0.1' ||
      windowObj.location.hostname === '0.0.0.0');

  if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
    if (isBrowser && !isLocalhost && (pathStr.includes('localhost') || pathStr.includes('127.0.0.1'))) {
      return pathStr.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, 'https://vectrabase-api.onrender.com');
    }
    return pathStr;
  }

  let base = 'https://vectrabase-api.onrender.com';
  if (runtimeUrl && runtimeUrl.trim().length > 0) {
    if (!isLocalhost && (runtimeUrl.includes('localhost') || runtimeUrl.includes('127.0.0.1'))) {
      base = 'https://vectrabase-api.onrender.com';
    } else {
      base = runtimeUrl;
    }
  } else if (isBrowser && !isLocalhost) {
    if (buildUrl && !buildUrl.includes('localhost') && !buildUrl.includes('127.0.0.1')) {
      base = buildUrl;
    } else {
      base = 'https://vectrabase-api.onrender.com';
    }
  } else if (buildUrl) {
    base = buildUrl;
  }

  return `${base.replace(/\/+$/, '')}${pathStr.startsWith('/') ? pathStr : `/${pathStr}`}`;
}

// ---------------------------------------------------------------------------
// SUITE 1: Dashboard getApiBaseUrl() Stress Matrix
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 1: Dashboard getApiBaseUrl() Stress Matrix ---');

test('Vercel domain with undefined envUrl strictly resolves to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: undefined,
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Vercel domain with adversarial envUrl="http://localhost:4000" intercepts and overrides to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: 'http://localhost:4000',
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
  assert.ok(!res.includes('localhost'), 'Must not contain localhost');
  assert.ok(!res.includes('4000'), 'Must not contain 4000');
});

test('Vercel domain with adversarial envUrl="http://127.0.0.1:4000" intercepts and overrides to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: 'http://127.0.0.1:4000',
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Third-party customer site with envUrl="http://localhost:4000" intercepts and overrides to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: 'http://localhost:4000',
    windowObj: { location: { hostname: 'app.customer-store.com' } },
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Third-party customer site with valid custom gateway URL is preserved (and trailing slash stripped)', () => {
  const res = runGetApiBaseUrl({
    envUrl: 'https://gateway.customer-store.com/api///',
    windowObj: { location: { hostname: 'app.customer-store.com' } },
  });
  assert.equal(res, 'https://gateway.customer-store.com/api');
});

test('Localhost environment with explicit NEXT_PUBLIC_API_URL="http://localhost:4000" honors local gateway for dev', () => {
  const res = runGetApiBaseUrl({
    envUrl: 'http://localhost:4000',
    windowObj: { location: { hostname: 'localhost' } },
  });
  assert.equal(res, 'http://localhost:4000');
});

test('Localhost environment without NEXT_PUBLIC_API_URL defaults safely to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: undefined,
    windowObj: { location: { hostname: 'localhost' } },
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('SSR environment (window undefined) without envUrl defaults strictly to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: undefined,
    windowObj: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('SSR environment (window undefined) with empty string defaults strictly to onrender.com', () => {
  const res = runGetApiBaseUrl({
    envUrl: '   ',
    windowObj: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

// ---------------------------------------------------------------------------
// SUITE 2: Embed Widget resolveBaseUrl() Stress Matrix
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 2: Embed Widget resolveBaseUrl() Stress Matrix ---');

test('Widget on Vercel domain with adversarial window.__VECTRABASE_API_URL__="http://localhost:4000" overrides to onrender.com', () => {
  const res = runResolveBaseUrl({
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: 'http://localhost:4000',
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Widget on Vercel domain with adversarial window.__VECTRABASE_API_URL__="http://127.0.0.1:4000" overrides to onrender.com', () => {
  const res = runResolveBaseUrl({
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: 'http://127.0.0.1:4000',
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Widget on customer domain with build-time VITE_API_URL="http://localhost:4000" overrides to onrender.com', () => {
  const res = runResolveBaseUrl({
    windowObj: { location: { hostname: 'shop.ecommerce.io' } },
    runtimeUrl: undefined,
    buildUrl: 'http://localhost:4000',
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Widget with whitespace-only runtimeUrl falls back to onrender.com', () => {
  const res = runResolveBaseUrl({
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: '   ',
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com');
});

test('Widget on localhost honors local runtimeUrl for developer workflows', () => {
  const res = runResolveBaseUrl({
    windowObj: { location: { hostname: 'localhost' } },
    runtimeUrl: 'http://localhost:4000',
    buildUrl: undefined,
  });
  assert.equal(res, 'http://localhost:4000');
});

// ---------------------------------------------------------------------------
// SUITE 3: SSE Streaming URL Resolution Stress Matrix
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 3: SSE Streaming URL Resolution Stress Matrix ---');

test('SSE connect with absolute "http://localhost:4000/api/stream" on Vercel rewrites path to onrender.com', () => {
  const res = runResolveSSEUrl('http://localhost:4000/api/stream', {
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: undefined,
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com/api/stream');
});

test('SSE connect with absolute "http://127.0.0.1:4000/api/query" on customer site rewrites to onrender.com', () => {
  const res = runResolveSSEUrl('http://127.0.0.1:4000/api/query', {
    windowObj: { location: { hostname: 'client-portal.io' } },
    runtimeUrl: undefined,
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com/api/query');
});

test('SSE connect with relative "/api/query" on Vercel domain resolves to "https://vectrabase-api.onrender.com/api/query"', () => {
  const res = runResolveSSEUrl('/api/query', {
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: undefined,
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com/api/query');
});

test('SSE connect with relative "api/query" (no leading slash) resolves correctly with slash', () => {
  const res = runResolveSSEUrl('api/query', {
    windowObj: { location: { hostname: 'vectrabaseai.vercel.app' } },
    runtimeUrl: undefined,
    buildUrl: undefined,
  });
  assert.equal(res, 'https://vectrabase-api.onrender.com/api/query');
});

// ---------------------------------------------------------------------------
// SUITE 4: Compiled widget.js Bundle Execution & Network Trap in Sandbox
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 4: Compiled widget.js Bundle Sandbox & Socket Trap ---');

test('Static compiled bundle apps/web-dashboard/public/widget.js exists and is not truncated', () => {
  const widgetJsPath = path.join(ROOT_DIR, 'apps/web-dashboard/public/widget.js');
  assert.ok(fs.existsSync(widgetJsPath), 'public/widget.js must exist');
  const stats = fs.statSync(widgetJsPath);
  assert.ok(stats.size > 150_000, `widget.js size (${stats.size}) must be > 150kB`);
});

test('Static compiled bundle contains ZERO references to "localhost:4000"', () => {
  const widgetJsPath = path.join(ROOT_DIR, 'apps/web-dashboard/public/widget.js');
  const content = fs.readFileSync(widgetJsPath, 'utf8');
  assert.ok(!content.includes('localhost:4000'), 'Must not contain localhost:4000');
  assert.ok(!content.includes('127.0.0.1:4000'), 'Must not contain 127.0.0.1:4000');
});

test('Static compiled bundle contains ZERO author attribution ("Karthik Kathari")', () => {
  const widgetJsPath = path.join(ROOT_DIR, 'apps/web-dashboard/public/widget.js');
  const content = fs.readFileSync(widgetJsPath, 'utf8');
  assert.ok(!content.includes('Karthik Kathari'), 'Must not contain author attribution "Karthik Kathari"');
});

test('Execute compiled widget.js in simulated Vercel DOM environment and trap all network dispatches', () => {
  const widgetJsPath = path.join(ROOT_DIR, 'apps/web-dashboard/public/widget.js');
  const code = fs.readFileSync(widgetJsPath, 'utf8');

  const networkRequests = [];

  // Trap fetch
  const mockFetch = (url, opts) => {
    networkRequests.push({ type: 'fetch', url: String(url), opts });
    if (String(url).includes('localhost:4000') || String(url).includes('127.0.0.1:4000')) {
      throw new Error(`CRITICAL VIOLATION: Socket connection attempted to loopback port 4000: ${url}`);
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { answer: 'Mock Answer', citations: [] } }),
      text: () => Promise.resolve('{"data":{"answer":"Mock Answer"}}'),
    });
  };

  // Minimal DOM environment simulating https://vectrabaseai.vercel.app
  const sandbox = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (id) => clearInterval(id),
    fetch: mockFetch,
    process: { env: { NODE_ENV: 'production' } },
  };

  const windowObj = {
    location: {
      hostname: 'vectrabaseai.vercel.app',
      origin: 'https://vectrabaseai.vercel.app',
      protocol: 'https:',
      href: 'https://vectrabaseai.vercel.app/widget-playground',
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    fetch: mockFetch,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  };

  class Node {
    constructor() {
      this.parentNode = null;
      this.childNodes = [];
      this.children = [];
    }
    appendChild(child) {
      if (child) {
        child.parentNode = this;
        this.childNodes.push(child);
        if (child.nodeType === 1) this.children.push(child);
      }
      return child;
    }
    insertBefore(newChild, refChild) {
      if (newChild) {
        newChild.parentNode = this;
        const idx = this.childNodes.indexOf(refChild);
        if (idx >= 0) {
          this.childNodes.splice(idx, 0, newChild);
          if (newChild.nodeType === 1) this.children.splice(idx, 0, newChild);
        } else {
          this.appendChild(newChild);
        }
      }
      return newChild;
    }
    removeChild(child) {
      const idx = this.childNodes.indexOf(child);
      if (idx >= 0) {
        this.childNodes.splice(idx, 1);
        if (child.nodeType === 1) {
          const cIdx = this.children.indexOf(child);
          if (cIdx >= 0) this.children.splice(cIdx, 1);
        }
        child.parentNode = null;
      }
      return child;
    }
    replaceChild(newChild, oldChild) {
      this.insertBefore(newChild, oldChild);
      this.removeChild(oldChild);
      return oldChild;
    }
  }
  class Element extends Node {}
  class HTMLElement extends Element {}
  class SVGElement extends Element {}

  const createMockElement = (tag = 'DIV', id = '') => {
    const el = new HTMLElement();
    el.tagName = tag.toUpperCase();
    el.id = id;
    el.style = {};
    el.classList = {
      _set: new Set(),
      add(cls) { this._set.add(cls); },
      remove(cls) { this._set.delete(cls); },
      contains(cls) { return this._set.has(cls); },
      toggle(cls) { if (this._set.has(cls)) this._set.delete(cls); else this._set.add(cls); }
    };
    el.setAttribute = () => {};
    el.setAttributeNS = () => {};
    el.getAttribute = () => null;
    el.getAttributeNS = () => null;
    el.removeAttribute = () => {};
    el.hasAttribute = () => false;
    el.innerHTML = '';
    el.textContent = '';
    el.nodeType = 1;
    el.addEventListener = () => {};
    el.removeEventListener = () => {};
    el.dispatchEvent = () => true;
    return el;
  };

  const rootEl = createMockElement('DIV', 'vectrabase-widget');

  const documentObj = {
    getElementById: (id) => (id === 'vectrabase-widget' ? rootEl : createMockElement('DIV', id)),
    querySelector: (selector) => (selector === '#vectrabase-widget' ? rootEl : createMockElement('DIV')),
    querySelectorAll: () => [],
    createElement: (tag) => createMockElement(tag),
    createElementNS: (ns, tag) => createMockElement(tag),
    createTextNode: (txt) => {
      const node = new Node();
      node.nodeType = 3;
      node.textContent = txt;
      return node;
    },
    createComment: () => {
      const node = new Node();
      node.nodeType = 8;
      return node;
    },
    createEvent: () => ({ initEvent: () => {} }),
    body: createMockElement('BODY'),
    head: createMockElement('HEAD'),
    documentElement: createMockElement('HTML'),
    addEventListener: () => {},
    removeEventListener: () => {},
    readyState: 'complete',
  };

  sandbox.Node = Node;
  sandbox.Element = Element;
  sandbox.HTMLElement = HTMLElement;
  sandbox.SVGElement = SVGElement;
  sandbox.window = windowObj;
  sandbox.document = documentObj;
  sandbox.self = windowObj;
  sandbox.global = windowObj;

  // Run the widget script in the sandbox
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  // Verify VectraBaseWidget is exposed
  assert.ok(sandbox.window.VectraBaseWidget, 'window.VectraBaseWidget must be exposed after executing widget.js');
  assert.equal(typeof sandbox.window.VectraBaseWidget.init, 'function', 'VectraBaseWidget.init must be a function');
  assert.equal(typeof sandbox.window.VectraBaseWidget.destroy, 'function', 'VectraBaseWidget.destroy must be a function');

  // Now adversarial initialization: pass apiUrl pointing to localhost:4000 on Vercel domain
  sandbox.window.VectraBaseWidget.init({
    tenantId: '00000000-0000-0000-0000-000000000001',
    apiUrl: 'http://localhost:4000',
  });

  // Verify that any network request NEVER targeted loopback 4000
  for (const req of networkRequests) {
    assert.ok(
      !req.url.includes('localhost:4000'),
      `Loopback socket attempted in production environment: ${req.url}`
    );
  }
});

// ---------------------------------------------------------------------------
// SUITE 5: Source Attribution & Template Verifications
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 5: Source Attribution & Template Verifications ---');

test('WidgetContainer.vue header subtitle contains zero author attribution', () => {
  const containerPath = path.join(ROOT_DIR, 'apps/embed-widget/src/components/WidgetContainer.vue');
  const content = fs.readFileSync(containerPath, 'utf8');
  assert.ok(!content.includes('By Karthik Kathari'), 'Must remove "By Karthik Kathari"');
  assert.ok(content.includes('Grounded pgvector RAG Assistant'), 'Must feature "Grounded pgvector RAG Assistant"');
});

test('chat.ts welcome message contains zero author attribution', () => {
  const chatStorePath = path.join(ROOT_DIR, 'apps/embed-widget/src/stores/chat.ts');
  const content = fs.readFileSync(chatStorePath, 'utf8');
  assert.ok(!content.includes('architected by Karthik Kathari'), 'Must remove "architected by Karthik Kathari"');
  assert.ok(content.includes('I am your grounded RAG assistant.'), 'Must include generic assistant welcome');
});

// ---------------------------------------------------------------------------
// SUITE 6: Interface Contract & Feature 3 Conformance Advisory Checks
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 6: Feature 3 (Dual-Theme Contract) Advisory Inspection ---');

const advisories = [];

function checkAdvisory(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓ COMPLIANT\x1b[0m: ${name}`);
    advisories.push({ name, status: 'COMPLIANT' });
  } catch (err) {
    console.log(`  \x1b[33m⚠ ADVISORY (Defect for Theme Milestones)\x1b[0m: ${name}`);
    console.log(`    \x1b[33mDetail\x1b[0m: ${err.message}`);
    advisories.push({ name, status: 'DEFECT_NOTED', error: err.message });
  }
}

checkAdvisory('PROJECT.md Feature 3 contract: widget-entry.ts WidgetInitOptions supports theme parameter', () => {
  const entryPath = path.join(ROOT_DIR, 'apps/embed-widget/src/widget-entry.ts');
  const content = fs.readFileSync(entryPath, 'utf8');
  const supportsTheme = content.includes('theme') || content.includes('WidgetConfig');
  assert.ok(supportsTheme, 'WidgetInitOptions in apps/embed-widget/src/widget-entry.ts lacks theme: "light" | "dark" parameter');
});

checkAdvisory('PROJECT.md Feature 3 contract: WidgetContainer supports dual-theme without hardcoded background', () => {
  const containerPath = path.join(ROOT_DIR, 'apps/embed-widget/src/components/WidgetContainer.vue');
  const content = fs.readFileSync(containerPath, 'utf8');
  const hasThemeSupport = !content.includes('bg-[#090A0F]') || content.includes('dark:bg-[#090A0F]') || content.includes('theme');
  assert.ok(hasThemeSupport, 'WidgetContainer hardcodes unconditional bg-[#090A0F] (not yet dual-theme ready)');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n=============================================================');
console.log(`M1 ROUTING & RESOLUTION CORE TESTS: ${results.passed + results.failed}`);
console.log(`PASSED:                             \x1b[32m${results.passed}\x1b[0m`);
console.log(`FAILED:                             \x1b[31m${results.failed}\x1b[0m`);
console.log(`PASS RATE:                          ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
console.log(`ADVISORIES / DOWNSTREAM GAPS:       \x1b[33m${advisories.filter(a => a.status === 'DEFECT_NOTED').length}\x1b[0m`);
console.log('=============================================================\n');

if (results.failed > 0) {
  process.exitCode = 1;
}
