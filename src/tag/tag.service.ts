import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { CreateTagInputDto } from './dto/create-tag.input.';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTag(input: CreateTagInputDto) {
    return this.prismaService.postTag.create({
      data: {
        ...input,
      },
    });
  }
}
