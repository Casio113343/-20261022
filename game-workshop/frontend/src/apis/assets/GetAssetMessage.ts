import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function getAsset(input: string, token?: string): Promise<Asset> {
  return send<Asset>("GetAssetMessage", input, token);
}
