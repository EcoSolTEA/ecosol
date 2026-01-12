"use client";
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Cadastro no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/login`,
          // Opcional: Adicionar metadados se necessário
          data: { display_name: email.split('@')[0] } 
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setLoading(false);
        return;
      }

      // Se o usuário foi criado, o Supabase já disparou o e-mail internamente.
      if (data.user) {
        // 2. Sincronização em "Background" com o Prisma
        // Não bloqueamos o feedback do usuário se a sincronização demorar um pouco
        fetch("/api/user/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email }),
        }).catch(err => console.error("Erro na sincronização Prisma:", err));

        // 3. Reporte Imediato ao Usuário
        setMessage({ 
          type: 'success', 
          text: "Cadastro realizado com sucesso! Um link de confirmação foi enviado para o seu e-mail. Por favor, verifique sua caixa de entrada (e o spam)." 
        });

        // Limpa os campos para evitar cliques duplos
        setEmail("");
        setPassword("");
        
        // Opcional: Redirecionar após um tempo maior para o usuário ler a mensagem
        // setTimeout(() => router.push("/login"), 6000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Ocorreu um erro inesperado no processamento." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ecosol Solidário</h1>
          <p className="text-slate-500 text-sm mt-2">Crie sua conta na maior rede autista.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in duration-300 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <Input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all" 
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Já possui acesso?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}