# PDF Tools App — Plan de implementación

## 1. Objetivo del proyecto

Desarrollar una aplicación web para trabajar con archivos PDF, inspirada en la organización y facilidad de uso de PDF24 Tools:

https://tools.pdf24.org/es/todas-las-herramientas

La aplicación ofrecerá siete herramientas independientes para convertir, combinar, dividir y extraer contenido de documentos PDF.

El objetivo de esta especificación es servir como documento de ejecución para una IA de desarrollo. Por lo tanto, las decisiones técnicas, los límites del aplicación, los contratos entre frontend y backend, los criterios de aceptación y las reglas de implementación deben respetarse durante el desarrollo.

### Principios generales

- Priorizar una experiencia sencilla: cada herramienta debe poder utilizarse sin conocimientos técnicos.
- Procesar los archivos en el servidor, salvo que una operación se implemente deliberadamente en el navegador y se justifique esa decisión.
- Mantener el procesamiento aislado por tarea y por usuario/sesión.
- No modificar nunca los archivos originales.
- Informar claramente el progreso, los errores y la disponibilidad de las descargas.
- Mantener una arquitectura modular para poder incorporar nuevas herramientas sin reescribir las existentes.
- No implementar funcionalidades ficticias ni dejar botones sin comportamiento.

---

## 2. Alcance funcional

La aplicación completa incluirá estas siete herramientas:

1. PDF to Images
2. Extract PDF Images
3. Images to PDF
4. Merge PDF
5. Split PDF
6. Extract PDF Texts
7. Convert PDF to Word

El alcance funcional de esta aplicación está compuesto por las siete herramientas definidas en este documento. No agregar herramientas adicionales sin autorización.

### 2.1. PDF to Images

**Objetivo:** convertir todas las páginas de un PDF en imágenes PNG.

**Flujo de usuario:**

1. El usuario selecciona o arrastra un archivo PDF.
2. La aplicación valida el archivo y muestra sus datos básicos: nombre, tamaño y cantidad de páginas, si esta información puede obtenerse antes de convertir.
3. El usuario inicia la conversión.
4. El backend convierte cada página a PNG con una resolución de 300 DPI.
5. La interfaz muestra el resultado y permite:
   - Descargar una página individual.
   - Descargar todas las páginas en un único archivo ZIP.

**Reglas:**

- Mantener la proporción y orientación de cada página.
- No recortar el contenido.
- Nombrar los archivos de forma ordenada, por ejemplo: `documento-page-001.png`.
- La resolución debe ser de 300 DPI efectivos, no simplemente cambiar los metadatos de resolución.
- El ZIP debe conservar el orden de las páginas.

**Criterios de aceptación:**

- Un PDF válido produce una imagen PNG por página.
- Las imágenes tienen la resolución de renderizado solicitada.
- La descarga individual y la descarga ZIP funcionan.
- Los errores de PDFs dañados, protegidos o no compatibles se muestran de forma comprensible.

### 2.2. Extract PDF Images

**Objetivo:** extraer las imágenes incrustadas en un PDF.

**Flujo de usuario:**

1. El usuario carga un PDF.
2. El backend analiza el documento y devuelve el listado de imágenes detectadas.
3. La interfaz muestra una galería de miniaturas.
4. El usuario puede seleccionar una, varias o todas las imágenes.
5. El usuario elige el formato de salida: PNG o JPG.
6. El usuario descarga cada imagen individualmente o todas las seleccionadas en un ZIP.

**Reglas:**

- Extraer imágenes incrustadas; no confundir esta operación con renderizar cada página completa.
- Mostrar, cuando sea posible, dimensiones, formato original y página de procedencia.
- Mantener una referencia estable para cada imagen durante la tarea.
- Si una imagen no puede convertirse al formato solicitado, informar el error sin cancelar innecesariamente las demás conversiones.
- La conversión a JPG debe contemplar transparencias: aplicar un fondo blanco antes de generar el JPG.
- No prometer que se extraerán elementos vectoriales como imágenes: quedan fuera del alcance de esta herramienta.

