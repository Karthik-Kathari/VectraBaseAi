/**
 * VectraBase AI — Neon Lakebase Postgres Verification Script
 * Author: Karthik Kathari
 */

import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Neon Lakebase Postgres Verification ---');
  const tenants = await prisma.tenant.findMany({
    include: {
      users: true,
      governance: true,
      documents: {
        include: {
          chunks: true,
        },
      },
    },
  });

  console.log(`✅ Successfully queried Neon database. Found ${tenants.length} tenant(s).`);
  for (const tenant of tenants) {
    console.log(`Tenant: "${tenant.name}" (ID: ${tenant.id})`);
    console.log(`Plan: ${tenant.plan}`);
    console.log(`Users: ${tenant.users.map((u) => u.email).join(', ')}`);
    console.log(`Documents: ${tenant.documents.length}`);
    for (const doc of tenant.documents) {
      console.log(`  - Doc: "${doc.name}" | Chunks: ${doc.chunks.length} | Status: ${doc.status}`);
    }
    console.log(`Governance Config: Retention ${tenant.governance?.dataRetentionDays} days, Model: ${tenant.governance?.embeddingModel}`);
  }

  // Raw query testing pgvector extension on Neon
  const vectorExt = await prisma.$queryRaw<Array<{ extname: string; extversion: string }>>`
    SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
  `;
  console.log('✅ pgvector extension on Neon:', vectorExt);
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
