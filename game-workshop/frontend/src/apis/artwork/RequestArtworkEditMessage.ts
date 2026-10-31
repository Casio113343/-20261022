import type { ArtworkManifest } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function requestArtworkEdit(
  input: {
    projectId: string;
    expectedVersion: number;
    expectedManifestRevision: number;
    requestId: string;
    slotIds: readonly string[];
    instruction: string;
  },
  token?: string,
): Promise<ArtworkManifest> {
  return send<ArtworkManifest>("RequestArtworkEditMessage", input, token);
}
