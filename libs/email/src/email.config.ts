import { MailerOptions } from '@nestjs-modules/mailer';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'email',
  (): MailerOptions => ({
    transports: {
      Gmail: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      CustomerServices: {
        host: process.env.SMTP_HOST_365,
        port: parseInt(process.env.SMTP_PORT_365, 10),
        auth: {
          user: process.env.SMTP_USER_CUSTOMER_SERVICE,
          pass: process.env.SMTP_PASS_CUSTOMER_SERVICE,
        },
        secure: false,
        tls: {
          ciphers: 'SSLv3', // Ensures compatibility with certain older servers
        },
      },
      Orders: {
        host: process.env.SMTP_HOST_365,
        port: parseInt(process.env.SMTP_PORT_365, 10),
        auth: {
          user: process.env.SMTP_USER_ORDERS,
          pass: process.env.SMTP_PASS_ORDERS,
        },
        secure: false,
        tls: {
          ciphers: 'SSLv3', // Ensures compatibility with certain older servers
        },
      },
      Info: {
        host: process.env.SMTP_HOST_365,
        port: parseInt(process.env.SMTP_PORT_365, 10),
        auth: {
          user: process.env.SMTP_USER_INFO,
          pass: process.env.SMTP_PASS_INFO,
        },
        secure: false,
        tls: {
          ciphers: 'SSLv3', // Ensures compatibility with certain older servers
        },
      },
    },
    defaults: {
      from: `"OPUS" <${process.env.SMTP_USER_CUSTOMER_SERVICE}>`,
    },
  }),
);
