import { Client } from '@elastic/elasticsearch';
import { Post, PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const esClient = new Client({
    node: process.env.ES_NODE || 'http://localhost:9200',
  });

  const posts = await prisma.post.findMany();
  console.log(`Found ${posts.length} posts in the database.`);

  for (const post of posts) {
    await migrate(post, esClient);
  }

  await prisma.$disconnect();
  console.log('Migration completed.');
}

async function migrate(post: Post, client: Client) {
  console.log(`Migrating post ID ${post.id}...`);
  try {
    await client.index({
      index: process.env.ES_INDEX || 'blog_posts_v1',
      id: post.id.toString(),
      document: {
        id: post.id,
        postNumber: post.postNumber,
        title: post.title,
        plainContent: post.plainContent,
        createdAt: post.createdAt,
        boardId: post.boardId,
      },
    });
  } catch (error) {
    console.error(`Error migrating post ID ${post.id}:`, error);
  }
}

main();
