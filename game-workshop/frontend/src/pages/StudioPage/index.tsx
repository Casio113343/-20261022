import {
  ArrowRight,
  Save,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";
import { useStudio } from "./hooks/useStudio";
import { GenrePanel } from "./components/GenrePanel";
import { WorldPanel } from "./components/WorldPanel";
import { CharactersPanel } from "./components/CharactersPanel";
import { PlanPanel } from "./components/PlanPanel";
import { primary, secondary } from "../../components/ui/Field";
export default function StudioPage() {
  const s = useStudio();
  const genre = s.genres.find((g) => g.id === s.input.genreId);
  return (
    <>
      <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="text-xs text-muted">
          工作空间 <span className="mx-2 text-line">/</span>
          <span className="text-ink">
            {s.project ? "编辑游戏" : "新建游戏"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">
            {s.project
              ? `v${s.project.version} · ${s.dirty ? "有未保存修改" : "已保存"}`
              : "尚未保存"}
          </span>
          <button
            type="button"
            className={secondary}
            disabled={!!s.busy || !s.ready}
            onClick={() => void s.save()}
          >
            <Save size={15} />
            保存草稿
          </button>
        </div>
      </header>
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          本地规则原型 · 图片生成未接入
        </div>
        <h1 className="text-3xl font-semibold leading-snug tracking-tight lg:text-[36px]">
          把你的世界，
          <br className="md:hidden" />
          变成可玩的游戏<span className="text-accent">。</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          从熟悉的玩法出发，加入你的世界观与角色。
          <br />
          你提供想法，我们把它整理成方案，再制作对应美术与可玩的图形游戏。
        </p>
      </div>
      {(s.error || s.notice) && (
        <div
          role={s.error ? "alert" : "status"}
          className={`sticky top-3 z-20 mb-5 rounded-xl border p-4 text-sm shadow-sm ${s.error ? "border-red-200 bg-red-50 text-red-800" : "border-mint/20 bg-white text-mint"}`}
        >
          {s.error || s.notice}
          {s.error && !s.ready && (
            <button className="ml-3 underline" onClick={s.reload}>
              重新连接
            </button>
          )}
        </div>
      )}
      {s.olderDraft && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          检测到较早版本的本地草稿。当前显示服务端新版本，未自动覆盖。
          <button className="ml-3 underline" onClick={s.recoverOlderDraft}>
            恢复本地内容并重新审阅
          </button>
        </div>
      )}
      {s.project && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-xs text-muted">
          <span>规则修改默认保留已有美术。外观变更请明确选择素材。</span>
          <a
            className="text-mint underline"
            href={`/production/${s.project.id}`}
          >
            前往制作与美术管理
          </a>
        </div>
      )}
      {!s.ready ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-sm text-muted">
          {s.error ? "请确认本地后端已启动。" : "正在连接创作服务…"}
        </div>
      ) : (
        <div className="grid items-start gap-9 xl:grid-cols-[minmax(0,1fr)_240px]">
          <main className="min-w-0 space-y-10" aria-busy={!!s.busy}>
            <fieldset disabled={!!s.busy} className="min-w-0 space-y-10">
              <GenrePanel
                input={s.input}
                genres={s.genres}
                onChange={s.patch}
              />
              <WorldPanel
                world={s.input.world}
                token={s.session?.token}
                onChange={(world) => s.patch({ ...s.input, world })}
              />
              <CharactersPanel
                characters={s.input.characters}
                token={s.session?.token}
                onChange={(characters) => s.patch({ ...s.input, characters })}
              />
            </fieldset>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-line">
              <div>
                <h3 className="text-sm font-semibold">想法准备好了？</h3>
                <p className="mt-1 text-xs text-muted">
                  不完整的部分也可以先留白。
                </p>
              </div>
              <button
                type="button"
                className={primary}
                disabled={!!s.busy}
                onClick={() => void s.prepare()}
              >
                {s.busy || "整理游戏方案"}
                <ArrowRight size={16} />
              </button>
            </div>
            <PlanPanel
              plan={s.project?.plan ?? null}
              genre={genre}
              sourceGenreName={
                s.genres.find((g) => g.id === s.project?.plan?.source.genreId)
                  ?.name
              }
              dirty={s.dirty}
              busy={!!s.busy}
              onRevise={(a, r) => void s.revise(a, r)}
              onConfirm={() => void s.confirm()}
              onGenerate={() => void s.generate()}
            />
          </main>
          <aside className="sticky top-6 hidden space-y-5 xl:block">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] tracking-[.2em] text-white/45">
                  YOUR BLUEPRINT
                </span>
                <Sparkles size={15} className="text-[#edb986]" />
              </div>
              <h2 className="text-lg font-medium break-words">
                {s.input.title || "尚未命名的世界"}
              </h2>
              <p className="mt-2 text-xs text-white/50">
                {genre?.name} / 创作草稿
              </p>
              <div className="my-5 h-px bg-white/10" />
              <div className="space-y-4">
                {[
                  { n: "01", label: "选择玩法", done: true, id: "gameplay" },
                  {
                    n: "02",
                    label: "补充世界观",
                    done: !!s.input.world.background,
                    id: "world",
                  },
                  {
                    n: "03",
                    label: "设计人物",
                    done: s.input.characters.length > 0,
                    id: "characters",
                  },
                  {
                    n: "04",
                    label: "确认方案",
                    done: !!s.project?.plan?.confirmed && !s.dirty,
                    id: "plan",
                  },
                ].map((item) => (
                  <a
                    key={item.n}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 text-xs text-white/75"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${item.done ? "bg-[#b5d7ba] text-ink" : "border border-white/20 text-white/40"}`}
                    >
                      {item.done ? <Check size={12} /> : item.n}
                    </span>
                    {item.label}
                  </a>
                ))}
              </div>
              <p className="mt-6 text-[11px] leading-6 text-white/45">
                世界观与人物为选填。
                <br />
                参考游戏或模式为必填。
              </p>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <ShieldCheck size={20} className="mb-3 text-mint" />
              <h3 className="text-xs font-semibold">你始终拥有决定权</h3>
              <p className="mt-2 text-xs leading-6 text-muted">
                系统补充会单独展示。确认之前，随时可以返回修改。
              </p>
            </div>
            <a
              href="#plan"
              className="flex items-center justify-center gap-2 text-xs text-muted"
            >
              前往方案预览
              <ArrowDown size={13} />
            </a>
          </aside>
        </div>
      )}
    </>
  );
}
