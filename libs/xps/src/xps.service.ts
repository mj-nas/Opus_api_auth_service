import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'src/core/core.job';

@Injectable()
export class XpsService {
  // public stripe: Stripe;
  public constructor(private _config: ConfigService) {}

  async createShipment(job: Job): Promise<any> {
    try {
      const { payload, owner } = job;
      const apiKey = this._config.get('xps').apiKey;
      const customer_id = this._config.get('xps').customer_id;
      const integration_id = this._config.get('xps').integration_id;
      const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/integrations/${integration_id}/orders/${payload.order_id}`;
      console.log('Creating shipment', job);
      return { data: 'Shipment created' };
    } catch (error) {
      return { error };
    }
  }
}
