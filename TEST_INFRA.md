# VectraBase AI — E2E Test Suite Infrastructure & Architecture

## Overview
This document specifies the architecture, methodology, invocation protocols, and tier inventory of the independent End-to-End (E2E) Test Suite for VectraBase AI. The test suite operates as an opaque-box verification system validating all functional requirements, UI design tokens, responsive behavior, typography standards, and interface contracts specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

---

## Invocation Protocols

### 1. Default Monorepo Command
```bash
pnpm test:e2e
```
*Executes all 130 tests across Tiers 1–4. Exits with code `0` if all tests pass, or code `1` if any defect is detected.*

### 2. Direct Node.js Execution
```bash
node tests/e2e/runner.mjs
```

### 3. Non-Blocking Inspection Mode (Diagnostic)
```bash
pnpm test:e2e --allow-failures
# OR
node tests/e2e/runner.mjs --allow-failures
```
*Runs all tests, writes full JSON results to `tests/e2e/results.json`, logs all failure diagnostics, and returns exit code `0`.*

---

## 4-Tier Test Suite Hierarchy

| Tier | Name | Target Scope | Case Count | Status |
|------|------|--------------|------------|--------|
| **Tier 1** | Feature Coverage | Isolated functional & contract verification (>=5 tests per feature for Features 1–11) | 55 | Active |
| **Tier 2** | Boundary & Corner Cases | Extreme values, invalid inputs, timeouts, offline fallbacks, WCAG contrast | 55 | Active |
| **Tier 3** | Cross-Feature Interactions | Pairwise interaction testing (theme toggle x query, drawer x theme, etc.) | 15 | Active |
| **Tier 4** | Real-World Workloads | Complete multi-step user workflows (Evaluator Journey, High-Stress Chaos) | 5 | Active |
| **Total** | | **Comprehensive E2E Coverage** | **130** | **Ready** |

---

## Test Directory & Module Layout

```
tests/e2e/
├── runner.mjs                                      # Main CLI test orchestrator & reporter
├── results.json                                    # Machine-readable test execution report
├── helpers/
│   ├── ast-parser.mjs                             # Regex & AST parser for TSX/Vue/CSS/contrast
│   ├── dom-simulator.mjs                          # DOM theme & viewport dimension simulator
│   ├── http-mock.mjs                              # Node HTTP server for contract simulation & live probe
│   └── report-generator.mjs                       # Registry, timers, ANSI formatter, and summary metrics
├── tier1-features/
│   ├── feat1-api-routing.test.mjs                 # Feature 1: Embed Widget API Routing Fix (5 tests)
│   ├── feat2-navbar-author.test.mjs               # Feature 2: Navbar Author Attribution Removal (5 tests)
│   ├── feat3-widget-theme-sync.test.mjs           # Feature 3: Widget Dual-Theme & Library Sync (5 tests)
│   ├── feat4-typography.test.mjs                  # Feature 4: Typography Standardization (5 tests)
│   ├── feat5-design-tokens.test.mjs               # Feature 5: Design Tokens & UI Primitives (5 tests)
│   ├── feat6-theme-toggle.test.mjs                # Feature 6: Working Light/Dark Mode Navbar Toggle (5 tests)
│   ├── feat7-shell-marketing.test.mjs             # Feature 7: Shell & Marketing Redesign (5 tests)
│   ├── feat8-dashboard-pages.test.mjs             # Feature 8: Dashboard Pages Redesign (5 tests)
│   ├── feat9-widget-playground.test.mjs           # Feature 9: Widget Playground & Lab Redesign (5 tests)
│   ├── feat10-telemetry-governance.test.mjs       # Feature 10: Telemetry & Governance Redesign (5 tests)
│   └── feat11-interactive-glow.test.mjs           # Feature 11: Interactive Components & Glow Accents (5 tests)
├── tier2-boundary/
│   ├── feat1-api-routing-boundary.test.mjs        # Feature 1 Edge Cases & Error Cascades (5 tests)
│   ├── feat2-navbar-author-boundary.test.mjs      # Feature 2 Boundary & Accessibility Cases (5 tests)
│   ├── feat3-widget-theme-boundary.test.mjs       # Feature 3 Edge Cases & Fallback States (5 tests)
│   ├── feat4-typography-boundary.test.mjs         # Feature 4 Font Stacks & Tabular Figures (5 tests)
│   ├── feat5-design-tokens-boundary.test.mjs      # Feature 5 WCAG AA Contrast Ratios & States (5 tests)
│   ├── feat6-theme-toggle-boundary.test.mjs       # Feature 6 Rapid Toggling & Hydration Guards (5 tests)
│   ├── feat7-shell-marketing-boundary.test.mjs    # Feature 7 Broken Link & Anchor Elimination (5 tests)
│   ├── feat8-dashboard-pages-boundary.test.mjs    # Feature 8 MIME Constraints & Overflow Rules (5 tests)
│   ├── feat9-widget-playground-boundary.test.mjs  # Feature 9 Escaped Templates & Network Fallbacks (5 tests)
│   ├── feat10-telemetry-governance-boundary.test.mjs # Feature 10 Virtualization Limits & Field-48 (5 tests)
│   └── feat11-interactive-glow-boundary.test.mjs  # Feature 11 Modal Dismissal & Memory Trimming (5 tests)
├── tier3-interactions/
│   └── pairwise-interactions.test.mjs             # 15 Pairwise Cross-Feature Tests
└── tier4-scenarios/
    └── user-scenarios.test.mjs                    # 5 Realistic Workloads & User Journeys
```