**Criterios de aceptación:**

- Se muestran las imágenes incrustadas que la biblioteca de procesamiento puede recuperar.
- La selección múltiple funciona.
- Las descargas individuales y ZIP contienen únicamente las imágenes seleccionadas.
- PNG conserva la transparencia cuando el formato de origen y el procesamiento lo permiten.
- JPG se genera correctamente y no contiene canal alfa.

### 2.3. Images to PDF

**Objetivo:** crear un único PDF a partir de una o varias imágenes.

**Flujo de usuario:**

1. El usuario carga una o varias imágenes.
2. La interfaz muestra una lista de archivos con miniaturas.
3. El usuario modifica el orden mediante controles accesibles de mover arriba/abajo y, si se implementa, arrastrar y soltar.
4. El usuario elige el tamaño de página:
   - A3
   - A4
   - A5
   - Tamaño original
5. El usuario genera y descarga el PDF.

**Reglas:**

- Admitir como mínimo PNG y JPG/JPEG.
- Respetar el orden indicado en la interfaz.
- Para A3, A4 y A5, utilizar orientación automática según la proporción de la imagen, salvo que se defina posteriormente un selector de orientación.
- Ajustar la imagen dentro de la página sin deformarla.
- Por defecto, centrar la imagen y conservar toda su superficie visible. No recortar.
- En modo «Tamaño original», crear una página según las dimensiones físicas de la imagen cuando sus metadatos permitan determinarlas; si no existen, usar una regla documentada y consistente basada en DPI configurable o un valor predeterminado.
- Evitar una compresión que degrade innecesariamente la calidad.

**Criterios de aceptación:**

- Se genera un PDF con una página por imagen.
- El orden coincide con el orden elegido.
- Los tamaños A3, A4 y A5 se aplican correctamente.
- Las imágenes mantienen su proporción y no se recortan en el comportamiento predeterminado.

### 2.4. Merge PDF

**Objetivo:** combinar dos o más archivos PDF en un único documento.

**Flujo de usuario:**

1. El usuario carga al menos dos PDFs.
2. La interfaz presenta los archivos en una lista ordenable.
3. El usuario modifica el orden.
4. El usuario inicia la combinación y descarga el PDF resultante.

**Reglas:**

- Mantener el orden definido por el usuario.
- Preservar, en la medida que permita la biblioteca elegida, el tamaño de página, orientación, texto, imágenes y enlaces.
- No rasterizar las páginas como método de combinación.
- Informar si un archivo está dañado, protegido por contraseña o no puede incorporarse.
- La primera versión no necesita ofrecer edición de marcadores, formularios o metadatos.

**Criterios de aceptación:**

- Se requieren al menos dos archivos PDF.
- El PDF resultante contiene todas las páginas de los archivos en el orden elegido.
- El contenido no se rasteriza.
- Un archivo inválido genera un error claro y no produce un resultado engañoso.

### 2.5. Split PDF

**Objetivo:** extraer uno o varios rangos de páginas de un PDF y generar un PDF por cada rango.

**Flujo de usuario:**

1. El usuario carga un PDF.
2. La interfaz muestra el total de páginas y, si es viable, miniaturas de las páginas.
3. El usuario define uno o más rangos de páginas.
4. La aplicación valida los rangos.
5. El backend genera un PDF por rango.
6. El usuario descarga cada sección individualmente o todas juntas en un ZIP.

**Formato de entrada de rangos:**

- Página individual: `3`
- Rango: `2-5`
- Varios rangos: `1-3, 5, 8-10`

**Reglas:**

- La numeración de páginas comienza en 1.
- No permitir páginas iguales a cero, negativas o mayores que el total del documento.
- No permitir rangos invertidos.
- Detectar entradas vacías o mal formadas y explicar cómo corregirlas.
- Los rangos deben conservar el orden escrito por el usuario.
- No duplicar páginas silenciosamente. Si hay solapamientos entre rangos, validar y solicitar corrección o aplicar una política explícita y documentada.
- Cada rango genera un PDF independiente.

