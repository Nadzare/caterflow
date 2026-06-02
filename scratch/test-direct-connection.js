const { PrismaClient } = require('@prisma/client');

async function testConnection(url) {
  console.log(`\nTesting connection to: ${url}`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as val`;
    console.log(`✅ SUCCESS! Result:`, result);
    return true;
  } catch (error) {
    console.error(`❌ FAILED! Error:`, error.message || error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  const directUrl = "postgresql://postgres.bzfnfrdvnztmyejskkrs:caterflow123%23@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
  const supabaseNativeUrl = "postgresql://postgres:caterflow123%23@db.bzfnfrdvnztmyejskkrs.supabase.co:5432/postgres";
  const supabaseNativeWithSubdomain = "postgresql://postgres.bzfnfrdvnztmyejskkrs:caterflow123%23@db.bzfnfrdvnztmyejskkrs.supabase.co:5432/postgres";
  const supabasePoolerSession = "postgresql://postgres.bzfnfrdvnztmyejskkrs:caterflow123%23@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

  console.log("Starting direct connection test...");
  await testConnection(directUrl);
  await testConnection(supabaseNativeUrl);
  await testConnection(supabaseNativeWithSubdomain);
  await testConnection(supabasePoolerSession);
}

run();
