import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validateBody, validateParams } from '../middlewares/validate.js';
export const router = Router();
const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});
const orderBodySchema = z.object({
    customerId: z.string().uuid(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    items: z.array(orderItemSchema).min(1),
});
const idParams = z.object({ id: z.string().uuid() });
router.get('/', async (_req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true, customer: true },
        });
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', validateBody(orderBodySchema), async (req, res, next) => {
    try {
        const { customerId, status, items } = req.body;
        const order = await prisma.order.create({
            data: {
                customerId,
                status,
                items: {
                    create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
                },
            },
            include: { items: true, customer: true },
        });
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', validateParams(idParams), async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: { items: true, customer: true },
        });
        if (!order)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', validateParams(idParams), validateBody(orderBodySchema.partial()), async (req, res, next) => {
    try {
        const { customerId, status } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { customerId, status },
            include: { items: true, customer: true },
        });
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', validateParams(idParams), async (req, res, next) => {
    try {
        // First delete all order items associated with this order
        await prisma.orderItem.deleteMany({
            where: { orderId: req.params.id }
        });
        // Then delete the order
        await prisma.order.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
