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
        displayName: '로또 번호 생성기',
        primaryColor: '#FF6B35',
        icon: 'https://static.toss.im/appsintoss/73/10550764-5ac1-44e2-9ff3-ad78d8d2e71a.png',
        bridgeColorMode: 'basic',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});
