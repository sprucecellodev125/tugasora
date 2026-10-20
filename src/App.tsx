import { useMemo, useState, useCallback } from 'react';
import { Plus, Inbox, Sparkles } from 'lucide-react';
import type { Task, TaskFilter, TaskStatus } from './types/task';
import { isOverdue, sortByDueDate } from './lib/taskUtils';
import { useTasks } from './hooks/useTasks';
import type { TaskInput } from './hooks/useTasks';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskFilters } from './components/TaskFilters';
import { TaskCard } from './components/TaskCard';
import { TaskFormModal } from './components/TaskFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastStack } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, seedDemo, storageError, ready } =
    useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), kind, text },
    ]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const counts = useMemo<Record<TaskFilter, number>>(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter(isOverdue).length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = tasks;
    if (filter === 'overdue') list = list.filter(isOverdue);
    else if (filter !== 'all') list = list.filter((t) => t.status === filter);
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.course.toLowerCase().includes(q),
      );
    }
    return sortByDueDate(list);
  }, [tasks, filter, search]);

  const courses = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.course))),
    [tasks],
  );

  const handleSubmit = (input: TaskInput) => {
    if (editing) {
      updateTask(editing.id, input);
      pushToast('success', 'Tugas diperbarui.');
    } else {
      addTask(input);
      pushToast('success', 'Tugas ditambahkan.');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteTask(deleting.id);
    pushToast('success', 'Tugas dihapus.');
    setDeleting(null);
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    updateTask(id, {
      title: t.title,
      description: t.description,
      course: t.course,
      dueDate: t.dueDate,
      status,
    });
    pushToast('success', 'Status diperbarui.');
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        <Dashboard tasks={tasks} />

        {storageError && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3"
          >
            {storageError}
          </div>
        )}

        <section aria-labelledby="list-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 id="list-heading" className="text-lg font-semibold">
              Daftar Tugas
            </h2>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Tambah Tugas
            </button>
          </div>

          <TaskFilters
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            counts={counts}
          />

          {!ready ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="mt-2 font-medium text-slate-700">
                {tasks.length === 0
                  ? 'Belum ada tugas.'
                  : 'Tidak ada tugas yang cocok dengan filter.'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {tasks.length === 0
                  ? 'Tambahkan tugas pertamamu atau muat contoh data.'
                  : 'Coba ubah filter atau kata kunci pencarian.'}
              </p>
              {tasks.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    seedDemo();
                    pushToast('success', 'Contoh tugas dimuat.');
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Muat Data Demo
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <TaskFormModal
        open={formOpen}
        initial={editing}
        courses={courses}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Hapus tugas ini?"
        message={
          deleting
            ? `"${deleting.title}" akan dihapus permanen dari penyimpanan lokal.`
            : ''
        }
        confirmLabel="Ya, hapus"
        cancelLabel="Batal"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}