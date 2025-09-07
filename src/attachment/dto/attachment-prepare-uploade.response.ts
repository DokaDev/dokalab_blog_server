import { Field, ObjectType } from '@nestjs/graphql';
import { AttachmentDto } from './attachment.dto';

@ObjectType()
export class AttachmentPrepareUploadResponse {
  @Field(() => AttachmentDto)
  attachment: AttachmentDto;

  @Field()
  presignedUrl: string;
}
