import prisma from "@/lib/prisma";
import Header from "@/components/header";
import LiveSearchContainer from "@/components/live-search-container";
import Banner from "@/components/banner";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type ServiceItem = {
  id: string | number;
  name: string;
  category: string;
  description?: string | null;
  image?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  views?: number;
  email?: string | null;
  site?: string | null;
  approved?: boolean;
  suspended?: boolean;
};

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await searchParams;

  /**
   * OTIMIZAÇÃO: Remover groupBy lento
   * Agora fazemos apenas 2 queries em paralelo:
   * 1. Count total de serviços
   * 2. FindMany com 200 registros (aumentado) para melhor amostragem das categorias
   * As categorias são extraídas dos dados já retornados
   */
  
  const [total, initialServices] = await Promise.all([
    // Total de registros
    prisma.service.count({
      where: { approved: true, suspended: false, deletedAt: null }
    }),

    /**
     * 2. BUSCA OTIMIZADA (Sem RANDOM() e sem groupBy)
     * Retorna top 200 mais recentes (mais amostragem para categorias)
     * Cliente embaralha, e extraímos categorias dos dados
     */
    prisma.service.findMany({
      where: { approved: true, suspended: false, deletedAt: null },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        image: true,
        whatsapp: true,
        instagram: true,
        tiktok: true,
        email: true,
        site: true,
        views: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200, // Aumentado para melhor coverage de categorias
    })
  ]);


  /**
   * 3. EMBARALHAMENTO NO CLIENTE (Rápido)
   * Função de Fisher-Yates para embaralhar array
   */
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const shuffledServices = shuffleArray(initialServices) as ServiceItem[];

  /**
   * 4. CONTAR CATEGORIAS DOS DADOS RETORNADOS
   * Sem precisar de groupBy separado - extraímos do array já carregado
   */
  const categoryMap = new Map<string, number>();
  for (const service of initialServices) {
    const cat = service.category || 'Sem Categoria';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const categoriesWithCounts = [
    { name: "Todas", count: total },
    ...Array.from(categoryMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }))
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-10 transition-colors duration-300">
      <Header />
      <Banner />
      
      <main className="mx-auto max-w-6xl px-6 py-4">
        {/* Passamos os serviços já embaralhados pelo servidor.
          Cada refresh resultará em uma ordem e seleção única.
        */}
        <LiveSearchContainer 
          initialServices={shuffledServices as any}
          categories={categoriesWithCounts} 
        />
      </main>
    </div>
  );
}