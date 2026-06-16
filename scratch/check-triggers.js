const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers
    `;
    console.log('--- Database Triggers ---');
    console.log(JSON.stringify(triggers, null, 2));
  } catch (err) {
    console.error('Error querying triggers:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
