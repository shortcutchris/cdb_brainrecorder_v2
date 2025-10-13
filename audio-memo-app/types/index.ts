/**
 * Audio Recording Interface
 * Represents a single audio recording with metadata
 */
export interface Recording {
  /** Unique identifier (timestamp) */
  id: string;
  /** File URI in local file system */
  uri: string;
  /** User-defined name */
  name: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Duration in seconds */
  duration: number;
}

/**
 * Navigation types for React Navigation
 */
export type RootStackParamList = {
  Home: undefined;
  Player: { recordingId: string };
  Recording: undefined;
};
