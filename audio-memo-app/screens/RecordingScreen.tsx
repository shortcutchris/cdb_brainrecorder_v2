import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { startRecording, stopRecording, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Recording'>;

export default function RecordingScreen({ navigation }: Props) {
  const { addRecording } = useRecordings();
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
    <View style={styles.container}>
      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Recording Indicator */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.recordingText}>● REC</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatDuration(duration)}
          </Text>
        </View>

        {/* Stop Button */}
        <TouchableOpacity
          onPress={handleStop}
          style={[
            styles.stopButton,
            {
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
          ]}
        >
          <Text style={styles.stopButtonText}>⏹ Stopp</Text>
        </TouchableOpacity>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          Zum Speichern stoppen
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordingText: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  timerContainer: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#EF4444',
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
    color: '#64748B',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
});
