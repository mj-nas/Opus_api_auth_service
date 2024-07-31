import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'src/core/core.job';

@Injectable()
export class XpsService {
  // public stripe: Stripe;
  public constructor(private _config: ConfigService) {}

  async createShipment(job: Job): Promise<any> {
    try {
      const { payload } = job;
      const apiKey = this._config.get('xps').api_key;
      const customer_id = this._config.get('xps').customer_id;
      const integration_id = this._config.get('xps').integration_id;
      const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/integrations/${integration_id}/orders/${payload.orderId}`;
      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `RSIS ${apiKey}`,
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        console.log('Shipment created');
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        console.error(res);
        console.log(res);
      });
      return { data: 'Shipment created' };
    } catch (error) {
      console.error(error);
      return { error };
    }
  }
}
