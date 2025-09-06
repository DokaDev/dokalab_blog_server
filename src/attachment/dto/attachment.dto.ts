import { Field, ObjectType, Int, registerEnumType } from '@nestjs/graphql';

export enum AttachmentUploadState {
  PENDING = 'PENDING',
  READY = 'READY',
}

registerEnumType(AttachmentUploadState, {
  name: 'AttachmentUploadState',
});

@ObjectType()
export class AttachmentDto {
  @Field(() => Int)
  id: number;

  @Field(() => AttachmentUploadState)
  uploadState: AttachmentUploadState;

  @Field(() => Int)
  postId: number;

  @Field()
  originalFilename: string;

  @Field()
  key: string;

  @Field()
  mimeType: string;

  @Field(() => Int)
  size: number;

  @Field()
  uploadedAt: Date;
}
