# 🎙️ CDB BrainRecorder

Eine vollständig ausgestattete iOS/Android App zur Audioaufnahme mit KI-gestützter Transkription, Zusammenfassung und Custom AI-Prompts.

## 📋 Features

### ✅ Implementiert

#### 🎙 Aufnahme & Verwaltung
- **Hochqualitative Audioaufnahmen** direkt vom Mikrofon
- **Background Recording** - Aufnahmen laufen im Hintergrund weiter (>2 Minuten) 🎉
- **CRUD-Funktionalität** (Create, Read, Update, Delete)
- **Persistente Speicherung** aller Aufnahmen und Metadaten
- **Audio-Player** mit Seekbar, Play/Pause, Skip ±15s
- **Aufnahmen umbenennen** über intuitive Bottom Sheet Modals mit Clear-Button
- **Suche** in Aufnahmenamen und Transkript-Inhalten (Echtzeit-Filterung)
- **Dark Mode Support** mit automatischer Theme-Erkennung

#### 🤖 KI-Features (OpenAI Integration)
- **Automatische Transkription** mit Whisper API
  - Unterstützt 50+ Sprachen
  - Automatische Spracherkennung
  - Optional: Auto-Transcribe nach Aufnahme
- **AI Zusammenfassung** der Transkripte
- **Custom AI Prompts** für individuelle Textverarbeitung
  - **Prompt Library** mit 5 System-Templates
  - **Eigene Prompts** erstellen, bearbeiten und verwalten
  - Template-Auswahl über Dropdown in CustomPrompt Screen
- **Retry-Mechanismus** bei Netzwerkfehlern

#### 🌍 Internationalisierung (i18n)
- **App-Sprache**: Deutsch, Englisch
- **AI-Standardsprache**: 8 Sprachen
  - Deutsch, Englisch, Spanisch, Französisch
  - Italienisch, Polnisch, Portugiesisch, Japanisch
- **Separate Spracheinstellungen**:
  - App UI-Sprache (für Menüs, Buttons, etc.)
  - AI-Antwortsprache (für Zusammenfassungen und Prompts)
- **Lokalisierte Aufnahmenamen** mit Datum und Uhrzeit
- **Vollständig übersetzt**: Alle Screens, Modals, Alerts

#### ⚙️ Einstellungen
- **Theme-Auswahl**: Light, Dark, Automatisch
- **App-Sprache umschalten** (Deutsch/Englisch)
- **AI-Standardsprache festlegen**
- **Auto-Transcribe aktivieren/deaktivieren**
- **OpenAI API Key Verwaltung**

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native + Expo SDK 54
- **Sprache**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Audio**: expo-audio (Hooks-basiert, ersetzt expo-av) 🆕
- **Storage**:
  - AsyncStorage (Metadaten, Settings)
  - expo-file-system (Audio-Dateien)
- **State Management**: React Context API
  - ThemeContext (Dark Mode)
  - SettingsContext (App-Einstellungen)
  - LocalizationContext (i18n)
- **Internationalisierung**: i18next + react-i18next
- **UI Components**: React Native Components + Custom Components
- **Platform**: iOS & Android

### Backend/API
- **OpenAI API**:
  - Whisper (Transkription)
  - GPT-4 (Zusammenfassungen & Custom Prompts)

### Build & Deployment
- **EAS Build** (Expo Application Services)
- **TestFlight** (iOS Beta Distribution)
- **App Store Connect** (Apple Distribution)

## 🎵 Audio-Architektur (expo-audio)

### Migration zu expo-audio (Build 18)

Die App wurde von `expo-av` (deprecated) zu `expo-audio` migriert, um **Background Recording >2 Minuten** zu ermöglichen.

### Hook-basierte API

**Recording** (`RecordingScreen.tsx`):
```typescript
import { useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio';

// Recorder Hook erstellen
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
const recorderState = useAudioRecorderState(recorder);

// Status direkt verfügbar (synchron)
const duration = Math.floor(recorderState.durationMillis / 1000);
const isRecording = recorderState.isRecording;

// Recording starten
await recorder.prepareToRecordAsync();
recorder.record();

// Recording stoppen
await recorder.stop();
const uri = recorder.uri; // Aufnahme-Pfad
```

