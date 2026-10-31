export type Move = "attack" | "guard" | "heal";
export type TurnState = Readonly<{
  hp: number;
  enemy: number;
  round: number;
  turn: number;
  shield: number;
  energy: number;
  potions: number;
  hand: readonly Move[];
  log: readonly string[];
  result: "playing" | "won" | "lost";
}>;
export function startTurnGame(difficulty: number): TurnState {
  return {
    hp: 100,
    enemy: 32 + difficulty * 8,
    round: 1,
    turn: 1,
    shield: 0,
    energy: 3,
    potions: 3,
    hand: ["attack", "guard", "attack", "heal", "guard"],
    log: ["对战开始。选择行动。"],
    result: "playing",
  };
}
function record(s: TurnState, text: string): TurnState {
  return { ...s, log: [text, ...s.log].slice(0, 8) };
}
export function rpgMove(
  s: TurnState,
  move: Move,
  difficulty: number,
  target: number,
): TurnState {
  if (s.result !== "playing" || (move === "heal" && s.potions <= 0)) return s;
  const enemy = Math.max(0, s.enemy - (move === "attack" ? 16 : 0));
  const hp = Math.min(100, s.hp + (move === "heal" ? 30 : 0));
  if (enemy === 0) {
    if (s.round >= target)
      return record({ ...s, enemy: 0, result: "won" }, "所有挑战完成！");
    return record(
      {
        ...s,
        hp: Math.min(100, hp + 22),
        enemy: 32 + difficulty * 8 + s.round * 4,
        round: s.round + 1,
        potions: Math.min(3, s.potions + 1),
        turn: s.turn + 1,
      },
      "战斗胜利，恢复生命并进入下一关。",
    );
  }
  const damage = move === "guard" ? 2 : 4 + difficulty * 2;
  const nextHp = Math.max(0, hp - damage);
  return record(
    {
      ...s,
      hp: nextHp,
      enemy,
      turn: s.turn + 1,
      potions: s.potions - (move === "heal" ? 1 : 0),
      result: nextHp === 0 ? "lost" : "playing",
    },
    `${move === "attack" ? "攻击造成16点伤害" : move === "guard" ? "防御" : "使用药剂恢复生命"}；敌方造成${damage}点伤害。`,
  );
}
export function playCard(s: TurnState, index: number): TurnState {
  const card = s.hand[index];
  const cost = card === "heal" ? 2 : 1;
  if (!card || s.result !== "playing" || s.energy < cost) return s;
  const enemy = Math.max(0, s.enemy - (card === "attack" ? 12 : 0));
  return record(
    {
      ...s,
      enemy,
      hp: Math.min(100, s.hp + (card === "heal" ? 18 : 0)),
      shield: s.shield + (card === "guard" ? 12 : 0),
      energy: s.energy - cost,
      hand: s.hand.filter((_, i) => i !== index),
      result: enemy === 0 ? "won" : "playing",
    },
    card === "attack"
      ? "攻击卡造成12点伤害。"
      : card === "guard"
        ? "防御卡获得12点护盾。"
        : "治疗卡恢复18点生命。",
  );
}
export function endCardTurn(s: TurnState, difficulty: number): TurnState {
  if (s.result !== "playing") return s;
  const hit = Math.max(0, 9 + difficulty * 3 - s.shield);
  const hp = Math.max(0, s.hp - hit);
  return record(
    {
      ...s,
      hp,
      turn: s.turn + 1,
      shield: 0,
      energy: 3,
      hand:
        s.turn % 2 === 0
          ? ["attack", "attack", "heal", "guard", "attack"]
          : ["attack", "guard", "attack", "heal", "guard"],
      result: hp === 0 ? "lost" : "playing",
    },
    `电脑攻击，造成${hit}点伤害。新回合能量与手牌已刷新。`,
  );
}
