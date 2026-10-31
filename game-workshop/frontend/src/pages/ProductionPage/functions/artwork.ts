import type {
  ArtworkManifest,
  ArtworkRevision,
  ArtworkSlot,
  ArtworkTask,
  BuildStatus,
  GameArtifact,
  GameBuildResult,
  TaskStatus,
} from "../../../objects/workshop";
export const taskLabels: Readonly<Record<TaskStatus, string>> = {
  pending: "等待处理",
  running: "正在生成与加工",
  blocked: "等待图片服务",
  failed: "处理失败",
  succeeded: "已完成",
  obsolete: "已过期",
};
export const kindLabels: Readonly<Record<string, string>> = {
  scene: "场景",
  character: "角色",
  card: "卡面",
  structure: "建筑",
};
export function currentRevision(
  manifest: ArtworkManifest,
  slot: ArtworkSlot,
): ArtworkRevision | undefined {
  return manifest.history.find((r) => r.id === slot.currentRevisionId);
}
export function latestTask(
  manifest: ArtworkManifest,
  slotId: string,
): ArtworkTask | undefined {
  return [...manifest.tasks]
    .reverse()
    .find((t) => t.slotId === slotId && t.status !== "obsolete");
}
export function summarizeArtwork(
  manifest: ArtworkManifest,
): Readonly<{
  total: number;
  completed: number;
  missing: number;
  failed: number;
  running: number;
  ready: boolean;
}> {
  const slots = manifest.slots.filter((s) => s.active);
  const completed = slots.filter((s) => !!currentRevision(manifest, s)).length;
  const unfinished = manifest.tasks.some(
    (t) =>
      !["succeeded", "obsolete"].includes(t.status) &&
      slots.some((s) => s.id === t.slotId),
  );
  return {
    total: slots.length,
    completed,
    missing: slots.length - completed,
    failed: manifest.tasks.filter(
      (t) => t.status === "failed" && slots.some((s) => s.id === t.slotId),
    ).length,
    running: manifest.tasks.filter(
      (t) => t.status === "running" && slots.some((s) => s.id === t.slotId),
    ).length,
    ready: slots.length > 0 && completed === slots.length && !unfinished,
  };
}
export function isBuildStatus(value: unknown): value is BuildStatus {
  return (
    typeof value === "string" &&
    [
      "waiting_for_provider",
      "artwork_pending",
      "artwork_failed",
      "prototype_ready",
    ].includes(value)
  );
}
export function buildLabel(status: BuildStatus): string {
  return {
    waiting_for_provider: "等待图片服务接入",
    artwork_pending: "美术尚在制作",
    artwork_failed: "部分美术处理失败",
    prototype_ready: "原型已组装，可进入加载检查",
  }[status];
}
export function shouldOpenPlay(result: GameBuildResult): boolean {
  return (
    result.status === "prototype_ready" &&
    !!result.project.artifact &&
    hasPlayableBindings(result.project.artifact)
  );
}
export function hasPlayableBindings(game: GameArtifact): boolean {
  const keys = new Set(
    (game.artworkBindings ?? [])
      .filter((b) => b.processedAssetId && b.processedHash)
      .map((b) => b.slotId),
  );
  const characters = game.characters.length
    ? game.characters.map((c) => `character-${c.id}`)
    : ["character-default"];
  const expected = [
    "scene",
    ...characters,
    ...(game.characters.length < 2 ? ["enemy-default"] : []),
    ...(game.genreId === "cards" ? ["card-0", "card-1", "card-2"] : []),
    ...(["moba", "tower-defense"].includes(game.genreId)
      ? ["tower-default"]
      : []),
  ];
  return (
    ["moba", "tower-defense", "rpg", "cards"].includes(game.genreId) &&
    expected.every((id) => keys.has(id))
  );
}
export function validateVisualEdit(
  slotIds: readonly string[],
  instruction: string,
): string | null {
  if (!slotIds.length) return "请明确选择要修改的素材。";
  if (!instruction.trim()) return "请说明视觉改动，并写清需要保留的部分。";
  if (instruction.length > 6000) return "视觉修改说明最多6000字。";
  return null;
}