**Playback** (`PlayerScreen.tsx`):
```typescript
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

// Player Hook erstellen
const player = useAudioPlayer({ uri: recording.uri });
const status = useAudioPlayerStatus(player);

// Status direkt verfügbar (synchron)
const isPlaying = status.playing;
const position = Math.floor(status.currentTime);
const duration = Math.floor(status.duration);

// Abspielen (synchron, kein await)
player.play();
player.pause();
player.seekTo(seconds);
```

### Background Recording

**Konfiguration** (`RecordingScreen.tsx`):
```typescript
await setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
  shouldPlayInBackground: true, // ⭐ KEY für Background Recording!
  interruptionMode: 'duckOthers',
});
```

**app.config.js**:
```javascript
ios: {
  infoPlist: {
    UIBackgroundModes: ['audio'], // iOS Background Mode
  },
},
plugins: [
  'expo-audio' // Expo Audio Plugin
],
```

### Wichtiger Hinweis: Expo Go Limitation

⚠️ **Background Recording funktioniert NICHT in Expo Go** (Development-Modus)!

Das ist eine Plattform-Limitation. Background Recording funktioniert nur in:
- **Standalone Builds** (TestFlight)
- **App Store Builds**

Im Development-Modus stoppt die Aufnahme nach ca. 2 Minuten im Hintergrund.

### Key Differences: expo-av vs expo-audio

| Feature | expo-av (alt) | expo-audio (neu) |
|---------|--------------|------------------|
| **API Style** | Imperative (Klassen) | Declarative (Hooks) |
| **Recording** | `new Audio.Recording()` | `useAudioRecorder()` |
| **Playback** | `Audio.Sound.createAsync()` | `useAudioPlayer()` |
| **Status** | `await getStatusAsync()` | `useAudioRecorderState()` |
| **Lifecycle** | Manuelles `unloadAsync()` | Automatisch (Hook cleanup) |
| **Background** | Limitiert (~2 min) | Unbegrenzt ✅ |
| **Platform Support** | iOS, Android, Web | iOS, Android, Web |

## 📁 Projektstruktur

```
audio-memo-app/
│
├── App.tsx                         # Root Component mit Navigation
│
├── screens/
│   ├── HomeScreen.tsx              # Aufnahmen-Liste + Empty State
│   ├── RecordingScreen.tsx         # Aufnahme-Ansicht (expo-audio)
│   ├── PlayerScreen.tsx            # Audio-Wiedergabe (expo-audio)
│   ├── TranscriptScreen.tsx        # Transkript-Anzeige
│   ├── SummaryScreen.tsx           # AI-Zusammenfassung
│   ├── CustomPromptScreen.tsx      # Custom AI Prompt
│   └── SettingsScreen.tsx          # App-Einstellungen
│
├── components/
│   └── RecordingItem.tsx           # Einzelner Aufnahme-Eintrag mit Kontext-Menü
│
├── hooks/
│   ├── useRecordings.ts            # CRUD + Persistenz-Logik
│   └── useTheme.ts                 # Theme Hook (via Context)
│
├── contexts/
│   ├── ThemeContext.tsx            # Dark Mode State Management
│   ├── SettingsContext.tsx         # App-Einstellungen
│   ├── LocalizationContext.tsx     # i18n State Management
│   └── PromptTemplatesContext.tsx  # Prompt Library Management
│
├── services/
│   ├── transcriptionService.ts     # OpenAI Whisper Integration
│   └── aiService.ts                # OpenAI GPT Integration
│
├── utils/
│   └── audio.ts                    # Audio Helper Functions
│                                   # (formatDuration, formatDate)
│
├── types/
│   └── index.ts                    # TypeScript Interfaces
│
├── i18n/
│   └── config.ts                   # i18next Konfiguration
│
├── locales/
│   ├── de/
│   │   ├── common.json             # Gemeinsame DE-Übersetzungen
│   │   └── screens.json            # Screen-spezifische DE-Übersetzungen
│   └── en/
│       ├── common.json             # Gemeinsame EN-Übersetzungen
│       └── screens.json            # Screen-spezifische EN-Übersetzungen
│
├── ai/
│   ├── docs/
│   │   └── expo_audio.md           # expo-audio API Dokumentation
│   ├── features/                   # Feature-Spezifikationen
│   └── migration_plan_expo_audio.md # expo-audio Migration Plan
│
├── assets/
│   ├── icon.png                    # App Icon (1024x1024)
│   ├── adaptive_icon.png           # Android Adaptive Icon
│   ├── splash-icon.png             # Splash Screen
│   └── logo.png                    # App Logo (Empty State)
│
├── app.config.js                   # Expo App Konfiguration (Dynamic)
├── eas.json                        # EAS Build Konfiguration
├── .env                            # Environment Variables (OpenAI Key)
└── package.json                    # Dependencies
```

