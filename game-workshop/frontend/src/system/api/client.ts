import type { Session } from "../../objects/workshop";
export class ApiFailure extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly field: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export function apiName(name: string): string {
  return name.replace(/Message$/, "").toLowerCase();
}
export async function send<T>(
  message: string,
  input: unknown,
  token?: string,
): Promise<T> {
  const response = await fetch(`/api/${apiName(message)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiFailure(
      "后端暂时无法响应，请确认服务已启动后重试。",
      "invalid_response",
      "",
      response.status,
    );
  }
  if (!response.ok) {
    const e =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : {};
    throw new ApiFailure(
      typeof e.message === "string" ? e.message : "请求失败",
      typeof e.code === "string" ? e.code : "unknown",
      typeof e.field === "string" ? e.field : "",
      response.status,
    );
  }
  return data as T;
}
export async function openSession(): Promise<Session> {
  const stored = localStorage.getItem("workshop-session-v1");
  if (stored) {
    try {
      const value: unknown = JSON.parse(stored);
      if (
        typeof value === "object" &&
        value !== null &&
        "token" in value &&
        typeof value.token === "string" &&
        "ownerId" in value &&
        typeof value.ownerId === "string"
      )
        return { token: value.token, ownerId: value.ownerId };
    } catch {
      localStorage.removeItem("workshop-session-v1");
    }
  }
  const session = await send<Session>("StartSessionMessage", {});
  // React开发模式可能并行装配边界；优先采用先落盘的有效会话。
  const concurrent = localStorage.getItem("workshop-session-v1");
  if (concurrent && concurrent !== stored) return openSession();
  localStorage.setItem("workshop-session-v1", JSON.stringify(session));
  return session;
}
