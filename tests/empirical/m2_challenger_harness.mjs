import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();

// Test stats tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(suite, name, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`  \x1b[32m✓\x1b[0m [${suite}] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ suite, name, error: err.message, stack: err.stack });
    console.log(`  \x1b[31m✗\x1b[0m [${suite}] ${name}`);
    console.log(`    \x1b[31mError: ${err.message}\x1b[0m`);
  }
}

function getContrastRatio(hex1, hex2) {
  function getLuminance(hex) {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function extractCssBlock(css, selector) {
  const selIndex = css.indexOf(selector);
  if (selIndex === -1) return '';
  const openBrace = css.indexOf('{', selIndex);
  if (openBrace === -1) return '';
  let depth = 1;
  let closeBrace = openBrace + 1;
  while (depth > 0 && closeBrace < css.length) {
    if (css[closeBrace] === '{') depth++;
    if (css[closeBrace] === '}') depth--;
    closeBrace++;
  }
  return css.slice(openBrace + 1, closeBrace - 1);
}

function extractVariables(block) {
  const vars = {};
  const lines = block.split(';');
  for (const line of lines) {
    const [rawKey, ...rawValParts] = line.split(':');
    if (!rawKey || rawValParts.length === 0) continue;
    const key = rawKey.trim();
    const val = rawValParts.join(':').trim();
    if (key.startsWith('--')) {
      vars[key] = val;
    }
  }
  return vars;
}

console.log('\n\x1b[35m======================================================================\x1b[0m');
console.log('\x1b[35m    MILESTONE 2: EMPIRICAL CHALLENGER ADVERSARIAL STRESS HARNESS      \x1b[0m');
console.log('\x1b[35m======================================================================\x1b[0m\n');

// -------------------------------------------------------------
// SUITE 1: Typography & Font Variables Verification
// -------------------------------------------------------------
console.log('\x1b[34m[Suite 1: Typography & Font Variables]\x1b[0m');

const layoutPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/app/layout.tsx');
const tailwindConfigPath = path.join(ROOT_DIR, 'apps/web-dashboard/tailwind.config.ts');
const tailwindJsPath = path.join(ROOT_DIR, 'apps/web-dashboard/tailwind.config.js');
const globalsCssPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/app/globals.css');

runTest('Typography', 'Verify apps/web-dashboard/tailwind.config.js is removed to avoid config conflict', () => {
  assert.ok(!fs.existsSync(tailwindJsPath), 'tailwind.config.js must be removed; tailwind.config.ts must be single source');
});

runTest('Typography', 'Verify layout.tsx imports Inter and JetBrains_Mono from next/font/google', () => {
  const content = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(content.includes("from 'next/font/google'") || content.includes('from "next/font/google"'), 'next/font/google must be imported');
  assert.ok(content.includes('Inter') && content.includes('JetBrains_Mono'), 'Both Inter and JetBrains_Mono must be loaded');
});

runTest('Typography', 'Verify font loaders configure swap display and custom variables', () => {
  const content = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(content.includes("variable: '--font-inter'") || content.includes('variable: "--font-inter"'), 'variable: --font-inter missing');
  assert.ok(content.includes("variable: '--font-mono'") || content.includes('variable: "--font-mono"'), 'variable: --font-mono missing');
  assert.ok(content.includes("display: 'swap'") || content.includes('display: "swap"'), 'display: swap missing');
});

runTest('Typography', 'Verify html tag applies font variable classes and font-sans', () => {
  const content = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(content.includes('${inter.variable}'), 'html must include inter variable');
  assert.ok(content.includes('${jetbrainsMono.variable}'), 'html must include jetbrainsMono variable');
  assert.ok(content.includes('font-sans'), 'html must include font-sans class');
});

runTest('Typography', 'Verify body tag applies font-sans and antialiased without hardcoded font override', () => {
  const content = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(content.includes('<body'), 'body tag must exist');
  assert.ok(content.includes('font-sans'), 'body tag must contain font-sans');
  assert.ok(content.includes('antialiased'), 'body tag must contain antialiased');
});

runTest('Typography', 'Verify globals.css does not override font-family with legacy fonts', () => {
  const content = fs.readFileSync(globalsCssPath, 'utf8');
  assert.ok(!content.includes('font-family: -apple-system'), 'globals.css must not have hardcoded -apple-system override on body');
});

runTest('Typography', 'Verify tailwind.config.ts fontFamily.sans has var(--font-inter) and fallback stack', () => {
  const content = fs.readFileSync(tailwindConfigPath, 'utf8');
  assert.ok(content.includes("'var(--font-inter)'") || content.includes('"var(--font-inter)"'), 'fontFamily.sans must include var(--font-inter)');
  assert.ok(content.includes("'Inter'") || content.includes('"Inter"'), 'fontFamily.sans must include Inter');
  assert.ok(content.includes("'system-ui'") || content.includes('"system-ui"'), 'fontFamily.sans must include system-ui');
  assert.ok(content.includes("'sans-serif'") || content.includes('"sans-serif"'), 'fontFamily.sans must include sans-serif fallback');
});

runTest('Typography', 'Verify tailwind.config.ts fontFamily.mono has var(--font-mono) and fallback stack', () => {
  const content = fs.readFileSync(tailwindConfigPath, 'utf8');
  assert.ok(content.includes("'var(--font-mono)'") || content.includes('"var(--font-mono)"'), 'fontFamily.mono must include var(--font-mono)');
  assert.ok(content.includes("'JetBrains Mono'") || content.includes('"JetBrains Mono"'), 'fontFamily.mono must include JetBrains Mono');
  assert.ok(content.includes("'ui-monospace'") || content.includes('"ui-monospace"'), 'fontFamily.mono must include ui-monospace');
  assert.ok(content.includes("'monospace'") || content.includes('"monospace"'), 'fontFamily.mono must include monospace fallback');
});

// -------------------------------------------------------------
// SUITE 2: Design System Tokens & WCAG Contrast
// -------------------------------------------------------------
console.log('\n\x1b[34m[Suite 2: Design System Tokens & WCAG Contrast]\x1b[0m');

const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
const rootBlock = extractCssBlock(globalsCss, ':root');
const darkBlock = extractCssBlock(globalsCss, '.dark');
const rootVars = extractVariables(rootBlock);
const darkVars = extractVariables(darkBlock);

runTest('Tokens', 'Verify :root (Light mode) CSS variables match PROJECT.md design spec', () => {
  assert.equal(rootVars['--background'], '#ffffff', '--background must be #ffffff in light mode');
  assert.equal(rootVars['--surface'], '#f8fafc', '--surface must be #f8fafc in light mode');
  assert.equal(rootVars['--surface-hover'], '#f1f5f9', '--surface-hover must be #f1f5f9 in light mode');
  assert.equal(rootVars['--border'], '#e2e8f0', '--border must be #e2e8f0 in light mode');
  assert.equal(rootVars['--border-strong'], '#cbd5e1', '--border-strong must be #cbd5e1 in light mode');
  assert.equal(rootVars['--foreground'], '#0f172a', '--foreground must be #0f172a in light mode');
  assert.equal(rootVars['--muted'], '#64748b', '--muted must be #64748b in light mode');
  assert.equal(rootVars['--card-bg'], '#ffffff', '--card-bg must be #ffffff in light mode');
  assert.equal(rootVars['--accent-purple'], '#9333ea', '--accent-purple must be #9333ea in light mode');
  assert.equal(rootVars['--accent-red'], '#e11d48', '--accent-red must be #e11d48 in light mode');
  assert.equal(rootVars['--highlight-yellow'], '#f59e0b', '--highlight-yellow must be #f59e0b in light mode');
});

runTest('Tokens', 'Verify .dark (Dark mode) CSS variables match PROJECT.md design spec', () => {
  assert.equal(darkVars['--background'], '#090b10', '--background must be #090b10 in dark mode');
  assert.equal(darkVars['--surface'], '#111827', '--surface must be #111827 in dark mode');
  assert.equal(darkVars['--surface-hover'], '#172033', '--surface-hover must be #172033 in dark mode');
  assert.equal(darkVars['--border'], '#1e293b', '--border must be #1e293b in dark mode');
  assert.equal(darkVars['--border-strong'], '#334155', '--border-strong must be #334155 in dark mode');
  assert.equal(darkVars['--foreground'], '#f8fafc', '--foreground must be #f8fafc in dark mode');
  assert.equal(darkVars['--muted'], '#94a3b8', '--muted must be #94a3b8 in dark mode');
  assert.equal(darkVars['--card-bg'], '#111827', '--card-bg must be #111827 in dark mode');
  assert.equal(darkVars['--accent-purple'], '#a855f7', '--accent-purple must be #a855f7 in dark mode');
  assert.equal(darkVars['--accent-red'], '#fb7185', '--accent-red must be #fb7185 in dark mode');
  assert.equal(darkVars['--highlight-yellow'], '#fbbf24', '--highlight-yellow must be #fbbf24 in dark mode');
});

runTest('Tokens', 'Verify WCAG AA Text Contrast in Light Mode (>= 4.5:1)', () => {
  const contrast = getContrastRatio(rootVars['--background'], rootVars['--foreground']);
  assert.ok(contrast >= 4.5, `Light mode contrast ${contrast.toFixed(2)} must be >= 4.5`);
  assert.ok(contrast > 15, `Light mode contrast ${contrast.toFixed(2)} should be high (~18:1)`);
});

runTest('Tokens', 'Verify WCAG AA Text Contrast in Dark Mode (>= 4.5:1)', () => {
  const contrast = getContrastRatio(darkVars['--background'], darkVars['--foreground']);
  assert.ok(contrast >= 4.5, `Dark mode contrast ${contrast.toFixed(2)} must be >= 4.5`);
  assert.ok(contrast > 15, `Dark mode contrast ${contrast.toFixed(2)} should be high (~18:1)`);
});

runTest('Tokens', 'Verify WCAG AA Muted Text Contrast in Light Mode (>= 4.5:1)', () => {
  const contrast = getContrastRatio(rootVars['--background'], rootVars['--muted']);
  assert.ok(contrast >= 4.5, `Light mode muted contrast ${contrast.toFixed(2)} must be >= 4.5`);
});

runTest('Tokens', 'Verify WCAG AA Muted Text Contrast in Dark Mode (>= 4.5:1)', () => {
  const contrast = getContrastRatio(darkVars['--background'], darkVars['--muted']);
  assert.ok(contrast >= 4.5, `Dark mode muted contrast ${contrast.toFixed(2)} must be >= 4.5`);
});

// -------------------------------------------------------------
// SUITE 3: Tailwind Config Extended Palette & Neon Glows
// -------------------------------------------------------------
console.log('\n\x1b[34m[Suite 3: Tailwind Config Palette & Neon Glows]\x1b[0m');

const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

runTest('Tailwind', 'Verify darkMode is configured with "class" strategy', () => {
  assert.ok(tailwindConfig.includes("darkMode: 'class'") || tailwindConfig.includes('darkMode: "class"'), 'darkMode: "class" must be set');
});

runTest('Tailwind', 'Verify purple palette includes accent (#9333ea) and glow (#a855f7)', () => {
  assert.ok(tailwindConfig.includes('#9333ea'), 'purple accent #9333ea must be defined');
  assert.ok(tailwindConfig.includes('#a855f7'), 'purple glow #a855f7 must be defined');
});

runTest('Tailwind', 'Verify red palette includes accent (#e11d48) and danger (#dc2626)', () => {
  assert.ok(tailwindConfig.includes('#e11d48'), 'red accent #e11d48 must be defined');
  assert.ok(tailwindConfig.includes('#dc2626'), 'red danger #dc2626 must be defined');
});

runTest('Tailwind', 'Verify yellow palette includes highlight (#f59e0b) and warning (#eab308)', () => {
  assert.ok(tailwindConfig.includes('#f59e0b'), 'yellow highlight #f59e0b must be defined');
  assert.ok(tailwindConfig.includes('#eab308'), 'yellow warning #eab308 must be defined');
});

runTest('Tailwind', 'Verify neon glow box shadows are configured', () => {
  assert.ok(tailwindConfig.includes('neon-purple'), 'neon-purple box shadow missing');
  assert.ok(tailwindConfig.includes('neon-red'), 'neon-red box shadow missing');
  assert.ok(tailwindConfig.includes('neon-amber'), 'neon-amber box shadow missing');
  assert.ok(tailwindConfig.includes('neon-cyan'), 'neon-cyan box shadow missing');
  assert.ok(tailwindConfig.includes('neon-emerald'), 'neon-emerald box shadow missing');
});

runTest('Tailwind', 'Verify globals.css contains CSS neon glow and glowing border classes', () => {
  assert.ok(globalsCss.includes('.neon-glow-purple'), '.neon-glow-purple missing in globals.css');
  assert.ok(globalsCss.includes('.neon-glow-red'), '.neon-glow-red missing in globals.css');
  assert.ok(globalsCss.includes('.neon-glow-amber'), '.neon-glow-amber missing in globals.css');
  assert.ok(globalsCss.includes('.neon-glow-cyan'), '.neon-glow-cyan missing in globals.css');
  assert.ok(globalsCss.includes('.neon-glow-emerald'), '.neon-glow-emerald missing in globals.css');
  assert.ok(globalsCss.includes('.neon-border-purple'), '.neon-border-purple missing in globals.css');
  assert.ok(globalsCss.includes('.neon-border-cyan'), '.neon-border-cyan missing in globals.css');
});

// -------------------------------------------------------------
// SUITE 4: UI Primitive Components (Button, Badge, Card, Input)
// -------------------------------------------------------------
console.log('\n\x1b[34m[Suite 4: UI Primitive Components (Button, Badge, Card, Input)]\x1b[0m');

const buttonPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Button.tsx');
const badgePath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Badge.tsx');
const cardPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Card.tsx');
const inputPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Input.tsx');
const providersPath = path.join(ROOT_DIR, 'apps/web-dashboard/src/app/providers.tsx');

const buttonContent = fs.readFileSync(buttonPath, 'utf8');
const badgeContent = fs.readFileSync(badgePath, 'utf8');
const cardContent = fs.readFileSync(cardPath, 'utf8');
const inputContent = fs.readFileSync(inputPath, 'utf8');
const providersContent = fs.readFileSync(providersPath, 'utf8');

runTest('Button', 'Button uses forwardRef and defines displayName', () => {
  assert.ok(buttonContent.includes('forwardRef'), 'Button must use React forwardRef');
  assert.ok(buttonContent.includes("Button.displayName = 'Button'"), 'Button.displayName must be set');
});

runTest('Button', 'Button primary variant uses purple-600 with neon-purple hover glow', () => {
  assert.ok(buttonContent.includes('bg-purple-600'), 'Button primary must use bg-purple-600');
  assert.ok(buttonContent.includes('hover:shadow-neon-purple'), 'Button primary must use hover:shadow-neon-purple');
  assert.ok(buttonContent.includes('focus:ring-purple-500'), 'Button primary must use focus:ring-purple-500');
});

runTest('Button', 'Button danger variant uses red-600 with neon-red hover glow', () => {
  assert.ok(buttonContent.includes('bg-red-600'), 'Button danger must use bg-red-600');
  assert.ok(buttonContent.includes('hover:shadow-neon-red'), 'Button danger must use hover:shadow-neon-red');
  assert.ok(buttonContent.includes('focus:ring-red-500'), 'Button danger must use focus:ring-red-500');
});

runTest('Button', 'Button outline variant has purple hover border and glow', () => {
  assert.ok(buttonContent.includes('hover:border-purple-400'), 'Button outline must have hover:border-purple-400');
  assert.ok(buttonContent.includes('hover:shadow-neon-purple/20'), 'Button outline must have hover:shadow-neon-purple/20');
});

runTest('Button', 'Button handles disabled and isLoading states with cursor-not-allowed', () => {
  assert.ok(buttonContent.includes('disabled={disabled || isLoading}'), 'Button must disable when isLoading or disabled');
  assert.ok(buttonContent.includes('disabled:opacity-50'), 'Button must have disabled:opacity-50');
  assert.ok(buttonContent.includes('disabled:cursor-not-allowed'), 'Button must have disabled:cursor-not-allowed');
});

runTest('Badge', 'Badge supports all 9 variants (cyan, emerald, amber, rose, indigo, neutral, purple, red, yellow)', () => {
  const expectedVariants = ['cyan', 'emerald', 'amber', 'rose', 'indigo', 'neutral', 'purple', 'red', 'yellow'];
  for (const v of expectedVariants) {
    assert.ok(badgeContent.includes(`${v}:`), `Badge must support variant "${v}"`);
  }
});

runTest('Badge', 'Badge purple, red, and yellow variants have dark-mode subtle glow shadows', () => {
  assert.ok(badgeContent.includes('dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]'), 'Badge purple variant must include dark neon glow');
  assert.ok(badgeContent.includes('dark:shadow-[0_0_10px_rgba(220,38,38,0.2)]'), 'Badge red variant must include dark neon glow');
  assert.ok(badgeContent.includes('dark:shadow-[0_0_10px_rgba(234,179,8,0.2)]'), 'Badge yellow variant must include dark neon glow');
});

runTest('Card', 'Card exports Card, CardHeader, CardTitle, and CardContent', () => {
  assert.ok(cardContent.includes('export function Card('), 'Card export missing');
  assert.ok(cardContent.includes('export function CardHeader('), 'CardHeader export missing');
  assert.ok(cardContent.includes('export function CardTitle('), 'CardTitle export missing');
  assert.ok(cardContent.includes('export function CardContent('), 'CardContent export missing');
});

runTest('Card', 'Card has subtle neon purple hover glow and dual-theme border', () => {
  assert.ok(cardContent.includes('border-slate-200 dark:border-slate-800'), 'Card must have dual-theme border');
  assert.ok(cardContent.includes('hover:border-purple-300/60 dark:hover:border-purple-500/40'), 'Card must have hover purple border');
  assert.ok(cardContent.includes('hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]'), 'Card must have subtle purple hover shadow');
});

runTest('Input', 'Input uses forwardRef and sets displayName', () => {
  assert.ok(inputContent.includes('forwardRef'), 'Input must use React forwardRef');
  assert.ok(inputContent.includes("Input.displayName = 'Input'"), 'Input.displayName must be set');
});

runTest('Input', 'Input uses purple focus ring and border', () => {
  assert.ok(inputContent.includes('focus:border-purple-500'), 'Input focus border must be purple-500');
  assert.ok(inputContent.includes('focus:ring-purple-500/25'), 'Input focus ring must be purple-500/25');
  assert.ok(inputContent.includes('dark:focus:border-purple-400'), 'Input dark focus border must be purple-400');
  assert.ok(inputContent.includes('dark:focus:ring-purple-400/25'), 'Input dark focus ring must be purple-400/25');
});

runTest('Input', 'Input renders error state with red border, ring, and error text', () => {
  assert.ok(inputContent.includes('border-red-500 focus:border-red-500 focus:ring-red-500'), 'Input error state must be red');
  assert.ok(inputContent.includes('text-red-600 dark:text-red-400'), 'Input error message must be red');
});

runTest('Input', 'Input supports helperText and auto-derives id from label', () => {
  assert.ok(inputContent.includes('helperText && !error'), 'Input must render helperText when no error');
  assert.ok(inputContent.includes('id || (label ? label.toLowerCase().replace'), 'Input must auto-derive id from label');
});

runTest('Providers', 'ThemeProvider enables class-based theme switching with defaultTheme="light"', () => {
  assert.ok(providersContent.includes('attribute="class"'), 'ThemeProvider must use attribute="class"');
  assert.ok(providersContent.includes('defaultTheme="light"'), 'ThemeProvider must have defaultTheme="light"');
});

runTest('Providers', 'ThemedToaster configures dark neon purple glow shadow', () => {
  assert.ok(providersContent.includes('dark:shadow-[0_0_15px_rgba(168,85,247,0.1)]'), 'ThemedToaster must have dark neon shadow');
});

// -------------------------------------------------------------
// SUITE 5: Selection styling & Root Layout Structure
// -------------------------------------------------------------
console.log('\n\x1b[34m[Suite 5: Selection styling & Root Layout Structure]\x1b[0m');

const layoutFile = fs.readFileSync(layoutPath, 'utf8');

runTest('Layout', 'Selection highlights use purple tint in light and dark modes', () => {
  assert.ok(layoutFile.includes('selection:bg-purple-500/20'), 'Light mode selection bg purple missing');
  assert.ok(layoutFile.includes('selection:text-purple-600'), 'Light mode selection text purple missing');
  assert.ok(layoutFile.includes('dark:selection:bg-purple-500/25'), 'Dark mode selection bg purple missing');
  assert.ok(layoutFile.includes('dark:selection:text-purple-300'), 'Dark mode selection text purple missing');
});

runTest('Layout', 'Root layout renders Providers, Navbar, children, Footer, CommandPalette in order', () => {
  const pIdx = layoutFile.indexOf('<Providers>');
  const navIdx = layoutFile.indexOf('<Navbar />');
  const mainIdx = layoutFile.indexOf('<main');
  const footIdx = layoutFile.indexOf('<Footer />');
  const cmdIdx = layoutFile.indexOf('<CommandPalette />');

  assert.ok(pIdx !== -1 && navIdx !== -1 && mainIdx !== -1 && footIdx !== -1 && cmdIdx !== -1, 'All core layout components must be mounted');
  assert.ok(pIdx < navIdx && navIdx < mainIdx && mainIdx < footIdx && footIdx < cmdIdx, 'Layout components mounted in proper DOM hierarchy');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n\x1b[35m======================================================================\x1b[0m');
console.log(`MILESTONE 2 EMPIRICAL HARNESS SUMMARY:`);
console.log(`Total Tests Run:  ${totalTests}`);
console.log(`Passed:           ${passedTests}`);
console.log(`Failed:           ${failedTests}`);
console.log(`Pass Rate:        ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('\x1b[35m======================================================================\x1b[0m\n');

if (failedTests > 0) {
  console.error(`\x1b[31m${failedTests} test(s) failed.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mAll Milestone 2 empirical tests passed with 100% compliance.\x1b[0m\n');
  process.exit(0);
}
