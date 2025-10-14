import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
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

  // Auto-refresh when screen is focused and poll for updates
  useFocusEffect(
    React.useCallback(() => {
      // Initial refresh when screen is focused
      refresh(false);

      // Set up polling to check for status updates every 2 seconds
      const interval = setInterval(() => {
        refresh(false);
      }, 2000);

      // Cleanup: stop polling when screen loses focus
      return () => clearInterval(interval);
    }, [refresh])
  );

  const handlePlay = (recordingId: string) => {
    navigation.navigate('Player', { recordingId });
  };

  const handleTranscript = (recordingId: string) => {
    navigation.navigate('Transcript', { recordingId });
  };

  const handleSummary = (recordingId: string) => {
    navigation.navigate('Summary', { recordingId });
  };

  const handleCustomPrompt = (recordingId: string) => {
    navigation.navigate('CustomPrompt', { recordingId });
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
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            CDB BrainRecorder
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Nimm deine Gedanken auf und lass sie durch KI verarbeiten.{'\n\n'}
            Erstelle Transkripte, generiere Zusammenfassungen und stelle individuelle Fragen zu deinen Aufnahmen.
          </Text>
          <TouchableOpacity
            onPress={handleStartRecording}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startButtonText}>Erste Aufnahme starten</Text>
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
            onTranscript={handleTranscript}
            onSummary={handleSummary}
            onCustomPrompt={handleCustomPrompt}
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
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#ffaa3a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    shadowColor: '#ffaa3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
