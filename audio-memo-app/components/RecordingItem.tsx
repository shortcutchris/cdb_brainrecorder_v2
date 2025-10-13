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
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newName, setNewName] = useState(recording.name);
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      '⚠️ Aufnahme löschen?',
      `"${recording.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
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
            {/* Status Badge (Compact - right of title) */}
            {recording.transcript?.status === 'processing' && (
              <View style={[styles.statusBadgeCompact, { backgroundColor: colors.primary + '20' }]}>
                <ActivityIndicator size="small" color={colors.primary} style={styles.badgeSpinner} />
                <Text style={[styles.statusBadgeText, { color: colors.primary }]}>Trans.</Text>
              </View>
            )}
            {recording.summary?.status === 'processing' && (
              <View style={[styles.statusBadgeCompact, { backgroundColor: colors.success + '20' }]}>
                <ActivityIndicator size="small" color={colors.success} style={styles.badgeSpinner} />
                <Text style={[styles.statusBadgeText, { color: colors.success }]}>Zus.</Text>
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
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setNewName(recording.name);
              setShowRenameModal(true);
            }}
            style={[styles.renameButton, { backgroundColor: colors.textSecondary }]}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Umbenennen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Löschen</Text>
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
                    Transkription läuft...
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    Bitte warten
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
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>Transkript</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {recording.transcript?.status === 'completed'
                      ? 'Transkript anzeigen'
                      : 'Audio zu Text konvertieren'}
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
                    'Transkript benötigt',
                    recording.transcript?.status === 'processing'
                      ? 'Bitte warte, bis die Transkription abgeschlossen ist.'
                      : 'Bitte erstelle zuerst ein Transkript dieser Aufnahme.'
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
                  AI Zusammenfassung
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {recording.transcript?.status === 'completed'
                    ? 'Automatische Zusammenfassung'
                    : recording.transcript?.status === 'processing'
                    ? 'Warte auf Transkript...'
                    : 'Transkript benötigt'}
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
                    'Transkript benötigt',
                    recording.transcript?.status === 'processing'
                      ? 'Bitte warte, bis die Transkription abgeschlossen ist.'
                      : 'Bitte erstelle zuerst ein Transkript dieser Aufnahme.'
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
                  AI Custom Prompt
                </Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {recording.transcript?.status === 'completed'
                    ? 'Eigene Anweisungen ausführen'
                    : recording.transcript?.status === 'processing'
                    ? 'Warte auf Transkript...'
                    : 'Transkript benötigt'}
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
  statusBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  badgeSpinner: {
    transform: [{ scale: 0.7 }],
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
