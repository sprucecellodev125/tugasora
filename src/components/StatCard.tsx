import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'default' | 'warning' | 'info' | 'success' | 'danger';
}

const toneClasses: Record<Props['tone'], string> = {
  default: 'bg-slate-50 text-slate-700 ring-slate-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function StatCard({ label, value, icon, tone }: Props) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">
          {label}
        </span>
        <span className="opacity-70">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}