## 🌍 Internationalisierung (i18n)

### Architektur

Das App verwendet ein **Zwei-Ebenen-Sprachsystem**:

1. **App UI-Sprache** (LocalizationContext)
   - Steuert die Sprache aller UI-Elemente
   - Verfügbare Sprachen: Deutsch, Englisch
   - Persistiert in AsyncStorage
   - Umschaltbar in den Settings

2. **AI-Antwortsprache** (SettingsContext)
   - Steuert die Sprache der AI-Antworten
   - 8 unterstützte Sprachen
   - Unabhängig von der App UI-Sprache

### Implementation

**i18next Setup** (`i18n/config.ts`):
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { common: deCommon, screens: deScreens },
      en: { common: enCommon, screens: enScreens },
    },
    lng: 'de',
    fallbackLng: 'de',
    defaultNS: 'screens',
    ns: ['common', 'screens'],
  });
```

**Verwendung in Components**:
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('home.emptyTitle')}</Text>
    <Text>{t('common:buttons.save')}</Text>
  );
}
```

### Translation Namespaces

- **common**: Buttons, Status, Errors, Alerts, Recording Item
- **screens**: Screen-spezifische Texte (Home, Recording, Player, etc.)

### Lokalisierte Features

- Aufnahmenamen: "Aufnahme 14.10 15:30" (DE) vs "Recording 10/14 3:30 PM" (EN)
- Datumsformate: DD.MM (DE) vs MM/DD (EN)
- Zeitformate: 24h (DE) vs 12h AM/PM (EN)
- Alle Alerts, Modals und Fehlermeldungen

## 📦 Installation & Setup

### Voraussetzungen

- Node.js (v16+)
- npm oder yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode + Apple Developer Account
- Android: Android Studio

### 1. Dependencies installieren

```bash
npm install
```

### 2. Environment Variables konfigurieren

Erstelle eine `.env` Datei im Projektroot:

```env
OPENAI_API_KEY=sk-proj-...
```

### 3. App im Entwicklungsmodus starten

```bash
npx expo start
```

**Optionen:**
- `i` - iOS Simulator
- `a` - Android Emulator
- QR-Code scannen für physisches Gerät (Expo Go App)

**Hinweis:** Background Recording funktioniert nicht in Expo Go! Für Tests einen TestFlight Build verwenden.

## 🚀 Deployment (iOS TestFlight)

### Übersicht

Die App wird über **EAS Build** gebaut und über **TestFlight** an Beta-Tester verteilt.

### Erstmaliges Setup

#### 1. EAS CLI Login

```bash
eas login
```

#### 2. EAS Projekt initialisieren

```bash
eas init
```

Dies erstellt ein EAS-Projekt und fügt die Project ID zur `app.config.js` hinzu.

#### 3. Production Build erstellen & zu TestFlight submiten

```bash
eas build --platform ios --profile production --auto-submit
```

**Optional: Mit Release Notes**
```bash
eas build --platform ios --profile production --auto-submit \
  --message "Build 18 - expo-audio migration for background recording >2min"
```

**Was passiert:**
- Apple ID & Credentials werden abgefragt
- Distribution Certificate wird erstellt
- App wird kompiliert (~15-20 Minuten)
- Automatischer Upload zu App Store Connect
- App wird zu TestFlight submitted

