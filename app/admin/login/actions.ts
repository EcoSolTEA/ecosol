"use server";

import { cookies } from "next/headers";

export async function loginAction(password: string) {
  // Compara com a variável de ambiente que o Middleware também usa
  if (password === process.env.ADMIN_SECRET) {
    const cookieStore = await cookies();
    
    cookieStore.set("admin_token", password, {
      httpOnly: true, // Segurança: o JS do navegador não consegue ler
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return { success: true };
  }

  return { success: false, error: "Senha incorreta" };
}