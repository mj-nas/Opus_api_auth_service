import { registerAs } from '@nestjs/config';

export default registerAs(
  'xps',
  (): {
    api_key?: string;
    customer_id?: string;
    integration_id?: string;
  } => ({
    api_key: process.env.XPS_API_KEY,
    customer_id: process.env.XPS_CUSTOMER_ID,
    integration_id: process.env.XPS_INTEGRATION_ID,
  }),
);
