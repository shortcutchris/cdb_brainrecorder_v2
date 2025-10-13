import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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
    <View className="flex-1 bg-background">
      {/* Header with Close Button */}
      <View className="absolute top-0 left-0 right-0 pt-12 pb-4 px-6 z-10">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-2xl">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Recording Indicator */}
        <View className="items-center mb-8">
          <View
            className="w-4 h-4 bg-danger rounded-full mb-2"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
            }}
          />
          <Text className="text-danger text-lg font-semibold">● REC</Text>
        </View>

        {/* Timer */}
        <View className="bg-surface rounded-2xl p-8 mb-12 shadow-sm">
          <Text className="text-5xl font-bold text-text-primary text-center">
            {formatDuration(duration)}
          </Text>
        </View>

        {/* Waveform Placeholder (Phase 2) */}
        <View className="h-16 mb-12 opacity-30">
          <Text className="text-text-secondary text-center">
            ▓▓░░▓▓▓░░▓░▓▓
          </Text>
        </View>

        {/* Stop Button */}
        <TouchableOpacity
          onPress={handleStop}
          className="bg-danger rounded-xl px-12 py-4 shadow-lg"
          style={{
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Text className="text-white text-xl font-bold">⏹ Stopp</Text>
        </TouchableOpacity>

        {/* Helper Text */}
        <Text className="text-text-secondary text-sm mt-6 text-center">
          Zum Speichern stoppen
        </Text>
      </View>
    </View>
  );
}
