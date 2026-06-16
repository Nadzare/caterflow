import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany({
    include: { tenant: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- TENANTS ---');
  const tenants = await prisma.tenant.findMany();
  console.log(JSON.stringify(tenants, null, 2));

  console.log('--- CLIENTS ---');
  const clients = await prisma.client.findMany({
    include: { tenant: true }
  });
  console.log(clients.map(c => ({ id: c.id, name: c.companyName, tenant: c.tenant?.name, tenantId: c.tenantId })));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
