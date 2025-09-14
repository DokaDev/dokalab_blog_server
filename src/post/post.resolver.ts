import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PostService } from './post.service';

import { RedisService } from 'src/adapters/redis/redis.service';
import { AttachmentDto } from 'src/attachment/dto/attachment.dto';
import { AdminRequired } from 'src/auth/decorators/admin-required.decorator';
import { BoardDto } from 'src/board/dto/board.dto';
import { CreatePostInput } from './dto/create-post.input';
import { PostDto } from './dto/post.dto';
import { UpdatePostInput } from './dto/update-post.input';
import { CacheService } from 'src/cache/cache.service';

@Resolver(() => PostDto)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly cacheService: CacheService,
  ) {}

  @ResolveField(() => BoardDto)
  async board(@Parent() post: PostDto): Promise<BoardDto> {
    return await this.postService.findBoardByPostId(post.id);
  }

  @ResolveField(() => [AttachmentDto])
  async attachments(@Parent() post: PostDto) {
    return await this.postService.findAttachmentsByPostId(post.id);
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
    const key: string = `post:${id}`;

    const cache = await this.cacheService.getCache<PostDto>(key);
    if (cache) {
      return cache;
    } else {
      const postFromDb = await this.postService.findById(id);
      if (postFromDb) {
        await this.cacheService.setCache<PostDto>(key, postFromDb, 60 * 10); // 10 minutes
      }
      return postFromDb;
    }
  }

  // -----------------
  @Mutation(() => PostDto)
  @AdminRequired()
  async createPost(@Args('input') input: CreatePostInput): Promise<PostDto> {
    return await this.postService.create(input);
  }

  @Mutation(() => PostDto)
  @AdminRequired()
  async updatePost(@Args('input') input: UpdatePostInput): Promise<PostDto> {
    return await this.postService.update(input);
  }

  @Mutation(() => PostDto, { nullable: true })
  @AdminRequired()
  async deletePost(@Args('id', { type: () => Int }) id: number) {
    return await this.postService.delete(id);
  }
}
