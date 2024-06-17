import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000','http://localhost:4200'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,
  };
  
  app.enableCors(corsOptions);

  app.use('/upload', express.static('upload'));
  
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );
  await app.listen(3000);

}
bootstrap();
