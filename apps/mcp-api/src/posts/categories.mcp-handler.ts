import { Injectable } from '@nestjs/common';
import { McpTool } from '../mcp-resources/decorators/mcp-tool.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesMcpHandler {
  constructor(private readonly categoriesService: CategoriesService) {}

  @McpTool({
    name: 'categories_list',
    description: 'List all categories for the current user',
    inputSchema: { type: 'object', properties: {} },
  })
  async listCategories(userId: string) {
    return this.categoriesService.findAll(userId);
  }

  @McpTool({
    name: 'categories_get',
    description: 'Get a single category by ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  })
  async getCategory(userId: string, args: { id: string }) {
    return this.categoriesService.findOne(args.id, userId);
  }

  @McpTool({
    name: 'categories_create',
    description: 'Create a new category',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        wordpressCategoryId: { type: 'number' },
      },
      required: ['name', 'slug'],
    },
  })
  async createCategory(userId: string, args: CreateCategoryDto) {
    return this.categoriesService.create(userId, args);
  }

  @McpTool({
    name: 'categories_update',
    description: 'Update a category',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' },
        wordpressCategoryId: { type: 'number' },
      },
      required: ['id'],
    },
  })
  async updateCategory(
    userId: string,
    args: { id: string } & UpdateCategoryDto,
  ) {
    const { id, ...updateData } = args;
    return this.categoriesService.update(id, userId, updateData);
  }

  @McpTool({
    name: 'categories_delete',
    description: 'Delete a category',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  })
  async deleteCategory(userId: string, args: { id: string }) {
    await this.categoriesService.remove(args.id, userId);
    return { success: true };
  }
}
