/**
 * VectraBase AI — Primary Database Seed Script
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { PrismaClient, Plan, UserRole, DocumentStatus, DocumentSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 [Seed] Initializing VectraBase AI Demo Environment...');

  // 1. Create or Find Demo Tenant
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      name: 'VectraBase Demo & Architecture Sandbox',
      slug: 'vectrabase-demo',
      plan: Plan.ENTERPRISE,
    },
    create: {
      id: tenantId,
      name: 'VectraBase Demo & Architecture Sandbox',
      slug: 'vectrabase-demo',
      plan: Plan.ENTERPRISE,
    },
  });
  console.log(`✓ Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Create Principal Admin User: Karthik Kathari
  const passwordHash = await bcrypt.hash('Demo@VectraBase2024!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'karthikmk.workspace@gmail.com' },
    update: {
      role: UserRole.WORKSPACE_OWNER,
      passwordHash,
    },
    create: {
      tenantId: tenant.id,
      email: 'karthikmk.workspace@gmail.com',
      passwordHash,
      role: UserRole.WORKSPACE_OWNER,
    },
  });
  console.log(`✓ Admin User created: ${user.email} (${user.role})`);

  // 3. Create Default 50-Field AI Governance Configuration
  await prisma.governanceConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      workspaceName: 'VectraBase Enterprise RAG',
      workspaceDescription: 'Multi-Tenant Production RAG Knowledge Base engineered by Karthik Kathari',
      contactEmail: 'karthikmk.workspace@gmail.com',
      dataRetentionDays: 90,
      defaultLanguage: 'en',
      timezone: 'Asia/Kolkata',
      logoUrl: '',
      primaryColor: '#06B6D4',
      secondaryColor: '#6366F1',
      supportEmail: 'karthikmk.workspace@gmail.com',

      chunkSize: 512,
      chunkOverlap: 64,
      embeddingModel: 'nomic-embed-text',
      similarityThreshold: 0.72,
      maxChunksPerQuery: 5,
      hnswM: 16,
      hnswEfConstruction: 200,
      hnswEfSearch: 100,
      hybridSearchWeight: 0.7,
      rerankerEnabled: false,

      piiMaskingEnabled: true,
      piiMaskingLevel: 'moderate',
      promptInjectionThreshold: 0.85,
      contentModerationEnabled: true,
      blockedKeywords: ['system prompt', 'ignore previous instructions', 'reveal secret key'],
      maxQueryLength: 2000,
      jailbreakDetection: true,
      hallucinationGuard: true,
      safetyLevel: 'strict',
      auditLogsEnabled: true,

      widgetTitle: 'VectraBase AI Assistant',
      widgetGreeting: '👋 Hello! Ask me anything about your indexed documents.',
      widgetPlaceholder: 'Type your question...',
      widgetPosition: 'bottom-right',
      corsAllowedOrigins: ['*'],
      widgetTheme: 'dark',
      widgetFontFamily: 'Inter',
      showCitationCards: true,
      showTypingIndicator: true,
      widgetBorderRadius: 12,

      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
      maxConcurrentRequests: 10,
      webhookUrl: 'https://vectrabase-api.onrender.com/webhook',
      webhookSecret: 'vb_sec_live_998129384723984712',
      webhookEnabled: false,
      webhookRetryCount: 3,
      cacheTtlSeconds: 60,
      monthlyTokenQuota: 1000000,
    },
  });
  console.log('✓ 50-Field AI Governance Configuration initialized');

  // 4. Create Pre-Indexed Technical Architecture Whitepaper
  const doc = await prisma.document.upsert({
    where: { sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'VectraBase_Architecture_Whitepaper.pdf',
      originalFilename: 'VectraBase_Architecture_Whitepaper.pdf',
      mimeType: 'application/pdf',
      sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      status: DocumentStatus.INDEXED,
      source: DocumentSource.PDF,
      fileSizeBytes: 245760,
      totalChunks: 3,
      totalTokens: 1420,
    },
  });

  const sampleChunks = [
    {
      documentId: doc.id,
      tenantId: tenant.id,
      chunkIndex: 0,
      tokenCount: 480,
      pageNumber: 1,
      content: 'VectraBase AI is a multi-tenant RAG knowledge engine architected by Karthik Kathari. It pairs a Next.js 15 control plane with a lightweight embeddable Vue.js 3 widget, powered by a Node.js Express API gateway, Redis sliding-window rate limiting, and a Python FastAPI microservice using pgvector for hybrid cosine similarity and keyword retrieval.',
    },
    {
      documentId: doc.id,
      tenantId: tenant.id,
      chunkIndex: 1,
      tokenCount: 470,
      pageNumber: 2,
      content: 'The Redis semantic caching engine stores normalized natural-language queries. On a cache hit, verified answers return in under 2ms with 100% LLM token savings. For vector storage, PostgreSQL 16 pgvector utilizes HNSW indexing (m=16, ef_construction=200) for sub-50ms search across up to 1,000,000 document chunks.',
    },
    {
      documentId: doc.id,
      tenantId: tenant.id,
      chunkIndex: 2,
      tokenCount: 470,
      pageNumber: 3,
      content: 'The enterprise AI governance wizard enforces 50 configuration parameters across 5 security tiers: Workspace Identity, Vector Hyperparameters, Guardrails & PII Masking, Widget Branding, and Rate Limits. Dual-layer resilience combines 200ms debounced IndexedDB autosave with an Axios 401 silent JWT refresh interceptor that queues requests and prevents configuration loss.',
    },
  ];

  for (const chunk of sampleChunks) {
    await prisma.documentChunk.create({
      data: chunk,
    });
  }
  console.log(`✓ Sample Document & ${sampleChunks.length} Chunks pre-seeded`);

  console.log('\n🎉 VectraBase AI Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
