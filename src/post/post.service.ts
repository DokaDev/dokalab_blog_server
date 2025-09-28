import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(context: RequestContext): Promise<PostDto[]> {
    const where: { deletedAt?: null } = {};
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    const posts = await this.prisma.post.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });

    return plainToInstance(PostDto, posts);
  }

  async findById(context: RequestContext, id: number): Promise<PostDto | null> {
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

  async create(input: CreatePostInput): Promise<PostDto> {
    if (input.isDraft) {
      return plainToInstance(
        PostDto,
        await this.prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            boardId: input.boardId,
          },
        }),
      );
    } else {
      const readTime = calculateReadingTime(input.content);
      return plainToInstance(
        PostDto,
        await this.prisma.post.create({
          data: {
            postNumber: await this.getNextPostNumber(),
            title: input.title,
            content: input.content,
            boardId: input.boardId,
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            readTime,
          },
        }),
      );
    }
  }

  async update(
    context: RequestContext,
    input: UpdatePostInput,
  ): Promise<PostDto> {
    const existingPost = await this.findById(context, input.id);
    if (!existingPost) {
      throw new GraphQLError('Post not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existingPost.status === PostStatus.PUBLISHED && input.isDraft) {
      throw new GraphQLError('Cannot change from PUBLISHED to DRAFT', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    if (input.isDraft) {
      return plainToInstance(
        PostDto,
        await this.prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title ?? existingPost.title,
            content: input.content ?? existingPost.content,
          },
        }),
      );
    } else {
      const readTime = input.content
        ? calculateReadingTime(input.content)
        : existingPost.readTime;

      return plainToInstance(
        PostDto,
        await this.prisma.post.update({
          where: { id: input.id },
          data: {
            postNumber:
              existingPost.postNumber ?? (await this.getNextPostNumber()),
            title: input.title ?? existingPost.title,
            content: input.content ?? existingPost.content,
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
    const deletedPost = await this.prisma.post.delete({ where: { id } });

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
