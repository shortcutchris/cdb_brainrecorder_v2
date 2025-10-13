import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import RecordingItem from '../components/RecordingItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { recordings, loading, deleteRecording, updateRecording, refresh } =
    useRecordings();

  // Reload recordings when returning from Recording screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh without showing loading state to avoid flickering
      refresh(false);
    });

    return unsubscribe;
  }, [navigation, refresh]);

  const handlePlay = (recordingId: string) => {
    navigation.navigate('Player', { recordingId });
  };

  const handleStartRecording = () => {
    navigation.navigate('Recording');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Empty State
  if (recordings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emojiLarge}>🎙️</Text>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>
            Starte deine erste{'\n'}Aufnahme
          </Text>
          <TouchableOpacity
            onPress={handleStartRecording}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>🎤 Start</Text>
          </TouchableOpacity>
        </View>

        {/* FAB for consistency (even in empty state) */}
        <TouchableOpacity
          onPress={handleStartRecording}
          style={styles.fab}
        >
          <Text style={styles.fabIcon}>🎤</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // List View
  return (
    <View style={styles.container}>
      {/* Metadata Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          📂 {recordings.length} {recordings.length === 1 ? 'Aufnahme' : 'Aufnahmen'}
        </Text>
      </View>

      {/* Recordings List */}
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordingItem
            recording={item}
            onPlay={handlePlay}
            onDelete={deleteRecording}
            onRename={updateRecording}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleStartRecording}
        style={styles.fab}
      >
        <Text style={styles.fabIcon}>🎤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiLarge: {
    fontSize: 60,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerText: {
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
  },
});
