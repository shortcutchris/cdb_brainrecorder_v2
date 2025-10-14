import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import deCommon from '../locales/de/common.json';
import deScreens from '../locales/de/screens.json';
import enCommon from '../locales/en/common.json';
import enScreens from '../locales/en/screens.json';

const resources = {
  de: {
    common: deCommon,
    screens: deScreens,
  },
  en: {
    common: enCommon,
    screens: enScreens,
  },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'de', // Default language
    fallbackLng: 'de',
    defaultNS: 'screens',
    ns: ['common', 'screens'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
