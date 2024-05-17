import { Test, TestingModule } from '@nestjs/testing';
import { OrderAddressController } from './order-address.controller';
import { OrderAddressService } from './order-address.service';

describe('OrderAddressController', () => {
  let controller: OrderAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderAddressController],
      providers: [OrderAddressService],
    }).compile();

    controller = module.get<OrderAddressController>(OrderAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