**Criterios de aceptación:**

- Se aceptan páginas individuales y rangos.
- La validación impide rangos inválidos.
- Cada PDF resultante contiene exactamente las páginas indicadas.
- Las descargas individuales y ZIP funcionan.

### 2.6. Extract PDF Texts

**Objetivo:** extraer el texto digital de un PDF y permitir consultarlo, copiarlo y descargarlo.

**Flujo de usuario:**

1. El usuario carga un PDF.
2. El backend extrae el texto por página.
3. La interfaz muestra el texto extraído.
4. El usuario puede copiar el texto completo o descargarlo como TXT.

**Reglas:**

- Mantener separadores claros entre páginas, por ejemplo `--- Página 1 ---`.
- Preservar, en la medida de lo posible, los saltos de línea y el orden de lectura.
- Informar si el PDF no contiene texto seleccionable o si algunas páginas no devuelven texto.
- La primera versión extrae texto digital. No incluye OCR para documentos escaneados.
- No inventar ni reconstruir texto que no exista en el contenido extraíble.

**Criterios de aceptación:**

- El texto se muestra en la interfaz.
- El botón de copiar copia el contenido completo.
- El archivo TXT contiene el mismo texto que se muestra, incluidos los separadores de página.
- Los PDFs escaneados sin capa de texto muestran una advertencia clara.

### 2.7. Convert PDF to Word

**Objetivo:** generar un documento DOCX a partir de un PDF.

**Decisión funcional:** convertir cada página del PDF en una imagen e insertar una imagen por página en un documento Word. Este enfoque prioriza conservar la apariencia visual del documento original. El resultado no será texto editable.

**Flujo de usuario:**

1. El usuario carga un PDF.
2. La aplicación informa que el resultado prioriza la fidelidad visual y que el contenido se insertará como imágenes.
3. El usuario inicia la conversión.
4. El backend renderiza cada página e inserta la imagen correspondiente en una página del DOCX.
5. El usuario descarga el archivo Word.

**Reglas:**

- Mantener el orden de las páginas.
- Respetar, en la medida de lo posible, el tamaño y orientación de cada página.
- Mantener la proporción de las imágenes.
- Utilizar una resolución adecuada para lectura e impresión; definirla como configuración interna documentada.
- No presentar esta función como conversión a texto editable.
- La herramienta debe comunicar claramente que el DOCX generado contiene páginas como imágenes y, por lo tanto, no ofrece texto editable. La conversión a Word editable no forma parte de la funcionalidad solicitada.

**Criterios de aceptación:**

- Se genera un DOCX válido que abre en Microsoft Word y LibreOffice Writer.
- Cada página del PDF aparece en el mismo orden como una imagen en el documento.
- La orientación y proporción de las páginas se conservan.
- La interfaz comunica claramente la limitación de edición.

---

## 3. Tecnologías

Utilizar TypeScript en frontend y backend. Python se utilizará únicamente para las operaciones PDF que requieran bibliotecas o herramientas especializadas.

### 3.1. Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Responsabilidades:

- Interfaz y navegación entre herramientas.
- Selección y validación preliminar de archivos.
- Gestión de estado de cada tarea.
- Envío de archivos y parámetros al backend.
- Visualización del progreso y de los resultados.
- Descarga de archivos generados.
- Gestión y presentación de errores.

### 3.2. Backend

- Node.js
- Express
- TypeScript
- Python para procesamiento especializado de PDFs e imágenes.

Responsabilidades:

- Exponer una API REST.
- Validar las solicitudes y los archivos recibidos.
- Crear y administrar tareas de procesamiento.
- Invocar los procesos Python cuando corresponda.
- Gestionar archivos temporales y resultados.
- Proporcionar el estado de las tareas y las rutas de descarga.
- Limpiar archivos temporales y manejar errores de forma segura.

### 3.3. Selección de bibliotecas

