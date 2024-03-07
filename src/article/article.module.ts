import { Module } from '@nestjs/common';
import { ArticleController } from '@app/article/article.controller';
import { ArticleService } from '@app/article/article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
})
export class ArticleModule {
}