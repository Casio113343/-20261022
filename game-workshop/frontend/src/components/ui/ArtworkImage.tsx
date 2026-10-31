import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getAsset } from "../../apis/assets/GetAssetMessage";
import { assetUrl } from "../../system/api/assets";
export function ArtworkImage({
  assetId,
  token,
  alt,
  className = "",
}: {
  assetId: string;
  token: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setUrl("");
    setError(false);
    getAsset(assetId, token)
      .then((asset) => {
        if (active) setUrl(assetUrl(asset));
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [assetId, token, attempt]);
  if (error)
    return (
      <div
        className={`flex min-h-32 flex-col items-center justify-center gap-2 text-xs text-muted ${className}`}
      >
        <ImageOff size={23} />
        <span>图片加载失败</span>
        <button className="underline" onClick={() => setAttempt((v) => v + 1)}>
          重新加载
        </button>
      </div>
    );
  return url ? (
    <img
      alt={alt}
      src={url}
      className={className}
      onError={() => setError(true)}
    />
  ) : (
    <div
      role="status"
      className={`flex min-h-32 items-center justify-center text-xs text-muted ${className}`}
    >
      加载图片…
    </div>
  );
}
