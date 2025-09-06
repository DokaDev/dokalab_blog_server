import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field({ description: 'Title of the post' })
  @IsString()
  title: string;

  @Field({ description: 'Content of the post' })
  @IsString()
  content: string;

  @Field(() => Int, { description: 'Board ID that the post belongs to' })
  @IsInt()
  boardId: number;

  @Field(() => Boolean, { description: 'Is Draft or Not', defaultValue: false })
  isDraft: boolean;
}
