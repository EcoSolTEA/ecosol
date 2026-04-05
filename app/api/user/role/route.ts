import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`role-${ip}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validar autenticação (não mais aceitar email como param)
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    // Buscar role do usuário autenticado
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { role: true }
    });

    // Se não existe, cria com role padrão (only for authenticated users)
    if (!userRecord) {
      const email = user.email || '';
      const newUser = await prisma.user.create({
        data: {
          email,
          name: user.user_metadata?.name || email.split('@')[0],
          role: "USER"
        },
        select: { role: true }
      });
      return NextResponse.json({ role: newUser.role });
    }

    return NextResponse.json({ role: userRecord.role });
  } catch (error) {
    console.error("Erro na API de Role:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}