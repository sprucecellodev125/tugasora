import { Search } from 'lucide-react';
import type { TaskFilter } from '../types/task';

interface Props {
  filter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  counts: Record<TaskFilter, number>;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'Belum' },
  { value: 'in_progress', label: 'Proses' },
  { value: 'completed', label: 'Selesai' },
  { value: 'overdue', label: 'Terlambat' },
];

export function TaskFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul atau mata kuliah..."
          aria-label="Cari tugas"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="-mx-1 overflow-x-auto">
        <div className="flex gap-2 px-1 min-w-max">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => onFilterChange(f.value)}
                aria-pressed={active}
                className={`px-3 py-2 rounded-xl text-sm font-medium ring-1 transition ${
                  active
                    ? 'bg-indigo-600 text-white ring-indigo-600'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
                <span
                  className={`ml-2 text-xs ${
                    active ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}