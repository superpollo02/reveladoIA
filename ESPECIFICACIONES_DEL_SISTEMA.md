# Especificaciones del Sistema - Estudio de Revelado IA

Este documento compila de manera integral las capacidades funcionales y los fundamentos técnicos que constituyen el **Estudio de Revelado IA**, proporcionando una visión 360° del producto tanto para usuarios finales como para desarrolladores.

---

## 1. Especificaciones Funcionales (Product Scope)

El sistema está diseñado como una estación de trabajo profesional para la creación y curaduría de imágenes asistidas por Inteligencia Artificial.

### 1.1 Motor de Creación y Dirección Artística
*   **Ingeniería de Prompts Proactiva**: Capacidad de transformar descripciones simples en directrices técnicas de iluminación y composición mediante el motor Gemini.
*   **Sugerencias Contextuales**: Sistema de autocompletado semántico que propone palabras clave basadas en el contenido actual del lienzo.
*   **Matriz de Estilos Dinámica**: Galería de estéticas preconfiguradas con previsualización en tiempo real (Tooltips HD) que inyectan ADN visual específico en el revelador.
*   **Laboratorio de Iluminación**: Control físico simulado de fuentes de luz (Studio, Neón, Natural) y direcciones (Contraluz, Cenital, Lateral).

### 1.2 Gestión de Portafolio y Análisis
*   **Galería Inteligente**: Organización mediante carpetas y etiquetas con capacidades de búsqueda instantánea.
*   **Modo Comparación Side-by-Side**: Interfaz dedicada para evaluar dos capturas simultáneamente, comparando sus fichas técnicas (Seeds, Estilos, Prompts) parámetro por parámetro.
*   **Acciones en Lote**: Herramientas de selección múltiple para la exportación masiva de metadatos (JSON) y descarga escalonada de archivos binarios (.png individuales con nombres descriptivos).
*   **Historial de Estudio**: Persistencia de los últimos 10 estados completos del laboratorio para restauración rápida de configuraciones.

### 1.3 Experiencia Inmersiva
*   **Sincronización Atmosférica**: Análisis cromático de las imágenes para adaptar el mood visual de la interfaz.
*   **Modo de Enfoque**: Capacidad de ocultar elementos distractores para concentración total en el revelado.

---

## 2. Especificaciones Técnicas (Architecture & Stack)

El sistema se basa en una arquitectura moderna de alto rendimiento, priorizando la privacidad de los datos y la fluidez de la interfaz.

### 2.1 Stack Tecnológico Core
*   **Runtime**: React 18 + TypeScript (TSX).
*   **Estilizado**: Tailwind CSS v3.
*   **Animaciones**: Framer Motion (Fidelity & Micro-interactions).
*   **Motor de IA**: Google GenAI SDK (Gemini API).
*   **Persistencia Local**: IndexedDB (Browser Storage) para gestión de archivos grandes.

### 2.2 Arquitectura de Servicios (Internal API)
El sistema opera mediante una capa de servicios desacoplados:
*   **`geminiService`**: Gestiona el ciclo de vida de la generación y el refinamiento de lenguaje natural.
*   **`storageService`**: Wrapper sobre IndexedDB que maneja el almacenamiento de Blobs de imagen y el CRUD de metadatos técnicos.
*   **`colorService`**: Motor de procesamiento en Canvas para extracción de paletas RGB y generación de gradientes CSS dinámicos.

### 2.3 Modelo de Datos Principal
Cada captura se representa mediante el objeto `GeneratedImage`:
```typescript
{
  id: string,
  url: string,            // DataURL de la imagen (Blob local)
  prompt: string,         // Instruccion expandida
  userPrompt: string,     // Idea original del usuario
  timestamp: number,      // Unix Epoch
  styleId: string,        // Identificador del preset visual
  config: {               // Parametros tecnicos de revelado
    aspectRatio: string,
    lightSource: string,
    lightDirection: string,
    creativity: number,
    filter: string
  },
  tags: string[],         // Metadatos semanticos
  folder?: string         // Organizacion logica
}
```

### 2.4 Decisiones de Diseño Críticas
1.  **Privacidad Local First**: No se envían imágenes a servidores externos; todo el revelado y almacenamiento ocurre en el navegador del usuario (Client-side persistence).
2.  **Optimización de Latencia**: Uso de Web Workers y procesamiento asíncrono para mantener 60 FPS incluso durante tareas intensivas de análisis de imagen.
3.  **UI Neutra Profesional**: Esquema de color "Dark Studio" diseñado para no interferir en la percepción cromática de las obras generadas.

---

## 3. Requerimientos del Entorno
*   **Navegador**: Compatible con Chrome 100+, Safari 15+, Firefox 90+ (Soporte completo de IndexedDB y Web Canvas).
*   **Conectividad**: Requiere conexión a internet para las llamadas al motor de IA Gemini.
*   **Memoria**: Recomendado 8GB RAM para manejo fluido de portafolios grandes (>500 imágenes).
