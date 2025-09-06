import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateBoardGroupInput {
  @Field({ description: 'Title of the board group' })
  @IsString()
  title: string;
}
