import type {
  CreativeResource,
  ResourceData,
  ResourceLink,
} from "../../objects/library";
import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function listProjectResources(
  input: Readonly<{ projectId: string }>,
  token?: string,
): Promise<readonly ResourceLink[]> {
  return send("ListProjectResourcesMessage", input, token);
}
