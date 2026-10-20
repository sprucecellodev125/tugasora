import { Pencil, Trash2, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import type { Task, TaskStatus } from '../types/task';
import {
  STATUS_LABELS,
  isOverdue,
  formatDueDate,
  formatRelative,
} from '../lib/taskUtils';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-amber-100 text-amber-800 ring-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 ring-sky-200',
  completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const overdue = isOverdue(task);

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 break-words">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-600 whitespace-pre-line break-words">
              {task.description}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 px-2 py-1 rounded-lg text-xs font-semibold ring-1 ${statusStyles[task.status]}`}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          {task.course}
        </span>
        <span
          className={`inline-flex items-center gap-1 ${
            overdue ? 'text-rose-600 font-medium' : ''
          }`}
        >
          {overdue ? (
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {formatDueDate(task.dueDate)} ({formatRelative(task.dueDate)})
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <label className="text-xs text-slate-500 flex items-center gap-2">
          <span>Status:</span>
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(task.id, e.target.value as TaskStatus)
            }
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={`Ubah status ${task.title}`}
          >
            <option value="todo">Belum Dikerjakan</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Hapus
          </button>
        </div>
      </div>
    </article>
  );
}