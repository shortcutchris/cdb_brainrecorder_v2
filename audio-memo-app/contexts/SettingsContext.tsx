import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@audio_memo_settings';

export type Language = 'de' | 'en' | 'es' | 'fr' | 'it' | 'pl' | 'pt' | 'ja';

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

interface SettingsContextValue {
  autoTranscribeEnabled: boolean;
  setAutoTranscribeEnabled: (enabled: boolean) => void;
  autoSummaryEnabled: boolean;
  setAutoSummaryEnabled: (enabled: boolean) => void;
  defaultLanguage: Language;
  setDefaultLanguage: (language: Language) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [autoTranscribeEnabled, setAutoTranscribeEnabledState] = useState(true); // Default: AN
  const [autoSummaryEnabled, setAutoSummaryEnabledState] = useState(true); // Default: AN
  const [defaultLanguage, setDefaultLanguageState] = useState<Language>('de'); // Default: Deutsch
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
        setAutoSummaryEnabledState(settings.autoSummaryEnabled ?? true);
        setDefaultLanguageState(settings.defaultLanguage ?? 'de');
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
      // Load current settings to preserve other values
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const currentSettings = stored ? JSON.parse(stored) : {};
      const settings = { ...currentSettings, autoTranscribeEnabled: enabled };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving auto-transcribe setting:', error);
    }
  };

  const setAutoSummaryEnabled = async (enabled: boolean) => {
    try {
      setAutoSummaryEnabledState(enabled);
      // Load current settings to preserve other values
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const currentSettings = stored ? JSON.parse(stored) : {};
      const settings = { ...currentSettings, autoSummaryEnabled: enabled };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving auto-summary setting:', error);
    }
  };

  const setDefaultLanguage = async (language: Language) => {
    try {
      setDefaultLanguageState(language);
      // Load current settings to preserve other values
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const currentSettings = stored ? JSON.parse(stored) : {};
      const settings = { ...currentSettings, defaultLanguage: language };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving default language setting:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        autoTranscribeEnabled,
        setAutoTranscribeEnabled,
        autoSummaryEnabled,
        setAutoSummaryEnabled,
        defaultLanguage,
        setDefaultLanguage,
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
