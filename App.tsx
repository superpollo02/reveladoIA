
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, RefreshCw, Zap, Camera, 
  Upload, Edit2, Telescope, Info, ChevronRight, ChevronDown,
  Image as ImageIcon, X, Maximize2, Minimize2
} from 'lucide-react';
import { 
  ART_STYLES, APP_NAME, MODEL_NAME_DISPLAY, 
  ASPECT_RATIOS, LIGHT_SOURCES, LIGHT_DIRECTIONS, 
  IMAGE_FILTERS 
} from './constants';
import { GeneratedImage, GenerationStatus, ArtStyle, RecentPromptSetting } from './types';
import { generateImageWithNano, detectImageStyle, refinePrompt, getMagicSuggestions } from './services/geminiService';
import { analyzeImageColorPalette } from './services/colorService';
import { Button, StyleCard, Badge, StylePreviewTooltip } from './components/UI';
import { ImageEditor } from './components/ImageEditor';
import { ZoomablePreview } from './components/ZoomablePreview';
import { Gallery } from './components/Gallery';
import * as storage from './services/storageService';
import { AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(ART_STYLES[0].id);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // Sidebar Sections State
  const [isCreativeOpen, setIsCreativeOpen] = useState(true);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);

  // Recent Prompts State
  const [recentPrompts, setRecentPrompts] = useState<RecentPromptSetting[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent_prompts_configs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing recent prompts:", e);
        }
      }
    }
    return [];
  });

  const handleRestoreRecent = (recent: RecentPromptSetting) => {
    setPrompt(recent.prompt);
    setSelectedStyleId(recent.styleId);
    setAspectRatio(recent.aspectRatio);
    setCreativity(recent.creativity || 60);
    setLightSourceId(recent.lightSourceId || 'auto');
    setLightDirectionId(recent.lightDirectionId || 'auto');
    setFilterId(recent.filterId || 'none');
  };

  const handleDeleteRecentPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentPrompts(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('recent_prompts_configs', JSON.stringify(updated));
      return updated;
    });
  };


  // Style Hover Tooltip State
  const [hoveredStyle, setHoveredStyle] = useState<ArtStyle | null>(null);
  const [hoveredStyleTop, setHoveredStyleTop] = useState<number>(0);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStyleHoverStart = (style: ArtStyle, top: number) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredStyle(style);
      setHoveredStyleTop(top);
    }, 120);
  };

  const handleStyleHoverEnd = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredStyle(null);
  };

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({});
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  // Analyze the color palette of the most recently generated/selected image
  useEffect(() => {
    if (currentImage) {
      analyzeImageColorPalette(currentImage.url).then(result => {
        if (result) {
          setSidebarStyle(result.sidebarBgStyle);
          setExtractedPalette(result.colors);
        } else {
          setSidebarStyle({});
          setExtractedPalette([]);
        }
      });
    } else {
      setSidebarStyle({});
      setExtractedPalette([]);
    }
  }, [currentImage]);

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await storage.getAllImages();
        setAllImages(images);
        if (images.length > 0 && !currentImage) {
          setCurrentImage(images[0]);
        }
      } catch (e) {
        console.error("Error loading images from IndexedDB:", e);
      }
    };
    loadImages();
  }, []);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Lab States
  const [lightSourceId, setLightSourceId] = useState('auto');
  const [lightDirectionId, setLightDirectionId] = useState('auto');
  const [filterId, setFilterId] = useState('none');
  const [creativity, setCreativity] = useState(60);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefinePrompt = async () => {
    if (!prompt.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const enhanced = await refinePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!prompt.trim() || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const suggestions = await getMagicSuggestions(prompt);
      setMagicSuggestions(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return suggestion;
      if (trimmed.endsWith(',')) return `${trimmed} ${suggestion}`;
      return `${trimmed}, ${suggestion}`;
    });
    setMagicSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) return;
    setStatus('generating');
    setErrorMessage(null);
    try {
      const url = await generateImageWithNano(
        prompt, 
        selectedStyleId, 
        aspectRatio, 
        undefined, 
        creativity, 
        uploadedImage,
        null, // maskImage
        lightSourceId,
        lightDirectionId,
        filterId
      );
      
      const newImg: GeneratedImage = {
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        url,
        prompt: prompt || 'Síntesis Fotográfica',
        styleId: selectedStyleId,
        aspectRatio,
        timestamp: Date.now(),
        creativity,
        lightSourceId,
        lightDirectionId,
        tags: [ART_STYLES.find(s => s.id === selectedStyleId)?.name || 'General'],
        folder: 'Recientes'
      };
      
      await storage.saveImage(newImg);
      setCurrentImage(newImg);
      setAllImages(prev => [newImg, ...prev]);

      if (prompt.trim()) {
        const newRecent: RecentPromptSetting = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          prompt: prompt.trim(),
          styleId: selectedStyleId,
          aspectRatio,
          creativity,
          lightSourceId,
          lightDirectionId,
          filterId,
          timestamp: Date.now()
        };
        setRecentPrompts(prev => {
          const filtered = prev.filter(p => p.prompt.toLowerCase() !== prompt.trim().toLowerCase());
          const updated = [newRecent, ...filtered].slice(0, 10);
          localStorage.setItem('recent_prompts_configs', JSON.stringify(updated));
          return updated;
        });
      }

      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Error desconocido al generar la imagen");
      setStatus('error');
    }
  };

  const handleSelectImage = (img: GeneratedImage) => {
    setCurrentImage(img);
    setPrompt(img.prompt);
    setSelectedStyleId(img.styleId);
    setAspectRatio(img.aspectRatio);
    setCreativity(img.creativity || 60);
    setLightSourceId(img.lightSourceId || 'auto');
    setLightDirectionId(img.lightDirectionId || 'auto');
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await storage.deleteImage(id);
      setAllImages(prev => prev.filter(img => img.id !== id));
      if (currentImage?.id === id) {
        const remaining = allImages.filter(img => img.id !== id);
        setCurrentImage(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (e) {
      console.error("Error deleting image:", e);
    }
  };

  const handleDeleteMultipleImages = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => storage.deleteImage(id)));
      setAllImages(prev => prev.filter(img => !ids.includes(img.id)));
      if (currentImage && ids.includes(currentImage.id)) {
        const remaining = allImages.filter(img => !ids.includes(img.id));
        setCurrentImage(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (e) {
      console.error("Error deleting multiple images:", e);
    }
  };

  const handleUpdateImage = async (updatedImg: GeneratedImage) => {
    try {
      await storage.updateImage(updatedImg);
      setAllImages(prev => prev.map(img => img.id === updatedImg.id ? updatedImg : img));
      if (currentImage?.id === updatedImg.id) setCurrentImage(updatedImg);
    } catch (e) {
      console.error("Error updating image:", e);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setUploadedImage(base64);
        const style = await detectImageStyle(base64);
        if (style) setSelectedStyleId(style);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen bg-nano-50 text-white flex flex-col overflow-hidden">
      {!fullScreenMode && (
        <header className="h-20 bg-nano-100/60 backdrop-blur-3xl z-50 border-b border-white/5 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-nano-50 shadow-2xl">
              <Camera size={20} />
            </div>
            <h1 className="text-lg font-black uppercase tracking-tighter">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-3 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
            >
              <ImageIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Galería</span>
              <div className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black">
                {allImages.length}
              </div>
            </button>
            <Badge text={MODEL_NAME_DISPLAY} />
          </div>
        </header>
      )}

      <main className="flex-grow flex overflow-hidden">
        {/* PANEL LATERAL CON SECCIONES COLAPSABLES */}
        {!fullScreenMode && (
          <aside style={sidebarStyle} className="w-[450px] border-r border-white/5 bg-nano-100/30 flex flex-col shrink-0 z-20 shadow-2xl">
          <div className="flex-grow overflow-y-auto hide-scrollbar">
            
            {/* ATMÓSFERA DEL REVELADO */}
            {extractedPalette.length > 0 && (
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4 animate-in fade-in duration-500">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Atmósfera del Revelado</span>
                  <span className="text-[8px] font-mono text-white/20">Paleta de color activa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {extractedPalette.map((color, idx) => (
                    <div 
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-white/10 shadow-lg relative group cursor-help transition-transform hover:scale-125 duration-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm border border-white/10 text-[7px] font-mono text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* SECCIÓN: CONTROLES CREATIVOS */}
            <div className="border-b border-white/5">
              <button 
                onClick={() => setIsCreativeOpen(!isCreativeOpen)}
                className="w-full flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/5 transition-all group sticky top-0 z-10 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isCreativeOpen ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/20'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">Controles Creativos</span>
                </div>
                {isCreativeOpen ? <ChevronDown size={14} className="text-emerald-500"/> : <ChevronRight size={14} className="text-white/30 group-hover:text-white"/>}
              </button>
              
              {isCreativeOpen && (
                <div className="p-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Visión Visual</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleGetSuggestions}
                          disabled={!prompt.trim() || isSuggesting}
                          className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full transition-all disabled:opacity-30 group"
                          title="Sugerir palabras clave"
                        >
                          <Zap size={12} className={isSuggesting ? 'animate-pulse' : 'group-hover:scale-125 transition-transform'} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{isSuggesting ? 'Sugiriendo...' : 'Sugerir'}</span>
                        </button>
                        <button 
                          onClick={handleRefinePrompt}
                          disabled={!prompt.trim() || isRefining}
                          className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-all disabled:opacity-30 group"
                          title="Mejorar indicación con IA"
                        >
                          <Sparkles size={12} className={isRefining ? 'animate-pulse' : 'group-hover:scale-125 transition-transform'} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{isRefining ? 'Refinando...' : 'Mejorar'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <textarea 
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        className="w-full h-44 p-6 bg-white/5 border border-white/10 rounded-[2rem] text-[15px] focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all leading-relaxed placeholder:text-white/20"
                        placeholder="Describe la escena con detalle fotográfico..."
                      />
                      
                      {magicSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          {magicSuggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => addSuggestion(s)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold text-white/60 hover:text-white transition-all flex items-center gap-2 group"
                            >
                              <span className="text-emerald-500 group-hover:scale-110 transition-transform">+</span>
                              {s}
                            </button>
                          ))}
                          <button 
                            onClick={() => setMagicSuggestions([])}
                            className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                            title="Limpiar sugerencias"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN: PROMPTS RECIENTES */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
                      Prompts Recientes
                    </label>
                    {recentPrompts.length === 0 ? (
                      <div className="p-5 border border-dashed border-white/5 rounded-[1.5rem] text-center bg-white/[0.01]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          Tu historial aparecerá aquí
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 hide-scrollbar">
                        {recentPrompts.map((recent) => {
                          const styleObj = ART_STYLES.find(s => s.id === recent.styleId);
                          return (
                            <div
                              key={recent.id}
                              onClick={() => handleRestoreRecent(recent)}
                              className="group w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-between gap-4"
                            >
                              <div className="flex-grow min-w-0 flex flex-col gap-1.5">
                                <span className="text-[12px] font-medium text-white/70 group-hover:text-white truncate transition-colors leading-tight">
                                  {recent.prompt}
                                </span>
                                <div className="flex items-center gap-2">
                                  {styleObj && (
                                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/5 text-white/50 rounded-md">
                                      {styleObj.name}
                                    </span>
                                  )}
                                  <span className="text-[8px] font-mono text-white/30">
                                    {recent.aspectRatio}
                                  </span>
                                  <span className="text-[8px] font-mono text-white/30">
                                    cr: {recent.creativity}%
                                  </span>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => handleDeleteRecentPrompt(recent.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 text-white/30 hover:text-rose-400 rounded-xl"
                                title="Eliminar del historial"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Matriz de Estilos</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ART_STYLES.map(s => (
                        <StyleCard 
                          key={s.id} 
                          style={s} 
                          isSelected={selectedStyleId === s.id} 
                          onClick={() => setSelectedStyleId(s.id)} 
                          onHoverStart={handleStyleHoverStart}
                          onHoverEnd={handleStyleHoverEnd}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Geometría del Lienzo</label>
                    <div className="grid grid-cols-4 gap-3">
                      {ASPECT_RATIOS.map(r => (
                        <button 
                          key={r.id} onClick={() => setAspectRatio(r.id)}
                          className={`flex flex-col items-center py-4 rounded-2xl border transition-all ${aspectRatio === r.id ? 'bg-white text-nano-50 border-white shadow-xl scale-105 ring-2 ring-emerald-500 ring-offset-2 ring-offset-nano-100' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                          <div className={`border-2 rounded-[1px] mb-2 ${r.shapeClass} ${aspectRatio === r.id ? 'border-nano-50' : 'border-current opacity-40'}`}></div>
                          <span className="text-[7px] font-black">{r.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN: LABORATORIO AVANZADO */}
            <div className="border-b border-white/5">
               <button 
                onClick={() => setIsLabOpen(!isLabOpen)}
                className="w-full flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/5 transition-all group sticky top-0 z-10 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isLabOpen ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/20'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">Laboratorio Avanzado</span>
                </div>
                {isLabOpen ? <ChevronDown size={14} className="text-emerald-500"/> : <ChevronRight size={14} className="text-white/30 group-hover:text-white"/>}
              </button>

              {isLabOpen && (
                <div className="p-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300 bg-black/20">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Referencia Óptica</label>
                    <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-44 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-white/2 hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all group overflow-hidden relative"
                    >
                      {uploadedImage ? (
                        <>
                            <img src={uploadedImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            <div className="z-10 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={20} className="text-white" />
                            </div>
                        </>
                      ) : (
                        <>
                          <Upload className="text-white/20 group-hover:text-emerald-500 transition-colors" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Cargar Imagen</span>
                        </>
                      )}
                    </button>
                    {uploadedImage && <button onClick={() => { setUploadedImage(null); if(fileInputRef.current) fileInputRef.current.value=''; }} className="text-[9px] text-red-400 uppercase font-bold tracking-widest hover:text-red-300 w-full text-center">Eliminar Referencia</button>}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 text-xs">Iluminación</label>
                      <div className="relative group">
                        <select 
                          value={lightSourceId} 
                          onChange={e => setLightSourceId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none group-hover:bg-white/10 transition-colors"
                        >
                          {LIGHT_SOURCES.map(l => <option key={l.id} value={l.id} className="bg-nano-100">{l.label}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 text-xs">Dirección</label>
                      <div className="relative group">
                        <select 
                          value={lightDirectionId} 
                          onChange={e => setLightDirectionId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none group-hover:bg-white/10 transition-colors"
                        >
                          {LIGHT_DIRECTIONS.map(d => <option key={d.id} value={d.id} className="bg-nano-100">{d.label}</option>)}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Filtro Atmosférico</label>
                    <div className="relative group">
                      <select 
                        value={filterId} 
                        onChange={e => setFilterId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none group-hover:bg-white/10 transition-colors"
                      >
                        {IMAGE_FILTERS.map(f => <option key={f.id} value={f.id} className="bg-nano-100">{f.name}</option>)}
                      </select>
                      <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
                      <span>Creatividad</span>
                      <span>{creativity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={creativity} onChange={e => setCreativity(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            
          </div>

          <div className="p-8 border-t border-white/5 bg-nano-100/80 backdrop-blur-xl shrink-0 z-20">
            <button 
              onClick={handleGenerate} disabled={status === 'generating'}
              className="w-full h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center gap-4 font-black uppercase tracking-[0.5em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="relative flex items-center gap-4 z-10">
                {status === 'generating' ? <RefreshCw className="animate-spin" size={24} /> : <Zap fill="white" size={24} />}
                <span>{status === 'generating' ? 'Sintetizando' : 'Disparar'}</span>
              </div>
            </button>
          </div>
        </aside>
        )}

        {/* VISOR PRINCIPAL */}
        <section className={`flex-grow relative flex flex-col bg-nano-50 overflow-hidden transition-all duration-500 ${fullScreenMode ? 'p-0' : ''}`}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 blur-[200px] rounded-full animate-pulse"></div>
          </div>

          {/* Barra de control flotante para pantalla completa */}
          <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none">
            <div className={`transition-all duration-300 ${fullScreenMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
              <div className="px-6 py-3 bg-nano-100/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl shadow-black/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Pantalla Completa</span>
              </div>
            </div>
            
            <button
              onClick={() => setFullScreenMode(!fullScreenMode)}
              className="pointer-events-auto p-4 bg-nano-100/80 hover:bg-nano-100 backdrop-blur-md border border-white/10 text-white rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-2 group"
              title={fullScreenMode ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullScreenMode ? (
                <>
                  <Minimize2 size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest px-1">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest px-1">Enfocar</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center p-12">
            {status === 'generating' ? (
              <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 border-[6px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mx-auto shadow-2xl shadow-emerald-500/20"></div>
                <p className="text-[14px] font-black uppercase tracking-[1em] text-emerald-400">Capturando Fotones</p>
              </div>
            ) : status === 'error' ? (
              <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-md">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-black uppercase tracking-[0.5em] text-red-400">Error de Captura</p>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">{errorMessage}</p>
                </div>
                <button 
                  onClick={handleGenerate}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Reintentar Disparo
                </button>
              </div>
            ) : currentImage ? (
              <div className="w-full h-full relative group animate-in zoom-in-95 duration-700">
                <ZoomablePreview 
                  src={currentImage.url} alt="Captura Final" isVisible={true} 
                  className="rounded-[3.5rem] shadow-2xl border border-white/10 h-full w-full object-contain" 
                />
                <div className="absolute top-10 right-10 flex flex-col gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={() => setFullScreenMode(!fullScreenMode)} 
                    className="p-5 bg-indigo-500 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl" 
                    title={fullScreenMode ? "Salir de pantalla completa" : "Pantalla completa"}
                  >
                    {fullScreenMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                  </button>
                  <button onClick={() => setIsEditing(true)} className="p-5 bg-white text-nano-50 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl" title="Editar"><Edit2 size={24} /></button>
                  <button onClick={() => { const a = document.createElement('a'); a.href = currentImage.url; a.download='ai-photo.png'; a.click(); }} className="p-5 bg-emerald-500 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl" title="Descargar"><Download size={24} /></button>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-10 space-y-8 animate-in fade-in duration-1000">
                <Telescope size={150} className="mx-auto" strokeWidth={1} />
                <p className="text-[14px] font-black uppercase tracking-[0.8em]">Cámara en Espera</p>
              </div>
            )}
          </div>

          {!fullScreenMode && allImages.length > 0 && (
            <div className="h-44 border-t border-white/5 bg-nano-100/40 backdrop-blur-2xl px-12 flex items-center gap-6 overflow-x-auto hide-scrollbar scroll-smooth shrink-0">
              {allImages.slice(0, 12).map(img => (
                <button 
                  key={img.id} onClick={() => handleSelectImage(img)}
                  className={`w-24 h-24 rounded-3xl overflow-hidden border-2 flex-shrink-0 transition-all duration-500 ${currentImage?.id === img.id ? 'border-emerald-500 scale-110 shadow-xl' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {isEditing && currentImage && (
        <ImageEditor 
          imageSrc={currentImage.url} prompt={prompt} styleId={selectedStyleId} initialCreativity={creativity}
          onSave={url => { 
            const updated = {...currentImage, url};
            handleUpdateImage(updated);
            setIsEditing(false); 
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {isGalleryOpen && (
        <Gallery 
          images={allImages}
          onClose={() => setIsGalleryOpen(false)}
          onSelectImage={(img) => {
            handleSelectImage(img);
            setIsGalleryOpen(false);
          }}
          onDeleteImage={handleDeleteImage}
          onUpdateImage={handleUpdateImage}
          onDeleteMultipleImages={handleDeleteMultipleImages}
        />
      )}

      <AnimatePresence>
        {hoveredStyle && (
          <StylePreviewTooltip hoveredStyle={hoveredStyle} hoveredStyleTop={hoveredStyleTop} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
