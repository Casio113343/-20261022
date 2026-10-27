import type { Conversation, Direction } from './types';

// 只进行确定性演示，不把关键词规则当成真实模型理解或诊断。
const directionRules: readonly Readonly<{
  direction: Direction;
  words: readonly string[];
}>[] = [
  {
    direction: 'study',
    words: ['考试', '成绩', '作业', '工作', '学习', '加班', '学校'],
  },
  {
    direction: 'relationships',
    words: ['朋友', '分手', '家人', '父母', '同事', '吵架', '关系'],
  },
  {
    direction: 'self',
    words: ['没用', '失败', '不够好', '自责', '比较', '讨厌自己'],
  },
  {
    direction: 'loneliness',
    words: ['孤独', '一个人', '没人', '寂寞', '孤单'],
  },
  {
    direction: 'change',
    words: ['毕业', '告别', '离开', '失去', '搬家', '变化'],
  },
];

export function assessDirection(
  conversation: Conversation,
  minimumTurns: number,
): Direction | null {
  const turns = conversation.messages.filter(
    (m) => m.role === 'assistant',
  ).length;
  if (turns < minimumTurns) return null;
  const text = conversation.messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');
  const ranked = directionRules
    .map((rule) => ({
      direction: rule.direction,
      score: rule.words.filter((word) => text.includes(word)).length,
    }))
    .toSorted((a, b) => b.score - a.score);
  const best = ranked[0];
  const next = ranked[1];
  return best && best.score >= 2 && (!next || best.score > next.score)
    ? best.direction
    : conversation.direction;
}

export function demoReply(conversation: Conversation): string {
  const userMessages = conversation.messages.filter((m) => m.role === 'user');
  const last = userMessages.at(-1)?.content ?? '';
  const turn = userMessages.length;
  if (/自杀|自残|伤害自己|不想活/.test(last)) {
    return '听到你这么难受，我想先认真对待你此刻的安全。如果你正准备伤害自己，先离开可能伤到你的物品，联系身边可信任的人陪着你；有紧迫危险时，请联系当地急救服务。这里是演示程序，不能提供实时危机援助。';
  }
  if (turn === 1) {
    if (/考试|成绩|作业|学习/.test(last))
      return '这件事让你很失落，也许还夹着一点“我已经很努力了，为什么还是这样”的委屈。先不用急着总结自己哪里做得不够好，一次结果装不下你全部的努力。';
    if (/朋友|分手|家人|关系/.test(last))
      return '在在意的人那里感到失落，往往会格外难受。也许你原本期待的，只是被认真对待。现在不用急着替谁解释，也不用马上作出决定。';
    if (/累|压力|撑/.test(last))
      return '听起来，你已经绷了挺久。就算一时说不清哪里最累，也不用把这些感受整理得很完整。你可以先在这里停一停，不必马上打起精神。';
    if (/没用|失败|讨厌自己/.test(last))
      return '此刻你对自己很苛刻，听起来也很受伤。我们可以先把“我很难受”和“我不够好”分开一点；正在经历难受，不代表你只能被这样评价。';
    return '谢谢你把这句话放在这里。不管现在的感受清不清楚，你都不需要先找到一个合理的理由。这里没有要立刻振作的要求，你可以按自己的节奏说。';
  }
  if (turn === 2)
    return '我有在跟着你说的这些。事情本身之外，被忽略、委屈，或是对自己的失望，也可能一起压了上来。你不用一边难过，一边证明自己有资格难过。';
  if (turn === 3)
    return '这些感受不必今天就有结论。刚才你说的，我想先好好放在这里：你经历的难受值得被认真对待。现在即使只是停一会儿，也可以。';
  const focused: Readonly<Record<Direction, string>> = {
    study:
      '努力暂时没有换来期待的结果，真的会让人泄气。我们先不把一次成绩或工作表现变成对整个人的判决。如果你之后想理一理，可以只从最压着你的那一小件事开始。',
    relationships:
      '关系里的难受，有时是希望靠近，又害怕再被推开。你的需要值得被听见；也不必现在就决定原谅、离开，或把一切解释清楚。',
    self: '你可能已经很习惯先责怪自己。可以暂时不和那些批评争论，也不急着强迫自己喜欢自己；先用不那么严厉的方式，陪自己过完这一刻。',
    loneliness:
      '一个人承担这些，确实可能很空、很累。你不必为了有人陪就把自己变得更有趣，或假装没有事。等你愿意的时候，也可以让一个可信任的人知道你最近不太好。',
    change:
      '有些告别不只是失去一件事，也像是熟悉的生活少了一块。舍不得与不适应可以同时存在，不需要赶着给这段经历一个积极的解释。',
  };
  return conversation.direction
    ? focused[conversation.direction]
    : turn % 2 === 0
      ? '你不用把话说得漂亮，也不用让每一次倾诉都有答案。此刻还没有想清楚，并不妨碍这些感受被好好放下。'
      : '我们可以继续沿着你想说的地方慢慢聊，也可以在这里停一会儿。接下来怎么走，你可以自己决定。';
}
