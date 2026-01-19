// components/banner.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já fechou o banner nesta sessão
    const bannerClosed = sessionStorage.getItem("aspasBannerClosed");
    if (!bannerClosed) {
      // Mostrar após um pequeno delay para não atrapalhar o carregamento
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    
    // Animar a saída
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      
      // Armazenar apenas nesta sessão
      sessionStorage.setItem("aspasBannerClosed", "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "relative w-full bg-gradient-to-r from-[#8B48D3] via-[#9A5AE6] to-[#A15FE2]",
      "border-b border-[#8B48D3]/30",
      "transition-all duration-300 ease-in-out",
      isClosing ? "opacity-0 -translate-y-full h-0" : "opacity-100 translate-y-0 h-auto"
    )}>
      {/* Efeito de brilho sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      <div className="container mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex flex-row items-center justify-between gap-3">
          {/* Logo e texto */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative mt-1 w-30 h-10 flex-shrink-0">
              <Image
                src="https://associacaoproautistas.com.br/wp-content/uploads/2023/03/logo-branca.png"
                alt="ASPAS - Associação Pró Autistas"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            
            <div className="hidden sm:block flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-white leading-tight truncate">
                Conheça a associação que apoia pessoas autistas
              </p>
              <p className="text-[10px] md:text-xs text-white/90 leading-tight mt-0.5 truncate">
                Visite o site da ASPAS e saiba mais sobre o trabalho da associação
              </p>
            </div>
            
            <div className="sm:hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">
                Conheça a ASPAS
              </p>
              <p className="text-[9px] text-white/90 leading-tight mt-0.5 truncate">
                Associação Pró Autistas
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="https://associacaoproautistas.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap backdrop-blur-sm"
            >
              Visitar Site
            </Link>
            
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200 group flex-shrink-0"
              aria-label="Fechar banner"
            >
              <X className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Efeito de brilho sutil no fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}