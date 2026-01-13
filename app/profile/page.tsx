import prisma from "@/lib/prisma";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr';
import NotificationActions from "@/components/notification-actions";
import { UserCircle, Settings, Bell, Eye, MessageSquare } from "lucide-react";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { notifications: { orderBy: { createdAt: 'desc' }, take: 5 } }
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        role: "USER"
      },
      include: { notifications: true }
    });
  }

  const [service, unreadCount, totalCount] = await Promise.all([
    prisma.service.findFirst({ where: { email: user.email! } }),
    prisma.notification.count({ where: { userId: dbUser.id, read: false } }),
    prisma.notification.count({ where: { userId: dbUser.id } })
  ]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="mx-auto max-w-5xl p-6 py-12">
        
        {/* HEADER DO PERFIL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <UserCircle className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Meu Perfil</h1>
              <p className="text-slate-500 font-medium italic">{user.email}</p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button className="bg-white hover:bg-slate-50 text-slate-900 border-none shadow-lg rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest gap-2">
              <Settings className="w-4 h-4" /> Configurações
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* INFO CARD */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Nome cadastrado</label>
                <p className="text-xl font-black text-slate-800 tracking-tight">{dbUser.name || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Contato WhatsApp</label>
                <p className="text-xl font-black text-slate-800 tracking-tight">{dbUser.phone || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* VISUALIZAÇÕES CARD */}
          <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Eye className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-6xl font-black text-white tracking-tighter">{service?.views || 0}</h3>
            <p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Visitas no seu Card</p>
          </div>
        </div>

        {/* NOTIFICAÇÕES */}
        <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Notificações</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Atividade da sua conta</p>
              </div>
            </div>
            <NotificationActions email={user.email!} unreadCount={unreadCount} totalCount={totalCount} />
          </div>
          
          <div className="p-4 sm:p-8 space-y-4">
            {dbUser.notifications.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              dbUser.notifications.map((n) => (
                <div key={n.id} className={`group p-5 rounded-3xl border transition-all duration-300 ${n.read ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                  <div className="flex justify-between items-start gap-6">
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500 font-medium' : 'text-slate-900 font-black'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap pt-1">
                      {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}