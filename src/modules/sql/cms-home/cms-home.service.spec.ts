import { Test, TestingModule } from '@nestjs/testing';
import { CmsHomeService } from './cms-home.service';

describe('CmsHomeService', () => {
  let service: CmsHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsHomeService],
    }).compile();

    service = module.get<CmsHomeService>(CmsHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
