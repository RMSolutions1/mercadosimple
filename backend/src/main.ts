import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await configureApplication(app);

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`🚀 Mercado Simple API corriendo en: http://${host}:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`📚 Documentación disponible en: http://${host}:${port}/api/docs`);
  }
}
bootstrap();
