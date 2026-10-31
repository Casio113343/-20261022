import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function listSkillDesigns(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListSkillDesignsMessage", input, token);
}
