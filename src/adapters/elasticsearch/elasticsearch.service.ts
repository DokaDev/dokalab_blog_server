import { Client } from '@elastic/elasticsearch';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { TypedConfigService } from 'src/config/config.service';

@Injectable()
export class ElasticSearchService implements OnModuleDestroy {
  private readonly esNode: string;

  private esClient: Client | null = null;

  constructor(private readonly configService: TypedConfigService) {
    this.esNode = this.configService.get('ES_NODE');
  }

  private get client(): Client {
    return (this.esClient ??= new Client({
      node: this.esNode,
    }));
  }

  public async search(index: string, params: any) {
    return this.client.search({
      index,
      ...params,
    });
  }

  public async bulk(body: any[]) {
    return this.client.bulk({
      body,
    });
  }

  public async update(index: string, id: string, params: any) {
    return this.client.update({
      index,
      id,
      body: params,
    });
  }

  async onModuleDestroy() {
    await this.esClient?.close();
  }
}
