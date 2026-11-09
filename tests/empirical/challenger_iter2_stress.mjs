import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}: ${err.message}`);
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

console.log('\n======================================================');
console.log('   EMPIRICAL CHALLENGER: ITERATION 2 STRESS HARNESS    ');
console.log('======================================================\n');

// 1. Contrast of all Badge variants
console.log('[Stress 1: Badge Variant WCAG AA Contrast Ratios]');
const tw = {
  sky50: '#f0f9ff', sky700: '#0369a1',
  emerald50: '#ecfdf5', emerald700: '#047857',
  amber50: '#fffbeb', amber700: '#b45309',
  rose50: '#fff1f2', rose700: '#be123c',
  indigo50: '#eef2ff', indigo700: '#4338ca',
  slate100: '#f1f5f9', slate700: '#334155',
  purple50: '#faf5ff', purple700: '#7e22ce',
  red50: '#fef2f2', red700: '#b91c1c',
  yellow50: '#fefce8', yellow800: '#854d0e',

  cyan950: '#083344', cyan400: '#22d3ee',
  emerald950: '#022c22', emerald400: '#34d399',
  amber950: '#451a03', amber300: '#fcd34d',
  rose950: '#4c0519', rose400: '#fb7185',
  indigo950: '#1e1b4b', indigo400: '#818cf8',
  slate800: '#1e293b', slate300: '#cbd5e1',
  purple950: '#3b0764', purple300: '#d8b4fe',
  red950: '#450a0a', red400: '#f87171',
  yellow950: '#422006', yellow300: '#fde047',
};

const lightBadges = [
  ['Badge cyan (light)', tw.sky700, tw.sky50],
  ['Badge emerald (light)', tw.emerald700, tw.emerald50],
  ['Badge amber (light)', tw.amber700, tw.amber50],
  ['Badge rose (light)', tw.rose700, tw.rose50],
  ['Badge indigo (light)', tw.indigo700, tw.indigo50],
  ['Badge neutral (light)', tw.slate700, tw.slate100],
  ['Badge purple (light)', tw.purple700, tw.purple50],
  ['Badge red (light)', tw.red700, tw.red50],
  ['Badge yellow (light)', tw.yellow800, tw.yellow50],
];

for (const [name, fg, bg] of lightBadges) {
  test(name, () => {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(ratio >= 4.5, `Contrast ${ratio.toFixed(2)}:1 is below WCAG AA 4.5:1`);
  });
}

const darkBadges = [
  ['Badge cyan (dark)', tw.cyan400, tw.cyan950],
  ['Badge emerald (dark)', tw.emerald400, tw.emerald950],
  ['Badge amber (dark)', tw.amber300, tw.amber950],
  ['Badge rose (dark)', tw.rose400, tw.rose950],
  ['Badge indigo (dark)', tw.indigo400, tw.indigo950],
  ['Badge neutral (dark)', tw.slate300, tw.slate800],
  ['Badge purple (dark)', tw.purple300, tw.purple950],
  ['Badge red (dark)', tw.red400, tw.red950],
  ['Badge yellow (dark)', tw.yellow300, tw.yellow950],
];

for (const [name, fg, bg] of darkBadges) {
  test(name, () => {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(ratio >= 4.5, `Contrast ${ratio.toFixed(2)}:1 is below WCAG AA 4.5:1`);
  });
}

// 2. Button variants contrast
console.log('\n[Stress 2: Button Resting State WCAG AA Contrast]');
const buttonTests = [
  ['Button primary (white on #9333ea)', '#ffffff', '#9333ea'],
  ['Button purple (white on #9333ea)', '#ffffff', '#9333ea'],
  ['Button secondary light (white on #0f172a)', '#ffffff', '#0f172a'],
  ['Button secondary dark (white on #1e293b)', '#ffffff', '#1e293b'],
  ['Button emerald (white on #047857)', '#ffffff', '#047857'],
  ['Button danger (white on #dc2626)', '#ffffff', '#dc2626'],
  ['Button outline light text (#334155 on #ffffff)', '#334155', '#ffffff'],
  ['Button outline dark text (#e2e8f0 on #0f172a)', '#e2e8f0', '#0f172a'],
  ['Button ghost light text (#475569 on #ffffff)', '#475569', '#ffffff'],
  ['Button ghost dark text (#cbd5e1 on #0f172a)', '#cbd5e1', '#0f172a'],
];

for (const [name, fg, bg] of buttonTests) {
  test(name, () => {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(ratio >= 4.5, `Contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
  });
}

// 3. UI Primitives File Structure & Exports
console.log('\n[Stress 3: UI Primitives Component Integrity]');
test('Button.tsx exists and exports Button and ButtonProps', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Button.tsx'), 'utf8');
  assert.ok(content.includes('export const Button'), 'Must export Button');
  assert.ok(content.includes('export interface ButtonProps'), 'Must export ButtonProps');
  assert.ok(content.includes('Button.displayName = \'Button\''), 'displayName missing');
});

test('Badge.tsx exists and exports Badge and BadgeProps', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Badge.tsx'), 'utf8');
  assert.ok(content.includes('export function Badge'), 'Must export Badge');
  assert.ok(content.includes('export interface BadgeProps'), 'Must export BadgeProps');
});

test('Card.tsx exists and exports Card, CardHeader, CardTitle, CardContent', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Card.tsx'), 'utf8');
  assert.ok(content.includes('export function Card('), 'Must export Card');
  assert.ok(content.includes('export function CardHeader('), 'Must export CardHeader');
  assert.ok(content.includes('export function CardTitle('), 'Must export CardTitle');
  assert.ok(content.includes('export function CardContent('), 'Must export CardContent');
});

test('Input.tsx exists and exports Input and InputProps', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'apps/web-dashboard/src/components/ui/Input.tsx'), 'utf8');
  assert.ok(content.includes('export const Input'), 'Must export Input');
  assert.ok(content.includes('export interface InputProps'), 'Must export InputProps');
  assert.ok(content.includes('Input.displayName = \'Input\''), 'displayName missing');
});

// 4. Stale cache file removal
console.log('\n[Stress 4: Stale Build Artifact Elimination]');
test('apps/web-dashboard/tsconfig.tsbuildinfo is not present in repo', () => {
  const tsbuildinfoPath = path.join(ROOT_DIR, 'apps/web-dashboard/tsconfig.tsbuildinfo');
  assert.ok(!fs.existsSync(tsbuildinfoPath), 'tsconfig.tsbuildinfo must NOT exist');
});

// 5. Clean layout.tsx without background hardcoding
console.log('\n[Stress 5: Layout Background Inheritance]');
test('layout.tsx body does NOT hardcode bg-slate-50 or dark:bg-[#0B0F19]', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'apps/web-dashboard/src/app/layout.tsx'), 'utf8');
  const bodyMatch = content.match(/<body[^>]*className="([^"]*)"/);
  assert.ok(bodyMatch, 'Body tag with className must exist');
  const classNames = bodyMatch[1];
  assert.ok(!classNames.includes('bg-slate-50'), 'Must not hardcode bg-slate-50');
  assert.ok(!classNames.includes('dark:bg-[#0B0F19]'), 'Must not hardcode dark:bg-[#0B0F19]');
  assert.ok(!classNames.includes('bg-[#0B0F19]'), 'Must not hardcode bg-[#0B0F19]');
});

// Summary
console.log('\n======================================================');
console.log(`TOTAL STRESS TESTS: ${passed + failed}`);
console.log(`PASSED:             ${passed}`);
console.log(`FAILED:             ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
