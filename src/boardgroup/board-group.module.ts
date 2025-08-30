import { Module, forwardRef } from '@nestjs/common';
import { BoardGroupService } from './board-group.service';
import { BoardGroupResolver } from './board-group.resolver';
import { PrismaModule } from '../adapters/prisma/prisma.module';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BoardModule)],
  providers: [BoardGroupService, BoardGroupResolver],
  exports: [BoardGroupService],
})
export class BoardGroupModule {}
