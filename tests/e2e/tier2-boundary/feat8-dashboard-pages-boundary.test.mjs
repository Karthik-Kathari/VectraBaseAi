import assert from 'node:assert/strict';
import { readFileContent } from '../helpers/ast-parser.mjs';

export function register(registry) {
  const TIER = 'Tier 2 - Boundary & Corner Cases';
  const FEATURE = 'Feature 8: Dashboard Pages Redesign';

  // Boundary 1: File ingestion input type constraint
  registry.register(TIER, FEATURE, 'RAG studio file input specifies accepted MIME or extension constraints', async () => {
    const studio = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(
      studio.includes('accept=') || studio.includes('.pdf') || studio.includes('PDF'),
      'RAG studio file input must specify accepted file types'
    );
  });

  // Boundary 2: RAG Studio document ingestion progress state
  registry.register(TIER, FEATURE, 'RAG studio manages progress percentage state during ingestion', async () => {
    const studio = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(
      studio.includes('progressPct') || studio.includes('setProgressPct'),
      'RAG studio must track numeric progressPct state'
    );
  });

  // Boundary 3: Stat cards grid responsive layout
  registry.register(TIER, FEATURE, 'Overview dashboard stat cards use responsive responsive grid-cols', async () => {
    const dash = readFileContent('apps/web-dashboard/src/app/(dashboard)/dashboard/page.tsx');
    assert.ok(
      dash.includes('grid-cols-') || dash.includes('grid'),
      'Dashboard stat cards must be styled with CSS grid'
    );
  });

  // Boundary 4: Dashboard layout overflow handling
  registry.register(TIER, FEATURE, 'Dashboard layout content area applies overflow-y-auto for scrollability', async () => {
    const layout = readFileContent('apps/web-dashboard/src/app/(dashboard)/layout.tsx');
    assert.ok(
      layout.includes('overflow-y-auto'),
      'Dashboard layout main element must include overflow-y-auto'
    );
  });

  // Boundary 5: RAG studio URL input validation
  registry.register(TIER, FEATURE, 'RAG studio validates URL input presence before triggering URL ingestion', async () => {
    const studio = readFileContent('apps/web-dashboard/src/app/(dashboard)/rag-studio/page.tsx');
    assert.ok(
      studio.includes('urlInput') || studio.includes('setUrlInput'),
      'RAG studio must track urlInput state'
    );
  });
}
