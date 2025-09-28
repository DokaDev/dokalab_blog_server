import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
  Mutation,
  Context,
} from '@nestjs/graphql';

import { BoardService } from './board.service';

import { BoardDto } from './dto/board.dto';
import { BoardGroupDto } from 'src/boardgroup/dto/board-group.dto';
import { CreateBoardInput } from './dto/create-board.input';
import { PostDto } from 'src/post/dto/post.dto';
import { AdminRequired } from 'src/auth/context/decorators/admin-required.decorator';
import { RequestContext } from 'src/auth/context/request-context';

@Resolver(() => BoardDto)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  // --------------------
  @ResolveField(() => BoardGroupDto, {
    description: 'The group to which the board belongs',
    nullable: true,
  })
  async boardGroup(@Parent() board: BoardDto): Promise<BoardGroupDto | null> {
    return await this.boardService.findByBoardId(board.id);
  }

  @ResolveField(() => [PostDto])
  async posts(
    @Context() context: RequestContext,
    @Parent() board: BoardDto,
  ): Promise<PostDto[]> {
    return await this.boardService.findPostsByBoardId(context, board.id);
  }

  // --------------------
  @Query(() => [BoardDto], { description: 'Get all boards' })
  async findAllBoards(@Context() context: RequestContext): Promise<BoardDto[]> {
    return await this.boardService.findAll(context);
  }

  @Query(() => BoardDto, { description: 'Get a board by ID', nullable: true })
  async findBoardById(
    @Context() context: RequestContext,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<BoardDto | null> {
    return await this.boardService.findById(context, id);
  }

  // --------------------
  @AdminRequired()
  @Mutation(() => BoardDto)
  async createBoard(@Args('data') data: CreateBoardInput): Promise<BoardDto> {
    return await this.boardService.create(data);
  }

  @AdminRequired()
  @Mutation(() => BoardDto, { nullable: true })
  async deleteBoard(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<BoardDto | null> {
    return await this.boardService.delete(id);
  }
}
