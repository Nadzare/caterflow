import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Users
  const owner = await prisma.user.upsert({
    where: { email: 'owner@caterflow.com' },
    update: { activated: true, role: 'SUPER_ADMIN' },
    create: {
      email: 'owner@caterflow.com',
      name: 'Owner',
      phone: '0851 9085 9889',
      role: 'SUPER_ADMIN',
      activated: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@caterflow.com' },
    update: { activated: true },
    create: {
      email: 'admin@caterflow.com',
      name: 'Admin',
      phone: '081234567890',
      role: 'ADMIN',
      activated: true,
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@caterflow.com' },
    update: { activated: true },
    create: {
      email: 'kitchen@caterflow.com',
      name: 'Kitchen Staff',
      phone: '081234567891',
      role: 'KITCHEN',
      activated: true,
    },
  });

  const logistic = await prisma.user.upsert({
    where: { email: 'logistic@caterflow.com' },
    update: { activated: true },
    create: {
      email: 'logistic@caterflow.com',
      name: 'Logistic Driver',
      phone: '081234567892',
      role: 'LOGISTIC',
      activated: true,
    },
  });

  // 2. Clients (10 B2B Companies)
  const clientData = [
    { companyName: 'TechCorp Indo', picName: 'Budi Santoso', email: 'budi@techcorp.id', phone: '081111111', logisticAddress: 'Jl. Sudirman Kav. 1', dietaryAlerts: { allergies: ['Peanut'], halal: true } },
    { companyName: 'Maju Jaya', picName: 'Siti Aminah', email: 'siti@majujaya.id', phone: '081111112', logisticAddress: 'Jl. Thamrin No. 2', dietaryAlerts: { allergies: [], halal: true } },
    { companyName: 'Global Media', picName: 'Andi Wijaya', email: 'andi@globalmedia.id', phone: '081111113', logisticAddress: 'Jl. Gatot Subroto No. 3', dietaryAlerts: { allergies: ['Dairy'], halal: true } },
    { companyName: 'Nusantara Bakti', picName: 'Dewi Lestari', email: 'dewi@nusantara.id', phone: '081111114', logisticAddress: 'Jl. Rasuna Said Kav. 4', dietaryAlerts: { allergies: ['Seafood'], halal: true } },
    { companyName: 'Karya Cipta', picName: 'Rudi Hermawan', email: 'rudi@karya.id', phone: '081111115', logisticAddress: 'Jl. HR Rasuna Said No. 5', dietaryAlerts: { allergies: [], halal: true, kosher: true } },
    { companyName: 'Cahaya Abadi', picName: 'Rina Marlina', email: 'rina@cahaya.id', phone: '081111116', logisticAddress: 'Jl. Asia Afrika No. 6', dietaryAlerts: { allergies: ['Gluten'], halal: true } },
    { companyName: 'Bintang Terang', picName: 'Agus Setiawan', email: 'agus@bintang.id', phone: '081111117', logisticAddress: 'Jl. Merdeka Barat No. 7', dietaryAlerts: { allergies: [], halal: true } },
    { companyName: 'Sinar Mas', picName: 'Linda Wati', email: 'linda@sinar.id', phone: '081111118', logisticAddress: 'Jl. MH Thamrin No. 8', dietaryAlerts: { allergies: ['Nut'], halal: true } },
    { companyName: 'Pelita Hati', picName: 'Hendra Gunawan', email: 'hendra@pelita.id', phone: '081111119', logisticAddress: 'Jl. Sudirman Kav. 9', dietaryAlerts: { allergies: [], halal: true } },
    { companyName: 'Gajah Mada', picName: 'Maya Sari', email: 'maya@gajahmada.id', phone: '081111120', logisticAddress: 'Jl. Hayam Wuruk No. 10', dietaryAlerts: { allergies: ['Soy'], halal: true } },
  ];

  const clients = [];
  for (const c of clientData) {
    const client = await prisma.client.create({ data: c });
    clients.push(client);
  }

  // 3. Menus (15 Items)
  const menuData = [
    { name: 'Nasi Goreng Spesial', category: 'Main Course', basePrice: 45000, allergenLabels: { contains: ['Egg', 'Soy'] } },
    { name: 'Ayam Bakar Madu', category: 'Main Course', basePrice: 50000, allergenLabels: { contains: ['Soy'] } },
    { name: 'Sate Ayam Madura', category: 'Main Course', basePrice: 40000, allergenLabels: { contains: ['Peanut', 'Soy'] } },
    { name: 'Rendang Sapi', category: 'Main Course', basePrice: 65000, allergenLabels: { contains: [] } },
    { name: 'Gado-Gado Betawi', category: 'Main Course', basePrice: 35000, allergenLabels: { contains: ['Peanut', 'Egg'] } },
    { name: 'Soto Ayam Lamongan', category: 'Soup', basePrice: 40000, allergenLabels: { contains: [] } },
    { name: 'Ikan Bakar Jimbaran', category: 'Main Course', basePrice: 60000, allergenLabels: { contains: ['Seafood'] } },
    { name: 'Mie Goreng Seafood', category: 'Main Course', basePrice: 50000, allergenLabels: { contains: ['Seafood', 'Gluten', 'Soy', 'Egg'] } },
    { name: 'Sayur Asem', category: 'Soup', basePrice: 20000, allergenLabels: { contains: [] } },
    { name: 'Capcay Seafood', category: 'Main Course', basePrice: 45000, allergenLabels: { contains: ['Seafood', 'Soy'] } },
    { name: 'Es Teh Manis', category: 'Beverage', basePrice: 10000, allergenLabels: { contains: [] } },
    { name: 'Es Jeruk', category: 'Beverage', basePrice: 15000, allergenLabels: { contains: [] } },
    { name: 'Kopi Susu Gula Aren', category: 'Beverage', basePrice: 25000, allergenLabels: { contains: ['Dairy'] } },
    { name: 'Puding Coklat', category: 'Dessert', basePrice: 20000, allergenLabels: { contains: ['Dairy'] } },
    { name: 'Buah Campur', category: 'Dessert', basePrice: 15000, allergenLabels: { contains: [] } },
  ];

  const menus = [];
  for (const m of menuData) {
    const menu = await prisma.menu.create({ data: m });
    menus.push(menu);
  }

  // 4. Orders (30 Orders)
  const statuses = ['QUOTATION', 'DP_PAID', 'IN_PRODUCTION', 'DELIVERING', 'COMPLETED'] as const;
  
  for (let i = 0; i < 30; i++) {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // random date within last 30 days
    
    // Pick 2-5 random menus
    const orderItemsCount = Math.floor(Math.random() * 4) + 2;
    let totalAmount = 0;
    const itemsToCreate = [];

    const shuffledMenus = [...menus].sort(() => 0.5 - Math.random());
    const selectedMenus = shuffledMenus.slice(0, orderItemsCount);

    for (const menu of selectedMenus) {
      const quantity = Math.floor(Math.random() * 20) + 10; // 10-30 portions
      const subtotal = menu.basePrice * quantity;
      totalAmount += subtotal;
      
      itemsToCreate.push({
        menuId: menu.id,
        quantity: quantity,
        subtotal: subtotal,
      });
    }

    const order = await prisma.order.create({
      data: {
        clientId: randomClient.id,
        status: randomStatus,
        totalAmount: totalAmount,
        orderDate: randomDate,
        orderItems: {
          create: itemsToCreate
        }
      }
    });

    // Create delivery for DELIVERING or COMPLETED status, or randomly for others
    if (['DELIVERING', 'COMPLETED'].includes(randomStatus) || Math.random() > 0.5) {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          deliveryDate: new Date(randomDate.getTime() + 2 * 24 * 60 * 60 * 1000), // delivery 2 days after order
          deliveryTime: '11:00',
          status: randomStatus === 'COMPLETED' ? 'DELIVERED' : 'SCHEDULED'
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
