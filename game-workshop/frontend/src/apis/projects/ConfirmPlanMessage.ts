import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function confirmPlan(
  input: { projectId: string; expectedVersion: number },
  token?: string,
): Promise<Project> {
  return send<Project>("ConfirmPlanMessage", input, token);
}
