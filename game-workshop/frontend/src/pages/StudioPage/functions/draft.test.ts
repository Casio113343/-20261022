import { describe, it, expect } from "vitest";
import { emptyInput, newCharacter, switchGenre, validateDraft } from "./draft";
describe("创作资料纯转换", () => {
  it("切换玩法保留世界观与人物", () => {
    const c = newCharacter("hero");
    const original = {
      ...emptyInput,
      characters: [{ ...c, name: "林", catchphrase: "我来" }],
    };
    const next = switchGenre(original, "cards");
    expect(original.genreId).toBe("moba");
    expect(next.characters).toEqual(original.characters);
    expect(next.world).toEqual(original.world);
  });
  it("空白参考被拒绝", () => {
    expect(validateDraft({ ...emptyInput, reference: "  " })).not.toBeNull();
    expect(
      validateDraft({ ...emptyInput, reference: "类似回合制RPG" }),
    ).toBeNull();
  });
});
