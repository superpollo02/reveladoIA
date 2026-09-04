
import { ArtStyle } from './types';

export const APP_NAME = "Fotografo todo en 1";
export const MODEL_NAME_DISPLAY = "Nano Banana";

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Cuadrado', shapeClass: 'w-4 h-4' },
  { id: '16:9', label: 'Panorámico', shapeClass: 'w-6 h-3.5' },
  { id: '9:16', label: 'Vertical', shapeClass: 'w-3.5 h-6' },
  { id: '4:3', label: 'Estándar', shapeClass: 'w-5 h-4' },
  { id: '3:4', label: 'Retrato', shapeClass: 'w-4 h-5' },
  { id: '3:2', label: '3:2 Paisaje', shapeClass: 'w-6 h-4' },
  { id: '2:3', label: '2:3 Retrato', shapeClass: 'w-4 h-6' },
  { id: '5:4', label: '5:4 Arte', shapeClass: 'w-5 h-4' },
];

export const LIGHT_SOURCES = [
  { id: 'auto', label: 'IA Automático', promptModifier: '' },
  { id: 'natural', label: 'Luz Natural', promptModifier: 'natural lighting, sunlight, daylight, organic light source' },
  { id: 'continuous', label: 'Estudio Continuo', promptModifier: 'studio continuous lighting, constant LED illumination, professional studio setup' },
  { id: 'strobe', label: 'Flash / Estroboscopio', promptModifier: 'strobe lighting, flash photography, frozen motion, high power artificial light' },
  { id: 'hard', label: 'Luz Dura', promptModifier: 'hard light, high contrast, sharp defined shadows, direct strong light' },
  { id: 'soft', label: 'Suave / Difusa', promptModifier: 'soft diffused lighting, softbox, low contrast, wrap-around light, gentle shadows' },
  { id: 'volumetric', label: 'Volumétrica (Niebla)', promptModifier: 'volumetric lighting, god rays, shafts of light, hazy atmosphere, tyndall effect, cinematic depth' },
  { id: 'golden', label: 'Hora Dorada', promptModifier: 'golden hour lighting, warm soft sunlight, low angle sun, magic hour, sunset glow' },
  { id: 'blue', label: 'Hora Azul', promptModifier: 'blue hour lighting, twilight, deep blue sky, cold tones, pre-dawn atmosphere' },
  { id: 'neon', label: 'Neón / Cyberpunk', promptModifier: 'neon lighting, vibrant artificial lights, cyberpunk aesthetics, pink and blue lights, cinematic glow' },
  { id: 'ring', label: 'Anillo (Ring Light)', promptModifier: 'ring light, halo catchlights, shadowless beauty lighting, vlogger style, macro illumination' },
  { id: 'window', label: 'Ventana / Gobo', promptModifier: 'window light, natural indoor lighting, shadow patterns, gobo light effect, soft directional' },
  { id: 'candle', label: 'Luz de Velas', promptModifier: 'candlelight, flickering warm light, firelight, intimate atmosphere, low key' },
  { id: 'biolum', label: 'Bioluminiscencia', promptModifier: 'bioluminescent glow, organic light, avatar style lighting, phosphorescent, ethereal glow, magical atmosphere' },
  { id: 'screen', label: 'Brillo de Pantalla', promptModifier: 'screen glow, monitor light, face illuminated by device, cool artificial light, dark room context' },
  { id: 'fire', label: 'Fuego / Hoguera', promptModifier: 'firelight, bonfire glow, flickering orange light, warm dancing shadows, campfire atmosphere' },
];

