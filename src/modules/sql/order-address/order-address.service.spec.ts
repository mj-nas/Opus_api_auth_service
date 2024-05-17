import { Test, TestingModule } from '@nestjs/testing';
import { OrderAddressService } from './order-address.service';

describe('OrderAddressService', () => {
  let service: OrderAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderAddressService],
    }).compile();

    service = module.get<OrderAddressService>(OrderAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
