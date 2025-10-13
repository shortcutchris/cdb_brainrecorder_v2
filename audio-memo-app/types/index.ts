/**
 * Transcript Status
 */
export type TranscriptStatus = 'pending' | 'processing' | 'completed' | 'error';

/**
 * Transcript Interface
 */
export interface Transcript {
  /** Transcribed text */
  text: string;
  /** Current status of transcription */
  status: TranscriptStatus;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * AI Result Status
 */
export type AiResultStatus = 'processing' | 'completed' | 'error';

/**
 * AI Result Interface
 * Represents result from AI operations (summary, custom prompt)
 */
export interface AiResult {
  /** AI-generated text */
  text: string;
  /** Current status of AI operation */
  status: AiResultStatus;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Error message if status is 'error' */
  error?: string;
  /** Original prompt (for custom prompts) */
  prompt?: string;
}

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
  /** Optional transcript */
  transcript?: Transcript;
  /** Optional AI-generated summary */
  summary?: AiResult;
  /** Array of custom prompt results */
  customPrompts?: AiResult[];
}

/**
 * Navigation types for React Navigation
 */
export type RootStackParamList = {
  Home: undefined;
  Player: { recordingId: string };
  Recording: undefined;
  Settings: undefined;
  Transcript: { recordingId: string };
  Summary: { recordingId: string };
  CustomPrompt: { recordingId: string };
};
