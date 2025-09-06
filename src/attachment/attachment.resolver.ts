import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AttachmentService } from './attachment.service';
import { AttachmentDto } from './dto/attachment.dto';
import { CreateAttachmentInput } from './dto/create-attachment.input';

@Resolver(() => AttachmentDto)
export class AttachmentResolver {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Mutation(() => AttachmentDto)
  async attachmentPrepareUpload(@Args('data') data: CreateAttachmentInput) {
    // TODO: attachment 테이블 객체 생성
    // const attachment = await this.attachmentService.create(data);
    // TODO: s3 key 생성
    // TODO: s3 pre-signed url 생성
    // TODO: attachment 객체 + s3 pre-signed url 반환
  }

  @Mutation(() => AttachmentDto, { nullable: true })
  async attachmentCompleteUpload() {
    // TODO: attachment 객체 가져오기
    // 객체 없을 경우 null 그대로 반환
    // TODO: UploadState 상태 검증
    // PENDING일 경우,
    // TODO: key를 가져옴
    // TODO: 해당 key 및 bucket 정보를 바탕으로 올바른 파일인지(isAvailableFile) 검증
    // 올바른 파일일 경우, READY로 상태 변경
    // TODO: attachment 객체 반환
  }

  @Mutation()
  async attachmentDelete() {}
}
