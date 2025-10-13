import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { startRecording, stopRecording, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Recording'>;

export default function RecordingScreen({ navigation }: Props) {
  const { addRecording } = useRecordings();
  const { colors } = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    initRecording();
    return () => {
      // Cleanup
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  // Timer for duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const initRecording = async () => {
    const newRecording = await startRecording();
    if (newRecording) {
      setRecording(newRecording);
      setIsRecording(true);
    } else {
      Alert.alert(
        'Fehler',
        'Mikrofonzugriff wurde verweigert. Bitte erlaube den Zugriff in den Einstellungen.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleStop = async () => {
    if (!recording) return;

    setIsRecording(false);
    const newRecording = await stopRecording(recording);

    if (newRecording) {
      await addRecording(newRecording);
      navigation.goBack();
    } else {
      Alert.alert('Fehler', 'Aufnahme konnte nicht gespeichert werden.');
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Aufnahme verwerfen?',
      'Möchtest du die aktuelle Aufnahme wirklich verwerfen?',
      [
        { text: 'Weiter aufnehmen', style: 'cancel' },
        {
          text: 'Verwerfen',
          style: 'destructive',
          onPress: async () => {
            if (recording) {
              await recording.stopAndUnloadAsync();
            }
            navigation.goBack();
          },
        },
      ]
    );
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
          <Ionicons name="radio-button-on" size={24} color={colors.danger} />
          <Text style={[styles.recordingText, { color: colors.danger }]}>REC</Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.timerText, { color: colors.text }]}>
            {formatDuration(duration)}
          </Text>
        </View>

        {/* Stop Button */}
        <TouchableOpacity
          onPress={handleStop}
          style={[
            styles.stopButton,
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
          <Text style={styles.stopButtonText}>Stopp</Text>
        </TouchableOpacity>

        {/* Helper Text */}
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          Zum Speichern stoppen
        </Text>
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
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    elevation: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
});
