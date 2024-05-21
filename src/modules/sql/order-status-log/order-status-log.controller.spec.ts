import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatusLogController } from './order-status-log.controller';
import { OrderStatusLogService } from './order-status-log.service';

describe('OrderStatusLogController', () => {
  let controller: OrderStatusLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderStatusLogController],
      providers: [OrderStatusLogService],
    }).compile();

    controller = module.get<OrderStatusLogController>(OrderStatusLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
