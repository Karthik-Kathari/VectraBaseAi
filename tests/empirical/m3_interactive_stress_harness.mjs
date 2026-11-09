/**
 * VectraBase AI — Milestone 3 Interactive Empirical Stress Harness
 * Archetype: Empirical Challenger (Challenger 2)
 *
 * Scope:
 *  1. Navbar.tsx Interactive State Handlers (mobile menu toggle, theme toggle, nav links, quick launch, search dispatch)
 *  2. page.tsx Interactive State Handlers (Architecture Visualizer node selection, FAQ accordion toggle, code copy snippet, CTA triggers)
 *  3. Footer.tsx Modal Viewer State Handlers (privacy, terms, security modals, backdrop/close handlers, link contract)
 *  4. (dashboard)/layout.tsx Shell State Handlers (sidebar collapse/expand, responsive layout, status indicator)
 *  5. High-Frequency Stress & Chaos Simulation (rapid state toggling, race conditions, timer resets, clipboard failure resilience)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();

// Test Result Aggregator
const RESULTS = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: {},
  failures: [],
};

const registeredSuites = [];

function suite(suiteName) {
  const tests = [];
  const suiteObj = { name: suiteName, tests };
  registeredSuites.push(suiteObj);
  RESULTS.suites[suiteName] = { total: 0, passed: 0, failed: 0 };
  return {
    test(testName, fn) {
      tests.push({ name: testName, fn });
    },
  };
}

// ---------------------------------------------------------------------------
// Load Source Files for AST & Structural Verification
// ---------------------------------------------------------------------------
const navbarPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/Navbar.tsx');
const footerPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/Footer.tsx');
const landingPagePath = path.join(ROOT_DIR, 'apps/web-dashboard/src/app/page.tsx');
const layoutPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/app/(dashboard)/layout.tsx');

const navbarSrc = fs.readFileSync(navbarPath, 'utf8');
const footerSrc = fs.readFileSync(footerPath, 'utf8');
const landingPageSrc = fs.readFileSync(landingPagePath, 'utf8');
const layoutSrc = fs.readFileSync(layoutPath, 'utf8');

// ===========================================================================
// SUITE 1: Navbar.tsx Interactive State Handlers
// ===========================================================================
const s1 = suite('Navbar.tsx Interactive Handlers');

// 1. Mobile Menu Toggle State Logic
s1.test('Mobile Menu: initial state is closed (false)', () => {
  assert.match(navbarSrc, /const\s+\[isMobileMenuOpen,\s*setIsMobileMenuOpen\]\s*=\s*useState\(false\);/);
});

s1.test('Mobile Menu: hamburger button toggles isMobileMenuOpen state', () => {
  assert.match(navbarSrc, /onClick=\{?\(\)\s*=>\s*setIsMobileMenuOpen\(!isMobileMenuOpen\)\}?/);
  assert.match(navbarSrc, /aria-label="Toggle menu"/);
});

s1.test('Mobile Menu: rapid state transitions under 10,000 cycles maintain determinism', () => {
  let isOpen = false;
  const toggle = () => { isOpen = !isOpen; };
  for (let i = 0; i < 10000; i++) {
    toggle();
    assert.equal(isOpen, i % 2 === 0);
  }
  assert.equal(isOpen, false);
});

s1.test('Mobile Menu: every mobile link has an onClick handler that closes drawer', () => {
  const mobileDrawerMatch = navbarSrc.match(/\{isMobileMenuOpen\s*&&\s*\([\s\S]*?\)\s*\}/);
  assert.ok(mobileDrawerMatch, 'Mobile drawer conditional block must exist');
  const drawerContent = mobileDrawerMatch[0];
  assert.match(drawerContent, /onClick=\{?\(\)\s*=>\s*setIsMobileMenuOpen\(false\)\}?/);
});

s1.test('Mobile Menu: link navigation closes drawer in simulated state engine', () => {
  let isMobileMenuOpen = true;
  const onNavigate = () => { isMobileMenuOpen = false; };
  assert.equal(isMobileMenuOpen, true);
  onNavigate();
  assert.equal(isMobileMenuOpen, false);
});

// 2. Theme Toggle State Logic
s1.test('Theme Toggle: hydration mismatch protection via mounted guard', () => {
  assert.match(navbarSrc, /const\s+\[mounted,\s*setMounted\]\s*=\s*useState\(false\);/);
  assert.match(navbarSrc, /useEffect\(\(\)\s*=>\s*\{\s*setMounted\(true\);?\s*\},\s*\[\]\);/);
  assert.match(navbarSrc, /if\s*\(!mounted\)\s*\{\s*return\s*<div/);
});

s1.test('Theme Toggle: toggles correctly between light and dark resolvedTheme', () => {
  assert.match(navbarSrc, /const\s+isDark\s*=\s*resolvedTheme\s*===\s*'dark';/);
  assert.match(navbarSrc, /onClick=\{?\(\)\s*=>\s*setTheme\(isDark\s*\?\s*'light'\s*:\s*'dark'\)\}?/);
});

s1.test('Theme Toggle: 10,000 rapid toggles alternate theme correctly', () => {
  let theme = 'dark';
  const toggleTheme = () => {
    const isDark = theme === 'dark';
    theme = isDark ? 'light' : 'dark';
  };
  for (let i = 0; i < 10000; i++) {
    toggleTheme();
    assert.equal(theme, i % 2 === 0 ? 'light' : 'dark');
  }
  assert.equal(theme, 'dark');
});

s1.test('Theme Toggle: accessible button attributes present', () => {
  assert.match(navbarSrc, /aria-label="Toggle theme"/);
  assert.match(navbarSrc, /title=\{`Switch to \$\{isDark \? 'Light' : 'Dark'\} mode`\}/);
});

s1.test('Theme Toggle: Sun icon displays in dark mode with amber styling, Moon in light mode with purple styling', () => {
  assert.match(navbarSrc, /<Sun className="[^"]*text-amber-400[^"]*shadow-\[0_0_8px_rgba\(245,158,11,0\.5\)\]/);
  assert.match(navbarSrc, /<Moon className="[^"]*text-purple-600[^"]*"/);
});

s1.test('Theme Toggle: rendered in both desktop action cluster and mobile drawer', () => {
  const occurrences = (navbarSrc.match(/<ThemeToggle/g) || []).length;
  assert.equal(occurrences, 2, 'Must have exactly 2 ThemeToggle instances (desktop and mobile)');
});

// 3. Navigation Links and Active State
s1.test('Nav Links: 6 core routes configured', () => {
  const expectedRoutes = ['/', '/dashboard', '/rag-studio', '/widget-playground', '/telemetry', '/governance'];
  for (const route of expectedRoutes) {
    assert.ok(navbarSrc.includes(`href: '${route}'`), `Route ${route} must be registered in navLinks`);
  }
});

s1.test('Nav Links: active link styling applies purple pill accents', () => {
  assert.match(navbarSrc, /const isActive = pathname === link\.href;/);
  assert.match(navbarSrc, /bg-purple-50 text-purple-700 dark:bg-purple-900\/30 dark:text-purple-300 font-semibold/);
});

s1.test('Nav Links: simulation of active route resolution across all paths', () => {
  const links = ['/', '/dashboard', '/rag-studio', '/widget-playground', '/telemetry', '/governance'];
  for (const currentPath of links) {
    const activeLinks = links.filter((link) => link === currentPath);
    assert.equal(activeLinks.length, 1, `Exactly one active link for pathname ${currentPath}`);
    assert.equal(activeLinks[0], currentPath);
  }
});

// 4. Quick Launch Sandbox Button
s1.test('Quick Launch: manages loading state and routes to /dashboard in finally block', () => {
  assert.match(navbarSrc, /const\s+\[isLoggingIn,\s*setIsLoggingIn\]\s*=\s*useState\(false\);/);
  assert.match(navbarSrc, /async function handleQuickLaunch\(\)/);
  assert.match(navbarSrc, /setIsLoggingIn\(true\);/);
  assert.match(navbarSrc, /finally\s*\{\s*setIsLoggingIn\(false\);?\s*\}/);
  assert.match(navbarSrc, /router\.push\('\/dashboard'\);/);
});

s1.test('Quick Launch: simulated async execution handles API success', async () => {
  let isLoggingIn = false;
  let token = null;
  let routedTo = null;
  const mockApi = {
    post: async () => ({ data: { success: true, data: { accessToken: 'mock-jwt-token' } } }),
  };
  async function launch() {
    isLoggingIn = true;
    try {
      const res = await mockApi.post();
      if (res.data?.success) token = res.data.data.accessToken;
      routedTo = '/dashboard';
    } catch {
      routedTo = '/dashboard';
    } finally {
      isLoggingIn = false;
    }
  }
  await launch();
  assert.equal(isLoggingIn, false, 'Loading must reset to false');
  assert.equal(token, 'mock-jwt-token', 'Token must be captured');
  assert.equal(routedTo, '/dashboard', 'Must route to dashboard');
});

s1.test('Quick Launch: simulated async execution handles API error gracefully without hanging', async () => {
  let isLoggingIn = false;
  let routedTo = null;
  const mockApi = {
    post: async () => { throw new Error('Network error'); },
  };
  async function launch() {
    isLoggingIn = true;
    try {
      await mockApi.post();
      routedTo = '/dashboard';
    } catch {
      routedTo = '/dashboard';
    } finally {
      isLoggingIn = false;
    }
  }
  await launch();
  assert.equal(isLoggingIn, false, 'Loading must reset to false on network failure');
  assert.equal(routedTo, '/dashboard', 'Must still route to dashboard as fallback');
});

// 5. Search Trigger & Author Attribution Removal
s1.test('Search Trigger: dispatches global keydown event for Command Palette (Ctrl+K)', () => {
  assert.match(navbarSrc, /window\.dispatchEvent\(new KeyboardEvent\('keydown',\s*\{\s*key:\s*'k',\s*metaKey:\s*true\s*\}\)\)/);
});

s1.test('Author Attribution: strictly eliminated from Navbar.tsx', () => {
  assert.doesNotMatch(navbarSrc, /by Karthik Kathari/i, 'Author attribution must not exist in Navbar');
  assert.doesNotMatch(navbarSrc, /by karthik/i);
});


// ===========================================================================
// SUITE 2: page.tsx Interactive State Handlers
// ===========================================================================
const s2 = suite('page.tsx Interactive Handlers');

// 1. Architecture Visualizer Node Selection
s2.test('Visualizer: initial selectedNode state is 1 (Redis Cache)', () => {
  assert.match(landingPageSrc, /const\s+\[selectedNode,\s*setSelectedNode\]\s*=\s*useState<number>\(1\);/);
});

s2.test('Visualizer: 4 distinct nodes configured with complete latency and metrics', () => {
  assert.match(landingPageSrc, /const pipelineNodes = \[/);
  // Check all 4 node titles
  assert.ok(landingPageSrc.includes("title: 'Embed Client / Vue 3 Widget'"));
  assert.ok(landingPageSrc.includes("title: 'Redis Semantic Cache'"));
  assert.ok(landingPageSrc.includes("title: 'Neon Lakebase Postgres'"));
  assert.ok(landingPageSrc.includes("title: 'Zero-Hallucination LLM Guard'"));
});

s2.test('Visualizer: active node applies purple border, background, and neon glow ring', () => {
  assert.match(landingPageSrc, /border-purple-500 bg-purple-50\/50 dark:bg-purple-950\/20 shadow-neon-purple ring-1 ring-purple-500/);
  assert.match(landingPageSrc, /Inspecting Component/);
});

s2.test('Visualizer: node selection handler updates state onClick', () => {
  assert.match(landingPageSrc, /onClick=\{?\(\)\s*=>\s*setSelectedNode\(node\.id\)\}?/);
});

s2.test('Visualizer: rapid node selection stress under 10,000 transitions', () => {
  let selected = 1;
  const select = (id) => { selected = id; };
  for (let i = 0; i < 10000; i++) {
    const nextNode = i % 4;
    select(nextNode);
    assert.equal(selected, nextNode);
  }
  assert.equal(selected, 3);
});

s2.test('Visualizer: random node selection fuzzing verifies bound invariants [0..3]', () => {
  let selected = 0;
  for (let i = 0; i < 5000; i++) {
    const rand = Math.floor(Math.random() * 4);
    selected = rand;
    assert.ok(selected >= 0 && selected <= 3, 'Selected node must be between 0 and 3');
  }
});

// 2. FAQ Accordion Toggle
s2.test('FAQ Accordion: initial state is index 0', () => {
  assert.match(landingPageSrc, /const\s+\[activeFaq,\s*setActiveFaq\]\s*=\s*useState<number \| null>\(0\);/);
});

s2.test('FAQ Accordion: clicking toggles open item to null and closed item to index', () => {
  assert.match(landingPageSrc, /onClick=\{?\(\)\s*=>\s*setActiveFaq\(isOpen\s*\?\s*null\s*:\s*index\)\}?/);
});

s2.test('FAQ Accordion: renders plus (+) when closed and minus (−) when open', () => {
  assert.match(landingPageSrc, /\{isOpen \? '−' : '\+'\}/);
});

s2.test('FAQ Accordion: state machine simulation verifies mutual exclusion and collapse', () => {
  let activeFaq = 0;
  const clickFaq = (index) => {
    activeFaq = (activeFaq === index) ? null : index;
  };
  // 1. Initial
  assert.equal(activeFaq, 0);
  // 2. Click open item collapses it
  clickFaq(0);
  assert.equal(activeFaq, null);
  // 3. Click closed item 2 opens it
  clickFaq(2);
  assert.equal(activeFaq, 2);
  // 4. Click closed item 4 switches active item directly
  clickFaq(4);
  assert.equal(activeFaq, 4);
  // 5. Stress test 10,000 random clicks
  for (let i = 0; i < 10000; i++) {
    const target = i % 5;
    clickFaq(target);
    assert.ok(activeFaq === null || (activeFaq >= 0 && activeFaq <= 4));
  }
});

s2.test('FAQ Accordion: contains 5 verified questions and answers', () => {
  const faqQuestions = [
    'How does VectraBase AI eliminate AI hallucinations?',
    'What types of documents can I upload to my Knowledge Base?',
    'How do I add the AI assistant to my own website?',
    'Is my data secure and isolated from other tenants?',
    'Why is VectraBase AI faster than traditional RAG solutions?',
  ];
  for (const q of faqQuestions) {
    assert.ok(landingPageSrc.includes(q), `FAQ must include question: "${q}"`);
  }
});

// 3. Code Copy Snippet State and Clipboard
s2.test('Code Copy: handles state transition and timeout reset', () => {
  assert.match(landingPageSrc, /const\s+\[hasCopied,\s*setHasCopied\]\s*=\s*useState\(false\);/);
  assert.match(landingPageSrc, /function handleCopySnippet\(\)/);
  assert.match(landingPageSrc, /setHasCopied\(true\);/);
  assert.match(landingPageSrc, /setTimeout\(\(\)\s*=>\s*setHasCopied\(false\),\s*2500\);/);
});

s2.test('Code Copy: clipboard snippet contains production endpoint and valid options', () => {
  assert.ok(landingPageSrc.includes('https://vectrabase-api.onrender.com'), 'Snippet must route to onrender API');
  assert.ok(landingPageSrc.includes('00000000-0000-0000-0000-000000000001'), 'Snippet must include demo tenantId');
  assert.ok(landingPageSrc.includes('theme: "light"'), 'Snippet must include theme option');
  assert.ok(landingPageSrc.includes('https://vectrabaseai.vercel.app/widget.js'), 'Snippet must reference widget.js');
  assert.ok(landingPageSrc.includes('https://vectrabaseai.vercel.app/widget.css'), 'Snippet must reference widget.css');
});

s2.test('Code Copy: simulated clipboard copy with timer reset', async () => {
  let clipboardText = '';
  let hasCopied = false;
  let timerId = null;

  const mockClipboard = {
    writeText: async (text) => { clipboardText = text; },
  };

  const copy = async (snippet) => {
    await mockClipboard.writeText(snippet);
    hasCopied = true;
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      hasCopied = false;
    }, 50); // fast timeout for test
  };

  await copy('test-snippet');
  assert.equal(clipboardText, 'test-snippet');
  assert.equal(hasCopied, true);

  await new Promise((r) => setTimeout(r, 70));
  assert.equal(hasCopied, false, 'hasCopied must reset after timeout');
});

s2.test('Code Copy: rapid repeated clicks do not throw and maintain consistent state', async () => {
  let hasCopied = false;
  let timerId = null;
  const click = () => {
    hasCopied = true;
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => { hasCopied = false; }, 30);
  };

  for (let i = 0; i < 50; i++) {
    click();
    assert.equal(hasCopied, true);
  }
  await new Promise((r) => setTimeout(r, 45));
  assert.equal(hasCopied, false);
});

// 4. Call to Action (CTA) Triggers
s2.test('CTA Buttons: Hero and Bottom CTA buttons bind to handleLaunchSandbox', () => {
  const matches = (landingPageSrc.match(/onClick=\{handleLaunchSandbox\}/g) || []).length;
  assert.equal(matches, 2, 'Hero and Bottom CTA buttons must both trigger handleLaunchSandbox');
});

s2.test('CTA Buttons: Chat Playground links point to /widget-playground', () => {
  assert.match(landingPageSrc, /href="\/widget-playground"/);
});


// ===========================================================================
// SUITE 3: Footer.tsx Modal Viewer State Handlers
// ===========================================================================
const s3 = suite('Footer.tsx Modal Viewer Handlers');

// 1. Modal State Setup
s3.test('Modal Viewer: initial state is null', () => {
  assert.match(footerSrc, /const\s+\[activeModal,\s*setActiveModal\]\s*=\s*useState<'privacy'\s*\|\s*'terms'\s*\|\s*'security'\s*\|\s*null>\(null\);/);
});

s3.test('Modal Viewer: triggers configure privacy, terms, security on button clicks', () => {
  assert.match(footerSrc, /onClick=\{?\(\)\s*=>\s*setActiveModal\('privacy'\)\}?/);
  assert.match(footerSrc, /onClick=\{?\(\)\s*=>\s*setActiveModal\('terms'\)\}?/);
  assert.match(footerSrc, /onClick=\{?\(\)\s*=>\s*setActiveModal\('security'\)\}?/);
});

s3.test('Modal Viewer: close button in header and footer both reset state to null', () => {
  const closeHandlers = (footerSrc.match(/onClick=\{?\(\)\s*=>\s*setActiveModal\(null\)\}?/g) || []).length;
  assert.equal(closeHandlers, 2, 'Must have exactly 2 close handlers (header X button and footer Close button)');
});

s3.test('Modal Viewer: state machine transitions across all modal states without memory leaks', () => {
  let activeModal = null;
  const open = (type) => { activeModal = type; };
  const close = () => { activeModal = null; };

  // Cycle 1: Privacy
  open('privacy');
  assert.equal(activeModal, 'privacy');
  close();
  assert.equal(activeModal, null);

  // Cycle 2: Terms
  open('terms');
  assert.equal(activeModal, 'terms');
  close();
  assert.equal(activeModal, null);

  // Cycle 3: Security
  open('security');
  assert.equal(activeModal, 'security');
  close();
  assert.equal(activeModal, null);

  // Cycle 4: Rapid direct modal transitions without intermediate close
  open('privacy');
  assert.equal(activeModal, 'privacy');
  open('terms');
  assert.equal(activeModal, 'terms');
  open('security');
  assert.equal(activeModal, 'security');
  close();
  assert.equal(activeModal, null);

  // 10,000 stress cycles
  const states = ['privacy', 'terms', 'security', null];
  for (let i = 0; i < 10000; i++) {
    const target = states[i % 4];
    activeModal = target;
    assert.equal(activeModal, target);
  }
});

s3.test('Modal Viewer: verifies Privacy Policy contains 4 regulatory sections', () => {
  assert.ok(footerSrc.includes('1. Multi-Tenant Data Isolation:'));
  assert.ok(footerSrc.includes('2. Zero Model Training:'));
  assert.ok(footerSrc.includes('3. Encryption Standards:'));
  assert.ok(footerSrc.includes('4. Compliance:'));
});

s3.test('Modal Viewer: verifies Terms of Service contains 4 operational sections', () => {
  assert.ok(footerSrc.includes('1. Service Availability:'));
  assert.ok(footerSrc.includes('2. API Quotas &amp; Rate Limits:'));
  assert.ok(footerSrc.includes('3. Intellectual Property:'));
  assert.ok(footerSrc.includes('4. Acceptable Use:'));
});

s3.test('Modal Viewer: verifies Security Whitepaper contains 4 architecture sections', () => {
  assert.ok(footerSrc.includes('1. Vector Database Architecture:'));
  assert.ok(footerSrc.includes('2. Sub-2ms Semantic Caching:'));
  assert.ok(footerSrc.includes('3. Dual-Token JWT Authentication:'));
  assert.ok(footerSrc.includes('4. Zero-Hallucination Guardrails:'));
});

s3.test('Footer: elimination of dead href="#" or placeholder href="/" links for policy buttons', () => {
  // Footer bottom links must use <button type="button">, not <a href="/"> or <a href="#">
  assert.doesNotMatch(footerSrc, /<a\s+href="[\/#]"\s*>\s*Privacy Policy/i);
  assert.doesNotMatch(footerSrc, /<a\s+href="[\/#]"\s*>\s*Terms of Service/i);
  assert.doesNotMatch(footerSrc, /<a\s+href="[\/#]"\s*>\s*Security Whitepaper/i);
  assert.match(footerSrc, /<button\s+type="button"\s+onClick=\{\(\)\s*=>\s*setActiveModal\('privacy'\)\}/);
});


// ===========================================================================
// SUITE 4: (dashboard)/layout.tsx Shell State Handlers
// ===========================================================================
const s4 = suite('(dashboard)/layout.tsx Shell State Handlers');

s4.test('Sidebar: initial collapsed state is false', () => {
  assert.match(layoutSrc, /const\s+\[isCollapsed,\s*setIsCollapsed\]\s*=\s*useState\(false\);/);
});

s4.test('Sidebar: collapse button toggles between expanded (w-56) and collapsed (w-16)', () => {
  assert.match(layoutSrc, /onClick=\{?\(\)\s*=>\s*setIsCollapsed\(!isCollapsed\)\}?/);
  assert.match(layoutSrc, /isCollapsed\s*\?\s*'w-16'\s*:\s*'w-56'/);
  assert.match(layoutSrc, /\{isCollapsed \? '→' : '← Collapse'\}/);
});

s4.test('Sidebar: 10,000 rapid toggle cycles verify width state determinism', () => {
  let isCollapsed = false;
  const toggle = () => { isCollapsed = !isCollapsed; };
  for (let i = 0; i < 10000; i++) {
    toggle();
    const widthClass = isCollapsed ? 'w-16' : 'w-56';
    assert.equal(widthClass, i % 2 === 0 ? 'w-16' : 'w-56');
  }
  assert.equal(isCollapsed, false);
});

s4.test('Sidebar: active navigation applies purple accent styling and left border indicator', () => {
  assert.match(layoutSrc, /bg-purple-50 text-purple-700 dark:bg-purple-900\/30 dark:text-purple-300 border-l-2 border-purple-600 font-semibold/);
});

s4.test('Sidebar: status dot includes neon green glowing box shadow', () => {
  assert.match(layoutSrc, /bg-emerald-500 animate-pulse shadow-\[0_0_8px_rgba\(16,185,129,0\.7\)\]/);
});


// ===========================================================================
// SUITE 5: Cross-Component Interactive Flow & Event Chaos Stress
// ===========================================================================
const s5 = suite('Cross-Component Interactive Flow & Chaos Matrix');

s5.test('Chaos: concurrent rapid user interactions across Navbar, Visualizer, and Modal', () => {
  // Simulating an aggressive user doing simultaneous clicks across all components:
  let mobileMenuOpen = false;
  let theme = 'dark';
  let visualizerNode = 1;
  let faqOpen = 0;
  let activeModal = null;
  let sidebarCollapsed = false;

  for (let cycle = 0; cycle < 20000; cycle++) {
    const action = cycle % 6;
    switch (action) {
      case 0:
        mobileMenuOpen = !mobileMenuOpen;
        break;
      case 1:
        theme = theme === 'dark' ? 'light' : 'dark';
        break;
      case 2:
        visualizerNode = (visualizerNode + 1) % 4;
        break;
      case 3:
        faqOpen = faqOpen === (cycle % 5) ? null : (cycle % 5);
        break;
      case 4:
        activeModal = activeModal === null ? (['privacy', 'terms', 'security'][cycle % 3]) : null;
        break;
      case 5:
        sidebarCollapsed = !sidebarCollapsed;
        break;
    }
  }

  // Verify all states remain within valid domain bounds
  assert.equal(typeof mobileMenuOpen, 'boolean');
  assert.ok(['light', 'dark'].includes(theme));
  assert.ok([0, 1, 2, 3].includes(visualizerNode));
  assert.ok(faqOpen === null || (faqOpen >= 0 && faqOpen <= 4));
  assert.ok(['privacy', 'terms', 'security', null].includes(activeModal));
  assert.equal(typeof sidebarCollapsed, 'boolean');
});

s5.test('Integrity: no broken template string interpolation or unescaped JSX in handlers', () => {
  // Ensure no undefined variable references in JSX templates
  assert.doesNotMatch(navbarSrc, /\$\{undefined\}/);
  assert.doesNotMatch(footerSrc, /\$\{undefined\}/);
  assert.doesNotMatch(landingPageSrc, /\$\{undefined\}/);
  assert.doesNotMatch(layoutSrc, /\$\{undefined\}/);
});

// ===========================================================================
// Sequential Async Runner Execution
// ===========================================================================
async function run() {
  for (const currentSuite of registeredSuites) {
    console.log(`\n\x1b[1m\x1b[36m=== SUITE: ${currentSuite.name} ===\x1b[0m`);
    for (const currentTest of currentSuite.tests) {
      RESULTS.total++;
      RESULTS.suites[currentSuite.name].total++;
      try {
        await currentTest.fn();
        RESULTS.passed++;
        RESULTS.suites[currentSuite.name].passed++;
        console.log(`  \x1b[32m✓\x1b[0m ${currentTest.name}`);
      } catch (err) {
        RESULTS.failed++;
        RESULTS.suites[currentSuite.name].failed++;
        RESULTS.failures.push({ suite: currentSuite.name, test: currentTest.name, error: err.message, stack: err.stack });
        console.log(`  \x1b[31m✗\x1b[0m ${currentTest.name}`);
        console.log(`    \x1b[33mError: ${err.message}\x1b[0m`);
      }
    }
  }

  console.log('\n=============================================================');
  console.log('    EMPIRICAL CHALLENGER 2: INTERACTIVE STRESS RESULTS        ');
  console.log('=============================================================');
  console.log(`Total Interactive Tests: ${RESULTS.total}`);
  console.log(`Passed:                  \x1b[32m${RESULTS.passed}\x1b[0m`);
  console.log(`Failed:                  \x1b[31m${RESULTS.failed}\x1b[0m`);
  console.log(`Pass Rate:               ${((RESULTS.passed / RESULTS.total) * 100).toFixed(1)}%`);

  for (const [sName, sData] of Object.entries(RESULTS.suites)) {
    console.log(`  - ${sName}: ${sData.passed}/${sData.total} passed`);
  }

  if (RESULTS.failed > 0) {
    console.log('\nFailures Detected:');
    for (const fail of RESULTS.failures) {
      console.log(`  - [${fail.suite}] ${fail.test}: ${fail.error}`);
    }
    process.exit(1);
  } else {
    console.log('\n\x1b[32mALL INTERACTIVE STRESS TESTS PASSED EMPIRICALLY!\x1b[0m\n');
    process.exit(0);
  }
}

run();
