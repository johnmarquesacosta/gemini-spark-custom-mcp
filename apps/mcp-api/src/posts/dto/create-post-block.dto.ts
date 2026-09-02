import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { PostBlockType } from '../enums/post-block-type.enum';
import { GraphEngine } from '../enums/graph-engine.enum';

export class CreatePostBlockDto {
  @IsNumber()
  order: number;

  @IsEnum(PostBlockType)
  type: PostBlockType;

  @ValidateIf((o) => o.type === PostBlockType.TEXT)
  @IsString()
  textContent?: string;

  @ValidateIf((o) => o.type === PostBlockType.IMAGE)
  @IsString()
  imagePrompt?: string;

  @ValidateIf((o) => o.type === PostBlockType.GRAPH)
  @IsEnum(GraphEngine)
  graphEngine?: GraphEngine;

  @ValidateIf((o) => o.type === PostBlockType.GRAPH)
  @IsString()
  graphSpec?: string;
}
