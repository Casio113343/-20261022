import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function listPromotions(
  input: {},
  token?: string,
): Promise<readonly CreativeResource[]> {
  return send("ListPromotionsMessage", input, token);
}
