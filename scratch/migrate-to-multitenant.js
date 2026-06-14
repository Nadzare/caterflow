const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Starting migration to multi-tenant...');

  try {
    // 1. Create or get default tenant
    let defaultTenant = await prisma.tenant.findUnique({
      where: { name: 'CaterFlow Utama' },
    });

    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: {
          name: 'CaterFlow Utama',
        },
      });
      console.log('Created default tenant: "CaterFlow Utama"');
    } else {
      console.log('Default tenant "CaterFlow Utama" already exists');
    }

    // 2. Set owner@caterflow.com to SUPER_ADMIN (no tenant)
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@caterflow.com' },
    });

    if (owner) {
      await prisma.user.update({
        where: { email: 'owner@caterflow.com' },
        data: {
          role: 'SUPER_ADMIN',
          tenantId: null,
        },
      });
      console.log('Updated owner@caterflow.com to SUPER_ADMIN role');
    } else {
      console.log('owner@caterflow.com not found');
    }

    // 3. Link other users to default tenant
    const usersUpdated = await prisma.user.updateMany({
      where: {
        email: {
          not: 'owner@caterflow.com',
        },
        tenantId: null,
      },
      data: {
        tenantId: defaultTenant.id,
      },
    });
    console.log(`Linked ${usersUpdated.count} users to default tenant`);

    // 4. Link clients to default tenant
    const clientsUpdated = await prisma.client.updateMany({
      where: {
        tenantId: null,
      },
      data: {
        tenantId: defaultTenant.id,
      },
    });
    console.log(`Linked ${clientsUpdated.count} clients to default tenant`);

    // 5. Link menus to default tenant
    const menusUpdated = await prisma.menu.updateMany({
      where: {
        tenantId: null,
      },
      data: {
        tenantId: defaultTenant.id,
      },
    });
    console.log(`Linked ${menusUpdated.count} menus to default tenant`);

    // 6. Link orders to default tenant
    const ordersUpdated = await prisma.order.updateMany({
      where: {
        tenantId: null,
      },
      data: {
        tenantId: defaultTenant.id,
      },
    });
    console.log(`Linked ${ordersUpdated.count} orders to default tenant`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
