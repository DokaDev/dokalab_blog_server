import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PostFilter {
  @Field(() => Int, { nullable: true, description: 'Filter posts by board ID' })
  boardId?: number;
}
