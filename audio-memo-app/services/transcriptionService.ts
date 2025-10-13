import { OPENAI_API_KEY } from '../config/env';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Transcription Service
 * Uses OpenAI Whisper API to transcribe audio files
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface TranscriptionError {
  message: string;
  code?: string;
}

/**
 * Transcribe an audio file using OpenAI Whisper API
 * @param audioUri Local file URI of the audio recording
 * @returns Transcribed text
 * @throws Error if transcription fails
 */
export async function transcribeAudio(
  audioUri: string
): Promise<TranscriptionResult> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'OpenAI API Key nicht konfiguriert. Bitte füge deinen API Key in app.config.js hinzu.'
    );
  }

  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio-Datei nicht gefunden');
    }

    // Create form data
    const formData = new FormData();

    // Append the audio file
    // @ts-ignore - FormData typing issue with React Native
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a', // iOS default format
      name: 'recording.m4a',
    });

    // Set model
    formData.append('model', 'whisper-1');

    // Optional: Set language to German (or auto-detect by omitting)
    formData.append('language', 'de');

    // Make API request
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Don't set Content-Type manually, let fetch handle it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API Fehler: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      text: result.text || '',
      duration: result.duration,
    };
  } catch (error: any) {
    console.error('Transcription error:', error);

    // Provide user-friendly error messages
    if (error.message?.includes('API Key')) {
      throw new Error('OpenAI API Key ungültig oder nicht gesetzt');
    }

    if (error.message?.includes('network')) {
      throw new Error(
        'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.'
      );
    }

    throw new Error(
      error.message || 'Transkription fehlgeschlagen. Bitte versuche es erneut.'
    );
  }
}

/**
 * Check if the transcription service is properly configured
 */
export function isTranscriptionServiceConfigured(): boolean {
  return Boolean(OPENAI_API_KEY);
}
