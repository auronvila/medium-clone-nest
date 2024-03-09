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

    if (query.favourited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favourited },
        relations: ['favourites'],
      });
      const ids = author.favourites.map((el) => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({ where: { username: query.author } });
      if (!author) {
        throw new HttpException('author not found', HttpStatus.NOT_FOUND);
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

    let favouriteIds: string[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favourites'],
      });
      favouriteIds = currentUser.favourites.map(favourite => favourite.id);
    }

    const articles = await queryBuilder.getMany();

    const articlesWithFavourited = articles.map(article => {
      const favourited = favouriteIds.includes(article.id);
      return { ...article, favourited };
    });
    return {
      articles: articlesWithFavourited,
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

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException('no article was found', HttpStatus.NOT_FOUND);
    }
    return article;
    // this.buildArticleResponse(article);
  }

  async deleteArticleBySlug(slug: string, currentUserId: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('only the creator of the article can delete it', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(currentUserId: string, currentArticleSlug: string, updateArticleReqDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.getArticleBySlug(currentArticleSlug);

    if (!article) {
      throw new HttpException('No article was found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('only the creator of the article can update it', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleReqDto);
    article.slug = this.getSlug(updateArticleReqDto.title);
    await this.articleRepository.save(article);
    return this.buildArticleResponse(article);
  }

  async addArticleToFavourites(slug: string, currentUserId: string): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({ where: { id: currentUserId }, relations: ['favourites'] });
    const isNotFavourited = user.favourites.findIndex(articleInFavourites => articleInFavourites.id === article.id) === -1;

    if (isNotFavourited) {
      user.favourites.push(article);
      article.favouritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  async deleteArticleFromFavorites(slug: string, userId: string): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['favourites'] });
    const articleIndex = user.favourites.findIndex(articleInFavourites => articleInFavourites.id === article.id);

    if (articleIndex >= 0) {
      user.favourites.splice(articleIndex, 1);
      article.favouritesCount--;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
}