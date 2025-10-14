# Datenschutz & Sicherheit

## Lokale Verschlüsselung
**Priorität:** Mittel
**Aufwand:** Hoch

### Beschreibung
- Optional: Alle Aufnahmen und Transkripte verschlüsseln
- Encryption-at-Rest mit AES-256
- PIN oder Biometrische Authentifizierung (Face ID / Touch ID)
- Verschlüsselte Backups
- Sichere Schlüssel-Verwaltung

### Technische Umsetzung
- expo-secure-store für Schlüssel-Management
- expo-local-authentication für Biometrie
- File-Level Encryption via react-native-encrypted-storage
- Master-Key-Konzept mit User-PIN
- Key-Derivation mit PBKDF2

### Authentifizierungs-Flow
```
App-Start
  ↓
Face ID / PIN
  ↓
[Erfolgreich] → App entsperrt
[Fehlgeschlagen] → Erneut versuchen
  ↓
Nach 5 Versuchen → App gesperrt (24h)
```

### Settings-UI
```
┌────────────────────────────────────┐
│ Sicherheit & Datenschutz           │
├────────────────────────────────────┤
│ App-Sperre                         │
│ [✓] Aktiviert                      │
│ • Methode: Face ID                 │
│ • Timeout: Sofort                  │
│                                    │
│ Verschlüsselung                    │
│ [✓] Aufnahmen verschlüsseln        │
│ [✓] Transkripte verschlüsseln      │
│                                    │
│ [PIN ändern] [Face ID einrichten]  │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich meine vertraulichen Aufnahmen verschlüsseln
- Als User möchte ich die App mit Face ID schützen
- Als User möchte ich sicherstellen, dass niemand meine Daten lesen kann

---

## Private Notizen
**Priorität:** Niedrig
**Aufwand:** Niedrig

### Beschreibung
- Zu jeder Aufnahme private Notizen hinzufügen
- Notizen werden NICHT an AI gesendet
- Verschlüsselte Speicherung (wenn Encryption aktiviert)
- Markdown-Support für Formatierung
- Separate Notiz-Section im Player-Screen

### Technische Umsetzung
- Erweiterung des Recording-Modells um `privateNotes: string`
- Separate TextInput im Player-Screen
- Exclusion von Notizen bei AI-API-Calls
- Optional: Verschlüsselung der Notizen

### UI-Design
```
┌────────────────────────────────────┐
│ 📝 Private Notizen                 │
│ ┌────────────────────────────────┐ │
│ │ Diese Notizen sind nur für    │ │
│ │ dich und werden nicht an AI   │ │
│ │ gesendet.                     │ │
│ │                               │ │
│ │ - ToDo: Follow-up Email       │ │
│ │ - Wichtig: Vertraulich!       │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Speichern]                        │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich private Notizen zu Aufnahmen hinzufügen
- Als User möchte ich sicherstellen, dass meine Notizen nicht an AI gesendet werden
- Als User möchte ich vertrauliche Informationen sicher speichern

---

## Daten-Export & Löschung
**Priorität:** Hoch
**Aufwand:** Niedrig

### Beschreibung
GDPR-konform:
- **Vollständiger Daten-Export:** Alle User-Daten als ZIP
- **Selektive Löschung:** Einzelne Aufnahmen permanent löschen
- **Account-Löschung:** Alle Daten unwiderruflich löschen
- **Lösch-Bestätigung:** Dokumentation der Löschung

### Technische Umsetzung
- Export aller Daten (Audio, Transkripte, Metadaten)
- ZIP-Archiv-Generierung
- Sicheres Löschen (Overwrite mit Random Data)
- Confirmation-Flow mit Sicherheits-Checks

### Lösch-Flow
```
[Alle Daten löschen]
  ↓
⚠️ Warnung anzeigen
  ↓
"LÖSCHEN" tippen zum Bestätigen
  ↓
Biometrische Authentifizierung
  ↓
Daten werden gelöscht...
  ↓
✓ Bestätigung + Reset App
```

