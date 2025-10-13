# markdowncleaner - Dokumentation

## Übersicht

`markdowncleaner` ist ein Python-Tool zur Bereinigung und Formatierung von Markdown-Dokumenten. Die Standardkonfiguration ist optimiert für PDFs akademischer Papiere, die zu Markdown konvertiert wurden.

**Hauptfunktionen:**
- Entfernung unerwünschter Inhalte (Referenzen, Bibliographien, Zitationen)
- Bereinigung von Fußnoten und Endnoten-Referenzen
- Entfernung von Copyright-Hinweisen und rechtlichen Disclaimern
- Entfernung von Acknowledgements und Funding-Informationen
- Bereinigung von Autor-Informationen und Kontaktdaten
- Entfernung spezifischer Patterns (DOIs, URLs, E-Mails)
- Entfernung kurzer Zeilen und übermäßiger Leerzeichen
- Entfernung doppelter Überschriften
- Korrektur von PDF-Konvertierungs-Artefakten

---

## Installation

```bash
pip install markdowncleaner
```

---

## Grundlegende Verwendung

### Markdown-Datei bereinigen

```python
from markdowncleaner import MarkdownCleaner
from pathlib import Path

# Cleaner mit Default-Patterns erstellen
cleaner = MarkdownCleaner()

# Markdown-Datei bereinigen
result_path = cleaner.clean_markdown_file(Path("input.md"))
print(f"Bereinigte Datei: {result_path}")
```

**Standardverhalten:**
- Erzeugt eine neue Datei mit dem Suffix `_cleaned` im gleichen Verzeichnis
- Beispiel: `input.md` → `input_cleaned.md`

### Markdown-String bereinigen

```python
from markdowncleaner import MarkdownCleaner

cleaner = MarkdownCleaner()

# Markdown-Text bereinigen
text = """
# Title
Some content here. [1]

References
1. Citation
"""

cleaned_text = cleaner.clean_markdown_string(text)
print(cleaned_text)
```

### Output-Pfad anpassen

```python
from pathlib import Path

# Option 1: Eigenes Output-Verzeichnis
result = cleaner.clean_markdown_file(
    Path("input.md"),
    output_path=Path("cleaned_docs/")
)

# Option 2: Exakter Output-Pfad mit eigenem Dateinamen
result = cleaner.clean_markdown_file(
    Path("input.md"),
    output_file=Path("cleaned_docs/my_clean_document.md")
)
```

---

## Erweiterte Konfiguration

### CleanerOptions anpassen

```python
from markdowncleaner import MarkdownCleaner, CleanerOptions

# Custom Options erstellen
options = CleanerOptions()
options.remove_short_lines = True
options.min_line_length = 50  # Kürzere minimale Zeilenlänge
options.remove_duplicate_headlines = False  # Doppelte Überschriften behalten
options.remove_footnotes_in_text = True
options.contract_empty_lines = True
options.crimp_linebreaks = True  # PDF-Linebreak-Fehler korrigieren

# Cleaner mit Custom Options initialisieren
cleaner = MarkdownCleaner(options=options)
```

### Eigene Cleaning-Patterns verwenden

```python
from markdowncleaner import MarkdownCleaner, CleaningPatterns
from pathlib import Path

# Custom Patterns aus YAML-Datei laden
custom_patterns = CleaningPatterns.from_yaml(Path("my_patterns.yaml"))

# Cleaner mit Custom Patterns initialisieren
cleaner = MarkdownCleaner(patterns=custom_patterns)
```

---

## CleanerOptions - Alle Parameter

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `remove_short_lines` | bool | `True` | Entfernt Zeilen kürzer als `min_line_length` |
| `min_line_length` | int | `70` | Minimale Zeilenlänge in Zeichen |
| `remove_whole_lines` | bool | `True` | Entfernt Zeilen, die spezifische Patterns matchen |
| `remove_sections` | bool | `True` | Entfernt ganze Sektionen basierend auf Überschriften |
| `remove_duplicate_headlines` | bool | `True` | Entfernt doppelte Überschriften |
| `remove_duplicate_headlines_threshold` | int | `2` | Schwellenwert für doppelte Überschriften |
| `remove_footnotes_in_text` | bool | `True` | Entfernt Fußnoten-Referenzen im Text (z.B. `.1`) |
| `replace_within_lines` | bool | `True` | Ersetzt spezifische Patterns innerhalb von Zeilen |
| `remove_within_lines` | bool | `True` | Entfernt spezifische Patterns innerhalb von Zeilen |
| `contract_empty_lines` | bool | `True` | Normalisiert Whitespace (max. 1 Leerzeile) |
| `crimp_linebreaks` | bool | `True` | Verbessert Line-Break-Formatierung |

