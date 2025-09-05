import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validateBody, validateParams } from '../middlewares/validate.js';

export const router = Router();

const productBodySchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

const idParams = z.object({ id: z.string().uuid() });

router.get('/', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post('/', validateBody(productBodySchema), async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', validateParams(idParams), async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateParams(idParams), validateBody(productBodySchema.partial()), async (req, res, next) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', validateParams(idParams), async (req, res, next) => {
  try {
    // Check if product has any order items
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: req.params.id }
    });

    if (orderItemsCount > 0) {
      return res.status(400).json({ 
        error: { 
          code: 'PRODUCT_HAS_ORDER_ITEMS', 
          message: `Cannot delete product. Product is referenced in ${orderItemsCount} order item(s). Please delete the orders first.` 
        } 
      });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
