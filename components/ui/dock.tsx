"use client";
import React from 'react';
import { cn } from "@/lib/utils";

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

export default function Dock({ children, className }: DockProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav className={cn(`
        /* Interatividade */
        pointer-events-auto
        
        /* Layout Responsivo: w-[90%] no mobile e w-max no desktop */
        w-[92%] md:w-max 
        flex items-center justify-between md:justify-center
        
        /* Visual Complexo e Premium */
        bg-background/80 backdrop-blur-xl
        border-[0.5px] border-primary/50
        px-4 md:px-10 py-5 md:py-6
        rounded-2xl
        
        /* Efeito Neon e Sombras em Camadas (Profundidade Logística) */
        shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_15px_rgba(var(--primary),0.2),inset_0_1px_1px_rgba(255,255,255,0.05)]
        
        /* Reset Total de Estilos Internos */
        [&_*]:no-underline
        
        /* Animação de Entrada */
        animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out
      `, className)}>
        {children}
      </nav>
    </div>
  );
}