---

## Default Cleaning Patterns

Die Default-Patterns sind in `default_cleaning_patterns.yaml` definiert:

### Sections to Remove (Sektionen zum Entfernen)

Folgende Sektionen werden vollständig entfernt:
- **Acknowledgements / Acknowledgments**
- **References / Bibliography / Works Cited**
- **Funding / Funding information**
- **Author Biography / Author Biographies**
- **Declaration of Competing Interest**
- **Correspondence**
- **Index**
- **Appendix**
- **Contents / Table of Contents**
- **Keywords**
- **Endnotes / Notes**
- **Preface**
- **Contributors / About the Contributors**

### Bad Inline Patterns (Inline-Patterns zum Entfernen)

- **Zitations-Nummern:** `[1]`, `[2,3]`, `[10,11,12]`
- **Referenzen:** `(see ...)`, `(Figure 1)`, `(Table 2)`
- **Section/Chapter-Referenzen:** `(Section 3)`, `(Chapter 5)`
- **Seiten-Referenzen:** `(p.123)`

### Bad Lines Patterns (Zeilen zum Entfernen)

**Copyright & Legal:**
- `All Rights Reserved`
- `Copyright 2024 by ...`
- Copyright-Symbole: `©`, `®`, `™`

**Akademische Metadaten:**
- `Received: ...`, `Accepted: ...`
- `doi:`, DOI-Patterns, `arxiv:`
- `ISSN`, `ISBN`
- `Keywords`, `Key words:`
- `Published online:`, `Published by:`
- Grant-Nummern und NSF-Funding

**Kontaktinformationen:**
- E-Mail-Adressen
- URLs (http/https)
- Department-Informationen

**Figures & Tables:**
- `Figure 1:`, `Table 2:`
- Zeilen, die nur mit Figure/Table beginnen

**Sonstige:**
- Zeilen nur in Großbuchstaben
- HTML-Kommentare `<!-- ... -->`
- Sehr kurze gemischte Zeilen
- Spezielle Symbole: `†`, `‡`

### Footnote Patterns

Entfernt Fußnoten-Nummern am Satzende:
- Beispiel: `This is a sentence.1` → `This is a sentence.`
- Pattern: Punkt + optionales Leerzeichen + Ziffer(n)

### Replacements (Ersetzungen)

**PDF-Glyph-Korrekturen:**
- `GLYPH<28>` → `fi`
- `GLYPH<29>` → `fl`
- `GLYPH<3>` → `*`
- `GLYPH<21>` → `-`
- `GLYPH<22>` → `—`
- `/uniFB01` → `fi`
- `/uniFB02` → `fl`
- `&amp;` → `&`

---

## Eigene Pattern-Datei erstellen

### YAML-Struktur

```yaml
sections_to_remove:
  - "Acknowledgements"
  - "References\\s?$"
  - "Bibliography"

bad_inline_patterns:
  - "\\[\\d+\\]"  # [1], [2], etc.
  - "\\(see.*?\\)"  # (see Figure 1)

bad_lines_patterns:
  - "Copyright \\d{4}"
  - "doi:"
  - "https?://[^\\s]+"

footnote_patterns:
  - "\\.\\s?(\\d{1,3})"

replacements:
  'GLYPH<28>': 'fi'
  'GLYPH<29>': 'fl'
```

### Pattern-Datei verwenden

```python
from pathlib import Path
from markdowncleaner import MarkdownCleaner, CleaningPatterns

# Lade eigene Patterns
patterns = CleaningPatterns.from_yaml(Path("my_patterns.yaml"))

# Verwende diese Patterns
cleaner = MarkdownCleaner(patterns=patterns)
result = cleaner.clean_markdown_file(Path("input.md"))
```

---

## Besondere Funktionen

### 1. Crimp Linebreaks (PDF-Linebreak-Korrektur)

Korrigiert zwei häufige PDF-Konvertierungs-Fehler:

**Problem 1: Getrennte Wörter mit Bindestrich**
```markdown
# Vorher
This is a hyphen-
ated word that continues.

# Nachher
This is a hyphenated word that continues.
```

**Problem 2: Fälschlich getrennte Absätze**
```markdown
# Vorher
This sentence ends with a letter

and continues here.

# Nachher
This sentence ends with a letter and continues here.
```

**Aktivierung:**
```python
options = CleanerOptions()
options.crimp_linebreaks = True  # Standard: True
```

### 2. Duplicate Headlines (Doppelte Überschriften)

Entfernt Überschriften, die mehrfach vorkommen (z.B. auf jeder PDF-Seite wiederholt).

```python
options = CleanerOptions()
options.remove_duplicate_headlines = True
options.remove_duplicate_headlines_threshold = 2  # Entfernt wenn >2x vorkommt
```

