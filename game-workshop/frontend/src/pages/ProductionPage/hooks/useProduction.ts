import { useEffect, useRef, useState } from "react";
import type {
  ArtworkManifest,
  GameBuildResult,
  Project,
  Session,
} from "../../../objects/workshop";
import { openSession } from "../../../system/api/client";
import { getProject } from "../../../apis/projects/GetProjectMessage";
import { generateGame } from "../../../apis/projects/GenerateGameMessage";
import { listGameVersions } from "../../../apis/projects/ListGameVersionsMessage";
import { getArtworkManifest } from "../../../apis/artwork/GetArtworkManifestMessage";
import { requestArtworkEdit } from "../../../apis/artwork/RequestArtworkEditMessage";
import { retryArtworkTask } from "../../../apis/artwork/RetryArtworkTaskMessage";
import { processArtworkTask } from "../../../apis/artwork/ProcessArtworkTaskMessage";
import { restoreArtworkRevision } from "../../../apis/artwork/RestoreArtworkRevisionMessage";
import { buildLabel, validateVisualEdit } from "../functions/artwork";
export type ProductionState = Readonly<{
  project: Project;
  manifest: ArtworkManifest;
  versions: readonly Project[];
  session: Session;
}>;
export function useProduction(projectId: string) {
  const [state, setState] = useState<ProductionState | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<GameBuildResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pollError, setPollError] = useState("");
  const lock = useRef(false);
  const mounted = useRef(true);
  const editRequest = useRef<Readonly<{
    signature: string;
    id: string;
  }> | null>(null);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    setState(null);
    setError("");
    setResult(null);
    openSession()
      .then(async (session) => {
        const [project, manifest, versions] = await Promise.all([
          getProject({ projectId }, session.token),
          getArtworkManifest({ projectId }, session.token),
          listGameVersions({ projectId }, session.token),
        ]);
        if (active) setState({ project, manifest, versions, session });
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "制作资料加载失败。");
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [projectId, attempt]);
  async function refreshData(session: Session) {
    const [project, manifest, versions] = await Promise.all([
      getProject({ projectId }, session.token),
      getArtworkManifest({ projectId }, session.token),
      listGameVersions({ projectId }, session.token),
    ]);
    if (mounted.current) setState({ project, manifest, versions, session });
  }
  // 只读取服务端状态；没有虚构进度，也不启动无人管理的生成任务。
  useEffect(() => {
    if (
      !state ||
      (!busy && !state.manifest.tasks.some((t) => t.status === "running"))
    )
      return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const session = state.session;
    async function poll() {
      try {
        const manifest = await getArtworkManifest({ projectId }, session.token);
        if (!stopped) {
          setState((old) => (old ? { ...old, manifest } : old));
          setPollError("");
        }
      } catch {
        if (!stopped)
          setPollError(
            "实时状态暂时无法更新，当前显示上次成功读取的记录。可手动刷新。",
          );
      }
      if (!stopped) timer = setTimeout(() => void poll(), 2000);
    }
    timer = setTimeout(() => void poll(), 2000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [
    busy,
    projectId,
    state?.session.token,
    !!state?.manifest.tasks.some((t) => t.status === "running"),
  ]);
  async function act(
    label: string,
    operation: (data: ProductionState) => Promise<void>,
  ): Promise<boolean> {
    if (!state || lock.current) return false;
    lock.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await operation(state);
      return true;
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "操作失败，资料已保留，请重试。",
        );
      return false;
    } finally {
      lock.current = false;
      if (mounted.current) setBusy("");
    }
  }
  function build() {
    return act("制作游戏", async (data) => {
      const next = await generateGame(
        { projectId, expectedVersion: data.project.version },
        data.session.token,
      );
      if (!mounted.current) return;
      setResult(next);
      setState((old) =>
        old ? { ...old, project: next.project, manifest: next.artwork } : old,
      );
      setNotice(buildLabel(next.status));
      await refreshData(data.session);
    });
  }
  function refresh() {
    return act("刷新状态", (data) => refreshData(data.session));
  }
  function edit(slotIds: readonly string[], instruction: string) {
    return act("提交局部改图", async (data) => {
      const invalid = validateVisualEdit(slotIds, instruction);
      if (invalid) throw new Error(invalid);
      const signature = JSON.stringify({
        slotIds,
        instruction,
        revision: data.manifest.revision,
      });
      if (editRequest.current?.signature !== signature)
        editRequest.current = { signature, id: crypto.randomUUID() };
      const manifest = await requestArtworkEdit(
        {
          projectId,
          expectedVersion: data.project.version,
          expectedManifestRevision: data.manifest.revision,
          requestId: editRequest.current.id,
          slotIds,
          instruction,
        },
        data.session.token,
      );
      if (mounted.current) {
        setState((old) => (old ? { ...old, manifest } : old));
        setResult(null);
        setNotice(
          `已记录 ${slotIds.length} 项视觉修改。其他素材继续复用，旧图保留到新图处理成功。`,
        );
      }
    });
  }
  function retryTask(taskId: string) {
    return act("重试指定素材", async (data) => {
      await retryArtworkTask({ projectId, taskId }, data.session.token);
      const task = await processArtworkTask(
        { projectId, taskId },
        data.session.token,
      );
      await refreshData(data.session);
      if (mounted.current)
        setNotice(
          task.status === "blocked"
            ? "图片服务尚未配置，该任务已保留；其他素材未重画。"
            : task.status === "failed"
              ? "该素材仍未处理成功，可查看任务原因后重试。"
              : "指定任务已处理；其他素材未重画。",
        );
    });
  }
  function processTask(taskId: string) {
    return act("处理指定素材", async (data) => {
      const task = await processArtworkTask(
        { projectId, taskId },
        data.session.token,
      );
      await refreshData(data.session);
      if (mounted.current)
        setNotice(
          task.status === "blocked"
            ? "等待图片服务接入，尚未生成这张图片。"
            : task.status === "failed"
              ? "处理失败，原有图片已保留。"
              : "任务状态已更新。",
        );
    });
  }
  function restore(revisionId: string) {
    return act("恢复素材版本", async (data) => {
      await restoreArtworkRevision(
        {
          projectId,
          expectedVersion: data.project.version,
          expectedManifestRevision: data.manifest.revision,
          revisionId,
        },
        data.session.token,
      );
      await refreshData(data.session);
      if (mounted.current) {
        setResult(null);
        setNotice(
          "已恢复这张素材。规则和其他美术保持不变，再次制作即可绑定此版本。",
        );
      }
    });
  }
  return {
    state,
    busy,
    error,
    notice,
    pollError,
    result,
    build,
    refresh,
    edit,
    retryTask,
    processTask,
    restore,
    reload: () => setAttempt((v) => v + 1),
  };
}
