import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tecnologia', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tecnologia', description: 'URL friendly slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'WordPress Category ID if synchronized',
  })
  @IsOptional()
  @IsInt()
  wordpressCategoryId?: number;
}
