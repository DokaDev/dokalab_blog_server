import {
  Field,
  GraphQLISODateTime,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { AttachmentDto } from 'src/attachment/dto/attachment.dto';
import { BoardDto } from 'src/board/dto/board.dto';

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
  DELETED = 'DELETED',
}

registerEnumType(PostStatus, {
  name: 'status',
});

@ObjectType()
export class PostDto {
  @Field(() => Int, { description: 'ID of the post' })
  id: number;

  @Field(() => Int, { description: '', nullable: true })
  postNumber?: number | null;

  @Field(() => String, { description: 'Title of the post' })
  title: string;

  @Field(() => String, { description: 'Content of the post' })
  content: string;

  @Field(() => Int, { nullable: true, description: 'Read time in minutes' })
  readTime?: number | null;

  @Field(() => GraphQLISODateTime, { description: 'Creation date of the post' })
  createdAt: Date;

  @Field(() => PostStatus, { description: 'Status of the post' })
  status: PostStatus;

  @Field(() => GraphQLISODateTime, {
    description: 'Last update date of the post',
  })
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Deletion date of the post',
  })
  deletedAt?: Date | null;

  @Field(() => BoardDto, { description: 'Board associated with the post' })
  board: BoardDto;

  @Field(() => [AttachmentDto], { nullable: true, description: 'Attachments' })
  attachments?: AttachmentDto[];
}
