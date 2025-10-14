# Export & Integration

## Export-Optionen
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
Verschiedene Export-Formate für unterschiedliche Anwendungsfälle:
- **PDF Export:** Transkript + Zusammenfassung als formatiertes Dokument
- **Markdown Export:** Plain-Text Format für Notiz-Apps
- **Text Export:** Simples .txt Format
- **Email direkt versenden:** Export als Email-Attachment
- **Cloud-Backup:** Automatisches Backup zu iCloud Drive / Dropbox

### Technische Umsetzung
- PDF-Generierung mit react-native-pdf oder expo-print
- Markdown-Formatierung als String
- Share-Extension für Email
- FileSystem API für Cloud-Integration
- Export-Settings in Settings-Screen

### Export-Format (PDF)
```
┌─────────────────────────────────────┐
│ 🎙️ CDB BrainRecorder               │
│                                     │
│ Aufnahme: [Name]                    │
│ Datum: [Date]                       │
│ Dauer: [Duration]                   │
├─────────────────────────────────────┤
│ TRANSKRIPT                          │
│ [Full transcript text...]           │
│                                     │
├─────────────────────────────────────┤
│ ZUSAMMENFASSUNG                     │
│ [Summary text...]                   │
│                                     │
└─────────────────────────────────────┘
```

### User Stories
- Als User möchte ich meine Aufnahmen als PDF exportieren
- Als User möchte ich Transkripte in meine Notiz-App übertragen
- Als User möchte ich Aufnahmen per Email versenden
- Als User möchte ich automatische Cloud-Backups aktivieren

---

## Kalender-Integration
**Priorität:** Mittel
**Aufwand:** Hoch

### Beschreibung
- Meeting-Aufnahmen mit Kalender-Events verknüpfen
- Automatisch Datum/Zeit/Teilnehmer aus Kalender holen
- Aufnahme wird mit Meeting-Details annotiert
- Quick-Action: "Meeting aufnehmen" direkt aus Kalender

### Technische Umsetzung
- Zugriff auf Kalender-API (expo-calendar)
- Permission-Request für Kalender-Zugriff
- Meeting-Auswahl beim Start der Aufnahme
- Metadata-Sync zwischen Recording und Calendar-Event
- Deep-Link Support für Kalender-Integration

### User Stories
- Als User möchte ich Meeting-Aufnahmen mit Kalender-Terminen verknüpfen
- Als User möchte ich automatisch Teilnehmer-Namen in meine Aufnahme übernehmen
- Als User möchte ich aus meinem Kalender heraus direkt eine Aufnahme starten

---

## Notion / Obsidian Export
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Direkter Export zu Notion via API
- Markdown-Export optimiert für Obsidian
- Template-basierter Export mit Frontmatter
- Automatischer Sync (optional)

### Technische Umsetzung
- Notion API Integration
- OAuth für Notion-Authentifizierung
- Markdown mit YAML Frontmatter für Obsidian
- Settings für API-Keys und Workspace-Konfiguration

### Obsidian Format
```markdown
---
title: [Recording Name]
date: [Date]
duration: [Duration]
tags: [#meeting, #notes]
---

# [Recording Name]

## Transkript
[Transcript...]

## Zusammenfassung
[Summary...]
```

### User Stories
- Als Notion-User möchte ich meine Aufnahmen direkt in meinen Workspace exportieren
- Als Obsidian-User möchte ich Aufnahmen in mein Vault übertragen
- Als User möchte ich automatischen Sync zu meiner Notiz-App aktivieren

---

## Audio Export & Sharing
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Audio-Datei exportieren / teilen
- Optional: Mit Transkript als Attachment
- Komprimierte Version für kleinere Dateigröße
- Share via AirDrop, Email, Messages

### Technische Umsetzung
- FileSystem API für Audio-Export
- Share API für native Share-Sheet
- Audio-Kompression (optional)
- Bundle: Audio + Text als ZIP

### User Stories
- Als User möchte ich die Audio-Datei mit anderen teilen
- Als User möchte ich Audio und Transkript zusammen exportieren
- Als User möchte ich die Dateigröße reduzieren für den Versand

---

## Import von Audio-Dateien
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Bestehende Audio-Dateien importieren
- Automatische Transkription nach Import
- Unterstützte Formate: M4A, MP3, WAV, etc.

### Technische Umsetzung
- DocumentPicker für Datei-Auswahl
- Audio-Format-Validierung
- Copy zu App-Speicher
- Automatische Transkriptions-Pipeline

### User Stories
- Als User möchte ich bestehende Audio-Dateien in die App importieren
- Als User möchte ich externe Aufnahmen transkribieren lassen
- Als User möchte ich Aufnahmen von anderen Geräten verarbeiten
