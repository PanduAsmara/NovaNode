import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('apiPrefix', '/api/v1');
  const corsOrigin = config.get<string>('corsOrigin', 'http://localhost:3000');
  const port = config.get<number>('port', 4000);

  // Security middleware
  app.use(helmet());
  app.enableCors({ origin: corsOrigin, credentials: true });

  // Global pipes & interceptors
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NovaNode API running on http://localhost:${port}${apiPrefix}`);
}

void bootstrap();
