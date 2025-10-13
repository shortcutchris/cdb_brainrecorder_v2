import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Recording } from '../types';

const STORAGE_KEY = '@audio_memo_recordings';

/**
 * Custom hook for managing audio recordings (CRUD operations + persistence)
 */
export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Validate that recording files still exist in file system
   */
  const validateRecordings = async (recs: Recording[]): Promise<Recording[]> => {
    const validated: Recording[] = [];

    for (const rec of recs) {
      const fileInfo = await FileSystem.getInfoAsync(rec.uri);
      if (fileInfo.exists) {
        validated.push(rec);
      } else {
        console.warn(`File not found: ${rec.uri}`);
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
      await FileSystem.deleteAsync(recording.uri, { idempotent: true });

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

  return {
    recordings,
    loading,
    addRecording,
    updateRecording,
    deleteRecording,
    getRecording,
    refresh: loadRecordings,
  };
}
