// Load environment variables from .env file
import 'dotenv/config';

export default {
  expo: {
    name: 'audio-memo-app',
    slug: 'audio-memo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    // Make environment variables available in the app
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    },
  },
};
