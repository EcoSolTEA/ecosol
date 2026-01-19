"use client";

import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  mobile?: boolean;
  className?: string;
}

export default function LogoutButton({ mobile = false, className = "" }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  if (mobile) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`h-9 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted px-2.5 ${className}`}
        onClick={handleLogout}
        title="Encerrar Sessão"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted px-4 ${className}`}
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4" />
      <span>Encerrar Sessão</span>
    </Button>
  );
}