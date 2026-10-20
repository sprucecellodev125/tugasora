import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEY } from './lib/storage';

beforeEach(() => localStorage.clear());

const fillAndSubmit = async (
  overrides: Partial<{ title: string; course: string; due: string }> = {},
) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /^Tambah Tugas$/i }));
  const dialog = await screen.findByRole('dialog');

  fireEvent.change(within(dialog).getByLabelText(/^Judul/i), {
    target: { value: overrides.title ?? 'Tugas Uji' },
  });
  fireEvent.change(within(dialog).getByLabelText(/Mata Kuliah/i), {
    target: { value: overrides.course ?? 'Pemrograman Web' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Tenggat/i), {
    target: { value: overrides.due ?? '2030-01-01T10:00' },
  });
  await user.click(within(dialog).getByRole('button', { name: /^Tambah Tugas$/i }));
};

const findTaskHeading = (title: string) =>
  screen.findByRole('heading', { level: 3, name: title });

describe('App', () => {
  it('menampilkan empty state saat belum ada data', async () => {
    render(<App />);
    expect(await screen.findByText(/Belum ada tugas/i)).toBeInTheDocument();
  });

  it('menambah tugas dan tampil di daftar + tersimpan di localStorage', async () => {
    render(<App />);
    await screen.findByText(/Belum ada tugas/i);

    await fillAndSubmit({ title: 'Tugas Uji A' });

    expect(await findTaskHeading('Tugas Uji A')).toBeInTheDocument();
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Tugas Uji A');
    });
  });

  it('validasi formulir menolak judul kosong', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/Belum ada tugas/i);

    await user.click(screen.getByRole('button', { name: /^Tambah Tugas$/i }));
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText(/^Judul/i), {
      target: { value: '' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Tenggat/i), {
      target: { value: '2030-01-01T10:00' },
    });
    await user.click(within(dialog).getByRole('button', { name: /^Tambah Tugas$/i }));

    expect(await within(dialog).findByText(/Judul wajib diisi/i)).toBeInTheDocument();
    // dialog masih terbuka
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('membatalkan dialog hapus TIDAK menghapus tugas', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit({ title: 'Perlu Dipertahankan' });
    await findTaskHeading('Perlu Dipertahankan');

    await user.click(screen.getByRole('button', { name: /Hapus/i }));
    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: /^Batal$/i }));

    expect(await findTaskHeading('Perlu Dipertahankan')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
  });

  it('konfirmasi hapus benar-benar menghapus dan persist', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit({ title: 'Akan Dihapus' });
    await findTaskHeading('Akan Dihapus');

    await user.click(screen.getByRole('button', { name: /Hapus/i }));
    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: /Ya, hapus/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Akan Dihapus' }),
      ).not.toBeInTheDocument();
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(0);
  });

  it('filter Selesai menampilkan hanya tugas completed', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit({ title: 'Tugas Aktif' });
    await findTaskHeading('Tugas Aktif');

    // ubah jadi selesai lewat select di kartu
    const statusSelect = screen.getByLabelText(/Ubah status Tugas Aktif/i);
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    await user.click(screen.getByRole('button', { name: /^Selesai\b/i }));
    // setelah filter Selesai aktif, kartu masih ada
    expect(await findTaskHeading('Tugas Aktif')).toBeInTheDocument();

    // filter Belum → kartu hilang
    await user.click(screen.getByRole('button', { name: /^Belum\b/i }));
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Tugas Aktif' }),
      ).not.toBeInTheDocument();
    });
  });

  it('pencarian menyaring berdasarkan judul', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit({ title: 'Laporan Basis Data' });
    await findTaskHeading('Laporan Basis Data');
    await fillAndSubmit({ title: 'Landing Page Web' });
    await findTaskHeading('Landing Page Web');

    const search = screen.getByRole('searchbox', { name: /Cari tugas/i });
    await user.type(search, 'landing');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 3, name: 'Landing Page Web' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 3, name: 'Laporan Basis Data' }),
      ).not.toBeInTheDocument();
    });
  });
});