import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function listCharacterDesigns(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListCharacterDesignsMessage", input, token);
}
