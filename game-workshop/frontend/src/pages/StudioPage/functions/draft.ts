import type { GameInput, Character, World } from "../../../objects/workshop";
export const emptyWorld: World = {
  background: "",
  conflict: "",
  rules: "",
  visual: "",
  preserve: "",
  freedom: "",
  images: [],
};
export const emptyInput: GameInput = {
  title: "",
  genreId: "moba",
  reference: "",
  mechanics: "",
  requirements: "",
  world: emptyWorld,
  characters: [],
};
export function newCharacter(id: string): Character {
  return {
    id,
    name: "",
    identity: "",
    faction: "",
    background: "",
    personality: "",
    catchphrase: "",
    relationships: "",
    skills: "",
    role: "",
    preserve: "",
    freedom: "",
    images: [],
  };
}
export function switchGenre(input: GameInput, genreId: string): GameInput {
  return { ...input, genreId };
}
export function validateDraft(input: GameInput): string | null {
  if (!input.reference.trim())
    return "请填写参考游戏或具体模式，例如「类似三国杀的身份对抗模式」。";
  if (
    input.world.images.length +
      input.characters.reduce((n, c) => n + c.images.length, 0) >
    24
  )
    return "参考图片总计最多24张，请移除多余图片。";
  return null;
}
