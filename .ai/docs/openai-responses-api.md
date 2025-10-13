# OpenAI Responses API Documentation

## Übersicht

Die **Responses API** ist eine neue, stateful API von OpenAI, die speziell für reasoning models und agentic workflows entwickelt wurde. Sie kombiniert die Einfachheit der Chat Completions API mit den erweiterten Funktionen der Assistants API und bietet eine strukturiertere Möglichkeit, komplexe, mehrstufige Interaktionen mit KI-Modellen zu erstellen.

**Offizielle Dokumentation**: https://platform.openai.com/docs/api-reference/responses

## Warum wurde die Responses API entwickelt?

### Hauptmotivationen

1. **Preservation of Reasoning State**: Die API bewahrt den "reasoning state" des Modells über mehrere Konversationsrunden hinweg
2. **Agentic Loop**: Ermöglicht einen strukturierten Workflow, in dem Modelle untersuchen, Tools verwenden und Ergebnisse zurückmelden können
3. **Multimodal von Grund auf**: Designed für multimodale Interaktionen mit verschiedenen Input- und Output-Typen
4. **Performance-Optimierung**: 40-80% bessere Cache-Nutzung im Vergleich zu Chat Completions

### Hauptunterschiede zu Chat Completions API

| Feature | Chat Completions | Responses API |
|---------|------------------|---------------|
| **State Management** | Stateless (alle Messages müssen erneut gesendet werden) | Stateful (Server speichert Kontext) |
| **Reasoning Preservation** | Reasoning State geht zwischen Turns verloren | Reasoning State bleibt erhalten |
| **Output Types** | Nur Messages | Messages, Tool Calls, Reasoning Steps |
| **Cache Utilization** | Standard | 40-80% besser |
| **Tool Integration** | Basic Function Calling | Built-in hosted tools (web search, file search, code execution) |
| **Use Case** | Einfache Konversationen | Komplexe agentic workflows |

## Key Features

### 1. Stateful Conversations

Die API verwaltet den Konversationskontext serverseitig über eine **Response ID**. Du musst nicht mehr alle vorherigen Messages bei jedem Request senden.

### 2. Built-in Tools

Die Responses API bietet native Integration für:

- **Web Search**: Echtzeit-Websuche während der Response-Generierung
- **File Search**: Durchsuchen hochgeladener Dateien und Dokumente
- **Code Interpreter**: Code-Ausführung und -Analyse
- **Computer Use** (experimentell): Interaktion mit Computer-Interfaces
- **MCP Servers**: Remote Model Context Protocol Server-Integration

### 3. Multi-Step Reasoning

Das Modell kann mehrere Schritte durchlaufen:
1. Analyse der Anfrage
2. Tool-Verwendung (z.B. Web-Suche)
3. Verarbeitung der Tool-Ergebnisse
4. Generierung der finalen Response

Alle diese Schritte werden in einem einzigen API-Call abgebildet, wobei der Server den State verwaltet.

### 4. Modell-Support

Verfügbar für:
- **GPT-4o series** (gpt-4o, gpt-4o-mini)
- **GPT-5 series**
- **o-series** reasoning models (o1, o3)

## API Endpoints

### Base URL
```
https://api.openai.com/v1/
```

### Hauptendpunkte

#### 1. Create Response
```
POST /responses
```

Erstellt eine neue Response mit optionalem Tool-Zugriff.

#### 2. Continue Response
```
POST /responses/{response_id}/continue
```

Fortsetzung einer bestehenden Response (z.B. nach Tool-Verwendung oder User-Input).

#### 3. Get Response
```
GET /responses/{response_id}
```

Ruft Details einer bestehenden Response ab.

#### 4. List Responses
```
GET /responses
```

Listet alle Responses auf (mit Pagination).

#### 5. Delete Response
```
DELETE /responses/{response_id}
```

Löscht eine Response und ihren State.

## Request-Struktur

### Create Response Request

```python
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "Search the web for the latest AI news"
    }
  ],
  "tools": [
    {
      "type": "web_search"
    }
  ],
  "metadata": {
    "user_id": "user_123"
  }
}
```

### Wichtige Parameter

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `model` | string | Ja | Model ID (z.B. "gpt-4o", "gpt-5") |
| `messages` | array | Ja | Array von Message-Objekten |
| `tools` | array | Nein | Array von Tool-Definitionen |
| `metadata` | object | Nein | Custom Metadata für Tracking |
| `temperature` | number | Nein | 0.0 - 2.0, Default: 1.0 |
| `max_tokens` | integer | Nein | Max Output Tokens |
| `stream` | boolean | Nein | Enable Streaming |

