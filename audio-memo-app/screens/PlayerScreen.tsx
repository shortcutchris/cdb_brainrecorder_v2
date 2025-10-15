import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, formatDuration } from '../utils/audio';
import { shareRecordingFile, ShareAnchorRect } from '../utils/shareRecording';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ route, navigation }: Props) {
  const { recordingId } = route.params;
  const { getRecording, deleteRecording, updateRecording } = useRecordings();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const recording = getRecording(recordingId);
  const shareButtonRef = useRef<TouchableOpacity | null>(null);

  // expo-audio Hooks
  const player = useAudioPlayer(recording ? { uri: recording.uri } : null);
  const status = useAudioPlayerStatus(player);

  // Derived state from player status
  const isPlaying = status.playing;
  const position = Math.floor(status.currentTime);
  const duration = Math.floor(status.duration);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(recording?.name || '');

  // No useEffect needed - expo-audio Hooks handle loading and status automatically!

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (value: number) => {
    player.seekTo(value);
  };

  const handleSkip = (seconds: number) => {
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    player.seekTo(newPosition);
  };

  const handleDelete = () => {
    Alert.alert(
      t('player.deleteConfirm'),
      `"${recording?.name}" ${t('player.deleteMessage')}`,
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('player.delete'),
          style: 'destructive',
          onPress: async () => {
            // Player cleanup is automatic with expo-audio Hooks
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

  const measureShareAnchorRect = React.useCallback(async (): Promise<ShareAnchorRect | undefined> => {
    if (!shareButtonRef.current) {
      return undefined;
    }

    return new Promise(resolve => {
      const node: any = shareButtonRef.current;
      if (typeof node?.measureInWindow !== 'function') {
        resolve(undefined);
        return;
      }
      node.measureInWindow((x: number, y: number, width: number, height: number) => {
        resolve({ x, y, width, height });
      });
    });
  }, []);

  const handleShare = async () => {
    if (!recording) {
      return;
    }

    try {
      const anchorRect =
        Platform.OS === 'ios' && Platform.isPad ? await measureShareAnchorRect() : undefined;

      await shareRecordingFile(recording, t, {
        anchorRect,
        tempFilenamePrefix: 'player-share',
      });
    } catch (error) {
      console.error('[Share][Player] Error sharing recording:', error);
      Alert.alert(
        t('common:recordingItem.shareErrorTitle'),
        t('common:recordingItem.shareErrorMessage')
      );
    }
  };

  if (!recording) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
          {t('player.notFound')}
        </Text>
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
          <TouchableOpacity onPress={handleShare} style={styles.actionButton} ref={shareButtonRef}>
            <View style={[styles.actionButtonIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionButtonLabel, { color: colors.textSecondary }]}>
              {t('common:recordingItem.share')}
            </Text>
          </TouchableOpacity>

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
            <Text style={[styles.actionButtonLabel, { color: colors.textSecondary }]}>
              {t('player.rename')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
            </View>
            <Text style={[styles.actionButtonLabel, { color: colors.textSecondary }]}>
              {t('player.delete')}
            </Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('player.renameTitle')}
            </Text>

            <View style={styles.textInputContainer}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder={t('player.renamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                autoFocus
                onSubmitEditing={handleRename}
              />
              {newName.length > 0 && (
                <TouchableOpacity
                  onPress={() => setNewName('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  {t('common:buttons.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRename}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.buttonText}>{t('common:buttons.save')}</Text>
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
  textInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
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
