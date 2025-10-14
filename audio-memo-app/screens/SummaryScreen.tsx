import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings, LANGUAGES, type Language } from '../contexts/SettingsContext';
import { formatDate, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { recordingId } = route.params;
  const { getRecording, generateRecordingSummary, refresh } = useRecordings();
  const { colors } = useTheme();
  const { defaultLanguage } = useSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await refresh(false);
        setIsReady(true);
      };
      loadData();
    }, [refresh])
  );

  const recording = getRecording(recordingId);

  // Only show error after data is loaded
  useEffect(() => {
    if (isReady && !recording) {
      Alert.alert(t('summary:errorTitle'), t('common:errors.recordingNotFound'));
      navigation.goBack();
    }
  }, [isReady, recording, navigation, t]);

  const handleGenerate = async () => {
    if (!recording) return;

    // Check if transcript exists
    if (!recording.transcript || recording.transcript.status !== 'completed') {
      Alert.alert(
        t('common:errors.noTranscriptTitle'),
        t('common:errors.noTranscriptMessage'),
        [
          { text: t('common:buttons.ok') },
          {
            text: t('common:buttons.goToTranscript'),
            onPress: () => navigation.navigate('Transcript', { recordingId }),
          },
        ]
      );
      return;
    }

    setIsGenerating(true);
    try {
      await generateRecordingSummary(recordingId, selectedLanguage);
    } catch (error: any) {
      Alert.alert(
        t('summary:errorTitle'),
        error.message || t('common:errors.summaryFailed')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (recording?.summary?.text) {
      await Clipboard.setStringAsync(recording.summary.text);
      Alert.alert(t('common:alerts.copied'), t('common:alerts.summaryClipboard'));
    }
  };

  if (!recording) {
    return null;
  }

  const summary = recording.summary;
  const hasSummary = summary && summary.status === 'completed';
  const isProcessing = summary && summary.status === 'processing';
  const hasError = summary && summary.status === 'error';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Recording Info */}
        <View style={styles.recordingInfo}>
          <View style={styles.iconContainer}>
            <Ionicons name="mic-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.recordingName, { color: colors.text }]}>
              {recording.name}
            </Text>
            <Text style={[styles.recordingMeta, { color: colors.textSecondary }]}>
              {formatDate(recording.createdAt)} • {formatDuration(recording.duration)}
            </Text>
          </View>
        </View>

        {/* Summary Content */}
        {!hasSummary && !isProcessing && !hasError && (
          <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="sparkles-outline" size={48} color={colors.textSecondary} style={styles.emptyStateIcon} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {t('summary:emptyTitle')}
            </Text>
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              {t('summary:emptyDescription')}
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              style={[styles.generateButton, { backgroundColor: colors.primary }]}
              disabled={isGenerating}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>{t('summary:createButton')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {t('summary:processingTitle')}
            </Text>
            <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
              {t('summary:processingDescription')}
            </Text>
          </View>
        )}

        {hasError && (
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.danger }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} style={styles.errorIcon} />
            <Text style={[styles.errorTitle, { color: colors.danger }]}>
              {t('summary:errorTitle')}
            </Text>
            <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
              {summary.error || t('summary:errorRetry')}
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              disabled={isGenerating}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>{t('common:buttons.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasSummary && (
          <>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="sparkles" size={20} color={colors.success} />
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  {t('summary:summaryTitle')}
                </Text>
              </View>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                {summary.text}
              </Text>
            </View>

            {/* Language Selector */}
            <View style={styles.languageSection}>
              <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>
                {t('summary:languageLabel')}
              </Text>
              <TouchableOpacity
                style={[styles.languageSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text style={[styles.languageSelectorText, { color: colors.text }]}>
                  {selectedLang.flag} {selectedLang.name}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleCopyToClipboard}
                style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
              >
                <Ionicons name="copy-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>{t('common:buttons.copy')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerate}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                disabled={isGenerating}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>{t('summary:regenerateButton')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('common:modals.selectLanguage')}
            </Text>

            <View style={styles.languageList}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === language.code && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => {
                    setSelectedLanguage(language.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, { color: colors.text }]}>
                    {language.flag} {language.name}
                  </Text>
                  {selectedLanguage === language.code && (
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
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 170, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  recordingName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingMeta: {
    fontSize: 14,
  },
  emptyStateCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 32,
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  languageSection: {
    marginBottom: 16,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  languageSelectorText: {
    fontSize: 15,
    fontWeight: '500',
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
