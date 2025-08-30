import { Module } from '@nestjs/common';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BoardModule } from './board/board.module';
import { BoardGroupModule } from './boardgroup/board-group.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql', // nest가 자동으로 schema.gql 파일을 프로젝트 루트에 생성해 준다.
      playground: true,
    }),
    BoardModule,
    BoardGroupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
