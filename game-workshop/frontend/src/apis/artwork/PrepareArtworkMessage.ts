import type { ArtworkManifest } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function prepareArtwork(
  input: { projectId: string; expectedVersion: number },
  token?: string,
): Promise<ArtworkManifest> {
  return send<ArtworkManifest>("PrepareArtworkMessage", input, token);
}
