import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  kind: 'success' | 'error';
  text: string;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = toast.kind === 'success' ? CheckCircle2 : AlertCircle;
  const cls =
    toast.kind === 'success'
      ? 'bg-emerald-600 text-white'
      : 'bg-rose-600 text-white';

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg ${cls}`}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <p className="text-sm flex-1 break-words">{toast.text}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className="p-1 rounded hover:bg-white/20"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}