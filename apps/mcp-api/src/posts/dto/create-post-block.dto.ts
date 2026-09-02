import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 1, description: 'Order of the block in the post' })
  @IsNumber()
  order: number;

  @ApiProperty({ enum: PostBlockType, example: PostBlockType.TEXT })
  @IsEnum(PostBlockType)
  type: PostBlockType;

  @ApiPropertyOptional({ description: 'Required if type is TEXT' })
  @ValidateIf((o) => o.type === PostBlockType.TEXT)
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({
    description: 'Required if type is IMAGE. Prompt for the AI.',
  })
  @ValidateIf((o) => o.type === PostBlockType.IMAGE)
  @IsString()
  imagePrompt?: string;

  @ApiPropertyOptional({
    enum: GraphEngine,
    description: 'Required if type is GRAPH',
  })
  @ValidateIf((o) => o.type === PostBlockType.GRAPH)
  @IsEnum(GraphEngine)
  graphEngine?: GraphEngine;

  @ApiPropertyOptional({ description: 'Required if type is GRAPH. JSON spec.' })
  @ValidateIf((o) => o.type === PostBlockType.GRAPH)
  @IsString()
  graphSpec?: string;
}
