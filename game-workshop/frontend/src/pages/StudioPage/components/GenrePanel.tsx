import { Swords, Castle, Layers, Compass, Check, Info } from "lucide-react";
import type { GameInput, Genre } from "../../../objects/workshop";
import { Field } from "../../../components/ui/Field";
export function GenrePanel({
  input,
  genres,
  onChange,
}: {
  input: GameInput;
  genres: readonly Genre[];
  onChange: (v: GameInput) => void;
}) {
  const genre = genres.find((g) => g.id === input.genreId);
  const icons = [Swords, Compass, Castle, Layers];
  return (
    <section id="gameplay" className="scroll-mt-6 space-y-6">
      <div>
        <div className="mb-2 text-xs font-semibold tracking-widest text-accent">
          01 / GAMEPLAY
        </div>
        <h2 className="text-xl font-semibold">从一种玩法开始</h2>
        <p className="mt-2 text-sm text-muted">
          选择你熟悉的游戏类型，我们会告诉你它是如何运转的。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {genres
          .filter((g) => g.support === "prototype")
          .map((g, i) => {
            const Icon = icons[i % 4];
            const selected = g.id === input.genreId;
            return (
              <button
                type="button"
                aria-pressed={selected}
                key={g.id}
                onClick={() => onChange({ ...input, genreId: g.id })}
                className={`relative rounded-2xl border p-4 text-left transition ${selected ? "border-mint bg-mint/5 ring-1 ring-mint" : "border-line bg-white hover:border-mint/50"}`}
              >
                <span
                  className={`mb-5 inline-flex rounded-xl p-2 ${selected ? "bg-mint text-white" : "bg-paper text-muted"}`}
                >
                  <Icon size={21} />
                </span>
                {selected && (
                  <Check
                    className="absolute right-3 top-4 text-mint"
                    size={16}
                  />
                )}
                <strong className="block text-sm">{g.name}</strong>
                <span className="mt-1 block text-[11px] text-muted">
                  {g.family}
                </span>
              </button>
            );
          })}
      </div>
      <details className="rounded-xl border border-line bg-white px-4 py-3">
        <summary className="cursor-pointer text-xs text-muted">
          其他玩法 · 可整理资料，试玩尚未开放
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {genres
            .filter((g) => g.support !== "prototype")
            .map((g) => (
              <button
                type="button"
                aria-pressed={input.genreId === g.id}
                className={`rounded-lg border px-3 py-2 text-xs ${input.genreId === g.id ? "border-mint text-mint" : "border-line"}`}
                key={g.id}
                onClick={() => onChange({ ...input, genreId: g.id })}
              >
                {g.name}
              </button>
            ))}
        </div>
      </details>
      {genre && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <Info size={17} className="text-mint" />
            <h3 className="text-sm font-semibold">了解 {genre.name}</h3>
            <span className="ml-auto text-[10px] text-muted">
              {genre.support === "prototype" ? "简化单机原型" : "暂不支持试玩"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {genre.description}
          </p>
          <dl className="mt-4 grid gap-4 text-xs md:grid-cols-3">
            {[
              ["玩家操作", genre.controls],
              ["核心流程", genre.loop],
              ["胜利目标", genre.victory],
            ].map(([title, body]) => (
              <div key={title}>
                <dt className="mb-1.5 font-semibold text-ink">{title}</dt>
                <dd className="leading-6 text-muted">{body}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {genre.mechanics.map((m) => (
              <span
                key={m}
                className="rounded-md bg-paper px-2 py-1 text-[11px] text-muted"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-muted">
            当前范围：{genre.scope}
          </p>
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="游戏名称" hint="暂时没想好也可以留空">
          <input
            value={input.title}
            maxLength={120}
            placeholder="给你的游戏起个名字"
            onChange={(e) => onChange({ ...input, title: e.target.value })}
          />
        </Field>
        <Field
          label="参考游戏 / 具体模式"
          required
          hint="请写出类似什么，以及参考的模式"
        >
          <input
            id="reference"
            value={input.reference}
            maxLength={6000}
            placeholder={
              input.genreId === "cards"
                ? "例如：类似三国杀的身份对抗模式"
                : input.genreId === "rpg"
                  ? "例如：类似经典回合制RPG的关卡战斗"
                  : input.genreId === "tower-defense"
                    ? "例如：类似保卫萝卜的固定路线塔防"
                    : "例如：类似英雄联盟的单线推塔模式"
            }
            onChange={(e) => onChange({ ...input, reference: e.target.value })}
          />
        </Field>
      </div>
      <Field label="想保留的机制" hint="说明你喜欢参考玩法的哪一部分">
        <textarea
          rows={2}
          maxLength={6000}
          value={input.mechanics}
          placeholder="例如：保留兵线推进和防御塔，暂时去掉野区"
          onChange={(e) => onChange({ ...input, mechanics: e.target.value })}
        />
      </Field>
      <Field label="你的游戏要求" hint={genre?.prompt}>
        <textarea
          rows={4}
          value={input.requirements}
          maxLength={6000}
          placeholder="描述想增加、改变或去掉的内容。不确定的部分可以交给系统补充。"
          onChange={(e) => onChange({ ...input, requirements: e.target.value })}
        />
      </Field>
      <p className="text-xs text-muted">
        每个文本项最多6000字。切换分类会保留世界观与人物资料。
      </p>
    </section>
  );
}
