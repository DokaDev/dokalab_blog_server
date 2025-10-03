import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdatePostInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  renderedContent?: string;

  @Field(() => String, { nullable: true })
  plainContent?: string;

  @Field(() => Boolean, { defaultValue: false })
  isDraft: boolean;

  @Field(() => Int, { nullable: true })
  boardId?: number;
}
