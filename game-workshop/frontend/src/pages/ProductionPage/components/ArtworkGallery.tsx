import { Link } from "react-router-dom";
import { useState } from "react";
import { Image, Layers, ShieldCheck } from "lucide-react";
import type { ArtworkManifest, ArtworkSlot } from "../../../objects/workshop";
import {
  currentRevision,
  kindLabels,
  latestTask,
  taskLabels,
} from "../functions/artwork";
import { ArtworkImage } from "../../../components/ui/ArtworkImage";
import { secondary } from "../../../components/ui/Field";
export function ArtworkGallery({
  manifest,
  token,
  busy,
  onRestore,
}: {
  manifest: ArtworkManifest;
  token: string;
  busy: boolean;
  onRestore: (revisionId: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kind, setKind] = useState("all");
  const slots = manifest.slots.filter((s) => s.active);
  const kinds = [...new Set(slots.map((s) => s.kind))];
  function card(slot: ArtworkSlot) {
    const revision = currentRevision(manifest, slot);
    const task = latestTask(manifest, slot.id);
    const history = manifest.history.filter((r) => r.slotId === slot.id);
    return (
      <article
        key={slot.id}
        className="overflow-hidden rounded-2xl border border-line bg-white"
      >
        <div className="relative flex h-48 items-center justify-center bg-paper/80">
          {revision ? (
            <ArtworkImage
              assetId={revision.processedAssetId}
              token={token}
              alt={`${slot.subject || slot.id}成品`}
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted/60">
              <Image size={29} strokeWidth={1.3} />
              <span className="text-xs">尚未生成图片</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-md border border-line bg-white/95 px-2 py-1 text-[10px] text-muted">
            {kindLabels[slot.kind] ?? slot.kind}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">
              {slot.subject || "未命名素材"}
            </h3>
            <span
              className={`shrink-0 text-[10px] ${revision ? "text-mint" : "text-muted"}`}
            >
              {task ? taskLabels[task.status] : revision ? "已保存" : "未开始"}
            </span>
          </div>
          {revision ? (
            <p className="flex items-center gap-1 text-[11px] text-mint">
              <ShieldCheck size={12} />
              已保存 · 普通修改继续复用
            </p>
          ) : (
            <p className="text-xs leading-5 text-muted">
              生成后会在这里显示成品。参考图片不会被当作生成结果。
            </p>
          )}
          <button
            className="flex items-center gap-1.5 text-xs text-muted hover:text-mint"
            onClick={() => setExpanded(expanded === slot.id ? null : slot.id)}
          >
            <Layers size={13} />
            {expanded === slot.id
              ? "收起详情"
              : `素材与历史${history.length ? ` (${history.length})` : ""}`}
          </button>
          {expanded === slot.id && (
            <div className="space-y-4 border-t border-line pt-3">
              {revision && (
                <>
                  <p className="break-all text-[10px] leading-5 text-muted">
                    成品指纹：{revision.processedHash.slice(0, 16)}…<br />
                    来源：
                    {revision.provider.startsWith("test-")
                      ? "测试素材，非正式美术"
                      : revision.provider}
                  </p>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted">
                      查看生成原图
                    </summary>
                    <ArtworkImage
                      assetId={revision.originalAssetId}
                      token={token}
                      alt={`${slot.subject}生成原图`}
                      className="mt-2 max-h-80 w-full rounded-lg object-contain"
                    />
                  </details>
                </>
              )}
              <details>
                <summary className="cursor-pointer text-xs text-muted">
                  美术需求（不是生成结果）
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-muted">
                  {slot.brief.prompt}
                </p>
              </details>
              {history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-medium">历史版本</h4>
                  {[...history].reverse().map((r, i) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-line p-3"
                    >
                      <p className="text-xs">
                        {i === 0
                          ? "最近生成"
                          : `较早版本 ${history.length - i}`}{" "}
                        ·{" "}
                        {new Date(r.createdAt).toLocaleString("zh-CN", {
                          timeZone: "Asia/Shanghai",
                        })}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted">
                        {r.instruction}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-muted">
                          预览此版本
                        </summary>
                        <ArtworkImage
                          assetId={r.processedAssetId}
                          token={token}
                          alt={`${slot.subject}历史版本`}
                          className="mt-2 max-h-60 w-full object-contain"
                        />
                      </details>
                      <Link
                        className="mt-2 block text-xs text-mint underline"
                        to={`/services?sourceProject=${manifest.projectId}&revision=${r.id}&title=${encodeURIComponent(slot.subject || "美术素材")}`}
                      >
                        保存此生成素材到创作资源库
                      </Link>
                      {r.id === slot.currentRevisionId ? (
                        <span className="mt-2 inline-block text-xs text-mint">
                          当前使用
                        </span>
                      ) : (
                        <button
                          disabled={busy}
                          className={`${secondary} mt-2 py-1.5 text-xs`}
                          onClick={() => onRestore(r.id)}
                        >
                          恢复此图，保留其他素材
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  }
  return (
    <section className="space-y-5" id="artwork">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-[10px] tracking-widest text-accent">
            ART LIBRARY
          </p>
          <h2 className="text-xl font-semibold">这款游戏的美术</h2>
          <p className="mt-2 text-xs leading-6 text-muted">
            原图、加工成品和历史版本分别保留。未提及的视觉内容默认不变。
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...kinds].map((k) => (
            <button
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-lg px-3 py-1.5 text-xs ${kind === k ? "bg-ink text-white" : "border border-line bg-white text-muted"}`}
            >
              {k === "all" ? "全部" : (kindLabels[k] ?? k)}
            </button>
          ))}
        </div>
      </div>
      {slots.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {slots.filter((s) => kind === "all" || s.kind === kind).map(card)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line px-5 py-12 text-center">
          <Image className="mx-auto mb-3 text-muted/50" size={28} />
          <p className="text-sm text-muted">还没有美术任务</p>
          <p className="mt-2 text-xs text-muted">
            确认方案后点击「开始制作」，后端将按这款游戏的设定建立所需任务。
          </p>
        </div>
      )}
    </section>
  );
}
