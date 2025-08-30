import { Module } from '@nestjs/common';

import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { PrismaModule } from '../adapters/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BoardService, BoardResolver],
  exports: [BoardService],
})
export class BoardModule {}
