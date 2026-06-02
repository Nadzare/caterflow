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
  const originalUrl = process.env.DATABASE_URL || "postgresql://postgres.bzfnfrdvnztmyejskkrs:caterflow123%23@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  // Try original first
  await testConnection(originalUrl);

  // Try some other potential hosts/regions
  const regions = [
    'aws-0-ap-southeast-1',
    'aws-1-ap-southeast-1',
    'aws-2-ap-southeast-1',
    'aws-3-ap-southeast-1',
    'aws-0-ap-northeast-1',
    'aws-1-ap-northeast-1',
    'aws-2-ap-northeast-1',
    'aws-3-ap-northeast-1',
    'aws-0-us-east-1',
    'aws-0-us-west-1',
    'aws-0-eu-central-1',
  ];

  for (const region of regions) {
    // Reconstruct connection pooler url with different region host
    const testUrl = `postgresql://postgres.bzfnfrdvnztmyejskkrs:caterflow123%23@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    const success = await testConnection(testUrl);
    if (success) {
      console.log(`\n🎉 Found working region! The correct region is: ${region}`);
      console.log(`Suggested DATABASE_URL: ${testUrl}`);
      break;
    }
  }
}

run();
