import type { GameBuildResult } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function generateGame(
  input: { projectId: string; expectedVersion: number },
  token?: string,
): Promise<GameBuildResult> {
  return send<GameBuildResult>("GenerateGameMessage", input, token);
}
