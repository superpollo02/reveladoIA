import React, { useState, useMemo } from 'react';
import { 
  Search, Folder, Tag, X, Trash2, Download, 
  ChevronRight, Grid, List, Filter, Calendar,
  MoreVertical, ExternalLink, Image as ImageIcon,
  Columns, Check, CheckSquare
} from 'lucide-react';
import { GeneratedImage } from '../types';
import { ART_STYLES } from '../constants';

interface GalleryProps {
  images: GeneratedImage[];
  onClose: () => void;
  onSelectImage: (img: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
  onUpdateImage: (img: GeneratedImage) => void;
  onDeleteMultipleImages?: (ids: string[]) => Promise<void>;
}

export const Gallery: React.FC<GalleryProps> = ({ 
  images, onClose, onSelectImage, onDeleteImage, onUpdateImage, onDeleteMultipleImages 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showCompareResult, setShowCompareResult] = useState(false);

  // Multi-Select Mode States
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCompareImages = useMemo(() => {
    const map = new Map(images.map(img => [img.id, img]));
    return selectedCompareIds.map(id => map.get(id)).filter(Boolean) as GeneratedImage[];
  }, [images, selectedCompareIds]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(images)) {
      images.forEach(img => {
        if (img?.folder) set.add(img.folder);
      });
    }
    return Array.from(set);
  }, [images]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(images)) {
      images.forEach(img => {
        img?.tags?.forEach(tag => set.add(tag));
      });
    }
    return Array.from(set);
  }, [images]);

  const filteredImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images.filter(img => {
      if (!img) return false;
      const prompt = img.prompt || '';
      const id = img.id || '';
      const matchesSearch = prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = !selectedFolder || img.folder === selectedFolder;
      const matchesTag = !selectedTag || img.tags?.includes(selectedTag);
      return matchesSearch && matchesFolder && matchesTag;
    });
  }, [images, searchQuery, selectedFolder, selectedTag]);

  const handleAddTag = (img: GeneratedImage, tag: string) => {
    const newTags = [...(img.tags || []), tag];
    onUpdateImage({ ...img, tags: Array.from(new Set(newTags)) });
  };

  const handleRemoveTag = (img: GeneratedImage, tag: string) => {
    onUpdateImage({ ...img, tags: img.tags?.filter(t => t !== tag) });
  };

  const handleToggleCompareSelect = (id: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredImages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredImages.map(img => img.id));
    }
  };

  const handleExportBatch = () => {
    if (selectedIds.length === 0) return;
    
    const selectedImages = filteredImages.filter(img => selectedIds.includes(img.id));
    
    // 1. Trigger sequential staggered image file downloads (prevents browser block)
    selectedImages.forEach((img, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.url;
        const cleanPrompt = img.prompt ? img.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'ai-photo';
        a.download = `estudio-revelado-${cleanPrompt}-${img.id.slice(0, 8)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 250);
    });

    // 2. Also generate and download a beautifully formatted unified JSON of selected metadata!
    setTimeout(() => {
      const metadataToExport = selectedImages.map(img => ({
        id: img.id,
        prompt: img.prompt,
        styleId: img.styleId,
        aspectRatio: img.aspectRatio,
        creativity: img.creativity,
        lightSourceId: img.lightSourceId,
        lightDirectionId: img.lightDirectionId,
        filterId: img.filterId,
        timestamp: img.timestamp,
        seed: img.seed,
        tags: img.tags,
        folder: img.folder,
        imageUrl: img.url
      }));

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metadataToExport, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `estudio-revelado-lote-metadatos-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    }, selectedImages.length * 250 + 200);
  };

  const handleConfirmDeleteBatch = async () => {
    if (selectedIds.length === 0) return;
    
    if (onDeleteMultipleImages) {
      await onDeleteMultipleImages(selectedIds);
    } else {
      for (const id of selectedIds) {
        onDeleteImage(id);
      }
    }
    setSelectedIds([]);
    setSelectMode(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-nano-50 flex flex-col animate-in fade-in">
      {/* Header */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-nano-100 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">Galería de Capturas</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{images.length} Archivos Generados</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              const nextMode = !compareMode;
              setCompareMode(nextMode);
              setSelectedCompareIds([]);
              setShowCompareResult(false);
              if (nextMode) {
                setSelectMode(false);
                setSelectedIds([]);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              compareMode 
                ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
            title="Selecciona dos imágenes para compararlas lado a lado"
          >
            <Columns size={14} />
            <span>{compareMode ? 'Desactivar Comp.' : 'Modo Comparación'}</span>
          </button>

          <button 
            onClick={() => {
              const nextMode = !selectMode;
              setSelectMode(nextMode);
              setSelectedIds([]);
              setShowDeleteConfirm(false);
              if (nextMode) {
                setCompareMode(false);
                setSelectedCompareIds([]);
                setShowCompareResult(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectMode 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
            title="Selecciona múltiples imágenes para acciones en lote"
          >
            <CheckSquare size={14} />
            <span>{selectMode ? 'Desactivar Sel.' : 'Selección Múltiple'}</span>
          </button>

          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por prompt o ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-6 text-sm outline-none focus:ring-1 focus:ring-emerald-500 w-80 transition-all"
            />
          </div>
          
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-nano-50 shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-nano-50 shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-72 border-r border-white/5 bg-nano-100/30 p-8 space-y-10 overflow-y-auto hide-scrollbar">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Carpetas</label>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${!selectedFolder ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-white/60'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={14} />
                  <span className="text-xs font-bold">Todas</span>
                </div>
                <span className="text-[10px] opacity-40">{images.length}</span>
              </button>
              {folders.map(f => (
                <button 
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedFolder === f ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-white/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={14} />
                    <span className="text-xs font-bold">{f}</span>
                  </div>
                  <span className="text-[10px] opacity-40">{images.filter(img => img.folder === f).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!selectedTag ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Todas
              </button>
              {tags.map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedTag === t ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
          {filteredImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-6">
              <ImageIcon size={100} strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-[0.5em]">No se encontraron capturas</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
              {filteredImages.map(img => {
                const isSelectedForCompare = selectedCompareIds.includes(img.id);
                const isSelectedForBatch = selectedIds.includes(img.id);
                return (
                  <div 
                    key={img.id} 
                    onClick={() => {
                      if (compareMode) {
                        handleToggleCompareSelect(img.id);
                      } else if (selectMode) {
                        handleToggleSelect(img.id);
                      }
                    }}
                    className={`group relative bg-nano-100 rounded-[2.5rem] overflow-hidden border transition-all ${
                      compareMode 
                        ? isSelectedForCompare 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10 cursor-pointer' 
                          : 'border-white/5 hover:border-indigo-500/30 cursor-pointer' 
                        : selectMode
                          ? isSelectedForBatch
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xl shadow-emerald-500/10 cursor-pointer'
                            : 'border-white/5 hover:border-emerald-500/30 cursor-pointer'
                          : 'border-white/5 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Compare Selection Circle Overlay */}
                      {compareMode && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelectedForCompare 
                              ? 'bg-indigo-500 border-indigo-400 text-white scale-110 shadow-lg' 
                              : 'bg-black/40 border-white/40 text-transparent hover:border-white'
                          }`}>
                            <Check size={20} className={isSelectedForCompare ? 'opacity-100' : 'opacity-0'} />
                          </div>
                        </div>
                      )}

                      {/* Batch Selection Circle Overlay */}
                      {selectMode && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelectedForBatch 
                              ? 'bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg' 
                              : 'bg-black/40 border-white/40 text-transparent hover:border-white'
                          }`}>
                            <Check size={20} className={isSelectedForBatch ? 'opacity-100' : 'opacity-0'} />
                          </div>
                        </div>
                      )}

                      {!compareMode && !selectMode && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => onSelectImage(img)}
                            className="p-4 bg-white text-nano-50 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                          >
                            <ExternalLink size={20} />
                          </button>
                          <button 
                            onClick={() => { const a = document.createElement('a'); a.href = img.url; a.download=`ai-photo-${img.id}.png`; a.click(); }}
                            className="p-4 bg-emerald-500 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                          >
                            <Download size={20} />
                          </button>
                        </div>
                      )}

                      <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                        {img.tags?.slice(0, 2).map(t => (
                          <span key={t} className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-xs text-white/60 line-clamp-2 font-medium leading-relaxed">{img.prompt}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                          <Calendar size={12} />
                          {new Date(img.timestamp).toLocaleDateString()}
                        </div>
                        {!compareMode && !selectMode && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
                            className="p-2 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {filteredImages.map(img => {
                const isSelectedForCompare = selectedCompareIds.includes(img.id);
                const isSelectedForBatch = selectedIds.includes(img.id);
                return (
                  <div 
                    key={img.id} 
                    onClick={() => {
                      if (compareMode) {
                        handleToggleCompareSelect(img.id);
                      } else if (selectMode) {
                        handleToggleSelect(img.id);
                      }
                    }}
                    className={`group flex items-center gap-8 bg-nano-100 p-4 rounded-3xl border transition-all ${
                      compareMode 
                        ? isSelectedForCompare 
                          ? 'border-indigo-500 bg-indigo-500/5 cursor-pointer' 
                          : 'border-white/5 hover:border-indigo-500/30 cursor-pointer' 
                        : selectMode
                          ? isSelectedForBatch
                            ? 'border-emerald-500 bg-emerald-500/5 cursor-pointer'
                            : 'border-white/5 hover:border-emerald-500/30 cursor-pointer'
                          : 'border-white/5 hover:border-emerald-500/30'
                    }`}
                  >
                    {/* Checkbox indicator in list mode */}
                    {compareMode && (
                      <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelectedForCompare 
                          ? 'bg-indigo-500 border-indigo-400 text-white' 
                          : 'border-white/20'
                      }`}>
                        {isSelectedForCompare && <Check size={12} />}
                      </div>
                    )}

                    {selectMode && (
                      <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelectedForBatch 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-white/20'
                      }`}>
                        {isSelectedForBatch && <Check size={12} />}
                      </div>
                    )}

                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img src={img.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ID: {img.id.slice(0, 8)}</span>
                        <span className="text-[10px] text-white/20">•</span>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{new Date(img.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-white/80 font-medium truncate">{img.prompt}</p>
                      <div className="flex gap-2 mt-2">
                        {img.tags?.map(t => (
                          <span key={t} className="text-[9px] text-emerald-400/60">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-4">
                      {!compareMode && !selectMode ? (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); onSelectImage(img); }} className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"><ExternalLink size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }} className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </>
                      ) : compareMode ? (
                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          isSelectedForCompare ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/30'
                        }`}>
                          {isSelectedForCompare ? 'Seleccionada' : 'Seleccionar'}
                        </div>
                      ) : (
                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          isSelectedForBatch ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/30'
                        }`}>
                          {isSelectedForBatch ? 'Seleccionada' : 'Seleccionar'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating compare mode controller */}
      {compareMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[105] bg-nano-100/95 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex items-center gap-6 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Columns size={14} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white">Comparador Activo</p>
              <p className="text-[9px] text-white/50">Selecciona 2 capturas para evaluar</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-black bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
              {selectedCompareIds.length}/2
            </span>
            
            <button
              disabled={selectedCompareIds.length !== 2}
              onClick={() => setShowCompareResult(true)}
              className="px-6 py-2.5 bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 hover:bg-indigo-400 text-white disabled:border-transparent border border-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:shadow-none"
            >
              Ver Lado a Lado
            </button>

            <button 
              onClick={() => {
                setCompareMode(false);
                setSelectedCompareIds([]);
              }}
              className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating select mode controller */}
      {selectMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[105] bg-nano-100/95 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex items-center gap-6 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckSquare size={14} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white">Selección Múltiple</p>
              <p className="text-[9px] text-white/50">{selectedIds.length} capturas seleccionadas</p>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-4 animate-in fade-in duration-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                ¿Confirmas la eliminación permanente de {selectedIds.length} capturas?
              </span>
              <button
                onClick={handleConfirmDeleteBatch}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
              >
                Sí, Eliminar Lote
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-xs font-black bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                {selectedIds.length}/{filteredImages.length}
              </span>

              {/* Select All / Deselect All Toggle */}
              <button
                onClick={handleToggleSelectAll}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {selectedIds.length === filteredImages.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </button>
              
              {/* Export Batch Button */}
              <button
                disabled={selectedIds.length === 0}
                onClick={handleExportBatch}
                className="px-5 py-2.5 bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 hover:bg-emerald-400 text-white disabled:border-transparent border border-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:shadow-none flex items-center gap-2"
              >
                <Download size={12} />
                <span>Exportar Lote</span>
              </button>

              {/* Delete Batch Button */}
              <button
                disabled={selectedIds.length === 0}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2.5 bg-rose-500/10 disabled:bg-white/5 disabled:text-white/20 hover:bg-rose-500/20 text-rose-400 disabled:border-transparent border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:shadow-none flex items-center gap-2"
              >
                <Trash2 size={12} />
                <span>Eliminar Lote</span>
              </button>

              <button 
                onClick={() => {
                  setSelectMode(false);
                  setSelectedIds([]);
                }}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Modal Overlay */}
      {showCompareResult && selectedCompareImages.length === 2 && (
        <div className="fixed inset-0 z-[120] bg-nano-50 flex flex-col animate-in fade-in duration-300">
          {/* Header of Compare View */}
          <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-nano-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Columns size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tighter">Comparador de Resultados</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Evaluación Lado a Lado de Parámetros e IA</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCompareResult(false)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Regresar a Selección
              </button>
              <button 
                onClick={() => {
                  setShowCompareResult(false);
                  setCompareMode(false);
                  setSelectedCompareIds([]);
                }}
                className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Salir de Comparación
              </button>
            </div>
          </header>

          {/* Side-by-Side Panel Content */}
          <div className="flex-grow flex divide-x divide-white/5 overflow-hidden">
            {selectedCompareImages.map((img, idx) => {
              const styleName = ART_STYLES.find(s => s.id === img.styleId)?.name || img.styleId;
              return (
                <div key={img.id} className="flex-1 flex flex-col overflow-hidden bg-nano-100/30">
                  {/* Title / Placement Label */}
                  <div className="h-12 bg-white/5 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      Imagen {idx === 0 ? 'Izquierda' : 'Derecha'}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">ID: {img.id.slice(0, 8)}</span>
                  </div>

                  {/* Split Screen Image Scroll Area */}
                  <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="relative aspect-square max-w-lg mx-auto bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                      <img src={img.url} className="w-full h-full object-contain" />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-3">
                        <button 
                          onClick={() => {
                            onSelectImage(img);
                            onClose();
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Cargar en Laboratorio
                        </button>
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = img.url;
                            a.download = `ai-photo-${img.id}.png`;
                            a.click();
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-colors"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Technical Comparison Sheet */}
                    <div className="max-w-lg mx-auto bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-4">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-2">Metadatos & Parámetros</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Indicación (Prompt)</span>
                          <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed font-medium max-h-32 overflow-y-auto custom-scrollbar">
                            {img.prompt}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Estilo</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20 inline-block">
                              {styleName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Geometría</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-white/60 border border-white/5 inline-block">
                              {img.aspectRatio || '1:1'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Semilla (Seed)</span>
                            <span className="text-xs font-mono text-white/60">
                              {img.seed !== undefined ? img.seed : 'Aleatorio'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Creatividad (Temp)</span>
                            <span className="text-xs font-semibold text-white/80">
                              {img.creativity !== undefined ? `${img.creativity}%` : 'Estándar'}
                            </span>
                          </div>
                        </div>

                        {(img.lightSourceId || img.lightDirectionId) && (
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                            {img.lightSourceId && (
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Fuente de Luz</span>
                                <span className="text-xs font-semibold text-white/70 capitalize">{img.lightSourceId}</span>
                              </div>
                            )}
                            {img.lightDirectionId && (
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Dirección de Luz</span>
                                <span className="text-xs font-semibold text-white/70 capitalize">{img.lightDirectionId}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Fecha de Captura</span>
                          <span className="text-xs text-white/50">{new Date(img.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

  );
};
