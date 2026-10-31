import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { readDraft, storeDraft, clearDraft } from "./drafts";
import { emptyInput } from "../../pages/StudioPage/functions/draft";
beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());
describe("草稿缓存边界", () => {
  it("以访客与作品隔离未保存内容", () => {
    storeDraft("one", "p", 3, { ...emptyInput, title: "未保存" });
    expect(readDraft("one", "p")?.sourceVersion).toBe(3);
    expect(readDraft("one", "p")?.input.title).toBe("未保存");
    expect(readDraft("two", "p")).toBeNull();
    expect(readDraft("one", "q")).toBeNull();
  });
  it("损坏缓存不能被当成有效创作资料", () => {
    localStorage.setItem("workshop-draft-v1:one:new", "{bad");
    expect(readDraft("one", null)).toBeNull();
    localStorage.setItem(
      "workshop-draft-v1:one:new",
      JSON.stringify({ sourceVersion: null, input: { title: "fake" } }),
    );
    expect(readDraft("one", null)).toBeNull();
  });
  it("保存后只清理对应草稿", () => {
    storeDraft("one", "p", 3, emptyInput);
    storeDraft("one", "q", 1, emptyInput);
    clearDraft("one", "p");
    expect(readDraft("one", "p")).toBeNull();
    expect(readDraft("one", "q")).not.toBeNull();
  });
});
