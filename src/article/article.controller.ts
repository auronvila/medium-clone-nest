import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
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

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
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
    return this.articleService.getArticleBySlug(slug);
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
}