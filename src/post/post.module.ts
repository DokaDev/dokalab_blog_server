import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/adapters/prisma/prisma.module';
import { CacheModule } from 'src/cache/cache.module';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { ElasticSearchModule } from 'src/adapters/elasticsearch/elasticsearch.module';

@Module({
  imports: [PrismaModule, CacheModule, ElasticSearchModule],
  providers: [PostService, PostResolver],
  exports: [],
})
export class PostModule {}
