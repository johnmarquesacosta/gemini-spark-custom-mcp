import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from './enums/post-status.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  private calculateMetrics(content: string) {
    if (!content) return { wordCount: 0, readingTimeMinutes: 0 };
    // Basic word count splitting by whitespace
    const wordCount = content.trim().split(/\s+/).length;
    // Average reading speed ~200 words per minute
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    return { wordCount, readingTimeMinutes };
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { categoryId, tagIds, ...postData } = createPostDto;

    const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    let tags: Tag[] = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagsRepository.findBy({ id: In(tagIds) });
    }

    const { wordCount, readingTimeMinutes } = this.calculateMetrics(postData.content);

    const post = this.postsRepository.create({
      ...postData,
      category,
      tags,
      wordCount,
      readingTimeMinutes,
    });

    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: {
        category: true,
        tags: true,
        images: true,
        sources: true,
      },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        tags: true,
        images: true,
        sources: true,
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    const { categoryId, tagIds, ...postData } = updatePostDto;

    if (categoryId) {
      const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException(`Category with ID ${categoryId} not found`);
      post.category = category;
    }

    if (tagIds) {
      const tags = await this.tagsRepository.findBy({ id: In(tagIds) });
      post.tags = tags;
    }

    Object.assign(post, postData);

    if (postData.content !== undefined) {
      const { wordCount, readingTimeMinutes } = this.calculateMetrics(postData.content);
      post.wordCount = wordCount;
      post.readingTimeMinutes = readingTimeMinutes;
    }

    return this.postsRepository.save(post);
  }

  async publish(id: string): Promise<Post> {
    const post = await this.findOne(id);
    
    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }

    post.status = PostStatus.PUBLISHED;
    post.datePublished = new Date();

    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }
}
