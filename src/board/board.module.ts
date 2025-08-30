import { Module, forwardRef } from '@nestjs/common';

import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { PrismaModule } from '../adapters/prisma/prisma.module';
import { BoardGroupModule } from 'src/boardgroup/board-group.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BoardGroupModule)],
  providers: [BoardService, BoardResolver],
  exports: [BoardService],
})
export class BoardModule {}
