import { ObjectType } from '@nestjs/graphql';
import { OffsetConnectionDto } from 'src/common/offset.connection.dto';
import { PostDto } from './post.dto';

@ObjectType()
export class PostsOffsetConnectionDto extends OffsetConnectionDto<PostDto> {}
