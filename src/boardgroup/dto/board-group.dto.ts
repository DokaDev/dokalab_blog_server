import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BoardDto } from 'src/board/dto/board.dto';

@ObjectType()
export class BoardGroupDto {
  @Field(() => Int, { description: 'Board Group ID' })
  id: number;

  @Field({ description: 'Board Group Title' })
  title: string;

  @Field(() => [BoardDto], { description: 'List of boards in the group' })
  boards: BoardDto[];
}