### Message-Struktur

```python
{
  "role": "user" | "assistant" | "system",
  "content": "string" | [content_parts],  # Text oder multimodal
  "name": "string"  # Optional: Name des Sprechers
}
```

### Tool-Definitionen

#### Web Search
```python
{
  "type": "web_search",
  "config": {
    "max_results": 5,
    "include_domains": ["example.com"],  # Optional
    "exclude_domains": ["spam.com"]      # Optional
  }
}
```

#### File Search
```python
{
  "type": "file_search",
  "config": {
    "vector_store_ids": ["vs_123"],  # IDs der Vector Stores
    "max_num_results": 10
  }
}
```

#### Code Interpreter
```python
{
  "type": "code_interpreter",
  "config": {
    "timeout": 60  # Sekunden
  }
}
```

## Response-Struktur

### Erfolgreiche Response

```python
{
  "id": "resp_abc123",
  "object": "response",
  "created": 1735920000,
  "model": "gpt-4o",
  "status": "completed",  # "in_progress" | "completed" | "failed"
  "output": [
    {
      "type": "message",
      "content": "Based on my web search, here are the latest AI news..."
    },
    {
      "type": "tool_call",
      "tool_name": "web_search",
      "input": {"query": "latest AI news 2025"},
      "output": {...}
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  },
  "metadata": {
    "user_id": "user_123"
  }
}
```

### Output Types

Die `output` Array kann verschiedene Typen enthalten:

1. **Message**: Text-Antworten vom Modell
2. **Tool Call**: Tool-Aufrufe und deren Ergebnisse
3. **Reasoning Step**: Interne Reasoning-Schritte (bei o-series models)

## Python Implementation

### Installation

```bash
pip install openai>=1.57.0
```

### Basic Usage

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# Create Response mit Web Search
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "What are the latest developments in AI?"
        }
    ],
    tools=[
        {
            "type": "web_search"
        }
    ]
)

print(response.output[0].content)
```

### Continuing a Response

```python
# Continue existing response
continued_response = client.responses.continue(
    response_id=response.id,
    messages=[
        {
            "role": "user",
            "content": "Tell me more about the first result"
        }
    ]
)
```

### Streaming

```python
stream = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    stream=True
)

for chunk in stream:
    if chunk.output:
        print(chunk.output[0].content, end="", flush=True)
```

### Mit File Search

```python
# 1. Upload File
file = client.files.create(
    file=open("document.pdf", "rb"),
    purpose="assistants"
)

# 2. Create Vector Store
vector_store = client.vector_stores.create(
    name="My Documents",
    file_ids=[file.id]
)

# 3. Use in Response
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Summarize the key points from the document"
        }
    ],
    tools=[
        {
            "type": "file_search",
            "config": {
                "vector_store_ids": [vector_store.id]
            }
        }
    ]
)
```

## Async/Await Support

```python
from openai import AsyncOpenAI

async def query_with_responses():
    client = AsyncOpenAI(api_key="your-api-key")

    response = await client.responses.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "What's the weather in Berlin?"}
        ],
        tools=[{"type": "web_search"}]
    )

    return response.output[0].content

# Usage
import asyncio
result = asyncio.run(query_with_responses())
```

## Best Practices

### 1. State Management

```python
# Speichere Response IDs für spätere Fortsetzung
response_id = response.id

# Später im Code
continued = client.responses.continue(
    response_id=response_id,
    messages=[{"role": "user", "content": "Follow-up question"}]
)
```

### 2. Error Handling

```python
from openai import OpenAIError

try:
    response = client.responses.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Query"}],
        tools=[{"type": "web_search"}]
    )
except OpenAIError as e:
    print(f"Error: {e.status_code} - {e.message}")
```

### 3. Tool Configuration

```python
# Kombiniere mehrere Tools
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Research AI trends and analyze the data"
        }
    ],
    tools=[
        {"type": "web_search"},
        {"type": "code_interpreter"}
    ]
)
```

### 4. Metadata für Tracking

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Query"}],
    metadata={
        "user_id": "user_123",
        "session_id": "sess_456",
        "environment": "production"
    }
)
```

## Performance-Optimierungen

### 1. Cache Utilization

Die Responses API cached automatisch:
- Reasoning State
- Tool-Ergebnisse (Web Search, File Search)
- Kontext zwischen Turns

