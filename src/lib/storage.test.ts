import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTasks, saveTasks, createId, STORAGE_KEY } from './storage';
import type { Task } from '../types/task';

const sampleTask: Task = {
  id: 'id-1',
  title: 'Contoh',
  description: '',
  course: 'MK',
  dueDate: new Date().toISOString(),
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => localStorage.clear());

describe('loadTasks', () => {
  it('kosong jika storage kosong', () => {
    const r = loadTasks();
    expect(r.tasks).toEqual([]);
    expect(r.error).toBeNull();
  });

  it('memuat data valid', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleTask]));
    const r = loadTasks();
    expect(r.tasks).toHaveLength(1);
    expect(r.tasks[0].id).toBe('id-1');
    expect(r.error).toBeNull();
  });

  it('error dan TIDAK menimpa data saat JSON rusak', () => {
    localStorage.setItem(STORAGE_KEY, 'bukan json{{');
    const r = loadTasks();
    expect(r.tasks).toEqual([]);
    expect(r.error).toBeTruthy();
    // yang penting: data lama masih ada
    expect(localStorage.getItem(STORAGE_KEY)).toBe('bukan json{{');
  });

  it('error untuk JSON yang bukan array', () => {
    localStorage.setItem(STORAGE_KEY, '{"a":1}');
    const r = loadTasks();
    expect(r.tasks).toEqual([]);
    expect(r.error).toBeTruthy();
  });

  it('memfilter entry rusak dari array campuran', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([sampleTask, { id: 'x' }, null, 42]),
    );
    const r = loadTasks();
    expect(r.tasks).toHaveLength(1);
    expect(r.error).toMatch(/rusak/i);
    expect(r.recovered).toBe(true);
  });
});

describe('saveTasks', () => {
  it('berhasil menyimpan', () => {
    const r = saveTasks([sampleTask]);
    expect(r.ok).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([sampleTask]));
  });

  it('gagal saat setItem melempar (quota dsb)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const r = saveTasks([sampleTask]);
    expect(r.ok).toBe(false);
    spy.mockRestore();
  });
});

describe('createId', () => {
  it('menghasilkan id unik untuk 100 panggilan', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });
});