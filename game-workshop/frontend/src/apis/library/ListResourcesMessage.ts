import type {
  CreativeResource,
  ResourceData,
  ResourceLink,
} from "../../objects/library";
import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function listResources(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListResourcesMessage", input, token);
}
