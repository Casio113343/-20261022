import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function savePromotion(
  input: Readonly<{
    resourceId: string;
    expectedVersion: number;
    data: ResourceData;
  }>,
  token?: string,
): Promise<CreativeResource> {
  return send("SavePromotionMessage", input, token);
}