---

## Detailed Feature Inventory & Coverage Matrix

### Feature 1: Embed Widget API Routing Fix
- **Contract**: `POST https://vectrabase-api.onrender.com/api/query`
- **Headers**: `Content-Type: application/json`, `x-tenant-id: <uuid>`
- **Tier 1 (5 tests)**: Default base URL resolution, runtime injection check, `widget-frame.html` configuration, `axios.ts` gateway fallback, query payload schema validation.
- **Tier 2 (5 tests)**: Trailing slash trimming (`replace(/\/+$/, '')`), empty/whitespace string fallbacks, HTTP 429 rate limit normalization with `Retry-After`, HTTP 400 guardrail block normalization, offline connection error handling.

### Feature 2: Navbar Author Attribution Removal
- **Contract**: Zero author attribution ('by Karthik Kathari' / 'By Karthik Kathari') below logo in top navbar and widget header while preserving geometric SVG prism icon and layout geometry.
- **Tier 1 (5 tests)**: Navbar brand block exclusion, widget header exclusion, SVG geometric prism preservation, `v1.0` badge preservation, flex layout alignment preservation.
- **Tier 2 (5 tests)**: Case-insensitive scan across branding blocks, mobile viewport logo wrapping, logo link `aria-label` / `title` audit, `widget-frame.html` body audit, layout height preservation (`h-16`).

### Feature 3: Widget Dual-Theme & Library Sync
- **Contract**: `VectraBaseWidget.init({ tenantId, apiUrl, theme?: 'light' | 'dark' })`, synchronized bundles in `apps/web-dashboard/public/widget.js` and `widget.css`.
- **Tier 1 (5 tests)**: `widget.js` bundle presence and global export, `widget.css` presence, `widget-entry.ts` theme parameter acceptance, `WidgetContainer.vue` dual-theme class support, `widget-frame.html` script loading.
- **Tier 2 (5 tests)**: Default theme fallback when omitted, MessageBubble dual-theme class definitions, `widget.css` non-empty file size verification, `widget.js` compiled bundle verification, DOCTYPE and viewport meta tags.

