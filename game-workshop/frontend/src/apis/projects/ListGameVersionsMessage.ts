import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function listGameVersions(
  input: { projectId: string },
  token?: string,
): Promise<readonly Project[]> {
  return send<readonly Project[]>("ListGameVersionsMessage", input, token);
}
