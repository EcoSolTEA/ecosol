import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          /* No layout apenas lemos */
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Camada de segurança 2: Bloqueio no Servidor
  if (!user) redirect("/login");

  // Verificação de Role via Banco (Redundância de segurança)
  // API agora usa autenticação via JWT do Supabase
  try {
    const roleRes = await fetch(
      (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "") + "/api/user/role",
      {
        headers: {
          // Pass auth cookies to API
          cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
        }
      }
    );
    
    if (!roleRes.ok) {
      redirect("/login");
    }
    
    const { role } = await roleRes.json();

    if (role !== "ADMIN") {
      redirect("/profile");
    }
  } catch (err) {
    console.error("Admin layout error:", err);
    redirect("/login");
  }

  return <>{children}</>;
}
