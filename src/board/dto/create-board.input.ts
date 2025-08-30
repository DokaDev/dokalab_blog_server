import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field({ description: 'Title of the board' })
  title: string;

  @Field({ description: 'Slug of the board (e.g. Development -> devel)' })
  slug: string;

  @Field(() => Int, {
    description: 'Board group ID that this board belongs to',
  })
  boardGroupId: number;
}
