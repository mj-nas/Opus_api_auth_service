/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require('./package.json');

module.exports = {
  apps: [
    {
      name: `${pkg.name}-main`,
      script: 'dist/main.js',
      instances: 4,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env: {
        PORT: 3000,
        APP_ID: 'main',
      },
    },
    {
      name: `${pkg.name}-socket`,
      script: 'dist/main.js',
      autorestart: true,
      watch: false,
      env: {
        PORT: 3001,
        APP_ID: 'socket',
      },
    },
    {
      name: `${pkg.name}-webhooks`,
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env: {
        PORT: 3002,
        APP_ID: 'webhooks',
      },
    },
    {
      name: `${pkg.name}-crons`,
      script: 'dist/main.js',
      autorestart: true,
      watch: false,
      env: {
        PORT: 3003,
        APP_ID: 'crons',
      },
    },
  ],
};
