import { Alert, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';
import { Recording } from '../types';

export type ShareAnchorRect = { x: number; y: number; width: number; height: number };

interface ShareRecordingOptions {
  anchorRect?: ShareAnchorRect;
  tempFilenamePrefix?: string;
}

export async function shareRecordingFile(
  recording: Recording,
  t: TFunction,
  options: ShareRecordingOptions = {}
) {
  console.log('[Share] Starting share process...');
  console.log('[Share] Recording URI:', recording.uri);

  const isAvailable = await Sharing.isAvailableAsync();
  console.log('[Share] Sharing available:', isAvailable);

  if (!isAvailable) {
    Alert.alert(
      t('common:recordingItem.sharingUnavailableTitle'),
      t('common:recordingItem.sharingUnavailableMessage')
    );
    return;
  }

  const sourceFile = new File(recording.uri);
  console.log('[Share] File exists:', sourceFile.exists);

  if (!sourceFile.exists) {
    Alert.alert(
      t('common:recordingItem.fileNotFoundTitle'),
      t('common:recordingItem.fileNotFoundMessage')
    );
    return;
  }

  const filename = `${options.tempFilenamePrefix ?? 'share'}-${Date.now()}.m4a`;
  const tempFile = new File(Paths.cache, filename);
  console.log('[Share] Copying to cache:', tempFile.uri);

  sourceFile.copy(tempFile);
  console.log('[Share] Temp file exists after copy:', tempFile.exists);

  const shareOptions: any = {
    UTI: 'com.apple.m4a-audio',
    mimeType: 'audio/m4a',
  };

  if (Platform.OS === 'ios' && Platform.isPad && options.anchorRect) {
    shareOptions.anchor = options.anchorRect;
    console.log('[Share] iPad detected - using anchor');
  }

  try {
    console.log('[Share] Opening share sheet with UTI and mimeType...');
    console.log('[Share] Options:', shareOptions);
    await Sharing.shareAsync(tempFile.uri, shareOptions);
    console.log('[Share] Share completed successfully');
  } finally {
    try {
      console.log('[Share] Cleaning up temp file...');
      tempFile.delete();
    } catch (cleanupError) {
      console.warn('[Share] Failed to delete temp file:', cleanupError);
    }
  }
}
