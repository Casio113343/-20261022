export type Enemy = Readonly<{ id: number; x: number; hp: number }>;
export type TowerState = Readonly<{
  tick: number;
  coins: number;
  lives: number;
  wave: number;
  remaining: number;
  towers: readonly number[];
  enemies: readonly Enemy[];
  result: "playing" | "won" | "lost";
}>;
export const slots = [100, 220, 340, 460, 580] as const;
export function startTower(): TowerState {
  return {
    tick: 0,
    coins: 100,
    lives: 10,
    wave: 0,
    remaining: 0,
    towers: [0, 0, 0, 0, 0],
    enemies: [],
    result: "playing",
  };
}
export function buildTower(s: TowerState, slot: number): TowerState {
  const level = s.towers[slot];
  const cost = 30 + level * 20;
  if (
    s.result !== "playing" ||
    level === undefined ||
    level >= 3 ||
    s.coins < cost
  )
    return s;
  return {
    ...s,
    coins: s.coins - cost,
    towers: s.towers.map((v, i) => (i === slot ? v + 1 : v)),
  };
}
export function nextWave(s: TowerState, target: number): TowerState {
  if (
    s.result !== "playing" ||
    s.remaining > 0 ||
    s.enemies.length > 0 ||
    s.wave >= target
  )
    return s;
  return { ...s, wave: s.wave + 1, remaining: s.wave + 4 };
}
export function towerTick(
  s: TowerState,
  difficulty: number,
  target: number,
): TowerState {
  if (s.result !== "playing") return s;
  const tick = s.tick + 1;
  const spawn = s.remaining > 0 && tick % 8 === 0;
  const enemies = [
    ...s.enemies,
    ...(spawn
      ? [{ id: tick, x: 0, hp: 12 + s.wave * 5 + difficulty * 3 }]
      : []),
  ].map((e) => ({
    ...e,
    x: e.x + 2 + difficulty * 0.6,
    hp:
      e.hp -
      (tick % 4 === 0
        ? s.towers.reduce(
            (damage, level, i) =>
              damage + (Math.abs(slots[i] - e.x) < 125 ? level * 3 : 0),
            0,
          )
        : 0),
  }));
  const killed = enemies.filter((e) => e.hp <= 0).length;
  const escaped = enemies.filter((e) => e.hp > 0 && e.x >= 690).length;
  const alive = enemies.filter((e) => e.hp > 0 && e.x < 690);
  const remaining = s.remaining - (spawn ? 1 : 0);
  const lives = Math.max(0, s.lives - escaped);
  return {
    ...s,
    tick,
    coins: s.coins + killed * 12,
    lives,
    enemies: alive,
    remaining,
    result:
      lives === 0
        ? "lost"
        : s.wave >= target && remaining === 0 && alive.length === 0
          ? "won"
          : "playing",
  };
}
