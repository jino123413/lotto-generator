import { appsInToss } from '@apps-in-toss/framework/plugins';
import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'lotto-generator',
  plugins: [
    appsInToss({
      brand: {
        displayName: '로또메이트',
        primaryColor: '#FF6B35',
        icon: 'https://raw.githubusercontent.com/jino123413/app-logos/master/lotto-generator.png',
        bridgeColorMode: 'basic',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});
