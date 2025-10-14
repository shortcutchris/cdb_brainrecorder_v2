# Produktivitäts-Features

## Ordner/Tags für Aufnahmen
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
- Kategorisierung von Aufnahmen (z.B. "Meetings", "Ideen", "To-Dos")
- Farbige Tags/Labels
- Filterfunktion nach Tags
- Mehrere Tags pro Aufnahme möglich

### Technische Umsetzung
- Erweiterung des Recording-Datenmodells um `tags: string[]`
- Neue Tag-Verwaltung in Settings
- Filter-UI auf HomeScreen
- Tag-Auswahl beim Erstellen/Bearbeiten von Aufnahmen

### User Stories
- Als User möchte ich meine Aufnahmen kategorisieren können
- Als User möchte ich nach bestimmten Kategorien filtern können
- Als User möchte ich eigene Tags erstellen und verwalten können

---

## Favoriten/Sternchen
**Priorität:** Mittel
**Aufwand:** Niedrig

### Beschreibung
- Wichtige Aufnahmen mit Stern markieren
- Separate Favoriten-Ansicht
- Toggle zwischen "Alle" und "Favoriten"

### Technische Umsetzung
- Erweiterung des Recording-Datenmodells um `isFavorite: boolean`
- Star-Icon in RecordingCard
- Filter-Button im Header von HomeScreen

### User Stories
- Als User möchte ich wichtige Aufnahmen schnell wiederfinden
- Als User möchte ich eine Übersicht meiner favorisierten Aufnahmen

---

## Suche/Durchsuchbarkeit
**Priorität:** Hoch
**Aufwand:** Mittel

### Beschreibung
- Volltextsuche in Transkripten
- Suche nach Aufnahme-Name
- Suche nach Datum, Dauer
- Filter kombinieren
- Highlighting von Suchtreffern im Transkript

### Technische Umsetzung
- Searchbar im Header von HomeScreen
- Suche über `recording.name` und `recording.transcript.text`
- Fuzzy Search mit Fuse.js oder ähnlicher Library
- Suchergebnis-Highlighting

### User Stories
- Als User möchte ich nach bestimmten Wörtern in meinen Aufnahmen suchen
- Als User möchte ich eine Aufnahme anhand eines Gesprächs-Snippets finden
- Als User möchte ich Suchbegriffe im Transkript hervorgehoben sehen

---

## Batch-Operationen
**Priorität:** Niedrig
**Aufwand:** Mittel

### Beschreibung
- Mehrere Aufnahmen gleichzeitig auswählen
- Bulk-Delete
- Bulk-Tag
- Bulk-Export

### Technische Umsetzung
- Selection-Mode auf HomeScreen
- Checkbox-Auswahl
- Action-Bar mit Bulk-Aktionen

### User Stories
- Als User möchte ich mehrere Aufnahmen gleichzeitig löschen können
- Als User möchte ich mehreren Aufnahmen gleichzeitig Tags zuweisen
- Als User möchte ich mehrere Aufnahmen gleichzeitig exportieren
