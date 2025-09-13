import Joi from 'joi';
import { createTypedConfig } from 'nestjs-typed-config';

export const { TypedConfigService, TypedConfigModule } = createTypedConfig({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  S3_ENDPOINT: Joi.string().default('http://localhost:9000'),
  S3_BUCKET_NAME: Joi.string().default('blog.dokalab.uk'),
  MINIO_ROOT_USER: Joi.string().default('minioadmin'),
  MINIO_ROOT_PASSWORD: Joi.string().default('minioadmin'),
});

export type TypedConfigService = InstanceType<typeof TypedConfigService>;
