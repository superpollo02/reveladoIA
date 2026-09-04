====================================================
ESTUDIO DE REVELADO IA - GUIA RAPIDA DE INSTALACION
====================================================

1. REQUISITOS
   - Node.js (v18+)
   - npm

2. INSTALACION
   Ejecuta el siguiente comando en la raiz del proyecto:
   > npm install

3. EJECUCION (DESARROLLO)
   Para iniciar el servidor local:
   > npm run dev
   
   La app se abrira en: http://localhost:3000

4. COMPILACION (PRODUCCION)
   Para generar la version final de la aplicacion:
   > npm run build

5. NOTA SOBRE IA
   El sistema requiere una clave de API de Google Gemini para
   la generacion de imagenes. En entornos locales, asegurate
   de configurar la variable VITE_GEMINI_API_KEY en tu .env

6. DOCUMENTACION ADICIONAL
   - MANUAL_DE_USO.md: Guia funcional para el usuario.
   - SOFTWARE_DESIGN_DOCUMENT.md: Detalles de arquitectura.
   - README.md: Version enriquecida de esta guia.
====================================================
