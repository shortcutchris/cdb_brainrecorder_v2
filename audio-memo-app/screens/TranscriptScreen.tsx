import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Transcript'>;

export default function TranscriptScreen({ route, navigation }: Props) {
  const { recordingId } = route.params;
  const { getRecording, transcribeRecording } = useRecordings();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const recording = getRecording(recordingId);

  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      await transcribeRecording(recordingId);
    } catch (error) {
      Alert.alert(t('transcript.errorTitle'), t('transcript.errorMessage'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (recording?.transcript?.text) {
      await Clipboard.setStringAsync(recording.transcript.text);
      Alert.alert(t('transcript.copiedTitle'), t('transcript.copiedMessage'));
    }
  };

  const handleShare = async () => {
    if (recording?.transcript?.text) {
      try {
        await Share.share({
          message: recording.transcript.text,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  if (!recording) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
          {t('transcript.notFound')}
        </Text>
      </View>
    );
  }

  const transcript = recording.transcript;
  const hasTranscript = transcript && transcript.status === 'completed';
  const isProcessing = transcript?.status === 'processing' || isTranscribing;
  const hasError = transcript?.status === 'error';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mic-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{recording.name}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(recording.createdAt)}
          </Text>
        </View>

        {/* Transcript Content */}
        <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* No Transcript Yet */}
          {!transcript && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {t('transcript.emptyTitle')}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                {t('transcript.emptyDescription')}
              </Text>
              <TouchableOpacity
                onPress={handleTranscribe}
                style={[styles.transcribeButton, { backgroundColor: colors.primary }]}
                disabled={isTranscribing}
              >
                <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.transcribeButtonText}>{t('transcript.createButton')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Processing State */}
          {isProcessing && (
            <View style={styles.processingState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.text }]}>
                {t('transcript.processingTitle')}
              </Text>
              <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
                {t('transcript.processingDescription')}
              </Text>
            </View>
          )}

          {/* Error State */}
          {hasError && !isProcessing && (
            <View style={styles.errorState}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {t('transcript.errorRetry')}
              </Text>
              <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
                {transcript.error || t('transcript.errorUnknown')}
              </Text>
              <TouchableOpacity
                onPress={handleTranscribe}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.retryButtonText}>{t('common:buttons.retry')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completed State */}
          {hasTranscript && !isProcessing && (
            <View style={styles.completedState}>
              <View style={styles.transcriptHeader}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <Text style={[styles.transcriptHeaderText, { color: colors.text }]}>
                  {t('transcript.transcriptTitle')}
                </Text>
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>
                {transcript.text}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {hasTranscript && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleCopyToClipboard}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="copy-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {t('transcript.copyButton')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="share-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {t('common:buttons.share')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTranscribe}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {t('transcript.reloadButton')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 170, 58, 0.1)',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
  },
  transcriptCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    minHeight: 200,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  transcribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  transcribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedState: {
    // No special styling needed
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  transcriptHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
