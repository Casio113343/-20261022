import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function createProject(
  input: { requestId: string; input: GameInput },
  token?: string,
): Promise<Project> {
  return send<Project>("CreateProjectMessage", input, token);
}
