import { Client } from '@elastic/elasticsearch';
import { IndicesCreateRequest } from 'node_modules/@elastic/elasticsearch/lib/api/types';

async function main() {
  console.log('Initializing Elasticsearch indices...');

  const esClient = new Client({
    node: process.env.ES_NODE || 'http://localhost:9200',
  });

  const indexName = 'blog_posts_v1';

  const exists = await esClient.indices.exists({
    index: indexName,
  });
  if (exists) {
    // console.log(`Index "${indexName}" already exists. Skipping creation.`);
    // return;
    await esClient.indices.delete({ index: indexName });
    console.log(`Index "${indexName}" deleted.`);
  }

  const settings = {
    number_of_shards: 1,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        default: {
          type: 'english',
        },
      },
    },
  } as const;

  const mappings = {
    properties: {
      id: { type: 'keyword' },
      postNumber: {
        type: 'integer',
      },
      title: {
        type: 'text',
        analyzer: 'english',
        fields: {
          raw: {
            type: 'keyword',
          },
        },
      },
      plainContent: {
        type: 'text',
        analyzer: 'english',
      },
      createdAt: {
        type: 'date',
      },
      boardId: {
        type: 'integer',
      },
    },
  } as const;

  const body: IndicesCreateRequest = {
    index: indexName,
    settings,
    mappings,
  };

  await esClient.indices.create(body);

  console.log(`Index "${indexName}" created successfully.`);
}
main();
