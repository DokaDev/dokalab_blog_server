import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { BoardGroupDto } from 'src/boardgroup/dto/board-group.dto';
import { PostDto } from 'src/post/dto/post.dto';
import { BoardDto } from './dto/board.dto';
import { CreateBoardInput } from './dto/create-board.input';
import { RequestContext } from 'src/auth/context/request-context';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all boards
   * @returns Array of BoardDto
   */
  async findAll(context: RequestContext): Promise<BoardDto[]> {
    // const boards = await this.prisma.board.findMany({
    //   where: {
    //     deletedAt: null,
    //   },
    // });

    // return plainToInstance(BoardDto, boards);
    const where = {};
    if (!context.currentUser?.isAdmin) {
      Object.assign(where, { deletedAt: null });
    }
    const boards = await this.prisma.board.findMany({
      where,
      orderBy: {
        id: 'asc',
      },
    });

    return plainToInstance(BoardDto, boards);
  }

  /**
   * Get a board by ID
   * @param id Board ID
   * @returns BoardDto
   */
  async findById(id: number): Promise<BoardDto> {
    const board = await this.prisma.board.findUnique({
      where: { id, deletedAt: null },
    });

    return plainToInstance(BoardDto, board);
  }

  /**
   * Create a new board
   * @param data Board creation input
   * @returns Created BoardDto
   */
  async create(data: CreateBoardInput): Promise<BoardDto> {
    // slug 소문자 변환
    data.slug = data.slug.toLowerCase();

    const board = await this.prisma.board.create({
      data,
    });

    return plainToInstance(BoardDto, board);
  }

  async findByBoardId(id: number): Promise<BoardGroupDto | null> {
    const boardGroup = await this.prisma.board
      .findUnique({ where: { id } })
      ?.boardGroup();

    return boardGroup ? plainToInstance(BoardGroupDto, boardGroup) : null;
  }

  // ---------------------
  async findPostsByBoardId(id: number): Promise<PostDto[]> {
    const posts = await this.prisma.board
      .findUnique({
        where: { id },
      })
      .posts();

    return posts ? plainToInstance(PostDto, posts) : [];
  }

  async delete(id: number): Promise<BoardDto | null> {
    return plainToInstance(
      BoardDto,
      await this.prisma.board.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    );
  }
}
