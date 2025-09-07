import { Args, Int, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { AttachmentService } from './attachment.service';
import { AttachmentDto, AttachmentUploadState } from './dto/attachment.dto';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { AttachmentPrepareUploadResponse } from './dto/attachment-prepare-uploade.response';

@Resolver(() => AttachmentDto)
export class AttachmentResolver {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Mutation(() => AttachmentPrepareUploadResponse)
  async attachmentPrepareUpload(@Args('data') data: CreateAttachmentInput) {
    const attachment = await this.attachmentService.create(data);

    const key = this.attachmentService.getObjectKey(attachment);

    const url = await this.attachmentService.getPresignedUrl(
      key,
      attachment.mimeType,
    );

    return {
      attachment,
      presignedUrl: url,
    };
  }

  @Mutation(() => AttachmentDto, { nullable: true })
  async attachmentCompleteUpload(
    @Args('attachmentId', { type: () => Int }) attachmentId: number,
  ) {
    const attachment = await this.attachmentService.findById(attachmentId);
    if (!attachment) {
      return null;
    }

    if (attachment.uploadState === AttachmentUploadState.PENDING) {
      const key = this.attachmentService.getObjectKey(attachment);
      const isAvailableFile = await this.attachmentService.isAvailableFile(key);

      if (isAvailableFile) {
        return await this.attachmentService.updateAttachmentToPendingCommit(
          attachmentId,
        );
      }
    }

    return attachment;
  }

  @Mutation(() => AttachmentDto)
  async deleteAttachment(
    @Args('attachmentId', { type: () => Int }) attachmentId: number,
  ) {
    const attachment = await this.attachmentService.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    if (await this.attachmentService.delete(attachmentId)) {
      return attachment;
    }

    throw new Error('Failed to delete attachment');
  }

  @Mutation(() => [AttachmentDto])
  async commitAttachments(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('attachmentIds', { type: () => [Int] }) attachmentIds: number[],
  ) {
    return await this.attachmentService.commitAttachments(
      postId,
      attachmentIds,
    );
  }
}
