import { afterEach, describe, it, expect, vi } from "vitest";
import { send, apiName } from "./client";
import { emptyInput } from "../../pages/StudioPage/functions/draft";
afterEach(() => vi.unstubAllGlobals());
describe("消息传输边界", () => {
  it("代理返回空响应时给出可操作的服务提示", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 502 })),
    );
    await expect(send("ListProjectsMessage", {})).rejects.toMatchObject({
      code: "invalid_response",
      status: 502,
      message: "后端暂时无法响应，请确认服务已启动后重试。",
    });
  });
  it("稳定推导消息路由且携带会话令牌", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "waiting_for_provider",
          project: { id: "p" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const result = await send<{ status: string }>(
      "GenerateGameMessage",
      { projectId: "p" },
      "test-token",
    );
    expect(apiName("GenerateGameMessage")).toBe("generategame");
    expect(fetch.mock.calls[0][0]).toBe("/api/generategame");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer test-token",
    );
    expect(result.status).toBe("waiting_for_provider");
  });
  it("版本冲突保留错误码与字段，不能伪造成功", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "version_conflict",
            message: "资料已更新",
            field: "reference",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    await expect(send("SaveProjectMessage", {})).rejects.toMatchObject({
      code: "version_conflict",
      field: "reference",
      status: 409,
    });
  });
  it("拒绝加载内容哈希不一致的图片", async () => {
    const { loadGameAssets } = await import("./assets");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "asset",
            mime: "image/png",
            base64: "aGVsbG8=",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    await expect(
      loadGameAssets(
        {
          id: "game",
          projectId: "p",
          version: 1,
          genreId: "rpg",
          title: "test",
          characters: [],
          world: emptyInput.world,
          settings: { difficulty: 1, rounds: 3 },
          engine: "test",
          artworkBindings: [
            {
              slotId: "scene",
              revisionId: "r",
              originalAssetId: "o",
              processedAssetId: "asset",
              originalHash: "a".repeat(64),
              processedHash: "wrong",
            },
          ],
        },
        "t",
      ),
    ).rejects.toThrow("内容不一致");
  });
});
