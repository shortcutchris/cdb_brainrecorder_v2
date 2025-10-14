import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/config';

const APP_LANGUAGE_STORAGE_KEY = '@app_language';

export type AppLanguage = 'de' | 'en';

export const APP_LANGUAGES: { code: AppLanguage; name: string; flag: string }[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

interface LocalizationContextValue {
  appLanguage: AppLanguage;
  setAppLanguage: (language: AppLanguage) => Promise<void>;
  loading: boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}

interface LocalizationProviderProps {
  children: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [appLanguage, setAppLanguageState] = useState<AppLanguage>('de');
  const [loading, setLoading] = useState(true);

  /**
   * Load app language from AsyncStorage
   */
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
        if (stored && (stored === 'de' || stored === 'en')) {
          setAppLanguageState(stored);
          await i18n.changeLanguage(stored);
        }
      } catch (error) {
        console.error('Error loading app language:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, []);

  /**
   * Set app language and persist to AsyncStorage
   */
  const setAppLanguage = async (language: AppLanguage) => {
    try {
      setAppLanguageState(language);
      await AsyncStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error saving app language:', error);
    }
  };

  const value: LocalizationContextValue = {
    appLanguage,
    setAppLanguage,
    loading,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}
