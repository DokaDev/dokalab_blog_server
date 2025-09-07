import { HeadObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
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
        accessKeyId: process.env.MINIO_ROOT_USER!,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
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

  // 버킷이 존재하는가?
  async isBucketAvailable() {
    // S3 버킷이 유효한지 확인하는 로직 구현 (예: 버킷 존재 여부 확인)
    try {
      await this.s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME });
      return true;
    } catch {
      return false;
    }
  }

  // 버킷 생성
  async createBucket() {
    try {
      await this.s3.createBucket({ Bucket: process.env.S3_BUCKET_NAME });
      return true;
    } catch (error) {
      console.error('Error creating bucket:', error);
      return false;
    }
  }

  async isAvailableFile(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });

      const response = await this.s3.send(command);

      return !!response; // 파일이 존재하면 true, 없으면 false
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        return false;
      }
    }
    return false;
  }
}
