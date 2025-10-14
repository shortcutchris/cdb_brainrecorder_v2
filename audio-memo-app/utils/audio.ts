/**
 * Audio utility functions
 *
 * Note: Recording and playback logic has been moved to expo-audio Hooks
 * in RecordingScreen.tsx and PlayerScreen.tsx respectively.
 * This file now contains only shared helper functions.
 */

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
