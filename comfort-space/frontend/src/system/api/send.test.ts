import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { BackendError, routeName, sendMessage } from './send';
import { SendMessageMessage } from '../../apis/conversations/SendMessageMessage';
import names from './message-names.json';

afterEach(() => vi.unstubAllGlobals());
describe('类型化 HTTP 边界', () => {
  it('使用稳定注册元数据推导名称', () => {
    expect(routeName(names.SendMessageMessage)).toBe('sendmessage');
    expect(new Set(Object.values(names).map(routeName)).size).toBe(
      Object.keys(names).length,
    );
  });
  it('正文不携带自报身份，由同源 Cookie 认证', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'c',
          title: 'test',
          createdAt: 'now',
          updatedAt: 'now',
          messages: [],
          direction: null,
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    await new SendMessageMessage('c', 'r', '测试').send();
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/sendmessage');
    expect(options.credentials).toBe('same-origin');
    expect(JSON.parse(options.body)).toEqual({
      conversationId: 'c',
      requestId: 'r',
      content: '测试',
    });
  });
  it('错误响应不会伪造成功结果', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: '身份已过期' }), {
          status: 401,
        }),
      ),
    );
    await expect(
      sendMessage('GetStateMessage', {}, z.object({ ok: z.boolean() })),
    ).rejects.toThrow('身份已过期');
  });
  it('拒绝不符合响应契约的数据', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"unexpected":true}')),
    );
    await expect(
      sendMessage('GetStateMessage', {}, z.object({ ok: z.boolean() })),
    ).rejects.toBeInstanceOf(BackendError);
  });
  it('断网时保留可读错误而非静默切回前端模板', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(
      sendMessage('GetStateMessage', {}, z.object({})),
    ).rejects.toThrow('无法连接本机服务');
  });
});
