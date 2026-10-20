import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { createId, loadTasks, saveTasks } from '../lib/storage';

export interface TaskInput {
  title: string;
  description: string;
  course: string;
  dueDate: string;
  status: TaskStatus;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const initialLoaded = useRef(false);

  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;
    const { tasks: loaded, error } = loadTasks();
    setTasks(loaded);
    if (error) setStorageError(error);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const res = saveTasks(tasks);
    if (!res.ok) setStorageError(res.error);
    else setStorageError(null);
  }, [tasks, ready]);

  const addTask = useCallback((input: TaskInput) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId(),
      title: input.title.trim(),
      description: input.description.trim(),
      course: input.course.trim(),
      dueDate: input.dueDate,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: input.title.trim(),
              description: input.description.trim(),
              course: input.course.trim(),
              dueDate: input.dueDate,
              status: input.status,
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const seedDemo = useCallback(() => {
    const now = Date.now();
    const day = 86400000;
    const make = (
      partial: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    ): Task => {
      const iso = new Date().toISOString();
      return { ...partial, id: createId(), createdAt: iso, updatedAt: iso };
    };
    const demo: Task[] = [
      make({
        title: 'Membuat Landing Page Responsif',
        description: 'Gunakan HTML semantik dan media query.',
        course: 'Pemrograman Web',
        dueDate: new Date(now + 2 * day).toISOString(),
        status: 'todo',
      }),
      make({
        title: 'Normalisasi Database Perpustakaan',
        description: 'Sampai bentuk normal ketiga (3NF).',
        course: 'Basis Data',
        dueDate: new Date(now + 5 * day).toISOString(),
        status: 'in_progress',
      }),
      make({
        title: 'Laporan Algoritma A*',
        description: 'Bandingkan performa dengan BFS.',
        course: 'Kecerdasan Buatan',
        dueDate: new Date(now - 1 * day).toISOString(),
        status: 'todo',
      }),
      make({
        title: 'SRS Aplikasi Kasir',
        description: 'User story dan use case.',
        course: 'Rekayasa Perangkat Lunak',
        dueDate: new Date(now - 3 * day).toISOString(),
        status: 'completed',
      }),
    ];
    setTasks((prev) => [...demo, ...prev]);
  }, []);

  return { tasks, addTask, updateTask, deleteTask, seedDemo, storageError, ready };
}