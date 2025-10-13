# Railway CLI Volume Setup Guide

## 🚀 Automatisches Setup mit Railway CLI

Diese Anleitung zeigt dir, wie du Railway Volumes mit dem CLI Tool einrichtest.

## 📋 Voraussetzungen

- Git installiert
- Node.js/npm (optional, für CLI Installation)
- Railway Account

## 🛠️ Installation Railway CLI

### Windows
```bash
# Option 1: Mit npm
npm install -g @railway/cli

# Option 2: Mit Scoop
scoop install railway

# Option 3: Download von Website
# https://docs.railway.com/develop/cli#installation
```

### macOS
```bash
# Option 1: Mit Homebrew
brew install railway

# Option 2: Mit npm
npm install -g @railway/cli

# Option 3: Install Script
curl -fsSL https://railway.app/install.sh | sh
```

### Linux
```bash
# Option 1: Install Script
curl -fsSL https://railway.app/install.sh | sh

# Option 2: Mit npm
npm install -g @railway/cli
```

## 🔧 Automatisches Setup ausführen

### Windows
```bash
# Im Projekt-Verzeichnis ausführen
./scripts/railway-setup.bat
```

### macOS/Linux
```bash
# Ausführbar machen
chmod +x ./scripts/railway-setup.sh

# Ausführen
./scripts/railway-setup.sh
```

## 📝 Was das Setup-Script macht

1. **Railway CLI prüfen/installieren**
   - Prüft ob CLI installiert ist
   - Zeigt Installationsoptionen

2. **Login zu Railway**
   ```bash
   railway login
   ```

3. **Projekt verlinken**
   ```bash
   railway link
   ```

4. **Production Environment wählen**
   ```bash
   railway environment production
   ```

5. **Volume-Erstellung** (manuell im Dashboard)
   - Name: `app-data`
   - Mount: `/app/data`
   - Size: 10GB

6. **Git Changes committen**
   ```bash
   git add -A
   git commit -m "feat: Railway Volumes für persistente Daten"
   ```

7. **Deployment starten**
   ```bash
   railway up
   ```

## 🎯 Manuelle CLI-Befehle

Falls du das Setup manuell durchführen möchtest:

### 1. Login und Projekt-Setup
```bash
# Login
railway login

# Projekt verlinken (im Projekt-Verzeichnis)
railway link

# Status prüfen
railway status

# Environment wählen
railway environment production
```

### 2. Volume verwalten (Limited CLI Support)
```bash
# Volumes listen
railway volume list

# Volume Details (wenn bereits erstellt)
railway volume list --json
```

**Hinweis**: Railway CLI unterstützt noch kein `railway volume add`. Volumes müssen im Dashboard erstellt werden.

### 3. Deployment
```bash
# Deploy starten
railway up

# Logs anzeigen
railway logs

# Logs folgen (live)
railway logs -f

# Shell öffnen
railway shell
```

### 4. Umgebungsvariablen
```bash
# Alle Variables anzeigen
railway variables

# Variable setzen
railway variables set KEY=value

# Variable löschen
railway variables delete KEY
```

## 🔍 Debugging & Troubleshooting

### Logs prüfen
```bash
# Letzte 100 Zeilen
railway logs -n 100

# Live logs
railway logs -f

# Nach Init-Meldung suchen
railway logs | grep "Railway Volume initialization"
```

### Shell-Zugriff
```bash
# Shell im Container öffnen
railway shell

# Volume-Inhalt prüfen
ls -la /app/data/
```

### Service neustarten
```bash
# Service stoppen
railway down

# Service starten
railway up
```

## 📊 Volume-Status prüfen

Nach dem Deployment:

```bash
# In Railway Shell
railway shell

# Volume-Struktur anzeigen
find /app/data -type d

# Dokumente zählen
find /app/data/knowledge/documents -name "*.md" | wc -l

# Videos zählen
find /app/data/media/videos/intro -name "*.mp4" | wc -l

# Speicherplatz prüfen
df -h /app/data
```

## 🚨 Wichtige Hinweise

### Railway CLI Limitierungen

Aktuell (2024) unterstützt Railway CLI noch nicht:
- ❌ `railway volume add` - Volumes erstellen
- ❌ `railway volume attach` - Volumes anhängen
- ❌ Volume-Größe über CLI ändern

Diese Aktionen müssen im Dashboard durchgeführt werden.

### Best Practices

1. **Immer Production Environment nutzen**
   ```bash
   railway environment production
   ```

2. **Logs während Deployment beobachten**
   ```bash
   railway logs -f
   ```

3. **Vor großen Änderungen Backup machen**
   ```bash
   railway shell
   cd /app/data
   tar -czf backup-$(date +%Y%m%d).tar.gz .
   ```

## 🔗 Nützliche Links

- [Railway CLI Docs](https://docs.railway.com/develop/cli)
- [Railway Volumes Guide](https://docs.railway.com/guides/volumes)
- [Railway Dashboard](https://railway.app)

## ✅ Fertig!

Nach erfolgreichem Setup:
- ✅ Alle Dokumente bleiben bei Redeployments erhalten
- ✅ Videos werden persistent gespeichert
- ✅ Sprachkonfigurationen überleben Updates
- ✅ Keine manuellen Backups mehr nötig

Bei Problemen: Check die Logs mit `railway logs` oder öffne ein Issue!