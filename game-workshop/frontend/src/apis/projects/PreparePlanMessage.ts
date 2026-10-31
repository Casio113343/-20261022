import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function preparePlan(
  input: { projectId: string; expectedVersion: number },
  token?: string,
): Promise<Project> {
  return send<Project>("PreparePlanMessage", input, token);
}
