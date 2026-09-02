import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Length,
  MaxLength,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePostBlockDto } from './create-post-block.dto';
import { PostStatus } from '../enums/post-status.enum';
import { ArticleSchemaType } from '../enums/article-schema-type.enum';

export class CreatePostDto {
  @ApiProperty({
    example: 'pt-BR',
    description: 'ISO 639-1 language code with region',
  })
  @IsString()
  @Length(2, 5)
  language: string;

  @ApiProperty({
    example: 'Como criar uma API REST',
    description: 'The title of the post (H1)',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'como-criar-uma-api-rest',
    description: 'URL friendly slug',
  })
  @IsString()
  @MaxLength(220)
  slug: string;

  @ApiProperty({
    example: 'Neste artigo vamos aprender...',
    description: 'Short summary or excerpt',
  })
  @IsString()
  excerpt: string;

  @ApiPropertyOptional({
    type: () => CreatePostBlockDto,
    isArray: true,
    description: 'Content blocks',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostBlockDto)
  blocks?: CreatePostBlockDto[];

  @ApiProperty({
    enum: PostStatus,
    example: PostStatus.GENERATING,
    description: 'Current status of the post',
  })
  @IsEnum(PostStatus)
  status: PostStatus = PostStatus.GENERATING;

  @ApiProperty({
    enum: ArticleSchemaType,
    example: ArticleSchemaType.BLOG_POSTING,
  })
  @IsEnum(ArticleSchemaType)
  schemaType: ArticleSchemaType = ArticleSchemaType.BLOG_POSTING;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/author/john' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  authorUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  publisherNameOverride?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  publisherLogoUrlOverride?: string;

  @ApiProperty({
    example: 'Como criar uma API REST em 2026',
    description: 'SEO Meta Title',
  })
  @IsString()
  @Length(30, 70)
  metaTitle: string;

  @ApiProperty({
    example:
      'Aprenda as melhores práticas para criar uma API REST usando NestJS.',
    description: 'SEO Meta Description',
  })
  @IsString()
  @Length(110, 170)
  metaDescription: string;

  @ApiProperty({ example: 'api rest', description: 'Main SEO focus keyword' })
  @IsString()
  @MaxLength(100)
  focusKeyword: string;

  @ApiPropertyOptional({ type: [String], example: ['nestjs', 'backend'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryKeywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  canonicalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  ogTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ogDescription?: string;

  @ApiPropertyOptional({ example: 'summary_large_image' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  twitterCardType?: string = 'summary_large_image';

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the category',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}
