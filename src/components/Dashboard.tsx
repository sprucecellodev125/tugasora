import {
  ListChecks,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from 'lucide-react';
import type { Task } from '../types/task';
import {
  isOverdue,
  formatDueDate,
  formatRelative,
  sortByDueDate,
} from '../lib/taskUtils';
import { StatCard } from './StatCard';

interface Props {
  tasks: Task[];
}

export function Dashboard({ tasks }: Props) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter(isOverdue).length;

  const upcoming = sortByDueDate(
    tasks.filter(
      (t) =>
        t.status !== 'completed' &&
        new Date(t.dueDate).getTime() >= Date.now(),
    ),
  ).slice(0, 3);

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total" value={total} icon={<ListChecks className="w-4 h-4" />} tone="default" />
        <StatCard label="Belum" value={todo} icon={<Clock className="w-4 h-4" />} tone="warning" />
        <StatCard label="Proses" value={inProgress} icon={<Loader2 className="w-4 h-4" />} tone="info" />
        <StatCard label="Selesai" value={completed} icon={<CheckCircle2 className="w-4 h-4" />} tone="success" />
        <StatCard label="Terlambat" value={overdue} icon={<AlertTriangle className="w-4 h-4" />} tone="danger" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <h2 id="dashboard-heading" className="text-sm font-semibold text-slate-800">
            Tenggat Terdekat
          </h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">
            Tidak ada tugas mendatang. Semua tampak terkendali.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.course}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-600">{formatDueDate(t.dueDate)}</p>
                  <p className="text-xs text-indigo-600">{formatRelative(t.dueDate)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}