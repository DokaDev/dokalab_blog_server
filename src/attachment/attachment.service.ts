import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/adapters/s3/s3.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { AttachmentDto } from './dto/attachment.dto';
import { plainToInstance } from 'class-transformer';
import { AttachmentUploadState } from '@prisma/client';

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
        uploadExpiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      },
    });

    return plainToInstance(AttachmentDto, attachment);
  }

  async updateAttachmentToPendingCommit(attachmentId) {
    return await this.prisma.postAttachment.update({
      where: { id: attachmentId },
      data: {
        uploadState: AttachmentUploadState.READY,
        commitExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async commitAttachments(postId: number, attachmentIds: number[]) {
    // postId, attachmentIds 배열을 받아서 해당 attachment들의 committedAt과 postId를 업데이트
    // const updatedAttachments = await this.prisma.$transaction(
    //   attachmentIds.map((id) =>
    //     this.prisma.postAttachment.update({
    //       where: { id },
    //       data: {
    //         postId,
    //         committedAt: new Date(),
    //       },
    //     }),
    //   ),
    // );
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

  async delete(attachmentId: number): Promise<AttachmentDto> {
    return plainToInstance(
      AttachmentDto,
      await this.prisma.postAttachment.delete({
        where: { id: attachmentId },
      }),
    );
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
}
