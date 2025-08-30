import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { BoardDto } from 'src/board/dto/board.dto';

@ObjectType()
export class PostDto {
  @Field(() => Int, { description: 'ID of the post' })
  id: number;

  @Field(() => String, { description: 'Title of the post' })
  title: string;

  @Field(() => String, { description: 'Content of the post' })
  content: string;

  @Field(() => Int)
  readTime: number;

  @Field(() => GraphQLISODateTime, { description: 'Creation date of the post' })
  createdAt: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Deletion date of the post',
  })
  deletedAt?: Date | null;

  @Field(() => BoardDto, { description: 'Board associated with the post' })
  board: BoardDto;
}
