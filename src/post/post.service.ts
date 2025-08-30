import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { PostDto } from './dto/post.dto';
import { plainToInstance } from 'class-transformer';
import { BoardDto } from 'src/board/dto/board.dto';
import { CreatePostInput } from './dto/create-post.input';
import { calculateReadingTime } from 'src/utils/readtime/readtime.util';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PostDto[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
      },
    });

    return plainToInstance(PostDto, posts);
  }

  async findById(id: number): Promise<PostDto | null> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    return plainToInstance(PostDto, post);
  }

  async create(input: CreatePostInput): Promise<PostDto> {
    // readtime util 사용
    const readTime = calculateReadingTime(input.content);

    const post = await this.prisma.post.create({
      data: {
        ...input,
        readTime,
      },
    });
    return plainToInstance(PostDto, post);
  }

  // ------------
  async findBoardByPostId(id: number): Promise<BoardDto> {
    const board = await this.prisma.post.findUnique({ where: { id } })?.board();
    return plainToInstance(BoardDto, board);
  }
}
