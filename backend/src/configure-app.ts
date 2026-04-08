import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';

/**
 * Configuración HTTP compartida: servidor tradicional (main.ts) y Vercel (serverless.ts).
 */
export async function configureApplication(app: INestApplication): Promise<void> {
  app.use((helmet as any).default ? (helmet as any).default() : (helmet as any)());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fromEnv = frontendUrl.split(',').map((url) => url.trim()).filter(Boolean);
  const extra = (process.env.CORS_EXTRA_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = [
    ...new Set([...fromEnv, ...extra, 'https://mercadosimple-web.fly.dev']),
  ];

  const isDevLocalOrigin = (o: string) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(o);

  const allowAnyVercelApp = process.env.CORS_ALLOW_VERCEL_APP === 'true';
  const isVercelAppOrigin = (o: string) => /^https:\/\/[^\s/]+\.vercel\.app$/i.test(o);

  app.enableCors({
    origin: (origin, callback) => {
      const devOk =
        process.env.NODE_ENV !== 'production' && !!origin && isDevLocalOrigin(origin);
      const vercelOk = allowAnyVercelApp && !!origin && isVercelAppOrigin(origin);
      if (!origin || allowedOrigins.includes(origin) || devOk || vercelOk) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mercado Simple API')
      .setDescription('API del marketplace Mercado Simple - Documentación completa')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === 'production') {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken || mpToken.startsWith('TEST-')) {
      // eslint-disable-next-line no-console
      console.warn(
        '⚠️  Producción: MP_ACCESS_TOKEN no está configurado o es de pruebas (TEST-). Configurá un token de producción para pagos reales.',
      );
    }
  }
}
