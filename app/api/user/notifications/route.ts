import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`notif-get-${ip}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!userRecord) return NextResponse.json([]);

    const notifications = await prisma.notification.findMany({
      where: { userId: userRecord.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erro API Notifications GET:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`notif-patch-${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { ids, all } = await request.json();

    // Validação de inputs
    if (all !== undefined && typeof all !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (ids !== undefined && (!Array.isArray(ids) || !ids.every(id => typeof id === 'string' || typeof id === 'number'))) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const whereClause = all ? { userId: userRecord.id, read: false } : { id: { in: ids }, userId: userRecord.id };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro API Notifications PATCH:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(`notif-delete-${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { ids, all } = await request.json();

    // Validação de inputs
    if (all !== undefined && typeof all !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (ids !== undefined && (!Array.isArray(ids) || !ids.every(id => typeof id === 'string' || typeof id === 'number'))) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const whereClause = all ? { userId: userRecord.id } : { id: { in: ids }, userId: userRecord.id };

    await prisma.notification.deleteMany({ where: whereClause });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro API Notifications DELETE:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}