import { Controller, Get } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {
  }

  @Get()
  async findAll(): Promise<{ tags: { tag: string, id: string }[] }> {
    const tags = await this.tagService.findAll();
    const formattedTags = tags.map(tag => ({ tag: tag.name, id: tag.id }));

    return {
      tags: formattedTags,
    };
  }
}