import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@audio_memo_settings';

interface SettingsContextValue {
  autoTranscribeEnabled: boolean;
  setAutoTranscribeEnabled: (enabled: boolean) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [autoTranscribeEnabled, setAutoTranscribeEnabledState] = useState(true); // Default: AN
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setAutoTranscribeEnabledState(settings.autoTranscribeEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setAutoTranscribeEnabled = async (enabled: boolean) => {
    try {
      setAutoTranscribeEnabledState(enabled);
      const settings = { autoTranscribeEnabled: enabled };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving auto-transcribe setting:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        autoTranscribeEnabled,
        setAutoTranscribeEnabled,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
