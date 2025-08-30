import { Module } from '@nestjs/common';
import { BoardGroupService } from './board-group.service';
import { BoardGroupResolver } from './board-group.resolver';
import { PrismaModule } from '../adapters/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BoardGroupService, BoardGroupResolver],
  exports: [BoardGroupService],
})
export class BoardGroupModule {}
