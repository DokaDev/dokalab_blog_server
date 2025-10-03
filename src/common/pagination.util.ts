import { Injectable, PipeTransform } from '@nestjs/common';
import { Args, ArgsOptions, Field, InputType } from '@nestjs/graphql';

@Injectable()
export class PaginationTransformPipe implements PipeTransform {
  transform(
    graphqlPaginationArgs: GraphQLPaginationArgs,
  ): PrismaCompatiblePaginationArgs {
    return {
      skip:
        (graphqlPaginationArgs.pageNumber - 1) * graphqlPaginationArgs.pageSize,
      take: graphqlPaginationArgs.pageSize,
    };
  }
}

@InputType()
export class GraphQLPaginationArgs {
  @Field(() => Number)
  pageNumber: number;

  @Field(() => Number)
  pageSize: number;
}

export class PrismaCompatiblePaginationArgs {
  skip: number;
  take: number;
}

// @Decorator
export const OffsetPaginationArgs = (options?: ArgsOptions) => {
  return Args(
    'pagination',
    {
      type: () => GraphQLPaginationArgs,
      ...options,
    },
    PaginationTransformPipe,
  );
};