export const LIGHT_DIRECTIONS = [
  { id: 'auto', label: 'IA Automático', promptModifier: '' },
  { id: 'frontal', label: 'Frontal (Plana)', promptModifier: 'frontal lighting, flat lighting, shadowless, beauty lighting' },
  { id: 'lateral', label: 'Lateral (Partida)', promptModifier: 'split lighting, side lighting, half face in shadow, dramatic contrast' },
  { id: 'backlight', label: 'Contraluz (Rim)', promptModifier: 'backlighting, rim light, silhouette, halo effect, light behind subject' },
  { id: 'overhead', label: 'Cenital (Superior)', promptModifier: 'overhead lighting, zenithal light, top-down dramatic shadows' },
  { id: 'butterfly', label: 'Mariposa (Paramount)', promptModifier: 'butterfly lighting, glamour lighting, small shadow under nose, high frontal light' },
  { id: 'rembrandt', label: 'Rembrandt', promptModifier: 'Rembrandt lighting, triangle of light on cheek, chiaroscuro, classic portrait' },
  { id: 'loop', label: 'Luz de Bucle (Loop)', promptModifier: 'loop lighting, small nose shadow loop, classic studio portraiture' },
  { id: 'silhouette', label: 'Silueta', promptModifier: 'silhouette lighting, subject in shadow, bright background, strong outline, high contrast' },
  { id: 'bottom', label: 'Inferior (Uplighting)', promptModifier: 'bottom-up lighting, uplighting, dramatic shadows from below, mysterious atmosphere' },
  { id: 'volumetric', label: 'Volumétrica (Rayos)', promptModifier: 'volumetric lighting, god rays, light shafts, hazy atmosphere, tyndall effect, cinematic depth' },
  { id: 'threepoint', label: '3 Puntos (Estándar)', promptModifier: 'three-point lighting, key light fill light and back light, balanced professional studio setup' },
];

// Extend ArtStyle interface locally if needed, but here we assume the types.ts supports it or we use metadata
export interface ExtendedArtStyle extends ArtStyle {
  category: 'Foto' | 'Arte' | 'Digital' | 'Especial';
}

export const ART_STYLES: ExtendedArtStyle[] = [
  {
    id: 'warm-interior',
    name: 'Interior Cálido',
    category: 'Foto',
    description: 'Ambiente acogedor, luz dorada',
    promptModifier: 'interior design style, warm lighting, cozy atmosphere, photorealistic, 8k, golden hour, highly detailed texture',
    gradient: 'from-orange-100 to-amber-50'
  },
  {
    id: 'daytime-exterior',
    name: 'Exterior Día',
    category: 'Foto',
    description: 'Luz solar brillante y natural',
    promptModifier: 'exterior architectural photography, bright natural daylight, blue sky, photorealistic, sharp focus, 8k',
    gradient: 'from-sky-100 to-blue-50'
  },
  {
    id: 'night-exterior',
    name: 'Exterior Noche',
    category: 'Foto',
    description: 'Atmosférico, luces artificiales',
    promptModifier: 'night time photography, dramatic artificial lighting, dark shadows, cinematic, urban atmosphere, photorealistic',
    gradient: 'from-slate-800 to-gray-900 text-white'
  },
  {
    id: 'minimal-studio',
    name: 'Estudio Mínimo',
    category: 'Foto',
    description: 'Limpio, fondo blanco puro',
    promptModifier: 'minimalist studio photography, clean white background, soft box lighting, high key, product shot style',
    gradient: 'from-gray-100 to-gray-50'
  },
  {
    id: 'natural-portrait',
    name: 'Retrato Natural',
    category: 'Foto',
    description: 'Enfoque suave, desenfoque bokeh',
    promptModifier: 'portrait photography, natural window light, soft bokeh background, 85mm lens, human skin texture, realistic eyes',
    gradient: 'from-rose-50 to-pink-50'
  },
  {
    id: 'moody-cinematic',
    name: 'Cine Dramático',
    category: 'Digital',
    description: 'Grano de película, etalonaje',
    promptModifier: 'cinematic film still, color graded, film grain, dramatic shadows, teal and orange, anamorphic lens flare, movie scene',
    gradient: 'from-indigo-900 to-slate-800 text-white'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Digital',
    description: 'Futurista, neón, contraste alto',
    promptModifier: 'cyberpunk aesthetic, neon lights, futuristic city, rain-slicked streets, high contrast, chromatic aberration, sci-fi atmosphere',
    gradient: 'from-fuchsia-900 to-purple-900 text-white'
  },
  {
    id: 'analog-film',
    name: 'Película 35mm',
    category: 'Foto',
    description: 'Nostálgico, grano analógico',
    promptModifier: 'analog photography, 35mm film, kodak portra 400, visible film grain, light leaks, soft colors, vintage aesthetic, nostalgic',
    gradient: 'from-orange-200 to-red-100'
  },
  {
    id: 'anime-style',
    name: 'Anime Japonés',
    category: 'Arte',
    description: 'Vibrante, líneas limpias 2D',
    promptModifier: 'anime style, studio ghibli inspired, vibrant colors, clean lines, cel shaded, highly detailed background, 2D animation style',
    gradient: 'from-pink-300 to-rose-200'
  },
  {
    id: 'bw-noir',
    name: 'Noir B&N',
    category: 'Foto',
    description: 'Sombras profundas, misterio',
    promptModifier: 'film noir style, black and white photography, high contrast, chiaroscuro lighting, dramatic shadows, mysterious atmosphere',
    gradient: 'from-gray-900 to-black text-white'
  },
  {
    id: '3d-surreal',
    name: '3D Surrealista',
    category: 'Digital',
    description: 'Onírico, render perfecto',
    promptModifier: '3d render, surrealism, abstract shapes, octane render, unreal engine 5, dreamlike atmosphere, floating elements, pastel colors, soft lighting',
    gradient: 'from-violet-200 to-indigo-100'
  },
  {
    id: 'oil-painting',
    name: 'Pintura al Óleo',
    category: 'Arte',
    description: 'Textura de pincel, clásico',
    promptModifier: 'oil painting style, thick brush strokes, impasto technique, classic art style, textured canvas, expressive, masterpiece',
    gradient: 'from-amber-700 to-yellow-600 text-white'
  },
  {
    id: 'watercolor',
    name: 'Acuarela Suave',
    category: 'Arte',
    description: 'Transparente, artístico, fluido',
    promptModifier: 'watercolor painting, soft edges, paper texture, pastel colors, artistic, wet on wet technique, delicate',
    gradient: 'from-cyan-100 to-blue-100'
  },
  {
    id: 'isometric',
    name: 'Isométrico 3D',
    category: 'Digital',
    description: 'Geométrico, mundo miniatura',
    promptModifier: 'isometric view, 3d render, low poly, cute, miniature world, clean background, sharp shadows, orthographic camera',
    gradient: 'from-emerald-100 to-teal-50'
  },
  {
    id: 'fantasy-epic',
    name: 'Fantasía Épica',
    category: 'Arte',
    description: 'Mágico, detallado, RPG',
    promptModifier: 'epic fantasy art, magical atmosphere, highly detailed environment, dungeons and dragons style, mystical lighting, ethereal',
    gradient: 'from-emerald-900 to-green-900 text-white'
  },
  {
    id: 'polaroid',
    name: 'Polaroid Retro',
    category: 'Foto',
    description: 'Flash directo, desvaído',
    promptModifier: 'polaroid photo, vintage camera, direct flash, vignetting, soft focus, faded colors, nostalgic memory',
    gradient: 'from-yellow-100 to-stone-200'
  }
];

