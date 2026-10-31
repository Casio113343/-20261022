import type { ArtworkTask } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function processArtworkTask(
  input: { projectId: string; taskId: string },
  token?: string,
): Promise<ArtworkTask> {
  return send<ArtworkTask>("ProcessArtworkTaskMessage", input, token);
}