Antes de implementar cada herramienta, verificar que las bibliotecas elegidas:

- Sean compatibles con el sistema operativo objetivo.
- Tengan mantenimiento y documentación suficientes.
- Permitan realizar la operación requerida sin degradar innecesariamente el documento.
- Tengan licencias compatibles con el proyecto.
- No requieran servicios externos o subir documentos a terceros.

No instalar dependencias por anticipado sin una necesidad concreta. Registrar en el README las bibliotecas seleccionadas, su propósito y cualquier dependencia del sistema operativo.

---

## 4. Arquitectura general

Separar la aplicación en tres capas:

1. **Frontend React:** experiencia de usuario.
2. **Backend Express:** API, validación, coordinación de tareas y archivos.
3. **Procesadores Python:** operaciones de conversión y extracción.

El frontend nunca debe ejecutar comandos del sistema ni acceder directamente al sistema de archivos del servidor.

El backend debe invocar Python mediante un servicio centralizado. No duplicar lógica de ejecución de procesos en los controladores.

### 4.1. Flujo general de procesamiento

1. El frontend envía el archivo y los parámetros a un endpoint.
2. El backend valida tipo, tamaño y parámetros.
3. El backend crea un identificador único de tarea.
4. El archivo se guarda en un directorio temporal asociado a esa tarea.
5. El backend ejecuta el servicio correspondiente.
6. El procesador genera los archivos de salida en el directorio de la tarea.
7. El backend registra el resultado y actualiza el estado.
8. El frontend consulta el estado o recibe actualizaciones.
9. El usuario descarga los resultados.
10. Los archivos temporales se eliminan según la política de retención.

### 4.2. Estados de una tarea

Utilizar estados consistentes:

- `queued`: pendiente de procesamiento.
- `processing`: en ejecución.
- `completed`: finalizada correctamente.
- `failed`: finalizada con error.
- `expired`: resultados vencidos y eliminados.

Cada tarea debe incluir, como mínimo:

- `taskId`
- `tool`
- `status`
- `createdAt`
- `updatedAt`
- `progress` (porcentaje o etapa, si puede calcularse de forma fiable)
- `error` (solo cuando corresponda)
- `outputs` (archivos disponibles para descargar)

No mostrar porcentajes inventados. Si no se puede calcular un progreso real, mostrar etapas como «Preparando», «Procesando» y «Generando archivos».

---

## 5. Estructura del proyecto

Mantener una estructura modular y separar responsabilidades por herramienta.

```text
pdftools/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── task.service.ts
│   │   │   ├── file.service.ts
│   │   │   └── python.service.ts
│   │   ├── validators/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── python/
│   │   ├── processors/
│   │   │   ├── pdf_to_images.py
│   │   │   ├── extract_pdf_images.py
│   │   │   ├── images_to_pdf.py
│   │   │   ├── merge_pdf.py
│   │   │   ├── split_pdf.py
│   │   │   ├── extract_pdf_text.py
│   │   │   └── pdf_to_word.py
│   │   ├── common/
│   │   └── requirements.txt
│   ├── storage/
│   │   └── .gitkeep
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── upload/
│   │   │   ├── results/
│   │   │   └── tools/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── shared/
│   └── types/
├── README.md
├── package.json
└── .gitignore
```

La estructura puede ajustarse si existe una razón técnica concreta, pero no se deben mezclar componentes visuales, llamadas HTTP y lógica de procesamiento en un único archivo.

---

## 6. Diseño de la interfaz

### 6.1. Dirección visual

- Diseño moderno, limpio y profesional.
- Tema oscuro como apariencia predeterminada.
- Diseño responsive para escritorio, tablet y móvil.
- Jerarquía visual clara y navegación sencilla.
- Tarjetas diferenciadas para las siete herramientas.
- Iconografía coherente.
- Contraste suficiente y estados visibles para foco, selección, carga, éxito y error.
- Evitar animaciones innecesarias que dificulten el uso.

### 6.2. Pantallas principales

**Inicio**