### 3. Short Lines (Kurze Zeilen)

Entfernt zu kurze Zeilen, die oft Artefakte sind.

**Ausnahmen:**
- Leere Zeilen werden behalten
- Überschriften (beginnen mit `#`) werden behalten

```python
options = CleanerOptions()
options.remove_short_lines = True
options.min_line_length = 70  # Standard: 70 Zeichen
```

### 4. Text Encoding Fix (ftfy)

Automatische Korrektur von Mojibake (kaputte Zeichenkodierung):

```python
# Wird automatisch angewendet wenn Encoding-Fehler erkannt werden
# Beispiel: "cafÃ©" → "café"
```

### 5. Quote Normalization

Normalisiert alle Arten von Anführungszeichen:

```markdown
# Vorher
„Deutsche Anführungszeichen"
«Französische Guillemets»
"Typographische Quotes"

# Nachher
"Standardisierte Quotes"
"Standardisierte Quotes"
"Standardisierte Quotes"
```

---

## Praxisbeispiele

### Beispiel 1: Minimale Konfiguration (nur Essentials)

```python
from markdowncleaner import MarkdownCleaner, CleanerOptions

options = CleanerOptions()
options.remove_short_lines = False  # Kurze Zeilen behalten
options.remove_sections = True      # Unwichtige Sektionen entfernen
options.remove_duplicate_headlines = True
options.crimp_linebreaks = True     # PDF-Artefakte korrigieren

cleaner = MarkdownCleaner(options=options)
cleaner.clean_markdown_file(Path("paper.md"))
```

### Beispiel 2: Aggressive Bereinigung (Maximum Cleaning)

```python
from markdowncleaner import MarkdownCleaner, CleanerOptions

options = CleanerOptions()
options.remove_short_lines = True
options.min_line_length = 80  # Sehr aggressiv
options.remove_whole_lines = True
options.remove_sections = True
options.remove_duplicate_headlines = True
options.remove_duplicate_headlines_threshold = 1  # Bereits bei 2x entfernen
options.remove_footnotes_in_text = True
options.replace_within_lines = True
options.remove_within_lines = True
options.contract_empty_lines = True
options.crimp_linebreaks = True

cleaner = MarkdownCleaner(options=options)
cleaner.clean_markdown_file(Path("paper.md"))
```

### Beispiel 3: Nur Formatierung (keine Content-Entfernung)

```python
from markdowncleaner import MarkdownCleaner, CleanerOptions

options = CleanerOptions()
options.remove_short_lines = False
options.remove_whole_lines = False
options.remove_sections = False
options.remove_duplicate_headlines = False
options.remove_footnotes_in_text = False
options.remove_within_lines = False
options.contract_empty_lines = True      # Nur Whitespace
options.crimp_linebreaks = True          # Nur Linebreaks
options.replace_within_lines = True      # Nur Glyphs

cleaner = MarkdownCleaner(options=options)
cleaner.clean_markdown_file(Path("paper.md"))
```

### Beispiel 4: Batch-Verarbeitung

```python
from pathlib import Path
from markdowncleaner import MarkdownCleaner

cleaner = MarkdownCleaner()
input_dir = Path("raw_markdown/")
output_dir = Path("cleaned_markdown/")

# Alle .md Dateien im Verzeichnis bereinigen
for md_file in input_dir.glob("*.md"):
    print(f"Bereinige: {md_file.name}")
    cleaner.clean_markdown_file(
        md_file,
        output_path=output_dir
    )
```

### Beispiel 5: String-Verarbeitung in Pipeline

```python
from markdowncleaner import MarkdownCleaner

def process_document(raw_markdown: str) -> str:
    """Verarbeitet Markdown in einer Pipeline"""
    
    # 1. Eigene Pre-Processing-Schritte
    processed = raw_markdown.replace("OLD_PATTERN", "NEW_PATTERN")
    
    # 2. markdowncleaner anwenden
    cleaner = MarkdownCleaner()
    cleaned = cleaner.clean_markdown_string(processed)
    
    # 3. Eigene Post-Processing-Schritte
    final = cleaned.strip()
    
    return final

# Verwendung
result = process_document(my_markdown_text)
```

---

## Integration in DocLink

### Empfohlene Konfiguration für DocLink

