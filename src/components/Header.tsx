import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white">
          <GraduationCap className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Tugasora</h1>
          <p className="text-xs text-slate-500 truncate">
            Plan Your Tasks, Own Your Time.
          </p>
        </div>
      </div>
    </header>
  );
}