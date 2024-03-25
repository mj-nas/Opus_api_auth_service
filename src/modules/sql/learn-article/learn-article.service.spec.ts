import { Test, TestingModule } from '@nestjs/testing';
import { LearnArticleService } from './learn-article.service';

describe('LearnArticleService', () => {
  let service: LearnArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearnArticleService],
    }).compile();

    service = module.get<LearnArticleService>(LearnArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
