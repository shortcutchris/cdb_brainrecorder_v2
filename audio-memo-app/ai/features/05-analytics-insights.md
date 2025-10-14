# Analytics & Insights

## Statistiken & Dashboard
**Priorität:** Mittel
**Aufwand:** Mittel

### Beschreibung
Umfassendes Dashboard mit Nutzungsstatistiken:
- **Gesamt-Übersicht:**
  - Anzahl Aufnahmen
  - Gesamtdauer aller Aufnahmen
  - Transkribierte Minuten
  - AI-Analysen durchgeführt

- **Zeitliche Analyse:**
  - Aufnahmen pro Tag/Woche/Monat
  - Durchschnittliche Aufnahmelänge
  - Peak-Zeiten (wann wird am meisten aufgenommen)
  - Aktivitäts-Heatmap (Kalender-View)

- **Content-Analyse:**
  - Häufigste Wörter/Themen (Word Cloud)
  - Top-verwendete Tags
  - Meist-genutzte Custom Prompts
  - Sprachen-Verteilung

- **AI-Kosten-Tracking:**
  - Geschätzte API-Kosten
  - Tokens verbraucht
  - Kosten pro Aufnahme
  - Monatliche Ausgaben-Prognose

### Technische Umsetzung
- Neuer "Statistik"-Screen (erreichbar über Settings)
- Chart-Library: react-native-chart-kit oder Victory Native
- Aggregations-Funktionen für Statistiken
- Persistent Storage für historische Daten
- Export als CSV/PDF

### Dashboard-Design
```
┌────────────────────────────────────┐
│ 📊 Deine Statistiken               │
├────────────────────────────────────┤
│ Übersicht                          │
│ • 45 Aufnahmen                     │
│ • 3h 24min Gesamt                  │
│ • 32 Transkripte                   │
│ • 18 AI-Analysen                   │
├────────────────────────────────────┤
│ Diese Woche                        │
│ [Bar-Chart: Aufnahmen pro Tag]    │
├────────────────────────────────────┤
│ Top Themen                         │
│ [Word Cloud]                       │
├────────────────────────────────────┤
│ Geschätzte Kosten                  │
│ • Diesen Monat: $3.45              │
│ • Letzte 3 Monate: $9.20           │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich sehen, wie viel ich die App nutze
- Als User möchte ich meine häufigsten Themen erkennen
- Als User möchte ich meine AI-Kosten im Blick behalten
- Als User möchte ich Trends in meiner Nutzung erkennen

---

## Transkript-Qualität & Confidence Score
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Whisper API liefert Confidence Score für Transkripte
- Anzeige der Transkript-Qualität
- Unsichere Wörter visuell hervorheben
- Option: Manuelle Korrektur vorschlagen

### Technische Umsetzung
- Whisper response enthält word-level confidence
- Speicherung von confidence-metadata
- Highlighting von low-confidence Wörtern (< 0.8)
- Color-Coding: Grün (> 0.9), Gelb (0.7-0.9), Rot (< 0.7)

### UI-Beispiel
```
Transkript (Qualität: 94%)
─────────────────────────
Das Meeting war sehr
produktiv und wir haben
einige wichtige ?Entschei-
dungen? getroffen.

Legende:
● Hohe Konfidenz
● Mittlere Konfidenz
● Niedrige Konfidenz
```

### User Stories
- Als User möchte ich wissen, wie zuverlässig das Transkript ist
- Als User möchte ich unsichere Stellen im Transkript sehen
- Als User möchte ich unsichere Wörter manuell korrigieren können

---

## Usage Insights & Recommendations
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
Intelligente Vorschläge basierend auf Nutzungsverhalten:
- "Du nutzt oft 'Meeting'-Tag → Erstelle eine Meeting-Vorlage?"
- "Deine Aufnahmen sind durchschnittlich 15 Min → Aktiviere Auto-Transkription?"
- "Du verwendest oft den gleichen Prompt → Speichere als Vorlage?"
- "Du hast 20+ Aufnahmen → Aktiviere Auto-Backup?"

### Technische Umsetzung
- Pattern-Detection im User-Verhalten
- Rule-based Recommendations
- Dismissable Suggestions
- In-App-Notifications für Tipps

### User Stories
- Als User möchte ich Tipps erhalten, wie ich die App besser nutzen kann
- Als User möchte ich Vorschläge basierend auf meinem Verhalten bekommen
- Als User möchte ich Empfehlungen ablehnen können

---

## Export von Statistiken
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Statistiken als CSV exportieren
- PDF-Report generieren
- Email-Versand von Reports
- Zeitraum-Auswahl (letzte Woche, Monat, Jahr, custom)

### Technische Umsetzung
- CSV-Generierung mit Aggregations-Daten
- PDF-Report mit react-native-pdf
- Share-API für Export
- Date-Range-Picker für Zeitraum-Auswahl

### CSV-Format
```csv
Datum,Aufnahmen,Dauer(Min),Transkripte,AI-Analysen,Kosten($)
2025-10-01,3,45,3,2,0.12
2025-10-02,5,67,5,3,0.18
2025-10-03,2,23,2,1,0.08
...
```

### User Stories
- Als User möchte ich meine Nutzungsdaten exportieren
- Als User möchte ich Reports für meine Buchhaltung erstellen
- Als User möchte ich meine Statistiken analysieren (z.B. in Excel)

---

## Learning & Improvement Tracking
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Tracking von Transkript-Korrekturen
- Feedback zu AI-Qualität sammeln
- Verbesserungs-Vorschläge an OpenAI
- Opt-in für Qualitäts-Feedback

### Technische Umsetzung
- Edit-History für Transkripte
- Feedback-Button "War diese Analyse hilfreich?"
- Anonymisiertes Feedback an Backend (optional)
- Local-only Storage (Privacy-First)

### User Stories
- Als User möchte ich zur Verbesserung der AI beitragen
- Als User möchte ich Feedback zur AI-Qualität geben
- Als User möchte ich meine Korrekturen tracken
