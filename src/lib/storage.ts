import type { Task } from '../types/task';
import { isTask } from './taskUtils';

export const STORAGE_KEY = 'tugasora.tasks.v1';

export interface LoadResult {
  tasks: Task[];
  error: string | null;
  recovered: boolean;
}

export function loadTasks(): LoadResult {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        tasks: [],
        error: 'localStorage tidak tersedia di browser ini.',
        recovered: false,
      };
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tasks: [], error: null, recovered: false };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        tasks: [],
        error:
          'Data tersimpan tidak valid dan tidak dapat dibaca. Data lama tidak ditimpa.',
        recovered: false,
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        tasks: [],
        error:
          'Format data tersimpan tidak dikenali. Data lama tidak ditimpa.',
        recovered: false,
      };
    }

    const valid = parsed.filter(isTask);
    const recovered = valid.length !== parsed.length;
    return {
      tasks: valid,
      error: recovered
        ? `${parsed.length - valid.length} entri rusak dilewati.`
        : null,
      recovered,
    };
  } catch (e) {
    return {
      tasks: [],
      error:
        'Gagal membaca penyimpanan: ' +
        (e instanceof Error ? e.message : 'unknown'),
      recovered: false,
    };
  }
}

export function saveTasks(
  tasks: Task[],
): { ok: true } | { ok: false; error: string } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: false, error: 'localStorage tidak tersedia.' };
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return { ok: false, error: 'Gagal menyimpan data: ' + msg };
  }
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}