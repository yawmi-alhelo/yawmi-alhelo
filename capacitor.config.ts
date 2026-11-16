import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yawmialhelo.app',
  appName: 'يومي الحلو',
  webDir: 'dist',
  server: {
    url: 'https://yawmi-alhelo.github.io/yawmi-alhelo/',
    cleartext: true
  }
};

export default config;
