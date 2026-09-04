
import { GoogleGenAI } from "@google/genai";
import { ART_STYLES, LIGHT_SOURCES, LIGHT_DIRECTIONS, IMAGE_FILTERS } from "../constants";

// Inicialización de la instancia de IA
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refinePrompt = async (userPrompt: string): Promise<string> => {
  if (!userPrompt || userPrompt.trim().length < 3) return userPrompt;
  
  try {
    const ai = getAI();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );
    
    const generationPromise = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert prompt engineer for AI image generators. 
      Your task is to take a simple user prompt and expand it into a detailed, descriptive, and high-quality prompt that will result in a stunning image.
      Focus on:
      - Descriptive adjectives (lighting, texture, atmosphere)
      - Composition details (camera angle, depth of field)
      - Specific artistic elements
      - Maintaining the original intent of the user.
      
      User Prompt: "${userPrompt}"
      
      Return ONLY the enhanced prompt text. Do not include any explanations or introductory text.`,
    });
    
    const response = await Promise.race([generationPromise, timeoutPromise]) as any;
    return response.text?.trim() || userPrompt;
  } catch (error: any) {
    console.error("Prompt Refinement Error:", error);
    if (error.message?.includes("429") || error.status === 429 || JSON.stringify(error).includes("RESOURCE_EXHAUSTED")) {
      console.warn("Quota exceeded for prompt refinement, using original prompt.");
    }
    return userPrompt;
  }
};

export const getMagicSuggestions = async (userPrompt: string): Promise<string[]> => {
  if (!userPrompt || userPrompt.trim().length < 3) return [];
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert prompt engineer for AI image generators. 
      Based on this partial image prompt: "${userPrompt}", suggest 5 short, powerful keywords or 2-3 word phrases that would enhance the visual quality, lighting, or composition. 
      Examples: "cinematic lighting", "8k resolution", "sharp focus", "hyper-realistic", "volumetric fog".
      Return ONLY a JSON array of strings. No other text.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text?.trim() || "[]";
    try {
      return JSON.parse(text);
    } catch {
      // Fallback if JSON parsing fails
      return text.split(',').map(s => s.trim().replace(/[\[\]"]/g, '')).filter(Boolean).slice(0, 5);
    }
  } catch (error: any) {
    console.error("Magic Suggestions Error:", error);
    return [];
  }
};

export const generateImageWithNano = async (
  prompt: string, 
  styleId: string, 
  aspectRatio: string = "1:1",
  seed?: number,
  creativity: number = 60,
  referenceImage?: string | null,
  maskImage?: string | null,
  lightSourceId: string = 'auto',
  lightDirectionId: string = 'auto',
  filterId: string = 'none'
): Promise<string> => {
  const ai = getAI();
  const selectedStyle = ART_STYLES.find(s => s.id === styleId);
  const styleModifier = selectedStyle ? selectedStyle.promptModifier : '';
  const sourceModifier = LIGHT_SOURCES.find(l => l.id === lightSourceId)?.promptModifier || '';
  const directionModifier = LIGHT_DIRECTIONS.find(l => l.id === lightDirectionId)?.promptModifier || '';
  const filterModifier = IMAGE_FILTERS.find(f => f.id === filterId)?.prompt || '';

  const technicalSpecs = [sourceModifier, directionModifier, filterModifier].filter(Boolean).join(', ');
  
  let fullPrompt = '';
  
  // Lógica de Prompt para Máscaras (Inpainting / Magic Eraser)
  if (maskImage && referenceImage) {
    if (prompt && prompt.trim() !== "") {
      // Caso 1: Reemplazo / Edición específica (ej. "Pon un gato aquí")
      fullPrompt = `Edit the image using the provided mask. Replace the masked area (white pixels) with: "${prompt}". Seamlessly integrate it matching the lighting, shadows, and style of the surrounding image.`;
    } else {
      // Caso 2: Magic Eraser (Borrar objeto)
      fullPrompt = `High-quality object removal. Fill the masked area (white pixels) to match the surrounding background seamlessly. Remove the object completely and reconstruct the texture/background behind it. Do not add new objects.`;
    }
  } else {
    // Caso 3: Generación de Texto a Imagen (o Img2Img sin máscara)
    const baseQuality = "masterpiece, high-end professional photography, 8k resolution, incredibly detailed, sharp focus, cinematic lighting";
    
    let processedPrompt = prompt || 'a breathtaking artistic scene';
    // Auto-expansion for very short prompts to improve detail
    if (processedPrompt.length > 0 && processedPrompt.length < 20 && !processedPrompt.includes(',')) {
      processedPrompt = `${processedPrompt}, highly detailed, intricate textures, atmospheric lighting, professional composition`;
    }

    fullPrompt = `${baseQuality}. Subject: ${processedPrompt}.`;
    
    if (styleModifier) {
      fullPrompt += ` Artistic Style: ${styleModifier}.`;
    }
    
    if (technicalSpecs) {
      fullPrompt += ` Technical Environment: ${technicalSpecs}.`;
    }

    fullPrompt += ` Ensure perfect composition, realistic textures, and vibrant colors. Avoid any distortions or artifacts.`;
  }

  // Temperatura basada en creatividad
  const temperature = 0.1 + (creativity / 100) * 1.8;

  try {
    const parts: any[] = [];
    
    // El orden es importante para Gemini: Imagen Base, Máscara (opcional), Prompt
    if (referenceImage) {
      const match = referenceImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    
    if (maskImage) {
      const match = maskImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    
    parts.push({ text: fullPrompt });

    // Timeout de 60 segundos para evitar bloqueos infinitos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("La solicitud ha expirado (timeout de 60s). Por favor, intenta de nuevo.")), 60000)
    );

    const generationPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio }, temperature, seed }
    });

    const response = await Promise.race([generationPromise, timeoutPromise]) as any;

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("El modelo no generó candidatos. Esto puede deberse a filtros de seguridad.");
    }

    const part = response.candidates[0].content?.parts?.find(p => p.inlineData);
    if (part) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    
    throw new Error("La respuesta del modelo no contiene datos de imagen.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    const errorStr = JSON.stringify(error);
    const isQuotaError = error.message?.includes("429") || error.status === 429 || errorStr.includes("RESOURCE_EXHAUSTED");
    const isSafetyError = errorStr.includes("SAFETY") || error.message?.includes("safety") || error.message?.includes("candidates");

    if (isQuotaError) {
      throw new Error("Límite de velocidad alcanzado. La cuota gratuita de Gemini permite un número limitado de imágenes por minuto. Por favor, espera 60 segundos antes de intentar el siguiente disparo.");
    }

    if (isSafetyError) {
      throw new Error("La solicitud fue bloqueada por los filtros de seguridad. Intenta describir la escena de una manera diferente o evita términos que puedan ser sensibles.");
    }
    
    if (error.message?.includes("timeout") || error.message?.includes("expirado")) {
      throw new Error("La conexión es lenta o el servidor está saturado. Por favor, intenta de nuevo en unos instantes.");
    }

    throw new Error(error.message || "Error inesperado en la cámara digital. Por favor, revisa tu conexión e intenta de nuevo.");
  }
};

export const detectImageStyle = async (imageBase64: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) return null;
    
    const styleList = ART_STYLES.map(s => `ID: "${s.id}" - ${s.name}: ${s.description}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: match[1], data: match[2] } },
          { text: `Analyse the style of this image and classify it using one ID from this list:\n${styleList}\nReturn ONLY the ID string.` }
        ]
      }
    });
    return response.text?.trim().replace(/['"]/g, '') || null;
  } catch (error: any) {
    if (error.message?.includes("429") || error.status === 429 || JSON.stringify(error).includes("RESOURCE_EXHAUSTED")) {
      console.warn("Quota exceeded for style detection.");
    }
    return null;
  }
};
