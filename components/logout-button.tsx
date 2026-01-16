"use client";

import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";

export default function LogoutButton({ className }: { className?: string }) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  return (
    <Button
      variant="outline"
      className={
        "rounded-2xl border-border bg-card px-4 h-12 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm hover:bg-muted " +
        (className ?? "")
      }
      onClick={handleLogout}
    >
      Encerrar Sessão
    </Button>
  );
}
