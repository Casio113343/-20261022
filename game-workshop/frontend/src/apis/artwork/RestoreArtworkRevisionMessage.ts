import type { ArtworkManifest } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function restoreArtworkRevision(
  input: {
    projectId: string;
    expectedVersion: number;
    expectedManifestRevision: number;
    revisionId: string;
  },
  token?: string,
): Promise<ArtworkManifest> {
  return send<ArtworkManifest>("RestoreArtworkRevisionMessage", input, token);
}
