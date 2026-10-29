import type { SavedState } from '../domain/types';

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
