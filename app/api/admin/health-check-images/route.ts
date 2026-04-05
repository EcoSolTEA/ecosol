import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Verificar saúde das imagens no banco de dados
 * Identifica URLs que possam estar quebradas
 */
export async function GET(request: Request) {
  try {
    const services = await prisma.service.findMany({
      select: { id: true, name: true, image: true },
      where: { image: { not: null } },
    });

    const imageStats = {
      total: services.length,
      valid: 0,
      broken: 0,
      details: [] as any[],
    };

    for (const service of services) {
      if (!service.image || service.image.trim() === '') {
        imageStats.broken++;
        imageStats.details.push({
          id: service.id,
          name: service.name,
          issue: "Empty URL",
        });
      } else {
        imageStats.valid++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: imageStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao verificar imagens:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
