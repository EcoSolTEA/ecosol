// components/ui/pagination.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isSearching?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isSearching = false,
  className,
}: PaginationProps) {
  // Se não há páginas, não renderizar
  if (totalPages <= 1) return null;

  // Cálculos
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Funções de navegação
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || isSearching) return;
    onPageChange(page);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Gerar array de páginas para exibição
  const getPageNumbers = () => {
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half + 1) {
      start = 1;
      end = maxVisible;
    } else if (currentPage >= totalPages - half) {
      start = totalPages - maxVisible + 1;
      end = totalPages;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("w-full", className)}>
      {/* Controles Mobile - Fixed e refinado */}
      <div className="sm:hidden">
      <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pointer-events-none">
          <div className="max-w-md mx-auto">
          <div className="bg-card/90 backdrop-blur-md border border-border/40 rounded-xl p-2 shadow-lg pointer-events-auto">
              {/* Controles compactos - apenas ícones e indicador */}
              <div className="flex items-center justify-between gap-1">
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || isSearching}
                  className="h-8 w-8 rounded-lg p-0 flex-shrink-0 hover:bg-primary/10"
                  title="Primeira página"
              >
                  <ChevronFirst className="h-3.5 w-3.5" />
              </Button>
                
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || isSearching}
                  className="h-8 w-8 rounded-lg p-0 flex-shrink-0 hover:bg-primary/10"
                  title="Página anterior"
              >
                  <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
                
              {/* Indicador central compacto */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                  <button
                  onClick={() => {
                      if (isSearching) return;
                      const page = prompt(`Página (1-${totalPages}):`, currentPage.toString());
                      if (page) {
                      const pageNum = parseInt(page);
                      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                          goToPage(pageNum);
                      }
                      }
                  }}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors min-w-0"
                  >
                  <span className="text-sm font-bold text-primary truncate">
                      Pág. {currentPage}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                      / {totalPages}
                  </span>
                  </button>
              </div>
                
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || isSearching}
                  className="h-8 w-8 rounded-lg p-0 flex-shrink-0 hover:bg-primary/10"
                  title="Próxima página"
              >
                  <ChevronRight className="h-3.5 w-3.5" />
              </Button>
                
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || isSearching}
                  className="h-8 w-8 rounded-lg p-0 flex-shrink-0 hover:bg-primary/10"
                  title="Última página"
              >
                  <ChevronLast className="h-3.5 w-3.5" />
              </Button>
              </div>

              {/* Barra de progresso muito fina */}
              <div className="w-full bg-muted/20 h-0.5 rounded-full overflow-hidden mt-2">
              <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
              </div>

              {/* Contador de itens - bem discreto */}
              <div className="text-[10px] text-muted-foreground text-center mt-1 truncate">
              {startIndex}-{endIndex} de {totalItems} itens
              </div>
          </div>
          </div>
      </div>
      </div>

      {/* Controles Desktop - Completo */}
      <div className="hidden sm:block">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Informações */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{startIndex}-{endIndex}</span> de{" "}
            <span className="font-medium text-foreground">{totalItems}</span> itens
          </div>
          
          {/* Navegação */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1 || isSearching}
                className="h-10 w-10 rounded-xl"
                title="Primeira página"
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1 || isSearching}
                className="h-10 w-10 rounded-xl"
                title="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Números das páginas */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => (
                <React.Fragment key={page}>
                  {/* Mostrar "..." se houver lacuna */}
                  {index > 0 && pageNumbers[index - 1] !== page - 1 && (
                    <span className="h-10 w-10 flex items-center justify-center text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  )}
                  
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    disabled={isSearching}
                    className={cn(
                      "h-10 w-10 rounded-xl font-medium transition-all duration-200",
                      currentPage === page && "shadow-md"
                    )}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || isSearching}
                className="h-10 w-10 rounded-xl"
                title="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages || isSearching}
                className="h-10 w-10 rounded-xl"
                title="Última página"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Informação da página atual */}
          <div className="text-sm text-muted-foreground">
            Página{" "}
            <span className="font-medium text-foreground">{currentPage}</span> de{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}