### App Store Connect Konfiguration

Nach dem ersten Build:

1. **App Store Connect öffnen**: https://appstoreconnect.apple.com
2. **App auswählen**: "CDB BrainRecorder"
3. **TestFlight Tab** → **Interne Tests**
4. **Tester hinzufügen**:
   - E-Mail-Adressen eingeben
   - Bis zu 100 interne Tester möglich
5. **Export Compliance beantworten** (falls gefragt)

### Beta-Tester einladen

**Tester erhalten:**
- Einladungs-E-Mail von Apple
- Link zum Installieren in TestFlight

**Tester müssen:**
1. TestFlight App aus dem App Store installieren
2. Auf Einladungs-Link klicken
3. App in TestFlight öffnen
4. "Install" drücken

### Updates veröffentlichen

#### 1. Build-Nummer erhöhen

In `app.config.js`:
```javascript
buildNumber: '19',  // Vorher: '18'
```

#### 2. Neuen Build erstellen

```bash
eas build --platform ios --profile production --auto-submit \
  --message "Build 19 - Fixed XYZ, added ABC feature"
```

#### 3. Automatische Updates

- Alle Tester erhalten **automatisch eine Push-Benachrichtigung**
- In TestFlight App erscheint **"Update" Button**
- Optional: Automatische Installation aktivieren in TestFlight Settings

### Build-Profile

Die `eas.json` definiert drei Build-Profile:

#### 1. Development (`development`)
```bash
eas build --platform ios --profile development
```
- Für lokale Entwicklung mit Development Build

#### 2. Preview (`preview`)
```bash
eas build --platform ios --profile preview
```
- Ad Hoc Build für direkte Installation
- Benötigt registrierte Device UDIDs
- Nicht über TestFlight

#### 3. Production (`production`)
```bash
eas build --platform ios --profile production
```
- Store Distribution
- Für TestFlight & App Store
- **Empfohlen für Beta-Testing**

### Konfigurationsdateien

**app.config.js** - App-Metadaten:
```javascript
{
  name: 'CDB BrainRecorder',
  bundleIdentifier: 'com.cdb.brainrecorder',
  version: '1.2.0',
  plugins: [
    'expo-audio' // expo-audio Plugin
  ],
  ios: {
    buildNumber: '18',
    infoPlist: {
      NSMicrophoneUsageDescription: '...',
      UIBackgroundModes: ['audio'], // Background Recording
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  extra: {
    eas: { projectId: 'b2803f18-2a5a-41cd-a82e-5f4751bbf73c' },
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}
```