- Presentación breve de la aplicación.
- Acceso a las siete herramientas mediante tarjetas.
- Nombre, icono y descripción corta de cada herramienta.

**Pantalla de herramienta**

Cada herramienta debe compartir una estructura visual:

1. Título y descripción.
2. Zona de carga de archivos.
3. Opciones específicas de la herramienta.
4. Acción principal.
5. Estado/progreso del procesamiento.
6. Panel de resultados y descargas.

### 6.3. Componentes reutilizables

Crear componentes compartidos para:

- `ToolCard`
- `FileDropzone`
- `FileList`
- `FilePreview`
- `SortableFileList`
- `PageThumbnailGrid`
- `ProgressIndicator`
- `ErrorMessage`
- `EmptyState`
- `ResultPanel`
- `DownloadButton`
- `ConfirmDialog`

No crear abstracciones excesivamente genéricas. Los componentes compartidos deben resolver patrones que realmente se repitan.

### 6.4. Experiencia de carga

- Permitir seleccionar archivos desde el explorador y arrastrarlos a la zona de carga.
- Mostrar nombre, tamaño y tipo de cada archivo.
- Permitir quitar archivos antes de iniciar el procesamiento.
- Validar extensiones y tipos MIME en frontend y backend.
- Mostrar límites de tamaño y cantidad de archivos.
- Deshabilitar la acción principal cuando falten datos obligatorios.
- No depender exclusivamente del color para comunicar errores o estados.

---

## 7. API REST propuesta

Usar un prefijo común `/api`.

Los endpoints deben mantener respuestas consistentes y códigos HTTP adecuados. Los nombres siguientes son una propuesta de contrato; se pueden ajustar antes de comenzar, pero frontend y backend deben compartir una única definición.

### 7.1. Endpoints

| Método   | Endpoint                           | Descripción                                        |
| -------- | ---------------------------------- | -------------------------------------------------- |
| `POST`   | `/api/pdf-to-images`               | Crear tarea de PDF a PNG                           |
| `POST`   | `/api/extract-pdf-images`          | Crear tarea de extracción de imágenes              |
| `POST`   | `/api/images-to-pdf`               | Crear PDF desde imágenes                           |
| `POST`   | `/api/merge-pdf`                   | Combinar PDFs                                      |
| `POST`   | `/api/split-pdf`                   | Dividir PDF por rangos                             |
| `POST`   | `/api/extract-pdf-text`            | Extraer texto de PDF                               |
| `POST`   | `/api/pdf-to-word`                 | Crear DOCX desde PDF                               |
| `GET`    | `/api/tasks/:taskId`               | Consultar estado y resultados de una tarea         |
| `GET`    | `/api/tasks/:taskId/files/:fileId` | Descargar un archivo de resultado                  |
| `DELETE` | `/api/tasks/:taskId`               | Solicitar eliminación de los archivos de una tarea |

Los endpoints `POST` deben aceptar `multipart/form-data` cuando reciban archivos. Los parámetros adicionales deben validarse en el backend.

### 7.2. Respuesta al crear una tarea

Ejemplo conceptual:

```json
{
  "taskId": "identificador-unico",
  "tool": "pdf-to-images",
  "status": "queued"
}
```

### 7.3. Respuesta al consultar una tarea

```json
{
  "taskId": "identificador-unico",
  "tool": "pdf-to-images",
  "status": "completed",
  "progress": 100,
  "outputs": [
    {
      "fileId": "archivo-001",
      "name": "document-page-001.png",
      "mimeType": "image/png",
      "size": 245000,
      "downloadUrl": "/api/tasks/identificador-unico/files/archivo-001"
    }
  ],
  "error": null
}
```

Las URLs de descarga deben ser relativas a la API o construirse a partir de la URL base configurada. No exponer rutas físicas del servidor.

### 7.4. Errores

Usar un formato uniforme:

```json
{
  "error": {
    "code": "INVALID_PDF",
    "message": "El archivo PDF no es válido.",
    "details": null
  }
}
```

