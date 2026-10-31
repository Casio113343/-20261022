import type { ResourceData, ResourceKind } from "../../../objects/library";
import type { World, Character } from "../../../objects/workshop";
export function emptyResource(kind: ResourceKind): ResourceData {
  const world: World = {
    background: "",
    conflict: "",
    rules: "",
    visual: "",
    preserve: "",
    freedom: "",
    images: [],
  };
  const character: Character = {
    id: "resource-character",
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
  return {
    kind,
    title: "",
    description: "",
    content: "",
    world: kind === "world" ? world : null,
    character: kind === "character" ? character : null,
    source: null,
  };
}
export function validateResource(d: ResourceData): string | null {
  if (!d.title.trim()) return "请先为这项成果命名。";
  if (
    d.title.length > 120 ||
    d.description.length > 6000 ||
    d.content.length > 6000
  )
    return "名称最多120字，其余每项最多6000字。";
  return null;
}
