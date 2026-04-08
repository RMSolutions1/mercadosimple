import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';
import { AppModule } from './app.module';
import { configureApplication } from './configure-app';

let cached: ReturnType<typeof serverless> | null = null;

async function getServerlessHandler(): Promise<ReturnType<typeof serverless>> {
  if (cached) return cached;
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined,
  });
  await configureApplication(app);
  await app.init();
  cached = serverless(expressApp);
  return cached;
}

/** Handler por defecto para Vercel (api/index.js re-exporta desde dist). */
export default async function handler(req: express.Request, res: express.Response) {
  const h = await getServerlessHandler();
  return h(req, res);
}
