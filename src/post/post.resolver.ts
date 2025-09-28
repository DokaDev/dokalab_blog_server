import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PostService } from './post.service';

import { AttachmentDto } from 'src/attachment/dto/attachment.dto';
import { AdminRequired } from 'src/auth/context/decorators/admin-required.decorator';
import { BoardDto } from 'src/board/dto/board.dto';
import { CacheService } from 'src/cache/cache.service';
import { ONE_MINUTE_IN_S } from 'src/common/constants/time.constant';
import { CreatePostInput } from './dto/create-post.input';
import { PostDto } from './dto/post.dto';
import { UpdatePostInput } from './dto/update-post.input';
import { RequestContext } from 'src/auth/context/request-context';

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
  async findAllPosts(@Context() context: RequestContext): Promise<PostDto[]> {
    return await this.postService.findAll(context);
  }

  @Query(() => PostDto, { nullable: true })
  async findPostById(
    @Context() context: RequestContext,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostDto | null> {
    const key: string = `post:${id}`;

    const cache = await this.cacheService.getCache<PostDto>(key);
    if (cache) {
      return cache;
    } else {
      const postFromDb = await this.postService.findById(context, id);
      if (postFromDb) {
        await this.cacheService.setCache<PostDto>(
          key,
          postFromDb,
          ONE_MINUTE_IN_S * 10,
        ); // 10 minutes
      }
      return postFromDb;
    }
  }

  // -----------------
  @Mutation(() => PostDto)
  @AdminRequired()
  async createPost(@Args('input') input: CreatePostInput): Promise<PostDto> {
    const newPost = await this.postService.create(input);

    // create cache
    const key: string = `post:${newPost.id}`;
    await this.cacheService.setCache<PostDto>(
      key,
      newPost,
      ONE_MINUTE_IN_S * 10,
    ); // 10 minutes

    return newPost;
  }

  @Mutation(() => PostDto)
  @AdminRequired()
  async updatePost(
    @Context() context: RequestContext,
    @Args('input') input: UpdatePostInput,
  ): Promise<PostDto> {
    const post = await this.postService.findById(context, input.id);
    if (!post) {
      throw new Error('Post not found');
    }

    // Invalidate cache
    const key: string = `post:${input.id}`;
    await this.cacheService.deleteCache(key);

    const updatedPost = await this.postService.update(context, input);

    // refresh cache
    await this.cacheService.setCache<PostDto>(
      key,
      updatedPost,
      ONE_MINUTE_IN_S * 10,
    ); // 10 minutes

    return updatedPost;
  }

  @Mutation(() => PostDto, { nullable: true })
  @AdminRequired()
  async deletePost(
    @Context() context: RequestContext,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostDto | null> {
    const post = await this.postService.findById(context, id);
    if (!post) {
      throw new Error('Post not found');
    }

    // Invalidate cache
    const key: string = `post:${id}`;
    await this.cacheService.deleteCache(key);

    return await this.postService.delete(id);
  }
}
