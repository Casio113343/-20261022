import { useState } from "react";
import { Paintbrush, ShieldCheck } from "lucide-react";
import type { ArtworkManifest } from "../../../objects/workshop";
import { Field, primary } from "../../../components/ui/Field";
import { kindLabels, validateVisualEdit } from "../functions/artwork";
export function VisualEditPanel({
  manifest,
  busy,
  onSubmit,
}: {
  manifest: ArtworkManifest;
  busy: boolean;
  onSubmit: (ids: readonly string[], instruction: string) => Promise<boolean>;
}) {
  const [ids, setIds] = useState<readonly string[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const candidates = manifest.slots.filter(
    (s) => s.active && s.currentRevisionId,
  );
  const selected = ids.filter((id) => candidates.some((s) => s.id === id));
  async function submit() {
    const invalid = validateVisualEdit(selected, text);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    if (await onSubmit(selected, text)) {
      setIds([]);
      setText("");
    }
  }
  return (
    <section
      className="rounded-2xl border border-mint/20 bg-mint/5 p-5 md:p-6"
      id="visual-edit"
    >
      <div className="flex items-center gap-2">
        <Paintbrush size={18} className="text-mint" />
        <h2 className="text-lg font-semibold">只改你提到的画面</h2>
      </div>
      <p className="mt-2 text-xs leading-6 text-muted">
        改伤害、波次或名字，请返回工作台修改规则。这里仅提交明确的视觉变化，其他素材保持原样。
      </p>
      {!candidates.length ? (
        <p className="mt-5 rounded-xl bg-white p-4 text-sm text-muted">
          图片生成完成后，才可以选择原图进行局部编辑。
        </p>
      ) : (
        <>
          <fieldset disabled={busy} className="mt-5 space-y-4">
            <legend className="mb-3 text-sm font-medium">选择要改的素材</legend>
            <div className="flex flex-wrap gap-2">
              {candidates.map((slot) => {
                const pending = manifest.tasks.some(
                  (t) =>
                    t.slotId === slot.id &&
                    ["pending", "running", "blocked", "failed"].includes(
                      t.status,
                    ),
                );
                return (
                  <label
                    key={slot.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs ${selected.includes(slot.id) ? "border-mint text-mint" : "border-line text-muted"}`}
                  >
                    <input
                      className="h-3.5 w-3.5 accent-mint"
                      type="checkbox"
                      checked={selected.includes(slot.id)}
                      disabled={pending}
                      onChange={(e) =>
                        setIds(
                          e.target.checked
                            ? [...selected, slot.id]
                            : selected.filter((id) => id !== slot.id),
                        )
                      }
                    />
                    {slot.subject || kindLabels[slot.kind]}
                    {pending && <span>（有待处理任务）</span>}
                  </label>
                );
              })}
            </div>
            <Field label="视觉修改与保留要求" required>
              <textarea
                rows={3}
                maxLength={6000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="例如：只把这名角色的外套改为红色；脸、发型、姿态和其他角色都保持原样。"
              />
            </Field>
          </fieldset>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-mint">
              <ShieldCheck size={14} />
              将修改 {selected.length} 项，其余{" "}
              {manifest.slots.filter((s) => s.active).length - selected.length}{" "}
              项保留
            </span>
            <button
              className={primary}
              disabled={busy}
              onClick={() => void submit()}
            >
              提交局部视觉修改
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
