import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskStatus } from '../types/task';
import { DEFAULT_COURSES } from '../lib/taskUtils';
import type { TaskInput } from '../hooks/useTasks';

interface Props {
  open: boolean;
  initial: Task | null;
  courses: string[];
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function TaskFormModal({
  open,
  initial,
  courses,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setCourse(initial.course);
      setDueDate(toLocalInputValue(initial.dueDate));
      setStatus(initial.status);
    } else {
      setTitle('');
      setDescription('');
      setCourse(courses[0] ?? DEFAULT_COURSES[0]);
      const tomorrow = new Date(Date.now() + 86400000);
      setDueDate(toLocalInputValue(tomorrow.toISOString()));
      setStatus('todo');
    }
  }, [open, initial, courses]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Judul wajib diisi.';
    if (!course.trim()) next.course = 'Mata kuliah wajib diisi.';
    if (!dueDate) next.dueDate = 'Tenggat wajib diisi.';
    else if (isNaN(new Date(dueDate).getTime()))
      next.dueDate = 'Format tenggat tidak valid.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      course: course.trim(),
      dueDate: new Date(dueDate).toISOString(),
      status,
    });
  };

  const courseOptions = Array.from(new Set([...DEFAULT_COURSES, ...courses]));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[95vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">
            {initial ? 'Edit Tugas' : 'Tambah Tugas'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          <div>
            <label htmlFor="f-title" className="block text-sm font-medium text-slate-700 mb-1">
              Judul <span className="text-rose-600">*</span>
            </label>
            <input
              id="f-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="f-desc" className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="f-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
            />
          </div>

          <div>
            <label htmlFor="f-course" className="block text-sm font-medium text-slate-700 mb-1">
              Mata Kuliah <span className="text-rose-600">*</span>
            </label>
            <input
              id="f-course"
              list="course-options"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <datalist id="course-options">
              {courseOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.course && <p className="mt-1 text-xs text-rose-600">{errors.course}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-due" className="block text-sm font-medium text-slate-700 mb-1">
                Tenggat <span className="text-rose-600">*</span>
              </label>
              <input
                id="f-due"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              {errors.dueDate && <p className="mt-1 text-xs text-rose-600">{errors.dueDate}</p>}
            </div>
            <div>
              <label htmlFor="f-status" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                id="f-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="todo">Belum Dikerjakan</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {initial ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}