import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field(() => Int, { description: 'Board ID that the post belongs to' })
  id: number;

  @Field({ description: 'Title of the post' })
  title: string;

  @Field({ description: 'Content of the post' })
  content: string;

  @Field(() => Int, { description: 'Board ID that the post belongs to' })
  boardId: number;
}
