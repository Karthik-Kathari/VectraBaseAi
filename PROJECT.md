# Project: VectraBase AI — Website Review, Core Fixes & Production Redesign

## Architecture
- **Monorepo Structure**: pnpm workspace managed with Turborepo (`turbo.json`).
  - `apps/web-dashboard`: Next.js 15.3.9 (App Router, React 19, TypeScript 5.7, Tailwind CSS 3.4, `next-themes`).
  - `apps/embed-widget`: Vue 3 (Vite 6, Pinia 2.3, Tailwind CSS 3.4, GSAP 3.12). Produces standalone IIFE library bundle `widget.iife.js`.
  - `apps/api-gateway`: Express 4.21.2 API microservice (TypeScript, Prisma ORM, Neon PostgreSQL, Redis, Vitest).
  - `apps/rag-engine`: Python FastAPI RAG microservice (`asyncpg`, `pgvector`, PyMuPDF, pytest).
  - `packages/shared-types`: Common TypeScript types and Zod schemas.
  - `packages/benchmark-suite`: Microbenchmarks.
- **Data Flow**:
  - Web client / embedded widget -> `apps/api-gateway` (`https://vectrabase-api.onrender.com`) -> `apps/rag-engine` (`https://vectrabase-rag.onrender.com`) & Neon Lakebase PostgreSQL.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Embed Widget API Routing Fix | Route widget queries and presets to `https://vectrabase-api.onrender.com` without `net::ERR_CONNECTION_REFUSED` | M1 | Survey / R1 |
| 2 | Navbar Author Attribution Removal | Remove 'by Karthik Kathari' from below VectraBase AI logo in navbar and widget header while preserving layout | M1, M3 | Survey / R1 |
| 3 | Widget Dual-Theme & Library Sync | Enable light/dark theme in embed-widget and synchronize built library bundle to `web-dashboard/public/widget.js` | M1 | Survey / R1, R2 |
| 4 | Typography Standardization | Standardize on clean, modern font family (`Inter` + `JetBrains Mono`) site-wide via `next/font/google` | M2 | Survey / R3 |
| 5 | Design Tokens & UI Primitives | Redesign color palette (Gray/White primary, Purple/Red accents, Yellow highlights, Neon glows) in Tailwind and UI primitives | M2 | Survey / R4 |
| 6 | Working Light/Dark Mode Navbar Toggle | Add functional, accessible Light/Dark theme toggle directly in navbar for desktop and mobile drawer | M3 | Survey / R2 |
| 7 | Shell & Marketing Redesign | Redesign Navbar, Sidebar, Footer, and Landing Page with new color palette and subtle neon glowing accents; fix footer placeholder links | M3 | Survey / R4 |
| 8 | Dashboard Pages Redesign | Redesign SaaS Overview (`/dashboard`) and Knowledge Base Studio (`/rag-studio`) with new color scheme and neon accents | M4 | Survey / R4 |
| 9 | Widget Playground & Lab Redesign | Redesign `/widget-playground` ensuring live queries route properly and iframe mockup supports light/dark themes | M4 | Survey / R1, R4 |
| 10 | Telemetry & Governance Redesign | Redesign `/telemetry` (virtualized table) and `/governance` (50-field wizard) eliminating hardcoded obsidian dark hexes | M4 | Survey / R4 |
| 11 | Interactive Components & Glow Accents | Polish `RAGPipelineVisualizer`, `CommandPalette`, `BenchmarkDrawer`, `InterceptorConsole` with neon purple/cyan glowing paths and pulse dots | M4 | Survey / R4 |
| 12 | E2E Testing Infrastructure | Build independent opaque-box test runner covering Tiers 1-4 across all features, routes, and modes | E2E Track | Survey / R5 |
| 13 | Full Site Verification & 100% E2E Pass | Run workspace verification (`build`, `typecheck`, `test`) and verify zero errors across all pages in both Light & Dark modes | M5 | Survey / R5 |
| 14 | Adversarial Coverage Hardening | White-box adversarial testing (Tier 5) on all interactive paths, mobile viewports, and edge cases | M5 | Survey / R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Widget & API Gateway Routing Fixes | `apps/embed-widget`, `apps/web-dashboard/src/lib/axios.ts`, `apps/web-dashboard/public/widget.js` | none | DONE |
| M2 | Typography, Tokens & UI Primitives | `tailwind.config.ts`, `globals.css`, `layout.tsx`, `components/ui/*` | none | DONE |
| M3 | Navigation, Shell & Marketing Redesign | `Navbar.tsx`, `Footer.tsx`, `(dashboard)/layout.tsx`, `page.tsx` | M2 | DONE |
| M4 | Dashboard Pages & Interactive Visualizers | `/dashboard`, `/rag-studio`, `/widget-playground`, `/telemetry`, `/governance`, `RAGPipelineVisualizer.tsx` | M1, M2, M3 | DONE |
| M5 | Final E2E Suite Pass & Adversarial Hardening | Pass 100% E2E test suite (`TEST_READY.md`) + Tier 5 adversarial testing | M1, M2, M3, M4, E2E | DONE |
| E2E | E2E Testing Track | Requirement-driven test suite (Tiers 1-4) publishing `TEST_READY.md` | none (runs in parallel) | DONE |

