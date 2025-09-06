import { Module } from '@nestjs/common';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BoardModule } from './board/board.module';
import { BoardGroupModule } from './boardgroup/board-group.module';
import { PostModule } from './post/post.module';
import { AttachmentModule } from './attachment/attachment.module';
import { S3Module } from './adapters/s3/s3.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: process.env.NODE_ENV === 'production' || true,
      introspection: process.env.NODE_ENV === 'production' || true,
    }),
    BoardModule,
    BoardGroupModule,
    PostModule,
    S3Module,
    AttachmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
