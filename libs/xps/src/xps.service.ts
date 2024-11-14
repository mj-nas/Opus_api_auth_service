import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Job } from 'src/core/core.job';
import { SettingService } from 'src/modules/sql/setting/setting.service';

@Injectable()
export class XpsService {
  public constructor(
    private _config: ConfigService,
    private _settingService: SettingService,
  ) {}

  async createShipment(job: Job): Promise<any> {
    try {
      const { payload } = job;
      const senderData = await this._settingService.$db.getAllRecords({
        options: {
          where: {
            group_id: 2,
          },
          attributes: ['name', 'value', 'display_name'],
        },
      });
      const senderObj = senderData.data.reduce((acc, curr) => {
        acc[curr.display_name.toLowerCase()] = curr.value;
        return acc;
      }, {});
      const returnAddressData = await this._settingService.$db.getAllRecords({
        options: {
          where: {
            group_id: 3,
          },
          attributes: ['name', 'value', 'display_name'],
        },
      });
      const returnAddressObj = returnAddressData.data.reduce((acc, curr) => {
        acc[curr.display_name.toLowerCase()] = curr.value;
        return acc;
      }, {});
      payload.sender = senderObj;
      payload.returnTo = returnAddressObj;
      const apiKey = this._config.get('xps').api_key;
      const customer_id = this._config.get('xps').customer_id;
      const integration_id = this._config.get('xps').integration_id;
      const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/integrations/${integration_id}/orders/${payload.orderId}`;

      const response = await axios.put(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `RSIS ${apiKey}`,
        },
      });
      console.log(response.data);

      return { data: response.data };
    } catch (error) {
      console.error(error.response.data);
      return { error: error.response.data };
    }
  }

  async deleteOrder(job: Job): Promise<any> {
    const { payload } = job;
    const apiKey = this._config.get('xps').api_key;
    const customer_id = this._config.get('xps').customer_id;
    const integration_id = this._config.get('xps').integration_id;
    const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/integrations/${integration_id}/orders/${payload.orderId}`;

    try {
      const response = await axios.delete(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `RSIS ${apiKey}`,
        },
      });

      return { data: response.data };
    } catch (error) {
      console.error(error.data);
      return { error: error.data };
    }
  }

  async quoteShippingPrice(job: Job): Promise<any> {
    const { payload } = job;
    const apiKey = this._config.get('xps').api_key;
    const customer_id = this._config.get('xps').customer_id;

    const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/quote`;
    console.log(payload);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `RSIS ${apiKey}`,
        },
      });
      return { data: response.data };
    } catch (error) {
      console.log(error.response.data);
      console.error(error.response.data);
      return { error: error.response.data };
    }
  }
}
