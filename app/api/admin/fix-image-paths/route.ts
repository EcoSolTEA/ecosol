import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Admin-only endpoint para corrigir URLs de imagens quebradas
 * Substitui /logos/logos/ por /logos/ em todos os registros
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticação admin (simplificado para dev)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.includes("Bearer admin")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Contar quantos registros têm paths quebrados antes da correção
    const brokenServices = await prisma.service.findMany({
      where: {
        image: {
          contains: "/logos/logos/",
        },
      },
      select: { id: true, name: true, image: true },
    });

    const totalBroken = brokenServices.length;

    if (totalBroken === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhuma imagem com path duplicado encontrada",
        fixed: 0,
      });
    }

    // Atualizar cada registro manualmente (Prisma não suporta REPLACE direto)
    const updatePromises = brokenServices.map((service) =>
      prisma.service.update({
        where: { id: service.id },
        data: {
          image: service.image?.replace(/\/logos\/logos\//g, "/logos/") || null,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `${totalBroken} imagens corrigidas com sucesso`,
      fixed: totalBroken,
      details: brokenServices.map((s) => ({
        id: s.id,
        name: s.name,
        oldImage: s.image,
        newImage: s.image?.replace(/\/logos\/logos\//g, "/logos/"),
      })),
    });
  } catch (error) {
    console.error("Erro ao corrigir paths de imagem:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
