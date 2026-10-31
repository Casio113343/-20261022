import { useEffect, useState } from "react";
import type { GameArtifact, GameAssets } from "../../../objects/workshop";
import { openSession } from "../../../system/api/client";
import { loadGameAssets } from "../../../system/api/assets";
import { getProject } from "../../../apis/projects/GetProjectMessage";
import { listGameVersions } from "../../../apis/projects/ListGameVersionsMessage";
import { getArtworkManifest } from "../../../apis/artwork/GetArtworkManifestMessage";
import { hasPlayableBindings } from "../../ProductionPage/functions/artwork";
type PlayState =
  | Readonly<{ status: "loading"; message: string }>
  | Readonly<{ status: "unavailable" | "error"; message: string }>
  | Readonly<{
      status: "ready";
      game: GameArtifact;
      assets: GameAssets;
      synthetic: boolean;
    }>;
export function usePlay(projectId: string, versionId: string | null) {
  const [state, setState] = useState<PlayState>({
    status: "loading",
    message: "正在读取原型配置…",
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ status: "loading", message: "正在读取原型配置…" });
    async function load() {
      const session = await openSession();
      const [project, manifest, versions] = await Promise.all([
        getProject({ projectId }, session.token),
        getArtworkManifest({ projectId }, session.token),
        versionId
          ? listGameVersions({ projectId }, session.token)
          : Promise.resolve([]),
      ]);
      const selected = versionId
        ? versions.find((p) => p.artifact?.id === versionId)
        : project;
      const game = selected?.artifact;
      if (!game || !hasPlayableBindings(game)) {
        if (active)
          setState({
            status: "unavailable",
            message: versionId
              ? "该版本不存在，或还没有完整的美术绑定。请返回制作页查看可用版本。"
              : "尚未组装含完整美术的原型。请先返回制作页；规则配置、旧占位图不能作为完成的游戏。",
          });
        return;
      }
      if (active)
        setState({
          status: "loading",
          message: "正在读取并校验绑定的场景、角色和卡面…",
        });
      const assets = await loadGameAssets(game, session.token);
      const synthetic = (game.artworkBindings ?? []).some((b) =>
        manifest.history
          .find((r) => r.id === b.revisionId)
          ?.provider.startsWith("test-"),
      );
      if (active) setState({ status: "ready", game, assets, synthetic });
    }
    load().catch((e) => {
      if (active)
        setState({
          status: "error",
          message:
            e instanceof Error ? e.message : "图片加载失败，尚未进入游戏。",
        });
    });
    return () => {
      active = false;
    };
  }, [projectId, versionId, attempt]);
  return { state, retry: () => setAttempt((v) => v + 1) };
}
