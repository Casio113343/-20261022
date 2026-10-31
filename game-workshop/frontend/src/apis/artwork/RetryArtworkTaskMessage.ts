import type { ArtworkManifest } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function retryArtworkTask(
  input: { projectId: string; taskId: string },
  token?: string,
): Promise<ArtworkManifest> {
  return send<ArtworkManifest>("RetryArtworkTaskMessage", input, token);
}
