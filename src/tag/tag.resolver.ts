import { Args, Mutation, Resolver, Query, Int, Context } from '@nestjs/graphql';
import { CreateTagInputDto } from './dto/create-tag.input.';
import { TagDto } from './dto/tag.dto';
import { TagService } from './tag.service';
import { RequestContext } from 'src/auth/context/request-context';

@Resolver(() => TagDto)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}
  @Mutation(() => TagDto, {
    description: 'Create a new tag. Tag names must be unique.',
  })
  async createTag(@Args('input') input: CreateTagInputDto): Promise<TagDto> {
    const createdTag = await this.tagService.createTag(input);
    return createdTag;
  }

  @Query(() => [TagDto], {
    description:
      'Retrieve all tags. Admins can see all tags, others can only see non-deleted tags.',
  })
  async findAllTags(@Context() context: RequestContext): Promise<TagDto[]> {
    return this.tagService.findAllTags(context);
  }

  @Query(() => TagDto, {
    nullable: true,
    description:
      'Find a tag by ID. Admins can see all tags, others can only see non-deleted tags.',
  })
  async findTagById(
    @Context() context: RequestContext,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TagDto | null> {
    return this.tagService.findTagById(context, id);
  }

  @Query(() => [TagDto], {
    description: 'Search for tags by keyword. Supports prefix search.',
  })
  async searchTags(
    @Context() context: RequestContext,
    @Args('keyword', { type: () => String }) keyword: string,
  ): Promise<TagDto[]> {
    return this.tagService.searchTags(context, keyword);
  }
}
