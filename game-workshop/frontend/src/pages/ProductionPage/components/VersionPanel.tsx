import { Link } from "react-router-dom";
import { History, ArrowUpRight } from "lucide-react";
import type { Project } from "../../../objects/workshop";
import { hasPlayableBindings } from "../functions/artwork";
export function VersionPanel({ versions }: { versions: readonly Project[] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <History size={18} />
        已组装的版本
      </h2>
      <p className="mt-2 text-xs leading-6 text-muted">
        每个版本保留当时的规则和素材绑定。恢复某张图请在上方素材历史中操作。
      </p>
      {versions.length ? (
        <div className="mt-4 divide-y divide-line">
          {versions.map(
            (p) =>
              p.artifact && (
                <div
                  key={p.artifact.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.input.title || "未命名游戏"} · 方案 v{p.version}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {new Date(p.updatedAt).toLocaleString("zh-CN", {
                        timeZone: "Asia/Shanghai",
                      })}{" "}
                      · {p.artifact.artworkBindings?.length ?? 0} 项素材绑定
                    </p>
                  </div>
                  {hasPlayableBindings(p.artifact) && (
                    <Link
                      to={`/play/${p.id}?version=${p.artifact.id}`}
                      className="flex items-center gap-1 text-xs text-mint"
                    >
                      加载此版本
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
              ),
          )}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">
          美术就绪并完成组装后，版本会出现在这里。
        </p>
      )}
    </section>
  );
}
