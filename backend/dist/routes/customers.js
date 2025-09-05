import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validateBody, validateParams } from '../middlewares/validate.js';
export const router = Router();
const customerBodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(3).optional().nullable(),
});
const idParams = z.object({ id: z.string().uuid() });
router.get('/', async (_req, res, next) => {
    try {
        const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(customers);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', validateBody(customerBodySchema), async (req, res, next) => {
    try {
        const customer = await prisma.customer.create({ data: req.body });
        res.status(201).json(customer);
    }
    catch (err) {
        if (err.code === 'P2002') {
            if (err.meta?.target?.includes('email')) {
                return res.status(400).json({
                    error: {
                        code: 'DUPLICATE_EMAIL',
                        message: 'A customer with this email already exists'
                    }
                });
            }
            if (err.meta?.target?.includes('phone')) {
                return res.status(400).json({
                    error: {
                        code: 'DUPLICATE_PHONE',
                        message: 'A customer with this phone number already exists'
                    }
                });
            }
        }
        next(err);
    }
});
router.get('/:id', validateParams(idParams), async (req, res, next) => {
    try {
        const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
        if (!customer)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        res.json(customer);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', validateParams(idParams), validateBody(customerBodySchema.partial()), async (req, res, next) => {
    try {
        const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
        res.json(customer);
    }
    catch (err) {
        if (err.code === 'P2002') {
            if (err.meta?.target?.includes('email')) {
                return res.status(400).json({
                    error: {
                        code: 'DUPLICATE_EMAIL',
                        message: 'A customer with this email already exists'
                    }
                });
            }
            if (err.meta?.target?.includes('phone')) {
                return res.status(400).json({
                    error: {
                        code: 'DUPLICATE_PHONE',
                        message: 'A customer with this phone number already exists'
                    }
                });
            }
        }
        next(err);
    }
});
router.delete('/:id', validateParams(idParams), async (req, res, next) => {
    try {
        // Check if customer has any orders
        const ordersCount = await prisma.order.count({
            where: { customerId: req.params.id }
        });
        if (ordersCount > 0) {
            return res.status(400).json({
                error: {
                    code: 'CUSTOMER_HAS_ORDERS',
                    message: `Cannot delete customer. Customer has ${ordersCount} order(s). Please delete the orders first.`
                }
            });
        }
        await prisma.customer.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
