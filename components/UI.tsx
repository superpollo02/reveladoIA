
import React, { useState, useRef } from 'react';
import { ArtStyle } from '../types';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StylePreviewData {
  imageUrl: string;
  tags: string[];
}

const STYLE_PREVIEWS: Record<string, StylePreviewData> = {
  'warm-interior': {
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    tags: ['Cozy Ambient', 'Luz Dorada', 'Cálido', 'Foco Suave']
  },
  'daytime-exterior': {
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    tags: ['Arquitectura', 'Luz Natural', 'Cielo Azul', 'Nitidez']
  },
  'night-exterior': {
    imageUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=400&q=80',
    tags: ['Calle Urbana', 'Luces de Ciudad', 'Atmosférico', 'Contraste']
  },
  'minimal-studio': {
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    tags: ['Fondo Blanco', 'Foto Producto', 'Estudio', 'Limpio']
  },
  'natural-portrait': {
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    tags: ['Retrato', 'Luz Ventana', 'Fondo Bokeh', 'Lente 85mm']
  },
  'moody-cinematic': {
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
    tags: ['Teal & Orange', 'Grano Cine', 'Drama', 'Sombras']
  },
  'cyberpunk': {
    imageUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=400&q=80',
    tags: ['Luces Neón', 'Futurista', 'Cyberpunk', 'Lluvia']
  },
  'analog-film': {
    imageUrl: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&w=400&q=80',
    tags: ['Analog 35mm', 'Portra 400', 'Vintage', 'Nostalgia']
  },
  'anime-style': {
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    tags: ['Estilo Ghibli', 'Líneas 2D', 'Cel Shaded', 'Vibrante']
  },
  'bw-noir': {
    imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    tags: ['Monocromo', 'Chiaroscuro', 'Cine Negro', 'Sombras']
  },
  '3d-surreal': {
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    tags: ['Octane Render', 'Unreal Engine 5', 'Pastel', 'Surreal']
  },
  'oil-painting': {
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    tags: ['Lienzo Óleo', 'Pincelada', 'Arte Clásico', 'Impasto']
  },
  'watercolor': {
    imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=400&q=80',
    tags: ['Acuarela', 'Suave', 'Transparencias', 'Artístico']
  },
  'isometric': {
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    tags: ['Low Poly', 'Isometric 3D', 'Miniatura', 'Orto Cam']
  },
  'fantasy-epic': {
    imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4e6663104?auto=format&fit=crop&w=400&q=80',
    tags: ['Épico RPG', 'Fantasía', 'Místico', 'Etereo']
  },
  'polaroid': {
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
    tags: ['Instax Retro', 'Flash Directo', 'Viñeteado', 'Foco']
  }
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-3 px-8 py-4 rounded-[2rem] font-black transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] relative overflow-hidden group";
  
  const variants = {
    primary: "bg-white text-nano-50 hover:bg-emerald-500 hover:text-white shadow-xl shadow-black/20 uppercase tracking-[0.2em] text-[12px]",
    secondary: "bg-nano-100/50 backdrop-blur-md text-white border border-white/10 hover:border-white/30 shadow-sm uppercase tracking-widest text-[10px]",
    ghost: "bg-transparent text-white/40 hover:bg-white/5 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-5 w-5" />
          <span className="tracking-[0.4em]">SINTETIZANDO</span>
        </div>
      ) : (
        <>
          {icon && <span className="relative z-10">{icon}</span>}
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </>
      )}
    </button>
  );
};

