import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next({ status: 400, code: 'BAD_REQUEST', message: 'Validation error', details: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
}

export function validateParams(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next({ status: 400, code: 'BAD_REQUEST', message: 'Validation error', details: parsed.error.flatten() });
    }
    req.params = parsed.data as any;
    next();
  };
}