export const IMAGE_FILTERS = [
  { id: 'none', name: 'Normal', filter: 'none', prompt: '' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(40%) saturate(85%) hue-rotate(-10deg) brightness(105%) contrast(105%)', prompt: 'vintage aesthetic, sepia tones, aged look, nostalgic feel' },
  { id: 'azul-frio', name: 'Azul Frío', filter: 'saturate(80%) hue-rotate(190deg) brightness(105%) contrast(105%)', prompt: 'cold color temperature, blue tint, cool atmosphere, cinematic cool tones' },
  { id: 'vignette', name: 'Viñeta', filter: 'brightness(95%) contrast(105%)', prompt: 'strong vignette, centered focus, darker corners, dramatic lighting' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(100%) contrast(160%) brightness(75%)', prompt: 'film noir style, black and white, high contrast, dramatic shadows, mysterious' },
  { id: 'grayscale', name: 'B&W', filter: 'grayscale(100%) contrast(115%)', prompt: 'black and white photography, monochrome, classic look' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(90%) contrast(105%) brightness(95%)', prompt: 'strong sepia tone, old photograph style, historical feeling' },
  { id: 'retro', name: 'Retro', filter: 'sepia(30%) contrast(110%) saturate(140%) hue-rotate(-5deg)', prompt: 'retro 80s style, vibrant colors, slightly warm, analog film look' },
  { id: 'vivid', name: 'Vívido', filter: 'saturate(160%) contrast(110%) brightness(105%)', prompt: 'vivid colors, high saturation, vibrant tones, punchy colors' },
  { id: 'lofi', name: 'Lofi', filter: 'saturate(80%) contrast(90%) brightness(110%) sepia(10%)', prompt: 'lo-fi aesthetic, muted colors, soft contrast, dreamy atmosphere' },
  { id: 'cool', name: 'Frío', filter: 'saturate(110%) hue-rotate(30deg) brightness(105%)', prompt: 'cool hues, crisp lighting, refreshing atmosphere' },
  { id: 'dramatic', name: 'Dramático', filter: 'contrast(150%) brightness(85%) saturate(120%)', prompt: 'dramatic lighting, high contrast, deep shadows, intense mood' },
  { id: 'fade', name: 'Desvaído', filter: 'brightness(110%) contrast(85%) saturate(70%)', prompt: 'faded look, low contrast, matte finish, soft pastel tones' },
  { id: 'cinematic', name: 'Cine', filter: 'contrast(120%) saturate(110%) brightness(95%)', prompt: 'cinematic look, teal and orange grading, movie scene aesthetic' },
  { id: 'warm', name: 'Cálido', filter: 'sepia(20%) saturate(130%) hue-rotate(-5deg)', prompt: 'warm lighting, golden hour tones, cozy atmosphere' },
  { id: 'solarize', name: 'Solarizar', filter: 'invert(100%) contrast(120%) brightness(110%) hue-rotate(180deg)', prompt: 'solarized photography, sabattier effect, inverted highlights, surreal colors, high contrast, experimental photography' },
];

export const REFINEMENT_PRESETS = [
  { 
    id: 'enhance-general', 
    label: 'Mejora General', 
    description: 'Claridad, brillo y nitidez equilibrados.',
    prompt: 'Mejora la claridad general de la imagen y el equilibrio de la iluminación. Mejora el brillo, el contraste y la nitidez, conservando los tonos naturales. Haz que los colores sean un poco más ricos pero realistas. Reduce el ruido y mejora la textura en las superficies de madera y los elementos decorativos. Mantén las proporciones y la perspectiva originales.' 
  },
  { 
    id: 'fix-wall', 
    label: 'Corregir Fondo', 
    description: 'Suaviza paredes y mejora profundidad.',
    prompt: 'Suaviza la pared del fondo para eliminar pequeñas arrugas y sombras desiguales. Mejora la viveza de la obra de arte pintada para darle profundidad visual. Mantén el aspecto pintado a mano mientras mejoras la definición de las líneas y la saturación del color.' 
  },
  { 
    id: 'lighting-fix', 
    label: 'Iluminación', 
    description: 'Luz cálida y exposición uniforme.',
    prompt: 'Aplica una iluminación cálida y suave para crear un ambiente acogedor e invitador. Equilibra la exposición de manera uniforme en toda la escena. Agrega reflejos suaves en los bordes superiores para un aspecto de estudio natural.' 
  },
  { 
    id: 'color-grade', 
    label: 'Color Grade', 
    description: 'Paleta cálida "Hora Dorada".',
    prompt: 'Aplica una gradación de color de tono cálido para unificar la paleta. Mantén los tonos de madera y crema naturales con una mejora sutil. Ajusta el balance de blancos para una sensación de "hora dorada" sin sobresaturación. Mantén un acabado limpio y realista.' 
  },
  { 
    id: 'sharpen-objects', 
    label: 'Nitidez Objetos', 
    description: 'Detalle en texturas y bordes.',
    prompt: 'Afila los detalles de los objetos principales y corrige cualquier falta de color. Retoca los bordes y elimina marcas visibles o texturas ásperas sin perder la sensación artesanal. Profundiza ligeramente las sombras para darle realismo.' 
  },
  { 
    id: 'composition', 
    label: 'Profundidad', 
    description: 'Contraste de planos y foco central.',
    prompt: 'Aumenta sutilmente la percepción de profundidad mejorando los medios tonos y el contraste de las sombras entre el primer plano y el fondo. Mantén el enfoque en la composición central. Conserva el encuadre artístico.' 
  },
  { 
    id: 'polish', 
    label: 'Pulido Final', 
    description: 'Alta resolución y armonía total.',
    prompt: 'Aplica el toque final para unificar toda la imagen. Mejora la nitidez y la luminancia de manera uniforme. Asegura la armonía general entre la luz, el color y la textura. Produce en alta resolución adecuada para impresión o uso digital.' 
  },
  { 
    id: 'all-in-one', 
    label: 'PRO Completo', 
    description: 'Combinación maestra de mejoras.',
    prompt: 'Mejora la imagen adjunta para una presentación profesional. Mejora la iluminación, el balance de color y la claridad. Retoca las imperfecciones en el fondo y las superficies. Mejora la viveza de la obra de arte conservando los tonos naturales. Aplica una gradación de tono cálido y sombras suaves para una profundidad realista. Limpia los bordes, mantén la textura y asegúrate de que la imagen final se vea nítida e invitadora.' 
  }
];
