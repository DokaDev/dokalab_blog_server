import { Module } from '@nestjs/common';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BoardModule } from './board/board.module';
import { BoardGroupModule } from './boardgroup/board-group.module';
import { PostModule } from './post/post.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
