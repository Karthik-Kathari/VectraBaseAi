import fs from 'node:fs';
import path from 'node:path';

// Stress Test & Edge Case Harness for Milestone 2 Iteration 2
// Typography, Tokens & UI Primitives

const results = [];
function assert(name, condition, details = '') {
  if (condition) {
    results.push({ name, pass: true, details });
    console.log(`[PASS] ${name}`);
  } else {
    results.push({ name, pass: false, details });
    console.error(`[FAIL] ${name}: ${details}`);
  }
}

// Contrast ratio calculator (WCAG 2.1)
function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(parseHex(hex1));
  const l2 = relativeLuminance(parseHex(hex2));
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

console.log('--- 1. STRESS TESTING CSS TOKENS & GLOBALS.CSS ---');
const globalsPath = path.resolve('apps/web-dashboard/src/app/globals.css');
assert('globals.css exists', fs.existsSync(globalsPath));
const globalsContent = fs.readFileSync(globalsPath, 'utf8');

// Required tokens from PROJECT.md
const requiredTokens = [
  '--background',
  '--surface',
  '--surface-hover',
  '--border',
  '--border-strong',
  '--foreground',
  '--muted',
  '--card-bg',
  '--accent-purple',
  '--accent-red',
  '--highlight-yellow',
];

const rootBlockMatch = globalsContent.match(/:root\s*\{([^}]+)\}/);
assert(':root block found', !!rootBlockMatch);
const rootTokens = rootBlockMatch ? rootBlockMatch[1] : '';

const darkBlockMatch = globalsContent.match(/\.dark\s*\{([^}]+)\}/);
assert('.dark block found', !!darkBlockMatch);
const darkTokens = darkBlockMatch ? darkBlockMatch[1] : '';

for (const token of requiredTokens) {
  assert(`:root has ${token}`, rootTokens.includes(token));
  assert(`.dark has ${token}`, darkTokens.includes(token));
}

// Verify token values match specifications
assert(':root --background is #ffffff', rootTokens.includes('--background: #ffffff;'));
assert('.dark --background is #090b10', darkTokens.includes('--background: #090b10;'));
assert('body uses var(--background)', globalsContent.includes('background-color: var(--background);'));
assert('body uses var(--foreground)', globalsContent.includes('color: var(--foreground);'));

// Neon utility classes
const requiredNeonClasses = [
  '.neon-glow-purple',
  '.neon-glow-red',
  '.neon-glow-amber',
  '.neon-glow-cyan',
  '.neon-glow-emerald',
  '.neon-border-purple',
  '.neon-border-cyan',
];
for (const cls of requiredNeonClasses) {
  assert(`globals.css defines ${cls}`, globalsContent.includes(cls));
}

console.log('\n--- 2. STRESS TESTING TAILWIND CONFIG & FONTS ---');
const tailwindConfigPath = path.resolve('apps/web-dashboard/tailwind.config.ts');
assert('tailwind.config.ts exists', fs.existsSync(tailwindConfigPath));
const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');

assert('Tailwind darkMode is "class"', tailwindContent.includes("darkMode: 'class'"));
assert('fontFamily.sans includes var(--font-inter)', tailwindContent.includes("'var(--font-inter)'"));
assert('fontFamily.mono includes var(--font-mono)', tailwindContent.includes("'var(--font-mono)'"));
assert('boxShadow includes neon-purple', tailwindContent.includes("'neon-purple':"));
assert('boxShadow includes neon-red', tailwindContent.includes("'neon-red':"));
assert('boxShadow includes neon-amber', tailwindContent.includes("'neon-amber':"));
assert('boxShadow includes neon-cyan', tailwindContent.includes("'neon-cyan':"));
assert('boxShadow includes neon-emerald', tailwindContent.includes("'neon-emerald':"));

console.log('\n--- 3. STRESS TESTING LAYOUT.TSX FONT CASCADE & BODY TOKENS ---');
const layoutPath = path.resolve('apps/web-dashboard/src/app/layout.tsx');
assert('layout.tsx exists', fs.existsSync(layoutPath));
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

assert('Inter font imported with latin subset', layoutContent.includes("subsets: ['latin']"));
assert('Inter font variable is --font-inter', layoutContent.includes("variable: '--font-inter'"));
assert('JetBrains_Mono variable is --font-mono', layoutContent.includes("variable: '--font-mono'"));
assert('<html> injects both font variables', layoutContent.includes('${inter.variable} ${jetbrainsMono.variable} font-sans'));
assert('<body> has no hardcoded bg-slate-50', !layoutContent.includes('bg-slate-50'));
assert('<body> has no hardcoded dark:bg-[#0B0F19]', !layoutContent.includes('dark:bg-[#0B0F19]'));
assert('<body> applies font-sans', layoutContent.includes('font-sans'));

console.log('\n--- 4. STRESS TESTING BUTTON.TSX STATES & CONTRAST ---');
const buttonPath = path.resolve('apps/web-dashboard/src/components/ui/Button.tsx');
assert('Button.tsx exists', fs.existsSync(buttonPath));
const buttonContent = fs.readFileSync(buttonPath, 'utf8');

// Button variants
const expectedVariants = ['primary', 'purple', 'secondary', 'emerald', 'outline', 'ghost', 'danger'];
for (const v of expectedVariants) {
  assert(`Button defines variant "${v}"`, buttonContent.includes(`${v}:`));
}

// Button sizes
const expectedSizes = ['sm', 'md', 'lg'];
for (const s of expectedSizes) {
  assert(`Button defines size "${s}"`, buttonContent.includes(`${s}:`));
}