// --- Style Card Component ---
interface StyleCardProps {
  style: ArtStyle;
  isSelected: boolean;
  onClick: () => void;
  onHoverStart?: (style: ArtStyle, top: number) => void;
  onHoverEnd?: () => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ 
  style, 
  isSelected, 
  onClick,
  onHoverStart,
  onHoverEnd 
}) => {
  // Determine if background is dark based on the gradient class string convention
  const isDarkBg = style.gradient.includes('text-white') || style.gradient.includes('slate-800') || style.gradient.includes('black');
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onHoverStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      onHoverStart(style, rect.top);
    }
  };

  return (
    <button 
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHoverEnd}
      className={`
        relative w-full h-40 rounded-[1.75rem] p-5 text-left transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group overflow-hidden flex flex-col justify-end
        bg-gradient-to-br ${style.gradient}
        ${isSelected 
          ? 'scale-[1.03] ring-4 ring-emerald-500 shadow-2xl shadow-emerald-900/40 z-10 opacity-100 -translate-y-1' 
          : 'scale-100 opacity-60 hover:opacity-100 hover:scale-[1.02] hover:shadow-xl border border-white/5 grayscale-[0.3] hover:grayscale-0'
        }
      `}
    >
      {/* Noise Texture for premium feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Subtle Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform"></div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className={`transform transition-all duration-500 origin-bottom-left ${isSelected ? 'translate-y-0' : 'translate-y-1'}`}>
          <h3 className={`font-black text-[13px] uppercase tracking-[0.15em] leading-none mb-2 drop-shadow-sm ${isDarkBg ? 'text-white' : 'text-nano-50'}`}>
            {style.name}
          </h3>
          <p className={`text-[9px] font-bold leading-tight line-clamp-2 ${isDarkBg ? 'text-white/70' : 'text-nano-50/70'}`}>
            {style.description}
          </p>
        </div>
      </div>

      {/* Selection Indicator */}
      <div className={`absolute top-3 right-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isDarkBg ? 'bg-white text-emerald-600' : 'bg-nano-50 text-emerald-400'}`}>
           <Check size={16} strokeWidth={4} />
        </div>
      </div>
      
      {/* Active Glow for Dark Mode consistency */}
      {isSelected && <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[1.75rem] pointer-events-none"></div>}
    </button>
  );
};

// --- Badge Component ---
export const Badge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 text-white/60 border border-white/5 shadow-inner">
    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-[0_0_10px_#10b981]"></span>
    {text}
  </span>
);

// --- Style Preview Tooltip Component ---
interface StylePreviewTooltipProps {
  hoveredStyle: ArtStyle;
  hoveredStyleTop: number;
}

export const StylePreviewTooltip: React.FC<StylePreviewTooltipProps> = ({ hoveredStyle, hoveredStyleTop }) => {
  const preview = STYLE_PREVIEWS[hoveredStyle.id];
  if (!preview) return null;

  // Calculate safe top position to avoid overflowing the screen bounds
  const safeTop = typeof window !== 'undefined' 
    ? Math.max(16, Math.min(hoveredStyleTop - 24, window.innerHeight - 340)) 
    : hoveredStyleTop;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.94 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        position: 'fixed',
        top: `${safeTop}px`,
        left: '462px'
      }}
      className="z-[100] w-72 bg-nano-100/95 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-4.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] pointer-events-none flex flex-col gap-3.5"
    >
      {/* Visual Showcase */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-white/5 shrink-0 bg-nano-50">
        <img 
          src={preview.imageUrl} 
          alt={hoveredStyle.name}
          className="w-full h-full object-cover select-none" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[8px] font-black uppercase tracking-widest text-emerald-400">
          {hoveredStyle.category || 'Revelado'}
        </div>
      </div>

      {/* Text Details */}
      <div className="space-y-1 px-1">
        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-white leading-none">
          {hoveredStyle.name}
        </h4>
        <p className="text-[9px] font-medium text-white/50 leading-relaxed">
          {hoveredStyle.description}
        </p>
      </div>

      {/* Technical Keywords / Visual DNA */}
      <div className="pt-2.5 border-t border-white/5 px-1">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 block mb-2">
          ADN del Revelado IA
        </span>
        <div className="flex flex-wrap gap-1.5">
          {preview.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="text-[8px] font-black uppercase tracking-wide px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/5 text-emerald-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

