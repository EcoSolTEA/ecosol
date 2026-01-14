"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2, 
  Sun, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false); // Flag de Consentimento
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  
  const { theme, setTheme } = useTheme();

  // Previne erro de hidratação no seletor de tema
  React.useEffect(() => setMounted(true), []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // 1. Validação de Engenharia (Compliance)
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: "Você precisa aceitar os termos de uso para continuar." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      /**
       * 2. Cadastro no Supabase Auth
       * Incluímos o consentimento nos metadados para registro jurídico (LGPD)
       */
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/login`,
          data: { 
            display_name: email.split('@')[0],
            accepted_terms: true,
            accepted_at: new Date().toISOString()
          } 
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        // 3. Sincronização em Background com o Prisma
        fetch("/api/user/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email }),
        }).catch(err => console.error("Erro na sincronização Prisma:", err));

        // 4. Reporte Imediato ao Usuário
        setMessage({ 
          type: 'success', 
          text: "Sucesso! Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada e o spam." 
        });

        setEmail("");
        setPassword("");
        setAcceptedTerms(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Erro inesperado no processamento da carga." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-500">
      
      {/* Botão de Tema Flutuante */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 bg-card border border-border rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all text-primary"
      >
        {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
      </button>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-border">
          
          {/* Cabeçalho de Identidade */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/10 rounded-3xl mb-5 text-primary">
               <UserPlus size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
              Criar Conta
            </h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              Junte-se à Rede Ecosol
            </p>
          </div>

          {/* Mensagens de Feedback Semântico */}
          {message && (
            <div className={`mb-8 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border flex items-center gap-3 animate-in slide-in-from-top-2 ${
              message.type === 'success' 
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="leading-tight">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">E-mail Corporativo ou Pessoal</label>
              <div className="relative">
                <Input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-border focus:bg-background font-bold transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Senha (Mín. 6 dígitos)</label>
              <div className="relative">
                <Input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-border focus:bg-background font-bold transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
              </div>
            </div>

            {/* CHECKBOX DE TERMOS - DESIGN PREMIUM */}
            <div 
              className="flex items-start gap-3 px-1 py-2 group cursor-pointer"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            >
              <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-lg border-2 transition-all flex items-center justify-center ${
                acceptedTerms 
                  ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' 
                  : 'border-border bg-muted/30 hover:border-primary/50'
              }`}>
                {acceptedTerms && <CheckCircle2 size={14} className="text-primary-foreground stroke-[3px]" />}
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground font-bold uppercase tracking-wider select-none">
                Eu li e aceito os <Link href="/terms" className="text-primary font-black hover:underline underline-offset-4 decoration-2">termos de uso</Link> e a política de privacidade da rede.
              </p>
            </div>

            <Button 
              type="submit" 
              className={`w-full h-16 rounded-4xl font-black text-lg shadow-lg transition-all active:scale-[0.98] gap-3 ${
                acceptedTerms 
                  ? 'shadow-primary/20' 
                  : 'opacity-50 grayscale cursor-not-allowed'
              }`} 
              disabled={loading || !acceptedTerms}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
              {loading ? "Processando..." : "Finalizar Cadastro"}
            </Button>
          </form>

          <div className="mt-10 text-center border-t border-border pt-8">
            <p className="text-xs text-muted-foreground font-medium">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-primary font-black hover:underline underline-offset-4 flex items-center justify-center gap-1 mt-2 uppercase tracking-widest text-[10px]">
                <ArrowLeft size={12} /> Acessar Login
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer de Engenharia */}
        <p className="text-center mt-8 text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
          Processamento de Dados Protegido &bull; Ecosol 2026
        </p>
      </div>
    </div>
  );
}