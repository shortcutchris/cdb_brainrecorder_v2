# AI-Erweiterungen

## Vorlagen für Zusammenfassungen
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
Verschiedene Vorlagen für unterschiedliche Anwendungsfälle:
- **Meeting-Protokoll:** Teilnehmer, Agenda, Diskussionspunkte, Action Items, Nächste Schritte
- **Blog-Post-Entwurf:** Titel, Einleitung, Hauptteil, Fazit
- **Social Media Post:** Kurz, prägnant, mit Hashtags
- **Bullet Points vs. Fließtext:** Format-Optionen
- **Email-Format:** Formell formatiert mit Betreff und Gruß

### Technische Umsetzung
- Template-System mit vordefiniertem System-Prompts
- Template-Auswahl im SummaryScreen
- Speicherung bevorzugter Templates im Settings
- Eigene Templates erstellen und speichern

### User Stories
- Als User möchte ich Meeting-Protokolle automatisch erstellen
- Als User möchte ich aus meinen Aufnahmen Social-Media-Content generieren
- Als User möchte ich zwischen verschiedenen Ausgabeformaten wählen

---

## Smart Prompts / Custom Prompts Library
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
Vordefinierte intelligente Prompts für häufige Anwendungsfälle:
- "Action Items extrahieren"
- "Wichtigste Punkte zusammenfassen (3-5 Punkte)"
- "Als professionelle E-Mail formatieren"
- "Fragen aus dem Gespräch extrahieren"
- "Entscheidungen und Beschlüsse auflisten"
- "Timeline erstellen"
- "Risiken und Chancen identifizieren"

Zusätzlich: Eigene Prompts als Vorlagen speichern

### Technische Umsetzung
- Neue Datenstruktur: `PromptTemplate` mit `id`, `name`, `prompt`, `isSystem`
- System-Prompts sind read-only
- User kann eigene Prompts erstellen, bearbeiten, löschen
- Prompt-Verwaltung in Settings
- Dropdown/Auswahl in CustomPromptScreen
- Quick-Access zu häufig genutzten Prompts

### Datenmodell
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  category?: string;
  isSystem: boolean;
  isFavorite?: boolean;
  usageCount?: number;
  createdAt: number;
}
```

### System-Prompts (Beispiele)
```
1. Action Items extrahieren
   "Liste alle Action Items, Aufgaben und To-Dos aus dieser Aufnahme auf.
    Format: - [Aufgabe] (Verantwortlich: [Person], Deadline: [Datum falls erwähnt])"

2. Meeting-Protokoll
   "Erstelle ein professionelles Meeting-Protokoll mit folgenden Abschnitten:
    - Teilnehmer
    - Besprochene Themen
    - Wichtigste Diskussionspunkte
    - Getroffene Entscheidungen
    - Action Items
    - Nächste Schritte"

3. Zusammenfassung (3-5 Punkte)
   "Fasse die wichtigsten Punkte dieser Aufnahme in 3-5 prägnanten Bullet Points zusammen."

4. Email verfassen
   "Formuliere den Inhalt dieser Aufnahme als professionelle E-Mail mit Betreff,
    Anrede, strukturiertem Hauptteil und passender Grußformel."

5. Fragen extrahieren
   "Liste alle Fragen auf, die in dieser Aufnahme gestellt wurden.
    Markiere, ob sie beantwortet wurden oder noch offen sind."
```

### UI/UX
- Settings → "Custom Prompts"
  - Liste aller Prompts (System + User)
  - System-Prompts mit Lock-Icon
  - Add-Button für neue Prompts
  - Edit/Delete für User-Prompts
  - Favorite-Toggle

- CustomPromptScreen:
  - Prompt-Dropdown über dem Textfeld
  - "Prompt auswählen" Button
  - Selected Prompt wird ins Textfeld geladen
  - User kann Prompt noch anpassen vor Ausführung

### User Stories
- Als User möchte ich häufig genutzte Prompts nicht immer neu tippen
- Als User möchte ich aus vorgefertigten System-Prompts wählen
- Als User möchte ich eigene Prompt-Vorlagen erstellen und verwalten
- Als User möchte ich meine meist-genutzten Prompts favorisieren

---

## Auto-Titel-Generierung
**Priorität:** Mittel
**Aufwand:** Niedrig

### Beschreibung
- AI generiert automatisch sinnvollen Titel aus Transkript
- Ersetzt "Aufnahme 1", "Aufnahme 2" etc.
- Kann in Settings aktiviert/deaktiviert werden

### Technische Umsetzung
- Nach erfolgreicher Transkription: Kurzer AI-Call für Titel-Generierung
- Prompt: "Generiere einen kurzen, prägnanten Titel (max 5 Wörter) für diese Aufnahme"
- Async Update des Recording-Names
- Optional: User-Confirmation vor Auto-Rename

### User Stories
- Als User möchte ich aussagekräftige Titel ohne manuelles Umbenennen
- Als User möchte ich auf einen Blick erkennen, worum es in der Aufnahme geht

---

## Sentiment-Analyse
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Analyse der Stimmung/Ton der Aufnahme
- Kategorien: Positiv, Neutral, Negativ
- Emotionen: Aufgeregt, Frustriert, Entspannt, etc.
- Visualisierung als Emoji oder Badge

### Technische Umsetzung
- Analyse über OpenAI API nach Transkription
- Speicherung in `recording.sentiment`
- Anzeige als Badge in RecordingCard
- Optional: Sentiment-Filter

### User Stories
- Als User möchte ich die emotionale Stimmung meiner Aufnahmen tracken
- Als User möchte ich frustrierende vs. positive Meetings identifizieren

---

## Multi-Language Transkription
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Automatische Spracherkennung
- Unterstützung für mehrere Sprachen gleichzeitig (Code-Switching)
- Anzeige der erkannten Sprache

### Technische Umsetzung
- Whisper API unterstützt bereits Multi-Language
- Sprach-Parameter kann auf "auto" gesetzt werden
- Metadata über erkannte Sprache speichern

### User Stories
- Als mehrsprachiger User möchte ich Aufnahmen in verschiedenen Sprachen transkribieren
- Als User möchte ich sehen, welche Sprache(n) erkannt wurden
