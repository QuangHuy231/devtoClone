import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  parentPost: string;
  @IsNotEmpty()
  body: string;
  parentId: string;
}
