import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { GameArtifact, GameAssets } from "../../../objects/workshop";
import { primary, secondary } from "../../../components/ui/Field";
import {
  buildTower,
  nextWave,
  slots,
  startTower,
  towerTick,
} from "../functions/towerGame";
export function TowerGame({
  game,
  assets,
}: {
  game: GameArtifact;
  assets: GameAssets;
}) {
  const [s, setState] = useState(startTower);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () =>
        setState((old) =>
          towerTick(old, game.settings.difficulty, game.settings.rounds),
        ),
      100,
    );
    return () => clearInterval(timer);
  }, [paused, game.settings]);
  const canStart =
    s.result === "playing" &&
    s.remaining === 0 &&
    s.enemies.length === 0 &&
    s.wave < game.settings.rounds;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-5 rounded-xl border border-line bg-white p-4 text-sm">
        <span>
          金币 <strong>{s.coins}</strong>
        </span>
        <span>
          基地生命 <strong>{s.lives}</strong>
        </span>
        <span>
          波次{" "}
          <strong>
            {s.wave} / {game.settings.rounds}
          </strong>
        </span>
        <span>
          待出现 <strong>{s.remaining}</strong>
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[#1c2e34]">
        <svg
          viewBox="0 0 720 300"
          role="img"
          aria-label="塔防战场：敌人从左侧沿道路前进，防御塔自动攻击"
          className="w-full"
        >
          <defs>
            <pattern
              id="td-grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff08" />
            </pattern>
          </defs>
          <image
            href={assets.scene}
            width="720"
            height="300"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.6"
          />
          <rect width="720" height="300" fill="url(#td-grid)" />
          <path d="M 0 150 H 720" stroke="#8b9b8260" strokeWidth="50" />
          <path d="M 0 150 H 720" stroke="#ffffff20" strokeDasharray="8 10" />
          <text x="18" y="250" fill="#9cb8b4" fontSize="11">
            敌人入口 →
          </text>
          <image
            href={assets["tower-default"]}
            x="668"
            y="110"
            width="50"
            height="80"
          />
          <text x="670" y="205" fill="#edb986" fontSize="11">
            基地
          </text>
          {slots.map((x, i) => (
            <g key={x}>
              <circle
                cx={x}
                cy={i % 2 ? 218 : 75}
                r="23"
                fill={s.towers[i] ? "#4b9481" : "#ffffff10"}
                stroke="#a7cdbf60"
                strokeDasharray={s.towers[i] ? undefined : "4 4"}
              />
              {s.towers[i] > 0 && (
                <image
                  href={
                    assets[
                      game.characters[i]
                        ? `character-${game.characters[i].id}`
                        : "tower-default"
                    ]
                  }
                  x={x - 23}
                  y={(i % 2 ? 218 : 75) - 26}
                  width="46"
                  height="46"
                />
              )}
              <text
                x={x}
                y={(i % 2 ? 218 : 75) + 32}
                textAnchor="middle"
                fontSize="12"
                fill="white"
              >
                {s.towers[i] ? `Lv.${s.towers[i]}` : "+"}
              </text>
              {s.towers[i] > 0 &&
                s.tick % 4 === 0 &&
                s.enemies
                  .filter((e) => Math.abs(e.x - x) < 125)
                  .slice(0, 2)
                  .map((e) => (
                    <path
                      key={e.id}
                      d={`M${x} ${i % 2 ? 218 : 75} L${e.x} 150`}
                      stroke="#d7e6a9"
                      strokeWidth="2"
                    />
                  ))}
            </g>
          ))}
          {s.enemies.map((e) => (
            <g key={e.id}>
              <image
                href={
                  assets[
                    game.characters[1]
                      ? `character-${game.characters[1].id}`
                      : "enemy-default"
                  ]
                }
                x={e.x - 15}
                y="132"
                width="30"
                height="36"
              />
              <text
                x={e.x}
                y="127"
                textAnchor="middle"
                fontSize="9"
                fill="#efc4b6"
              >
                {e.hp}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-muted">
        在下方建塔或升级（最高3级），再开始波次。防御塔会自动攻击范围内的敌人。
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {slots.map((_, i) => (
          <button
            key={i}
            className={secondary}
            disabled={
              s.result !== "playing" ||
              s.towers[i] >= 3 ||
              s.coins < 30 + s.towers[i] * 20
            }
            onClick={() => setState((old) => buildTower(old, i))}
          >
            {game.characters[i]?.name || `塔位 ${i + 1}`}
            <br />
            {s.towers[i] >= 3
              ? "已满级"
              : `${s.towers[i] ? "升级" : "建造"} ${30 + s.towers[i] * 20}金`}
          </button>
        ))}
      </div>
      {s.result !== "playing" && (
        <p role="status" className="rounded-xl bg-mint/10 p-4 text-mint">
          {s.result === "won"
            ? "防守成功，所有波次已完成！"
            : "基地失守，再调整一下布防吧。"}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className={primary}
          disabled={!canStart}
          onClick={() => setState((old) => nextWave(old, game.settings.rounds))}
        >
          <Play size={15} />
          {s.wave ? "开始下一波" : "开始第一波"}
        </button>
        <button className={secondary} onClick={() => setPaused((v) => !v)}>
          {paused ? <Play size={15} /> : <Pause size={15} />}
          {paused ? "继续" : "暂停"}
        </button>
        <button
          className={secondary}
          onClick={() => {
            setState(startTower());
            setPaused(false);
          }}
        >
          <RotateCcw size={15} />
          重新开始
        </button>
      </div>
    </div>
  );
}
