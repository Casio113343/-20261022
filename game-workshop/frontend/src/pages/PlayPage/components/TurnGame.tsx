import { useState } from "react";
import { Swords, Shield, Heart, RotateCcw } from "lucide-react";
import type { GameArtifact, GameAssets } from "../../../objects/workshop";
import { secondary } from "../../../components/ui/Field";
import {
  endCardTurn,
  playCard,
  rpgMove,
  startTurnGame,
} from "../functions/turnGame";
export function TurnGame({
  game,
  assets,
}: {
  game: GameArtifact;
  assets: GameAssets;
}) {
  const cards = game.genreId === "cards";
  const [s, setState] = useState(() => startTurnGame(game.settings.difficulty));
  const name = game.characters[0]?.name || "旅人";
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-[#1c2e34] p-6 text-white md:p-10">
        <img
          src={assets.scene}
          alt="游戏场景"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute right-10 top-5 text-[120px] font-black text-white/5">
          {cards ? "♠" : "RPG"}
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 text-xs text-[#a7cdbf]">{name} · 你</p>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#b5d7ba]/30 bg-[#b5d7ba]/10">
              <img
                src={
                  assets[
                    game.characters[0]
                      ? `character-${game.characters[0].id}`
                      : "character-default"
                  ]
                }
                alt={name}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-4 text-xl">
              {s.hp} <span className="text-xs text-white/50">/ 100 HP</span>
            </p>
            <p className="mt-2 text-xs text-white/60">
              {cards
                ? `能量 ${s.energy}/3 · 护盾 ${s.shield}`
                : `治疗药剂 ${s.potions}`}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-white/30">VS</div>
            <p className="mt-3 text-xs text-white/50">
              {cards
                ? `回合 ${s.turn}`
                : `挑战 ${s.round} / ${game.settings.rounds}`}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-3 text-xs text-[#efb5a0]">
              {game.characters[1]?.name || "守关者"} · 电脑
            </p>
            <div className="ml-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-[#efb5a0]/30 bg-[#efb5a0]/10">
              <img
                src={
                  assets[
                    game.characters[1]
                      ? `character-${game.characters[1].id}`
                      : "enemy-default"
                  ]
                }
                alt="电脑角色"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-4 text-xl">
              {s.enemy} <span className="text-xs text-white/50">HP</span>
            </p>
            <p className="mt-2 text-xs text-white/60">
              难度 {game.settings.difficulty}
            </p>
          </div>
        </div>
        {s.result !== "playing" && (
          <div
            role="status"
            className="relative mt-8 rounded-xl bg-white/10 p-4 text-center text-lg"
          >
            {s.result === "won"
              ? "胜利！这次挑战完成了。"
              : "挑战结束，再试一次吧。"}
          </div>
        )}
      </div>
      {cards ? (
        <>
          <div className="flex flex-wrap gap-3">
            {s.hand.map((move, i) => (
              <button
                key={`${s.turn}-${i}`}
                disabled={
                  s.result !== "playing" || s.energy < (move === "heal" ? 2 : 1)
                }
                onClick={() => setState((old) => playCard(old, i))}
                className="min-w-28 flex-1 rounded-2xl border border-line bg-white p-5 text-left hover:border-mint"
              >
                <img
                  src={
                    assets[
                      `card-${move === "attack" ? 0 : move === "guard" ? 1 : 2}`
                    ]
                  }
                  alt={
                    move === "attack"
                      ? "攻击卡面"
                      : move === "guard"
                        ? "防御卡面"
                        : "治疗卡面"
                  }
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
                <span className="mb-5 block text-[10px] text-muted">
                  消耗 {move === "heal" ? 2 : 1} 能量
                </span>
                <strong>
                  {move === "attack"
                    ? "破阵"
                    : move === "guard"
                      ? "坚守"
                      : "回春"}
                </strong>
                <span className="mt-3 block text-xs text-muted">
                  {move === "attack"
                    ? "造成12伤害"
                    : move === "guard"
                      ? "获得12护盾"
                      : "恢复18生命"}
                </span>
              </button>
            ))}
          </div>
          <button
            className={secondary}
            disabled={s.result !== "playing"}
            onClick={() =>
              setState((old) => endCardTurn(old, game.settings.difficulty))
            }
          >
            结束回合 / 电脑行动
          </button>
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          {(
            [
              { move: "attack", label: "攻击 · 16伤害", Icon: Swords },
              { move: "guard", label: "防御 · 降低伤害", Icon: Shield },
              { move: "heal", label: "治疗 · 恢复30", Icon: Heart },
            ] as const
          ).map(({ move, label, Icon }) => (
            <button
              key={move}
              className={secondary}
              disabled={
                s.result !== "playing" || (move === "heal" && s.potions === 0)
              }
              onClick={() =>
                setState((old) =>
                  rpgMove(
                    old,
                    move,
                    game.settings.difficulty,
                    game.settings.rounds,
                  ),
                )
              }
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-line bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold">战斗记录</h3>
        {s.log.map((line, i) => (
          <p
            key={i}
            className={`py-1 text-xs leading-5 ${i === 0 ? "text-ink" : "text-muted"}`}
          >
            {line}
          </p>
        ))}
      </div>
      <button
        className={secondary}
        onClick={() => setState(startTurnGame(game.settings.difficulty))}
      >
        <RotateCcw size={14} />
        重新开始
      </button>
    </div>
  );
}
