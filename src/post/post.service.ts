import { Injectable, Query } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { PostDto, PostStatus } from './dto/post.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto } from 'src/board/dto/board.dto';
import { CreatePostInput } from './dto/create-post.input';
import { calculateReadingTime } from 'src/utils/readtime/readtime.util';
import { UpdatePostInput } from './dto/update-post.input';
import { GraphQLError } from 'graphql';
import { AttachmentDto } from 'src/attachment/dto/attachment.dto';
import { RequestContext } from 'src/auth/context/request-context';
import { PrismaCompatiblePaginationArgs } from 'src/common/pagination.util';
import { ElasticSearchService } from 'src/adapters/elasticsearch/elasticsearch.service';
import { TypedConfigService } from 'src/config/config.service';

@Injectable()
export class PostService {
  private readonly esIndex: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly configService: TypedConfigService,
  ) {
    this.esIndex = this.configService.get('ES_INDEX_POST');
  }

  async findAll(
    context: RequestContext,
    paginationArgs: PrismaCompatiblePaginationArgs,
  ): Promise<PostDto[]> {
    const where: { deletedAt?: null } = {};

    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    const posts = await this.prisma.post.findMany({
      where,
      ...paginationArgs,
      orderBy: {
        id: 'desc',
      },
    });

    return plainToInstance(PostDto, posts);
  }

  async findPostById(
    context: RequestContext,
    id: number,
  ): Promise<PostDto | null> {
    const where: { id: number; deletedAt?: null } = { id };
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    const post = await this.prisma.post.findUnique({
      where,
    });
    if (!post) {
      return null;
    }

    return plainToInstance(PostDto, post);
  }

  async findPostByPostNumber(
    context: RequestContext,
    postNumber: number,
  ): Promise<PostDto | null> {
    const where: { postNumber: number; deletedAt?: null } = { postNumber };
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    const post = await this.prisma.post.findFirst({
      where,
    });
    if (!post) {
      return null;
    }

    return plainToInstance(PostDto, post);
  }

  async searchPosts(
    context: RequestContext,
    paginationArgs: PrismaCompatiblePaginationArgs,
    keyword: string,
  ): Promise<PostDto[]> {
    try {
      // ES에서 검색
      const searchResult = await this.elasticSearchService.search(
        this.esIndex,
        {
          query: {
            multi_match: {
              query: `${keyword}`,
              fields: ['title', 'plainContent'],
              type: 'best_fields',
            },
          },
          from: paginationArgs.skip,
          size: paginationArgs.take,
        },
      );

      const hits = searchResult.hits.hits;
      if (!hits || hits.length === 0) {
        return [];
      }

      // ES 결과에서 ID 추출
      const postIds = hits.map((hit) => Number(hit._id));

      // DB에서 조회 (권한 체크 포함)
      const where: { id: { in: number[] }; deletedAt?: null } = {
        id: { in: postIds },
      };
      if (!context.currentUser?.isAdmin) {
        where.deletedAt = null;
      }

      const posts = await this.prisma.post.findMany({
        where,
      });

      // ES 검색 순서대로 정렬
      const postMap = new Map(posts.map((post) => [post.id, post]));
      const orderedPosts = postIds
        .map((id) => postMap.get(id))
        .filter((post): post is NonNullable<typeof post> => post !== undefined);

      return plainToInstance(PostDto, orderedPosts);
    } catch {
      // ES 에러 발생시 빈 배열 반환
      console.log('Elasticsearch error during searchPosts');
      return [];
    }
  }

  // TODO: renderedContent, plainContent 처리(Draft 상태에서는 제외)
  async create(input: CreatePostInput): Promise<PostDto> {
    const { title, content, plainContent, renderedContent, boardId, isDraft } =
      input;

    if (isDraft) {
      return plainToInstance(
        PostDto,
        await this.prisma.post.create({
          data: {
            title,
            content,
            boardId,
          },
        }),
      );
    } else {
      // draft아닐 경우 plainContent, renderedContent가 반드시 있어야 함
      if (!plainContent) {
        throw new GraphQLError('plainContent is required for published post', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      if (!renderedContent) {
        throw new GraphQLError(
          'renderedContent is required for published post',
          {
            extensions: { code: 'BAD_USER_INPUT' },
          },
        );
      }

      const readTime = calculateReadingTime(plainContent);

      const createdPost = await this.prisma.post.create({
        data: {
          postNumber: await this.getNextPostNumber(),
          title,
          content,
          renderedContent,
          plainContent,
          boardId,
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          readTime,
        },
      });

      try {
        await this.elasticSearchService.ensureIndex(this.esIndex);
        await this.elasticSearchService.index(
          this.esIndex,
          {
            id: createdPost.id,
            title: createdPost.title,
            plainContent: createdPost.plainContent,
            createdAt: createdPost.createdAt,
          },
          String(createdPost.id),
        );
      } catch (error) {
        // Log the error but do not fail the post creation
      }

      return plainToInstance(PostDto, createdPost);
    }
  }

  // TODO: renderedContent, plainContent 처리(Draft 상태에서는 제외)
  async update(
    context: RequestContext,
    input: UpdatePostInput,
  ): Promise<PostDto> {
    const {
      id,
      title,
      content,
      renderedContent,
      plainContent,
      isDraft,
      boardId,
    } = input;

    const existingPost = await this.findPostById(context, id);
    if (!existingPost) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existingPost.status === PostStatus.PUBLISHED && isDraft) {
      throw new GraphQLError('Cannot change from PUBLISHED to DRAFT', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    if (isDraft) {
      // return plainToInstance(
      //   PostDto,
      //   await this.prisma.post.update({
      //     where: { id },
      //     data: {
      //       // not null fields
      //       title,
      //       content,

      //       // optional fields
      //       renderedContent: renderedContent ?? undefined,
      //       plainContent: plainContent ?? undefined,

      //       boardId: boardId ?? undefined,
      //     },
      //   }),
      // );
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          // not null fields
          title,
          content,
          // optional fields
          renderedContent: renderedContent ?? undefined,
          plainContent: plainContent ?? undefined,
          boardId: boardId ?? undefined,
        },
      });
      return plainToInstance(PostDto, updatedPost);
    } else {
      // draft아닐 경우 plainContent가 반드시 있어야 함
      const readTime = plainContent
        ? calculateReadingTime(plainContent)
        : existingPost.readTime;

      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          postNumber:
            existingPost.postNumber ?? (await this.getNextPostNumber()),
          title: title ?? existingPost.title,
          content: content ?? existingPost.content,
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          readTime,
        },
      });
      return plainToInstance(PostDto, updatedPost);

      // return plainToInstance(
      //   PostDto,
      //   await this.prisma.post.update({
      //     where: { id },
      //     data: {
      //       postNumber:
      //         existingPost.postNumber ?? (await this.getNextPostNumber()),
      //       title: title ?? existingPost.title,
      //       content: content ?? existingPost.content,
      //       status: PostStatus.PUBLISHED,
      //       publishedAt: new Date(),
      //       readTime,
      //     },
      //   }),
      // );
    }
  }

  async delete(id: number): Promise<PostDto> {
    // hard delete
    // const deletedPost = await this.prisma.post.delete({ where: { id } });

    // soft delete
    const deletedPost = await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return plainToInstance(PostDto, deletedPost);
  }

  // ------------
  async findBoardByPostId(id: number): Promise<BoardDto> {
    const board = await this.prisma.post.findUnique({ where: { id } })?.board();
    return plainToInstance(BoardDto, board);
  }

  async findAttachmentsByPostId(postId: number) {
    const attachments = await this.prisma.post
      .findUnique({
        where: { id: postId },
      })
      ?.attachments();
    return plainToInstance(AttachmentDto, attachments || []);
  }

  private async getNextPostNumber(): Promise<number> {
    const maxPostNumber = await this.prisma.post.aggregate({
      _max: {
        postNumber: true,
      },
    });

    return (maxPostNumber._max.postNumber ?? 0) + 1;
  }
}
