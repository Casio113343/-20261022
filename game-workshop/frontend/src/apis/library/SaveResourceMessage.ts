import type {
  CreativeResource,
  ResourceData,
  ResourceLink,
} from "../../objects/library";
import type { Project } from "../../objects/workshop";
import { send } from "../../system/api/client";
export function saveResource(
  input: Readonly<{
    resourceId: string;
    expectedVersion: number;
    data: ResourceData;
  }>,
  token?: string,
): Promise<CreativeResource> {
  return send("SaveResourceMessage", input, token);
}
