import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform, AppState } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Recording'>;

// Helper function for formatting recording names
function formatDefaultName(locale: string, label: string): string {
  const now = new Date();
  const date = now.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${label} ${date} ${time}`;
}

export default function RecordingScreen({ navigation }: Props) {
  const { addRecording, transcribeRecording } = useRecordings();
  const { colors } = useTheme();
  const { autoTranscribeEnabled } = useSettings();
  const { t } = useTranslation();

  // expo-audio Hooks
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  // Duration from recorderState (in seconds)
  const duration = Math.floor(recorderState.durationMillis / 1000);
  const isRecording = recorderState.isRecording;

  // Own state for pause/resume tracking
  const [isPaused, setIsPaused] = useState(false);

  const appState = useRef(AppState.currentState);

  // Setup Audio Mode on mount (with background recording support!)
  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        console.log('⚙️ Setting up audio mode with background support...');
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
          shouldPlayInBackground: true, // ⭐ KEY for background recording!
          interruptionMode: 'duckOthers',
          interruptionModeAndroid: 'duckOthers',
        });
        console.log('✅ Audio mode configured successfully');
      } catch (error) {
        console.error('❌ Error setting up audio mode:', error);
      }
    };

    setupAudioMode();
    console.log('✅ RecordingScreen mounted');
    initRecording();

    return () => {
      console.log('❌ RecordingScreen unmounting');
      // Cleanup: Stop recording if still active
      if (recorderState.isRecording) {
        console.log('🧹 Cleanup: Stopping active recording');
        recorder.stop().catch(err => console.error('Cleanup error:', err));
      }
    };
  }, []);

  // Timer is now directly from recorderState.durationMillis - no useEffect needed!

  // Monitor App State changes (Background/Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App has come to the foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('🌙 App has gone to the background - Recording:', isRecording ? 'CONTINUES' : 'N/A');
        if (isRecording) {
          console.log('⏱️ Current duration:', duration, 'seconds');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRecording, duration]);

  const initRecording = async () => {
    try {
      console.log('🎙️ Initializing recording...');

      // Check permission first
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        console.error('❌ Permission denied by user');
        Alert.alert(
          t('recording.errorTitle'),
          t('recording.microphonePermissionDenied'),
          [{ text: t('common:buttons.ok'), onPress: () => navigation.goBack() }]
        );
        return;
      }

      console.log('✅ Permission granted');

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();

      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('❌ Recording start ERROR:', error);
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.microphonePermissionDenied'),
        [{ text: t('common:buttons.ok'), onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleStop = async () => {
    try {
      console.log('🔴 Stopping recording...');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Stop recording
      await recorder.stop();

      const uri = recorder.uri;
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      const recordingDuration = Math.floor(recorderState.durationMillis / 1000);
      console.log('📊 Recording duration:', recordingDuration, 'seconds');

      // Generate unique ID and filename
      const id = Date.now().toString();
      const filename = `recording-${id}.m4a`;
      const newUri = `${FileSystem.documentDirectory}${filename}`;

      // Copy file to permanent location
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      // Get current language and locale for recording name
      const currentLanguage = i18n.language;
      const locale = currentLanguage === 'en' ? 'en-US' : 'de-DE';
      const label = t('common:recording.defaultName');

      // Create recording metadata
      const newRecording = {
        id,
        uri: newUri,
        name: formatDefaultName(locale, label),
        createdAt: new Date().toISOString(),
        duration: recordingDuration,
      };

      await addRecording(newRecording);

      // Auto-transcribe if enabled
      if (autoTranscribeEnabled) {
        transcribeRecording(newRecording.id, newRecording.uri).catch((error) => {
          console.error('Auto-transcribe error:', error);
        });
      }

      console.log('✅ Recording saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert(t('recording.errorTitle'), t('recording.saveFailed'));
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('recording.discardConfirm'),
      t('recording.discardMessage'),
      [
        { text: t('recording.continueRecording'), style: 'cancel' },
        {
          text: t('recording.discard'),
          style: 'destructive',
          onPress: async () => {
            if (recorderState.isRecording) {
              await recorder.stop();
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handlePause = async () => {
    try {
      console.log('⏸️ Pausing recording...');
      await recorder.pause();
      setIsPaused(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('✅ Recording paused');
    } catch (error) {
      console.error('❌ Error pausing recording:', error);
    }
  };

  const handleResume = async () => {
    try {
      console.log('▶️ Resuming recording...');
      recorder.record();
      setIsPaused(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('✅ Recording resumed');
    } catch (error) {
      console.error('❌ Error resuming recording:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={32} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Recording Indicator */}
        <View style={styles.indicatorContainer}>
          <Ionicons
            name={isPaused ? "pause-circle" : "radio-button-on"}
            size={24}
            color={isPaused ? colors.warning : colors.danger}
          />
          <Text style={[
            styles.recordingText,
            { color: isPaused ? colors.warning : colors.danger }
          ]}>
            {isPaused ? t('recording.paused') : t('recording.rec')}
          </Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.timerText, { color: colors.text }]}>
            {formatDuration(duration)}
          </Text>
        </View>

        {/* Pause/Resume and Stop Buttons (Side-by-Side) */}
        <View style={styles.buttonRow}>
          {/* Pause/Resume Button */}
          <TouchableOpacity
            onPress={isPaused ? handleResume : handlePause}
            style={[
              styles.actionButton,
              {
                backgroundColor: isPaused ? colors.success : colors.warning,
                shadowColor: isPaused ? colors.success : colors.warning,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
            ]}
          >
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.actionButtonText}>
              {isPaused ? t('recording.resume') : t('recording.pause')}
            </Text>
          </TouchableOpacity>

          {/* Stop Button */}
          <TouchableOpacity
            onPress={handleStop}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.danger,
                shadowColor: colors.danger,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
            ]}
          >
            <Ionicons name="stop" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>{t('recording.stop')}</Text>
          </TouchableOpacity>
        </View>

        {/* Helper Text */}
        <View style={styles.helperContainer}>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {isPaused ? t('recording.tapResumeToContinue') : t('recording.tapPauseToPause')}
          </Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {t('recording.tapStopToEnd')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  recordingText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 8,
  },
  timerContainer: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 8,
    minWidth: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  helperContainer: {
    marginTop: 24,
    gap: 4,
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
