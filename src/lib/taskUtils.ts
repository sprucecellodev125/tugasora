import type { Task, TaskStatus } from '../types/task';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Belum Dikerjakan',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
};

export const DEFAULT_COURSES = [
  'Pemrograman Web',
  'Basis Data',
  'Kecerdasan Buatan',
  'Rekayasa Perangkat Lunak',
];

export function isOverdue(task: Task): boolean {
  if (task.status === 'completed') return false;
  const t = new Date(task.dueDate).getTime();
  return !isNaN(t) && t < Date.now();
}

export function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Tanggal tidak valid';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let text: string;
  if (days > 0) text = `${days} hari`;
  else if (hours > 0) text = `${hours} jam`;
  else text = `${Math.max(minutes, 1)} menit`;

  return diff >= 0 ? `${text} lagi` : `lewat ${text}`;
}

export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.description === 'string' &&
    typeof t.course === 'string' &&
    typeof t.dueDate === 'string' &&
    (t.status === 'todo' || t.status === 'in_progress' || t.status === 'completed') &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}