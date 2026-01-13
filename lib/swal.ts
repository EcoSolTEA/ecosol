import Swal from 'sweetalert2';

/**
 * 1. BASE DE ESTILO (Botões Estáticos e Equilibrados)
 */
const buttonBase = `
  h-12 px-8 rounded-xl 
  text-[10px] font-black uppercase tracking-widest 
  transition-all duration-200 border-none outline-none 
  flex items-center justify-center
`;

export const confirmButtonClasses = `
  ${buttonBase}
  bg-primary text-primary-foreground 
  shadow-md shadow-primary/20 
  hover:brightness-110 active:opacity-90
`;

export const cancelButtonClasses = `
  ${buttonBase}
  !text-red-800 !bg-red-50 
  hover:!bg-red-100 
  active:opacity-90 ml-3
`;

/**
 * 2. CONFIGURAÇÃO MESTRA (Agora com borda idêntica ao Toast)
 */
export const swalConfig = {
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  backdrop: `rgba(0,0,0,0.6)`,
  buttonsStyling: false,
  showClass: { popup: 'animate__animated animate__fadeInDown animate__faster' },
  hideClass: { popup: 'animate__animated animate__fadeOutUp animate__faster' },
  customClass: {
    // Atualizado para !border-primary/50 para suavidade e consistência
    popup: 'rounded-[2.5rem] p-8 bg-card text-foreground !border !border-primary/50 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]',
    confirmButton: confirmButtonClasses,
    cancelButton: cancelButtonClasses,
    title: 'text-2xl font-black uppercase tracking-tight', 
    htmlContainer: 'text-sm text-muted-foreground font-medium mt-2',
    actions: 'flex items-center justify-center mt-8 gap-0',
  },
};

/**
 * 3. HELPER PARA AÇÕES DESTRUTIVAS
 */
export const confirmDestructiveAction = (title: string, text: string) => {
  return Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    customClass: {
      ...swalConfig.customClass,
      confirmButton: confirmButtonClasses.replace('bg-primary', 'bg-destructive'),
    }
  });
};