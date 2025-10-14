# Audio & Recording Features

## Audio-Qualität-Einstellungen
**Priorität:** Mittel
**Aufwand:** Niedrig

### Beschreibung
Verschiedene Qualitätsstufen für unterschiedliche Anwendungsfälle:
- **Hoch (44.1 kHz, 256 kbps):** Studio-Qualität, große Dateien
- **Mittel (22 kHz, 128 kbps):** Standard-Qualität, Balance zwischen Qualität & Größe
- **Niedrig (16 kHz, 64 kbps):** Kompakt, kleine Dateien, ausreichend für Sprache

Zusätzliche Features:
- Noise Reduction Toggle
- Mono vs. Stereo
- Automatische Lautstärke-Anpassung (AGC)

### Technische Umsetzung
- expo-av Recording-Options anpassen
- Settings für Audio-Qualität
- Anzeige der geschätzten Dateigröße
- Real-time Größe während Aufnahme

### Settings-UI
```
┌────────────────────────────────────┐
│ Audio-Qualität                     │
│ ○ Hoch (44.1 kHz)                  │
│ ● Mittel (22 kHz) [Empfohlen]     │
│ ○ Niedrig (16 kHz)                 │
├────────────────────────────────────┤
│ Erweitert                          │
│ [✓] Noise Reduction                │
│ [✓] Auto-Lautstärke                │
│ [ ] Stereo (Standard: Mono)        │
├────────────────────────────────────┤
│ Geschätzte Größe: ~2 MB / 10 Min   │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich die Audio-Qualität an meine Bedürfnisse anpassen
- Als User möchte ich Speicherplatz sparen durch niedrigere Qualität
- Als User möchte ich Hintergrundgeräusche reduzieren

---

## Externe Mikrofone & Bluetooth
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Support für externe Mikrofone (Lightning, USB-C)
- Bluetooth-Mikrofon-Support
- Mikrofon-Auswahl im Recording-Screen
- Input-Level-Monitoring

### Technische Umsetzung
- Device-Detection via expo-av
- Audio-Route-Selection
- Input-Level-Meter während Aufnahme
- Fallback auf eingebautes Mikrofon

### UI-Beispiel
```
┌────────────────────────────────────┐
│ 🎤 Mikrofon-Quelle                 │
│ ● iPhone Mikrofon (Built-in)      │
│ ○ AirPods Pro (Bluetooth)         │
│ ○ Externes USB Mikrofon           │
├────────────────────────────────────┤
│ Input-Level                        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 65%         │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich ein externes Mikrofon für bessere Qualität nutzen
- Als User möchte ich mein Bluetooth-Headset zum Aufnehmen verwenden
- Als User möchte ich den Input-Level überwachen

---

## Background Recording
**Priorität:** Mittel
**Aufwand:** Niedrig

### Beschreibung
- Aufnahme läuft weiter bei gesperrtem Screen
- App kann in den Hintergrund
- Persistent Notification während Aufnahme
- Battery-Optimierung

### Technische Umsetzung
- iOS Background Modes bereits konfiguriert (UIBackgroundModes: ['audio'])
- Background Task für lange Aufnahmen
- Notification während Recording
- Wake-Lock für Display-Off

### Notification-Beispiel
```
┌────────────────────────────────────┐
│ 🔴 CDB BrainRecorder               │
│ Aufnahme läuft... 05:23            │
│ [Pause] [Stopp]                    │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich Aufnahmen machen während ich andere Apps nutze
- Als User möchte ich lange Aufnahmen machen ohne Display an zu lassen
- Als User möchte ich die Aufnahme über Notifications steuern

---

## Timer-basierte Aufnahme
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Auto-Stop nach X Minuten
- Countdown-Timer vor Start
- Scheduled Recording (zu bestimmter Uhrzeit starten)
- Reminder-Notification

### Technische Umsetzung
- Timer-Konfiguration vor Aufnahme
- Background-Timer mit Alarm
- Notification bei Auto-Stop
- Scheduled Notifications für geplante Aufnahmen

### UI-Beispiel
```
┌────────────────────────────────────┐
│ Timer-Einstellungen                │
│                                    │
│ Auto-Stop nach:                    │
│ [5 Min] [15 Min] [30 Min] [1 Std] │
│ [Custom: ____ Min]                 │
│                                    │
│ Countdown vor Start:               │
│ [3 Sek] [5 Sek] [10 Sek] [Aus]   │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich Aufnahmen automatisch nach Zeit beenden
- Als User möchte ich Aufnahmen zeitlich planen
- Als User möchte ich einen Countdown vor der Aufnahme

---

## Pause & Resume Enhancement
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Verbesserte Pause-Funktion
- Marker im Audio wo pausiert wurde
- Segment-View (Aufnahme in Teile aufgeteilt)
- Option: Stille zwischen Pausen entfernen

### Technische Umsetzung
- Timestamps für Pausen speichern
- Segment-Metadata im Recording
- Post-Processing Option für Stille-Entfernung
- Visual Timeline mit Pause-Markern

### Timeline-Visualisierung
```
Recording Timeline:
═══════╤═══════╤═══════╤═══════
0:00   2:30   5:00   7:30   10:00
       [⏸]    [⏸]
       Pause  Pause
```

### User Stories
- Als User möchte ich sehen, wo ich pausiert habe
- Als User möchte ich Pausen aus der Aufnahme entfernen
- Als User möchte ich Aufnahmen in Segmente unterteilen

---

## Voice-Activation (VAD)
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Automatischer Aufnahme-Start bei Sprach-Erkennung
- Automatische Pause bei Stille
- Noise-Gate Threshold konfigurierbar
- Battery-sparend durch Smart-Recording

### Technische Umsetzung
- Voice Activity Detection Algorithm
- Audio-Level-Monitoring
- Threshold-basiertes Triggering
- Settings für Sensitivität

### Settings
```
┌────────────────────────────────────┐
│ Voice Activation                   │
│ [✓] Aktiviert                      │
│                                    │
│ Sensitivität:                      │
│ Niedrig ●───────────── Hoch        │
│         ▓▓▓▓▓▓░░░░░░              │
│                                    │
│ Stille-Timeout: 3 Sekunden         │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich Aufnahmen automatisch bei Sprache starten
- Als User möchte ich Stille automatisch überspringen
- Als User möchte ich die Sensitivität anpassen

---

## Audio-Effekte & Processing
**Priorität:** Niedrig
**Aufwand:** Hoch

### Beschreibung
Post-Processing Optionen:
- Noise Reduction (AI-basiert)
- Echo Cancellation
- Volume Normalization
- Bass/Treble Equalizer
- Speed/Pitch Adjustment

### Technische Umsetzung
- Audio-Processing-Library (z.B. FFmpeg)
- Background-Processing nach Aufnahme
- Non-destructive Editing (Original behalten)
- Preview vor Apply

### User Stories
- Als User möchte ich Hintergrundgeräusche nachträglich entfernen
- Als User möchte ich die Lautstärke meiner Aufnahme normalisieren
- Als User möchte ich Audio-Effekte anwenden