## Interface Contracts
### `apps/embed-widget` ↔ `apps/api-gateway`
- **Endpoint**: `POST https://vectrabase-api.onrender.com/api/query`
- **Request Headers**: `Content-Type: application/json`, `x-tenant-id: <uuid>`
- **Request Body**: `{ query: string, stream?: boolean }`
- **Response**: `{ answer: string, confidence: number, matchScore: number, latencyMs: number, cacheStatus: "HIT" | "MISS", citations: Array<{ documentName: string, chunkId: string, text: string }> }`
- **Error Handling**: On network/timeout/connection error, fallback gracefully with status message; never fail with raw unhandled connection refused.

### `apps/web-dashboard` ↔ `apps/embed-widget` (Static Asset Serving)
- **Files**: `apps/web-dashboard/public/widget.js`, `apps/web-dashboard/public/widget.css`
- **Harness**: `apps/web-dashboard/public/widget-frame.html`
- **Window Global**: `window.VectraBaseWidget.init({ tenantId: string, apiUrl: string, theme?: 'light' | 'dark' })`

### Design System Tokens (`apps/web-dashboard`)
- **Theme Attribute**: `class` on `<html>` (`dark` for dark mode, empty or no class for light mode).
- **CSS Variables**:
  - `--background`: Light `#ffffff`, Dark `#090b10`
  - `--surface`: Light `#f8fafc`, Dark `#111827`
  - `--surface-hover`: Light `#f1f5f9`, Dark `#172033`
  - `--border`: Light `#e2e8f0`, Dark `#1e293b`
  - `--border-strong`: Light `#cbd5e1`, Dark `#334155`
  - `--foreground`: Light `#0f172a`, Dark `#f8fafc`
  - `--muted`: Light `#64748b`, Dark `#94a3b8`
  - `--card-bg`: Light `#ffffff`, Dark `#111827`
  - `--accent-purple`: Light `#9333ea`, Dark `#a855f7`
  - `--accent-red`: Light `#e11d48`, Dark `#fb7185`
  - `--highlight-yellow`: Light `#f59e0b`, Dark `#fbbf24`

## Code Layout
- `apps/web-dashboard/src/`: Next.js frontend code
  - `app/`: Next.js App router pages, layouts, styles (`globals.css`, `layout.tsx`, `providers.tsx`)
  - `components/`: React UI components (`Navbar.tsx`, `Footer.tsx`, `RAGPipelineVisualizer.tsx`, `CommandPalette.tsx`, etc.)
  - `components/ui/`: Atomic UI primitives (`Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`)
  - `lib/`: Utilities (`utils.ts`, `axios.ts`, `api.ts`)
  - `public/`: Static assets (`widget.js`, `widget.css`, `widget-frame.html`)
- `apps/embed-widget/src/`: Vue 3 embeddable widget code
  - `components/`: Vue components (`WidgetContainer.vue`, `MessageBubble.vue`, etc.)
  - `stores/`: Pinia state (`chat.ts`)
  - `api/`: API client (`client.ts`)
- `tests/e2e/`: E2E test suite and runner (managed by E2E Testing Track)
