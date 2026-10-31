import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  GameInput,
  Genre,
  Project,
  Session,
  PlanSection,
  RuntimeSettings,
} from "../../../objects/workshop";
import { openSession } from "../../../system/api/client";
import { listGenres } from "../../../apis/catalog/ListGenresMessage";
import { createProject } from "../../../apis/projects/CreateProjectMessage";
import { getProject } from "../../../apis/projects/GetProjectMessage";
import { saveProject } from "../../../apis/projects/SaveProjectMessage";
import { preparePlan } from "../../../apis/projects/PreparePlanMessage";
import { revisePlan } from "../../../apis/projects/RevisePlanMessage";
import { confirmPlan } from "../../../apis/projects/ConfirmPlanMessage";
import { generateGame } from "../../../apis/projects/GenerateGameMessage";
import { emptyInput, validateDraft } from "../functions/draft";
import {
  readDraft,
  storeDraft,
  clearDraft,
} from "../../../system/storage/drafts";
export function useStudio() {
  const [params, setParams] = useSearchParams();
  const id = params.get("project");
  const navigate = useNavigate();
  const [input, setInput] = useState<GameInput>(emptyInput);
  const [project, setProject] = useState<Project | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [olderDraft, setOlderDraft] = useState<GameInput | null>(null);
  const createId = useRef<string | null>(null);
  const ownNavigation = useRef<string | null>(null);
  const activeOperation = useRef(false);
  useEffect(() => {
    if (id && ownNavigation.current === id) {
      ownNavigation.current = null;
      return;
    }
    let active = true;
    setReady(false);
    setError("");
    Promise.all([openSession(), listGenres({})])
      .then(async ([s, g]) => {
        const p = id ? await getProject({ projectId: id }, s.token) : null;
        if (active) {
          const cached = readDraft(s.ownerId, id);
          const matching =
            cached && cached.sourceVersion === (p?.version ?? null);
          setSession(s);
          setGenres(g);
          setProject(p);
          setInput(matching ? cached.input : (p?.input ?? emptyInput));
          setReady(true);
          createId.current = null;
          setOlderDraft(cached && !matching ? cached.input : null);
          setNotice(matching ? "已恢复当前浏览器中未保存的草稿。" : "");
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "加载失败");
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  const dirty = project
    ? JSON.stringify(input) !== JSON.stringify(project.input)
    : true;
  async function perform(label: string, action: () => Promise<void>) {
    if (activeOperation.current) return;
    activeOperation.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败，请重试");
    } finally {
      setBusy("");
      activeOperation.current = false;
    }
  }
  async function persist(): Promise<Project> {
    if (!session) throw new Error("访客会话尚未就绪");
    if (project) {
      if (!dirty) return project;
      const p = await saveProject(
        { projectId: project.id, expectedVersion: project.version, input },
        session.token,
      );
      setProject(p);
      clearDraft(session.ownerId, project.id);
      return p;
    }
    if (!createId.current) createId.current = crypto.randomUUID();
    const p = await createProject(
      { requestId: createId.current, input },
      session.token,
    );
    setProject(p);
    clearDraft(session.ownerId, null);
    ownNavigation.current = p.id;
    setParams({ project: p.id }, { replace: true });
    return p;
  }
  function patch(next: GameInput) {
    setInput(next);
    setNotice("");
    if (session) {
      try {
        storeDraft(session.ownerId, id, project?.version ?? null, next);
      } catch {
        setNotice("浏览器草稿缓存已满，请点击保存草稿，将内容保存到服务端。");
      }
    }
  }
  function save() {
    return perform("保存草稿", async () => {
      await persist();
      setNotice("草稿已保存，可在「我的作品」继续。");
    });
  }
  function prepare() {
    return perform("整理方案", async () => {
      const validation = validateDraft(input);
      if (validation) {
        document.getElementById("reference")?.focus();
        throw new Error(validation);
      }
      const p = await persist();
      const updated = await preparePlan(
        { projectId: p.id, expectedVersion: p.version },
        session?.token,
      );
      setProject(updated);
      setNotice("模板方案已整理，请核对补充项与运行范围。");
      document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" });
    });
  }
  function revise(
    additions: readonly PlanSection[],
    settings: RuntimeSettings,
  ) {
    return perform("保存方案", async () => {
      if (!project || dirty)
        throw new Error("原始资料已变化，请先重新整理方案");
      setProject(
        await revisePlan(
          {
            projectId: project.id,
            expectedVersion: project.version,
            additions,
            settings,
          },
          session?.token,
        ),
      );
      setNotice("方案已更新，请重新确认。");
    });
  }
  function confirm() {
    return perform("确认方案", async () => {
      if (!project || dirty) throw new Error("请先整理当前资料的方案");
      setProject(
        await confirmPlan(
          { projectId: project.id, expectedVersion: project.version },
          session?.token,
        ),
      );
      setNotice("当前版本已确认，可以提交制作请求。");
    });
  }
  function generate() {
    return perform("提交制作请求", async () => {
      if (!project || dirty) throw new Error("资料已改变，请重新整理并确认");
      const result = await generateGame(
        { projectId: project.id, expectedVersion: project.version },
        session?.token,
      );
      setProject(result.project);
      navigate(`/production/${result.project.id}`, {
        state: { buildStatus: result.status },
      });
    });
  }
  function recoverOlderDraft() {
    if (olderDraft) patch(olderDraft);
    setOlderDraft(null);
  }
  return {
    input,
    patch,
    project,
    genres,
    session,
    busy,
    error,
    notice,
    ready,
    dirty,
    save,
    prepare,
    revise,
    confirm,
    generate,
    olderDraft,
    recoverOlderDraft,
    reload: () => setAttempt((v) => v + 1),
  };
}
