"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./search-bar";
import ServiceCard from "./service-card";
import ServiceCardImage from "./service-card-image";
import CategoryFilter from "./category-filter";
import ServiceSkeleton from "./service-skeleton";
// Use a lightweight client-side type for services to avoid importing server-only Prisma types
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
// import { Carousel } from "@/components/ui/carousel";

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

  const lastUpdateIds = React.useRef<string>("");
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const SERVICES_TO_SHOW_IN_CAROUSEL = 6;

  const carouselServices = React.useMemo(() => {
    if (services.length === 0) return [];
    return services.slice(0, SERVICES_TO_SHOW_IN_CAROUSEL);
  }, [services]);

  const hasEnoughServicesForCarousel = React.useMemo(() => {
    const isSearchActive = searchTerm !== "" || selectedCategory !== "Todas";
    // Detect mobile to relax the minimum required services for the carousel
    const isClient = typeof window !== "undefined";
    const isMobileView = isClient ? window.innerWidth < 768 : false;
    const threshold = isMobileView ? 1 : SERVICES_TO_SHOW_IN_CAROUSEL;

    return services.length >= threshold && !isSearchActive && !isSearching;
  }, [services.length, isSearching, searchTerm, selectedCategory]);

  React.useEffect(() => {
    const shuffled = shuffleArray(initialServices);
    setMasterOrder(shuffled);
    setServices(shuffled);

    const timer = setTimeout(() => {
      setIsInitialPageLoad(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [initialServices]);

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
          // Safely check for an AbortError without assuming the type of `err`
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

  return (
    <div className="w-full flex flex-col transition-colors duration-300">
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

      <div className="py-1 border-b border-border mb-0">
        <CategoryFilter
          categories={categories}
          activeCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <AnimatePresence>
        {hasEnoughServicesForCarousel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-0 mb-0 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Destaques</h2>
              <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                {carouselServices.length} serviços em destaque
              </span>
            </div>
            {/* <Carousel>
              {carouselServices.map((service) => (
                <ServiceCardImage
                  key={`carousel-${service.id}`}
                  service={service}
                />
              ))}
            </Carousel> */}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4 relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {isInitialPageLoad ? (
            Array.from({ length: 6 }).map((_, i) => (
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
              className="col-span-full text-center py-16 bg-card rounded-[2.5rem] border border-dashed border-border"
            >
              <div className="text-3xl mb-3 grayscale opacity-30">🔍</div>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em]">
                {searchError || "Nenhum resultado encontrado para sua busca"}
              </p>
            </motion.div>
          ) : (
            services.map((service) => (
              <motion.div
                key={service.id}
                layout="position"
                initial={{
                  opacity: 0,
                  scale: 1,
                  z: 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  z: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: -1,
                  transition: {
                    duration: 0.2,
                    ease: "easeIn",
                  },
                }}
                transition={{
                  type: "tween",
                  ease: "circOut",
                  duration: 0.35,
                  layout: {
                    duration: 0.35,
                    ease: "circOut",
                  },
                }}
                style={{
                  transformOrigin: "center center",
                  backfaceVisibility: "hidden",
                }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
