import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/types/articleResponse.interface';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) {
  }

  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }
    article.author = currentUser;
    article.slug = this.getSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  async getArticleBySlug(slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException('no article was found', HttpStatus.NOT_FOUND);
    }
    return this.buildArticleResponse(article);
  }
}