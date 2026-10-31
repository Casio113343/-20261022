import type { ResourceData, CreativeResource } from "../../../objects/library";
import { resourceKinds } from "../../../objects/library";
import { Field, primary } from "../../../components/ui/Field";
import { ImagePicker } from "../../../components/ui/ImagePicker";
import { ArtworkImage } from "../../../components/ui/ArtworkImage";
export function ResourceEditor({
  draft,
  onChange,
  current,
  busy,
  token,
  onSave,
}: {
  draft: ResourceData;
  onChange: (d: ResourceData) => void;
  current: CreativeResource | null;
  busy: boolean;
  token?: string;
  onSave: () => void;
}) {
  const service = resourceKinds.find((k) => k.id === draft.kind);
  return (
    <section className="space-y-5 rounded-2xl border border-line bg-white p-5 md:p-7">
      <div>
        <p className="text-xs text-accent">独立创作 / {service?.name}</p>
        <h2 className="mt-2 text-xl font-semibold">
          {current ? "继续修改成果" : "创作一项新成果"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {service?.output} 保存会建立新版本；选用后不会自动覆盖游戏。
        </p>
      </div>
      <fieldset disabled={busy} className="space-y-5">
        <Field label="成果名称">
          <input
            maxLength={120}
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
          />
        </Field>
        <Field label="创作需求 / 介绍">
          <textarea
            rows={3}
            maxLength={6000}
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
          />
        </Field>
        {draft.world && (
          <div className="space-y-4">
            {(
              [
                ["background", "世界背景"],
                ["conflict", "地域、阵营与冲突"],
                ["rules", "世界规则"],
                ["visual", "视觉氛围"],
                ["preserve", "必须保留"],
                ["freedom", "允许补充"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <textarea
                  rows={2}
                  maxLength={6000}
                  value={draft.world![key]}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      world: { ...draft.world!, [key]: e.target.value },
                    })
                  }
                />
              </Field>
            ))}
            <ImagePicker
              images={draft.world.images}
              limit={6}
              token={token}
              onChange={(images) =>
                onChange({ ...draft, world: { ...draft.world!, images } })
              }
            />
          </div>
        )}
        {draft.character && (
          <div className="space-y-4">
            {(
              [
                ["name", "人物名称"],
                ["identity", "身份"],
                ["faction", "阵营"],
                ["background", "背景经历"],
                ["personality", "性格"],
                ["catchphrase", "口头禅"],
                ["relationships", "人物关系"],
                ["skills", "技能 / 武器"],
                ["role", "玩法定位"],
                ["preserve", "必须保留"],
                ["freedom", "允许补充"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <textarea
                  rows={2}
                  maxLength={6000}
                  value={draft.character![key]}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      character: { ...draft.character!, [key]: e.target.value },
                    })
                  }
                />
              </Field>
            ))}
            <ImagePicker
              images={draft.character.images}
              limit={3}
              token={token}
              onChange={(images) =>
                onChange({
                  ...draft,
                  character: { ...draft.character!, images },
                })
              }
            />
          </div>
        )}
        <Field
          label={
            draft.kind === "skill"
              ? "效果、代价、冷却与参考玩法"
              : "成果内容 / 制作和加工说明"
          }
        >
          <textarea
            rows={5}
            maxLength={6000}
            value={draft.content}
            onChange={(e) => onChange({ ...draft, content: e.target.value })}
          />
        </Field>
        {draft.source && (
          <div className="rounded-xl bg-paper p-4 text-xs leading-6">
            将保存所选生成美术的确切版本；原图和加工图一起保留。
            <button
              type="button"
              className="ml-3 text-mint underline"
              onClick={() => onChange({ ...draft, source: null })}
            >
              移除素材关联
            </button>
          </div>
        )}
        <button className={primary} type="button" onClick={onSave}>
          {busy ? "正在保存…" : current ? "保存为新版本" : "保存到创作资源库"}
        </button>
      </fieldset>
      {current && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm">
            查看已保存的版本（共 {current.history.length} 个）
          </summary>
          <div className="mt-4 space-y-3">
            {[...current.history].reverse().map((v) => (
              <article
                key={v.version}
                className="rounded-xl bg-paper p-4 text-sm"
              >
                <p className="font-semibold">
                  v{v.version} · {v.data.title}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-muted">
                  {v.data.description}
                  {v.data.content}
                  {v.data.character?.name} {v.data.character?.personality}
                  {v.data.world?.background}
                </p>
                {v.artwork && token && (
                  <ArtworkImage
                    token={token}
                    assetId={v.artwork.processedAssetId}
                    alt="已保存的生成素材"
                    className="mt-3 h-40 w-full object-contain"
                  />
                )}
                <button
                  type="button"
                  disabled={busy}
                  className="mt-3 text-xs text-mint underline"
                  onClick={() => onChange(v.data)}
                >
                  以此版本继续编辑
                </button>
              </article>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
