import { OPENAI_API_KEY } from '../config/env';
import type { Language } from '../contexts/SettingsContext';

/**
 * AI Service
 * Uses OpenAI GPT API to process transcribed text
 */

const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // Cost-effective model for text processing

// Language name mapping for prompts
const LANGUAGE_NAMES: Record<Language, string> = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  pl: 'Polish',
  pt: 'Portuguese',
  ja: 'Japanese',
};

export interface AiServiceResult {
  text: string;
}

/**
 * Generate a summary of the transcribed text
 * @param transcriptText The transcribed text to summarize
 * @param language Target language for the summary (default: 'de')
 * @returns Summary text
 * @throws Error if API call fails
 */
export async function generateSummary(
  transcriptText: string,
  language: Language = 'de'
): Promise<AiServiceResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API Key nicht konfiguriert.');
  }

  if (!transcriptText || transcriptText.trim().length === 0) {
    throw new Error('Kein Transkript-Text vorhanden.');
  }

  const languageName = LANGUAGE_NAMES[language];

  try {
    const systemPrompt = `You are a helpful assistant that creates summaries of audio transcripts.
Create a concise, structured summary of the following transcript.
Use bullet points (•) for better readability.
Focus on main points and important details.
IMPORTANT: Respond in ${languageName}.`;

    const userPrompt = `Create a summary of this transcript:\n\n${transcriptText}`;

    const response = await fetch(OPENAI_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API Fehler: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || '';

    if (!summary) {
      throw new Error('Keine Zusammenfassung generiert.');
    }

    return { text: summary };
  } catch (error: any) {
    console.error('Summary generation error:', error);

    if (error.message?.includes('API Key')) {
      throw new Error('OpenAI API Key ungültig oder nicht gesetzt');
    }

    if (error.message?.includes('network')) {
      throw new Error(
        'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.'
      );
    }

    throw new Error(
      error.message || 'Zusammenfassung fehlgeschlagen. Bitte versuche es erneut.'
    );
  }
}

/**
 * Execute a custom prompt on the transcribed text
 * @param transcriptText The transcribed text
 * @param customPrompt User's custom prompt/instruction
 * @param language Target language for the response (default: 'de')
 * @returns AI response
 * @throws Error if API call fails
 */
export async function executeCustomPrompt(
  transcriptText: string,
  customPrompt: string,
  language: Language = 'de'
): Promise<AiServiceResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API Key nicht konfiguriert.');
  }

  if (!transcriptText || transcriptText.trim().length === 0) {
    throw new Error('Kein Transkript-Text vorhanden.');
  }

  if (!customPrompt || customPrompt.trim().length === 0) {
    throw new Error('Kein Prompt eingegeben.');
  }

  const languageName = LANGUAGE_NAMES[language];

  try {
    const systemPrompt = `You are a helpful assistant that analyzes and processes audio transcripts.
Execute the user's instructions precisely.
Structure the output clearly and professionally.
IMPORTANT: Respond in ${languageName}.`;

    const userPrompt = `Transcript:\n${transcriptText}\n\nInstruction: ${customPrompt}`;

    const response = await fetch(OPENAI_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API Fehler: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || '';

    if (!aiResponse) {
      throw new Error('Keine Antwort vom AI-Service erhalten.');
    }

    return { text: aiResponse };
  } catch (error: any) {
    console.error('Custom prompt execution error:', error);

    if (error.message?.includes('API Key')) {
      throw new Error('OpenAI API Key ungültig oder nicht gesetzt');
    }

    if (error.message?.includes('network')) {
      throw new Error(
        'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.'
      );
    }

    throw new Error(
      error.message || 'AI-Anfrage fehlgeschlagen. Bitte versuche es erneut.'
    );
  }
}

/**
 * Check if the AI service is properly configured
 */
export function isAiServiceConfigured(): boolean {
  return Boolean(OPENAI_API_KEY);
}
