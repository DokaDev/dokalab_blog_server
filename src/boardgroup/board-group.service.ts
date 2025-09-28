import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { BoardDto } from 'src/board/dto/board.dto';
import { BoardGroupDto } from './dto/board-group.dto';
import { CreateBoardGroupInput } from './dto/create-board-group.input';
import { RequestContext } from 'src/auth/context/request-context';

@Injectable()
export class BoardGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BoardGroupDto[]> {
    const boardGroups = await this.prisma.boardGroup.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return plainToInstance(BoardGroupDto, boardGroups);
  }

  async findBoardsByBoardGroupId(
    context: RequestContext,
    id: number,
  ): Promise<BoardDto[]> {
    const where = { boardGroupId: id } as {
      boardGroupId: number;
      deletedAt?: null;
    };
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    const boards = await this.prisma.board.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });

    return boards ? plainToInstance(BoardDto, boards) : [];
  }

  async findById(id: number): Promise<BoardGroupDto | null> {
    const boardGroup = await this.prisma.boardGroup.findUnique({
      where: { id },
    });

    if (!boardGroup) {
      return null;
    }
    return plainToInstance(BoardGroupDto, boardGroup);
  }

  async create(data: CreateBoardGroupInput): Promise<BoardGroupDto> {
    const boardGroup = await this.prisma.boardGroup.create({
      data,
    });

    return plainToInstance(BoardGroupDto, boardGroup);
  }

  async delete(id: number): Promise<BoardGroupDto | null> {
    const deletedBoardGroup = await this.prisma.boardGroup.delete({
      where: { id },
    });
    return plainToInstance(BoardGroupDto, deletedBoardGroup);
  }
}
