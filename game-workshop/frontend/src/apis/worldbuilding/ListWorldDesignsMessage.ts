import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function listWorldDesigns(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListWorldDesignsMessage", input, token);
}
