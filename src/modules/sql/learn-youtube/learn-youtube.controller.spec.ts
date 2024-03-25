import { Test, TestingModule } from '@nestjs/testing';
import { LearnYoutubeController } from './learn-youtube.controller';
import { LearnYoutubeService } from './learn-youtube.service';

describe('LearnYoutubeController', () => {
  let controller: LearnYoutubeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnYoutubeController],
      providers: [LearnYoutubeService],
    }).compile();

    controller = module.get<LearnYoutubeController>(LearnYoutubeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
