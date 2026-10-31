import { Link, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Play,
  Check,
  Image,
  Package,
  FileCheck,
  Gamepad2,
} from "lucide-react";
import type { BuildStatus } from "../../objects/workshop";
import { useProduction } from "./hooks/useProduction";
import { ArtworkGallery } from "./components/ArtworkGallery";
import { VisualEditPanel } from "./components/VisualEditPanel";
import { TaskPanel } from "./components/TaskPanel";
import { VersionPanel } from "./components/VersionPanel";
import {
  summarizeArtwork,
  hasPlayableBindings,
  isBuildStatus,
} from "./functions/artwork";
import { secondary } from "../../components/ui/Field";
function ProductionWorkspace({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus?: BuildStatus;
}) {
  const p = useProduction(id);
  const data = p.state;
  const summary = data ? summarizeArtwork(data.manifest) : null;
  const confirmed =
    !!data?.project.plan?.confirmed &&
    data.project.plan.inputVersion === data.project.version;
  const playable =
    data?.project.artifact && hasPlayableBindings(data.project.artifact);
  const steps = [
    {
      title: "方案确认",
      detail: confirmed ? "已确认当前方案" : "请先返回工作台确认",
      done: confirmed,
      Icon: FileCheck,
    },
    {
      title: "美术生成与加工",
      detail: summary?.total
        ? `已生成 ${summary.completed} / ${summary.total} 项素材`
        : "等待建立任务",
      done: !!summary?.ready,
      Icon: Image,
    },
    {
      title: "游戏组装",
      detail: playable ? "已有绑定素材的配置" : "等待所需美术就绪",
      done: !!playable,
      Icon: Package,
    },
    {
      title: "图形试玩",
      detail: "进入试玩页检查图片加载",
      done: false,
      Icon: Gamepad2,
    },
  ];
  return (
    <main className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="mb-2 text-[10px] tracking-widest text-accent">
            BUILD & ARTWORK
          </p>
          <h1 className="text-3xl font-semibold">
            {data?.project.input.title || "游戏制作与美术"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            把想法制作出来，也把每一次修改保留下来。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={secondary} to={`/studio?project=${id}`}>
            <ArrowLeft size={15} />
            返回修改规则
          </Link>
          <button
            className={secondary}
            disabled={!!p.busy || !data}
            onClick={() => void p.refresh()}
          >
            <RefreshCw size={14} />
            刷新
          </button>
        </div>
      </header>
      {(p.error || p.notice) && (
        <div
          role={p.error ? "alert" : "status"}
          className={`rounded-xl border p-4 text-sm ${p.error ? "border-red-200 bg-red-50 text-red-800" : "border-mint/20 bg-white text-mint"}`}
        >
          {p.error || p.notice}
          {p.error && (
            <button
              className="ml-3 underline"
              disabled={!!p.busy}
              onClick={p.state ? () => void p.refresh() : p.reload}
            >
              重新读取服务端状态
            </button>
          )}
        </div>
      )}
      {p.pollError && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {p.pollError}
        </p>
      )}
      {!data ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">
          {p.error ? "读取失败，当前作品内容不会被清空。" : "正在读取制作资料…"}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map(({ title, detail, done, Icon }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${done ? "bg-mint/10 text-mint" : "bg-paper text-muted"}`}
                  >
                    {done ? <Check size={18} /> : <Icon size={18} />}
                  </span>
                  <span className="text-xs text-muted/50">0{i + 1}</span>
                </div>
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink p-6 text-white">
            <div>
              <h2 className="text-lg font-medium">
                {p.busy ||
                  ((p.result?.status ?? initialStatus) ===
                  "waiting_for_provider"
                    ? "制作请求已保存，等待图片服务"
                    : "按当前方案制作游戏")}
              </h2>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-white/55">
                每次制作都会检查所需美术。已有素材默认复用，失败项单独处理；所需图片齐备后才组装游戏。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-white/90 disabled:opacity-50"
                disabled={!!p.busy || !confirmed}
                onClick={() => void p.build()}
              >
                {p.busy
                  ? "正在处理…"
                  : summary?.total
                    ? "继续制作 / 复用现有美术"
                    : "开始制作"}
                <ArrowRight size={15} />
              </button>
              {playable && (
                <Link
                  to={`/play/${id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm"
                >
                  <Play size={15} />
                  加载已保存原型
                </Link>
              )}
            </div>
          </div>
          {(p.result?.status ?? initialStatus) === "waiting_for_provider" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              图片服务尚未接入，当前尚未完成美术生成，也没有制作完成的游戏。设定和任务已经保存；接入后可继续，不需要重新填写。
            </div>
          )}
          {!confirmed && (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              当前资料尚未确认，请先返回工作台整理并确认方案。已有美术仍然保留。
            </p>
          )}
          <ArtworkGallery
            manifest={data.manifest}
            token={data.session.token}
            busy={!!p.busy}
            onRestore={(id) => void p.restore(id)}
          />
          <VisualEditPanel
            manifest={data.manifest}
            busy={!!p.busy}
            onSubmit={p.edit}
          />
          <TaskPanel
            manifest={data.manifest}
            busy={!!p.busy}
            onRetry={(id) => void p.retryTask(id)}
            onProcess={(id) => void p.processTask(id)}
          />
          <VersionPanel versions={data.versions} />
        </>
      )}
    </main>
  );
}
export default function ProductionPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const status: unknown =
    typeof state === "object" && state !== null && "buildStatus" in state
      ? state.buildStatus
      : undefined;
  return (
    <ProductionWorkspace
      key={id}
      id={id ?? ""}
      initialStatus={isBuildStatus(status) ? status : undefined}
    />
  );
}
