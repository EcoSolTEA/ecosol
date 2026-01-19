"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink as ExternalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(true);
    
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  };

  const handleBannerClick = () => {
    window.open("https://associacaoproautistas.com.br", "_blank", "noopener,noreferrer");
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative w-full bg-gradient-to-r from-[#8B48D3] via-[#9A5AE6] to-[#A15FE2]",
        "border-b border-[#8B48D3]/30 cursor-pointer group overflow-hidden",
        "transition-all duration-200 ease-in-out hover:brightness-110",
        isClosing ? "opacity-0 -translate-y-full h-0" : "opacity-100 translate-y-0 h-auto"
      )}
      onClick={handleBannerClick}
      role="button"
      tabIndex={0}
      aria-label="Visite o site da ASPAS - Associação Pró Autistas"
    >
      {/* Container com justify-center para centralizar o conteúdo real */}
      <div className="container mx-auto px-3 py-1.5 relative flex items-center justify-center min-h-[40px]">
        
        {/* CONTEÚDO CENTRALIZADO */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-20 h-7 flex-shrink-0 mt-1">
            <Image
              src="https://associacaoproautistas.com.br/wp-content/uploads/2023/03/logo-branca.png"
              alt="ASPAS"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          
          {/* Divisor sutil para separar logo de texto */}
          <div className="h-4 w-px bg-white/20 hidden xs:block" />

          {/* DESKTOP TEXT */}
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold text-white truncate">
              Conheça a ASPAS, associação que apoia pessoas autistas.
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10 group-hover:bg-white/20 transition-all flex items-center gap-1.5">
              Acessar
              <ExternalIcon className="h-3 w-3" />
            </span>
          </div>
          
          {/* MOBILE TEXT */}
          <div className="sm:hidden flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-white truncate">
              Conheça a ASPAS.
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              Link
              <ExternalIcon className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>

        {/* BOTÃO FECHAR: Absolute para não interferir na centralização do texto */}
        <button
          onClick={handleClose}
          className="absolute right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar banner"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}