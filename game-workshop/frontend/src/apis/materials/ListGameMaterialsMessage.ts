import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function listGameMaterials(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListGameMaterialsMessage", input, token);
}
