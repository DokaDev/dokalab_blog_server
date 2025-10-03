import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsString()
  renderedContent?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  plainContent?: string | null;

  @Field(() => Boolean, { defaultValue: false })
  isDraft: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  boardId?: number | null;
}
