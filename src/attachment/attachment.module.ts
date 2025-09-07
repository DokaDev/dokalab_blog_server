import { Module } from '@nestjs/common';
import { S3Module } from 'src/adapters/s3/s3.module';
import { AttachmentService } from './attachment.service';
import { PrismaModule } from 'src/adapters/prisma/prisma.module';
import { AttachmentResolver } from './attachment.resolver';

@Module({
  imports: [S3Module, PrismaModule],
  providers: [AttachmentService, AttachmentResolver],
})
export class AttachmentModule {}
