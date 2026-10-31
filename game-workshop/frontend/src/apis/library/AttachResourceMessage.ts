import type {
  CreativeResource,
  ResourceData,
  ResourceLink,
} from "../../objects/library";
import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function attachResource(
  input: Readonly<{
    projectId: string;
    expectedVersion: number;
    resourceId: string;
    resourceVersion: number;
    target: string;
    expectedManifestRevision: number;
  }>,
  token?: string,
): Promise<Project> {
  return send("AttachResourceMessage", input, token);
}
