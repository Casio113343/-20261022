import type { Asset, GameArtifact, GameAssets } from "../../objects/workshop";
import { getAsset } from "../../apis/assets/GetAssetMessage";
export function assetUrl(asset: Asset): string {
  if (!["image/png", "image/jpeg"].includes(asset.mime))
    throw new Error("素材不是受支持的图片格式。");
  return `data:${asset.mime};base64,${asset.base64}`;
}
export async function loadGameAssets(
  game: GameArtifact,
  token: string,
): Promise<GameAssets> {
  const pairs = await Promise.all(
    (game.artworkBindings ?? []).map(async (binding) => {
      const asset = await getAsset(binding.processedAssetId, token);
      const bytes = Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0));
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (hash !== binding.processedHash)
        throw new Error(
          `素材「${binding.slotId}」与保存版本的内容不一致，已阻止加载。`,
        );
      const url = assetUrl(asset);
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error(`素材「${binding.slotId}」解码失败，请重新加载。`));
        image.src = url;
      });
      return [binding.slotId, url] as const;
    }),
  );
  return Object.fromEntries(pairs);
}
