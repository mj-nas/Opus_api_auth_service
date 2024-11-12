import { registerAs } from '@nestjs/config';

export default registerAs(
  'tinyUrl',
  (): {
    api_url?: string;
    api_key?: string;
  } => ({
    api_url: process.env.TINY_URL_API_URL,
    api_key: process.env.TINY_URL_API_KEY,
  }),
);
