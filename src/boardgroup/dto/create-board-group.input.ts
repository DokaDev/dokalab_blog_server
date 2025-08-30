import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBoardGroupInput {
  @Field({ description: 'Title of the board group' })
  title: string;
}
