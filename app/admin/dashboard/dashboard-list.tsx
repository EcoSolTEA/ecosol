"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceCard from "@/components/service-card";
import { approveServicesBatchAction, removeServicesBatchAction } from "@/app/provider/actions";
import { CheckCircle2, Trash2, Check, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

// Importação da Central de Estilo e Notificações
import { swalConfig } from "@/lib/swal";
import { notify } from "@/lib/toast";

interface DashboardListProps {
  initialItems: any[];
  onRefresh: () => Promise<void> | void;
  isAdmin?: boolean; 
}

export default function DashboardList({ initialItems, onRefresh, isAdmin = false }: DashboardListProps) {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleSelect = (id: number) => {
    if (isProcessing || !isAdmin) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (isProcessing || !isAdmin) return;
    setSelectedIds(selectedIds.length === initialItems.length ? [] : initialItems.map(p => p.id));
  };

  const handleBatchAction = async (type: "approve" | "remove", targetIds?: number[]) => {
    if (!isAdmin) return;
    const idsToProcess = targetIds || selectedIds;
    const isApprove = type === "approve";
    const count = idsToProcess.length;

    if (count === 0) return;
    
    const result = await Swal.fire({
      ...swalConfig,
      title: isApprove ? 'Aprovar Cadastros?' : 'Recusar Itens?',
      text: `Deseja processar ${count} ${count > 1 ? 'solicitações' : 'solicitação'} agora?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Sim, Aprovar' : 'Sim, Recusar',
      customClass: {
        ...swalConfig.customClass,
        confirmButton: isApprove 
          ? swalConfig.customClass.confirmButton 
          : swalConfig.customClass.confirmButton.replace('bg-primary', 'bg-destructive').replace('shadow-primary/30', 'shadow-destructive/30')
      }
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      
      Swal.fire({
        ...swalConfig,
        title: 'Sincronizando...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false,
      });

      try {
        const res = isApprove 
          ? await approveServicesBatchAction(idsToProcess) 
          : await removeServicesBatchAction(idsToProcess);
        
        notify.auto(res.success, isApprove ? 'Aprovado com sucesso!' : 'Removido com sucesso!');
        
        if (res.success) {
          await onRefresh(); 
          setSelectedIds([]);
        }
      } catch (error) {
        notify.error("Erro na operação de lote");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={cn("space-y-8 transition-all duration-500 pb-20", isProcessing && "opacity-60 pointer-events-none")}>
      
      {isAdmin && initialItems.length > 0 && (
        <div className="flex items-center justify-between px-8 py-5 bg-card border border-border rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <Checkbox 
              checked={selectedIds.length === initialItems.length && initialItems.length > 0}
              onCheckedChange={toggleSelectAll}
              disabled={isProcessing}
              className="h-6 w-6 rounded-lg border-2"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Logística de Curadoria</span>
              <span className="text-sm font-bold text-foreground">
                {selectedIds.length} de {initialItems.length} selecionados
              </span>
            </div>
          </div>
          {selectedIds.length > 0 && !isProcessing && (
            <Button variant="ghost" onClick={() => setSelectedIds([])} className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all">
              Desmarcar Tudo
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialItems.map((p) => (
          <div key={p.id} onClick={() => toggleSelect(p.id)} className="group relative">
            <Card 
              className={cn(
                "relative transition-all duration-500 rounded-[2.5rem] p-6 border-2 h-full flex flex-col",
                isAdmin && "cursor-pointer",
                selectedIds.includes(p.id) 
                  ? 'border-primary bg-primary/5 shadow-2xl scale-[0.98]' 
                  : 'border-transparent bg-card shadow-sm hover:border-border hover:shadow-xl'
              )}
            >
              <div className="space-y-4 flex-1 flex flex-col">
                <ServiceCard service={p} />
                
                {isAdmin && (
                  <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleBatchAction("approve", [p.id]); 
                      }}
                      variant="ghost"
                      className="flex-1 h-10 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 font-black gap-2 rounded-2xl transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Aprovar
                    </Button>
                    
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleBatchAction("remove", [p.id]); 
                      }}
                      variant="ghost"
                      className="h-10 px-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {selectedIds.includes(p.id) && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-4 ring-background animate-in zoom-in">
                  <Check className="h-4 w-4 stroke-[4px]" />
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {initialItems.length === 0 && (
        <div className="py-32 text-center bg-card rounded-[3rem] border-2 border-dashed border-border">
          <Inbox className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">Tudo em ordem</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Nenhum cadastro pendente</p>
        </div>
      )}

      {/* DOCK RESPONSIVO - APENAS CLASSES DE TELA ADICIONADAS */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 sm:gap-8 bg-background border-2 border-primary px-4 sm:px-8 py-3 sm:py-5 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-10 duration-500 w-[92%] sm:w-auto">
          <div className="flex items-center gap-3 sm:gap-4 pr-4 sm:pr-8 border-r border-border">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg rotate-3 shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : selectedIds.length}
            </div>
            <div className="hidden xs:block sm:block">
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Lote</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {isProcessing ? "Sinc..." : "Selecionados"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-1 sm:flex-none gap-2 sm:gap-4">
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("approve")} 
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3 h-10 sm:h-12 px-4 sm:px-8 text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" /> <span className="hidden sm:inline">Aprovar</span>
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("remove")} 
              variant="ghost"
              className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3 h-10 sm:h-12 px-4 sm:px-6 text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Recusar</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}