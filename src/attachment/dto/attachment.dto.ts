import {
  Field,
  ObjectType,
  Int,
  registerEnumType,
  GraphQLISODateTime,
} from '@nestjs/graphql';

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

  // 비즈니스 로직 상 Post row 생성 이전에 첨부파일이 업로드되므로 nullable
  // create 혹은 update 로직을 호출하는 클라이언트단에서 postId Array를 파라미터로 전달 필요
  @Field(() => Int, { nullable: true })
  postId?: number;

  @Field()
  originalFilename: string;

  @Field()
  mimeType: string;

  @Field(() => Int)
  size: number;

  // row가 생성된 시점
  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  // uploadExpiresAt: PENDING 상태에서 일정시간 후 자동삭제용(미업로드 첨부파일 정리)
  // Cron으로 정리 -> Hard Delete
  @Field(() => GraphQLISODateTime)
  uploadExpiresAt: Date;

  // PENDING -> READY 전환 시점으로부터 7일 후 자동삭제용(게시글에 첨부파일이 commit되지 않은 경우 정리)
  @Field(() => GraphQLISODateTime, { nullable: true })
  commitExpiresAt?: Date;

  // committedAt state를 통해 등록된 첨부파일의, 게시글 임베딩 여부 판단
  @Field(() => GraphQLISODateTime, { nullable: true })
  committedAt?: Date | null;
}
