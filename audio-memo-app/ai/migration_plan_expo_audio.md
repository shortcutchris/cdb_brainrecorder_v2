# Migration Plan: expo-av → expo-audio (Build 18)

## 📋 Übersicht

Dieses Dokument beschreibt die vollständige Migration von expo-av zu expo-audio zur Lösung des 2-Minuten Background-Recording Problems.

**Datum**: 2025-10-14
**Status**: In Progress
**Build**: 18
**Ziel**: Background-Recording >2 Minuten ermöglichen

---

## 🎯 ANALYSE DER EXPO-AUDIO ARCHITEKTUR

### Zentrale Erkenntnisse:

1. **Hook-basierte API** (React-Komponenten required):
   - `useAudioRecorder()` für Recording
   - `useAudioPlayer()` für Playback
   - `useAudioRecorderState()` / `useAudioPlayerStatus()` für Status

2. **Background-Recording**:
   - `shouldPlayInBackground: true` in `setAudioModeAsync()`
   - UIBackgroundModes: ['audio'] ✅ (bereits konfiguriert in app.config.js!)

3. **Recorder Workflow**:
   ```tsx
   const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
   await recorder.prepareToRecordAsync();
   recorder.record();
   await recorder.stop(); // URI in recorder.uri
   ```

4. **Player Properties** (sync, kein async!):
   - `player.currentTime`, `player.duration`, `player.playing`

5. **Alternative für non-Hook**: `createAudioPlayer()` existiert
   - ⚠️ ABER: Kein `createAudioRecorder()` → Recorder MUSS Hook sein!

---

## 📐 ARCHITEKTUR-ENTSCHEIDUNG: HYBRID-ANSATZ

**Problem**:
- `utils/audio.ts` ist kein React-Component
- Kann keine Hooks nutzen
- Bisherige Funktionen wie `startRecording()` / `stopRecording()` müssen umgebaut werden

**Lösung**:
- **Recording**: Hook direkt in `RecordingScreen.tsx` (kein createAudioRecorder möglich!)
- **Playback**: Hook in `PlayerScreen.tsx` und `RecordingItem.tsx`
- **Shared Logic**: Nur Helper-Funktionen in `utils/audio.ts` (formatDuration, etc.)

---

## 🔄 PHASE 1: RECORDING MIGRATION (RecordingScreen.tsx)

### 1.1 RecordingScreen.tsx komplett umbauen

#### AKTUELL (expo-av, utils-basiert):
```tsx
import { Audio } from 'expo-av';
import { startRecording, stopRecording } from '../utils/audio';

const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [duration, setDuration] = useState(0);

const initRecording = async () => {
  const newRecording = await startRecording();
  setRecording(newRecording);
};

// Timer mit setInterval
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isRecording) {
    interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isRecording]);

const handleStop = async () => {
  const newRecording = await stopRecording(recording, locale, label);
  await addRecording(newRecording);
};
```

