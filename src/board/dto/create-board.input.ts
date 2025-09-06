import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@InputType()
export class CreateBoardInput {
  @Field({ description: 'Title of the board' })
  @IsString()
  title: string;

  @Field({ description: 'Slug of the board (e.g. Development -> devel)' })
  @IsString()
  slug: string;

  @Field(() => Int, {
    description: 'Board group ID that this board belongs to',
  })
  @IsInt()
  boardGroupId: number;
}
