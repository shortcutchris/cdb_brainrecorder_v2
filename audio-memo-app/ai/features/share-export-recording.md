# Feature: Share/Export Recording (iOS Share Sheet)

**Status**: 📋 Planning
**Priority**: High
**Target Build**: 19
**Complexity**: Low
**Estimated Time**: 1-2 hours

---

## 📝 Feature Description

Erweiterung des Kontextmenüs (⋮) in `RecordingItem` um eine **"Teilen"** Option, die den iOS Share Sheet öffnet und die Audio-Datei zum Export/Teilen bereitstellt.

### User Story

> Als User möchte ich eine Aufnahme aus der App heraus teilen können (via WhatsApp, Mail, AirDrop, Files, etc.), damit ich die Audio-Datei außerhalb der App nutzen kann.

---

## 🎯 Requirements

### Functional Requirements

1. **Menu Item hinzufügen**
   - Neuer Menüpunkt "Teilen" im Kontextmenü (⋮)
   - Icon: `share-outline` (Ionicons)
   - Position: Am Ende des Menüs (nach AI Custom Prompt)
   - Immer verfügbar (keine Abhängigkeit von Transkript-Status)

2. **Share Sheet öffnen**
   - Nutzt nativen iOS Share Sheet
   - Teilt die Audio-Datei (.m4a) direkt
   - Dateiname: Name der Aufnahme als Dateiname

3. **Teilen-Optionen**
   - AirDrop
   - Mail
   - Messages (WhatsApp, Telegram, etc.)
   - In Dateien speichern
   - Andere Apps (Voice Memos, Drive, Dropbox, etc.)

### Non-Functional Requirements

1. **Performance**: Share Sheet öffnet sich instant (<100ms)
2. **Error Handling**: Fehlermeldung wenn Datei nicht existiert
3. **i18n**: Vollständig übersetzt (DE/EN)
4. **Accessibility**: VoiceOver Support

---

## 🛠 Technical Approach

### Expo Sharing API

Expo bietet ein dediziertes Modul für das native Sharing:

```typescript
import * as Sharing from 'expo-sharing';

// Check if sharing is available
const isAvailable = await Sharing.isAvailableSyncAsync();

// Share file
await Sharing.shareAsync(uri, {
  mimeType: 'audio/x-m4a',
  dialogTitle: recording.name,
  UTI: 'public.audio' // iOS Universal Type Identifier
});
```

### Installation

```bash
npx expo install expo-sharing
```

### Platform Support

- ✅ iOS (native UIActivityViewController)
- ✅ Android (native Intent.ACTION_SEND)
- ❌ Web (graceful fallback)

### File Format

Die App speichert Aufnahmen bereits als `.m4a` Dateien:
- Location: `FileSystem.documentDirectory`
- Format: M4A (AAC Audio)
- Quality: High (44100 Hz, 128 kbps)

---

## 📐 Implementation Plan

### Step 1: Install Dependency

```bash
npx expo install expo-sharing
```

### Step 2: Update `RecordingItem.tsx`

#### 2.1 Import hinzufügen

```typescript
import * as Sharing from 'expo-sharing';
```

#### 2.2 Share Handler erstellen

```typescript
const handleShare = async () => {
  try {
    setShowMenuModal(false);

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        t('common:recordingItem.sharingUnavailableTitle'),
        t('common:recordingItem.sharingUnavailableMessage')
      );
      return;
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(recording.uri);
    if (!fileInfo.exists) {
      Alert.alert(
        t('common:recordingItem.fileNotFoundTitle'),
        t('common:recordingItem.fileNotFoundMessage')
      );
      return;
    }

    // Share file
    await Sharing.shareAsync(recording.uri, {
      mimeType: 'audio/x-m4a',
      dialogTitle: recording.name,
      UTI: 'public.audio'
    });
  } catch (error) {
    console.error('Error sharing recording:', error);
    Alert.alert(
      t('common:recordingItem.shareErrorTitle'),
      t('common:recordingItem.shareErrorMessage')
    );
  }
};
```

#### 2.3 Menu Item hinzufügen

Position: Nach AI Custom Prompt, vor Modal-Ende

```typescript
<View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

{/* Share/Export Recording */}
<TouchableOpacity
  onPress={handleShare}
  style={styles.menuItem}
>
  <Ionicons
    name="share-outline"
    size={24}
    color={colors.primary}
  />
  <View style={styles.menuItemTextContainer}>
    <Text style={[styles.menuItemTitle, { color: colors.text }]}>
      {t('common:recordingItem.share')}
    </Text>
    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
      {t('common:recordingItem.shareDescription')}
    </Text>
  </View>
</TouchableOpacity>
```

### Step 3: Add i18n Translations

#### DE (`locales/de/common.json`)

```json
{
  "recordingItem": {
    // ... existing translations
    "share": "Teilen",
    "shareDescription": "Audio-Datei exportieren",
    "sharingUnavailableTitle": "Teilen nicht verfügbar",
    "sharingUnavailableMessage": "Das Teilen von Dateien wird auf diesem Gerät nicht unterstützt.",
    "fileNotFoundTitle": "Datei nicht gefunden",
    "fileNotFoundMessage": "Die Audio-Datei konnte nicht gefunden werden.",
    "shareErrorTitle": "Fehler beim Teilen",
    "shareErrorMessage": "Die Aufnahme konnte nicht geteilt werden."
  }
}
```

#### EN (`locales/en/common.json`)

```json
{
  "recordingItem": {
    // ... existing translations
    "share": "Share",
    "shareDescription": "Export audio file",
    "sharingUnavailableTitle": "Sharing unavailable",
    "sharingUnavailableMessage": "File sharing is not supported on this device.",
    "fileNotFoundTitle": "File not found",
    "fileNotFoundMessage": "The audio file could not be found.",
    "shareErrorTitle": "Sharing failed",
    "shareErrorMessage": "The recording could not be shared."
  }
}
```

