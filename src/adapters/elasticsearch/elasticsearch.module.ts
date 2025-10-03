import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elasticsearch.service';

@Module({
  providers: [ElasticSearchService],
  exports: [ElasticSearchService],
})
export class ElasticSearchModule {}
