import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Swords,
  Heart,
  RotateCcw,
  Pause,
  Play,
} from "lucide-react";
import type { GameArtifact, GameAssets } from "../../../objects/workshop";
import { secondary } from "../../../components/ui/Field";
import { mobaStep, startMoba } from "../functions/mobaGame";
export function MobaGame({
  game,
  assets,
}: {
  game: GameArtifact;
  assets: GameAssets;
}) {
  const [s, setState] = useState(startMoba);
  const [paused, setPaused] = useState(false);
  const keys = useRef<ReadonlySet<string>>(new Set());
  const board = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const k = keys.current;
      setState((old) =>
        mobaStep(
          old,
          {
            type: "tick",
            dx:
              Number(k.has("d") || k.has("ArrowRight")) -
              Number(k.has("a") || k.has("ArrowLeft")),
            dy:
              Number(k.has("s") || k.has("ArrowDown")) -
              Number(k.has("w") || k.has("ArrowUp")),
          },
          game.settings.difficulty,
        ),
      );
    }, 100);
    return () => clearInterval(timer);
  }, [paused, game.settings.difficulty]);
  useEffect(() => {
    const blur = () => {
      keys.current = new Set();
      setPaused(true);
    };
    window.addEventListener("blur", blur);
    return () => window.removeEventListener("blur", blur);
  }, []);
  function step(dx: number, dy: number) {
    if (!paused)
      setState((old) =>
        mobaStep(
          old,
          { type: "tick", dx: dx * 3, dy: dy * 3 },
          game.settings.difficulty,
        ),
      );
  }
  const attack = () => {
    if (!paused)
      setState((old) =>
        mobaStep(old, { type: "attack" }, game.settings.difficulty),
      );
  };
  const heal = () => {
    if (!paused)
      setState((old) =>
        mobaStep(old, { type: "heal" }, game.settings.difficulty),
      );
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-5 rounded-xl border border-line bg-white p-4 text-sm">
        <span>
          英雄生命 <strong>{s.hp}</strong>
        </span>
        <span>
          己方基地 <strong>{s.home}</strong>
        </span>
        <span>
          敌方防御塔 <strong>{s.tower}</strong>
        </span>
        <span>
          敌方基地 <strong>{s.base}</strong>
        </span>
      </div>
      <div
        ref={board}
        tabIndex={0}
        role="application"
        aria-label="MOBA试玩战场，点击后使用WASD或方向键移动，空格攻击，Q治疗"
        className="overflow-hidden rounded-2xl bg-[#1c2e34] outline-mint focus:ring-2"
        onClick={() => board.current?.focus()}
        onKeyDown={(e) => {
          if (
            [
              "w",
              "a",
              "s",
              "d",
              "ArrowUp",
              "ArrowDown",
              "ArrowLeft",
              "ArrowRight",
              " ",
              "q",
            ].includes(e.key)
          ) {
            e.preventDefault();
            keys.current = new Set([...keys.current, e.key]);
            if (e.key === " " && !e.repeat) attack();
            if (e.key === "q" && !e.repeat) heal();
          }
        }}
        onKeyUp={(e) => {
          keys.current = new Set([...keys.current].filter((k) => k !== e.key));
        }}
        onBlur={() => {
          keys.current = new Set();
        }}
      >
        <svg
          viewBox="0 0 720 320"
          className="w-full"
          role="img"
          aria-label="单线推塔战场"
        >
          <defs>
            <pattern
              id="moba-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path d="M32 0H0V32" fill="none" stroke="#ffffff07" />
            </pattern>
          </defs>
          <image
            href={assets.scene}
            width="720"
            height="320"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.6"
          />
          <rect width="720" height="320" fill="url(#moba-grid)" />
          <rect y="120" width="720" height="80" fill="#778c6a20" />
          <path d="M40 160H680" stroke="#ffffff15" strokeDasharray="8 8" />
          <image
            href={assets["tower-default"]}
            x="20"
            y="130"
            width="55"
            height="60"
          />
          <text x="25" y="216" fill="#a7cdbf" fontSize="11">
            己方基地
          </text>
          {s.tower > 0 && (
            <>
              <image
                href={assets["tower-default"]}
                x="494"
                y="128"
                width="52"
                height="65"
              />
              <text x="494" y="118" fill="#efb5a0" fontSize="11">
                塔 {s.tower}
              </text>
            </>
          )}
          <image
            href={assets["tower-default"]}
            x="646"
            y="128"
            width="58"
            height="64"
          />
          <text x="645" y="216" fill="#efb5a0" fontSize="11">
            敌方基地
          </text>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle
                cx={70 + ((s.tick * 2 + i * 30) % 420)}
                cy={146}
                r="4"
                fill="#a7cdbf"
              />
              <circle
                cx={645 - ((s.tick * 2 + i * 30) % 420)}
                cy={177}
                r="4"
                fill="#d98b70"
              />
            </g>
          ))}
          {s.rival > 0 && (
            <g>
              <image
                href={
                  assets[
                    game.characters[1]
                      ? `character-${game.characters[1].id}`
                      : "enemy-default"
                  ]
                }
                x={s.rivalX - 20}
                y="135"
                width="40"
                height="50"
              />
              <text
                x={s.rivalX}
                y="133"
                textAnchor="middle"
                fill="#efb5a0"
                fontSize="10"
              >
                守卫 {s.rival}
              </text>
            </g>
          )}
          <image
            href={
              assets[
                game.characters[0]
                  ? `character-${game.characters[0].id}`
                  : "character-default"
              ]
            }
            x={s.x - 20}
            y={s.y - 25}
            width="40"
            height="50"
          />
          <text
            x={s.x}
            y={s.y - 26}
            textAnchor="middle"
            fill="#d2e8d6"
            fontSize="11"
          >
            {(game.characters[0]?.name || "英雄").slice(0, 12)}
          </text>
          <text x="20" y="295" fill="#9cb8b4" fontSize="10">
            靠近己方基地可回血 · 先击破防御塔再攻击敌方基地
          </text>
        </svg>
      </div>
      <p className="text-xs leading-6 text-muted">
        点击战场后，WASD /
        方向键移动，空格攻击，Q治疗（6秒冷却）。也可使用下方按钮。兵线按固定节奏削弱建筑；没有联网和自定义技能。
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          { dx: -1, dy: 0, Icon: ArrowLeft, label: "向左" },
          { dx: 0, dy: -1, Icon: ArrowUp, label: "向上" },
          { dx: 0, dy: 1, Icon: ArrowDown, label: "向下" },
          { dx: 1, dy: 0, Icon: ArrowRight, label: "向右" },
        ].map(({ dx, dy, Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className={secondary}
            disabled={paused || s.result !== "playing"}
            onClick={() => step(dx, dy)}
          >
            <Icon size={17} />
          </button>
        ))}
        <button
          className={secondary}
          disabled={paused || s.result !== "playing"}
          onClick={attack}
        >
          <Swords size={16} />
          攻击
        </button>
        <button
          className={secondary}
          disabled={paused || s.cooldown > 0 || s.result !== "playing"}
          onClick={heal}
        >
          <Heart size={16} />
          治疗 {s.cooldown > 0 ? `${Math.ceil(s.cooldown / 10)}s` : ""}
        </button>
        <button
          className={secondary}
          onClick={() => {
            keys.current = new Set();
            setPaused((v) => !v);
          }}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
          {paused ? "继续" : "暂停"}
        </button>
        <button
          className={secondary}
          onClick={() => {
            setState(startMoba());
            setPaused(false);
          }}
        >
          <RotateCcw size={15} />
          重开
        </button>
      </div>
      {s.result !== "playing" && (
        <p role="status" className="rounded-xl bg-mint/10 p-4 text-mint">
          {s.result === "won"
            ? "敌方基地被摧毁，胜利！"
            : "英雄倒下或基地失守，挑战结束。"}
        </p>
      )}
    </div>
  );
}
