import type { ArtworkManifest } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function getArtworkManifest(
  input: { projectId: string },
  token?: string,
): Promise<ArtworkManifest> {
  return send<ArtworkManifest>("GetArtworkManifestMessage", input, token);
}