No devolver trazas internas, rutas locales, comandos ejecutados ni información sensible al cliente.

---

## 8. Seguridad y manejo de archivos

Los documentos pueden contener información privada. La aplicación debe aplicar estas medidas desde el aplicación:

- Validar los archivos en el servidor; no confiar en el nombre, extensión o MIME enviado por el navegador.
- Definir límites configurables de tamaño y cantidad de archivos.
- Generar nombres internos aleatorios; nunca usar directamente el nombre proporcionado como ruta.
- Guardar cada tarea en un directorio aislado.
- Evitar traversal de rutas y acceso a archivos de otras tareas.
- No construir comandos de shell concatenando valores enviados por el usuario.
- Invocar procesos mediante argumentos separados y rutas controladas.
- Limitar tiempo de ejecución, memoria y concurrencia.
- Rechazar archivos que excedan los límites establecidos.
- No registrar el contenido de los documentos ni información sensible.
- Eliminar archivos temporales y resultados vencidos mediante una política configurable.
- No permitir descargar archivos si el `taskId` y `fileId` no pertenecen a la misma tarea.
- Configurar CORS de forma restrictiva para el entorno de producción.
- No exponer el directorio `storage` como contenido estático público.

La aplicación no debe subir documentos a servicios externos. Si en el futuro se propone un servicio externo, deberá solicitarse autorización y documentarse el impacto en privacidad.

---

## 9. Gestión de errores y casos límite

Contemplar, como mínimo:

- Archivo vacío.
- Archivo con extensión incorrecta.
- Archivo cuyo contenido no coincide con el tipo declarado.
- PDF dañado o incompleto.
- PDF protegido por contraseña.
- PDF sin páginas o con páginas no procesables.
- Imagen corrupta o en formato no admitido.
- Rango de páginas inválido.
- Archivo demasiado grande.
- Falta de espacio en disco.
- Tiempo de procesamiento excedido.
- Proceso Python inexistente o con error.
- Interrupción del proceso.
- Descarga de un resultado inexistente o vencido.

Los mensajes para el usuario deben ser claros y accionables. Los logs internos pueden incluir un identificador de error y detalles técnicos, pero nunca el contenido del documento.

---

## 10. Pruebas y calidad

Implementar pruebas desde las primeras herramientas, no al final del proyecto.

### 10.1. Pruebas unitarias

- Validadores de archivos y parámetros.
- Parser de rangos de páginas.
- Generación de nombres de salida.
- Transiciones de estado de las tareas.
- Manejo de errores de los servicios.

### 10.2. Pruebas de integración

- Comunicación entre Express y los procesadores Python.
- Creación y consulta de tareas.
- Generación de resultados.
- Descargas.
- Limpieza de archivos.

### 10.3. Pruebas funcionales

Probar cada herramienta con documentos de referencia que incluyan:

- PDFs de una y varias páginas.
- Diferentes tamaños y orientaciones.
- Texto digital.
- PDFs escaneados.
- Imágenes con transparencia.
- PDFs con varias imágenes incrustadas.
- Archivos grandes dentro de los límites configurados.
- Documentos dañados o protegidos.

### 10.4. Criterios generales de calidad

- TypeScript en modo estricto siempre que sea viable.
- Evitar `any`; justificar cualquier excepción.
- No duplicar lógica de negocio.
- Separar controladores, servicios y validadores.
- Manejar errores de forma centralizada.
- Mantener nombres y contratos consistentes.
- No dejar código muerto, mocks o datos ficticios en funcionalidades presentadas como terminadas.
- Ejecutar lint, typecheck y tests antes de considerar completada una fase.

---

## 11. Plan de implementación y entrega

La IA de desarrollo debe implementar la aplicación completa de forma incremental, con fases pequeñas y verificables. Todas las fases forman parte de la entrega final; ninguna herramienta puede quedar como simulación, placeholder o funcionalidad pendiente.

### Fase 0 — Inspección y decisiones técnicas

