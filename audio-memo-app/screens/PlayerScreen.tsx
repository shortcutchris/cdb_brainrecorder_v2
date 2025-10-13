import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { formatDate, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ route, navigation }: Props) {
  const { recordingId } = route.params;
  const { getRecording, deleteRecording, updateRecording } = useRecordings();
  const recording = getRecording(recordingId);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(recording?.name || '');

  useEffect(() => {
    if (recording) {
      loadSound();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording]);

  useEffect(() => {
    // Update playback status
    if (sound) {
      const interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(Math.floor(status.positionMillis / 1000));
          setDuration(Math.floor(status.durationMillis! / 1000));
          setIsPlaying(status.isPlaying);

          // Auto-stop when finished
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [sound]);

  const loadSound = async () => {
    if (!recording) return;
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(Math.floor(status.durationMillis! / 1000));
      }
    } catch (error) {
      console.error('Error loading sound:', error);
      Alert.alert('Fehler', 'Audio konnte nicht geladen werden.');
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value * 1000);
  };

  const handleSkip = async (seconds: number) => {
    if (!sound) return;
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    await sound.setPositionAsync(newPosition * 1000);
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ Aufnahme löschen?',
      `"${recording?.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            if (sound) {
              await sound.unloadAsync();
            }
            await deleteRecording(recordingId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== recording?.name) {
      await updateRecording(recordingId, newName.trim());
    }
    setShowRenameModal(false);
  };

  if (!recording) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Aufnahme nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Icon */}
        <View className="bg-primary/10 rounded-full w-32 h-32 items-center justify-center mb-8">
          <Text className="text-6xl">🎙️</Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
          {recording.name}
        </Text>

        {/* Date */}
        <Text className="text-base text-text-secondary mb-12">
          {formatDate(recording.createdAt)}
        </Text>

        {/* Seekbar */}
        <View className="w-full mb-4">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#3B82F6"
          />
          <View className="flex-row justify-between px-2">
            <Text className="text-text-secondary">{formatDuration(position)}</Text>
            <Text className="text-text-secondary">{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Player Controls */}
        <View className="flex-row items-center justify-center space-x-6 mb-12">
          <TouchableOpacity
            onPress={() => handleSkip(-15)}
            className="bg-surface rounded-full w-14 h-14 items-center justify-center shadow-sm"
          >
            <Text className="text-2xl">⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            className="bg-primary rounded-full w-20 h-20 items-center justify-center shadow-lg"
          >
            <Text className="text-4xl">{isPlaying ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSkip(15)}
            className="bg-surface rounded-full w-14 h-14 items-center justify-center shadow-sm"
          >
            <Text className="text-2xl">⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-8">
          <TouchableOpacity
            onPress={() => {
              setNewName(recording.name);
              setShowRenameModal(true);
            }}
            className="items-center"
          >
            <View className="bg-surface rounded-full w-12 h-12 items-center justify-center shadow-sm mb-2">
              <Text className="text-2xl">✏️</Text>
            </View>
            <Text className="text-xs text-text-secondary">Umbenennen</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} className="items-center">
            <View className="bg-surface rounded-full w-12 h-12 items-center justify-center shadow-sm mb-2">
              <Text className="text-2xl">🗑️</Text>
            </View>
            <Text className="text-xs text-text-secondary">Löschen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowRenameModal(false)}
        >
          <Pressable
            className="bg-surface rounded-t-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />

            <Text className="text-xl font-bold text-text-primary mb-4">
              Umbenennen
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name der Aufnahme"
              className="border border-border rounded-lg p-3 mb-4 text-base"
              autoFocus
              onSubmitEditing={handleRename}
            />

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                className="px-6 py-3"
              >
                <Text className="text-secondary font-semibold">Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRename}
                className="bg-primary rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold">Speichern</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
