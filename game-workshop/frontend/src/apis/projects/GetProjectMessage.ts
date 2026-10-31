import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function getProject(
  input: { projectId: string },
  token?: string,
): Promise<Project> {
  return send<Project>("GetProjectMessage", input, token);
}
