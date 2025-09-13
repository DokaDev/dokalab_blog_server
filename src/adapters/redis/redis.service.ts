import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { TypedConfigService } from 'src/config/config.service';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly REDIS_HOST: string;
  private readonly REDIS_PORT: number;

  constructor(private readonly configService: TypedConfigService) {
    this.REDIS_HOST = this.configService.get('REDIS_HOST');
    this.REDIS_PORT = this.configService.get('REDIS_PORT');
  }

  async onApplicationShutdown() {
    await this.quit();
  }
}
