import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSaved, writeSaved } from './storage';
import { initialState, savedPart } from '../domain/reducer';

afterEach(() => vi.unstubAllGlobals());
describe('本地保存的用户选择与边界校验', () => {
  it('默认不写内容；明确开启才保存；关闭后删除', () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('localStorage', storage);
    const saved = savedPart(initialState());
    expect(writeSaved(saved)).toBe(true);
    expect(storage.setItem).not.toHaveBeenCalled();
    writeSaved({
      ...saved,
      preferences: { ...saved.preferences, remember: true },
    });
    expect(storage.setItem).toHaveBeenCalledOnce();
    writeSaved(saved);
    expect(storage.removeItem).toHaveBeenCalledTimes(2);
  });
  it('拒绝损坏、不匹配或未同意保存的数据', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{broken' });
    expect(readSaved()).toBeNull();
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ version: 2 }),
    });
    expect(readSaved()).toBeNull();
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify(savedPart(initialState())),
    });
    expect(readSaved()).toBeNull();
  });
  it('浏览器拒绝存储时返回失败，不伪造保存成功', () => {
    vi.stubGlobal('localStorage', {
      removeItem: () => {
        throw new Error('denied');
      },
      getItem: () => {
        throw new Error('denied');
      },
    });
    expect(readSaved()).toBeNull();
    expect(writeSaved(savedPart(initialState()))).toBe(false);
  });
});
