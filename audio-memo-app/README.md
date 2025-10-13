# 🎙️ Audio Memo App - Phase 1

Eine vollständig offline funktionierende iOS/Android App zur Audioaufnahme und -verwaltung.

## 📋 Features

### ✅ Implementiert (Phase 1)

- **Aufnahme**: Hochqualitative Audioaufnahmen direkt vom Mikrofon
- **Verwaltung**: Vollständige CRUD-Funktionalität (Create, Read, Update, Delete)
- **Persistenz**: Alle Daten bleiben nach App-Neustart erhalten
- **Offline-First**: Funktioniert komplett ohne Internetverbindung
- **UI/UX**: Moderne, minimalistische Benutzeroberfläche

### 🎯 Hauptfunktionen

#### 🎙 Create
- Mikrofonberechtigung-Abfrage
- Aufnahme mit hoher Qualität
- Automatische Metadaten-Generierung
- Persistente Speicherung

#### 📜 Read
- Liste aller Aufnahmen
- Anzeige von Name, Datum und Dauer
- Play-Funktion für Wiedergabe

#### ✏️ Update
- Namen der Aufnahme ändern
- Bottom Sheet Modal für Umbenennung

#### 🗑️ Delete
- Löschen mit Bestätigungsdialog
- Entfernung von Datei und Metadaten

## 🛠 Tech Stack

- **Framework**: React Native + Expo SDK
- **Sprache**: TypeScript
- **Styling**: NativeWind (Tailwind CSS für React Native)
- **Navigation**: React Navigation (Native Stack)
- **Audio**: expo-av
- **Storage**: AsyncStorage + expo-file-system
- **Platform**: iOS & Android

## 📦 Installation

### Voraussetzungen

- Node.js (v16+)
- npm oder yarn
- Expo Go App (für Tests auf echten Geräten)
- Xcode (für iOS Simulator)
- Android Studio (für Android Emulator)

### Setup

1. **Dependencies installieren**
```bash
npm install
```

2. **App starten**
```bash
npx expo start
```

3. **Auf Gerät testen**
   - iOS: Drücke `i` für iOS Simulator
   - Android: Drücke `a` für Android Emulator
   - Physisches Gerät: QR-Code mit Expo Go scannen

## 📁 Projektstruktur

```
audio-memo-app/
│
├── App.tsx                    # Navigation Setup
├── components/
│   └── RecordingItem.tsx     # Einzelner Aufnahme-Eintrag
│
├── screens/
│   ├── HomeScreen.tsx        # Liste + Empty State
│   ├── RecordingScreen.tsx   # Aufnahme-Ansicht
│   └── PlayerScreen.tsx      # Playback-Ansicht
│
├── hooks/
│   └── useRecordings.ts      # CRUD + Persistenz-Logik
│
├── utils/
│   └── audio.ts              # Audio-Funktionen
│
├── types/
│   └── index.ts              # TypeScript Interfaces
│
├── tailwind.config.js        # Design-Tokens
└── babel.config.js           # NativeWind Setup
```

## 🎨 Design System

### Farben

```typescript
Primary:       #3B82F6  // Blau
Secondary:     #64748B  // Grau
Success:       #10B981  // Grün
Danger:        #EF4444  // Rot
Background:    #F8FAFC  // Hell-Grau
Surface:       #FFFFFF  // Weiß
```

### Typography

- **H1** (Screen Title): 24px, Bold
- **H2** (Card Title): 18px, Semi-Bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

## 🧪 Testing

### Manuelle Tests

1. **Aufnahme**
   - Öffne App
   - Tippe auf FAB (🎤)
   - Nehme Audio auf
   - Stoppe Aufnahme
   - Verifiziere, dass Aufnahme in Liste erscheint

2. **Wiedergabe**
   - Tippe auf Play-Button
   - Verifiziere Audio-Wiedergabe
   - Teste Seekbar
   - Teste Skip-Buttons (±15s)

3. **Umbenennen**
   - Tippe auf Rename-Button
   - Ändere Namen
   - Verifiziere Änderung nach Speichern

4. **Löschen**
   - Tippe auf Delete-Button
   - Bestätige Löschung
   - Verifiziere Entfernung aus Liste

5. **Persistenz**
   - Schließe App
   - Starte App neu
   - Verifiziere, dass alle Aufnahmen noch da sind

## 🐛 Bekannte Probleme

- Wellenform-Visualizer ist Placeholder (Phase 2)
- Keine Cloud-Synchronisation (Phase 2)
- Keine Transkription (Phase 4)

## 🚀 Roadmap

### Phase 2: REST API Synchronisation
- Backend mit Node.js + Express
- Datei-Upload mit Multer
- Sync-Logik

### Phase 3: Sharing & Export
- Teilen-Funktion
- Export in verschiedene Formate

### Phase 4: Transkription
- Whisper / OpenAI Integration
- Lokale Transkription

### Phase 5: Authentifizierung
- JWT oder OAuth2
- Benutzer-Accounts

## 📄 Lizenz

Privates Projekt

## 👤 Autor

Entwickelt mit Claude Code 🤖

---

**Version**: 1.0.0
**Letztes Update**: 13. Oktober 2025
