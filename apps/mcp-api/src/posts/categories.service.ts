import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({
      where: { slug: createCategoryDto.slug, userId },
    });
    
    if (existing) {
      throw new ConflictException(`Category with slug '${createCategoryDto.slug}' already exists`);
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });
    return this.categoriesRepository.save(category);
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id, userId);

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoriesRepository.findOne({
        where: { slug: updateCategoryDto.slug, userId },
      });
      if (existing) {
        throw new ConflictException(`Category with slug '${updateCategoryDto.slug}' already exists`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoriesRepository.remove(category);
  }
}
