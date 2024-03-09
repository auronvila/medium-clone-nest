import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { ArticlesResponseInterface } from '@app/types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  @Get()
  async findAll(@User('id') currentUserId: string, @Query() query: any): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticleBySlug(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return this.articleService.deleteArticleBySlug(slug, currentUserId);
  }

  @Put(':slug')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async updateArticle(
    @Param('slug') currentArticleSlug: string,
    @User('id') currentUserId: string,
    @Body('article') updateArticleReqDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    return this.articleService.updateArticle(currentUserId, currentArticleSlug, updateArticleReqDto);
  }

  @Post(':slug/favourite')
  @UseGuards(AuthGuard)
  async addArticleToFavourites(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavourites(slug, currentUserId);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favourite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavourites(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(slug, currentUserId);
    return this.articleService.buildArticleResponse(article);
  }
}