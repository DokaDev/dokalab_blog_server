import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsOffsetConnectionDto } from './dto/posts.offset.connection.dto';

@Resolver(() => PostsOffsetConnectionDto)
export class PostsOffsetConnectionResolver {
  @ResolveField(() => [PostsOffsetConnectionDto])
  async nodes(@Parent() { getNodes }: PostsOffsetConnectionDto) {
    return await getNodes();
  }

  @ResolveField(() => Number)
  async totalCount(@Parent() { getTotalCount }: PostsOffsetConnectionDto) {
    return await getTotalCount();
  }
}
