import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.occupyo.app',
  appName: 'Occupyo',
  webDir: 'out',
  server: {
    url: 'https://occupyo.com',
    cleartext: true
  }
};

export default config;
