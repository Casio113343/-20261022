import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function listProjects(input: {}, token?: string): Promise<Project[]> {
  return send<Project[]>("ListProjectsMessage", input, token);
}
