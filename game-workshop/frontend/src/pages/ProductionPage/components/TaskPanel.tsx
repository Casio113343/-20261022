import { useEffect, useState } from "react";
import { RotateCcw, Play, CheckCircle2, Clock3 } from "lucide-react";
import type { ArtworkManifest, ArtworkTask } from "../../../objects/workshop";
import { taskLabels } from "../functions/artwork";
import { secondary } from "../../../components/ui/Field";
export function TaskPanel({
  manifest,
  busy,
  onRetry,
  onProcess,
}: {
  manifest: ArtworkManifest;
  busy: boolean;
  onRetry: (id: string) => void;
  onProcess: (id: string) => void;
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);
  const tasks = manifest.tasks.filter(
    (t) =>
      t.status !== "obsolete" &&
      manifest.slots.some((s) => s.active && s.id === t.slotId),
  );
  const failures = tasks.filter((t) => t.status === "failed").length;
  function row(task: ArtworkTask) {
    const retryable =
      ["failed", "blocked"].includes(task.status) ||
      (task.status === "running" && task.leaseUntil <= now);
    return (
      <div
        key={task.id}
        className="flex flex-wrap items-center gap-3 border-t border-line py-4 first:border-t-0"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${task.status === "succeeded" ? "bg-mint/10 text-mint" : task.status === "failed" ? "bg-red-50 text-red-700" : "bg-paper text-muted"}`}
        >
          {task.status === "succeeded" ? (
            <CheckCircle2 size={16} />
          ) : (
            <Clock3 size={16} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {task.brief.subject || "未命名素材"}
            <span className="ml-2 text-[10px] font-normal text-muted">
              {task.operation === "edit" ? "局部编辑" : "首次生成"}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {taskLabels[task.status]} · 已尝试 {task.attempts} 次
            {task.error && (
              <span className="ml-2">
                {task.status === "blocked"
                  ? "图片服务尚未配置，任务已保留"
                  : "可重试，旧图和其他素材已保留"}
              </span>
            )}
          </p>
        </div>
        {retryable ? (
          <button
            disabled={busy}
            className={`${secondary} py-2 text-xs`}
            onClick={() => onRetry(task.id)}
          >
            <RotateCcw size={12} />
            只重试此任务
          </button>
        ) : task.status === "pending" ? (
          <button
            disabled={busy}
            className={`${secondary} py-2 text-xs`}
            onClick={() => onProcess(task.id)}
          >
            <Play size={12} />
            处理此素材
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">制作任务</h2>
        <span className="text-xs text-muted">
          {failures
            ? `${failures} 项失败 · 支持单独重试`
            : "按服务端实际状态显示"}
        </span>
      </div>
      {tasks.length ? (
        <div>{[...tasks].reverse().map(row)}</div>
      ) : (
        <p className="py-5 text-sm text-muted">尚未开始制作。</p>
      )}
    </section>
  );
}
