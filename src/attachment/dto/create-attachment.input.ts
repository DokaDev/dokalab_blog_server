import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateAttachmentInput {
  @Field()
  originalFileName: string;

  @Field(() => Int)
  size: number;

  @Field()
  mimeType: string;
}
