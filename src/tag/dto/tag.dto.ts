import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TagDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
