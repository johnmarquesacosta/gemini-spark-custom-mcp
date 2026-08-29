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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
    return (req as any).user?.sub;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(this.getUserId(req), createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all posts' })
  findAll(@Req() req: Request) {
    return this.postsService.findAll(this.getUserId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, this.getUserId(req), updatePostDto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a post' })
  publish(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.publish(id, this.getUserId(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.remove(id, this.getUserId(req));
  }
}
