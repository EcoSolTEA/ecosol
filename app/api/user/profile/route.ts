import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`profile-get-${ip}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validar autenticação
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    // Buscar perfil do usuário autenticado
    const userProfile = await prisma.user.findUnique({
      where: { email: user.email },
      select: { name: true, phone: true, bio: true }
    });

    return NextResponse.json(userProfile || { name: "", phone: "", bio: "" });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`profile-patch-${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validar autenticação
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const body = await request.json();
    const { name, phone, bio } = body;

    // Validações básicas
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (phone && typeof phone !== 'string') {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }
    if (bio && typeof bio !== 'string') {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 });
    }

    // Limitar tamanhos
    if (name && name.length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    }
    if (phone && phone.length > 20) {
      return NextResponse.json({ error: 'Phone too long' }, { status: 400 });
    }
    if (bio && bio.length > 500) {
      return NextResponse.json({ error: 'Bio too long' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
      select: { name: true, phone: true, bio: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}