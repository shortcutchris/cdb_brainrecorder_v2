# UX/UI Verbesserungen

## Audio-Player Features
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
Erweiterter Audio-Player mit professionellen Features:
- **Playback-Speed:** 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **Skip Buttons:** +/- 10 Sekunden (oder konfigurierbar 5/15/30 sek)
- **Waveform-Visualisierung:** Audio-Wellenform mit Timeline
- **Timestamps im Transkript:** Click auf Text → springe zu Audio-Position
- **Kapitelmarker:** Wichtige Punkte im Audio markieren
- **Loop-Funktion:** Abschnitte wiederholen

### Technische Umsetzung
- expo-av für Playback-Control
- Waveform-Library: react-native-audio-waveform
- Seekbar mit Custom-Control
- Transkript-Timestamps (Whisper liefert diese bereits)
- Kapitelmarker als zusätzliche Metadata

### UI-Design
```
┌──────────────────────────────────────┐
│  [Waveform mit Timeline]             │
│  ════╤═══════╤════════╤══════════    │
│      0:15    0:30     0:45           │
├──────────────────────────────────────┤
│  [⏮ -10s] [⏯ Play] [+10s ⏭]        │
│  Speed: [1.0x ▼]  Position: 1:23/5:47│
└──────────────────────────────────────┘
```

### User Stories
- Als User möchte ich Aufnahmen in unterschiedlichen Geschwindigkeiten abhören
- Als User möchte ich zu bestimmten Zeitpunkten springen
- Als User möchte ich im Transkript einen Punkt anklicken und zur Audio-Position springen
- Als User möchte ich wichtige Stellen im Audio markieren

---

## Batch-Operationen & Selection-Mode
**Priorität:** Mittel
**Aufwand:** Mittel

### Beschreibung
- Mehrere Aufnahmen auswählen (Selection-Mode)
- Bulk-Delete
- Bulk-Tag hinzufügen
- Bulk-Export
- Select All / Deselect All

### Technische Umsetzung
- Selection-Mode Toggle im Header
- Checkbox-Overlay auf RecordingCards
- Bottom-Action-Bar mit verfügbaren Aktionen
- Confirmation-Dialog für Bulk-Delete

### UI-Design
```
┌──────────────────────────────────────┐
│ [✕] Aufnahmen (3 ausgewählt)   [✓]  │
├──────────────────────────────────────┤
│ ☑ Aufnahme 1                         │
│ ☐ Aufnahme 2                         │
│ ☑ Aufnahme 3                         │
│ ☑ Aufnahme 4                         │
├──────────────────────────────────────┤
│ [🗑 Löschen] [🏷 Tag] [📤 Export]   │
└──────────────────────────────────────┘
```

### User Stories
- Als User möchte ich mehrere Aufnahmen gleichzeitig bearbeiten
- Als User möchte ich alte Aufnahmen in Massen löschen
- Als User möchte ich mehrere Aufnahmen einem Tag zuordnen

---

## Widgets
**Priorität:** Niedrig
**Aufwand:** Hoch

### Beschreibung
iOS Home-Screen Widgets:
- **Small Widget:** Quick-Record Button
- **Medium Widget:** Letzte 3 Aufnahmen
- **Large Widget:** Letzte 5 Aufnahmen + Quick-Actions

### Technische Umsetzung
- expo-widget (wenn verfügbar) oder native Swift Widget
- Deep-Linking zu App-Screens
- Background-Refresh für Widget-Daten

### Widget-Designs
```
Small Widget (2x2):
┌─────────────┐
│  🎙️ CDB     │
│             │
│  [Aufnahme] │
│   starten   │
└─────────────┘

Medium Widget (4x2):
┌─────────────────────────────┐
│ 🎙️ Letzte Aufnahmen        │
│ • Meeting Notes (10 Min)    │
│ • Ideen (5 Min)             │
│ • To-Do Liste (2 Min)       │
└─────────────────────────────┘
```

### User Stories
- Als User möchte ich direkt vom Home-Screen eine Aufnahme starten
- Als User möchte ich meine letzten Aufnahmen auf einen Blick sehen
- Als User möchte ich schnell auf eine bestimmte Aufnahme zugreifen

---

## iPad-Optimierung
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Split-View Unterstützung
- Keyboard-Shortcuts
- Optimierte Layouts für große Bildschirme
- Drag & Drop Support
- Multi-Column Layout

### Technische Umsetzung
- Responsive Design mit useWindowDimensions
- Keyboard-Handler registrieren
- iPad-spezifische Layouts
- Split-View friendly UI

### Keyboard-Shortcuts
- `Cmd + N`: Neue Aufnahme
- `Cmd + F`: Suche öffnen
- `Space`: Play/Pause
- `Cmd + Delete`: Aufnahme löschen
- `Cmd + R`: Aufnahme umbenennen
- `Cmd + ,`: Settings öffnen

### User Stories
- Als iPad-User möchte ich die App im Split-View nutzen
- Als iPad-User möchte ich Keyboard-Shortcuts verwenden
- Als iPad-User möchte ich das größere Display optimal nutzen

---

## Swipe-Actions & Context-Menus
**Priorität:** Hoch
**Aufwand:** Niedrig

### Beschreibung
- Swipe-Left: Schnell-Aktionen (Delete, Share)
- Swipe-Right: Favorit-Toggle
- Long-Press: Context-Menu
- Haptic-Feedback

### Technische Umsetzung
- react-native-gesture-handler für Swipes
- Custom Swipeable-Component
- Context-Menu mit React Native Action-Sheet
- Haptic-Feedback mit expo-haptics

### Swipe-Actions
```
Swipe Right ←:
  ⭐ Zu Favoriten

Swipe Left →:
  🏷️ Tags  📤 Teilen  🗑️ Löschen
```

### Context-Menu (Long-Press)
```
┌────────────────────┐
│ ✏️  Umbenennen      │
│ ⭐  Favorisieren    │
│ 🏷️  Tags hinzufügen │
│ 📤  Teilen          │
│ 📋  Transkript      │
│ ✨  Zusammenfassung │
│ 🗑️  Löschen         │
└────────────────────┘
```

### User Stories
- Als User möchte ich Aufnahmen durch Wischen löschen
- Als User möchte ich schnell Favoriten markieren
- Als User möchte ich durch langes Drücken ein Kontextmenü öffnen

---

## Dark Mode Optimierungen
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Perfekte Dark-Mode-Farben
- OLED-Black Option für iPhones mit OLED
- Automatic Theme-Switching basierend auf Tageszeit
- Theme-Preview in Settings

### Technische Umsetzung
- Erweiterte Theme-Konfiguration
- OLED-Black als zusätzliches Theme
- Schedule-basiertes Auto-Switching
- Preview-Component in Settings

### User Stories
- Als User möchte ich ein echtes OLED-Black Theme
- Als User möchte ich automatisches Theme-Switching aktivieren
- Als User möchte ich Theme-Änderungen vor dem Aktivieren sehen

---

## Onboarding & Tutorials
**Priorität:** Mittel
**Aufwand:** Mittel

### Beschreibung
- Interaktives Onboarding für neue User
- Feature-Tooltips für neue Features
- Tutorial-Videos
- Quick-Start-Guide

### Technische Umsetzung
- Onboarding-Flow mit react-native-onboarding-swiper
- Tooltip-System mit react-native-walkthrough
- Video-Player für Tutorials
- Skip-Option für erfahrene User

### User Stories
- Als neuer User möchte ich die wichtigsten Features erklärt bekommen
- Als User möchte ich neue Features durch Tooltips entdecken
- Als User möchte ich das Onboarding überspringen können
