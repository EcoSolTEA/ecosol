"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, FileText, Sun, Moon } from "lucide-react";

export default function TermsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Previne erro de hidratação
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-500">
      
      {/* Botão de Tema Flutuante para manter o padrão */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 bg-card border border-border rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all text-primary z-50"
      >
        {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
      </button>

      <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center space-y-4 pt-10">
          <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-tight">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Compromisso Ético &bull; Rede Ecosol 2026
          </p>
        </div>

        {/* Corpo dos Termos */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10 text-sm leading-relaxed relative overflow-hidden">
          
          {/* Marca d'água sutil de engenharia */}
          <FileText className="absolute -bottom-10 -right-10 h-40 w-40 text-primary/5 -rotate-12" />

          <section className="space-y-4 relative">
            <h2 className="text-foreground font-black uppercase tracking-widest flex items-center gap-3 text-xs">
              <span className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" /> 
              1. Objetivo da Plataforma
            </h2>
            <p className="text-muted-foreground font-medium pl-4.5 border-l-2 border-border/50">
              A Ecosol é uma rede de economia solidária projetada por e para pessoas autistas. Ao utilizar este sistema, você concorda em colaborar para um ambiente de apoio mútuo, troca de serviços e crescimento coletivo.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-foreground font-black uppercase tracking-widest flex items-center gap-3 text-xs">
              <span className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" /> 
              2. Privacidade e LGPD
            </h2>
            <p className="text-muted-foreground font-medium pl-4.5 border-l-2 border-border/50">
              Seus dados de cadastro são processados exclusivamente para a logística interna da plataforma. Não compartilhamos informações sensíveis com terceiros sem consentimento explícito.
            </p>
          </section>

          <section className="space-y-4 relative">
            <h2 className="text-foreground font-black uppercase tracking-widest flex items-center gap-3 text-xs">
              <span className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_8_px_rgba(var(--primary),0.8)]" /> 
              3. Regras de Convivência
            </h2>
            <p className="text-muted-foreground font-medium pl-4.5 border-l-2 border-border/50">
              O capacitismo e qualquer forma de desrespeito são proibidos. A Ecosol reserva-se o direito de suspender acessos que comprometam a segurança emocional ou física dos membros da rede.
            </p>
          </section>

          <div className="pt-6 text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest text-center border-t border-border">
            Última atualização: 14 de Janeiro de 2026
          </div>
        </div>

        {/* Ação de Retorno */}
        <div className="flex justify-center pb-10">
          <Link href="/signup">
            <Button variant="ghost" className="gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:text-primary transition-all rounded-2xl px-8 h-12">
              <ArrowLeft size={14} /> Voltar para o Cadastro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}