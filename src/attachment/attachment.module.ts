import { Module } from '@nestjs/common';
import { S3Module } from 'src/adapters/s3/s3.module';
import { AttachmentService } from './attachment.service';
import { PrismaModule } from 'src/adapters/prisma/prisma.module';

@Module({
  imports: [S3Module, PrismaModule],
  providers: [AttachmentService],
})
export class AttachmentModule {}
