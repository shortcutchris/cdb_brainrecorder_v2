import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Recording } from '../types';
import { transcribeAudio } from '../services/transcriptionService';
import { generateSummary, executeCustomPrompt } from '../services/aiService';
import { useSettings } from '../contexts/SettingsContext';

const STORAGE_KEY = '@audio_memo_recordings';

/**
 * Custom hook for managing audio recordings (CRUD operations + persistence)
 */
export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const { autoSummaryEnabled } = useSettings();

  /**
   * Validate that recording files still exist in file system
   */
  const validateRecordings = async (recs: Recording[]): Promise<Recording[]> => {
    const validated: Recording[] = [];

    for (const rec of recs) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(rec.uri);
        if (fileInfo.exists) {
          validated.push(rec);
        } else {
          console.warn(`File not found: ${rec.uri}`);
        }
      } catch (error) {
        console.warn(`Error checking file: ${rec.uri}`, error);
      }
    }

    return validated;
  };

  /**
   * Save recordings array to AsyncStorage
   */
  const saveToStorage = async (recs: Recording[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  };

  /**
   * Load recordings from AsyncStorage
   */
  const loadRecordings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: Recording[] = JSON.parse(stored);

        // Validate that files still exist
        const validated = await validateRecordings(parsed);
        setRecordings(validated);

        // If some files were removed, update storage
        if (validated.length !== parsed.length) {
          await saveToStorage(validated);
        }
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Load all recordings from AsyncStorage on mount
   */
  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  /**
   * Add a new recording
   */
  const addRecording = useCallback(async (recording: Recording) => {
    try {
      const updated = [recording, ...recordings];
      setRecordings(updated);
      await saveToStorage(updated);
      return true;
    } catch (error) {
      console.error('Error adding recording:', error);
      return false;
    }
  }, [recordings]);

  /**
   * Update recording name
   */
  const updateRecording = useCallback(async (id: string, newName: string) => {
    try {
      const updated = recordings.map(rec =>
        rec.id === id ? { ...rec, name: newName } : rec
      );
      setRecordings(updated);
      await saveToStorage(updated);
      return true;
    } catch (error) {
      console.error('Error updating recording:', error);
      return false;
    }
  }, [recordings]);

  /**
   * Delete a recording (removes file + metadata)
   */
  const deleteRecording = useCallback(async (id: string) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording) return false;

      // Delete file from file system
      try {
        await FileSystem.deleteAsync(recording.uri, { idempotent: true });
      } catch (fileError) {
        console.warn('Error deleting file:', fileError);
        // Continue anyway to remove from state
      }

      // Remove from state and storage
      const updated = recordings.filter(r => r.id !== id);
      setRecordings(updated);
      await saveToStorage(updated);

      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }, [recordings]);

  /**
   * Get a single recording by ID
   */
  const getRecording = useCallback((id: string): Recording | undefined => {
    return recordings.find(r => r.id === id);
  }, [recordings]);

  /**
   * Transcribe a recording using OpenAI Whisper API
   * @param id Recording ID
   * @param audioUri Optional audio URI (if recording is not yet in state)
   */
  const transcribeRecording = useCallback(async (id: string, audioUri?: string) => {
    try {
      // If URI is provided, use it directly (for auto-transcribe)
      // Otherwise, find the recording in the array
      let recordingUri = audioUri;
      if (!recordingUri) {
        const recording = recordings.find(r => r.id === id);
        if (!recording) {
          throw new Error('Aufnahme nicht gefunden');
        }
        recordingUri = recording.uri;
      }

      // Load current recordings with retry logic to ensure recording exists
      let currentRecordings: Recording[] = [];
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const loadedRecordings: Recording[] = stored ? JSON.parse(stored) : [];

        // Check if recording exists
        const foundRecording = loadedRecordings.find(r => r.id === id);
        if (foundRecording) {
          currentRecordings = loadedRecordings;
          break;
        }

        // Wait before retry
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // If recording still not found after retries, throw error
      if (!currentRecordings.find(r => r.id === id)) {
        throw new Error('Aufnahme nicht gefunden nach mehreren Versuchen');
      }

      // Set status to processing
      const updatedWithProcessing = currentRecordings.map(rec =>
        rec.id === id
          ? {
              ...rec,
              transcript: {
                text: '',
                status: 'processing' as const,
                createdAt: new Date().toISOString(),
              },
            }
          : rec
      );
      setRecordings(updatedWithProcessing);
      await saveToStorage(updatedWithProcessing);

      // Call transcription service
      const result = await transcribeAudio(recordingUri);

      // Reload to get latest state
      const stored2 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings2: Recording[] = stored2 ? JSON.parse(stored2) : recordings;

      // Update with completed transcript
      const updatedWithTranscript = currentRecordings2.map(rec =>
        rec.id === id
          ? {
              ...rec,
              transcript: {
                text: result.text,
                status: 'completed' as const,
                createdAt: new Date().toISOString(),
              },
            }
          : rec
      );
      setRecordings(updatedWithTranscript);
      await saveToStorage(updatedWithTranscript);

      // Auto-summary: If enabled, automatically generate summary after successful transcription
      if (autoSummaryEnabled) {
        const updatedRecording = updatedWithTranscript.find(r => r.id === id);
        // Only trigger if summary doesn't exist or has error status
        if (updatedRecording && (!updatedRecording.summary || updatedRecording.summary.status === 'error')) {
          // Fire-and-forget: don't await, catch errors silently
          generateRecordingSummary(id).catch(error => {
            console.error('Auto-summary failed (silent):', error);
          });
        }
      }

      return true;
    } catch (error: any) {
      console.error('Error transcribing recording:', error);

      // Reload to get latest state
      const stored3 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings3: Recording[] = stored3 ? JSON.parse(stored3) : recordings;

      // Update with error status
      const updatedWithError = currentRecordings3.map(rec =>
        rec.id === id
          ? {
              ...rec,
              transcript: {
                text: '',
                status: 'error' as const,
                createdAt: new Date().toISOString(),
                error: error.message || 'Transkription fehlgeschlagen',
              },
            }
          : rec
      );
      setRecordings(updatedWithError);
      await saveToStorage(updatedWithError);

      throw error;
    }
  }, [recordings]);

  /**
   * Generate AI summary for a recording
   * @param id Recording ID
   * @param language Target language for the summary (default: 'de')
   */
  const generateRecordingSummary = useCallback(async (id: string, language: string = 'de') => {
    try {
      // Load from AsyncStorage to get latest state
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings: Recording[] = stored ? JSON.parse(stored) : recordings;

      const recording = currentRecordings.find(r => r.id === id);
      if (!recording) {
        throw new Error('Aufnahme nicht gefunden');
      }

      if (!recording.transcript || recording.transcript.status !== 'completed') {
        throw new Error('Kein Transkript vorhanden. Bitte erst transkribieren.');
      }

      // Set status to processing
      const updatedWithProcessing = currentRecordings.map(rec =>
        rec.id === id
          ? {
              ...rec,
              summary: {
                text: '',
                status: 'processing' as const,
                createdAt: new Date().toISOString(),
              },
            }
          : rec
      );
      setRecordings(updatedWithProcessing);
      await saveToStorage(updatedWithProcessing);

      // Call AI service
      const result = await generateSummary(recording.transcript.text, language as any);

      // Reload to get latest state
      const stored2 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings2: Recording[] = stored2 ? JSON.parse(stored2) : recordings;

      // Update with completed summary
      const updatedWithSummary = currentRecordings2.map(rec =>
        rec.id === id
          ? {
              ...rec,
              summary: {
                text: result.text,
                status: 'completed' as const,
                createdAt: new Date().toISOString(),
              },
            }
          : rec
      );
      setRecordings(updatedWithSummary);
      await saveToStorage(updatedWithSummary);

      return true;
    } catch (error: any) {
      console.error('Error generating summary:', error);

      // Reload to get latest state
      const stored3 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings3: Recording[] = stored3 ? JSON.parse(stored3) : recordings;

      // Update with error status
      const updatedWithError = currentRecordings3.map(rec =>
        rec.id === id
          ? {
              ...rec,
              summary: {
                text: '',
                status: 'error' as const,
                createdAt: new Date().toISOString(),
                error: error.message || 'Zusammenfassung fehlgeschlagen',
              },
            }
          : rec
      );
      setRecordings(updatedWithError);
      await saveToStorage(updatedWithError);

      throw error;
    }
  }, [recordings]);

  /**
   * Execute custom prompt on a recording
   * @param id Recording ID
   * @param prompt Custom prompt text
   * @param language Target language for the response (default: 'de')
   */
  const executeRecordingPrompt = useCallback(async (id: string, prompt: string, language: string = 'de') => {
    try {
      // Load from AsyncStorage to get latest state
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings: Recording[] = stored ? JSON.parse(stored) : recordings;

      const recording = currentRecordings.find(r => r.id === id);
      if (!recording) {
        throw new Error('Aufnahme nicht gefunden');
      }

      if (!recording.transcript || recording.transcript.status !== 'completed') {
        throw new Error('Kein Transkript vorhanden. Bitte erst transkribieren.');
      }

      // Create new prompt result with processing status
      const newPromptResult = {
        text: '',
        status: 'processing' as const,
        createdAt: new Date().toISOString(),
        prompt,
      };

      // Add to customPrompts array
      const updatedWithProcessing = currentRecordings.map(rec =>
        rec.id === id
          ? {
              ...rec,
              customPrompts: [...(rec.customPrompts || []), newPromptResult],
            }
          : rec
      );
      setRecordings(updatedWithProcessing);
      await saveToStorage(updatedWithProcessing);

      // Call AI service
      const result = await executeCustomPrompt(recording.transcript.text, prompt, language as any);

      // Reload to get latest state
      const stored2 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings2: Recording[] = stored2 ? JSON.parse(stored2) : recordings;

      // Update the last prompt result with completed status
      const updatedWithResult = currentRecordings2.map(rec =>
        rec.id === id
          ? {
              ...rec,
              customPrompts: [
                ...(rec.customPrompts?.slice(0, -1) || []),
                {
                  text: result.text,
                  status: 'completed' as const,
                  createdAt: new Date().toISOString(),
                  prompt,
                },
              ],
            }
          : rec
      );
      setRecordings(updatedWithResult);
      await saveToStorage(updatedWithResult);

      return true;
    } catch (error: any) {
      console.error('Error executing custom prompt:', error);

      // Reload to get latest state
      const stored3 = await AsyncStorage.getItem(STORAGE_KEY);
      const currentRecordings3: Recording[] = stored3 ? JSON.parse(stored3) : recordings;

      // Update the last prompt result with error status
      const updatedWithError = currentRecordings3.map(rec =>
        rec.id === id
          ? {
              ...rec,
              customPrompts: [
                ...(rec.customPrompts?.slice(0, -1) || []),
                {
                  text: '',
                  status: 'error' as const,
                  createdAt: new Date().toISOString(),
                  error: error.message || 'Prompt fehlgeschlagen',
                  prompt,
                },
              ],
            }
          : rec
      );
      setRecordings(updatedWithError);
      await saveToStorage(updatedWithError);

      throw error;
    }
  }, [recordings]);

  return {
    recordings,
    loading,
    addRecording,
    updateRecording,
    deleteRecording,
    getRecording,
    refresh: loadRecordings,
    transcribeRecording,
    generateRecordingSummary,
    executeRecordingPrompt,
  };
}
