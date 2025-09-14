import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { BoardGroupDto } from './dto/board-group.dto';
import { plainToInstance } from 'class-transformer';
import { CreateBoardGroupInput } from './dto/create-board-group.input';
import { BoardDto } from 'src/board/dto/board.dto';

@Injectable()
export class BoardGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BoardGroupDto[]> {
    const boardGroups = await this.prisma.boardGroup.findMany();
    return plainToInstance(BoardGroupDto, boardGroups);
  }

  async findBoardsByBoardGroupId(id: number): Promise<BoardDto[]> {
    const boards = await this.prisma.boardGroup
      .findUnique({ where: { id: id } })
      ?.boards({
        where: {
          deletedAt: null,
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