1. Revisar el repositorio y su estado actual.
2. Confirmar versiones de Node.js, Python y herramientas del sistema.
3. Verificar bibliotecas candidatas para las siete operaciones.
4. Comprobar licencias y dependencias nativas.
5. Definir límites iniciales de tamaño, concurrencia y retención.
6. Documentar las decisiones técnicas en `README.md`.

**Entregable:** arquitectura y decisiones técnicas documentadas. No comenzar la implementación funcional hasta identificar dependencias y riesgos.

### Fase 1 — Estructura base

1. Crear o ajustar la estructura frontend/backend.
2. Configurar TypeScript, Vite, React, Express y Tailwind CSS.
3. Configurar scripts de desarrollo, build, lint, typecheck y tests.
4. Crear la aplicación Express y el enrutador `/api`.
5. Crear la interfaz principal con navegación a las siete herramientas.
6. Implementar tema oscuro y layout responsive.
7. Crear componentes compartidos iniciales.

**Verificación:** frontend y backend arrancan correctamente; la navegación funciona; no hay errores de compilación.

### Fase 2 — Infraestructura de archivos y tareas

1. Implementar validación de archivos.
2. Implementar almacenamiento temporal aislado por tarea.
3. Implementar el servicio central de ejecución Python.
4. Implementar creación, consulta y eliminación de tareas.
5. Implementar estados, errores y resultados.
6. Implementar descargas seguras.
7. Implementar limpieza por vencimiento.
8. Agregar pruebas unitarias y de integración.

**Verificación:** una tarea de prueba puede crearse, consultarse, finalizar, entregar un archivo y eliminar sus temporales.

### Fase 3 — Implementación integral de PDF to Images

1. Implementar el procesador Python.
2. Integrarlo mediante el servicio de backend.
3. Crear el endpoint.
4. Implementar la pantalla frontend.
5. Agregar descarga individual y ZIP.
6. Probar resolución, orientación, nombres y errores.

**Verificación:** completar el flujo de extremo a extremo con PDFs de referencia.

### Fase 4 — Implementación integral de las herramientas restantes

Implementar cada herramienta de forma independiente, siguiendo el mismo patrón de extremo a extremo. Las siete herramientas deben quedar funcionales y verificadas:

1. Extract PDF Images.
2. Images to PDF.
3. Merge PDF.
4. Split PDF.
5. Extract PDF Texts.
6. Convert PDF to Word.

Para cada herramienta:

- Definir y validar sus parámetros.
- Implementar el procesador.
- Crear el endpoint.
- Implementar la interfaz.
- Añadir pruebas.
- Verificar los criterios de aceptación de su sección.
- Actualizar el README.

No dar por terminada una herramienta ni avanzar acumulando errores críticos. Resolver los problemas detectados y mantener la integración estable durante todo el desarrollo.

### Fase 5 — Integración y robustez

1. Probar los flujos completos de las siete herramientas.
2. Revisar estados de carga, progreso, éxito y error.
3. Probar archivos grandes y límites de concurrencia.
4. Revisar seguridad de rutas y descargas.
5. Verificar limpieza automática de archivos.
6. Corregir problemas responsive y de accesibilidad.
7. Ejecutar build, lint, typecheck y suite de pruebas.

### Fase 6 — Documentación y entrega

1. Completar el README.
2. Documentar requisitos de sistema y dependencias Python.
3. Documentar instalación y ejecución en desarrollo.
4. Documentar configuración de producción.
5. Documentar límites conocidos de cada herramienta.
6. Incluir ejemplos de uso de la API.
7. Verificar que una instalación limpia pueda ejecutarse siguiendo únicamente la documentación.

---

## 12. Requisitos del README

El `README.md` debe incluir:

- Descripción y funcionalidades.
- Capturas de pantalla cuando estén disponibles.
- Arquitectura general.
- Requisitos previos.
- Versiones compatibles de Node.js y Python.
- Instalación de dependencias.
- Configuración de variables de entorno.
- Comandos para desarrollo y producción.
- Instalación de dependencias Python.
- Endpoints de la API.
- Límites de archivos y política de retención.
- Limitaciones conocidas.
- Solución de problemas frecuentes.

