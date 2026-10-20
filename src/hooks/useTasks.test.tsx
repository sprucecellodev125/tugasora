import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import { STORAGE_KEY } from '../lib/storage';
import type { Task } from '../types/task';

const sample: Task = {
  id: 'a',
  title: 'Tersimpan',
  description: '',
  course: 'MK',
  dueDate: new Date().toISOString(),
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const input = {
  title: 'Tugas Baru',
  description: 'desc',
  course: 'MK',
  dueDate: '2030-01-01T10:00',
  status: 'todo' as const,
};

beforeEach(() => localStorage.clear());

describe('useTasks', () => {
  it('memuat data tersimpan pada mount', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sample]));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('a');
  });

  it('addTask menambah dan menyimpan ke localStorage', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.addTask(input);
    });

    await waitFor(() => expect(result.current.tasks).toHaveLength(1));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Tugas Baru');
  });

  it('updateTask mengubah satu tugas saja', async () => {
    const a: Task = { ...sample, id: 'a', title: 'A' };
    const b: Task = { ...sample, id: 'b', title: 'B' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([a, b]));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.tasks).toHaveLength(2));

    act(() => {
      result.current.updateTask('a', { ...input, title: 'A diubah' });
    });

    await waitFor(() => {
      const map = Object.fromEntries(
        result.current.tasks.map((t) => [t.id, t.title]),
      );
      expect(map.a).toBe('A diubah');
      expect(map.b).toBe('B');
    });
  });

  it('deleteTask hanya menghapus satu dengan id yang tepat', async () => {
    const a: Task = { ...sample, id: 'a' };
    const b: Task = { ...sample, id: 'b' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([a, b]));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.tasks).toHaveLength(2));

    act(() => {
      result.current.deleteTask('a');
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('b');
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('b');
  });

  it('seedDemo menambahkan contoh tanpa menghapus data lama', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sample]));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.tasks).toHaveLength(1));

    act(() => {
      result.current.seedDemo();
    });

    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(1);
      expect(result.current.tasks.some((t) => t.id === 'a')).toBe(true);
    });
  });
});