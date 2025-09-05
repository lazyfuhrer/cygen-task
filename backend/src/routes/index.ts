import { Router } from 'express';
import { router as customersRouter } from './customers.js';
import { router as productsRouter } from './products.js';
import { router as ordersRouter } from './orders.js';
import { router as adminRouter } from './admin.js';

export const router = Router();

router.use('/customers', customersRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/admin', adminRouter);

router.get('/', (_req, res) => {
  res.json({ message: 'API v1' });
});
