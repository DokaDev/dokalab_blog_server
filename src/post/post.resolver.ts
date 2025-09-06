import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Args,
  Int,
  Mutation,
} from '@nestjs/graphql';

import { PostService } from './post.service';

import { PostDto } from './dto/post.dto';
import { BoardDto } from 'src/board/dto/board.dto';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';

@Resolver(() => PostDto)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @ResolveField(() => BoardDto)
  async board(@Parent() post: PostDto): Promise<BoardDto> {
    return await this.postService.findBoardByPostId(post.id);
  }

  // -------------------

  @Query(() => [PostDto])
  async findAllPosts(): Promise<PostDto[]> {
    return await this.postService.findAll();
  }

  @Query(() => PostDto, { nullable: true })
  async findPostById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostDto | null> {
    return await this.postService.findById(id);
  }

  // -----------------
  @Mutation(() => PostDto)
  async createPost(@Args('input') input: CreatePostInput): Promise<PostDto> {
    return await this.postService.create(input);
  }

  @Mutation(() => PostDto)
  async updatePost(@Args('input') input: UpdatePostInput): Promise<PostDto> {
    return await this.postService.update(input);
  }

  @Mutation(() => PostDto, { nullable: true })
  async deletePost(@Args('id', { type: () => Int }) id: number) {
    return await this.postService.delete(id);
  }

  // 데이터 완전소멸용 delete 추가
  // @Mutation(() => PostDto, { nullable: true })
  // async hardDeletePost(@Args('id', { type: () => Int }) id: number) {
  //   return await this.postService.hardDelete(id);
  // }
}