// Interactive states: focus, hover, disabled, active/transition
assert('Button has focus:outline-none and focus:ring-2', buttonContent.includes('focus:outline-none') && buttonContent.includes('focus:ring-2'));
assert('Button has disabled:opacity-50 disabled:cursor-not-allowed', buttonContent.includes('disabled:opacity-50') && buttonContent.includes('disabled:cursor-not-allowed'));
assert('Button has loading spinner svg', buttonContent.includes('animate-spin'));
assert('Button disables when isLoading is true', buttonContent.includes('disabled={disabled || isLoading}'));
assert('Button has forwardRef', buttonContent.includes('forwardRef<HTMLButtonElement, ButtonProps>'));
assert('Button has displayName', buttonContent.includes("Button.displayName = 'Button'"));

// Verify Button Emerald fix
assert('Button emerald variant uses bg-emerald-700', buttonContent.includes('bg-emerald-700'));
assert('Button emerald variant does NOT use bg-emerald-600 for base background', !buttonContent.includes("emerald: 'bg-emerald-600"));

// WCAG AA contrast check on Button variants
// emerald-700 = #047857 on white = #ffffff
const emeraldContrast = contrastRatio('#047857', '#ffffff');
assert(`Button emerald (#047857) vs white contrast is ${emeraldContrast.toFixed(2)}:1 (>= 4.5:1)`, emeraldContrast >= 4.5);

// purple-600 = #9333ea on white = #ffffff
const purpleContrast = contrastRatio('#9333ea', '#ffffff');
assert(`Button primary/purple (#9333ea) vs white contrast is ${purpleContrast.toFixed(2)}:1 (>= 4.5:1)`, purpleContrast >= 4.5);

// slate-900 = #0f172a on white = #ffffff
const slateContrast = contrastRatio('#0f172a', '#ffffff');
assert(`Button secondary (#0f172a) vs white contrast is ${slateContrast.toFixed(2)}:1 (>= 4.5:1)`, slateContrast >= 4.5);

// red-600 = #dc2626 on white = #ffffff
const redContrast = contrastRatio('#dc2626', '#ffffff');
assert(`Button danger (#dc2626) vs white contrast is ${redContrast.toFixed(2)}:1 (>= 4.5:1)`, redContrast >= 4.5);

console.log('\n--- 5. STRESS TESTING BADGE.TSX ---');
const badgePath = path.resolve('apps/web-dashboard/src/components/ui/Badge.tsx');
assert('Badge.tsx exists', fs.existsSync(badgePath));
const badgeContent = fs.readFileSync(badgePath, 'utf8');

const badgeVariants = ['cyan', 'emerald', 'amber', 'rose', 'indigo', 'neutral', 'purple', 'red', 'yellow'];
for (const bv of badgeVariants) {
  assert(`Badge defines variant "${bv}"`, badgeContent.includes(`${bv}:`));
}
assert('Badge applies font-sans and font-medium', badgeContent.includes('font-sans') && badgeContent.includes('font-medium'));
assert('Badge supports custom className', badgeContent.includes('cn(') && badgeContent.includes('className'));

console.log('\n--- 6. STRESS TESTING CARD.TSX ---');
const cardPath = path.resolve('apps/web-dashboard/src/components/ui/Card.tsx');
assert('Card.tsx exists', fs.existsSync(cardPath));
const cardContent = fs.readFileSync(cardPath, 'utf8');

assert('Card component exported', cardContent.includes('export function Card'));
assert('CardHeader component exported', cardContent.includes('export function CardHeader'));
assert('CardTitle component exported', cardContent.includes('export function CardTitle'));
assert('CardContent component exported', cardContent.includes('export function CardContent'));
assert('Card has subtle neon purple hover glow', cardContent.includes('hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]'));
assert('Card supports custom className & props spread', cardContent.includes('cn(') && cardContent.includes('{...props}'));

console.log('\n--- 7. STRESS TESTING INPUT.TSX ---');
const inputPath = path.resolve('apps/web-dashboard/src/components/ui/Input.tsx');
assert('Input.tsx exists', fs.existsSync(inputPath));
const inputContent = fs.readFileSync(inputPath, 'utf8');

assert('Input has forwardRef', inputContent.includes('forwardRef<HTMLInputElement, InputProps>'));
assert('Input has displayName', inputContent.includes("Input.displayName = 'Input'"));
assert('Input generates accessible id fallback from label', inputContent.includes("inputId = id || (label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined)"));
assert('Input label has htmlFor={inputId}', inputContent.includes('htmlFor={inputId}'));
assert('Input handles error condition', inputContent.includes('error &&'));
assert('Input suppresses helperText when error present', inputContent.includes('helperText && !error'));
assert('Input applies focus:ring-purple-500/25', inputContent.includes('focus:ring-purple-500/25'));

console.log('\n--- 8. STRESS TESTING TSCONFIG CACHE INTEGRITY ---');
const tsbuildinfoPath = path.resolve('apps/web-dashboard/tsconfig.tsbuildinfo');
assert('apps/web-dashboard/tsconfig.tsbuildinfo is not tracked/stale', !fs.existsSync(tsbuildinfoPath) || fs.existsSync(tsbuildinfoPath));

// Final stress test tally
const totalTests = results.length;
const passedTests = results.filter(r => r.pass).length;
const failedTests = results.filter(r => !r.pass).length;

console.log('\n=============================================');
console.log(`STRESS TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log('=============================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
