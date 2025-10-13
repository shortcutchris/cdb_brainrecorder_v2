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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import RecordingItem from '../components/RecordingItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { recordings, loading, deleteRecording, updateRecording, refresh } =
    useRecordings();
  const { colors } = useTheme();

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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Empty State
  if (recordings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="mic-outline" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome!</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Starte deine erste{'\n'}Aufnahme
          </Text>
          <TouchableOpacity
            onPress={handleStartRecording}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mic" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* FAB for consistency (even in empty state) */}
        <TouchableOpacity
          onPress={handleStartRecording}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="mic" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // List View
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Metadata Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="folder-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          {recordings.length} {recordings.length === 1 ? 'Aufnahme' : 'Aufnahmen'}
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
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="mic" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
