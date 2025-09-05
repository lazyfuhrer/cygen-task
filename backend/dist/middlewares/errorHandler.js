export function errorHandler(err, _req, res, _next) {
    const status = typeof err?.status === 'number' ? err.status : 500;
    const code = err?.code || 'INTERNAL_ERROR';
    const message = err?.message || 'Something went wrong';
    const details = err?.details;
    if (status >= 500) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
    res.status(status).json({ error: { code, message, details } });
}
