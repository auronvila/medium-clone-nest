import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from '@app/types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor
  (
    private dataSource: DataSource,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
  }

  async findAll(currentUserId: string, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource.getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({ where: { username: query.author } });
      if (!author){
        throw new HttpException('author not found',HttpStatus.NOT_FOUND)
      }
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return {
      articles,
      articlesCount,
    };
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

  async deleteArticleBySlug(slug: string, currentUserId: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.article.author.id !== currentUserId) {
      throw new HttpException('only the creator of the article can delete it', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(currentUserId: string, currentArticleSlug: string, updateArticleReqDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.getArticleBySlug(currentArticleSlug);

    if (!article) {
      throw new HttpException('No article was found', HttpStatus.NOT_FOUND);
    }

    if (article.article.author.id !== currentUserId) {
      throw new HttpException('only the creator of the article can update it', HttpStatus.FORBIDDEN);
    }

    Object.assign(article.article, updateArticleReqDto);
    article.article.slug = this.getSlug(updateArticleReqDto.title);
    await this.articleRepository.save(article.article);
    return this.buildArticleResponse(article.article);
  }
}