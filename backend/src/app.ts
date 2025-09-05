import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.ORIGIN ?? '*' }));
  app.use(express.json());

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
