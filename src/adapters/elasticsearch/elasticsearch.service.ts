import { Client } from '@elastic/elasticsearch';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  BulkOperationContainer,
  SearchRequest,
} from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { TypedConfigService } from 'src/config/config.service';

@Injectable()
export class ElasticSearchService implements OnModuleDestroy {
  private readonly logger = new Logger(ElasticSearchService.name);
  private readonly esNode: string;

  private esClient: Client | null = null;

  constructor(private readonly configService: TypedConfigService) {
    this.esNode = this.configService.get('ES_NODE');
  }

  private get client(): Client {
    if (!this.esClient) {
      this.esClient = new Client({
        node: this.esNode,
      });
      this.logger.log(
        `Elasticsearch client initialized for node: ${this.esNode}`,
      );
    }
    return this.esClient;
  }

  public async search(
    index: string,
    params: Omit<SearchRequest, 'index'> = {},
  ) {
    return this.client.search({
      index,
      ...params,
    });
  }

  public async bulk(operations: BulkOperationContainer[]) {
    return this.client.bulk({
      operations,
    });
  }

  public async update(index: string, id: string, doc: Record<string, unknown>) {
    return this.client.update({
      index,
      id,
      doc,
    });
  }

  public async index(
    index: string,
    document: Record<string, unknown>,
    id?: string,
  ) {
    return this.client.index({
      index,
      id,
      document,
    });
  }

  public async ensureIndex(index: string): Promise<void> {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      await this.client.indices.create({ index });
    }
  }

  public async delete(index: string, id: string) {
    return this.client.delete({
      index,
      id,
    });
  }

  async onModuleDestroy() {
    if (this.esClient) {
      try {
        await this.esClient.close();
        this.logger.log('Elasticsearch client closed successfully');
      } catch (error) {
        this.logger.error('Failed to close Elasticsearch client', error);
      }
    }
  }
}
