import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { McpAuthGuard } from '../mcp-auth/mcp-auth.guard';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(McpAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private getUserId(req: Request): string {
    const sub = (req as Request & { user?: { sub: string } }).user?.sub;
    if (!sub) throw new Error('User not authenticated');
    return sub;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error.' })
  create(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(this.getUserId(req), createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all posts' })
  @ApiResponse({ status: 200, description: 'List of posts.' })
  findAll(@Req() req: Request) {
    return this.postsService.findAll(this.getUserId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({ status: 200, description: 'The post data.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, this.getUserId(req), updatePostDto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a post' })
  @ApiResponse({ status: 200, description: 'The post is being published.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  publish(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.publish(id, this.getUserId(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({
    status: 204,
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.remove(id, this.getUserId(req));
  }
}
