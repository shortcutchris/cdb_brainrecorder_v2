import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
  const { recordingId } = route.params;
  const { getRecording, generateRecordingSummary, refresh } = useRecordings();
  const { colors } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  const recording = getRecording(recordingId);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refresh(false);
    }, [refresh])
  );

  useEffect(() => {
    if (!recording) {
      Alert.alert('Fehler', 'Aufnahme nicht gefunden.');
      navigation.goBack();
    }
  }, [recording]);

  const handleGenerate = async () => {
    if (!recording) return;

    // Check if transcript exists
    if (!recording.transcript || recording.transcript.status !== 'completed') {
      Alert.alert(
        'Kein Transkript',
        'Bitte erstelle zuerst ein Transkript dieser Aufnahme.',
        [
          { text: 'OK' },
          {
            text: 'Zum Transkript',
            onPress: () => navigation.navigate('Transcript', { recordingId }),
          },
        ]
      );
      return;
    }

    setIsGenerating(true);
    try {
      await generateRecordingSummary(recordingId);
    } catch (error: any) {
      Alert.alert(
        'Fehler',
        error.message || 'Zusammenfassung konnte nicht erstellt werden.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (recording?.summary?.text) {
      await Clipboard.setStringAsync(recording.summary.text);
      Alert.alert('Kopiert', 'Zusammenfassung wurde in die Zwischenablage kopiert.');
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
              Noch keine Zusammenfassung
            </Text>
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              Erstelle eine AI-generierte Zusammenfassung des Transkripts
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              style={[styles.generateButton, { backgroundColor: colors.primary }]}
              disabled={isGenerating}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Zusammenfassung erstellen</Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Erstelle Zusammenfassung...
            </Text>
            <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
              Dies kann einen Moment dauern
            </Text>
          </View>
        )}

        {hasError && (
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.danger }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} style={styles.errorIcon} />
            <Text style={[styles.errorTitle, { color: colors.danger }]}>
              Fehler
            </Text>
            <Text style={[styles.errorDescription, { color: colors.textSecondary }]}>
              {summary.error || 'Zusammenfassung fehlgeschlagen'}
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              disabled={isGenerating}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>Erneut versuchen</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasSummary && (
          <>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="sparkles" size={20} color={colors.success} />
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Zusammenfassung
                </Text>
              </View>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                {summary.text}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleCopyToClipboard}
                style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
              >
                <Ionicons name="copy-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Kopieren</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerate}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                disabled={isGenerating}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Neu generieren</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
});
