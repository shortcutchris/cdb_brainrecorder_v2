import { OPENAI_API_KEY } from '../config/env';

/**
 * AI Service
 * Uses OpenAI GPT API to process transcribed text
 */

const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // Cost-effective model for text processing

export interface AiServiceResult {
  text: string;
}

/**
 * Generate a summary of the transcribed text
 * @param transcriptText The transcribed text to summarize
 * @returns Summary text
 * @throws Error if API call fails
 */
export async function generateSummary(
  transcriptText: string
): Promise<AiServiceResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API Key nicht konfiguriert.');
  }

  if (!transcriptText || transcriptText.trim().length === 0) {
    throw new Error('Kein Transkript-Text vorhanden.');
  }

  try {
    const systemPrompt = `Du bist ein hilfreicher Assistent, der Zusammenfassungen von Audio-Transkripten erstellt.
Erstelle eine prägnante, strukturierte Zusammenfassung des folgenden Transkripts.
Verwende Stichpunkte (•) für bessere Lesbarkeit.
Konzentriere dich auf die Hauptpunkte und wichtige Details.`;

    const userPrompt = `Erstelle eine Zusammenfassung dieses Transkripts:\n\n${transcriptText}`;

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
 * @returns AI response
 * @throws Error if API call fails
 */
export async function executeCustomPrompt(
  transcriptText: string,
  customPrompt: string
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

  try {
    const systemPrompt = `Du bist ein hilfreicher Assistent, der Audio-Transkripte analysiert und bearbeitet.
Führe die Anweisungen des Benutzers präzise aus.
Antworte auf Deutsch und strukturiere die Ausgabe übersichtlich.`;

    const userPrompt = `Transkript:\n${transcriptText}\n\nAnweisung: ${customPrompt}`;

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
