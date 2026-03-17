import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad HTTP headers
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
  const allowedOrigins = frontendUrl.split(',').map((url) => url.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger solo en desarrollo
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
    console.log(`📚 Documentación disponible en: http://localhost:${process.env.PORT || 3001}/api/docs`);
  }

  // Health check endpoint para Docker
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Advertencia Mercado Pago en producción
  if (process.env.NODE_ENV === 'production') {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken || mpToken.startsWith('TEST-')) {
      console.warn(
        '⚠️  Producción: MP_ACCESS_TOKEN no está configurado o es de pruebas (TEST-). Configurá un token de producción para pagos reales.',
      );
    }
  }

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`🚀 Mercado Simple API corriendo en: http://${host}:${port}/api`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
