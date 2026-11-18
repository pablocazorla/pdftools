# PDF Tools App

Una aplicación web moderna, rápida y segura para manipular documentos PDF, inspirada en la organización, modularidad y facilidad de uso de **PDF24 Tools**.

La aplicación ofrece **siete herramientas independientes**, diseñadas para funcionar tanto en entornos de escritorio como móviles, con procesamiento 100% local en el servidor, alta resolución, soporte multiidioma (**I18N en Español e Inglés**, inglés por defecto con persistencia en `localStorage`) y aislamiento completo por tarea.

---

## 🛠️ Herramientas disponibles

| # | Herramienta | Descripción técnica | Formatos y Salida |
|---|-------------|---------------------|-------------------|
| 1 | **PDF to Images** | Convierte cada página de un PDF en imágenes PNG de alta resolución con 300 DPI efectivos. | PNG individual o ZIP con todas las páginas |
| 2 | **Extract PDF Images** | Inspecciona y extrae imágenes incrustadas dentro del PDF. Permite seleccionar una, varias o todas. | PNG (con canal alfa) o JPG (con fondo blanco para transparencias) |
| 3 | **Images to PDF** | Combina una o más imágenes en un solo PDF. Soporta tamaños A3, A4, A5 y tamaño original, con orientación automática y centrado sin deformación ni recorte. | Documento PDF |
| 4 | **Merge PDF** | Combina dos o más archivos PDF en el orden establecido. Preserva texto vectorial, imágenes y enlaces sin rasterización. | Documento PDF |
| 5 | **Split PDF** | Divide un PDF por páginas individuales o rangos especificados (`1-3, 5, 8-10`). Valida numeración 1-based, sin solapamientos ni rangos invertidos. | PDFs individuales o paquete ZIP |
| 6 | **Extract PDF Texts** | Extrae el texto digital estructurado página por página con separadores (`--- Página X ---`). Informa si el PDF no contiene texto seleccionable (escaneos). | Visualización interactiva, copiado rápido y archivo TXT |
| 7 | **Convert PDF to Word** | Convierte las páginas de un PDF en un documento Word (.docx) preservando la apariencia visual exacta como imágenes de alta resolución. | Archivo Word (.docx) |

---

## 🏛️ Arquitectura del Sistema

```
pdftools/
├── backend/
│   ├── src/
│   │   ├── config/env.ts             # Validación Zod de variables de entorno
│   │   ├── controllers/              # Controladores REST (ToolsController, TaskController)
│   │   ├── middleware/               # Manejo de errores centralizado y carga Multer
│   │   ├── routes/api.routes.ts      # Enrutamiento /api
│   │   ├── services/                 # Servicios (task.service, file.service, python.service)
│   │   ├── validators/               # Validadores de magic bytes y rangos de páginas
│   │   └── index.ts                  # Servidor Express
│   ├── python/
│   │   ├── processors/               # Scripts CLI independientes para cada herramienta
│   │   ├── common/utils.py           # Utilidades compartidas (JSON stdout, zip, errores)
│   │   └── requirements.txt          # Dependencias de Python
│   ├── storage/                      # Almacenamiento temporal aislado por taskId
│   └── tests/                        # Suite de pruebas unitarias y E2E (Vitest)
├── frontend/
│   ├── src/
│   │   ├── components/               # Componentes UI (Navbar, FileDropzone, SortableFileList, etc.)
│   │   ├── services/api.ts           # Cliente API con polling inteligente y tipado estricto
│   │   ├── types/                    # Tipos e interfaces TypeScript
│   │   ├── App.tsx                   # Aplicación principal y catálogo
│   │   └── main.tsx                  # Entrada React 19
│   └── vite.config.ts                # Configuración Vite con Tailwind CSS v4
├── shared/
│   └── types/index.ts                # Contratos y tipos compartidos
└── README.md
```

### Principios de diseño
- **Aislamiento por tarea**: Cada solicitud genera un `taskId` (UUID v4) con su propio subdirectorio en `storage/<taskId>/`.
- **Seguridad**: Nombres aleatorizados internamente, prevención de Path Traversal, validación de firmas de archivo (*magic numbers*), sin inyección de comandos shell (uso de argumentos `spawn` estructurados).
- **Retención y purga**: Tareas y archivos temporales son eliminados automáticamente tras vencer el tiempo de retención (`TASK_RETENTION_HOURS`).

---

## 📋 Requisitos Previos

- **Node.js**: v20.x, v22.x o v24.x (probado en Node.js v24).
- **npm**: v10.x o v11.x.
- **Python**: v3.10 o superior (probado en Python 3.11 y 3.14).

---

## ⚡ Instalación

### 1. Clonar o acceder al proyecto
```bash
cd d:\www\pdftools
```

### 2. Instalar dependencias de Python
```bash
python -m pip install -r backend/python/requirements.txt
```

*Librerías principales instaladas:*
- `PyMuPDF (fitz)`: Renderizado de alta resolución, combinación vectorial, división y extracción de texto/imágenes.
- `Pillow (PIL)`: Manejo de formatos de imagen, fondo blanco para canal alfa en JPG y cálculo de dimensiones.
- `python-docx`: Generación de documentos Word (.docx) válidos.

