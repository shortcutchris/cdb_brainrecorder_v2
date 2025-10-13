import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { Recording } from '../types';
import { formatDate, formatDuration } from '../utils/audio';

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
      <View className="bg-surface rounded-xl p-4 mb-3 mx-4 shadow-sm">
        {/* Title */}
        <Text className="text-lg font-semibold text-text-primary mb-1">
          🎙️ {recording.name}
        </Text>

        {/* Metadata */}
        <Text className="text-sm text-text-secondary mb-3">
          {formatDate(recording.createdAt)} • {formatDuration(recording.duration)}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row justify-start space-x-3">
          <TouchableOpacity
            onPress={() => onPlay(recording.id)}
            className="bg-primary rounded-lg px-4 py-2"
          >
            <Text className="text-white font-semibold">▶️ Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setNewName(recording.name);
              setShowRenameModal(true);
            }}
            className="bg-secondary rounded-lg px-4 py-2"
          >
            <Text className="text-white font-semibold">✏️ Umbenennen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="bg-danger rounded-lg px-4 py-2"
          >
            <Text className="text-white font-semibold">🗑️ Löschen</Text>
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
    </>
  );
}
