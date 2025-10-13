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
}

export default function RecordingItem({
  recording,
  onPlay,
  onDelete,
  onRename,
}: RecordingItemProps) {
  const [showRenameModal, setShowRenameModal] = useState(false);
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
        {/* Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="mic-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {recording.name}
          </Text>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
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
});
