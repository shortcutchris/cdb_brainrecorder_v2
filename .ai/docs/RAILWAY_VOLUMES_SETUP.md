# Railway Volumes Setup Guide

## 🎯 Übersicht

Diese Anleitung beschreibt, wie du persistente Volumes in Railway einrichtest, damit deine dynamischen Daten (Dokumente, Videos, Konfigurationen) bei Deployments erhalten bleiben.

## 📋 Schritt-für-Schritt Anleitung

### 1. Railway Volume erstellen

1. Gehe zu deinem Railway Projekt Dashboard
2. Klicke auf deinen Service (cdb-voice-agent-poc)
3. Navigiere zu **Settings** → **Volumes**
4. Klicke auf **"Create Volume"**
5. Konfiguriere das Volume:
   - **Name**: `app-data`
   - **Mount path**: `/app/data`
   - **Size**: 10GB (oder mehr je nach Bedarf)
6. Klicke auf **"Create"**

### 2. Umgebungsvariablen setzen

**WICHTIG**: Bevor du deployst, musst du die benötigten Umgebungsvariablen setzen!

1. Gehe zu deinem Railway Service
2. Klicke auf **"Variables"**
3. Füge folgende Variablen hinzu:

**Pflichtfelder:**
- `OPENAI_API_KEY` - Dein OpenAI API Key
- `SESSION_SECRET` - Ein zufälliger String für Sessions (z.B. generiert mit `openssl rand -hex 32`)
- `ADMIN_USERNAME` - Admin-Benutzername
- `ADMIN_PASSWORD` - Admin-Passwort

**Optional:**
- `TAVILY_API_KEY` - Für Web-Suche Funktionen
- `PERPLEXITY_API_KEY` - Für erweiterte Suche
- `MISTRAL_API_KEY` - Für PDF OCR
- `OPENAI_VECTOR_STORE_ID` - Für Vector Search

### 3. Deployment durchführen

Nach dem Setzen der Umgebungsvariablen:

```bash
git add -A
git commit -m "feat: Railway Volumes für persistente Daten implementiert"
git push origin main
```

Railway wird automatisch:
1. Das neue Volume mounten
2. Das Init-Script ausführen
3. Alle Symlinks erstellen
4. Existierende Daten ins Volume kopieren

### 4. Verifizierung

Nach dem Deployment kannst du prüfen ob alles funktioniert:

1. **Im Railway Dashboard**: 
   - Gehe zu "Logs" und suche nach "Railway Volume initialization completed successfully!"

2. **In der Anwendung**:
   - Erstelle ein neues Dokument
   - Lade ein Intro-Video hoch
   - Füge eine neue Sprache hinzu
   - Führe ein Redeployment durch
   - → Alle Daten sollten erhalten bleiben!

## 📁 Was wird persistent gespeichert?

### Dokumente & Knowledge Base
- `/app/data/knowledge/documents/` - Alle Markdown-Dokumente
- `/app/data/knowledge/metadata.json` - Dokument-Metadaten
- `/app/data/knowledge/backups/` - Komprimierte Backups

### Medien
- `/app/data/media/videos/intro/` - Intro-Videos für alle Sprachen
- `/app/data/media/images/` - Zukünftige Bild-Uploads

### Konfigurationen
- `/app/data/config/languages.json` - Sprachkonfiguration
- `/app/data/prompts/prompts.json` - System-Prompts
- `/app/data/prompts/backups/` - Prompt-Backups

### Übersetzungen
- `/app/data/locales/frontend/` - Frontend UI-Übersetzungen
- `/app/data/locales/admin/` - Admin UI-Übersetzungen
- `/app/data/locales/backend/` - Backend-Übersetzungen

### Logs
- `/app/data/logs/` - Server-Logs und MCP-Logs

## 🔧 Technische Details

### Init-Script Funktionsweise

Das Script (`scripts/init-railway-volumes.sh`) macht folgendes:

