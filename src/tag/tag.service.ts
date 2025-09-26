import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/adapters/prisma/prisma.service';
import { CreateTagInputDto } from './dto/create-tag.input.';
import { PostTag } from '@prisma/client';
import { RequestContext } from 'src/auth/context/request-context';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  public async createTag(input: CreateTagInputDto): Promise<PostTag> {
    return this.prismaService.postTag.create({
      data: {
        ...input,
      },
    });
  }

  public async findAllTags(context: RequestContext): Promise<PostTag[]> {
    const where: { deletedAt?: null } = {};
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    return this.prismaService.postTag.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });
  }

  public async findTagById(
    context: RequestContext,
    id: number,
  ): Promise<PostTag | null> {
    const where: { id: number; deletedAt?: null } = { id };
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    return this.prismaService.postTag.findUnique({
      where,
    });
  }

  public async searchTags(
    context: RequestContext,
    keyword: string,
  ): Promise<PostTag[]> {
    const where: { name: { startsWith: string }; deletedAt?: null } = {
      name: { startsWith: keyword },
    };
    if (!context.currentUser?.isAdmin) {
      where.deletedAt = null;
    }
    return this.prismaService.postTag.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });
  }
}
