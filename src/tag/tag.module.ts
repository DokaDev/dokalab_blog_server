import { Module } from '@nestjs/common';
import { TagResolver } from './tag.resolver';
import { TagService } from './tag.service';
import { PrismaModule } from 'src/adapters/prisma/prisma.module';

@Module({
  providers: [TagService, TagResolver],
  imports: [PrismaModule],
})
export class TagModule {}
