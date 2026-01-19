// components/banner.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";
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
        "border-b border-[#8B48D3]/30 cursor-pointer group",
        "transition-all duration-200 ease-in-out hover:from-[#9A5AE6] hover:via-[#A15FE2] hover:to-[#8B48D3]",
        isClosing ? "opacity-0 -translate-y-full h-0" : "opacity-100 translate-y-0 h-auto"
      )}
      onClick={handleBannerClick}
      role="button"
      tabIndex={0}
      aria-label="Visite o site da ASPAS - Associação Pró Autistas (abre em nova janela)"
      onKeyDown={(e) => e.key === 'Enter' && handleBannerClick()}
    >
      <div className="container mx-auto px-3 py-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo e texto em linha única */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-20 h-6 flex-shrink-0 mt-0.5">
              <Image
                src="https://associacaoproautistas.com.br/wp-content/uploads/2023/03/logo-branca.png"
                alt="ASPAS"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            
            <div className="hidden sm:block flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Conheça a ASPAS, associação que apoia pessoas autistas.
                </span>
                <span className="text-xs font-light text-white/90 whitespace-nowrap group-hover:text-white transition-colors flex items-center gap-0.5">
                  Clique para acessar
                  <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </span>
              </div>
            </div>
            
            <div className="sm:hidden flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Conheça a ASPAS.
                </span>
                <span className="text-xs font-light text-white/90 whitespace-nowrap group-hover:text-white transition-colors flex items-center gap-0.5">
                  Clique para acessar
                  <ExternalLink className="h-2.5 w-2.5 group-hover:scale-110 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          {/* Botão de fechar */}
          <button
            onClick={handleClose}
            className="p-0.5 hover:bg-white/20 rounded flex-shrink-0 transition-colors"
            aria-label="Fechar banner"
            tabIndex={0}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}