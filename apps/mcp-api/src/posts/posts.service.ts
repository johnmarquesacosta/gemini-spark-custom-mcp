import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { PostBlock } from './entities/post-block.entity';
import { GeneratedImage } from './entities/generated-image.entity';
import { RenderedGraph } from './entities/rendered-graph.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from './enums/post-status.enum';
import { PostBlockType } from './enums/post-block-type.enum';
import { CreatePostBlockDto } from './dto/create-post-block.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GraphRequestedEvent } from '../assets/assets.listener';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private eventEmitter: EventEmitter2,
  ) {}

  private calculateMetrics(blocks?: { type: string; textContent?: string }[]) {
    if (!blocks || blocks.length === 0)
      return { wordCount: 0, readingTimeMinutes: 0 };

    let totalText = '';
    for (const block of blocks) {
      if (block.type === 'text' && block.textContent) {
        totalText += block.textContent + ' ';
      }
    }

    const wordCount = totalText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    return { wordCount, readingTimeMinutes };
  }

  private processBlocks(
    blocksDto?: CreatePostBlockDto[],
  ): PostBlock[] | undefined {
    if (!blocksDto) return undefined;
    return blocksDto.map((block) => {
      const newBlock = new PostBlock();
      Object.assign(newBlock, block);
      if (
        block.type === PostBlockType.GRAPH &&
        block.graphEngine &&
        block.graphSpec
      ) {
        const graph = new RenderedGraph();
        graph.engine = block.graphEngine;
        graph.spec = block.graphSpec;
        newBlock.renderedGraph = graph;
      }
      if (block.type === PostBlockType.IMAGE && block.imagePrompt) {
        const img = new GeneratedImage();
        img.prompt = block.imagePrompt;
        newBlock.generatedImage = img;
      }
      return newBlock;
    });
  }

  private triggerGraphEvents(post: Post) {
    if (post.blocks) {
      for (const block of post.blocks) {
        if (block.renderedGraph && block.renderedGraph.id) {
          this.eventEmitter.emit(
            'graph.requested',
            new GraphRequestedEvent(block.renderedGraph.id),
          );
        }
      }
    }
  }

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const { categoryId, tagIds, ...postData } = createPostDto;

    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    let tags: Tag[] = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagsRepository.findBy({ id: In(tagIds) });
    }

    const { wordCount, readingTimeMinutes } = this.calculateMetrics(
      postData.blocks,
    );

    const postBlocks = this.processBlocks(postData.blocks);

    const post = this.postsRepository.create({
      ...postData,
      blocks: postBlocks,
      userId,
      category,
      tags,
      wordCount,
      readingTimeMinutes,
    });

    const savedPost = await this.postsRepository.save(post);
    this.triggerGraphEvents(savedPost);
    return savedPost;
  }

  async findAll(userId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      relations: {
        category: true,
        tags: true,
        blocks: {
          generatedImage: true,
          renderedGraph: true,
        },
        sources: true,
      },
      order: { blocks: { order: 'ASC' } },
    });
  }

  async findOne(id: string, userId: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, userId },
      relations: {
        category: true,
        tags: true,
        blocks: {
          generatedImage: true,
          renderedGraph: true,
        },
        sources: true,
      },
      order: { blocks: { order: 'ASC' } },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.findOne(id, userId);
    const { categoryId, tagIds, ...postData } = updatePostDto;

    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId, userId },
      });
      if (!category)
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      post.category = category;
    }

    if (tagIds) {
      const tags = await this.tagsRepository.findBy({ id: In(tagIds) });
      post.tags = tags;
    }

    Object.assign(post, postData);

    if (postData.blocks !== undefined) {
      const { wordCount, readingTimeMinutes } = this.calculateMetrics(
        postData.blocks,
      );
      post.wordCount = wordCount;
      post.readingTimeMinutes = readingTimeMinutes;
      post.blocks = this.processBlocks(postData.blocks) || [];
    }

    const savedPost = await this.postsRepository.save(post);
    this.triggerGraphEvents(savedPost);
    return savedPost;
  }

  async publish(id: string, userId: string): Promise<Post> {
    const post = await this.findOne(id, userId);

    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }

    post.status = PostStatus.PUBLISHED;
    post.datePublished = new Date();

    return this.postsRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id, userId);
    await this.postsRepository.remove(post);
  }
}
