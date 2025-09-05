export function validateBody(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return next({ status: 400, code: 'BAD_REQUEST', message: 'Validation error', details: parsed.error.flatten() });
        }
        req.body = parsed.data;
        next();
    };
}
export function validateParams(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.params);
        if (!parsed.success) {
            return next({ status: 400, code: 'BAD_REQUEST', message: 'Validation error', details: parsed.error.flatten() });
        }
        req.params = parsed.data;
        next();
    };
}
