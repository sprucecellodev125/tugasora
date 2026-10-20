import { describe, it, expect } from 'vitest';
import {
  isOverdue,
  formatDueDate,
  formatRelative,
  sortByDueDate,
  isTask,
} from './taskUtils';
import type { Task } from '../types/task';

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: 'Tugas',
  description: '',
  course: 'MK',
  dueDate: new Date(Date.now() + 86400000).toISOString(),
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('isOverdue', () => {
  it('false untuk completed walau tenggat lewat', () => {
    const t = baseTask({
      status: 'completed',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    });
    expect(isOverdue(t)).toBe(false);
  });

  it('true untuk todo dengan tenggat lewat', () => {
    const t = baseTask({
      status: 'todo',
      dueDate: new Date(Date.now() - 3600000).toISOString(),
    });
    expect(isOverdue(t)).toBe(true);
  });

  it('true untuk in_progress dengan tenggat lewat', () => {
    const t = baseTask({
      status: 'in_progress',
      dueDate: new Date(Date.now() - 1000).toISOString(),
    });
    expect(isOverdue(t)).toBe(true);
  });

  it('false untuk tenggat di masa depan', () => {
    expect(isOverdue(baseTask())).toBe(false);
  });

  it('false untuk tanggal tidak valid', () => {
    expect(isOverdue(baseTask({ dueDate: 'bukan tanggal' }))).toBe(false);
  });
});

describe('formatDueDate', () => {
  it('mengembalikan string non-empty untuk ISO valid', () => {
    expect(formatDueDate('2030-01-01T10:00:00Z')).not.toBe('');
  });
  it('mengembalikan pesan untuk tanggal rusak', () => {
    expect(formatDueDate('xx')).toBe('Tanggal tidak valid');
  });
});

describe('formatRelative', () => {
  it('menyebut "lagi" untuk masa depan', () => {
    const iso = new Date(Date.now() + 3 * 3600000).toISOString();
    expect(formatRelative(iso)).toMatch(/lagi$/);
  });
  it('menyebut "lewat" untuk masa lalu', () => {
    const iso = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelative(iso)).toMatch(/^lewat/);
  });
  it('string kosong untuk ISO rusak', () => {
    expect(formatRelative('bukan tanggal')).toBe('');
  });
});

describe('sortByDueDate', () => {
  it('mengurutkan ascending dan tidak memutasi input', () => {
    const a = baseTask({ id: 'a', dueDate: '2030-01-10T00:00:00Z' });
    const b = baseTask({ id: 'b', dueDate: '2030-01-05T00:00:00Z' });
    const c = baseTask({ id: 'c', dueDate: '2030-01-15T00:00:00Z' });
    const input = [a, b, c];
    const result = sortByDueDate(input);
    expect(result.map((t) => t.id)).toEqual(['b', 'a', 'c']);
    expect(input[0].id).toBe('a'); // input tidak berubah
  });
});

describe('isTask', () => {
  it('true untuk task valid', () => {
    expect(isTask(baseTask())).toBe(true);
  });
  it('false jika field hilang', () => {
    const { title: _omit, ...rest } = baseTask();
    expect(isTask(rest)).toBe(false);
  });
  it('false jika status tidak dikenal', () => {
    expect(isTask({ ...baseTask(), status: 'done' })).toBe(false);
  });
  it('false untuk non-object', () => {
    expect(isTask(null)).toBe(false);
    expect(isTask('abc')).toBe(false);
    expect(isTask(42)).toBe(false);
  });
});