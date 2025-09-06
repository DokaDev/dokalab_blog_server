import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/adapters/s3/s3.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { PrismaService } from 'src/adapters/prisma/prisma.service';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  // TODO: object Key Creation Method
  //   public createObjectKey(originalFilename: string)

  async getPresignedUrl(key: string, type: string) {
    return await this.s3.getPresignedUrl(key, type);
  }

  // --
  // public async create(data: CreateAttachmentInput) {
  //   const attachment = await this.prisma.attachment.create({
  //     data: {
  //       originalFilename: data.originalFileName,
  //       size: data.size,
  //       mimeType: data.mimeType,
  //     },
  //   });
  // }
}
