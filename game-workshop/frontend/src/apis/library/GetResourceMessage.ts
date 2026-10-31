import type {
  CreativeResource,
  ResourceData,
  ResourceLink,
} from "../../objects/library";
import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function getResource(
  input: string,
  token?: string,
): Promise<CreativeResource> {
  return send("GetResourceMessage", input, token);
}
