import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateTagInputDto } from './dto/create-tag.input.';
import { TagDto } from './dto/tag.dto';
import { TagService } from './tag.service';

@Resolver(() => TagDto)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}
  @Mutation(() => TagDto)
  async createTag(@Args('input') input: CreateTagInputDto): Promise<TagDto> {
    const createdTag = await this.tagService.createTag(input);
    return createdTag;
  }
}