**Ergebnis**: 40-80% bessere Performance bei Multi-Turn-Konversationen

### 2. Prompt Caching

```python
# System Prompt wird gecached bei wiederholten Anfragen
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "Very long system prompt..."  # Wird gecached
        },
        {
            "role": "user",
            "content": "User query"
        }
    ]
)
```

### 3. Batch Processing

```python
# Für mehrere unabhängige Queries
import asyncio

async def batch_queries():
    client = AsyncOpenAI()

    tasks = [
        client.responses.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": query}]
        )
        for query in queries
    ]

    return await asyncio.gather(*tasks)
```

## Use Cases

### 1. Agentic Search & Research

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Research the top 5 AI companies and compare their products"
        }
    ],
    tools=[{"type": "web_search"}]
)
```

### 2. Document Analysis

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Analyze these financial reports and extract key metrics"
        }
    ],
    tools=[
        {
            "type": "file_search",
            "config": {"vector_store_ids": [store_id]}
        },
        {
            "type": "code_interpreter"
        }
    ]
)
```

### 3. Multi-Step Reasoning

```python
# Das Modell kann mehrere Steps durchlaufen
response = client.responses.create(
    model="o1",  # Reasoning model
    messages=[
        {
            "role": "user",
            "content": "Plan a 7-day trip to Japan with detailed itinerary"
        }
    ],
    tools=[{"type": "web_search"}]
)

# Output enthält Reasoning Steps
for item in response.output:
    if item.type == "reasoning_step":
        print(f"Thinking: {item.content}")
    elif item.type == "message":
        print(f"Response: {item.content}")
```

## Migration von Chat Completions

### Vorher (Chat Completions)

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "What's the weather?"}
    ]
)
```

### Nachher (Responses API)

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "What's the weather?"}
    ],
    tools=[{"type": "web_search"}]  # Built-in tool access
)
```

### Key Changes

1. **Endpoint**: `chat.completions` → `responses`
2. **Response Format**: `choices[0].message` → `output[0]`
3. **Tools**: Function calling → Built-in hosted tools
4. **State**: Stateless → Stateful (Response IDs)

## Pricing

Die Responses API verwendet die gleichen Token-basierten Preise wie Chat Completions, aber:

- **Cached Tokens**: Reduzierte Kosten bei wiederholten Anfragen
- **Tool Usage**: Zusätzliche Kosten für Web Search, Code Interpreter, etc.

**Hinweis**: Prüfe aktuelle Preise unter https://openai.com/pricing

## Limits & Quotas

- **Rate Limits**: Abhängig vom Tier (Free, Plus, Enterprise)
- **Response Lifetime**: Responses werden nach 24 Stunden gelöscht
- **Max Context**: Abhängig vom Model (z.B. 128k für gpt-4o)
- **Tool Limits**: Max 10 parallele Tool-Calls pro Request

## Troubleshooting

### Common Errors

```python
# 1. Response expired
# Lösung: Create new response, nicht continue

# 2. Tool not available
# Lösung: Prüfe model support für spezifische tools

# 3. Rate limit exceeded
# Lösung: Implement exponential backoff

import time

def create_with_retry(client, **kwargs):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.responses.create(**kwargs)
        except OpenAIError as e:
            if e.status_code == 429:  # Rate limit
                wait = 2 ** attempt
                time.sleep(wait)
            else:
                raise
```

## Zusammenfassung

Die **Responses API** ist ideal für:

- Komplexe, mehrstufige Workflows
- Agentic Anwendungen mit Tool-Verwendung
- Dokument-Analyse und Recherche
- Reasoning-intensive Tasks

**Vorteile**:
- State Management serverseitig
- Bessere Performance durch Caching
- Built-in Tools ohne eigene Infrastruktur
- Preservation of reasoning state

**Nächste Schritte**:
1. Experimentiere mit verschiedenen Tools
2. Implementiere Multi-Turn-Konversationen
3. Nutze Streaming für bessere UX
4. Optimiere mit Metadata und Caching

## Weitere Ressourcen

- **Official Docs**: https://platform.openai.com/docs/api-reference/responses
- **OpenAI Blog**: https://developers.openai.com/blog/responses-api/
- **Community Forum**: https://community.openai.com/
- **Python SDK**: https://github.com/openai/openai-python

---

**Last Updated**: Januar 2025
**API Version**: v1
**SDK Version**: openai>=1.57.0
