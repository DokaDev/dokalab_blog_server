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
  MINIO_ROOT_USER: Joi.string().default('s3admin'),
  MINIO_ROOT_PASSWORD: Joi.string().default('s3admin'),
  JWT_SECRET: Joi.string()
    .min(32)
    .default('your_jwt_secret_key_here_at_least_32_characters_long_dev'),
  ES_NODE: Joi.string().default('http://localhost:9200'),
});

export type TypedConfigService = InstanceType<typeof TypedConfigService>;
