import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/adapters/s3/s3.service';
import { AttachmentService } from './attachment.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AttachmentCleanupService {
  constructor(
    private readonly s3: S3Service,
    private readonly attachmentService: AttachmentService,
  ) {}

  @Cron('0 2 * * 0') // run at 2:00 AM every Sunday
  async handleCleanup() {
    await this.attachmentService.cleanupPendingAttachments();
    await this.attachmentService.cleanupUncommittedAttachments();
  }
}
