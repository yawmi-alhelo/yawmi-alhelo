import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yawmialhelo.app',
  appName: 'يومي الحلو',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#FFF5F8',
    buildOptions: {
      releaseType: 'APK',
    },
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      iconColor: '#FF8FB1',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFF5F8',
    },
  },
};

export default config;
