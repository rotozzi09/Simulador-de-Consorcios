import { type CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.germanica.simulador',
  appName: 'Simulador Germanica',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
