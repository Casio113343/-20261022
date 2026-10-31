import type { GameInput } from "../../objects/workshop";
type CachedDraft = Readonly<{ sourceVersion: number | null; input: GameInput }>;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function images(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        record(v) &&
        typeof v.assetId === "string" &&
        typeof v.purpose === "string",
    )
  );
}
function validInput(value: unknown): value is GameInput {
  if (
    !record(value) ||
    !["title", "genreId", "reference", "mechanics", "requirements"].every(
      (k) => typeof value[k] === "string",
    )
  )
    return false;
  const world = value.world;
  if (
    !record(world) ||
    !["background", "conflict", "rules", "visual", "preserve", "freedom"].every(
      (k) => typeof world[k] === "string",
    ) ||
    !images(world.images)
  )
    return false;
  return (
    Array.isArray(value.characters) &&
    value.characters.every(
      (c) =>
        record(c) &&
        [
          "id",
          "name",
          "identity",
          "faction",
          "background",
          "personality",
          "catchphrase",
          "relationships",
          "skills",
          "role",
          "preserve",
          "freedom",
        ].every((k) => typeof c[k] === "string") &&
        images(c.images),
    )
  );
}
function key(owner: string, projectId: string | null): string {
  return `workshop-draft-v1:${owner}:${projectId ?? "new"}`;
}
export function readDraft(
  owner: string,
  projectId: string | null,
): CachedDraft | null {
  const text = localStorage.getItem(key(owner, projectId));
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    return record(value) &&
      (value.sourceVersion === null ||
        typeof value.sourceVersion === "number") &&
      validInput(value.input)
      ? { sourceVersion: value.sourceVersion, input: value.input }
      : null;
  } catch {
    return null;
  }
}
export function storeDraft(
  owner: string,
  projectId: string | null,
  sourceVersion: number | null,
  input: GameInput,
): void {
  localStorage.setItem(
    key(owner, projectId),
    JSON.stringify({ sourceVersion, input }),
  );
}
export function clearDraft(owner: string, projectId: string | null): void {
  localStorage.removeItem(key(owner, projectId));
}