**eas.json** - Build & Submit Konfiguration:
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": { "resourceClass": "m-medium" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "ch@bik.biz",
        "ascAppId": "6753975262",
        "appleTeamId": "UCCXC2RSU9"
      }
    }
  }
}
```

## 🎨 Design System

### Theme-Support

- **Light Mode** (Standard)
- **Dark Mode**
- **Automatisch** (System-Einstellung)

### Farben

**Light Theme:**
```typescript
{
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  primary: '#3B82F6',
  danger: '#EF4444',
  border: '#E2E8F0',
}
```

**Dark Theme:**
```typescript
{
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#60A5FA',
  danger: '#F87171',
  border: '#334155',
}
```

### Typography

- **H1** (Screen Title): 24px, Bold
- **H2** (Section Title): 20px, Semi-Bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

## 🧪 Testing

### Manuelle Tests

#### 1. Aufnahme
- Öffne App → FAB Button (🎤)
- Nehme Audio auf
- Stoppe Aufnahme
- ✅ Aufnahme erscheint in Liste

#### 2. Background Recording (TestFlight only!)
- Starte Aufnahme
- App in Hintergrund schicken (Home Button)
- Warte >2 Minuten
- App wieder öffnen
- ✅ Aufnahme läuft weiter

#### 3. Wiedergabe
- Tippe auf Aufnahme
- Play/Pause funktioniert
- Seekbar funktioniert
- Skip ±15s funktioniert

#### 4. Transkription
- Tippe auf ⋮ Menü → "Transkript"
- ✅ Status: "Wird verarbeitet..."
- Warte 30-60 Sekunden
- ✅ Status: "Fertig" → Transkript anzeigen

#### 5. AI-Zusammenfassung
- Nach erfolgreicher Transkription
- ⋮ Menü → "AI Zusammenfassung"
- ✅ Zusammenfassung wird generiert

#### 6. Internationalisierung
- Settings → "App-Sprache" → English
- ✅ Alle Texte auf Englisch
- Neue Aufnahme erstellen
- ✅ Name: "Recording 10/14 3:30 PM"

#### 7. Dark Mode
- Settings → "Theme" → Dark
- ✅ Dark Theme aktiviert
- Settings → "Theme" → Automatisch
- ✅ Folgt System-Einstellung

### Beta-Testing (TestFlight)

- Lade interne Tester ein (bis zu 100)
- Sammle Feedback über TestFlight
- Veröffentliche Updates mit Release Notes
- Externe Tests (bis zu 10.000 Tester) nach Apple Review

## 🔐 Sicherheit & API Keys

### OpenAI API Key

**Aktuell (Beta):**
- Ein Key in `.env` für alle Nutzer
- Key wird in `app.config.js` eingebettet
- Akzeptabel für interne Beta-Tests

**Produktion (Future):**
- Backend-Service mit User-Authentication
- API Key Management auf Server-Seite
- Rate Limiting pro User

### Best Practices

- `.env` nicht in Git committen (bereits in `.gitignore`)
- EAS Secrets für sensible Daten: `eas secret:create`
- Apple Credentials werden im System Keychain gespeichert

## 🐛 Bekannte Probleme

- **OpenAI Quota**: Bei überschrittenem Quota erscheint Fehlermeldung
- **Lange Aufnahmen**: Transkription kann >2 Minuten dauern
- **Netzwerk**: Bei schlechter Verbindung Retry-Mechanismus nutzen
- **Background Recording**: Funktioniert NICHT in Expo Go (nur TestFlight/App Store)

## 🧑‍💻 Development Notes & Wichtige Learnings

### Codebase-Architektur

**Wichtig für zukünftige Entwicklung:**

#### expo-audio Migration (Build 18)

**Hybrid-Ansatz:**
- Recording-Logik direkt in `RecordingScreen.tsx` (Hooks)
- Playback-Logik direkt in `PlayerScreen.tsx` (Hooks)
- `utils/audio.ts` enthält nur Helper-Funktionen
- Keine Wrapper-Funktionen mehr nötig

**Warum?**
- `utils/audio.ts` ist kein React Component → kann keine Hooks nutzen
- Hooks müssen in React Components verwendet werden
- Lifecycle Management automatisch durch React

**Key Changes:**
```typescript
// ❌ Alt (expo-av) - in utils/audio.ts
export async function startRecording() {
  const recording = await Audio.Recording.createAsync(...);
  return recording;
}

// ✅ Neu (expo-audio) - direkt in RecordingScreen.tsx
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
const recorderState = useAudioRecorderState(recorder);
```

#### Rename Modal Locations
Die App hat **zwei verschiedene Rename-Modals**:

1. **RecordingItem.tsx** (`components/RecordingItem.tsx`)
   - Modal in der **Liste** auf dem HomeScreen
   - Wird verwendet wenn "Umbenennen" Button in der Aufnahme-Karte geklickt wird
   - **Häufigster Use Case** ✅

2. **PlayerScreen.tsx** (`screens/PlayerScreen.tsx`)
   - Modal im **Player** Screen
   - Wird verwendet beim Abspielen einer Aufnahme
   - Selten verwendet

**Lesson Learned:** Bei UI-Änderungen an Rename-Funktionalität **BEIDE Dateien** prüfen und updaten!

#### Clear-Button Implementation
Das Hinzufügen von Clear-Buttons in TextInput-Feldern:

**Ansatz 1: Native `clearButtonMode` (iOS only)**
```typescript
<TextInput clearButtonMode="while-editing" />
```
- ❌ Funktioniert NICHT in Modals
- ❌ Funktioniert NICHT mit Dark Mode
- ❌ Nicht empfohlen

**Ansatz 2: Absolute Positioning ✅**
```typescript
<View style={{ position: 'relative' }}>
  <TextInput style={{ paddingRight: 40 }} />
  <TouchableOpacity style={{ position: 'absolute', right: 12, top: 12 }}>
    <Ionicons name="close-circle" />
  </TouchableOpacity>
