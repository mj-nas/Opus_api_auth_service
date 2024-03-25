import { Test, TestingModule } from '@nestjs/testing';
import { LearnArticleController } from './learn-article.controller';
import { LearnArticleService } from './learn-article.service';

describe('LearnArticleController', () => {
  let controller: LearnArticleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnArticleController],
      providers: [LearnArticleService],
    }).compile();

    controller = module.get<LearnArticleController>(LearnArticleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