### User Stories
- Als User möchte ich all meine Daten exportieren können (GDPR)
- Als User möchte ich sicherstellen, dass gelöschte Daten wirklich weg sind
- Als User möchte ich meine gesamten App-Daten löschen können

---

## Privacy-First Settings
**Priorität:** Mittel
**Aufwand:** Niedrig

### Beschreibung
Transparente Datenschutz-Einstellungen:
- **Lokale Verarbeitung:** Alles bleibt auf dem Gerät (außer AI-API)
- **API-Optionen:**
  - Option: OpenAI API Key selbst verwalten
  - Anzeige welche Daten zu OpenAI gesendet werden
  - Opt-out von Daten-Retention bei OpenAI

- **Telemetrie:**
  - Komplett deaktivierbar
  - Anonymisierte Crash-Reports (Opt-in)
  - Keine Tracking-Cookies

- **Permissions-Management:**
  - Übersicht aller App-Berechtigungen
  - Erklärung warum benötigt
  - Anleitung zum Widerrufen

### Settings-UI
```
┌────────────────────────────────────┐
│ 🔒 Datenschutz                     │
├────────────────────────────────────┤
│ Datenverarbeitung                  │
│ ✓ Alle Daten lokal gespeichert    │
│                                    │
│ OpenAI Integration                 │
│ • Nur Transkript wird gesendet     │
│ • 30-Tage-Retention (OpenAI)       │
│ [ ] Zero Data Retention aktivieren│
│                                    │
│ Analytics & Diagnostik             │
│ [ ] Anonyme Crash-Reports          │
│ [ ] Nutzungsstatistiken (lokal)    │
│                                    │
│ [Datenschutzerklärung anzeigen]    │
│ [Alle Daten exportieren]           │
│ [Account löschen]                  │
└────────────────────────────────────┘
```

### User Stories
- Als User möchte ich wissen, welche Daten wohin gesendet werden
- Als User möchte ich Tracking komplett deaktivieren können
- Als User möchte ich die volle Kontrolle über meine Daten haben

---

## Sichere Cloud-Synchronisation
**Priorität:** Niedrig
**Aufwand:** Hoch

### Beschreibung
Optional: Verschlüsselte Cloud-Sync:
- End-to-End Verschlüsselung
- Sync über iCloud Drive / eigener Server
- Zero-Knowledge-Architektur
- Konflikt-Lösung bei Multi-Device

### Technische Umsetzung
- E2E-Encryption vor Upload
- Sync-Library: WatermelonDB Sync
- Cloud-Storage: iCloud CloudKit oder eigener Backend
- Encryption-Key bleibt auf Device
- Differential Sync (nur Änderungen)

### User Stories
- Als User möchte ich meine Aufnahmen geräteübergreifend synchronisieren
- Als User möchte ich sicherstellen, dass Cloud-Daten verschlüsselt sind
- Als User möchte ich auf mehreren Geräten arbeiten können

---

## Compliance & Audit Logs
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
Für professionelle/Enterprise-User:
- Audit-Log aller Daten-Zugriffe
- Compliance-Reports (GDPR, HIPAA-ready)
- Data-Retention-Policies
- Access-Control-Logs

### Technische Umsetzung
- Logging-System für alle Daten-Operationen
- Timestamps für alle Aktionen
- Export von Audit-Logs als CSV
- Compliance-Dashboard

### Audit-Log-Beispiel
```csv
Timestamp,Action,Resource,User,Details
2025-10-14 10:30:15,READ,Recording#123,user@mail.com,Transcript accessed
2025-10-14 10:31:42,AI_CALL,Recording#123,user@mail.com,Summary generated
2025-10-14 10:35:20,DELETE,Recording#120,user@mail.com,Permanently deleted
```

### User Stories
- Als Business-User möchte ich nachvollziehen können, wann welche Daten verarbeitet wurden
- Als Compliance-Officer möchte ich Audit-Reports generieren
- Als Enterprise-Kunde möchte ich Data-Retention-Policies durchsetzen
