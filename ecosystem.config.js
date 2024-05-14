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
  ],
};
