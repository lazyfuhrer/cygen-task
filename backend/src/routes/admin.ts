import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const router = Router();

// Seed test data
router.post('/seed', async (_req, res, next) => {
  try {
    // Clear existing data first
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();

    // Create test customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0101'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0102'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1-555-0103'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          phone: '+1-555-0104'
        }
      })
    ]);

    // Create test products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Wireless Mouse',
          price: 29.99,
          stock: 50
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mechanical Keyboard',
          price: 89.99,
          stock: 25
        }
      }),
      prisma.product.create({
        data: {
          name: 'Gaming Headset',
          price: 149.99,
          stock: 15
        }
      }),
      prisma.product.create({
        data: {
          name: 'USB-C Hub',
          price: 45.99,
          stock: 30
        }
      }),
      prisma.product.create({
        data: {
          name: 'Monitor Stand',
          price: 79.99,
          stock: 20
        }
      }),
      prisma.product.create({
        data: {
          name: 'Desk Lamp',
          price: 35.99,
          stock: 40
        }
      })
    ]);

    // Create test orders
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          customerId: customers[0].id,
          status: 'COMPLETED',
          items: {
            create: [
              {
                productId: products[0].id,
                quantity: 2,
                price: products[0].price
              },
              {
                productId: products[1].id,
                quantity: 1,
                price: products[1].price
              }
            ]
          }
        },
        include: { items: true, customer: true }
      }),
      prisma.order.create({
        data: {
          customerId: customers[1].id,
          status: 'PENDING',
          items: {
            create: [
              {
                productId: products[2].id,
                quantity: 1,
                price: products[2].price
              },
              {
                productId: products[3].id,
                quantity: 3,
                price: products[3].price
              }
            ]
          }
        },
        include: { items: true, customer: true }
      }),
      prisma.order.create({
        data: {
          customerId: customers[2].id,
          status: 'COMPLETED',
          items: {
            create: [
              {
                productId: products[4].id,
                quantity: 1,
                price: products[4].price
              }
            ]
          }
        },
        include: { items: true, customer: true }
      }),
      prisma.order.create({
        data: {
          customerId: customers[3].id,
          status: 'CANCELLED',
          items: {
            create: [
              {
                productId: products[5].id,
                quantity: 2,
                price: products[5].price
              }
            ]
          }
        },
        include: { items: true, customer: true }
      })
    ]);

    res.json({
      message: 'Test data seeded successfully',
      data: {
        customers: customers.length,
        products: products.length,
        orders: orders.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// Clear all data
router.delete('/clear', async (_req, res, next) => {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();

    res.json({
      message: 'All data cleared successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Get data statistics
router.get('/stats', async (_req, res, next) => {
  try {
    const [customersCount, productsCount, ordersCount, orderItemsCount] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.orderItem.count()
    ]);

    res.json({
      customers: customersCount,
      products: productsCount,
      orders: ordersCount,
      orderItems: orderItemsCount
    });
  } catch (err) {
    next(err);
  }
});
