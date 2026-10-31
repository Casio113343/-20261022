import { describe, it, expect } from "vitest";
import type {
  ArtworkManifest,
  GameArtifact,
  GameBuildResult,
  ArtworkTask,
} from "../../../objects/workshop";
import { emptyInput } from "../../StudioPage/functions/draft";
import {
  hasPlayableBindings,
  shouldOpenPlay,
  summarizeArtwork,
  validateVisualEdit,
  isBuildStatus,
} from "./artwork";
const bindings = ["scene", "character-default", "enemy-default"].map(
  (slotId) => ({
    slotId,
    revisionId: `r-${slotId}`,
    originalAssetId: `o-${slotId}`,
    processedAssetId: `p-${slotId}`,
    originalHash: "a".repeat(64),
    processedHash: "b".repeat(64),
  }),
);
const game: GameArtifact = {
  id: "a",
  projectId: "p",
  version: 2,
  genreId: "rpg",
  title: "test",
  characters: [],
  world: {
    background: "",
    conflict: "",
    rules: "",
    visual: "",
    preserve: "",
    freedom: "",
    images: [],
  },
  settings: { difficulty: 2, rounds: 3 },
  engine: "local-template-v1",
  artworkBindings: bindings,
};
const slots = bindings.map((b) => ({
  id: b.slotId,
  kind: "character",
  subject: b.slotId,
  brief: {
    slotId: b.slotId,
    kind: "character",
    subject: b.slotId,
    prompt: "",
    referenceAssetIds: [],
    aspectRatio: "1:1",
    projectVersion: 2,
  },
  currentRevisionId: b.revisionId,
  active: true,
}));
const history = bindings.map((b) => ({
  id: b.revisionId,
  slotId: b.slotId,
  originalAssetId: b.originalAssetId,
  processedAssetId: b.processedAssetId,
  originalHash: b.originalHash,
  processedHash: b.processedHash,
  parentRevisionId: null,
  sourceProjectVersion: 2,
  provider: "test-provider",
  instruction: "test",
  createdAt: "2026-10-31T00:00:00Z",
}));
const manifest: ArtworkManifest = {
  projectId: "p",
  revision: 1,
  slots,
  tasks: [],
  history,
};
describe("制作状态与素材绑定门槛", () => {
  it("旧规则配置没有美术时不能开放试玩", () => {
    expect(hasPlayableBindings({ ...game, artworkBindings: undefined })).toBe(
      false,
    );
    expect(hasPlayableBindings(game)).toBe(true);
  });
  it("卡牌缺失卡面时不能开放试玩", () => {
    expect(hasPlayableBindings({ ...game, genreId: "cards" })).toBe(false);
  });
  it("等待服务的结果不能因为旧artifact存在而跳转试玩", () => {
    const result: GameBuildResult = {
      status: "waiting_for_provider",
      project: {
        id: "p",
        ownerId: "o",
        version: 2,
        input: emptyInput,
        plan: null,
        artifact: game,
        updatedAt: "2026-10-31T00:00:00Z",
      },
      artwork: manifest,
      message: "waiting",
    };
    expect(shouldOpenPlay(result)).toBe(false);
    expect(shouldOpenPlay({ ...result, status: "prototype_ready" })).toBe(true);
  });
  it("有旧图但局部更新未完成时不能显示最新美术已经就绪", () => {
    const task: ArtworkTask = {
      id: "e",
      slotId: "scene",
      operation: "edit",
      instruction: "night",
      brief: slots[0].brief,
      baseRevisionId: bindings[0].revisionId,
      requestId: "edit",
      status: "failed",
      attempts: 1,
      leaseToken: null,
      leaseUntil: 0,
      error: "failed",
    };
    expect(summarizeArtwork({ ...manifest, tasks: [task] })).toEqual({
      total: 3,
      completed: 3,
      missing: 0,
      failed: 1,
      running: 0,
      ready: false,
    });
    expect(summarizeArtwork(manifest).ready).toBe(true);
  });
  it("从素材ID精确选择编辑目标，不允许空泛请求", () => {
    expect(validateVisualEdit([], "全部改一下")).not.toBeNull();
    expect(validateVisualEdit(["scene"], "  ")).not.toBeNull();
    expect(validateVisualEdit(["scene"], "只改夜间光照，其余不变")).toBeNull();
  });
  it("空任务不虚构完成进度", () => {
    expect(summarizeArtwork({ ...manifest, slots: [], history: [] })).toEqual({
      total: 0,
      completed: 0,
      missing: 0,
      failed: 0,
      running: 0,
      ready: false,
    });
  });
  it("仅接受后端约定的生成状态", () => {
    expect(isBuildStatus("waiting_for_provider")).toBe(true);
    expect(isBuildStatus("success")).toBe(false);
  });
});
