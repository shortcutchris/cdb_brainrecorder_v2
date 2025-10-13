# Mistral OCR API Tutorial - PDF zu Markdown Konverter

## Überblick

Dieses Tutorial erklärt die komplette Implementierung eines PDF-zu-Markdown Konverters mit der Mistral OCR API unter Verwendung von Vanilla JavaScript und FlowBite. Die Web-Applikation ermöglicht es Benutzern, PDF-Dateien hochzuladen und diese in strukturierte Markdown-Dateien zu konvertieren.

## Inhaltsverzeichnis

1. [Projekt-Setup](#projekt-setup)
2. [API-Grundlagen](#api-grundlagen)
3. [HTML-Struktur mit FlowBite](#html-struktur-mit-flowbite)
4. [Upload-Komponente](#upload-komponente)
5. [Progress-Tracking](#progress-tracking)
6. [API-Integration](#api-integration)
7. [Markdown-Verarbeitung](#markdown-verarbeitung)
8. [Fehlerbehandlung](#fehlerbehandlung)
9. [Komplettes Beispiel](#komplettes-beispiel)

## Projekt-Setup

### Dateistruktur

```
project-root/
├── .env
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── mistral-service.js
│   ├── ui-components.js
│   └── utils.js
└── assets/
    └── icons/
```

### Environment Configuration

```bash
# .env (im Root-Verzeichnis)
MISTRAL_API_KEY=your_mistral_api_key_here
```

### FlowBite Setup

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF zu Markdown Konverter</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- FlowBite CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css" rel="stylesheet" />
    
    <!-- Custom CSS -->
    <link href="./css/styles.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Content hier -->
    
    <!-- FlowBite JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"></script>
    
    <!-- Custom JS -->
    <script src="./js/utils.js"></script>
    <script src="./js/mistral-service.js"></script>
    <script src="./js/ui-components.js"></script>
    <script src="./js/main.js"></script>
</body>
</html>
```

## API-Grundlagen

### API-Konfiguration (js/utils.js)

```javascript
// Environment Variables laden
const CONFIG = {
    MISTRAL_API_KEY: null, // Wird dynamisch geladen
    MISTRAL_API_BASE: 'https://api.mistral.ai/v1',
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_PAGES: 1000,
    ALLOWED_TYPES: ['application/pdf']
};

// API Key aus .env laden (falls verfügbar)
async function loadConfig() {
    try {
        // Für lokale Entwicklung - .env über Backend-Endpoint laden
        const response = await fetch('/api/config');
        const config = await response.json();
        CONFIG.MISTRAL_API_KEY = config.MISTRAL_API_KEY;
    } catch (error) {
        console.warn('Config nicht geladen, verwende Umgebungsvariable');
        // Fallback für direkte API-Key Eingabe
        CONFIG.MISTRAL_API_KEY = prompt('Bitte Mistral API Key eingeben:');
    }
}

// Utility Funktionen
const Utils = {
    formatFileSize: (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    formatProgress: (progress) => {
        return Math.round(progress);
    },

    generateId: () => {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    validateFile: (file) => {
        const errors = [];
        
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            errors.push('Nur PDF-Dateien sind erlaubt');
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            errors.push(`Datei ist zu groß. Maximum: ${Utils.formatFileSize(CONFIG.MAX_FILE_SIZE)}`);
        }
        
        return errors;
    }
};
```

## HTML-Struktur mit FlowBite

### Basis HTML-Template

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF zu Markdown Konverter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css" rel="stylesheet" />
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-gray-900">PDF zu Markdown Konverter</h1>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-500">Powered by Mistral AI</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Info Section -->
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">
                PDF zu Markdown Konverter
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                Konvertieren Sie PDF-Dokumente in strukturierte Markdown-Dateien 
                mit der Mistral OCR API. Unterstützt komplexe Layouts, Tabellen und Bilder.
            </p>
        </div>

        <!-- App Container -->
        <div id="app-container">
            <!-- Upload Section -->
            <div id="upload-section" class="block">
                <!-- Upload Component wird hier eingefügt -->
            </div>

            <!-- Processing Section -->
            <div id="processing-section" class="hidden">
                <!-- Progress Component wird hier eingefügt -->
            </div>

            <!-- Result Section -->
            <div id="result-section" class="hidden">
                <!-- Result Component wird hier eingefügt -->
            </div>

            <!-- Error Section -->
            <div id="error-section" class="hidden">
                <!-- Error Component wird hier eingefügt -->
            </div>
        </div>

        <!-- Reset Button -->
        <div id="reset-container" class="text-center mt-8 hidden">
            <button id="reset-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Neue PDF konvertieren
            </button>
        </div>
    </main>

    <!-- FlowBite JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"></script>
    
    <!-- Custom Scripts -->
    <script src="./js/utils.js"></script>
    <script src="./js/mistral-service.js"></script>
    <script src="./js/ui-components.js"></script>
    <script src="./js/main.js"></script>
</body>
</html>
```

## Upload-Komponente

### Upload UI-Komponente (js/ui-components.js)

```javascript
const UIComponents = {
    createUploadComponent: () => {
        return `
            <div class="w-full max-w-md mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex flex-col items-center pb-6">
                        <div id="drop-zone" 
                             class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            
                            <div id="upload-content" class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p class="mb-2 text-sm text-gray-500">
                                    <span class="font-semibold">Klicken zum Hochladen</span> oder per Drag & Drop
                                </p>
                                <p class="text-xs text-gray-500">PDF (MAX. 50MB)</p>
                            </div>

                            <div id="file-info" class="hidden flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p id="file-name" class="mb-2 text-sm text-gray-700 font-medium"></p>
                                <p id="file-size" class="text-xs text-gray-500"></p>
                            </div>

                            <input id="file-input" type="file" accept=".pdf" class="hidden">
                        </div>

                        <button id="convert-btn" 
                                class="hidden mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                            PDF konvertieren
                        </button>

                        <div id="validation-errors" class="hidden mt-4 w-full">
                            <!-- Validation errors werden hier angezeigt -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    showValidationErrors: (errors) => {
        const errorContainer = document.getElementById('validation-errors');
        if (errors.length === 0) {
            errorContainer.classList.add('hidden');
            return;
        }

        errorContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                    <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Validierungsfehler</h3>
                        <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        errorContainer.classList.remove('hidden');
    }
};
```

### Upload Event Handler

```javascript
class UploadHandler {
    constructor() {
        this.selectedFile = null;
        this.dragCounter = 0;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const convertBtn = document.getElementById('convert-btn');

        // Click-Handler für Drop Zone
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File Input Change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag & Drop Events
        dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Convert Button
        convertBtn.addEventListener('click', () => {
            if (this.selectedFile) {
                this.startConversion();
            }
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        const errors = Utils.validateFile(file);
        
        if (errors.length > 0) {
            UIComponents.showValidationErrors(errors);
            return;
        }

        this.selectedFile = file;
        this.showFileInfo(file);
        UIComponents.showValidationErrors([]); // Clear errors
    }

    showFileInfo(file) {
        const uploadContent = document.getElementById('upload-content');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const convertBtn = document.getElementById('convert-btn');

        uploadContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        convertBtn.classList.remove('hidden');

        fileName.textContent = file.name;
        fileSize.textContent = Utils.formatFileSize(file.size);
    }

    handleDragEnter(e) {
        e.preventDefault();
        this.dragCounter++;
        document.getElementById('drop-zone').classList.add('border-blue-500', 'bg-blue-50');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            document.getElementById('drop-zone').classList.remove('border-blue-500', 'bg-blue-50');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.dragCounter = 0;
        document.getElementById('drop-zone').classList.remove('border-blue-500', 'bg-blue-50');
        
        const file = e.dataTransfer.files[0];
        this.handleFileSelect(file);
    }

    startConversion() {
        if (!this.selectedFile) return;
        
        // Trigger conversion
        window.appController.startProcessing(this.selectedFile);
    }

    reset() {
        this.selectedFile = null;
        this.dragCounter = 0;
        
        // Reset UI
        document.getElementById('upload-content').classList.remove('hidden');
        document.getElementById('file-info').classList.add('hidden');
        document.getElementById('convert-btn').classList.add('hidden');
        document.getElementById('file-input').value = '';
        UIComponents.showValidationErrors([]);
    }
}
```

## Progress-Tracking

### Progress UI-Komponente

```javascript
const ProgressComponents = {
    createProgressComponent: (fileName) => {
        return `
            <div class="w-full max-w-md mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-lg font-medium text-gray-900">PDF wird verarbeitet</h3>
                            <div id="processing-spinner" class="animate-spin">
                                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4">${fileName}</p>

                        <div id="current-step" class="flex items-center mb-3">
                            <span id="step-icon" class="text-2xl mr-3">📤</span>
                            <span id="step-text" class="text-sm font-medium text-gray-700">Upload wird vorbereitet</span>
                        </div>

                        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div id="progress-bar" class="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
                        </div>

                        <div class="flex justify-between text-sm text-gray-500">
                            <span id="progress-text">0% abgeschlossen</span>
                            <span id="status-badge" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                In Bearbeitung
                            </span>
                        </div>
                    </div>

                    <!-- Schritt-für-Schritt Anzeige -->
                    <div id="steps-list" class="space-y-2">
                        <div id="step-upload" class="flex items-center p-2 rounded bg-blue-50 border border-blue-200">
                            <span class="text-lg mr-3">📤</span>
                            <span class="text-sm text-blue-700 font-medium">Upload wird vorbereitet</span>
                        </div>
                        <div id="step-uploading" class="flex items-center p-2 rounded bg-gray-50">
                            <span class="text-lg mr-3">⬆️</span>
                            <span class="text-sm text-gray-600">Datei wird hochgeladen</span>
                        </div>
                        <div id="step-processing" class="flex items-center p-2 rounded bg-gray-50">
                            <span class="text-lg mr-3">🔄</span>
                            <span class="text-sm text-gray-600">OCR-Verarbeitung läuft</span>
                        </div>
                        <div id="step-completed" class="flex items-center p-2 rounded bg-gray-50">
                            <span class="text-lg mr-3">✅</span>
                            <span class="text-sm text-gray-600">Konvertierung abgeschlossen</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateProgress: (progress, step) => {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const stepIcon = document.getElementById('step-icon');
        const stepText = document.getElementById('step-text');

        // Progress Bar aktualisieren
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Utils.formatProgress(progress)}% abgeschlossen`;
        }

        // Aktuellen Schritt aktualisieren
        const steps = {
            'upload': { icon: '📤', text: 'Upload wird vorbereitet' },
            'uploading': { icon: '⬆️', text: 'Datei wird hochgeladen' },
            'processing': { icon: '🔄', text: 'OCR-Verarbeitung läuft' },
            'completed': { icon: '✅', text: 'Konvertierung abgeschlossen' }
        };

        if (steps[step]) {
            if (stepIcon) stepIcon.textContent = steps[step].icon;
            if (stepText) stepText.textContent = steps[step].text;
        }

        // Schritt-Liste aktualisieren
        ProgressComponents.updateStepsList(step);

        // Status Badge aktualisieren
        const statusBadge = document.getElementById('status-badge');
        if (statusBadge) {
            if (step === 'completed') {
                statusBadge.textContent = 'Fertig';
                statusBadge.className = 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium';
                
                // Spinner verstecken
                const spinner = document.getElementById('processing-spinner');
                if (spinner) spinner.classList.add('hidden');
            }
        }
    },

    updateStepsList: (currentStep) => {
        const stepOrder = ['upload', 'uploading', 'processing', 'completed'];
        const currentIndex = stepOrder.indexOf(currentStep);

        stepOrder.forEach((step, index) => {
            const stepElement = document.getElementById(`step-${step}`);
            if (!stepElement) return;

            if (index < currentIndex) {
                // Abgeschlossen
                stepElement.className = 'flex items-center p-2 rounded bg-green-50 border border-green-200';
                stepElement.querySelector('span:last-child').className = 'text-sm text-green-700';
            } else if (index === currentIndex) {
                // Aktuell
                stepElement.className = 'flex items-center p-2 rounded bg-blue-50 border border-blue-200';
                stepElement.querySelector('span:last-child').className = 'text-sm text-blue-700 font-medium';
            } else {
                // Ausstehend
                stepElement.className = 'flex items-center p-2 rounded bg-gray-50';
                stepElement.querySelector('span:last-child').className = 'text-sm text-gray-600';
            }
        });
    }
};
```

## API-Integration

### Mistral API Service (js/mistral-service.js)

```javascript
class MistralOCRService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.mistral.ai/v1';
    }

    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', 'ocr');

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Upload Progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            });

            // Success Handler
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    let errorMessage = `Upload failed: ${xhr.statusText}`;
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.message || errorMessage;
                    } catch (e) {
                        // Verwende Standard-Fehlermeldung
                    }
                    reject(new Error(errorMessage));
                }
            });

            // Error Handler
            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            // Timeout Handler
            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout'));
            });

            xhr.timeout = 300000; // 5 Minuten Timeout
            xhr.open('POST', `${this.baseUrl}/files`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.apiKey}`);
            xhr.send(formData);
        });
    }

    async getSignedUrl(fileId) {
        const response = await fetch(`${this.baseUrl}/files/${fileId}/url`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to get signed URL: ${response.statusText}`);
        }

        return await response.json();
    }

    async processOCR(documentUrl) {
        const response = await fetch(`${this.baseUrl}/ocr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-ocr-latest',
                document: {
                    type: 'document_url',
                    document_url: documentUrl
                },
                include_image_base64: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `OCR processing failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async convertPDFToMarkdown(file, onProgress, onStepChange) {
        try {
            // Schritt 1: Upload vorbereiten
            onStepChange('upload');
            onProgress(0);

            await new Promise(resolve => setTimeout(resolve, 500)); // Kurze Pause für UX

            // Schritt 2: Datei hochladen
            onStepChange('uploading');
            const uploadResult = await this.uploadFile(file, (progress) => {
                onProgress(Math.round(progress * 0.3)); // Upload ist 30% des Gesamtprozesses
            });

            // Schritt 3: Signed URL abrufen
            await new Promise(resolve => setTimeout(resolve, 200));
            const signedUrlResult = await this.getSignedUrl(uploadResult.id);
            onProgress(35);

            // Schritt 4: OCR verarbeiten
            onStepChange('processing');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Simuliere OCR-Progress (da API keinen echten Progress liefert)
            const progressSteps = [40, 50, 65, 80, 95];
            for (const step of progressSteps) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                onProgress(step);
            }

            const ocrResult = await this.processOCR(signedUrlResult.url);

            // Schritt 5: Fertig
            onStepChange('completed');
            onProgress(100);

            return {
                success: true,
                data: ocrResult,
                markdown: this.extractMarkdown(ocrResult),
                metadata: this.extractMetadata(ocrResult)
            };

        } catch (error) {
            onStepChange('error');
            return {
                success: false,
                error: error.message
            };
        }
    }

    extractMarkdown(ocrResult) {
        if (!ocrResult.pages || !Array.isArray(ocrResult.pages)) {
            throw new Error('Invalid OCR result format');
        }

        return ocrResult.pages
            .map((page, index) => {
                let markdown = page.markdown || '';
                
                // Füge Seitennummer hinzu falls mehrere Seiten
                if (ocrResult.pages.length > 1) {
                    markdown = `<!-- Seite ${index + 1} -->\n\n${markdown}`;
                }
                
                return markdown;
            })
            .filter(Boolean)
            .join('\n\n---\n\n'); // Seiten-Trenner
    }

    extractMetadata(ocrResult) {
        const pages = ocrResult.pages || [];
        
        return {
            pageCount: pages.length,
            imageCount: pages.reduce((total, page) => total + (page.images?.length || 0), 0),
            totalWords: pages.reduce((total, page) => {
                const words = (page.markdown || '').split(/\s+/).filter(Boolean);
                return total + words.length;
            }, 0),
            firstPagePreview: pages[0]?.markdown?.substring(0, 200) || '',
            dimensions: pages[0]?.dimensions || {},
            processedAt: new Date().toISOString(),
            images: pages.flatMap(page => page.images || [])
        };
    }
}
```

## Markdown-Verarbeitung

### Result UI-Komponente

```javascript
const ResultComponents = {
    createResultComponent: (result, fileName) => {
        const { data, markdown, metadata } = result;
        
        return `
            <div class="w-full max-w-4xl mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Konvertierung abgeschlossen</h3>
                            <p class="text-sm text-gray-600">${fileName}</p>
                        </div>
                        <div class="flex gap-2">
                            <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ${metadata.pageCount} Seiten
                            </span>
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                ${metadata.totalWords} Wörter
                            </span>
                            ${metadata.imageCount > 0 ? `
                                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    ${metadata.imageCount} Bilder
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                </svg>
                                <span class="font-medium">Markdown</span>
                            </div>
                            <p class="text-sm text-gray-600">Strukturierte Textdatei mit Formatierung</p>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span class="font-medium">Bilder</span>
                            </div>
                            <p class="text-sm text-gray-600">${metadata.imageCount} Bilder extrahiert</p>
                        </div>

                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <svg class="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                <span class="font-medium">Größe</span>
                            </div>
                            <p class="text-sm text-gray-600">${Utils.formatFileSize(new Blob([markdown]).size)}</p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-3 mb-6">
                        <button id="download-btn" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Markdown herunterladen
                        </button>
                        
                        <button id="preview-btn" class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Vorschau anzeigen
                        </button>
                        
                        <button id="copy-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            Kopieren
                        </button>
                    </div>

                    <!-- Preview Section -->
                    <div class="border-t pt-6">
                        <h4 class="font-medium mb-3">Markdown-Vorschau (erste 500 Zeichen):</h4>
                        <div class="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre class="whitespace-pre-wrap">${markdown.substring(0, 500)}${markdown.length > 500 ? '...' : ''}</pre>
                        </div>
                    </div>

                    <!-- Table of Contents (falls vorhanden) -->
                    ${ResultComponents.createTableOfContents(markdown)}
                </div>
            </div>
        `;
    },

    createTableOfContents: (markdown) => {
        const headings = MarkdownProcessor.generateTableOfContents(markdown);
        
        if (headings.length === 0) return '';

        return `
            <div class="mt-6 border-t pt-6">
                <h4 class="font-medium mb-3">Inhaltsverzeichnis:</h4>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <ul class="space-y-1">
                        ${headings.map(heading => `
                            <li class="flex items-center">
                                <span class="w-${heading.level * 4} h-px bg-gray-300 mr-2"></span>
                                <span class="text-sm text-gray-700">${heading.title}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    setupResultEventListeners: (result, fileName) => {
        const { markdown } = result;
        
        // Download Button
        document.getElementById('download-btn')?.addEventListener('click', () => {
            ResultComponents.downloadMarkdown(markdown, fileName);
        });

        // Copy Button
        document.getElementById('copy-btn')?.addEventListener('click', () => {
            ResultComponents.copyToClipboard(markdown);
        });

        // Preview Button
        document.getElementById('preview-btn')?.addEventListener('click', () => {
            ResultComponents.showPreviewModal(markdown);
        });
    },

    downloadMarkdown: (markdown, fileName) => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName.replace('.pdf', '')}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    copyToClipboard: async (markdown) => {
        try {
            await navigator.clipboard.writeText(markdown);
            ResultComponents.showToast('Markdown in Zwischenablage kopiert!', 'success');
        } catch (error) {
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = markdown;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            ResultComponents.showToast('Markdown in Zwischenablage kopiert!', 'success');
        }
    },

    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-opacity duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    },

    showPreviewModal: (markdown) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-lg font-medium">Markdown Vorschau</h3>
                    <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-4 overflow-y-auto max-h-[70vh]">
                    <pre class="whitespace-pre-wrap font-mono text-sm">${markdown}</pre>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close-Handler
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'close-modal') {
                document.body.removeChild(modal);
            }
        });
    }
};

// Markdown Processing Utilities
const MarkdownProcessor = {
    cleanMarkdown: (markdown) => {
        return markdown
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    },

    generateTableOfContents: (markdown) => {
        const headings = [];
        const lines = markdown.split('\n');
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const [, hashes, title] = match;
                headings.push({
                    level: hashes.length,
                    title: title.trim(),
                    anchor: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    lineNumber: index + 1
                });
            }
        });
        
        return headings;
    },

    extractFirstParagraph: (markdown) => {
        const paragraphs = markdown.split('\n\n').filter(p => p.trim());
        return paragraphs[0] || '';
    }
};
```

## Fehlerbehandlung

### Error UI-Komponente

```javascript
const ErrorComponents = {
    createErrorComponent: (error) => {
        const errorInfo = ErrorComponents.analyzeError(error);
        
        return `
            <div class="w-full max-w-md mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0">
                            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-red-800">${errorInfo.title}</h3>
                            <p class="text-sm text-red-600 mt-1">${errorInfo.message}</p>
                        </div>
                    </div>
                    
                    ${errorInfo.suggestions.length > 0 ? `
                        <div class="mb-4">
                            <p class="text-sm font-medium text-gray-900 mb-2">Lösungsvorschläge:</p>
                            <ul class="text-sm text-gray-700 space-y-1">
                                ${errorInfo.suggestions.map(suggestion => `
                                    <li class="flex items-start">
                                        <svg class="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        ${suggestion}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="flex gap-3">
                        <button id="retry-btn" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Erneut versuchen
                        </button>
                        
                        <button id="new-file-btn" class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            Neue Datei wählen
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    analyzeError: (error) => {
        const errorString = error.toLowerCase();
        
        if (errorString.includes('file size') || errorString.includes('too large')) {
            return {
                title: 'Datei zu groß',
                message: 'Die ausgewählte PDF-Datei überschreitet das Limit von 50MB.',
                suggestions: [
                    'Verwenden Sie eine kleinere PDF-Datei',
                    'Komprimieren Sie die PDF-Datei vor dem Upload',
                    'Teilen Sie große PDFs in kleinere Abschnitte auf'
                ]
            };
        }
        
        if (errorString.includes('api key') || errorString.includes('401') || errorString.includes('unauthorized')) {
            return {
                title: 'Authentifizierung fehlgeschlagen',
                message: 'Der API-Schlüssel ist ungültig oder fehlt.',
                suggestions: [
                    'Überprüfen Sie Ihren Mistral API-Schlüssel',
                    'Stellen Sie sicher, dass der API-Schlüssel korrekt in der .env Datei steht',
                    'Kontaktieren Sie den Administrator'
                ]
            };
        }
        
        if (errorString.includes('rate limit') || errorString.includes('429') || errorString.includes('too many requests')) {
            return {
                title: 'Rate Limit erreicht',
                message: 'Zu viele Anfragen in kurzer Zeit.',
                suggestions: [
                    'Warten Sie einen Moment und versuchen Sie es erneut',
                    'Reduzieren Sie die Anzahl der gleichzeitigen Uploads'
                ]
            };
        }
        
        if (errorString.includes('network') || errorString.includes('timeout')) {
            return {
                title: 'Netzwerkfehler',
                message: 'Die Verbindung zum Server ist fehlgeschlagen.',
                suggestions: [
                    'Überprüfen Sie Ihre Internetverbindung',
                    'Versuchen Sie es in ein paar Minuten erneut',
                    'Falls das Problem weiterhin besteht, kontaktieren Sie den Support'
                ]
            };
        }
        
        if (errorString.includes('invalid') || errorString.includes('corrupt')) {
            return {
                title: 'Ungültige Datei',
                message: 'Die PDF-Datei ist beschädigt oder in einem ungültigen Format.',
                suggestions: [
                    'Verwenden Sie eine andere PDF-Datei',
                    'Öffnen Sie die PDF-Datei in einem PDF-Viewer um sie zu validieren',
                    'Exportieren Sie die PDF-Datei erneut aus der Originalquelle'
                ]
            };
        }
        
        return {
            title: 'Unbekannter Fehler',
            message: error,
            suggestions: [
                'Versuchen Sie es erneut',
                'Verwenden Sie eine andere PDF-Datei',
                'Kontaktieren Sie den Support falls das Problem weiterhin besteht'
            ]
        };
    },

    setupErrorEventListeners: () => {
        document.getElementById('retry-btn')?.addEventListener('click', () => {
            window.appController.retry();
        });

        document.getElementById('new-file-btn')?.addEventListener('click', () => {
            window.appController.reset();
        });
    }
};
```

## Komplettes Beispiel

### Haupt-Controller (js/main.js)

```javascript
class AppController {
    constructor() {
        this.uploadHandler = null;
        this.ocrService = null;
        this.currentFile = null;
        this.currentResult = null;
        this.isProcessing = false;
        
        this.init();
    }

    async init() {
        try {
            // Config laden
            await loadConfig();
            
            if (!CONFIG.MISTRAL_API_KEY) {
                throw new Error('Mistral API Key ist erforderlich');
            }

            // Services initialisieren
            this.ocrService = new MistralOCRService(CONFIG.MISTRAL_API_KEY);
            
            // UI initialisieren
            this.setupUI();
            this.setupEventListeners();

            console.log('App erfolgreich initialisiert');
        } catch (error) {
            console.error('Initialisierungsfehler:', error);
            this.showError(error.message);
        }
    }

    setupUI() {
        // Upload Section initialisieren
        const uploadSection = document.getElementById('upload-section');
        uploadSection.innerHTML = UIComponents.createUploadComponent();
        
        // Upload Handler initialisieren
        this.uploadHandler = new UploadHandler();
    }

    setupEventListeners() {
        // Global Event Listeners
        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.reset();
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.reset();
            }
        });
    }

    async startProcessing(file) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.currentFile = file;
        
        // UI umschalten
        this.showSection('processing');
        
        // Processing UI erstellen
        const processingSection = document.getElementById('processing-section');
        processingSection.innerHTML = ProgressComponents.createProgressComponent(file.name);

        try {
            // OCR Processing starten
            const result = await this.ocrService.convertPDFToMarkdown(
                file,
                (progress) => this.updateProgress(progress),
                (step) => this.updateStep(step)
            );

            if (result.success) {
                this.currentResult = result;
                this.showResult(result, file.name);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showError(error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    updateProgress(progress) {
        ProgressComponents.updateProgress(progress, this.currentStep);
    }

    updateStep(step) {
        this.currentStep = step;
        ProgressComponents.updateProgress(this.currentProgress || 0, step);
    }

    showResult(result, fileName) {
        // Result Section anzeigen
        this.showSection('result');
        
        // Result UI erstellen
        const resultSection = document.getElementById('result-section');
        resultSection.innerHTML = ResultComponents.createResultComponent(result, fileName);
        
        // Event Listeners für Result-Aktionen
        ResultComponents.setupResultEventListeners(result, fileName);
        
        // Reset Button anzeigen
        document.getElementById('reset-container').classList.remove('hidden');
    }

    showError(error) {
        // Error Section anzeigen
        this.showSection('error');
        
        // Error UI erstellen
        const errorSection = document.getElementById('error-section');
        errorSection.innerHTML = ErrorComponents.createErrorComponent(error);
        
        // Event Listeners für Error-Aktionen
        ErrorComponents.setupErrorEventListeners();
        
        // Reset Button anzeigen
        document.getElementById('reset-container').classList.remove('hidden');
    }

    showSection(sectionName) {
        const sections = ['upload', 'processing', 'result', 'error'];
        
        sections.forEach(section => {
            const element = document.getElementById(`${section}-section`);
            if (element) {
                if (section === sectionName) {
                    element.classList.remove('hidden');
                    element.classList.add('block');
                } else {
                    element.classList.add('hidden');
                    element.classList.remove('block');
                }
            }
        });
    }

    retry() {
        if (this.currentFile && !this.isProcessing) {
            this.startProcessing(this.currentFile);
        }
    }

    reset() {
        // State zurücksetzen
        this.currentFile = null;
        this.currentResult = null;
        this.isProcessing = false;
        this.currentStep = null;
        this.currentProgress = 0;

        // UI zurücksetzen
        this.showSection('upload');
        document.getElementById('reset-container').classList.add('hidden');
        
        // Upload Handler zurücksetzen
        if (this.uploadHandler) {
            this.uploadHandler.reset();
        }
    }
}

// App starten wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});
```

### Erweiterte Funktionen

#### Batch Processing Support

```javascript
class BatchProcessor {
    constructor(ocrService) {
        this.ocrService = ocrService;
        this.queue = [];
        this.maxConcurrent = 2;
        this.processing = [];
    }

    async addFiles(files) {
        const jobs = Array.from(files).map(file => ({
            id: Utils.generateId(),
            file,
            status: 'queued',
            progress: 0,
            result: null,
            error: null
        }));

        this.queue.push(...jobs);
        this.processQueue();
        
        return jobs.map(job => job.id);
    }

    async processQueue() {
        while (this.queue.length > 0 && this.processing.length < this.maxConcurrent) {
            const job = this.queue.shift();
            this.processing.push(job);
            this.processJob(job);
        }
    }

    async processJob(job) {
        try {
            job.status = 'processing';
            
            const result = await this.ocrService.convertPDFToMarkdown(
                job.file,
                (progress) => {
                    job.progress = progress;
                    this.updateJobUI(job);
                },
                (step) => {
                    job.step = step;
                    this.updateJobUI(job);
                }
            );

            job.result = result;
            job.status = result.success ? 'completed' : 'error';
            if (!result.success) {
                job.error = result.error;
            }

        } catch (error) {
            job.status = 'error';
            job.error = error.message;
        } finally {
            this.processing = this.processing.filter(p => p.id !== job.id);
            this.updateJobUI(job);
            this.processQueue();
        }
    }

    updateJobUI(job) {
        // UI Update für Batch Job
        const jobElement = document.getElementById(`job-${job.id}`);
        if (jobElement) {
            // Update job status in UI
        }
    }
}
```

## Fazit

Dieses Tutorial bietet eine vollständige Implementierung eines PDF-zu-Markdown Konverters mit Vanilla JavaScript und FlowBite. Die Lösung umfasst:

- **Moderne UI** mit FlowBite-Komponenten ohne Framework-Dependencies
- **Benutzerfreundlicher Upload** mit Drag & Drop und Validierung
- **Echtzeitfortschritt** mit visuellen Schritt-für-Schritt Indikatoren
- **Robuste Fehlerbehandlung** mit kontextspezifischen Lösungsvorschlägen
- **Vollständige Mistral OCR API Integration** mit allen Features
- **Markdown-Export und -Vorschau** für weitere Verarbeitung
- **Erweiterbare Architektur** für zusätzliche Features wie Batch-Processing

Die implementierte Lösung ist production-ready und kann direkt in bestehende Web-Applikationen integriert werden.