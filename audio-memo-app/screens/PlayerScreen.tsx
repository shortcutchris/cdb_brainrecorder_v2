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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, formatDuration } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ route, navigation }: Props) {
  const { recordingId } = route.params;
  const { getRecording, deleteRecording, updateRecording } = useRecordings();
  const { colors } = useTheme();
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
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Aufnahme nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mic-outline" size={64} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {recording.name}
        </Text>

        {/* Date */}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
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
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatDuration(position)}</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Player Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={() => handleSkip(-15)}
            style={[styles.skipButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="play-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.playPauseButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSkip(15)}
            style={[styles.skipButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="play-forward" size={24} color={colors.textSecondary} />
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
            <View style={[styles.actionButtonIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="create-outline" size={24} color={colors.textSecondary} />
            </View>
            <Text style={[styles.actionButtonLabel, { color: colors.textSecondary }]}>Umbenennen</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
            </View>
            <Text style={[styles.actionButtonLabel, { color: colors.textSecondary }]}>Löschen</Text>
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
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Umbenennen</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name der Aufnahme"
              placeholderTextColor={colors.textSecondary}
              style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              autoFocus
              onSubmitEditing={handleRename}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Abbrechen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRename}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
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
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    // Color applied inline
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
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
    // Color applied inline
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 48,
  },
  skipButton: {
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
  playPauseButton: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
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
  actionButtonLabel: {
    fontSize: 12,
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
  textInput: {
    borderWidth: 1,
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
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
