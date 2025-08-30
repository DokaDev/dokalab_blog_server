import {
  Query,
  Resolver,
  Args,
  Int,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';

import { BoardGroupService } from './board-group.service';
import { BoardGroupDto } from './dto/board-group.dto';
import { BoardDto } from 'src/board/dto/board.dto';
import { BoardService } from 'src/board/board.service';
import { CreateBoardGroupInput } from './dto/create-board-group.input';

@Resolver(() => BoardGroupDto)
export class BoardGroupResolver {
  constructor(
    private readonly boardGroupService: BoardGroupService,
    private readonly boardService: BoardService,
  ) {}

  @ResolveField(() => [BoardDto], {
    description: 'List of boards in the group',
  })
  async boards(@Parent() boardGroup: BoardGroupDto): Promise<BoardDto[]> {
    return await this.boardService.findBoardsByBoardGroupId(boardGroup.id); // Fluent API
    // return await this.boardService.testNonFluentFindBoardsByBoardGroupId(
    //   boardGroup.id,
    // ); // Regular findMany
  }

  // -------------------

  @Query(() => [BoardGroupDto], { description: 'Get all board groups' })
  async findAllBoardGroups(): Promise<BoardGroupDto[]> {
    return await this.boardGroupService.findAll();
  }

  @Query(() => BoardGroupDto, {
    description: 'Get a board group by ID',
    nullable: true,
  })
  async findBoardGroupById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<BoardGroupDto | null> {
    return await this.boardGroupService.findById(id);
  }

  // -------------------
  @Mutation(() => BoardGroupDto, {
    description: 'Create a new board group',
  })
  async createBoardGroup(
    @Args('data') data: CreateBoardGroupInput,
  ): Promise<BoardGroupDto> {
    return await this.boardGroupService.create(data);
  }
}
