import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  showClass: { popup: 'animate__animated animate__fadeInRight animate__faster' },
  hideClass: { popup: 'animate__animated animate__fadeOutRight animate__faster' },
  customClass: {
    popup: `
      !w-fit !max-w-[300px] !min-h-0
      !mt-[85px] !mr-4 !ml-4
      !overflow-visible
      rounded-xl px-4 py-2.5
      !border !border-primary/50 
      shadow-[0_0_15px_hsl(var(--primary)/0.4),inset_0_0_8px_hsl(var(--primary)/0.1)]
      !flex !items-center !gap-3
    `,
    icon: '!text-[10px] !m-0 !scale-75 !flex',
    title: '!text-[11px] font-bold uppercase tracking-[0.12em] leading-none !m-0 !p-0',
    timerProgressBar: '!bg-primary/50',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

/**
 * Gestor de Feedback
 */
export const notify = {
  success: (message: string) => {
    Swal.close();
    Toast.fire({ 
      icon: 'success', 
      title: message,
      iconColor: 'hsl(var(--primary))' 
    });
  },
  error: (message: string = 'Erro na operação') => {
    Swal.close();
    Toast.fire({ 
      icon: 'error', 
      title: message,
      iconColor: '#ef4444' 
    });
  },
  auto: (success: boolean, successMsg: string, errorMsg?: string) => {
    if (success) {
      notify.success(successMsg);
    } else {
      notify.error(errorMsg || 'Falha ao processar');
    }
  }
};