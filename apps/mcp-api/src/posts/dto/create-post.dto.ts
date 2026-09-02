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
  @IsUUID()
  siteId: string;

  @IsString()
  @Length(2, 5)
  language: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(220)
  slug: string;

  @IsString()
  excerpt: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostBlockDto)
  blocks?: CreatePostBlockDto[];

  @IsOptional()
  @IsString()
  featuredImagePrompt?: string;

  @IsEnum(PostStatus)
  // Permite apenas GENERATING na criação (Publish é endpoint separado)
  status: PostStatus = PostStatus.GENERATING;

  @IsEnum(ArticleSchemaType)
  schemaType: ArticleSchemaType = ArticleSchemaType.BLOG_POSTING;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  authorUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  publisherNameOverride?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  publisherLogoUrlOverride?: string;

  @IsString()
  @Length(30, 70)
  metaTitle: string;

  @IsString()
  @Length(110, 170)
  metaDescription: string;

  @IsString()
  @MaxLength(100)
  focusKeyword: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryKeywords?: string[];

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ogDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  twitterCardType?: string = 'summary_large_image';

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}
