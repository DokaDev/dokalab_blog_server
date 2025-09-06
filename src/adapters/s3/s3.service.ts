import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly PRESIGNED_URL_EXPIRATION = 60 * 15; // 15 minutes

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.S3_ENDPOINT,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async getPresignedUrl(key: string, type: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: type,
      ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.PRESIGNED_URL_EXPIRATION,
    });

    return presignedUrl;
  }
}
