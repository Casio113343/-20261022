import { describe, expect, it } from 'vitest';
import { assessDirection, demoReply } from './companionship';
import { appReducer, initialState } from './reducer';
import type { Conversation, Message } from './types';

const message = (
  role: Message['role'],
  content: string,
  id: string = role,
): Message => ({ id, role, content, createdAt: '2026-10-27T05:00:00.000Z' });
const conversation = (
  turns: number,
  text = '考试成绩让我难过',
): Conversation => ({
  id: 'c1',
  title: text,
  createdAt: '2026-10-27T05:00:00.000Z',
  updatedAt: '2026-10-27T05:00:00.000Z',
  direction: null,
  messages: [
    message('user', text),
    ...Array.from({ length: turns }, (_, i) =>
      message('assistant', '陪伴', `a${i}`),
    ),
  ],
});

describe('先陪伴，后尝试方向判断', () => {
  it('前三轮回复完成前不做分类；三轮后可以识别明确线索', () => {
    expect(assessDirection(conversation(2), 3)).toBeNull();
    expect(assessDirection(conversation(3), 3)).toBe('study');
  });
  it('线索不足或两个方向同分时不强行分类', () => {
    expect(assessDirection(conversation(4, '今天有点累'), 3)).toBeNull();
    expect(
      assessDirection(conversation(4, '考试成绩和朋友关系都让我难过'), 3),
    ).toBeNull();
  });
  it('首轮回应不要求用户分类或连续回答问题，输入不被改变', () => {
    const input = conversation(0);
    const before = JSON.stringify(input);
    expect(demoReply(input)).toContain('失落');
    expect(demoReply(input)).not.toMatch(/[?？]/);
    expect(demoReply(input)).toBe(demoReply(input));
    expect(JSON.stringify(input)).toBe(before);
  });
  it('紧急安全提示优先于轮次和方向模板', () => {
    expect(demoReply(conversation(0, '我不想活了'))).toContain('当地急救服务');
    expect(demoReply(conversation(0, '我不想活了'))).toContain('演示程序');
  });
});

describe('显式不可变状态转换', () => {
  const ready = () =>
    appReducer(initialState(), { type: 'hydrate', saved: null });
  const send = () =>
    appReducer(ready(), {
      type: 'send',
      conversationId: 'c1',
      requestId: 'r1',
      message: message('user', '今天有点累'),
    });
  it('新增对话不修改旧状态，等待期间阻止重复发送', () => {
    const before = ready();
    const next = appReducer(before, {
      type: 'send',
      conversationId: 'c1',
      requestId: 'r1',
      message: message('user', '累'),
    });
    expect(before.conversations).toHaveLength(0);
    expect(next.conversations).toHaveLength(1);
    expect(
      appReducer(next, {
        type: 'send',
        conversationId: 'c1',
        requestId: 'r2',
        message: message('user', '重复'),
      }),
    ).toBe(next);
  });
  it('忽略过期请求，正确回复只追加一次', () => {
    const pending = send();
    const reply = {
      type: 'receive' as const,
      conversationId: 'c1',
      requestId: 'r1',
      message: message('assistant', '慢慢来'),
    };
    expect(appReducer(pending, { ...reply, requestId: 'expired' })).toBe(
      pending,
    );
    const next = appReducer(pending, reply);
    expect(next.conversations[0]?.messages).toHaveLength(2);
    expect(pending.conversations[0]?.messages).toHaveLength(1);
    expect(appReducer(next, reply)).toBe(next);
  });
  it('删除或清空后晚到的回复不能复活内容', () => {
    const pending = send();
    const removed = appReducer(pending, { type: 'delete', id: 'c1' });
    expect(
      appReducer(removed, {
        type: 'receive',
        conversationId: 'c1',
        requestId: 'r1',
        message: message('assistant', '晚到'),
      }),
    ).toBe(removed);
    expect(appReducer(pending, { type: 'clear' })).toEqual(ready());
  });
});