Incluir un `.env.example` con todas las variables necesarias y valores de ejemplo no sensibles. No incluir secretos reales.

---

## 13. Variables de configuración

Centralizar la configuración en variables de entorno. Como mínimo:

```env
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
PYTHON_EXECUTABLE=python
UPLOAD_MAX_FILE_SIZE_MB=100
UPLOAD_MAX_FILES=20
TASK_RETENTION_HOURS=2
TASK_TIMEOUT_SECONDS=300
MAX_CONCURRENT_TASKS=2
STORAGE_DIR=./storage
```

Los valores son iniciales y deben poder ajustarse. Validar la configuración al iniciar el backend y fallar con un mensaje claro si falta una variable obligatoria o tiene un valor inválido.

No asumir que el comando `python` existe en todos los sistemas. Documentar cómo configurar `PYTHON_EXECUTABLE` en Windows, Linux y macOS.

---

## 14. Instrucciones operativas para la IA de desarrollo

Estas reglas tienen prioridad durante la implementación:

1. **Inspeccionar antes de modificar.** Revisar los archivos existentes y reutilizar lo que esté bien implementado. No sobrescribir trabajo previo sin entenderlo.
2. **Seguir el alcance.** Implementar únicamente las siete herramientas definidas para el aplicación.
3. **Trabajar por fases.** Completar y verificar una fase antes de avanzar.
4. **No simular funcionalidades.** Si una operación todavía no está implementada, mostrarla como pendiente; no presentar resultados mock como reales.
5. **No inventar contratos.** Mantener sincronizados los tipos compartidos, los endpoints y el frontend.
6. **Validar en backend.** Toda validación crítica debe repetirse en el servidor.
7. **Aislar archivos.** Cada tarea debe trabajar exclusivamente con sus propios archivos.
8. **Evitar soluciones destructivas.** No borrar archivos del usuario ni modificar los documentos originales.
9. **Mantener compatibilidad.** No incorporar dependencias incompatibles con las plataformas objetivo sin documentarlo.
10. **Probar cada cambio.** Ejecutar las pruebas pertinentes y corregir errores antes de continuar.
11. **Informar avances concretos.** Al terminar cada fase, resumir archivos creados/modificados, decisiones tomadas, pruebas ejecutadas y pendientes.
12. **Pedir aclaraciones solo cuando sea necesario.** Si una decisión afecta significativamente el alcance, la privacidad, la calidad del resultado o la compatibilidad, explicar el conflicto y solicitar una decisión. Para detalles menores, elegir una opción razonable y documentarla.

### Formato de cierre de cada fase

Al finalizar cada fase, informar:

- Estado: completada / bloqueada / parcialmente completada.
- Funcionalidades implementadas.
- Archivos relevantes creados o modificados.
- Dependencias agregadas y motivo.
- Comandos de prueba ejecutados y resultados.
- Problemas conocidos.
- Próximo paso recomendado.

---

## 15. Definición de terminado (Definition of Done)

Una herramienta se considera terminada únicamente cuando:

- El flujo completo funciona desde la interfaz hasta el archivo descargable.
- Los parámetros y archivos se validan en frontend y backend.
- Se contemplan errores y casos límite relevantes.
- Los resultados coinciden con los criterios de aceptación.
- Los archivos temporales se gestionan correctamente.
- Existen pruebas automatizadas razonables.
- No quedan botones, enlaces ni estados visuales sin implementar.
- La documentación está actualizada.

La aplicación se considera terminada cuando las siete herramientas cumplen esta definición, la aplicación puede instalarse y desplegarse desde cero siguiendo el README, y los comandos de build, lint, typecheck y tests finalizan correctamente. También deben estar completas la configuración de producción, la gestión de errores, la seguridad, la limpieza automática de archivos y la documentación operativa.
