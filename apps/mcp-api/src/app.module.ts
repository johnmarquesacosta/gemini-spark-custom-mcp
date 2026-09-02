import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpAuthModule } from './mcp-auth/mcp-auth.module';
import { McpResourcesModule } from './mcp-resources/mcp-resources.module';
import { LoggerMiddleware } from './logger.middleware';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AssetsModule } from './assets/assets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database:
          configService.get<string>('DB_NAME') ||
          configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('NODE_ENV') !== 'production' ||
          configService.get<string>('TYPEORM_SYNC') === 'true', // Use carefully in production
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    McpAuthModule,
    McpResourcesModule,
    UsersModule,
    PostsModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
