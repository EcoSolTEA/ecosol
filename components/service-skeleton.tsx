// components/service-skeleton.tsx
"use client";

import { Card } from "./ui/card";

export default function ServiceSkeleton() {
  return (
    // Card puro, SEM classes adicionais - igual ao ServiceCard
    <Card>
      <div className="flex flex-col h-full">
        
        {/* Imagem skeleton - SEM Image component, apenas div */}
        <div className="relative aspect-video w-full rounded-[1.6rem] bg-muted overflow-hidden border border-border mb-2.5">
          <div className="absolute inset-0 bg-linear-to-r from-muted via-muted/60 to-muted animate-pulse" />
        </div>

        {/* Título e descrição skeleton */}
        <div className="flex-1 px-0.5 min-h-15">
          <div className="h-4 bg-muted rounded animate-pulse mb-1">
            <div className="h-full w-3/4 bg-muted-foreground/30 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded animate-pulse">
              <div className="h-full w-full bg-muted-foreground/20 rounded" />
            </div>
            <div className="h-2 bg-muted rounded animate-pulse">
              <div className="h-full w-2/3 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        </div>

        {/* Rodapé skeleton */}
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          
          {/* Linha Superior skeleton */}
          <div className="flex items-center justify-between">
            {/* Badge da Categoria */}
            <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] px-2 py-1 bg-primary/10 rounded-md inline-flex items-center">
              <div className="h-3 w-12 bg-primary/20 animate-pulse rounded" />
            </span>

            {/* Botão Perfil */}
            <div className="h-6 px-2 rounded-lg bg-muted animate-pulse flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="h-3 w-8 bg-primary/20 animate-pulse rounded" />
                {/* Ícone ArrowUpRight como placeholder */}
                <div className="ml-1 h-3 w-3 bg-primary/20 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Linha Inferior skeleton */}
          <div className="flex items-center">
            {/* Usando ContactIcons com skeleton mode */}
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-9 w-9 rounded-xl bg-muted border border-border animate-pulse flex items-center justify-center"
                >
                  <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}