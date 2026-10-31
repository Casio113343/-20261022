import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function deleteProject(
  input: { projectId: string },
  token?: string,
): Promise<boolean> {
  return send<boolean>("DeleteProjectMessage", input, token);
}
