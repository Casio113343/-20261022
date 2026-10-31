import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight, Trash2, FolderOpen } from "lucide-react";
import { openSession } from "../../system/api/client";
import { listProjects } from "../../apis/projects/ListProjectsMessage";
import { deleteProject } from "../../apis/projects/DeleteProjectMessage";
import type { Project } from "../../objects/workshop";
import { primary } from "../../components/ui/Field";
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setBusy(true);
    setError("");
    try {
      const s = await openSession();
      setProjects(await listProjects({}, s.token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function remove(p: Project) {
    if (!confirm(`删除「${p.input.title || "未命名游戏"}」？`)) return;
    setBusy(true);
    try {
      const s = await openSession();
      await deleteProject({ projectId: p.id }, s.token);
      setProjects((old) => old.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="mb-2 text-xs tracking-widest text-accent">
            YOUR PROJECTS
          </p>
          <h1 className="text-3xl font-semibold">我的作品</h1>
        </div>
        <Link className={primary} to="/studio">
          <Plus size={16} />
          新建游戏
        </Link>
      </div>
      <p className="mb-6 text-sm leading-6 text-muted">
        当前浏览器访客身份下的最近100个作品，保存于本机
        PostgreSQL。清除浏览器会话会失去访问凭据。
      </p>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
          <button onClick={() => void load()} className="ml-3 underline">
            重试
          </button>
        </p>
      )}
      {busy && <p className="text-muted">正在处理…</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <article
            className="rounded-2xl border border-line bg-white p-6"
            key={p.id}
          >
            <div className="mb-6 flex justify-between">
              <FolderOpen className="text-mint" />
              <span className="rounded-md bg-paper px-2 py-1 text-[10px] text-muted">
                {p.artifact?.artworkBindings?.length
                  ? "有美术原型"
                  : p.plan?.confirmed
                    ? "已确认"
                    : p.plan
                      ? "待确认"
                      : "草稿"}{" "}
                · v{p.version}
              </span>
            </div>
            <h2 className="break-words text-lg font-semibold">
              {p.input.title || "未命名游戏"}
            </h2>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted">
              {p.input.reference || "还没有填写参考玩法"}
            </p>
            <div className="mt-6 flex items-center gap-4 border-t border-line pt-4 text-xs">
              <Link
                to={`/studio?project=${p.id}`}
                className="flex items-center gap-1 text-mint"
              >
                继续创作
                <ArrowUpRight size={14} />
              </Link>
              <Link className="text-accent" to={`/production/${p.id}`}>
                制作与美术
              </Link>
              <button
                aria-label={`删除${p.input.title || "未命名游戏"}`}
                disabled={busy}
                onClick={() => void remove(p)}
                className="ml-auto text-muted"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!busy && projects.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          还没有作品，去创造第一个世界吧。
        </div>
      )}
    </main>
  );
}