### Feature 4: Typography Standardization
- **Contract**: `Inter` and `JetBrains Mono` standardized site-wide with system fallbacks.
- **Tier 1 (5 tests)**: Inter configured in layout/globals, `fontFamily.sans` in Tailwind config, `fontFamily.mono` in Tailwind config, root body `font-sans` application, antialiasing font smoothing.
- **Tier 2 (5 tests)**: System fallback stack (`-apple-system`, `BlinkMacSystemFont`), monospace fallback stack, `.tabular-nums` CSS declaration for jitter-free numbers, zero novelty display fonts, `overflow-x: hidden` font bleed prevention.

### Feature 5: Design Tokens & UI Primitives
- **Contract**: Gray/white primary (`--background`, `--surface`, `--border`, `--foreground`), purple/red accents, yellow highlights, neon glowing accents.
- **Tier 1 (5 tests)**: Primary surface tokens in `:root` and `.dark`, border and foreground tokens in both modes, purple/red accent tokens, yellow/amber highlight tokens, neon glow shadows in Tailwind.
- **Tier 2 (5 tests)**: Light mode WCAG AA text contrast (>= 4.5:1), dark mode WCAG AA text contrast (>= 4.5:1), Button disabled state opacity, Badge 6 semantic variants, Card dual-theme border tokens.

### Feature 6: Working Light/Dark Mode Navbar Toggle
- **Contract**: Functional ThemeToggle in top navbar switching `class="dark"` on `document.documentElement`.
- **Tier 1 (5 tests)**: ThemeToggle component in Navbar header, `useTheme` hook integration from `next-themes`, `providers.tsx` ThemeProvider `attribute="class"`, DOM simulator `dark` class toggling, accessibility `aria-label="Toggle theme"` and title.
- **Tier 2 (5 tests)**: Rapid 20x sequential theme toggle stability, SSR hydration mounted guard, Sun icon (dark mode) / Moon icon (light mode) conditional rendering, cursor-pointer styling, ThemeProvider `defaultTheme` / `enableSystem`.

### Feature 7: Shell & Marketing Redesign
- **Contract**: Landing Page, Navbar, Collapsible Sidebar, and Footer with zero broken links.
- **Tier 1 (5 tests)**: Landing page hero & CTA, footer internal links to real routes, operational status badge, dashboard collapsible sidebar, workspace status header.
- **Tier 2 (5 tests)**: Zero empty `href="#"` placeholder links in footer, external link `target="_blank"` and `rel="noreferrer"` security, mobile hamburger button toggle paths, sidebar collapse label toggle (`← Collapse` / `→`), navbar sticky backdrop blur.

### Feature 8: Dashboard Pages Redesign
- **Contract**: SaaS Overview (`/dashboard`) and Knowledge Base Studio (`/rag-studio`) dual-theme pages.
- **Tier 1 (5 tests)**: `/dashboard` 4 KPI summary cards, `/dashboard` recent queries stream, `/rag-studio` FILE and URL ingestion tabs, `/rag-studio` indexed document library with chunk counts, dual-theme surface classes.
- **Tier 2 (5 tests)**: File input accepted extension constraint, ingestion progress percentage tracking, stat cards responsive grid-cols, content area `overflow-y-auto`, URL input validation.

### Feature 9: Widget Playground & Lab Redesign
- **Contract**: `/widget-playground` live query execution and embed code generator.
- **Tier 1 (5 tests)**: Target `https://vectrabase-api.onrender.com` for queries, embed snippet specifies production API, embed snippet contains zero `localhost:4000`, interactive query execution with answer state, embedded preview iframe.
- **Tier 2 (5 tests)**: Query error resilience fallback, escaped script tags (`<\/script>`) in iframe template, clipboard copy toast notification, RFC 4122 tenant UUID, query loading state tracking.

