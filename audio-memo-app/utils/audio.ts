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
    console.log('🎤 startRecording: Requesting permission...');

    // Request permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.error('❌ startRecording: Permission denied by user');
      throw new Error('Microphone permission not granted');
    }

    console.log('✅ startRecording: Permission granted');

    console.log('⚙️ startRecording: Configuring audio mode...');
    // Configure audio mode for background recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true, // Keep recording active when app goes to background
      shouldDuckAndroid: false,
    });

    console.log('✅ startRecording: Audio mode configured');

    console.log('🎙️ startRecording: Creating recording...');
    // Start recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    console.log('✅ startRecording: Recording created successfully');
    return recording;
  } catch (error) {
    console.error('❌ startRecording ERROR:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Stop recording and save to file system
 */
export async function stopRecording(
  recording: Audio.Recording,
  locale: string = 'de-DE',
  label: string = 'Aufnahme'
): Promise<Recording | null> {
  try {
    console.log('🔴 stopRecording called at:', new Date().toISOString());

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false, // Disable background mode when recording stops
    });

    const uri = recording.getURI();
    if (!uri) {
      throw new Error('Recording URI is null');
    }

    // Get recording duration
    const status = await recording.getStatusAsync();
    const duration = status.isLoaded ? status.durationMillis / 1000 : 0;

    console.log('📊 Recording duration:', duration, 'seconds');

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
      name: formatDefaultName(locale, label),
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
function formatDefaultName(locale: string, label: string): string {
  const now = new Date();
  const date = now.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${label} ${date} ${time}`;
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
