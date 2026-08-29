import { Injectable } from '@nestjs/common';
import { McpTool } from '../mcp-resources/decorators/mcp-tool.decorator';
import { PostsService } from './posts.service';

@Injectable()
export class PostsMcpHandler {
  constructor(private readonly postsService: PostsService) {}

  @McpTool({
    name: 'posts_list',
    description: 'List all posts for the current user',
    inputSchema: { type: 'object', properties: {} },
  })
  async listPosts(userId: string) {
    return this.postsService.findAll(userId);
  }

  @McpTool({
    name: 'posts_get',
    description: 'Get a single post by ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  })
  async getPost(userId: string, args: { id: string }) {
    return this.postsService.findOne(args.id, userId);
  }

  @McpTool({
    name: 'posts_create',
    description: 'Create a new post',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        excerpt: { type: 'string' },
        content: { type: 'string' },
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        focusKeyword: { type: 'string' },
        language: { type: 'string' },
        categoryId: { type: 'string' },
      },
      required: [
        'title',
        'slug',
        'excerpt',
        'content',
        'metaTitle',
        'metaDescription',
        'focusKeyword',
        'language',
        'categoryId',
      ],
    },
  })
  async createPost(userId: string, args: any) {
    return this.postsService.create(userId, args);
  }

  @McpTool({
    name: 'posts_update',
    description: 'Update a post',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['id'],
    },
  })
  async updatePost(userId: string, args: any) {
    const { id, ...updateData } = args;
    return this.postsService.update(id, userId, updateData);
  }

  @McpTool({
    name: 'posts_publish',
    description: 'Publish a post',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  })
  async publishPost(userId: string, args: { id: string }) {
    return this.postsService.publish(args.id, userId);
  }

  @McpTool({
    name: 'posts_delete',
    description: 'Delete a post',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  })
  async deletePost(userId: string, args: { id: string }) {
    await this.postsService.remove(args.id, userId);
    return { success: true };
  }
}
