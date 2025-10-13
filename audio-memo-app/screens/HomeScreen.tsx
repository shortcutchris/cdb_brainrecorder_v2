import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useRecordings } from '../hooks/useRecordings';
import RecordingItem from '../components/RecordingItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { recordings, loading, deleteRecording, updateRecording } =
    useRecordings();

  const handlePlay = (recordingId: string) => {
    navigation.navigate('Player', { recordingId });
  };

  const handleStartRecording = () => {
    navigation.navigate('Recording');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Empty State
  if (recordings.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-6">🎙️</Text>
          <Text className="text-3xl font-bold text-text-primary mb-3 text-center">
            Welcome!
          </Text>
          <Text className="text-lg text-text-secondary mb-8 text-center">
            Starte deine erste{'\n'}Aufnahme
          </Text>
          <TouchableOpacity
            onPress={handleStartRecording}
            className="bg-primary rounded-xl px-8 py-4 shadow-lg"
          >
            <Text className="text-white text-lg font-semibold">🎤 Start</Text>
          </TouchableOpacity>
        </View>

        {/* FAB for consistency (even in empty state) */}
        <TouchableOpacity
          onPress={handleStartRecording}
          className="absolute bottom-6 right-6 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-lg"
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text className="text-3xl">🎤</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // List View
  return (
    <View className="flex-1 bg-background">
      {/* Metadata Header */}
      <View className="px-4 py-3 bg-surface border-b border-border">
        <Text className="text-sm text-text-secondary">
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
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleStartRecording}
        className="absolute bottom-6 right-6 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-lg"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-3xl">🎤</Text>
      </TouchableOpacity>
    </View>
  );
}
