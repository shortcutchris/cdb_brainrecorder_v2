import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Recording } from '../types';
import { formatDate, formatDuration } from '../utils/audio';
import { useTheme } from '../contexts/ThemeContext';

interface RecordingItemProps {
  recording: Recording;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onTranscript: (id: string) => void;
  onSummary: (id: string) => void;
  onCustomPrompt: (id: string) => void;
}

export default function RecordingItem({
  recording,
  onPlay,
  onDelete,
  onRename,
  onTranscript,
  onSummary,
  onCustomPrompt,
}: RecordingItemProps) {
  const { t } = useTranslation();
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newName, setNewName] = useState(recording.name);
  const [showCompletedBadge, setShowCompletedBadge] = useState<{
    transcript: boolean;
    summary: boolean;
  }>({ transcript: false, summary: false });
  const { colors } = useTheme();
  const prevStatusRef = React.useRef({
    transcript: recording.transcript?.status,
    summary: recording.summary?.status,
  });
  // Detect status changes and show completed badge
  React.useEffect(() => {
    const prevTranscript = prevStatusRef.current.transcript;
    const currentTranscript = recording.transcript?.status;

    if (prevTranscript === 'processing' && currentTranscript === 'completed') {
      setShowCompletedBadge(prev => ({ ...prev, transcript: true }));
      setTimeout(() => {
        setShowCompletedBadge(prev => ({ ...prev, transcript: false }));
      }, 3000);
    }

    const prevSummary = prevStatusRef.current.summary;
    const currentSummary = recording.summary?.status;

    if (prevSummary === 'processing' && currentSummary === 'completed') {
      setShowCompletedBadge(prev => ({ ...prev, summary: true }));
      setTimeout(() => {
        setShowCompletedBadge(prev => ({ ...prev, summary: false }));
      }, 3000);
    }

    prevStatusRef.current = {
      transcript: currentTranscript,
      summary: currentSummary,
    };
  }, [recording.transcript?.status, recording.summary?.status]);

  const handleDelete = () => {
    Alert.alert(
      t('common:recordingItem.deleteConfirm'),
      t('common:recordingItem.deleteMessage', { name: recording.name }),
      [
        {
          text: t('common:buttons.cancel'),
          style: 'cancel',
        },
        {
          text: t('common:recordingItem.delete'),
          style: 'destructive',
          onPress: () => onDelete(recording.id),
        },
      ]
    );
  };

  const handleRename = () => {
    if (newName.trim() && newName !== recording.name) {
      onRename(recording.id, newName.trim());
    }
    setShowRenameModal(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Title Row with Menu */}
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Ionicons name="mic-outline" size={20} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {recording.name}
            </Text>
            {/* Status Badges (Icon-Only - right of title) */}
            {recording.transcript?.status === 'processing' && (
              <View style={[styles.statusBadgeIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="document-text" size={16} color={colors.primary} />
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.badgeSpinnerOverlay}
                />
              </View>
            )}
            {showCompletedBadge.transcript && (
              <View style={[styles.statusBadgeIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="document-text" size={16} color={colors.success} />
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={colors.success}
                  style={styles.badgeCheckmarkOverlay}
                />
              </View>
            )}
            {recording.summary?.status === 'processing' && (
              <View style={[styles.statusBadgeIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.badgeSpinnerOverlay}
                />
              </View>
            )}
            {showCompletedBadge.summary && (
              <View style={[styles.statusBadgeIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="sparkles" size={16} color={colors.success} />
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={colors.success}
                  style={styles.badgeCheckmarkOverlay}
                />
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowMenuModal(true)}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Metadata */}
        <Text style={[styles.metadata, { color: colors.textSecondary }]}>
          {formatDate(recording.createdAt)} • {formatDuration(recording.duration)}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => onPlay(recording.id)}
            style={[styles.playButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('common:recordingItem.play')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setNewName(recording.name);
              setShowRenameModal(true);
            }}
            style={[styles.renameButton, { backgroundColor: colors.textSecondary }]}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('common:recordingItem.rename')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('common:recordingItem.delete')}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('common:recordingItem.renameTitle')}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder={t('common:recordingItem.renamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
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
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('common:buttons.cancel')}</Text>
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

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenuModal(false)}
        >
          <Pressable
            style={[styles.menuModalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Transkript Button - Always visible */}
            {recording.transcript?.status === 'processing' ? (
              <View style={[styles.menuItem, { opacity: 0.6 }]}>
                <Ionicons name="hourglass-outline" size={24} color={colors.textSecondary} />
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemTitle, { color: colors.textSecondary }]}>
                    {t('common:recordingItem.transcriptProcessing')}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {t('common:recordingItem.pleaseWait')}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setShowMenuModal(false);
                  onTranscript(recording.id);
                }}
                style={styles.menuItem}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={recording.transcript?.status === 'completed' ? colors.success : colors.primary}
                />
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>{t('common:recordingItem.transcript')}</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {recording.transcript?.status === 'completed'
                      ? t('common:recordingItem.viewTranscript')
                      : t('common:recordingItem.convertAudioToText')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            {/* AI Zusammenfassung - Always visible, disabled if no transcript */}
            <TouchableOpacity
              onPress={() => {
                if (recording.transcript?.status === 'completed') {
                  setShowMenuModal(false);
                  onSummary(recording.id);
                } else {
                  Alert.alert(
                    t('common:recordingItem.transcriptNeededTitle'),
                    recording.transcript?.status === 'processing'
                      ? t('common:recordingItem.waitForTranscription')
                      : t('common:recordingItem.createTranscriptFirst')
                  );
                }
              }}
              style={[styles.menuItem, recording.transcript?.status !== 'completed' && { opacity: 0.5 }]}
            >
              <Ionicons
                name="sparkles-outline"
                size={24}
                color={recording.transcript?.status === 'completed' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.menuItemTextContainer}>
                <Text style={[
                  styles.menuItemTitle,
                  { color: recording.transcript?.status === 'completed' ? colors.text : colors.textSecondary }
                ]}>
                  {t('common:recordingItem.aiSummary')}
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {recording.transcript?.status === 'completed'
                    ? t('common:recordingItem.automaticSummary')
                    : recording.transcript?.status === 'processing'
                    ? t('common:recordingItem.waitingForTranscript')
                    : t('common:recordingItem.transcriptRequired')}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            {/* AI Custom Prompt - Always visible, disabled if no transcript */}
            <TouchableOpacity
              onPress={() => {
                if (recording.transcript?.status === 'completed') {
                  setShowMenuModal(false);
                  onCustomPrompt(recording.id);
                } else {
                  Alert.alert(
                    t('common:recordingItem.transcriptNeededTitle'),
                    recording.transcript?.status === 'processing'
                      ? t('common:recordingItem.waitForTranscription')
                      : t('common:recordingItem.createTranscriptFirst')
                  );
                }
              }}
              style={[styles.menuItem, recording.transcript?.status !== 'completed' && { opacity: 0.5 }]}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={24}
                color={recording.transcript?.status === 'completed' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.menuItemTextContainer}>
                <Text style={[
                  styles.menuItemTitle,
                  { color: recording.transcript?.status === 'completed' ? colors.text : colors.textSecondary }
                ]}>
                  {t('common:recordingItem.aiCustomPrompt')}
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {recording.transcript?.status === 'completed'
                    ? t('common:recordingItem.executeCustomInstructions')
                    : recording.transcript?.status === 'processing'
                    ? t('common:recordingItem.waitingForTranscript')
                    : t('common:recordingItem.transcriptRequired')}
                </Text>
              </View>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  metadata: {
    fontSize: 14,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  renameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  inputContainer: {
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
  menuModalContent: {
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  statusBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeSpinnerOverlay: {
    position: 'absolute',
    right: -2,
    top: -2,
    transform: [{ scale: 0.6 }],
  },
  badgeCheckmarkOverlay: {
    position: 'absolute',
    right: -1,
    top: -1,
  },
});