### Step 4: Update `app.config.js` (if needed)

**Hinweis:** `expo-sharing` benötigt KEINE spezielle Konfiguration in `app.config.js`. Es funktioniert out-of-the-box.

---

## 🎨 UI/UX Details

### Menu Item Design

```
┌─────────────────────────────────┐
│  [📄] Transkript              │
│      Sprache in Text umwandeln  │
├─────────────────────────────────┤
│  [✨] AI Zusammenfassung        │
│      Automatische Zusammenfassung│
├─────────────────────────────────┤
│  [💬] AI Custom Prompt          │
│      Eigene Anweisungen ausführen│
├─────────────────────────────────┤
│  [↗️] Teilen                     │  ← NEU
│      Audio-Datei exportieren    │
└─────────────────────────────────┘
```

### iOS Share Sheet

```
┌─────────────────────────────────┐
│  "Aufnahme 14.10 15:30"        │  ← Dateiname
├─────────────────────────────────┤
│  [📧] Mail                      │
│  [💬] Messages                  │
│  [📱] AirDrop                   │
│  [📁] In Dateien speichern      │
│  [☁️] iCloud Drive              │
│  [📤] Weitere...                │
└─────────────────────────────────┘
```

### User Flow

1. User tippt auf **⋮** (drei Punkte)
2. Menu Modal öffnet sich
3. User tippt auf **"Teilen"**
4. Menu Modal schließt sich
5. **iOS Share Sheet** öffnet sich
6. User wählt Ziel (WhatsApp, Mail, etc.)
7. Datei wird geteilt
8. Success Feedback (vom OS)

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] Share Button erscheint im Kontextmenü
- [ ] iOS Share Sheet öffnet sich
- [ ] Audio-Datei wird korrekt geteilt
- [ ] Dateiname stimmt mit Recording-Name überein
- [ ] Datei ist als .m4a erkennbar
- [ ] Sharing funktioniert mit:
  - [ ] AirDrop
  - [ ] Mail
  - [ ] Messages
  - [ ] WhatsApp
  - [ ] Telegram
  - [ ] Files App (In Dateien speichern)
  - [ ] Voice Memos
  - [ ] iCloud Drive

### Error Handling Tests

- [ ] Fehlermeldung wenn Datei nicht existiert
- [ ] Fehlermeldung wenn Sharing nicht verfügbar
- [ ] Graceful handling bei Share-Abbruch (User tippt "Cancel")

### i18n Tests

- [ ] Deutsche Texte korrekt (share, shareDescription, errors)
- [ ] Englische Texte korrekt
- [ ] Sprachenwechsel funktioniert

### UI/UX Tests

- [ ] Menu Item ist gut lesbar (Light + Dark Mode)
- [ ] Icon ist passend und gut sichtbar
- [ ] Menu schließt sich vor Share Sheet
- [ ] Keine UI-Overlaps oder Glitches

### Platform Tests

- [ ] iOS (TestFlight Build)
- [ ] Android (Preview Build)
- [ ] Web (graceful degradation)

---

## 🚀 Rollout Plan

### Phase 1: Development
1. Install `expo-sharing`
2. Implement share functionality in `RecordingItem.tsx`
3. Add i18n translations
4. Local testing in Expo Go

### Phase 2: Testing
1. Create TestFlight Build 19
2. Test auf realem iOS Device:
   - Verschiedene Share-Targets
   - Error Scenarios
   - Dark Mode
3. Collect Feedback

### Phase 3: Release
1. Finalize translations
2. Update Changelog
3. Deploy to TestFlight Beta-Tester

---

## 📊 Success Metrics

### Quantitative
- [ ] Feature in Build 19 deployed
- [ ] 0 crashes related to sharing
- [ ] <100ms latency to open Share Sheet

### Qualitative
- [ ] Beta-Tester Feedback: Feature wird genutzt
- [ ] No UX complaints
- [ ] Use Case: Teilen von Aufnahmen außerhalb der App

---

## 🔗 Related Features (Future)

### Potential Extensions

1. **Batch Export**
   - Mehrere Aufnahmen gleichzeitig teilen
   - Zip-Archive erstellen

2. **Cloud Sync**
   - Automatisches Backup zu iCloud/Google Drive
   - Settings: "Auto-Upload nach Aufnahme"

3. **Export Formats**
   - Transkript als PDF exportieren
   - Zusammenfassung als Text-Datei

4. **Share with Transcript**
   - Audio + Transkript als Combined Share
   - Optional: Als PDF mit embedded Audio

---

## 📚 Resources

### Expo Documentation
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)

### iOS Documentation
- [UIActivityViewController](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)
- [Universal Type Identifiers (UTI)](https://developer.apple.com/documentation/uniformtypeidentifiers)

### Code References
- `RecordingItem.tsx:260-395` - Menu Modal
- `RecordingItem.tsx:29-37` - Component Props
- `locales/de/common.json` - German translations
- `locales/en/common.json` - English translations

---

## ✅ Checklist for Implementation

- [ ] Install `expo-sharing`
- [ ] Update `RecordingItem.tsx`:
  - [ ] Import `expo-sharing`
  - [ ] Implement `handleShare` function
  - [ ] Add share menu item
- [ ] Add i18n translations (DE + EN)
- [ ] Test in Expo Go
- [ ] Create TestFlight Build 19
- [ ] Test on physical device
- [ ] Update README.md Changelog
- [ ] Git commit & push
- [ ] Deploy to Beta Testers

---

**Created**: 14. Oktober 2025
**Last Updated**: 14. Oktober 2025
**Author**: Hans Christian Hubmann + Claude Code
