import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('MCP API')
    .setDescription('API Documentation for the Model Context Protocol')
    .setVersion('1.0')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: '/oauth/authorize',
          tokenUrl: '/oauth/token',
          scopes: {
            offline_access: 'Offline Access',
          },
        },
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Confiar no cabeçalho X-Forwarded-Proto de proxies (Traefik/Coolify)
  app.set('trust proxy', 1);

  // Habilitar CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  // O bind para '0.0.0.0' é estritamente necessário para que a porta fique exposta no Docker
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 Servidor NestJS rodando na porta: ${port} (0.0.0.0)`);
}
bootstrap();
