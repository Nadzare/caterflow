const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL="([^"]+)"/)[1];
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: dbUrl } } });

console.log("Verifying connection using URL from .env...");
p.$queryRaw`SELECT 1 as val`
  .then(r => console.log('✅ Success! Database is fully reachable:', r))
  .catch(e => console.error('❌ Failed:', e))
  .finally(() => p.$disconnect());
