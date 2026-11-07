import asyncio
import asyncpg

DATABASE_URL = "postgresql://neondb_owner:npg_oY0GrB7iVnPF@ep-holy-wind-b3kqyoiy.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

async def test_connection():
    print("Connecting to Neon Lakebase Postgres via asyncpg...")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        val = await conn.fetchval("SELECT 1;")
        print(f"✅ Connection successful! SELECT 1 returned: {val}")

        ext = await conn.fetch("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
        print(f"✅ pgvector extension detected: {ext}")

        tenants = await conn.fetch('SELECT id, name, plan FROM "Tenant" LIMIT 5;')
        print(f"✅ Fetched {len(tenants)} tenant(s) from Neon:")
        for t in tenants:
            print(f"  - Tenant ID: {t['id']} | Name: {t['name']} | Plan: {t['plan']}")

        chunks = await conn.fetch('SELECT id, "chunkIndex", "tokenCount" FROM "DocumentChunk" LIMIT 3;')
        print(f"✅ Fetched {len(chunks)} document chunk(s) from Neon:")
        for c in chunks:
            print(f"  - Chunk ID: {c['id']} | Index: {c['chunkIndex']} | Tokens: {c['tokenCount']}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
