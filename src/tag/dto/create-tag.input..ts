import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTagInputDto {
  @Field(() => String)
  name: string;
}
