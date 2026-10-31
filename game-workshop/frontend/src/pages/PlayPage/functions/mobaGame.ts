export type MobaState = Readonly<{
  tick: number;
  x: number;
  y: number;
  hp: number;
  tower: number;
  base: number;
  home: number;
  rival: number;
  rivalX: number;
  cooldown: number;
  result: "playing" | "won" | "lost";
}>;
export type MobaEvent =
  | Readonly<{ type: "tick"; dx: number; dy: number }>
  | Readonly<{ type: "attack" }>
  | Readonly<{ type: "heal" }>;
export function startMoba(): MobaState {
  return {
    tick: 0,
    x: 110,
    y: 160,
    hp: 100,
    tower: 100,
    base: 120,
    home: 120,
    rival: 60,
    rivalX: 530,
    cooldown: 0,
    result: "playing",
  };
}
export function mobaStep(
  s: MobaState,
  event: MobaEvent,
  difficulty: number,
): MobaState {
  if (s.result !== "playing") return s;
  if (event.type === "heal")
    return s.cooldown > 0
      ? s
      : { ...s, hp: Math.min(100, s.hp + 35), cooldown: 60 };
  if (event.type === "attack") {
    if (
      s.rival > 0 &&
      Math.abs(s.x - s.rivalX) < 100 &&
      Math.abs(s.y - 160) < 80
    )
      return { ...s, rival: Math.max(0, s.rival - 12) };
    if (s.tower > 0 && Math.abs(s.x - 520) < 120 && Math.abs(s.y - 160) < 90)
      return { ...s, tower: Math.max(0, s.tower - 10) };
    if (
      s.tower === 0 &&
      Math.abs(s.x - 675) < 115 &&
      Math.abs(s.y - 160) < 90
    ) {
      const base = Math.max(0, s.base - 12);
      return { ...s, base, result: base === 0 ? "won" : "playing" };
    }
    return s;
  }
  const tick = s.tick + 1;
  const x = Math.max(35, Math.min(690, s.x + event.dx * 6));
  const y = Math.max(55, Math.min(265, s.y + event.dy * 6));
  const rivalX =
    s.rival > 0
      ? Math.max(
          70,
          Math.min(
            600,
            s.rivalX + Math.sign(x - s.rivalX) * (1 + difficulty * 0.2),
          ),
        )
      : s.rivalX;
  const hit =
    tick % 10 === 0
      ? (s.rival > 0 && Math.abs(x - rivalX) < 65 && Math.abs(y - 160) < 65
          ? 3 + difficulty
          : 0) + (s.tower > 0 && x > 425 && Math.abs(y - 160) < 95 ? 3 : 0)
      : 0;
  const hp = Math.max(
    0,
    Math.min(100, s.hp - hit + (x < 130 && tick % 10 === 0 ? 5 : 0)),
  );
  // 双方兵线自动推进，用时间和塔状态明确表达，不隐藏计时状态。
  const tower = Math.max(0, s.tower - (tick % 45 === 0 ? 3 : 0));
  const base = Math.max(0, s.base - (tower === 0 && tick % 40 === 0 ? 4 : 0));
  const home = Math.max(0, s.home - (tick % 80 === 0 ? difficulty * 3 : 0));
  return {
    ...s,
    tick,
    x,
    y,
    hp,
    rivalX,
    tower,
    base,
    home,
    cooldown: Math.max(0, s.cooldown - 1),
    result: hp === 0 || home === 0 ? "lost" : base === 0 ? "won" : "playing",
  };
}
