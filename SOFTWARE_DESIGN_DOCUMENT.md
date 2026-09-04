# Documento de Diseño de Software (SDD) - Estudio de Revelado IA

## 1. Visión General
El **Estudio de Revelado IA** es una aplicación web de alto rendimiento diseñada para fotógrafos y artistas visuales. El sistema permite la generación, edición, organización y análisis de imágenes mediante modelos de inteligencia artificial generativa, priorizando una experiencia de usuario (UX) fluida y una gestión de datos local segura.

## 2. Arquitectura del Sistema
La aplicación sigue una arquitectura de **Single Page Application (SPA)** basada en React, con una clara separación entre la capa de presentación y la capa de servicios lógicos.

### 2.1 Tecnologías Core
*   **Frontend**: React 18 con TypeScript para un tipado estricto.
*   **Estilizado**: Tailwind CSS (JIT) para una interfaz de baja latencia y alta fidelidad visual.
*   **Animaciones**: Framer Motion (`motion/react`) para transiciones de estado y micro-interacciones.
*   **IA**: Integración con Google Gemini API para ingeniería de prompts y generación de imágenes.
*   **Persistencia**: IndexedDB (vía `storageService`) para almacenamiento masivo de binarios (imágenes) y metadatos.

## 3. Descomposición de Componentes

### 3.1 Orquestador Principal (`App.tsx`)
Actúa como el cerebro del sistema en la raíz del proyecto. Gestiona el estado global:
*   Estado de generación (idle, generating, success, error).
*   Imagen activa y selección de la galería.
*   Modos de visualización (Enfoque, Galería, Editor).
*   Sincronización de atmósfera cromática mediante `colorService`.
*   Configuración de prompts recientes (Top 10).

### 3.2 Sistema de Galería Inteligente (`Gallery.tsx`)
Un módulo complejo que maneja:
*   **Virtualización de Lista**: Filtrado y búsqueda en tiempo real sobre el catálogo local.
*   **Modo Comparación**: Lógica de selección dual para análisis lado a lado (Side-by-Side).
*   **Modo Selección Múltiple**: Gestión de arreglos de IDs para acciones en lote (borrado, exportación JSON).

### 3.3 Laboratorio de Revelado (`components/UI.tsx` / `App.tsx`)
Controles creativos que transforman parámetros humanos en tokens técnicos para la IA:
*   **Matriz de Estilos**: Mapeo de configuraciones visuales a prompts negativos y positivos.
*   **Tooltips Proactivos**: Previsualización de "ADN visual" mediante el componente `StylePreviewTooltip`.
*   **Editor de Imágenes (`components/ImageEditor.tsx`)**: Herramientas de retoque y máscaras para refinamiento post-generación.

## 4. Servicios y Lógica de Negocio

### 4.1 `geminiService.ts`
Encapsula la comunicación con la API de Gemini. Implementa:
*   **Refinamiento de Prompts**: Transformación de ideas básicas en descripciones técnicas profesionales.
*   **Sugerencias Mágicas**: Análisis semántico para proponer keywords contextuales.

### 4.2 `storageService.ts`
Implementa un wrapper sobre IndexedDB. 
*   **Decisión de Diseño**: Se eligió IndexedDB sobre LocalStorage debido al tamaño de los blobs de imagen (PNG/WebP) que superan los límites habituales de 5MB del navegador.

### 4.3 `colorService.ts`
Servicio de análisis cromático:
*   Utiliza un elemento `canvas` oculto para realizar un downsampling de la imagen generada.
*   Extrae el color dominante y genera un gradiente radial dinámico que se aplica al `aside` de la aplicación mediante variables de estado, creando una "atmósfera" inmersiva.

## 5. Decisiones de Diseño Críticas

### 5.1 Enfoque en "Zero Latency"
Para evitar que la UI se sienta pesada durante la generación de imágenes, se utiliza una arquitectura de promesas no bloqueantes y estados de carga (skeletons) que mantienen la interactividad de la barra lateral mientras el modelo trabaja en segundo plano.

### 5.2 Estética "Dark Studio"
Se optó por una paleta de neutros profundos (Nano-100 a Nano-900) para minimizar la fatiga visual y asegurar que los colores de las imágenes generadas sean los protagonistas absolutos de la pantalla.

### 5.3 UX de "Prompts Recientes"
Se implementó un sistema de persistencia híbrida: los prompts se guardan en `localStorage` para acceso instantáneo al recargar, mientras que las imágenes pesadas viven en IndexedDB para no saturar el canal de sincronización del navegador.

## 6. Flujo de Datos
1. El usuario define una **Visión Visual**.
2. El `geminiService` expande la visión con parámetros técnicos.
3. La imagen se genera y se guarda en **IndexedDB**.
4. El `colorService` analiza la imagen y actualiza el **Mood de la UI**.
5. El usuario organiza la captura en la **Galería** o la refina en el **Editor**.