1. **Prüft Railway-Umgebung**: Nur aktiv wenn `RAILWAY_ENVIRONMENT=production`
2. **Erstellt Verzeichnisstruktur**: Alle benötigten Ordner im Volume
3. **Kopiert Default-Dateien**: Bei erstem Start aus Git ins Volume
4. **Migriert existierende Daten**: Verschiebt vorhandene Dateien ins Volume
5. **Erstellt Symlinks**: Verlinkt Original-Pfade zum Volume

### Symlink-Mapping

| Original-Pfad | Volume-Pfad |
|--------------|-------------|
| `/app/config/languages.json` | `/app/data/config/languages.json` |
| `/app/public/assets/knowledge/` | `/app/data/knowledge/documents/` |
| `/app/public/assets/videos/intro/` | `/app/data/media/videos/intro/` |
| `/app/public/assets/locales/` | `/app/data/locales/frontend/` |
| `/app/public/assets/admin-locales/` | `/app/data/locales/admin/` |
| `/app/public/assets/config/prompts.json` | `/app/data/prompts/prompts.json` |

## 🚨 Wichtige Hinweise

### Erstes Deployment
- Beim ersten Deployment mit Volumes werden existierende Daten automatisch migriert
- Das Init-Script erkennt vorhandene Dateien und kopiert sie ins Volume
- Keine Daten gehen verloren!

### Backup-Empfehlung
Vor dem ersten Volume-Deployment:
1. Sichere alle wichtigen Daten (Dokumente, Videos, Konfigurationen)
2. Railway bietet auch Volume-Snapshots an (kostenpflichtig)

### Lokale Entwicklung
- Lokal funktioniert alles wie bisher (keine Volumes)
- Das Init-Script wird nur in Railway ausgeführt
- Teste mit: `npm run init:volumes` (simuliert Railway-Umgebung)

### Performance
- Symlinks haben keine Performance-Nachteile
- Volume-Zugriff ist genauso schnell wie lokale Dateien
- Railway Volumes sind SSD-basiert

## 🛠️ Fehlerbehebung

### Volume wird nicht gemountet
- Prüfe ob das Volume korrekt erstellt wurde
- Mount-Path muss exakt `/app/data` sein
- Service neu deployen nach Volume-Erstellung

### Dateien werden nicht gefunden
- Check die Logs für Symlink-Erstellung
- Prüfe ob Init-Script erfolgreich lief
- Railway Shell nutzen: `ls -la /app/data`

### Permissions-Fehler
- Das Init-Script setzt automatisch 755 Permissions
- Bei Problemen: Railway Shell → `chmod -R 755 /app/data`

## 📊 Volume-Verwaltung

### Größe prüfen
Im Railway Dashboard unter Volumes siehst du:
- Aktuell genutzer Speicher
- Verfügbarer Speicher
- Performance-Metriken

### Volume vergrößern
1. Settings → Volumes → dein Volume
2. "Resize" klicken
3. Neue Größe eingeben
4. Kein Redeployment nötig!

### Daten exportieren
Für Backups oder Migration:
```bash
# Railway CLI verwenden
railway run bash
cd /app/data
tar -czf backup.tar.gz .
# Dann via SFTP/SCP herunterladen
```

## ✅ Checkliste für erfolgreiche Einrichtung

- [ ] Volume in Railway erstellt (Name: `app-data`, Mount: `/app/data`)
- [ ] Code gepusht mit railway.json und init-script
- [ ] Deployment erfolgreich (Logs prüfen)
- [ ] Init-Script lief erfolgreich (siehe Logs)
- [ ] Test: Neues Dokument erstellen
- [ ] Test: Redeployment → Dokument noch da?
- [ ] Test: Video hochladen
- [ ] Test: Neue Sprache hinzufügen

---

Bei Fragen oder Problemen: Check die Railway Logs oder erstelle ein Issue im Repository!