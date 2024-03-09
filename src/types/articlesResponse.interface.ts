import { ArticleType } from '@app/types/article.type';

export interface ArticlesResponseInterface {
  articles: ArticleType[],
  articlesCount: number
}