#### NEU (expo-audio, Hook-basiert):
```tsx
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from '../i18n/config';

// Hooks
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
const recorderState = useAudioRecorderState(recorder);

// Duration direkt aus recorderState
const duration = Math.floor(recorderState.durationMillis / 1000);

// Audio Mode Setup (einmalig)
useEffect(() => {
  const setupAudioMode = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      shouldPlayInBackground: true, // ⭐ KEY für Background-Recording!
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
    });
  };
  setupAudioMode();
}, []);

// Permission Check + Recording Start
const initRecording = async () => {
  try {
    // Permission prüfen
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.microphonePermissionDenied'),
        [{ text: t('common:buttons.ok'), onPress: () => navigation.goBack() }]
      );
      return;
    }

    // Recording vorbereiten und starten
    await recorder.prepareToRecordAsync();
    recorder.record();

    console.log('✅ Recording started successfully');
  } catch (error) {
    console.error('❌ Recording start ERROR:', error);
    Alert.alert(
      t('recording.errorTitle'),
      t('recording.microphonePermissionDenied'),
      [{ text: t('common:buttons.ok'), onPress: () => navigation.goBack() }]
    );
  }
};

// Recording Stoppen und Speichern
const handleStop = async () => {
  try {
    // Recording stoppen
    await recorder.stop();

    const uri = recorder.uri; // ✅ Property, nicht getURI()
    if (!uri) {
      throw new Error('Recording URI is null');
    }

    const recordingDuration = Math.floor(recorderState.durationMillis / 1000);

    // Generate unique ID and filename
    const id = Date.now().toString();
    const filename = `recording-${id}.m4a`;
    const newUri = `${FileSystem.documentDirectory}${filename}`;

    // Copy file to permanent location
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    // Get current language and locale for recording name
    const currentLanguage = i18n.language;
    const locale = currentLanguage === 'en' ? 'en-US' : 'de-DE';
    const label = t('common:recording.defaultName');

    // Create recording metadata
    const newRecording = {
      id,
      uri: newUri,
      name: formatDefaultName(locale, label),
      createdAt: new Date().toISOString(),
      duration: recordingDuration,
    };

    await addRecording(newRecording);

    // Auto-transcribe if enabled
    if (autoTranscribeEnabled) {
      transcribeRecording(newRecording.id, newRecording.uri).catch((error) => {
        console.error('Auto-transcribe error:', error);
      });
    }

    navigation.goBack();
  } catch (error) {
    console.error('Error stopping recording:', error);
    Alert.alert(t('recording.errorTitle'), t('recording.saveFailed'));
    navigation.goBack();
  }
};

// Helper Function (aus utils/audio.ts kopieren)
function formatDefaultName(locale: string, label: string): string {
  const now = new Date();
  const date = now.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${label} ${date} ${time}`;
}
```

### 1.2 Cleanup Handler anpassen

```tsx
// Cleanup bei Cancel
const handleCancel = () => {
  Alert.alert(
    t('recording.discardConfirm'),
    t('recording.discardMessage'),
    [
      { text: t('recording.continueRecording'), style: 'cancel' },
      {
        text: t('recording.discard'),
        style: 'destructive',
        onPress: async () => {
          if (recorderState.isRecording) {
            await recorder.stop();
          }
          navigation.goBack();
        },
      },
    ]
  );
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (recorderState.isRecording) {
      console.log('🧹 Cleanup: Stopping active recording');
      recorder.stop().catch(err => console.error('Cleanup error:', err));
    }
  };
}, [recorderState.isRecording]);
```

### 1.3 Status-Anzeige

```tsx
// REC Indicator - zeige nur wenn wirklich am Aufnehmen
{recorderState.isRecording && (
  <View style={styles.indicatorContainer}>
    <Ionicons name="radio-button-on" size={24} color={colors.danger} />
    <Text style={[styles.recordingText, { color: colors.danger }]}>
      {t('recording.rec')}
    </Text>
  </View>
)}

// Timer - direkt aus recorderState
<Text style={[styles.timerText, { color: colors.text }]}>
  {formatDuration(Math.floor(recorderState.durationMillis / 1000))}
</Text>
```

---

## 🎵 PHASE 2: PLAYBACK MIGRATION

### 2.1 PlayerScreen.tsx

#### AKTUELL (expo-av):
```tsx
import { Audio } from 'expo-av';

const [sound, setSound] = useState<Audio.Sound | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [position, setPosition] = useState(0);
const [duration, setDuration] = useState(0);

const loadSound = async () => {
  const { sound: newSound } = await Audio.Sound.createAsync(
    { uri: recording.uri },
    { shouldPlay: false }
  );
  setSound(newSound);
};

useEffect(() => {
  if (sound) {
    const interval = setInterval(async () => {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setPosition(Math.floor(status.positionMillis / 1000));
        setDuration(Math.floor(status.durationMillis! / 1000));
        setIsPlaying(status.isPlaying);
      }
    }, 500);
    return () => clearInterval(interval);
  }
}, [sound]);
```

#### NEU (expo-audio):
```tsx
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

// Hook statt State
const player = useAudioPlayer(recording?.uri || null);
const status = useAudioPlayerStatus(player);

// Position/Duration direkt aus Status
const position = Math.floor(status.currentTime);
const duration = Math.floor(status.duration);
const isPlaying = status.playing;

// Kein useEffect für Updates nötig - Hook macht das automatisch!

// Play/Pause (sync!)
const handlePlayPause = () => {
  if (isPlaying) {
    player.pause();
  } else {
    player.play();
  }
};

// Seek (sync!)
const handleSeek = (value: number) => {
  player.seekTo(value);
};

