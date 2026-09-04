
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './UI';
import { 
  Check, X, Crop, Wand2, ZoomIn, RotateCcw, Loader2, Sliders, Sun, Contrast, 
  Lock, Unlock, Droplets, Eye, EyeOff, Zap, Undo, Redo, BrainCircuit, Eraser, Trash2
} from 'lucide-react';
import { IMAGE_FILTERS, ASPECT_RATIOS, LIGHT_SOURCES, LIGHT_DIRECTIONS } from '../constants';
import { generateImageWithNano } from '../services/geminiService';

interface ImageEditorProps {
  imageSrc: string;
  prompt: string;
  styleId: string;
  initialCreativity: number;
  onSave: (newImageSrc: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageSrc: initialImageSrc, prompt: initialPrompt, styleId, initialCreativity, onSave, onCancel 
}) => {
  const [activeTab, setActiveTab] = useState<'filter' | 'adjust' | 'lighting' | 'crop' | 'eraser' | 'rotate'>('eraser'); 
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeFilterId, setActiveFilterId] = useState('none');
  
  const [currentImageSrc, setCurrentImageSrc] = useState(initialImageSrc);
  const [isRefining, setIsRefining] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(initialPrompt);

  // Crop state
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropOverlayRef = useRef<HTMLDivElement>(null);

  const clearMask = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTab !== 'eraser') return;
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    
    // Correct coordinate mapping taking into account CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.lineWidth = brushSize * scaleX; // Scale brush size relative to canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Use semi-transparent red for visibility
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || activeTab !== 'eraser') return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const getMaskData = () => {
    const canvas = canvasRef.current!;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const mCtx = maskCanvas.getContext('2d')!;
    
    // 1. Fill background with BLACK (Keep area)
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // 2. Draw the current drawings onto the mask canvas
    // We can just draw the source canvas on top.
    mCtx.drawImage(canvas, 0, 0);
    
    // 3. Convert non-black pixels to pure WHITE (Edit area)
    const data = mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      if (r > 50) { // Threshold to detect drawn areas
        data.data[i] = 255;     // R
        data.data[i+1] = 255;   // G
        data.data[i+2] = 255;   // B
        data.data[i+3] = 255;   // Alpha
      } else {
        data.data[i] = 0;
        data.data[i+1] = 0;
        data.data[i+2] = 0;
        data.data[i+3] = 255;
      }
    }
    mCtx.putImageData(data, 0, 0);
    return maskCanvas.toDataURL('image/png');
  };

  const handleAIRefine = async () => {
    setIsRefining(true);
    try {
      const mask = activeTab === 'eraser' ? getMaskData() : null;
      // If erasing, pass empty string to trigger removal logic in service
      const promptToUse = activeTab === 'eraser' ? "" : localPrompt;
      
      const newImg = await generateImageWithNano(
        promptToUse, 
        styleId, 
        "1:1", 
        undefined, 
        initialCreativity, 
        currentImageSrc, 
        mask
      );
      
      setCurrentImageSrc(newImg);
      clearMask();
      // Don't switch tab immediately so user can see result
    } catch (e) {
      console.error(e);
      alert("Error generating edit. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  // Combine manual adjustments and preset filter for preview
  const getFilterStyle = () => {
    const manualFilters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    const presetFilter = IMAGE_FILTERS.find(f => f.id === activeFilterId)?.filter || 'none';
    return presetFilter !== 'none' ? `${manualFilters} ${presetFilter}` : manualFilters;
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const sourceX = (cropRect.x / 100) * img.naturalWidth;
      const sourceY = (cropRect.y / 100) * img.naturalHeight;
      const sourceWidth = (cropRect.width / 100) * img.naturalWidth;
      const sourceHeight = (cropRect.height / 100) * img.naturalHeight;
      
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
      );
      
      setCurrentImageSrc(canvas.toDataURL('image/png'));
      setCropRect({ x: 10, y: 10, width: 80, height: 80 });
      setActiveTab('adjust');
    }
  };

  const handleSave = () => {
    // Bake the CSS filters into the image using a canvas
    if (!imageRef.current) {
        onSave(currentImageSrc);
        return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (ctx) {
        // Handle rotation in final save
        if (rotation % 180 === 0) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        } else {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        }
        
        ctx.filter = getFilterStyle();
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        
        onSave(canvas.toDataURL('image/png'));
    } else {
        onSave(currentImageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-nano-50 flex flex-col animate-in fade-in">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-nano-100 shrink-0">
        <button onClick={onCancel} className="p-2 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        <div className="flex gap-4">
          <button 
            onClick={handleAIRefine} 
            disabled={isRefining} 
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor"/>}
            {activeTab === 'eraser' ? 'Borrar Objeto' : 'Refinar'}
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-white text-nano-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">
            Guardar
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-grow relative flex items-center justify-center p-8 overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
        <div className="relative max-w-full max-h-full aspect-square shadow-2xl rounded-sm overflow-hidden border border-white/5 bg-black/40 backdrop-blur-md">
          <img 
            ref={imageRef} 
            src={currentImageSrc} 
            className="w-full h-full object-contain pointer-events-none select-none transition-all duration-300" 
            style={{ 
              filter: getFilterStyle(),
              transform: `rotate(${rotation}deg)`
            }} 
            crossOrigin="anonymous"
          />
          <canvas 
            ref={canvasRef} 
            width={1024} height={1024}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setIsDrawing(false)}
            onPointerLeave={() => setIsDrawing(false)}
            className={`absolute inset-0 w-full h-full touch-none ${activeTab === 'eraser' ? 'cursor-crosshair opacity-100' : 'pointer-events-none opacity-0'}`}
          />
          
          {activeTab === 'crop' && (
            <div className="absolute inset-0 bg-black/40">
              <div 
                className="absolute border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
                style={{
                  left: `${cropRect.x}%`,
                  top: `${cropRect.y}%`,
                  width: `${cropRect.width}%`,
                  height: `${cropRect.height}%`
                }}
              >
                {/* Resize handles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-500 rounded-full"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-500 rounded-full"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tools Panel */}
      <div className="h-64 bg-nano-100 border-t border-white/10 flex flex-col shrink-0 z-20">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {[
            { id: 'eraser', icon: Eraser, label: 'Magic Eraser' },
            { id: 'adjust', icon: Sliders, label: 'Ajustes' },
            { id: 'filter', icon: Wand2, label: 'Filtros' },
            { id: 'crop', icon: Crop, label: 'Recortar' },
            { id: 'rotate', icon: RotateCcw, label: 'Girar' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id as any)} 
              className={`flex-1 py-5 flex items-center justify-center gap-3 text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === t.id ? 'bg-white/5 border-b-2 border-emerald-500 text-white' : 'text-white/30 hover:bg-white/5 hover:text-white/60'}`}
            >
              <t.icon size={16} className={activeTab === t.id ? 'text-emerald-400' : ''} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tools Content */}
        <div className="p-8 h-full flex items-center justify-center overflow-hidden">
          
          {activeTab === 'adjust' && (
            <div className="w-full max-w-2xl grid grid-cols-2 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-2"><Sun size={12}/> Brillo</span>
                    <span>{brightness}%</span>
                </div>
                <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-2"><Contrast size={12}/> Contraste</span>
                    <span>{contrast}%</span>
                </div>
                <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-2"><Droplets size={12}/> Saturación</span>
                    <span>{saturation}%</span>
                </div>
                <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          )}

          {activeTab === 'filter' && (
            <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar animate-in fade-in">
                <div className="grid grid-cols-4 gap-3 pb-4">
                  {IMAGE_FILTERS.map(f => (
                     <button
                        key={f.id}
                        onClick={() => setActiveFilterId(f.id)}
                        className={`
                            h-20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            flex flex-col items-center justify-center gap-2 border
                            ${activeFilterId === f.id 
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-white/20' 
                                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'}
                        `}
                     >
                        <div className={`w-3 h-3 rounded-full ${activeFilterId === f.id ? 'bg-white' : 'bg-white/20'}`}></div>
                        <span>{f.name}</span>
                     </button>
                  ))}
                </div>
            </div>
          )}

          {activeTab === 'eraser' && (
            <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center space-y-1">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Eliminación Inteligente</h3>
                <p className="text-[10px] text-white/40">Pinta sobre el objeto que deseas eliminar</p>
              </div>
              
              <div className="w-full bg-white/5 p-6 rounded-2xl flex items-center gap-8 border border-white/5">
                <div className="flex-grow space-y-3">
                    <div className="flex justify-between text-[9px] font-black opacity-40 uppercase tracking-widest">
                        <span>Tamaño Pincel</span>
                        <span>{brushSize}px</span>
                    </div>
                    <input type="range" min="10" max="150" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <button 
                    onClick={clearMask} 
                    className="shrink-0 flex flex-col items-center gap-2 text-white/40 hover:text-red-400 transition-colors group"
                >
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-red-500/10 transition-colors">
                        <RotateCcw size={16} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Deshacer</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rotate' && (
            <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center space-y-1">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Rotación de Imagen</h3>
                <p className="text-[10px] text-white/40">Gira la imagen en incrementos de 90 grados</p>
              </div>
              <button 
                onClick={handleRotate}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                <RotateCcw size={20} />
                Girar 90°
              </button>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center space-y-1">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Recorte de Precisión</h3>
                <p className="text-[10px] text-white/40">Ajusta el área de recorte y confirma</p>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black opacity-40 uppercase tracking-widest">
                    <span>Ancho</span>
                    <span>{cropRect.width}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={cropRect.width} onChange={e => setCropRect({...cropRect, width: parseInt(e.target.value)})} className="w-full" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black opacity-40 uppercase tracking-widest">
                    <span>Alto</span>
                    <span>{cropRect.height}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={cropRect.height} onChange={e => setCropRect({...cropRect, height: parseInt(e.target.value)})} className="w-full" />
                </div>
              </div>

              <button 
                onClick={handleApplyCrop}
                className="flex items-center gap-3 px-8 py-4 bg-white text-nano-50 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                <Check size={20} />
                Aplicar Recorte
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
