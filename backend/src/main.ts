import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);  app.enableCors({
	origin: 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
  }); //(Cross-Origin Resource Sharing)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Expose the 'uploads' folder so uploaded images are accessible
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Accessible via http://localhost:3000/uploads/...
  });
  
  // Expose the 'assets' folder for default images
  app.useStaticAssets(join(__dirname, '..', 'assets'), {
    prefix: '/assets/',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
