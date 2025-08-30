import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { BoardGroupDto } from './dto/board-group.dto';
import { plainToInstance } from 'class-transformer';
import { CreateBoardGroupInput } from './dto/create-board-group.input';

@Injectable()
export class BoardGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BoardGroupDto[]> {
    const boardGroups = await this.prisma.boardGroup.findMany();
    return plainToInstance(BoardGroupDto, boardGroups);
  }

  async findByBoardId(id: number): Promise<BoardGroupDto | null> {
    const boardGroup = await this.prisma.board
      .findUnique({ where: { id } })
      ?.boardGroup();

    if (!boardGroup) {
      return null;
    }
    return plainToInstance(BoardGroupDto, boardGroup);
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
}