// Skip
const handleSkip = (seconds: number) => {
  const newPosition = Math.max(0, Math.min(duration, position + seconds));
  player.seekTo(newPosition);
};

// Auto-stop when finished
useEffect(() => {
  if (status.didJustFinish) {
    player.seekTo(0);
  }
}, [status.didJustFinish]);
```

### 2.2 RecordingItem.tsx Check

Falls RecordingItem inline-Playback hat, auch dort migrieren:

```tsx
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

function RecordingItem({ recording }) {
  const player = useAudioPlayer(recording.uri);
  const status = useAudioPlayerStatus(player);

  return (
    <TouchableOpacity onPress={() => player.play()}>
      <Ionicons name={status.playing ? 'pause' : 'play'} />
    </TouchableOpacity>
  );
}
```

---

## 🔐 PHASE 3: PERMISSIONS UPDATE

### 3.1 HomeScreen.tsx

#### AKTUELL (expo-av):
```tsx
import { Audio } from 'expo-av';

const handleStartRecording = async () => {
  const { status } = await Audio.requestPermissionsAsync();
  if (status === 'granted') {
    navigation.navigate('Recording');
  }
};
```

#### NEU (expo-audio):
```tsx
import { requestRecordingPermissionsAsync } from 'expo-audio';

const handleStartRecording = async () => {
  try {
    const { status, granted } = await requestRecordingPermissionsAsync();

    if (granted) {
      navigation.navigate('Recording');
    } else {
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.microphonePermissionDenied')
      );
    }
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    Alert.alert(
      t('recording.errorTitle'),
      t('recording.microphonePermissionDenied')
    );
  }
};
```

---

## 🧹 PHASE 4: UTILS CLEANUP

### 4.1 utils/audio.ts - Was bleibt?

#### BEHALTEN (Keine Hooks, Pure Functions):
```ts
/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable string
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
```

#### ENTFERNEN (Jetzt in Komponenten):
```ts
❌ export async function requestMicrophonePermission()
❌ export async function startRecording()
❌ export async function stopRecording()
```

---

## 🎯 MIGRATIONS-SCHRITTE (REIHENFOLGE)

### **Step 1**: RecordingScreen.tsx migrieren ⭐ PRIORITÄT
1. Import expo-audio Hooks
2. useAudioRecorder + useAudioRecorderState
3. setAudioModeAsync setup
4. Permission check in initRecording
5. prepareToRecordAsync + record()
6. stop() → recorder.uri + File-Handling
7. Cleanup Handler anpassen
8. Timer aus recorderState.durationMillis

**Test**: Recording starten/stoppen, File wird gespeichert

---

### **Step 2**: PlayerScreen.tsx migrieren
1. Import expo-audio Hooks
2. useAudioPlayer + useAudioPlayerStatus
3. Sync APIs (seekTo, play, pause)
4. Position/Duration aus Status
5. Remove old useEffect polling

**Test**: Playback funktioniert, Seek funktioniert

---

### **Step 3**: RecordingItem.tsx check
1. Prüfen ob inline-Playback existiert
2. Falls ja: auch useAudioPlayer

**Test**: Liste zeigt Aufnahmen korrekt

---

### **Step 4**: HomeScreen.tsx permissions
1. requestRecordingPermissionsAsync
2. Error-Handling anpassen

**Test**: Permission-Dialog erscheint

---

### **Step 5**: utils/audio.ts cleanup
1. Alte Funktionen entfernen
2. Nur Helper behalten

**Test**: Keine Import-Fehler

---

### **Step 6**: Testing Checklist
- [ ] Recording startet
- [ ] Timer läuft
- [ ] Recording stoppt und speichert
- [ ] Playback funktioniert
- [ ] Seek funktioniert
- [ ] Permission flow OK
- [ ] **Background Recording >2 Minuten** ⭐
- [ ] Auto-Transcribe funktioniert

---

## ⚠️ KRITISCHE PUNKTE & FALLSTRICKE

### 1. Recorder URI
```tsx
// ❌ FALSCH (expo-av)
const uri = recording.getURI();

// ✅ RICHTIG (expo-audio)
const uri = recorder.uri; // Property!
```

### 2. Duration in Millisekunden
```tsx
// recorder state liefert Millisekunden!
const duration = Math.floor(recorderState.durationMillis / 1000);
```

### 3. Player Sync APIs
```tsx
// ❌ FALSCH
await player.seekTo(seconds);

