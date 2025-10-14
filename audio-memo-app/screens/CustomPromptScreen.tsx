import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, AiResult } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings, LANGUAGES, type Language } from '../contexts/SettingsContext';
import { formatDate, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomPrompt'>;

export default function CustomPromptScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { recordingId } = route.params;
  const { getRecording, executeRecordingPrompt, refresh } = useRecordings();
  const { colors } = useTheme();
  const { defaultLanguage } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
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
      Alert.alert(t('screens:customPrompt.errorTitle'), t('common:errors.recordingNotFound'));
      navigation.goBack();
    }
  }, [isReady, recording, navigation, t]);

  const handleExecute = async () => {
    if (!recording) return;

    if (!prompt.trim()) {
      Alert.alert(t('screens:customPrompt.hintTitle'), t('screens:customPrompt.hintMessage'));
      return;
    }

    // Check if transcript exists
    if (!recording.transcript || recording.transcript.status !== 'completed') {
      Alert.alert(
        t('screens:customPrompt.noTranscriptTitle'),
        t('screens:customPrompt.noTranscriptMessage'),
        [
          { text: t('common:buttons.ok') },
          {
            text: t('common:buttons.toTranscript'),
            onPress: () => navigation.navigate('Transcript', { recordingId }),
          },
        ]
      );
      return;
    }

    setIsExecuting(true);
    try {
      await executeRecordingPrompt(recordingId, prompt.trim(), selectedLanguage);
      setPrompt(''); // Clear input after successful execution
    } catch (error: any) {
      Alert.alert(
        t('screens:customPrompt.errorTitle'),
        error.message || t('screens:customPrompt.errorMessage')
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t('common:alerts.copied'), t('common:alerts.copiedToClipboard'));
  };

  if (!recording) {
    return null;
  }

  const customPrompts = recording.customPrompts || [];
  const hasResults = customPrompts.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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

          {/* Results List */}
          {hasResults && (
            <View style={styles.resultsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('screens:customPrompt.historyTitle')}
              </Text>
              {[...customPrompts].reverse().map((result, index) => (
                <ResultCard
                  key={index}
                  result={result}
                  colors={colors}
                  onCopy={handleCopyResult}
                  t={t}
                />
              ))}
            </View>
          )}

          {!hasResults && (
            <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} style={styles.emptyStateIcon} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                {t('screens:customPrompt.emptyTitle')}
              </Text>
              <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                {t('screens:customPrompt.emptyDescription')}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Prompt Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {/* Language Selector */}
          <View style={styles.languageSection}>
            <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>
              {t('screens:customPrompt.languageLabel')}
            </Text>
            <TouchableOpacity
              style={[styles.languageSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={[styles.languageSelectorText, { color: colors.text }]}>
                {selectedLang.flag} {selectedLang.name}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder={t('screens:customPrompt.inputPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            multiline
            maxLength={500}
            editable={!isExecuting}
          />
          <TouchableOpacity
            onPress={handleExecute}
            style={[
              styles.executeButton,
              { backgroundColor: prompt.trim() && !isExecuting ? colors.primary : colors.textSecondary },
            ]}
            disabled={!prompt.trim() || isExecuting}
          >
            {isExecuting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.executeButtonText}>{t('common:buttons.execute')}</Text>
              </>
            )}
          </TouchableOpacity>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('common:language.selectLanguage')}</Text>

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
      </View>
    </KeyboardAvoidingView>
  );
}

function ResultCard({
  result,
  colors,
  onCopy,
  t,
}: {
  result: AiResult;
  colors: any;
  onCopy: (text: string) => void;
  t: any;
}) {
  const isProcessing = result.status === 'processing';
  const isCompleted = result.status === 'completed';
  const hasError = result.status === 'error';

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Prompt */}
      <View style={styles.promptSection}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.promptText, { color: colors.textSecondary }]}>
          {result.prompt}
        </Text>
      </View>

      {/* Result */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.processingText, { color: colors.textSecondary }]}>
            {t('screens:customPrompt.processingText')}
          </Text>
        </View>
      )}

      {isCompleted && (
        <>
          <Text style={[styles.resultText, { color: colors.text }]}>
            {result.text}
          </Text>
          <TouchableOpacity
            onPress={() => onCopy(result.text)}
            style={[styles.copyButton, { backgroundColor: colors.textSecondary }]}
          >
            <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>{t('common:buttons.copy')}</Text>
          </TouchableOpacity>
        </>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {result.error || t('screens:customPrompt.errorExecuting')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  resultsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  promptSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
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
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  languageSelectorText: {
    fontSize: 14,
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
