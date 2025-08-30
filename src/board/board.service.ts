import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { BoardDto } from './dto/board.dto';
import { plainToInstance } from 'class-transformer';
import { CreateBoardInput } from './dto/create-board.input';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all boards
   * @returns Array of BoardDto
   */
  async findAll(): Promise<BoardDto[]> {
    const boards = await this.prisma.board.findMany({
      where: {
        deletedAt: null,
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
   * Get all boards in a specific board group
   * @param id Board Group ID
   * @returns Array of BoardDto
   */
  async findBoardsByBoardGroupId(id: number): Promise<BoardDto[]> {
    const boards = await this.prisma.boardGroup
      .findUnique({ where: { id: id } })
      ?.boards({
        where: {
          deletedAt: null,
        },
      });

    if (!boards) {
      return [];
    }

    return plainToInstance(BoardDto, boards);
  }

  /**
   * Test method - Get boards using regular findMany (not fluent API)
   * @param id Board Group ID
   * @returns Array of BoardDto
   */
  // async testNonFluentFindBoardsByBoardGroupId(id: number): Promise<BoardDto[]> {
  //   const boards = await this.prisma.board.findMany({
  //     where: {
  //       boardGroupId: id,
  //       deletedAt: null,
  //     },
  //   });

  //   return plainToInstance(BoardDto, boards);
  // }

  /**
   * Create a new board
   * @param data Board creation input
   * @returns Created BoardDto
   */
  async create(data: CreateBoardInput): Promise<BoardDto> {
    const board = await this.prisma.board.create({
      data,
    });

    return plainToInstance(BoardDto, board);
  }
}
