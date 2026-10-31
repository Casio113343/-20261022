import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type {
  CreativeResource,
  ResourceLink,
  ResourceVersion,
} from "../../../objects/library";
import type { Project, ArtworkManifest } from "../../../objects/workshop";
import { listResources } from "../../../apis/library/ListResourcesMessage";
import { listProjectResources } from "../../../apis/library/ListProjectResourcesMessage";
import { getArtworkManifest } from "../../../apis/artwork/GetArtworkManifestMessage";
import { Field, secondary } from "../../../components/ui/Field";
export function ResourceConnector({
  project,
  token,
  busy,
  dirty,
  onAttach,
}: {
  project: Project | null;
  token?: string;
  busy: boolean;
  dirty: boolean;
  onAttach: (
    id: string,
    version: number,
    target: string,
    revision: number,
  ) => Promise<void>;
}) {
  const [data, setData] = useState<Readonly<{
    resources: readonly CreativeResource[];
    links: readonly ResourceLink[];
    manifest: ArtworkManifest | null;
  }> | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState("");
  const [version, setVersion] = useState(0);
  const [target, setTarget] = useState("");
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    if (token)
      Promise.all([
        listResources({}, token),
        project
          ? listProjectResources({ projectId: project.id }, token)
          : Promise.resolve([]),
        project
          ? getArtworkManifest({ projectId: project.id }, token)
          : Promise.resolve(null),
      ])
        .then(([resources, links, manifest]) => {
          if (active) setData({ resources, links, manifest });
        })
        .catch((e) => {
          if (active)
            setError(e instanceof Error ? e.message : "资源库暂时无法读取");
        });
    return () => {
      active = false;
    };
  }, [project?.id, project?.version, token, attempt]);
  const resource = data?.resources.find((r) => r.id === selected);
  const v =
    resource?.history.find((v) => v.version === version) ??
    resource?.history.at(-1);
  function targets(
    r: CreativeResource,
    v: ResourceVersion,
  ): readonly Readonly<{ id: string; label: string }>[] {
    const base =
      v.data.kind === "world"
        ? [{ id: "world", label: "替换世界观（含参考图）" }]
        : v.data.kind === "character"
          ? [
              {
                id: `character:library-${r.id}`,
                label: "新增 / 更新此资源对应人物",
              },
              ...(project?.input.characters
                .filter((c) => c.id !== `library-${r.id}`)
                .map((c) => ({
                  id: `character:${c.id}`,
                  label: `替换人物：${c.name || c.id}`,
                })) ?? []),
            ]
          : v.data.kind === "promo"
            ? [
                {
                  id: `presentation:${r.id}`,
                  label: "游戏展示资料（不进入规则）",
                },
              ]
            : [
                {
                  id: `requirements:${r.id}`,
                  label: "添加 / 更新到玩法要求（不会自动执行）",
                },
              ];
    return [
      ...base,
      ...(v.artwork
        ? (data?.manifest?.slots
            .filter((s) => s.active && s.kind === v.artworkKind)
            .map((s) => ({
              id: `slot:${s.id}`,
              label: `复用图片：${s.subject || s.id}`,
            })) ?? [])
        : []),
    ];
  }
  const options = resource && v ? targets(resource, v) : [];
  const activeTarget = options.some((o) => o.id === target)
    ? target
    : (options[0]?.id ?? "");
  async function attach(r: CreativeResource, v: ResourceVersion, t: string) {
    if (
      !window.confirm(
        `将“${v.data.title}”v${v.version} 接入此位置。已有对应内容或图片会被替换，需要重新确认方案。其他素材保留。是否继续？`,
      )
    )
      return;
    await onAttach(r.id, v.version, t, data?.manifest?.revision ?? 0);
  }
  return (
    <section className="space-y-4 rounded-2xl border border-mint/25 bg-mint/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">连接你的小服务成果</h2>
        <Link className="text-xs text-mint underline" to="/library">
          打开创作资源库
        </Link>
      </div>
      <p className="text-xs leading-6 text-muted">
        每次接入具体版本，不随资源库自动更新。世界观和人物会替换所选位置；制作要求作为文字资料接入。生成图片只匹配相同用途，不合适的素材需要另行加工。
      </p>
      {error ? (
        <p role="alert" className="text-sm text-red-800">
          {error}
          <button
            className="ml-3 underline"
            onClick={() => setAttempt((a) => a + 1)}
          >
            重试
          </button>
        </p>
      ) : !data ? (
        <p className="text-sm text-muted">正在读取资源库…</p>
      ) : (
        <>
          {!data.resources.length ? (
            <p className="text-sm text-muted">
              还没有成果。去
              <Link className="mx-1 text-mint underline" to="/services">
                小服务创作
              </Link>
              保存第一项。
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="选择成果">
                  <select
                    value={selected}
                    disabled={busy}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setVersion(0);
                      setTarget("");
                    }}
                  >
                    <option value="">请选择</option>
                    {data.resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.history.at(-1)?.data.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="固定版本">
                  <select
                    disabled={!resource || busy}
                    value={v?.version ?? ""}
                    onChange={(e) => setVersion(Number(e.target.value))}
                  >
                    {resource?.history.map((v) => (
                      <option key={v.version} value={v.version}>
                        v{v.version}
                        {v.version === resource.version ? " · 最新" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="接入位置">
                  <select
                    value={activeTarget}
                    disabled={!v || busy}
                    onChange={(e) => setTarget(e.target.value)}
                  >
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {v && (
                <p className="whitespace-pre-wrap text-xs leading-6 text-muted">
                  {v.data.description ||
                    v.data.content ||
                    v.data.character?.name ||
                    v.data.world?.background}{" "}
                  {v.artwork
                    ? "含已生成并加工的素材。"
                    : "没有生成图片；不会将参考图当作正式素材。"}
                </p>
              )}
              <button
                className={secondary}
                disabled={
                  !project || dirty || busy || !resource || !v || !activeTarget
                }
                onClick={() => {
                  if (resource && v) void attach(resource, v, activeTarget);
                }}
              >
                将所选版本接入工作台
              </button>
              {(!project || dirty) && (
                <p className="text-xs text-amber-900">
                  请先保存当前游戏草稿，再接入资源；避免覆盖尚未保存的填写内容。
                </p>
              )}
            </div>
          )}
          {data.links.length > 0 && (
            <div className="space-y-3 border-t border-mint/20 pt-4">
              <h3 className="text-sm font-semibold">本游戏已接入的版本</h3>
              {data.links.map((link) => {
                const latest = data.resources.find(
                  (r) => r.id === link.resourceId,
                );
                const newest = latest?.history.at(-1);
                return (
                  <div
                    key={link.target}
                    className="rounded-xl bg-white p-3 text-xs leading-6"
                  >
                    <Link
                      className="text-mint underline"
                      to={`/library?id=${link.resourceId}`}
                    >
                      {link.title}
                    </Link>{" "}
                    · 固定 v{link.version} · {link.target}
                    <p className="text-muted">
                      这是接入时的来源记录。工作台中的后续手工修改独立保存。
                    </p>
                    {latest && newest && latest.version > link.version && (
                      <button
                        className="text-accent underline"
                        disabled={busy || dirty}
                        onClick={() => void attach(latest, newest, link.target)}
                      >
                        发现 v{latest.version}，明确更新此位置
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
