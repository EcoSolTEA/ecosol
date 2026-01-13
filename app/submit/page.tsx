"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Globe, Instagram, MessageCircle } from "lucide-react";
import Swal from 'sweetalert2';

// Configuração do motor de Toasts (Notificações rápidas no canto)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export default function SubmitPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [form, setForm] = React.useState({
    name: "",
    category: "",
    description: "",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    site: "",
  });
  
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Máscara de Telefone otimizada
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, whatsapp: maskPhone(e.target.value) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB para performance
        Toast.fire({ icon: 'error', title: 'Arquivo muito grande', text: 'A imagem deve ter no máximo 2MB.' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserEmail(session.user.email || null);
    };
    getSession();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail) return;
    
    setIsSubmitting(true);

    // Feedback visual de "Processamento de Carga"
    Swal.fire({
      title: 'Enviando Dados...',
      text: 'Estamos processando sua submissão. Aguarde um momento.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'rounded-[2rem]' }
    });

    try {
      let imageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: imageUrl, email: userEmail }),
      });

      if (res.ok) {
        Swal.close();
        await Toast.fire({
          icon: 'success',
          title: 'Enviado para curadoria!',
          text: 'Seu negócio será analisado em breve.'
        });
        router.push("/");
      } else {
        throw new Error();
      }
    } catch (err) {
      setIsSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Falha no envio',
        text: 'Verifique sua conexão ou os dados preenchidos.',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header />
      <main className="mx-auto max-w-3xl p-6 py-12">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 mt-6 transition-all">
          <header className="mb-10 text-center sm:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Novo Negócio</h2>
            <p className="text-slate-500 font-medium mt-2">
              Divulgue seu trabalho para toda a rede <span className="text-blue-600 font-bold">Ecosol</span>.
            </p>
          </header>

          <form onSubmit={submit} className="space-y-8">
            {/* SEÇÃO DE IMAGEM */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Imagem de Identidade</label>
              <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />

              {!imagePreview ? (
                <label 
                  htmlFor="image-upload" 
                  className="group flex flex-col items-center justify-center w-full h-44 border-3 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-500"
                >
                  <UploadCloud className="w-10 h-10 text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" />
                  <p className="mt-4 text-sm text-slate-500 group-hover:text-blue-600 font-bold">Clique para carregar foto</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG ou GIF (Máx. 2MB)</p>
                </label>
              ) : (
                <div className="relative w-full h-56 rounded-3xl overflow-hidden border-4 border-white shadow-xl group">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <label htmlFor="image-upload" className="bg-white text-slate-900 font-black px-6 py-2 rounded-full text-xs uppercase cursor-pointer hover:bg-blue-50">Trocar</label>
                    <button type="button" onClick={removeImage} className="bg-red-500 text-white font-black px-6 py-2 rounded-full text-xs uppercase hover:bg-red-600">Remover</button>
                  </div>
                </div>
              )}
            </div>

            {/* INFO BÁSICA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Empreendimento</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-bold" placeholder="Como seu negócio é conhecido?" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white text-lg font-bold" placeholder="Ex: Alimentação, Artesanato..." />
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Conte sobre seu serviço</label>
              <textarea 
                className="w-full min-h-[160px] rounded-3xl border-0 bg-slate-50 p-6 text-base font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                required
                placeholder="Descreva o que você faz, seus valores e como as pessoas podem se beneficiar do seu trabalho."
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* CONTATOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  <MessageCircle className="w-3 h-3 text-green-500" /> WhatsApp
                </label>
                <Input placeholder="(00) 00000-0000" value={form.whatsapp} onChange={handlePhoneChange} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  <Instagram className="w-3 h-3 text-pink-500" /> Instagram
                </label>
                <Input placeholder="@seu.negocio" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">TikTok</label>
                <Input placeholder="@seu.tiktok" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  <Globe className="w-3 h-3 text-blue-500" /> Site Oficial
                </label>
                <Input placeholder="https://www.site.com.br" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" />
              </div>
            </div>

            {/* BOTÃO SUBMIT */}
            <Button 
              type="submit" 
              disabled={isSubmitting || !userEmail} 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-16 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Sincronizando Dados...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Finalizar Cadastro</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}