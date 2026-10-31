import type {
  Genre,
  Project,
  GameInput,
  PlanSection,
  RuntimeSettings,
  Asset,
} from "../../objects/workshop";
import { send } from "../../system/api/client";
export function uploadAsset(
  input: { mime: string; base64: string },
  token?: string,
): Promise<Asset> {
  return send<Asset>("UploadAssetMessage", input, token);
}
