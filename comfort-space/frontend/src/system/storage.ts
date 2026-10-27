import { savedSchema, type SavedState } from '../domain/types';

const storageKey = 'qiyu.demo.v1';
export function readSaved(): SavedState | null {
  try {
    const text = localStorage.getItem(storageKey);
    if (!text || text.length > 2_000_000) return null;
    const parsed = savedSchema.safeParse(JSON.parse(text));
    return parsed.success && parsed.data.preferences.remember
      ? parsed.data
      : null;
  } catch {
    return null;
  }
}
export function writeSaved(saved: SavedState): boolean {
  try {
    if (saved.preferences.remember) {
      const text = JSON.stringify(saved);
      if (text.length > 2_000_000) return false;
      localStorage.setItem(storageKey, text);
    } else localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}
export function downloadData(saved: SavedState): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = '栖语-我的记录.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
