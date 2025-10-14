import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings, LANGUAGES } from '../contexts/SettingsContext';
import { useLocalization, APP_LANGUAGES } from '../contexts/LocalizationContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { themeMode, colors, setThemeMode, isDark } = useTheme();
  const { autoTranscribeEnabled, setAutoTranscribeEnabled, autoSummaryEnabled, setAutoSummaryEnabled, defaultLanguage, setDefaultLanguage } = useSettings();
  const { appLanguage, setAppLanguage } = useLocalization();
  const { t } = useTranslation();
  const [showAppLanguageModal, setShowAppLanguageModal] = useState(false);
  const [showAiLanguageModal, setShowAiLanguageModal] = useState(false);

  const handleThemeChange = async (mode: 'auto' | 'light' | 'dark') => {
    await setThemeMode(mode);
  };

  const selectedAiLanguage = LANGUAGES.find(lang => lang.code === defaultLanguage) || LANGUAGES[0];
  const selectedAppLanguage = APP_LANGUAGES.find(lang => lang.code === appLanguage) || APP_LANGUAGES[0];

  const getModeText = (mode: string) => {
    if (mode === 'auto') return t('settings.modeAuto');
    if (mode === 'light') return t('settings.modeLight');
    return t('settings.modeDark');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.appearance')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Auto */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('auto')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'auto' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.appearanceAuto')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.appearanceAutoDesc')}
                  </Text>
                </View>
              </View>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Light */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'light' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.appearanceLight')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.appearanceLightDesc')}
                  </Text>
                </View>
              </View>
              <Ionicons name="sunny-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Dark */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'dark' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.appearanceDark')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.appearanceDarkDesc')}
                  </Text>
                </View>
              </View>
              <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.aiSettings')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setAutoTranscribeEnabled(!autoTranscribeEnabled)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: autoTranscribeEnabled ? colors.primary : 'transparent' }]}>
                  {autoTranscribeEnabled && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.autoTranscribe')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.autoTranscribeDesc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => setAutoSummaryEnabled(!autoSummaryEnabled)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: autoSummaryEnabled ? colors.primary : 'transparent' }]}>
                  {autoSummaryEnabled && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.autoSummary')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.autoSummaryDesc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prompt Library Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.promptLibrary')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('PromptLibrary')}
            >
              <View style={styles.optionLeft}>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.managePrompts')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.managePromptsDesc')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language & Region Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.language')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* App Language */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => setShowAppLanguageModal(true)}
            >
              <View style={styles.optionLeft}>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.appLanguage')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.appLanguageDesc')}
                  </Text>
                </View>
              </View>
              <View style={styles.languageDisplay}>
                <Text style={[styles.languageText, { color: colors.text }]}>
                  {selectedAppLanguage.flag} {selectedAppLanguage.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* AI Language */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => setShowAiLanguageModal(true)}
            >
              <View style={styles.optionLeft}>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t('settings.aiLanguage')}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {t('settings.aiLanguageDesc')}
                  </Text>
                </View>
              </View>
              <View style={styles.languageDisplay}>
                <Text style={[styles.languageText, { color: colors.text }]}>
                  {selectedAiLanguage.flag} {selectedAiLanguage.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.about')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('settings.appName')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                CDB BrainRecorder
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('settings.version')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('settings.phase')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {t('settings.phaseValue')}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {t('settings.currentMode', { mode: getModeText(themeMode) })}
              {themeMode === 'auto' && ` (${getModeText(isDark ? 'dark' : 'light')})`}
            </Text>
          </View>
        </View>
      </View>

      {/* App Language Modal */}
      <Modal
        visible={showAppLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAppLanguageModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.selectLanguage')}</Text>

            <View style={styles.languageList}>
              {APP_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    appLanguage === language.code && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => {
                    setAppLanguage(language.code);
                    setShowAppLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, { color: colors.text }]}>
                    {language.flag} {language.name}
                  </Text>
                  {appLanguage === language.code && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* AI Language Modal */}
      <Modal
        visible={showAiLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAiLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAiLanguageModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.selectLanguage')}</Text>

            <View style={styles.languageList}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    defaultLanguage === language.code && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => {
                    setDefaultLanguage(language.code);
                    setShowAiLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, { color: colors.text }]}>
                    {language.flag} {language.name}
                  </Text>
                  {defaultLanguage === language.code && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  languageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  languageList: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
