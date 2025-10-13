import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Recording } from '../types';

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
}

/**
 * Start audio recording with high quality settings
 */
export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    // Request permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Start recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
}

/**
 * Stop recording and save to file system
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<Recording | null> {
  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    if (!uri) {
      throw new Error('Recording URI is null');
    }

    // Get recording duration
    const status = await recording.getStatusAsync();
    const duration = status.isLoaded ? status.durationMillis / 1000 : 0;

    // Generate unique ID and filename
    const id = Date.now().toString();
    const filename = `recording-${id}.m4a`;
    const newUri = `${FileSystem.documentDirectory}${filename}`;

    // Copy file to permanent location
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    // Create recording metadata
    const newRecording: Recording = {
      id,
      uri: newUri, // Use permanent URI
      name: formatDefaultName(),
      createdAt: new Date().toISOString(),
      duration: Math.round(duration),
    };

    return newRecording;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
}

/**
 * Format default name with timestamp
 */
function formatDefaultName(): string {
  const now = new Date();
  const date = now.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });
  const time = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Aufnahme ${date} ${time}`;
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable string
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