</View>
```
- ✅ Funktioniert überall
- ✅ Volle Kontrolle über Styling
- ✅ Cross-Platform kompatibel

#### Permission Handling
Microphone-Berechtigung **VOR** Navigation zum RecordingScreen prüfen:

```typescript
// ✅ RICHTIG - in HomeScreen.tsx
const handleStartRecording = async () => {
  const { granted } = await requestRecordingPermissionsAsync();
  if (granted) {
    navigation.navigate('Recording');
  }
};

// ❌ FALSCH - in RecordingScreen.tsx
useEffect(() => {
  // Screen ist schon geöffnet, überdeckt Permission-Dialog!
  requestPermission();
}, []);
```

#### Background Recording Debugging

**Problem:** Aufnahme stoppt nach ~2 Minuten im Hintergrund

**Root Cause:** Expo Go Limitation - Background Audio funktioniert nicht in Development

**Solution:**
1. TestFlight Build erstellen
2. Auf physischem Device testen
3. Background Recording funktioniert in standalone builds

**Konfiguration:**
- `shouldPlayInBackground: true` in `setAudioModeAsync()`
- `UIBackgroundModes: ['audio']` in `app.config.js`
- `expo-audio` Plugin in `app.config.js`

#### Hot Reload Issues
Bei Änderungen die nicht sichtbar werden:

1. **Expo Dev Server komplett neu starten**:
```bash
ps aux | grep "expo start" | grep -v grep | awk '{print $2}' | xargs kill -9
npx expo start --clear
```

2. **App neu laden**: `r` im Terminal drücken

3. **Bei hartnäckigen Problemen**:
```bash
rm -rf node_modules/.cache
npx expo start --clear
```

## 📊 Analytics & Monitoring

**Future Features:**
- Sentry für Error Tracking
- Firebase Analytics für Usage Metrics
- Performance Monitoring

## 🤝 Contributing

Dieses Projekt ist für interne Nutzung bei CDB.

**Development Workflow:**
1. Feature-Branch erstellen
2. Änderungen committen
3. Push zu GitHub
4. Testen mit `npx expo start`
5. Merge nach Review

## 📄 Lizenz

Proprietary - CDB (Hans Christian Hubmann)

## 👤 Autor & Credits

**Entwickelt mit Claude Code** 🤖

**Team:**
- Hans Christian Hubmann (Product & Development)

**Technologien:**
- React Native + Expo
- OpenAI (Whisper & GPT-4)
- Apple TestFlight

---

**Version**: 1.2.0
**Build**: 18
**Letztes Update**: 14. Oktober 2025
**Bundle ID**: com.cdb.brainrecorder
**ASC App ID**: 6753975262
**EAS Project ID**: b2803f18-2a5a-41cd-a82e-5f4751bbf73c

## 📝 Changelog

### Build 18 (14.10.2025) - expo-audio Migration
- ✨ **Background Recording Support** - Aufnahmen laufen unbegrenzt im Hintergrund
- 🔄 **Migrated from expo-av to expo-audio** - Moderne Hook-basierte Audio API
- ⚡ **Performance Improvements** - Automatisches Lifecycle Management
- 📚 **Documentation** - Comprehensive migration guide in `ai/migration_plan_expo_audio.md`

### Build 17 (13.10.2025)
- 🔍 **Search Feature** - Search in recording names and transcripts
- 🎨 **X-Button in Textfields** - Clear button in all text inputs
- 🌍 **Custom Prompts Library** - 5 system templates + custom prompts

### Build 1-16
- Initial releases with core features
- AI integration (Whisper, GPT-4)
- i18n support (DE/EN)
- Dark mode
- Settings screen
