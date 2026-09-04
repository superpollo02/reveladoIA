# Manual Técnico: Estudio de Revelado IA

## 1. Información General del Proyecto
*   **Nombre del Proyecto:** Estudio de Revelado IA (Fotógrafo Todo en 1)
*   **Versión Actual:** v1.0.0
*   **Fecha de Última Actualización:** 2026-09-03
*   **Autores / Desarrolladores:** Mariano Fischer (marianofischer@gmail.com)
*   **Descripción Breve:** Estudio fotográfico profesional impulsado por IA que permite la conceptualización, generación (Gemini), edición y organización de imágenes de alta fidelidad, con almacenamiento local persistente y análisis cromático en tiempo real.

## 2. Arquitectura y Stack Tecnológico
Detalle de las tecnologías utilizadas en el desarrollo:
*   **Frontend:** React 18 (Hooks, Context API), TypeScript, Tailwind CSS (JIT), Framer Motion.
*   **Backend:** Arquitectura Client-Side (SPA) con servicios de Node.js para proxy de API (opcional en despliegue full-stack).
*   **Base de Datos:** IndexedDB (No Relacional, Local al Navegador) mediante capa de abstracción `storageService`.
*   **Servicios de Terceros / APIs:** Google Gemini API (vía `@google/genai`) para generación de imágenes y procesamiento de lenguaje natural.
*   **Servidores / Hosting:** Optimizado para Google Cloud Run / Vercel / Netlify.

## 3. Requisitos del Sistema
Qué necesita una computadora para ejecutar este software:
*   **Sistema Operativo:** Windows 10+, macOS Monterey+, Linux (Ubuntu/Debian).
*   **Dependencias Globales:** Node.js >= v18.0, npm >= v9.0.
*   **Hardware Mínimo:** 4 GB RAM (8 GB recomendado para portafolios grandes), Conexión a Internet activa.

## 4. Instalación y Configuración del Entorno
Pasos para configurar el proyecto localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/marianofischer/estudio-revelado-ia
    cd estudio-revelado-ia
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente configuración:
    *   `VITE_GEMINI_API_KEY`: Clave de acceso a la API de Google Gemini (obligatoria).
    *   `PORT`: Puerto local (por defecto 3000).

3.  **Instalar dependencias:**
    ```bash
    npm install
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

## 5. Estructura de Directorios
Explicación de la organización del proyecto:
```text
/estudio-revelado-ia
├── /components       # Componentes React (Gallery, ImageEditor, UI)
├── /services         # Lógica de negocio (IA, Storage, Color Analysis)
├── App.tsx           # Orquestador y punto de entrada de la app
├── types.ts          # Definiciones de tipos e interfaces globales
├── constants.ts      # Configuración de presets y estilos
├── index.html        # Punto de entrada HTML
├── package.json      # Configuración de npm y scripts
└── README.md         # Guía de inicio rápido
```

## 6. Endpoints y Servicios Internos
Al ser una aplicación de persistencia local, la "API" reside en los servicios de TypeScript:

*   **IA (geminiService):**
    *   `generateImageWithNano`: Envía prompts y configs al modelo de imagen.
    *   `refinePrompt`: Expansión semántica de ideas del usuario.
*   **Almacenamiento (storageService):**
    *   Implementa el CRUD sobre IndexedDB para objetos `GeneratedImage` y Blobs de imagen.
*   **Análisis Visual (colorService):**
    *   Procesamiento en Canvas para extracción de paletas dominantes.

## 7. Despliegue (Deployment)
1.  **Comando para compilar (Build):**
    ```bash
    npm run build
    ```
2.  **Plataforma:** Despliegue recomendado en plataformas de hosting estático o contenedores Cloud Run.
3.  **Comando de arranque en producción:** 
    ```bash
    npm run preview
    ```

## 8. Mantenimiento y Solución de Problemas
*   **Logs:** Los errores de generación de IA y persistencia se registran en la consola del desarrollador (DevTools).
*   **Errores Comunes:**
    *   *Quota Exceeded (Gemini):* La API ha alcanzado su límite de peticiones gratuitas.
    *   *Storage Full:* El navegador ha limitado el espacio de IndexedDB. Se recomienda borrar imágenes pesadas de la galería.
    *   *Invalid API Key:* Verificar que la variable `VITE_GEMINI_API_KEY` sea correcta y tenga permisos de generación de imágenes.
