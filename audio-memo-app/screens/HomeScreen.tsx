import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import { useTheme } from '../contexts/ThemeContext';
import RecordingItem from '../components/RecordingItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { recordings, loading, deleteRecording, updateRecording, refresh } =
    useRecordings();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recordings based on search query
  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) {
      return recordings;
    }

    const query = searchQuery.toLowerCase().trim();
    return recordings.filter((recording) => {
      // Search in recording name
      const nameMatch = recording.name.toLowerCase().includes(query);

      // Search in transcript text (if exists and completed)
      const transcriptMatch =
        recording.transcript?.status === 'completed' &&
        recording.transcript.text?.toLowerCase().includes(query);

      return nameMatch || transcriptMatch;
    });
  }, [recordings, searchQuery]);

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

  const handleStartRecording = async () => {
    try {
      // Check and request microphone permission BEFORE navigating
      const { status } = await Audio.requestPermissionsAsync();

      if (status === 'granted') {
        // Permission granted, navigate to recording screen
        navigation.navigate('Recording');
      } else {
        // Permission denied, show alert
        Alert.alert(
          t('recording.errorTitle'),
          t('recording.microphonePermissionDenied')
        );
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.microphonePermissionDenied')
      );
    }
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
            {t('home.emptyTitle')}
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            {t('home.emptyDescription')}
          </Text>
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
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('home.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.searchClearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Metadata Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="folder-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          {searchQuery.trim()
            ? `${filteredRecordings.length} ${t('home.searchResults')}`
            : t('home.recordingsCount', { count: recordings.length })}
        </Text>
      </View>

      {/* Recordings List */}
      <FlatList
        data={filteredRecordings}
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchClearButton: {
    marginLeft: 12,
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
