import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
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
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Aufnahme nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎙️</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {recording.name}
        </Text>

        {/* Date */}
        <Text style={styles.date}>
          {formatDate(recording.createdAt)}
        </Text>

        {/* Seekbar */}
        <View style={styles.seekbarContainer}>
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
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatDuration(position)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Player Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={() => handleSkip(-15)}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playPauseButton}
          >
            <Text style={styles.playPauseButtonText}>{isPlaying ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSkip(15)}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={() => {
              setNewName(recording.name);
              setShowRenameModal(true);
            }}
            style={styles.actionButton}
          >
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionButtonIconText}>✏️</Text>
            </View>
            <Text style={styles.actionButtonLabel}>Umbenennen</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionButtonIconText}>🗑️</Text>
            </View>
            <Text style={styles.actionButtonLabel}>Löschen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRenameModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Umbenennen</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name der Aufnahme"
              style={styles.textInput}
              autoFocus
              onSubmitEditing={handleRename}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRename}
                style={styles.saveButton}
              >
                <Text style={styles.buttonText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: '#64748B',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 64,
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 48,
  },
  seekbarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    color: '#64748B',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 48,
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  skipButtonText: {
    fontSize: 24,
  },
  playPauseButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playPauseButtonText: {
    fontSize: 36,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
  },
  actionButtonIconText: {
    fontSize: 24,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
