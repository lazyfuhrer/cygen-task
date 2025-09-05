import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

describe('Products API', () => {
  beforeAll(async () => {
    // Ensure DB is clean for products
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let productId: string;

  it('creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 9.99, stock: 10 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Test Product');
    productId = res.body.id;
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((p: any) => p.id === productId)).toBeTruthy();
  });

  it('gets a product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
  });

  it('updates a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ stock: 25 });
    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(25);
  });

  it('deletes a product', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
  });
});
