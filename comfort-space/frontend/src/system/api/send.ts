import { z } from 'zod';
export function routeName(messageName: string): string {
  return messageName.replace(/Message$/, '').toLowerCase();
}
export class BackendError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export async function sendMessage<T>(
  name: string,
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/${routeName(name)}`, {
      method: 'POST',
      credentials: 'same-origin',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json: unknown = await response.json();
    if (!response.ok) {
      const error = z.object({ message: z.string() }).safeParse(json);
      throw new BackendError(
        response.status,
        error.success ? error.data.message : '服务请求失败，请重试。',
      );
    }
    const result = schema.safeParse(json);
    if (!result.success)
      throw new BackendError(502, '服务返回的数据格式不正确，请重试。');
    return result.data;
  } catch (error) {
    if (error instanceof BackendError) throw error;
    throw new BackendError(
      0,
      '暂时无法连接本机服务，请确认后端正在运行后重试。',
    );
  } finally {
    clearTimeout(timeout);
  }
}
export const acknowledgementSchema = z.object({ ok: z.literal(true) });
