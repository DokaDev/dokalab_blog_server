import { Injectable } from '@nestjs/common';
import { deserialize, serialize } from 'node:v8';
import { RedisService } from 'src/adapters/redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async setCache<T>(key: string, data: T, ttlSec?: number): Promise<void> {
    const buf = serialize(data as any);
    if (ttlSec) await this.redisService.set(key, buf, 'EX', ttlSec);
    else await this.redisService.set(key, buf);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const buf = await this.redisService.getBuffer(key);
    if (!buf) return null;

    return deserialize(buf) as T;
  }

  async deleteCache(key: string): Promise<void> {
    await this.redisService.del(key);
  }
}
