import { Field, ObjectType, GraphQLISODateTime, Int } from '@nestjs/graphql';
import { BoardGroupDto } from 'src/boardgroup/dto/board-group.dto';
import { PostDto } from 'src/post/dto/post.dto';

@ObjectType()
export class BoardDto {
  @Field(() => Int, { description: 'Board ID' })
  id: number;

  @Field({ description: 'Name of Board' })
  title: string;

  @Field({ description: 'Slug of Board(e.g. Development -> devel)' })
  // @Transform(({ value }): { value: string } => ({
  //   value:
  //     typeof value === 'string'
  //       ? value.trim().toLowerCase().replace(/\s+/g, '-')
  //       : String(value),
  // }))
  slug: string;

  @Field(() => GraphQLISODateTime, {
    description: 'When the Board was created.',
  })
  createdAt: Date;

  @Field(() => GraphQLISODateTime, {
    description: 'When the Board was deleted. Basic soft delete timestamp.',
    nullable: true,
  })
  deletedAt?: Date | null;

  @Field(() => BoardGroupDto, {
    description: 'The group to which the board belongs',
    nullable: true,
  })
  boardGroup: BoardGroupDto | null;

  @Field(() => [PostDto])
  posts: PostDto[];
}
