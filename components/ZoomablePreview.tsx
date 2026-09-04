import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react';

interface ZoomablePreviewProps {
  src: string;
  alt: string;
  className?: string;
  isVisible: boolean;
}

export const ZoomablePreview: React.FC<ZoomablePreviewProps> = ({ src, alt, className, isVisible }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when the image source changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoaded(false);
  }, [src]);

  // Non-passive wheel listener for proper scroll blocking and zoom-to-cursor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Allow scroll if not zoomed and not intending to zoom (no modifiers)
      if (scale === 1 && !e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const mx = x - rect.width / 2;
      const my = y - rect.height / 2;

      const delta = e.deltaY * -0.002;
      const newScale = Math.min(Math.max(1, scale + delta), 4);
      
      if (newScale === 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
          return;
      }

      const scaleRatio = newScale / scale;
      const newPos = {
          x: mx - (mx - position.x) * scaleRatio,
          y: my - (my - position.y) * scaleRatio
      };

      setScale(newScale);
      setPosition(newPos);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [scale, position]);

  // Button handlers
  const handleZoomIn = () => {
      setScale(s => Math.min(s + 0.5, 4));
  };
  
  const handleZoomOut = () => {
    setScale(s => {
        const next = Math.max(s - 0.5, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden group bg-nano-50 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
    >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <Loader2 className="w-8 h-8 text-nano-300 animate-spin" />
          </div>
        )}

        <div
            className="relative flex items-center justify-center"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                touchAction: 'none',
                willChange: 'transform'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <img
                src={src}
                alt={alt}
                draggable={false}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>

        <div 
            className={`
                absolute bottom-6 left-1/2 -translate-x-1/2 
                flex items-center gap-2 
                bg-nano-900/90 backdrop-blur-md rounded-full px-3 py-2 
                text-white shadow-2xl border border-white/10 
                transition-all duration-300 z-10
                ${isLoaded && scale > 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                ${isLoaded && 'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}
            `}
        >
            <button 
                onClick={handleZoomOut} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-nano-900" 
                title="Alejar"
            >
                <ZoomOut size={16} />
            </button>
            <span className="text-xs font-medium w-12 text-center select-none font-mono tabular-nums">
                {Math.round(scale * 100)}%
            </span>
            <button 
                onClick={handleZoomIn} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-nano-900" 
                title="Acercar"
            >
                <ZoomIn size={16} />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button 
                onClick={handleReset} 
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-nano-900" 
                title="Reiniciar Vista"
            >
                <Maximize size={16} />
            </button>
        </div>
        
        {isLoaded && scale === 1 && (
             <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm border border-white/10">
                Pellizca o usa el ratón para hacer zoom
             </div>
        )}
    </div>
  );
};