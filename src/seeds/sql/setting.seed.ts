/* eslint-disable prettier/prettier */
import { Seed } from '@core/sql/seeder/seeder.dto';
import { Setting } from '../../modules/sql/setting/entities/setting.entity';

export default <Seed<Setting>>{
  model: 'Setting',
  action: 'once',
  data: [
    {
      name: 'setting_1',
      display_name: 'Setting 1',
      value: 'value 1',
      group_id: 1,
    },

    {
      name: 'contact_us',
      display_name: 'Contact Email',
      value: 'contact_us@mailinator.com',
      group_id: 1,
      option: {
        type: 'email',
        format: 'email',
        required: false,
        min: 0,
      },
    },
    {
      name: 'shipping_limit',
      display_name: 'Free shipping limit',
      value: '70.00',
      group_id: 1,
      option: {
        type: 'number',
        format: 'amount',
        required: false,
        min: 0,
      },
    },
    {
      name: 'commission',
      display_name: 'Commission',
      value: '25',
      group_id: 1,
      option: {
        type: 'number',
        format: 'amount',
        required: false,
        min: 0,
      },
    },
    {
      name: 'minus_price',
      display_name: ' Minus Price (Shipping)',
      value: '25',
      group_id: 1,
      option: {
        type: 'number',
        format: 'amount',
        required: false,
        min: 0,
      },
    },

    {
      name: 'setting_2',
      display_name: 'Setting 2',
      value: 'value 2',
      group_id: 1,
      option: {
        type: 'number',
        format: 'amount',
        required: false,
        min: 0,
      },
    },
  ],
};
