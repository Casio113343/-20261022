import { describe, expect, it } from 'vitest';
import { appReducer, initialState } from './reducer';
import type { Conversation, FailedSend } from './types';

const request: FailedSend = {
  conversationId: 'c1',
  requestId: 'r1',
  content: '合成测试',
  isNew: true,
};
const message = {
  id: 'local',
  role: 'user' as const,
  content: request.content,
  createdAt: '2026-10-29T01:00:00Z',
};
const ready = () =>
  appReducer(initialState(), { type: 'hydrate', saved: null });
const pending = () =>
  appReducer(ready(), {
    type: 'send',
    conversationId: request.conversationId,
    requestId: request.requestId,
    message,
  });
const response: Conversation = {
  id: 'c1',
  title: '合成测试',
  createdAt: message.createdAt,
  updatedAt: message.createdAt,
  direction: null,
  messages: [
    { ...message, id: 'server-user' },
    {
      ...message,
      id: 'server-reply',
      role: 'assistant',
      content: '先停一停也可以。',
    },
  ],
};

describe('服务器消息与不可变界面状态', () => {
  it('新增乐观消息不修改旧状态，等待期间不重复发送', () => {
    const before = ready();
    const next = appReducer(before, {
      type: 'send',
      conversationId: 'c1',
      requestId: 'r1',
      message,
    });
    expect(before.conversations).toHaveLength(0);
    expect(next.conversations[0]?.messages).toHaveLength(1);
    expect(
      appReducer(next, {
        type: 'send',
        conversationId: 'c1',
        requestId: 'r2',
        message,
      }),
    ).toBe(next);
  });
  it('服务端结果替换乐观消息，不重复追加或在前端分类', () => {
    const before = pending();
    const next = appReducer(before, {
      type: 'serverConversation',
      requestId: 'r1',
      conversation: response,
    });
    expect(next.conversations[0]?.messages.map((item) => item.id)).toEqual([
      'server-user',
      'server-reply',
    ]);
    expect(before.conversations[0]?.messages[0]?.id).toBe('local');
    expect(next.pending).toBeNull();
  });
  it('忽略过期请求和已完成请求的重复结果', () => {
    const current = pending();
    expect(
      appReducer(current, {
        type: 'serverConversation',
        requestId: 'old',
        conversation: response,
      }),
    ).toBe(current);
    const completed = appReducer(current, {
      type: 'serverConversation',
      requestId: 'r1',
      conversation: response,
    });
    expect(
      appReducer(completed, {
        type: 'serverConversation',
        requestId: 'r1',
        conversation: response,
      }),
    ).toBe(completed);
  });
  it('发送失败保留请求编号，重试不重复添加用户消息', () => {
    const failed = appReducer(pending(), {
      type: 'sendFailed',
      request,
      error: '网络断开',
    });
    expect(failed.pending).toBeNull();
    const retried = appReducer(failed, { type: 'retry', request });
    expect(retried.pending?.requestId).toBe('r1');
    expect(retried.conversations[0]?.messages).toHaveLength(1);
    const completed = appReducer(retried, {
      type: 'serverConversation',
      requestId: 'r1',
      conversation: response,
    });
    expect(completed.failedSend).toBeNull();
    expect(completed.error).toBeNull();
  });
});
