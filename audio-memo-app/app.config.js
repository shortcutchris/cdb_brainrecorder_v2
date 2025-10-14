// Load environment variables from .env file
import 'dotenv/config';

export default {
  expo: {
    name: 'CDB BrainRecorder',
    slug: 'audio-memo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cdb.brainrecorder',
      buildNumber: '2',
      infoPlist: {
        NSMicrophoneUsageDescription: 'This app needs access to your microphone to record audio memos.',
        UIBackgroundModes: ['audio'],
        ITSAppUsesNonExemptEncryption: false,
      },
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
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
      eas: {
        projectId: 'b2803f18-2a5a-41cd-a82e-5f4751bbf73c',
      },
    },
  },
};