```python
from markdowncleaner import MarkdownCleaner, CleanerOptions

def get_doclink_cleaner() -> MarkdownCleaner:
    """Erstellt einen für DocLink optimierten Cleaner"""
    
    options = CleanerOptions()
    
    # Essentials für PDF-Dokumente
    options.crimp_linebreaks = True          # WICHTIG für PDFs!
    options.contract_empty_lines = True      # Whitespace normalisieren
    options.remove_short_lines = True
    options.min_line_length = 50             # Etwas weniger aggressiv
    
    # Akademische Metadaten entfernen
    options.remove_sections = True           # References, etc. entfernen
    options.remove_footnotes_in_text = True  # Fußnoten bereinigen
    options.remove_whole_lines = True        # DOIs, URLs, etc.
    options.remove_within_lines = True       # Inline-Zitationen
    
    # Optional: Doppelte Überschriften
    options.remove_duplicate_headlines = True
    options.remove_duplicate_headlines_threshold = 2
    
    # Encoding & Replacements
    options.replace_within_lines = True      # PDF-Glyphs korrigieren
    
    return MarkdownCleaner(options=options)

# Verwendung in DocLink
cleaner = get_doclink_cleaner()
cleaned_markdown = cleaner.clean_markdown_string(extracted_markdown)
```

### Pipeline-Integration

```python
class DocLinkPipeline:
    def __init__(self):
        self.cleaner = get_doclink_cleaner()
    
    def process_pdf(self, pdf_path: Path) -> str:
        # 1. PDF zu Markdown extrahieren
        raw_markdown = extract_markdown_from_pdf(pdf_path)
        
        # 2. Markdown bereinigen
        cleaned_markdown = self.cleaner.clean_markdown_string(raw_markdown)
        
        # 3. Weitere Verarbeitung...
        return cleaned_markdown
```

---

## Tipps & Best Practices

### 🎯 Wann sollte man markdowncleaner verwenden?

**✅ JA bei:**
- PDFs von akademischen Papieren
- Konvertierten Büchern (PDF → Markdown)
- Dokumenten mit vielen Metadaten
- Texten mit PDF-Konvertierungs-Artefakten
- Content-fokussierten Workflows (ohne Referenzen)

**❌ NEIN bei:**
- Nativ digitalen Markdown-Dateien
- Wenn Metadaten behalten werden müssen
- Wenn References/Bibliography wichtig sind
- Wenn die Extraktion bereits sehr sauber ist

### 🔧 Optimierung

**Start konservativ:**
```python
# Beginne mit minimaler Konfiguration
options = CleanerOptions()
options.remove_sections = True
options.crimp_linebreaks = True
options.contract_empty_lines = True
```

**Iterativ erweitern:**
- Prüfe das Output
- Aktiviere schrittweise weitere Options
- Passe `min_line_length` an deine Dokumente an
- Erstelle eigene Patterns bei Bedarf

### 📊 Qualitätskontrolle

```python
# Vorher/Nachher-Vergleich
with open("input.md", "r") as f:
    original = f.read()
    print(f"Original: {len(original)} Zeichen")

cleaner = MarkdownCleaner()
cleaned = cleaner.clean_markdown_string(original)
print(f"Bereinigt: {len(cleaned)} Zeichen")
print(f"Reduktion: {len(original) - len(cleaned)} Zeichen")

# Stichproben manuell prüfen
print(cleaned[:500])  # Erste 500 Zeichen
```

### ⚠️ Bekannte Einschränkungen

1. **Regex-basiert:** Kann False Positives produzieren
2. **Keine semantische Analyse:** Erkennt Kontext nicht
3. **Language-agnostic:** Optimiert für Englisch
4. **Pattern-abhängig:** Bei ungewöhnlichen Formaten ggf. eigene Patterns nötig

---

## Fehlerbehebung

### Problem: Zu viel Content wird entfernt

**Lösung:**
```python
# Schalte Options einzeln aus
options.remove_sections = False  # Sektionen behalten
options.remove_short_lines = False  # Kurze Zeilen behalten
options.min_line_length = 30  # Schwellenwert senken
```

### Problem: Wichtige Patterns werden nicht entfernt

**Lösung:**
```python
# Füge eigene Patterns hinzu
from markdowncleaner.config.loader import get_default_patterns

patterns = get_default_patterns()
patterns.bad_lines_patterns.append(r"Mein Custom Pattern")

cleaner = MarkdownCleaner(patterns=patterns)
```

### Problem: Encoding-Fehler

**Lösung:**
```python
# ftfy sollte automatisch aktiviert sein
# Falls nicht, manuell anwenden:
import ftfy

text = ftfy.fix_text(your_text)
cleaner = MarkdownCleaner()
cleaned = cleaner.clean_markdown_string(text)
```

---

## Lizenz

MIT License

---

## Weiterführende Ressourcen

- **GitHub Repository:** https://github.com/josk0/markdowncleaner
- **PyPI Package:** https://pypi.org/project/markdowncleaner/
- **ftfy Documentation:** https://github.com/rspeer/python-ftfy

---

## Changelog

Siehe GitHub Repository für aktuelle Updates und Versionshistorie.
