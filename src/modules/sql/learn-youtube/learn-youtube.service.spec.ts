import { Test, TestingModule } from '@nestjs/testing';
import { LearnYoutubeService } from './learn-youtube.service';

describe('LearnYoutubeService', () => {
  let service: LearnYoutubeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearnYoutubeService],
    }).compile();

    service = module.get<LearnYoutubeService>(LearnYoutubeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
