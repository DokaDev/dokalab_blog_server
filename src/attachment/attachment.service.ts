import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/adapters/s3/s3.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { AttachmentDto } from './dto/attachment.dto';
import { plainToInstance } from 'class-transformer';
import { AttachmentUploadState } from '@prisma/client';
import {
  ONE_DAY_IN_MS,
  ONE_HOUR_IN_MS,
} from 'src/common/constants/time.constant';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  // ------ db level
  async findById(id: number): Promise<AttachmentDto | null> {
    const attachment = await this.prisma.postAttachment.findUnique({
      where: { id },
    });
    return attachment ? plainToInstance(AttachmentDto, attachment) : null;
  }

  async create(data: CreateAttachmentInput): Promise<AttachmentDto> {
    const { originalFileName, size, mimeType } = data;

    await this.ensureBucket();

    const attachment = await this.prisma.postAttachment.create({
      data: {
        originalFilename: originalFileName,
        size,
        mimeType,
        uploadExpiresAt: new Date(Date.now() + 3 * ONE_HOUR_IN_MS), // 3 hours
      },
    });

    return plainToInstance(AttachmentDto, attachment);
  }

  async updateAttachmentToPendingCommit(attachmentId: number) {
    return await this.prisma.postAttachment.update({
      where: { id: attachmentId },
      data: {
        uploadState: AttachmentUploadState.READY,
        commitExpiresAt: new Date(Date.now() + 7 * ONE_DAY_IN_MS), // 7 days
      },
    });
  }

  async commitAttachments(postId: number, attachmentIds: number[]) {
    // updateMany 사용
    const updatedAttachments = await this.prisma.postAttachment.updateMany({
      where: {
        id: { in: attachmentIds },
      },
      data: {
        postId,
        committedAt: new Date(),
      },
    });

    // updateMany는 영향을 받은 행 수를 반환하므로, 실제 업데이트된 행을 다시 조회
    const updatedAttachmentRecords = await this.prisma.postAttachment.findMany({
      where: {
        id: { in: attachmentIds },
      },
    });

    return plainToInstance(AttachmentDto, updatedAttachmentRecords);
  }

  /**
   * attachment는 soft delete 없이 실제 삭제 처리
   * S3에서도 파일 삭제
   * @param attachmentId
   * @returns
   */
  async delete(attachmentId: number): Promise<AttachmentDto> {
    // s3에서 먼저 삭제 -> 실제로 삭제되었는지 확인 후 -> db에서 삭제
    const attachment = await this.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const key = this.getObjectKey(attachment);
    await this.s3.deleteFile(key);

    const isFileRemaining = await this.s3.isAvailableFile(key);
    if (isFileRemaining) {
      throw new Error('Failed to delete file from S3');
    }

    await this.prisma.postAttachment.delete({
      where: { id: attachmentId },
    });

    return attachment;
  }

  // ------
  // s3 level

  public getObjectKey(attachment: AttachmentDto) {
    const { id, originalFilename } = attachment;
    return `${id}/${originalFilename}`;
  }

  async getPresignedUrl(key: string, type: string) {
    return await this.s3.getPresignedUrl(key, type);
  }

  // 버킷이 있으면 생성하지 않고, 없으면 생성
  async ensureBucket() {
    if (!(await this.s3.isBucketAvailable())) {
      await this.s3.createBucket();
    }
  }

  async isAvailableFile(key: string) {
    // S3에 해당 key로 파일이 존재하는지 확인
    const file = await this.s3.isAvailableFile(key);

    return true;
  }

  // -------
  async cleanupPendingAttachments() {
    const now = new Date();

    await this.prisma.postAttachment.deleteMany({
      where: {
        uploadState: AttachmentUploadState.PENDING,
        uploadExpiresAt: { lt: now },
      },
    });
  }

  async cleanupUncommittedAttachments() {
    const now = new Date();

    const uncommittedFiles = await this.prisma.postAttachment.findMany({
      where: {
        uploadState: AttachmentUploadState.READY,
        commitExpiresAt: { lt: now },
        committedAt: null,
      },
    });

    for (const file of uncommittedFiles) {
      const key = this.getObjectKey(plainToInstance(AttachmentDto, file));

      await this.s3.deleteFile(key);
      await this.prisma.postAttachment.delete({
        where: { id: file.id },
      });
    }
  }
}
