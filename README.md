# Estudio de Revelado IA - Guía Rápida

¡Bienvenido al Estudio de Revelado IA! Esta es una herramienta profesional de generación y edición fotográfica asistida por inteligencia artificial.

## 🚀 Inicio Rápido

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Requisitos Previos
Asegúrate de tener instalado:
*   **Node.js** (Versión 18 o superior)
*   **npm** (Viene con Node.js)

### 2. Instalación de Dependencias
Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Configuración de API Key
Para que las funciones de IA funcionen fuera del entorno de IA Studio, necesitarás una clave de Google Gemini:
1. Crea un archivo `.env` en la raíz.
2. Añade tu clave: `VITE_GEMINI_API_KEY=tu_clave_aqui`

### 4. Ejecución en Desarrollo
Inicia el servidor local con:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## 🛠️ Comandos Útiles

*   **`npm run build`**: Compila la aplicación para producción en la carpeta `/dist`.
*   **`npm run lint`**: Ejecuta el linter para verificar la calidad y sintaxis del código.
*   **`npm run preview`**: Sirve la versión de producción localmente para pruebas finales.

## 📁 Estructura del Proyecto
*   `App.tsx`: Orquestador principal y punto de entrada.
*   `/components`: Galería, Editor y componentes de UI granular.
*   `/services`: IA (Gemini), Almacenamiento (IndexedDB) y Color.
*   `constants.ts`: Presets de estilo, iluminación y filtros.
*   `types.ts`: Definiciones globales de TypeScript.

---
Para más detalles técnicos, consulta el archivo `SOFTWARE_DESIGN_DOCUMENT.md`.
Para aprender a usar la herramienta, consulta el `MANUAL_DE_USO.md`.
