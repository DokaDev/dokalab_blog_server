import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BoardModule } from './board/board.module';
import { BoardGroupModule } from './boardgroup/board-group.module';
import { PostModule } from './post/post.module';
import { AttachmentModule } from './attachment/attachment.module';
import { S3Module } from './adapters/s3/s3.module';
import { TypedConfigModule } from './config/config.service';
import { ContextMiddleware } from './auth/context.middleware';
import { AdminGuard } from './auth/guard/admin.guard';
import { LoginGuard } from './auth/guard/login.guard';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from './adapters/redis/redis.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    TypedConfigModule.forRoot({ isGlobal: true, cache: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }) => req.context,
    }),
    RedisModule,
    CacheModule,
    BoardModule,
    BoardGroupModule,
    PostModule,
    S3Module,
    AttachmentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
