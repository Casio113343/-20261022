import { useEffect, useState } from "react";
import { Check, Play, FileCheck2 } from "lucide-react";
import type {
  DesignPlan,
  PlanSection,
  RuntimeSettings,
  Genre,
} from "../../../objects/workshop";
import { Field, primary, secondary } from "../../../components/ui/Field";
export function PlanPanel({
  plan,
  dirty,
  busy,
  genre,
  sourceGenreName,
  onRevise,
  onConfirm,
  onGenerate,
}: {
  plan: DesignPlan | null;
  dirty: boolean;
  busy: boolean;
  genre?: Genre;
  sourceGenreName?: string;
  onRevise: (a: readonly PlanSection[], s: RuntimeSettings) => void;
  onConfirm: () => void;
  onGenerate: () => void;
}) {
  const [additions, setAdditions] = useState<readonly PlanSection[]>(
    plan?.additions ?? [],
  );
  const [settings, setSettings] = useState<RuntimeSettings>(
    plan?.settings ?? { difficulty: 2, rounds: 5 },
  );
  useEffect(() => {
    setAdditions(plan?.additions ?? []);
    setSettings(plan?.settings ?? { difficulty: 2, rounds: 5 });
  }, [plan]);
  const edited =
    !!plan &&
    (JSON.stringify(additions) !== JSON.stringify(plan.additions) ||
      JSON.stringify(settings) !== JSON.stringify(plan.settings));
  return (
    <section
      id="plan"
      className="scroll-mt-6 space-y-5 border-t border-line pt-9"
    >
      <div>
        <div className="mb-2 text-xs font-semibold tracking-widest text-accent">
          04 / REVIEW & BUILD
        </div>
        <h2 className="text-xl font-semibold">先确认，再让它运行</h2>
        <p className="mt-2 text-sm text-muted">
          你的设定和系统的补充，会在这里清楚分开。
        </p>
      </div>
      {!plan ? (
        <div className="rounded-2xl border border-line bg-white py-10 text-center">
          <FileCheck2 className="mx-auto mb-3 text-muted/50" size={28} />
          <p className="text-sm text-muted">填写玩法后，点击「整理游戏方案」</p>
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl px-4 py-3 text-xs ${dirty ? "bg-amber-50 text-amber-800" : plan.confirmed ? "bg-mint/10 text-mint" : "bg-paper text-muted"}`}
          >
            {dirty
              ? "原始资料已修改：旧方案与技能设计需要重新整理。"
              : plan.confirmed
                ? `已确认 · 方案版本 ${plan.inputVersion}`
                : `待你确认 · 方案版本 ${plan.inputVersion}`}
          </div>
          <details className="rounded-xl border border-line bg-white p-4" open>
            <summary className="cursor-pointer text-sm font-semibold">
              用户提供的原始资料
            </summary>
            <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
              <p>
                类型：{sourceGenreName ?? plan.source.genreId} · 参考：
                {plan.source.reference}
              </p>
              <p>要求：{plan.source.requirements || "未填写"}</p>
              <p>世界背景：{plan.source.world.background || "未填写"}</p>
              <p>
                人物：
                {plan.source.characters
                  .map((c, i) => c.name || `人物${i + 1}`)
                  .join("、") || "未填写"}
              </p>
              <p className="text-xs">
                完整字段保留在上方世界观和人物区域，可以返回编辑。
              </p>
            </div>
          </details>
          <div className="rounded-2xl border border-mint/20 bg-mint/5 p-5">
            <h3 className="mb-4 text-sm font-semibold text-mint">
              模板建议补充 · 可编辑
            </h3>
            <div className="space-y-4">
              {additions.map((item, i) => (
                <Field key={i} label={item.title}>
                  <textarea
                    rows={2}
                    maxLength={6000}
                    value={item.content}
                    onChange={(e) =>
                      setAdditions(
                        additions.map((x, j) =>
                          j === i ? { ...x, content: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </Field>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="试玩难度">
                <select
                  value={settings.difficulty}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      difficulty: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>轻松</option>
                  <option value={2}>标准</option>
                  <option value={3}>挑战</option>
                </select>
              </Field>
              <Field
                label="目标数（3—10）"
                hint="RPG场数 / 塔防波数；其他类型不使用"
              >
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={settings.rounds}
                  onChange={(e) =>
                    setSettings({ ...settings, rounds: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              难度与目标数会影响运行。文字补充是设计资料，当前不会自动转换为新机制。
            </p>
            {edited && (
              <button
                type="button"
                disabled={busy || dirty}
                className={`${secondary} mt-4`}
                onClick={() => onRevise(additions, settings)}
              >
                保存方案修改
              </button>
            )}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <h3 className="text-xs font-semibold text-amber-900">
              生成前请了解
            </h3>
            <ul className="mt-2 space-y-1.5 pl-4 text-xs leading-6 text-amber-900/80">
              {plan.unresolved.map((s) => (
                <li className="list-disc" key={s}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || dirty || edited || plan.confirmed}
              className={secondary}
              onClick={onConfirm}
            >
              <Check size={16} />
              {plan.confirmed ? "方案已确认" : "确认当前方案"}
            </button>
            <button
              type="button"
              disabled={
                busy ||
                dirty ||
                edited ||
                !plan.confirmed ||
                genre?.support !== "prototype"
              }
              className={primary}
              onClick={onGenerate}
            >
              <Play size={16} />
              确认后制作游戏
            </button>
          </div>
        </>
      )}
    </section>
  );
}