### Feature 10: Telemetry & Governance Redesign
- **Contract**: `/telemetry` virtualized table and `/governance` 50-field policy wizard.
- **Tier 1 (5 tests)**: `/telemetry` VirtualizedTable rendering, `@tanstack/react-virtual` DOM element capping, status filters (`CACHE_HIT`, `VECTOR_MISS`, `GUARDRAIL`), `/governance` 5 configuration steps, `useGovernanceDraft` auto-save.
- **Tier 2 (5 tests)**: VirtualizedTable `estimateSize` fixed row height, search debouncing (>= 200ms), safe empty filter results, defaultValues covering HNSW hyperparameters, Field-48 resilience simulation.

### Feature 11: Interactive Components & Glow Accents
- **Contract**: `RAGPipelineVisualizer`, `CommandPalette`, `BenchmarkDrawer`, `InterceptorConsole`.
- **Tier 1 (5 tests)**: Visualizer 4 architecture stages, neon glow / pulse animations, CommandPalette `Ctrl+K` shortcut listener, BenchmarkDrawer latency comparison metrics, InterceptorConsole telemetry listener registration.
- **Tier 2 (5 tests)**: CommandPalette Escape key dismissal, keydown listener cleanup on unmount, visualizer `cacheHitMode` prop handling, BenchmarkDrawer backdrop close handler, InterceptorConsole unregister cleanup on unmount.

---

## Tier 3 & Tier 4 Scenarios

### Tier 3: Pairwise Cross-Feature Interactions
- **Pair 1 [F6 x F1]**: Theme switch while widget query is in-flight does not abort HTTP request.
- **Pair 2 [F6 x F3]**: Navbar theme toggle synchronizes with widget iframe theme configuration.
- **Pair 3 [F6 x F5]**: Switching theme updates background, surface, and border CSS variables simultaneously.
- **Pair 4 [F6 x F7]**: Theme toggle remains accessible and functional inside mobile navigation drawer.
- **Pair 5 [F6 x F10]**: Virtualized table rows adapt surface styles across light/dark modes without scroll desync.
- **Pair 6 [F6 x F11]**: RAGPipelineVisualizer preserves SVG path glow in both light and dark themes.
- **Pair 7 [F9 x F1]**: Playground query runner targets production API gateway URL.
- **Pair 8 [F2 x F7]**: Removing author name from navbar maintains exact 64px header height without layout shift.
- **Pair 9 [F4 x F5]**: Inter font family harmonizes with Tailwind spacing and typography scales.
- **Pair 10 [F10 x F11]**: Governance Field-48 expiry test streams events to InterceptorConsole.
- **Pair 11 [F8 x F10]**: Ingested documents generate telemetry chunk count statistics.
- **Pair 12 [F11 x F7]**: Command Palette provides direct keyboard shortcuts to all primary routes.
- **Pair 13 [F3 x F1]**: Widget error bubbles are legible in both light and dark themes.
- **Pair 14 [F5 x F8]**: Dashboard KPI cards utilize theme surface tokens and borders.
- **Pair 15 [F2 x F3]**: WidgetContainer header maintains clean title and version badge without author name.

### Tier 4: Real-World Workloads & Scenarios
- **Scenario 1 [Evaluator Journey]**: Full workflow from Landing Page -> Quick Launch Sandbox -> Knowledge Base Ingestion -> Playground Query -> 1M Telemetry Virtual Table -> Governance Policy Draft.
- **Scenario 2 [Theme Journey]**: Theme persistence across page navigations through all 5 dashboard routes without hydration flashes.
- **Scenario 3 [Widget Deployment]**: Standalone third-party webpage hosting `#vectrabase-widget`, querying production API gateway, receiving grounded answers and citations.
- **Scenario 4 [UI Stress & Chaos]**: 30 rapid sequential theme toggles + 10 viewport resizes (1920px -> 375px) without state corruption or uncaught exceptions.
- **Scenario 5 [Field-48 Resilience]**: Form mutation during HTTP 401 token expiry; thread-safe refresh interception and zero-data-loss replay.
