import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Friendly root status endpoint for load balancers and uptime monitors
  expressApp.get('/', (_req: any, res: any) => {
    res.status(200).json({
      name: 'Grace of God Mission Asaba API',
      status: 'online',
      version: '1.0.0',
      health: '/api/v1/health',
      timestamp: new Date().toISOString(),
    });
  });
  
  app.use(helmet());
  const express = await import('express');
  app.use(express.default.json({ limit: '10mb' }));
  app.use(express.default.urlencoded({ limit: '10mb', extended: true }));
  app.use(pinoHttp({
    genReqId(request, response) {
      const suppliedId = request.headers['x-request-id'];
      const requestId = typeof suppliedId === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(suppliedId)
        ? suppliedId
        : randomUUID();
      response.setHeader('x-request-id', requestId);
      return requestId;
    },
    customLogLevel(_request, response, error) {
      if (error || response.statusCode >= 500) return 'error';
      if (response.statusCode >= 400) return 'warn';
      return 'info';
    },
    customProps(request) {
      return { requestId: request.id };
    },
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    serializers: {
      req(request) {
        return {
          id: request.id,
          method: request.method,
          url: request.url?.split('?')[0],
        };
      },
      res(response) {
        return { statusCode: response.statusCode };
      },
    },
  }));
  
  const rawCors = configService.get<string>('CORS_ORIGIN') || '';
  const configuredOrigins = rawCors
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin) return callback(null, true);
      const clean = requestOrigin.replace(/\/$/, '');

      const isAllowed =
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(clean) ||
        configuredOrigins.some((pattern) => {
          if (pattern.startsWith('*.')) {
            const domain = pattern.slice(2);
            return clean.endsWith(`.${domain}`) || clean === `https://${domain}` || clean === `http://${domain}`;
          }
          return false;
        }) ||
        // Production fallback: ensure main frontend & preview deployments remain operational even if host env is unset
        clean === 'https://ggmasaba.vercel.app' ||
        clean.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const nodeEnv = configService.get('NODE_ENV');
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Grace of God Mission Asaba API')
      .setDescription('API documentation for Phase 1')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port, '0.0.0.0');
}

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED_REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', err);
});

await bootstrap();
