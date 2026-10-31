import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function revisePlan(
  input: {
    projectId: string;
    expectedVersion: number;
    additions: readonly PlanSection[];
    settings: RuntimeSettings;
  },
  token?: string,
): Promise<Project> {
  return send<Project>("RevisePlanMessage", input, token);
}
