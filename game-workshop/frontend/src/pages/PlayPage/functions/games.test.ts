import { describe, it, expect } from "vitest";
import { startTurnGame, rpgMove, playCard, endCardTurn } from "./turnGame";
import { startTower, buildTower, nextWave, towerTick } from "./towerGame";
import { startMoba, mobaStep } from "./mobaGame";
describe("试玩规则", () => {
  it("卡牌按能量限制出牌，旧状态保持不变", () => {
    const old = startTurnGame(2);
    const next = playCard(old, 0);
    expect(old.enemy).toBe(48);
    expect(next.enemy).toBe(36);
    expect(next.energy).toBe(2);
    expect(next.hand).toHaveLength(4);
    expect(playCard({ ...old, energy: 0 }, 0).enemy).toBe(48);
  });
  it("卡牌结束回合执行敌方攻击并刷新能量", () => {
    const s = endCardTurn({ ...startTurnGame(2), shield: 12, energy: 0 }, 2);
    expect(s.hp).toBe(97);
    expect(s.energy).toBe(3);
  });
  it("RPG所有关卡完成后结束，不再接受行动", () => {
    const s = rpgMove(
      { ...startTurnGame(1), enemy: 1, round: 3 },
      "attack",
      1,
      3,
    );
    expect(s.result).toBe("won");
    expect(rpgMove(s, "attack", 1, 3)).toEqual(s);
  });
  it("塔防扣费、满级和余额检查有效", () => {
    const old = startTower();
    const next = buildTower(old, 0);
    expect(old.coins).toBe(100);
    expect(next.coins).toBe(70);
    expect(buildTower({ ...old, coins: 0 }, 0)).toEqual({ ...old, coins: 0 });
    expect(nextWave(nextWave(next, 3), 3).wave).toBe(1);
  });
  it("塔防清空最终波获胜，漏怪耗尽生命失败", () => {
    expect(towerTick({ ...startTower(), wave: 3 }, 2, 3).result).toBe("won");
    expect(
      towerTick(
        { ...startTower(), lives: 1, enemies: [{ id: 1, x: 690, hp: 100 }] },
        2,
        3,
      ).result,
    ).toBe("lost");
  });
  it("MOBA需接近目标，防御塔存在时不能攻击基地", () => {
    const old = startMoba();
    expect(mobaStep(old, { type: "attack" }, 2)).toEqual(old);
    const blocked = mobaStep(
      { ...old, x: 680, rival: 0 },
      { type: "attack" },
      2,
    );
    expect(blocked.base).toBe(120);
    const win = mobaStep(
      { ...old, x: 680, rival: 0, tower: 0, base: 12 },
      { type: "attack" },
      2,
    );
    expect(win.result).toBe("won");
    expect(mobaStep(win, { type: "tick", dx: 1, dy: 0 }, 2)).toEqual(win);
  });
  it("MOBA治疗有冷却且生命有上限", () => {
    const healed = mobaStep({ ...startMoba(), hp: 90 }, { type: "heal" }, 1);
    expect(healed.hp).toBe(100);
    expect(mobaStep(healed, { type: "heal" }, 1)).toEqual(healed);
  });
});
