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

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

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
  ) {
    // TODO: Elastic Search FullText 적용
    // TODO: TITLE + CONTENT ^2 가중치 적용
    // TODO: 정렬 조건: _id 기반 최신순 정렬
    const list: PostDto[] = [];
    return list;
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
      return plainToInstance(
        PostDto,
        await this.prisma.post.create({
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
        }),
      );
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
      return plainToInstance(
        PostDto,
        await this.prisma.post.update({
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
        }),
      );
    } else {
      // draft아닐 경우 plainContent가 반드시 있어야 함
      const readTime = plainContent
        ? calculateReadingTime(plainContent)
        : existingPost.readTime;

      return plainToInstance(
        PostDto,
        await this.prisma.post.update({
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
        }),
      );
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
