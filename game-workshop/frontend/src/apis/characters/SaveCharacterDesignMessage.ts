import type { CreativeResource, ResourceData } from "../../objects/library";
import { send } from "../../system/api/client";
export function saveCharacterDesign(
  input: Readonly<{
    resourceId: string;
    expectedVersion: number;
    data: ResourceData;
  }>,
  token?: string,
): Promise<CreativeResource> {
  return send("SaveCharacterDesignMessage", input, token);
}
