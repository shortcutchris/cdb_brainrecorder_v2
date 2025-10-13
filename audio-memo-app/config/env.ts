/**
 * Environment Configuration
 *
 * IMPORTANT: Create a .env file in the root directory with:
 * OPENAI_API_KEY=your-api-key-here
 */

// For Expo, we use expo-constants to access environment variables
import Constants from 'expo-constants';

export const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. Please add it to app.config.js');
}