### 3. Instalar dependencias de Node.js
```bash
# Backend:
cd backend
npm install

# Frontend:
cd ../frontend
npm install

cd ..
```

---

## ⚙️ Configuración (.env)

Crea o edita el archivo `backend/.env` (puedes basarte en `backend/.env.example`):

```env
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
PYTHON_EXECUTABLE=python
UPLOAD_MAX_FILE_SIZE_MB=300
UPLOAD_MAX_FILES=20
TASK_RETENTION_HOURS=2
TASK_TIMEOUT_SECONDS=300
MAX_CONCURRENT_TASKS=2
STORAGE_DIR=./storage
```

---

## 🚀 Ejecución en Desarrollo

### Opción 1 — Ambos servicios al mismo tiempo (Recomendado)
Desde la raíz del proyecto:
```bash
npm run dev
```
O ejecutando el script directo en Windows:
- Doble clic o comando: `.\dev.bat` (o `.\dev.ps1`)

Esto levantará concurrentemente:
- **Backend API**: `http://localhost:3000`
- **Frontend SPA**: `http://localhost:5173`

### Opción 2 — En terminales separadas
- **Terminal 1 (Backend)**: `npm run dev:backend`
- **Terminal 2 (Frontend)**: `npm run dev:frontend`

Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integración end-to-end con Vitest y Python:

```bash
# Ejecutar todas las pruebas de backend (unitarias, validadores, servicios y E2E):
npm run test:backend

# Ejecutar verificación directa de procesadores Python:
python backend/tests/test_processors.py

# Verificación de tipos TypeScript en todo el monorepo:
npm run typecheck
```

---

## 🌐 Endpoints de la API REST

| Método | Endpoint | Parámetros / Body (multipart/form-data) | Descripción |
|---|---|---|---|
| `POST` | `/api/pdf-to-images` | `file` (PDF), `dpi` (opcional, ej. 300) | Crea tarea para renderizar páginas a PNG |
| `POST` | `/api/extract-pdf-images` | `file` (PDF), `format` ('png'/'jpg'), `inspect` ('true'/'false'), `selectedIds` (opcional) | Inspecciona o extrae imágenes incrustadas |
| `POST` | `/api/images-to-pdf` | `files` (imágenes), `pageSize` ('A3'/'A4'/'A5'/'original'), `fileOrder` (JSON) | Convierte imágenes en un único PDF |
| `POST` | `/api/merge-pdf` | `files` (mínimo 2 PDFs), `fileOrder` (JSON) | Combina PDFs sin rasterizar |
| `POST` | `/api/split-pdf` | `file` (PDF), `ranges` (ej. `1-3, 5, 8-10`) | Divide el PDF en los rangos especificados |
| `POST` | `/api/extract-pdf-text` | `file` (PDF) | Extrae el texto digital estructurado |
| `POST` | `/api/pdf-to-word` | `file` (PDF) | Convierte a DOCX con fidelidad visual |
| `GET` | `/api/tasks/:taskId` | `:taskId` (UUID) | Consulta el estado, progreso y resultados |
| `GET` | `/api/tasks/:taskId/files/:fileId` | `:taskId`, `:fileId`, `inline` (opcional) | Descarga un archivo o genera vista previa |
| `DELETE` | `/api/tasks/:taskId` | `:taskId` (UUID) | Elimina la tarea y sus archivos físicos |
| `POST` | `/api/storage/clean` | Ninguno | Purga todos los archivos temporales de `backend/storage` |

---

## ⚠️ Limitaciones Conocidas

- **Convert PDF to Word**: Las páginas se insertan como imágenes de alta fidelidad para preservar exactamente tipografías, vectores y maquetación. No produce texto editable.
- **Extract PDF Texts**: Extrae la capa de texto digital de documentos generados digitalmente. Documentos escaneados sin capa OCR informarán que no contienen texto seleccionable.
- **Extract PDF Images**: Extrae objetos de imagen matriciales incrustados en el flujo PDF (XObjects). Los gráficos vectoriales nativos no se consideran imágenes incrustadas.
- **Documentos con contraseña**: Los PDFs encriptados o con clave de apertura son rechazados informando al usuario el motivo.

---

## 🔧 Solución de Problemas Frecuentes

1. **`python: command not found` o error al invocar procesadores**:
   Configura la variable `PYTHON_EXECUTABLE` en tu archivo `backend/.env` con la ruta completa a tu ejecutable de Python (por ejemplo `C:\Users\...\python.exe` en Windows o `/usr/bin/python3` en Linux).

2. **Error al cargar archivos superiores a 300 MB**:
   Aumenta el valor de `UPLOAD_MAX_FILE_SIZE_MB` en el archivo `backend/.env`.

3. **CORS o error de conexión entre frontend y backend**:
   Verifica que `PORT=3000` en backend y `FRONTEND_ORIGIN=http://localhost:5173` coincidan con la URL donde se ejecuta Vite.
