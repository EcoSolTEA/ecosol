"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        // ESTRUTURA FIXA E IMUTÁVEL - NÃO PODE SER SOBRESCRITO
        "flex flex-col h-full w-full",
        "bg-card",
        "border border-border",
        "rounded-[2.5rem]", // Arredondamento padrão
        "p-3.5", // Padding FIXO
        "shadow-sm",
        "overflow-hidden", // Evita conteúdo vazando
        "transition-all duration-300", // Transições padrão
        
        // APENAS ESTILOS ADICIONAIS podem ser passados via className
        className
      )}
      style={{
        // Estilos inline para garantir consistência
        boxSizing: 'border-box',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Componente CardContent para conteúdo interno padronizado
export function CardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "h-full w-full", // Ocupa 100% do Card
      "flex flex-col", // Layout vertical
      className
    )}>
      {children}
    </div>
  );
}