// ✅ RICHTIG (kein async!)
player.seekTo(seconds);
```

### 4. Hook Lifecycle
```tsx
// ✅ Hooks cleanen automatisch auf
// KEIN manuelles .remove() oder .release() in useEffect cleanup nötig
const player = useAudioPlayer(uri);
// Wird automatisch beim unmount entsorgt
```

### 5. Background Mode
```tsx
// ⭐ DAS IST DER SCHLÜSSEL FÜR >2 MIN RECORDING!
await setAudioModeAsync({
  shouldPlayInBackground: true, // ← KRITISCH!
  allowsRecording: true,
  playsInSilentMode: true,
});
```

### 6. prepareToRecordAsync ist required!
```tsx
// ❌ FALSCH
recorder.record(); // Fehler ohne prepare!

// ✅ RICHTIG
await recorder.prepareToRecordAsync();
recorder.record();
```

---

## 📱 APP.CONFIG.JS - BEREITS KORREKT

```javascript
ios: {
  infoPlist: {
    UIBackgroundModes: ['audio'], // ✅ Bereits vorhanden!
  },
}
```

Kein Update nötig - Background Mode bereits aktiviert.

---

## 🚀 VORTEILE DIESER ARCHITEKTUR

✅ **Hook-basiert**: Automatisches Memory-Management
✅ **Background Support**: shouldPlayInBackground Flag
✅ **Moderner Code**: Best Practices von Expo
✅ **Real-time Updates**: Keine manuellen Intervals
✅ **Weniger Boilerplate**: Kein manuelles Cleanup
✅ **Zukunftssicher**: expo-av ist deprecated, expo-audio ist aktiv entwickelt

---

## 📊 ERFOLGS-KRITERIEN

Nach der Migration muss funktionieren:

1. **Recording**:
   - Permission Dialog erscheint
   - Recording startet ohne Fehler
   - Timer läuft korrekt
   - Recording stoppt und speichert
   - File wird ins FileSystem kopiert

2. **Background Recording** ⭐:
   - App in Background schicken
   - >2 Minuten aufnehmen
   - Recording läuft weiter
   - Korrekter Timestamp beim Stoppen

3. **Playback**:
   - Alte Aufnahmen abspielen
   - Seek funktioniert
   - Play/Pause toggle

4. **Features**:
   - Auto-Transcribe funktioniert
   - Rename funktioniert
   - Delete funktioniert

---

## 🐛 DEBUGGING TIPPS

Falls Probleme auftreten:

1. **Permission Error**:
   - Check: `await recorder.prepareToRecordAsync()` vor `record()`?
   - Check: requestRecordingPermissionsAsync() wurde called?

2. **Recording bricht ab**:
   - Check: setAudioModeAsync mit shouldPlayInBackground?
   - Check: UIBackgroundModes in app.config.js?

3. **Player lädt nicht**:
   - Check: URI ist valide?
   - Check: File existiert im FileSystem?

4. **Hook Errors**:
   - Check: Hooks nur in React Components!
   - Check: Nicht in utils/* verwenden

---

## 📝 COMMIT MESSAGE TEMPLATE

```
Migrate to expo-audio hooks for background recording (Build 18)

PHASE X: [RecordingScreen | PlayerScreen | Permissions | Utils]

Changes:
- Migrated RecordingScreen to useAudioRecorder hook
- Added setAudioModeAsync with shouldPlayInBackground: true
- Updated permission handling with requestRecordingPermissionsAsync
- Recording now works in background >2 minutes

Testing:
- [x] Recording starts/stops
- [x] Background recording >2 minutes
- [x] Playback works
- [x] Auto-transcribe works

Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🎬 NÄCHSTE SCHRITTE

1. Git reset zum letzten funktionierenden Commit (vor expo-audio Migration)
2. Phase 1: RecordingScreen.tsx migrieren
3. Lokaler Test
4. Phase 2: PlayerScreen.tsx migrieren
5. Lokaler Test
6. Weitere Phasen
7. Build 18 erstellen
8. TestFlight Upload
9. Background-Test >2 Minuten

---

**Status**: Ready to start
**Estimated Time**: 2-3 Stunden
**Risk Level**: Medium (Hooks-Umstellung, aber gut dokumentiert)
