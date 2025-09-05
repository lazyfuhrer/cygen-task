import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const [alice, bob] = await Promise.all([
    prisma.customer.create({ data: { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-1001' } }),
    prisma.customer.create({ data: { name: 'Bob Smith', email: 'bob@example.com', phone: '555-1002' } }),
  ]);

  const [widget, gadget, doodad] = await Promise.all([
    prisma.product.create({ data: { name: 'Widget', price: 19.99, stock: 100 } }),
    prisma.product.create({ data: { name: 'Gadget', price: 49.99, stock: 50 } }),
    prisma.product.create({ data: { name: 'Doodad', price: 5.25, stock: 200 } }),
  ]);

  const order1 = await prisma.order.create({
    data: {
      customerId: alice.id,
      status: OrderStatus.COMPLETED,
      items: {
        create: [
          { productId: widget.id, quantity: 2, price: widget.price },
          { productId: doodad.id, quantity: 5, price: doodad.price },
        ],
      },
    },
    include: { items: true },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: bob.id,
      status: OrderStatus.PENDING,
      items: {
        create: [
          { productId: gadget.id, quantity: 1, price: gadget.price },
        ],
      },
    },
    include: { items: true },
  });

  console.log('Created orders:', order1.id, order2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
