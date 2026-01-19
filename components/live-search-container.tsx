// components/live-search-container.tsx (versão simplificada)
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./search-bar";
import ServiceCard from "./service-card";
import CategoryFilter from "./category-filter";
import ServiceSkeleton from "./service-skeleton";
import { Pagination } from "./ui/pagination";

type ServiceItem = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  image?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  views?: number;
  email?: string | null;
  approved?: boolean;
  suspended?: boolean;
  [key: string]: unknown;
};

interface CategoryData {
  name: string;
  count: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function LiveSearchContainer({
  initialServices,
  categories,
}: {
  initialServices: ServiceItem[];
  categories: CategoryData[];
}) {
  const [masterOrder, setMasterOrder] = React.useState<ServiceItem[]>([]);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todas");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isInitialPageLoad, setIsInitialPageLoad] = React.useState(true);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(5);

  const lastUpdateIds = React.useRef<string>("");
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Calcular itens por página responsivamente
  React.useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(5);
      } else if (width < 1024) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(12);
      }
      setCurrentPage(1); // Resetar para primeira página ao redimensionar
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Inicialização
  React.useEffect(() => {
    const shuffled = shuffleArray(initialServices);
    setMasterOrder(shuffled);
    setServices(shuffled);

    const timer = setTimeout(() => {
      setIsInitialPageLoad(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [initialServices]);

  // Resetar página quando busca/filtro mudar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Busca e filtragem (mantido igual)
  React.useEffect(() => {
    const performUpdate = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      const normalizedSearch = searchTerm.toLowerCase().trim();

      const localFiltered = masterOrder.filter((service) => {
        const matchesCategory =
          selectedCategory === "Todas" || service.category === selectedCategory;
        const matchesSearch =
          !normalizedSearch ||
          service.name.toLowerCase().includes(normalizedSearch) ||
          service.category.toLowerCase().includes(normalizedSearch) ||
          (service.description &&
            service.description.toLowerCase().includes(normalizedSearch));

        return matchesCategory && matchesSearch;
      });

      const currentIds = localFiltered
        .map((s) => s.id)
        .sort()
        .join(",");

      if (currentIds !== lastUpdateIds.current) {
        setServices(localFiltered);
        lastUpdateIds.current = currentIds;
      }

      const needsRemoteSync = searchTerm !== "" || selectedCategory !== "Todas";

      if (needsRemoteSync) {
        setIsSearching(true);
        setSearchError(null);

        try {
          const queryParams = new URLSearchParams({
            q: searchTerm,
            category: selectedCategory,
          });

          const response = await fetch(
            `/api/search?${queryParams.toString()}`,
            {
              signal: newAbortController.signal,
            }
          );

          if (!response.ok) {
            throw new Error("Falha na resposta do servidor");
          }

          const serverData: ServiceItem[] = await response.json();

          const sortedServerData = [...serverData].sort((a, b) => {
            const indexA = masterOrder.findIndex((m) => m.id === a.id);
            const indexB = masterOrder.findIndex((m) => m.id === b.id);

            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
          });

          const serverIds = sortedServerData
            .map((s) => s.id)
            .sort()
            .join(",");

          if (serverIds !== lastUpdateIds.current) {
            setServices(sortedServerData);
            lastUpdateIds.current = serverIds;
          }
        } catch (err: unknown) {
          const name =
            typeof err === "object" && err !== null && "name" in err
              ? (err as { name?: unknown }).name
              : undefined;
          const isAbort = typeof name === "string" && name === "AbortError";
          if (!isAbort) {
            console.error("Erro na busca remota:", err);
            setSearchError("Não foi possível sincronizar os dados.");
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        const masterIds = masterOrder
          .map((s) => s.id)
          .sort()
          .join(",");
        if (lastUpdateIds.current !== masterIds) {
          setServices(masterOrder);
          lastUpdateIds.current = masterIds;
        }
      }
    };

    const debounceTime = searchTerm ? 400 : 0;
    const timeoutId = setTimeout(performUpdate, debounceTime);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, selectedCategory, masterOrder]);

  // Cálculos finais
  const totalItems = services.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedServices = services.slice(startIndex, endIndex);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="w-full flex flex-col transition-colors duration-300">
      {/* Header */}
      <section className="flex flex-col items-center py-2 gap-3">
        <div className="text-center space-y-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tighter uppercase leading-none">
            Economia Solidária
            <p className="text-primary text-xl"> Entre Autistas</p>
          </h1>
        </div>
        <div className="w-full max-w-md">
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </section>

      {/* Filtro de categorias */}
      <div className="py-1 border-b border-border mb-0">
        <CategoryFilter
          categories={categories}
          activeCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Contador de resultados
      {!isInitialPageLoad && (
        <div className="flex items-center justify-between py-4 px-2">
          <div className="text-sm text-muted-foreground">
            {totalItems} resultado{totalItems !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
            {selectedCategory !== "Todas" && ` em "${selectedCategory}"`}
          </div>
        </div>
      )} */}

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-2 mb-8 min-h-[400px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {isInitialPageLoad ? (
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ServiceSkeleton />
              </motion.div>
            ))
          ) : services.length === 0 && !isSearching ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -20 }}
              className="col-span-full text-center py-16 bg-card rounded-2xl md:rounded-[2.5rem] border border-dashed border-border"
            >
              <div className="text-3xl mb-3 grayscale opacity-30">🔍</div>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em]">
                {searchError || "Nenhum resultado encontrado para sua busca"}
              </p>
            </motion.div>
          ) : (
            paginatedServices.map((service) => (
              <motion.div
                key={service.id}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Paginação - agora com espaço extra no fundo para mobile */}
      {totalPages > 1 && (
        <>
          <div className="h-16 sm:h-8" /> {/* Espaço para o sticky mobile */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            isSearching={isSearching}
          />
        </>
      )}
    </div>
  );
}