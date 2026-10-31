import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { ImageRef } from "../../objects/workshop";
import { uploadAsset } from "../../apis/assets/UploadAssetMessage";
import { getAsset } from "../../apis/assets/GetAssetMessage";
export function ImagePicker({
  images,
  onChange,
  token,
  limit = 3,
}: {
  images: readonly ImageRef[];
  onChange: (v: readonly ImageRef[]) => void;
  token?: string;
  limit?: number;
}) {
  const [urls, setUrls] = useState<Readonly<Record<string, string>>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef({ images, onChange });
  useEffect(() => {
    latest.current = { images, onChange };
  }, [images, onChange]);
  useEffect(() => {
    let active = true;
    if (token)
      images.forEach((r) => {
        if (!urls[r.assetId])
          getAsset(r.assetId, token)
            .then((a) => {
              if (active)
                setUrls((old) => ({
                  ...old,
                  [a.id]: `data:${a.mime};base64,${a.base64}`,
                }));
            })
            .catch(() => {
              if (active) setError("部分图片加载失败，可以移除后重新上传。");
            });
      });
    return () => {
      active = false;
    };
  }, [images, token, urls]);
  async function upload(file: File) {
    setError("");
    setRetry(file);
    if (!token) {
      setError("会话未就绪");
      return;
    }
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 2097152
    ) {
      setError("只支持PNG/JPEG，每张不超过2MB。");
      return;
    }
    setBusy(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.readAsDataURL(file);
      });
      const a = await uploadAsset({ mime: file.type, base64 }, token);
      setUrls((old) => ({
        ...old,
        [a.id]: `data:${a.mime};base64,${a.base64}`,
      }));
      const current = latest.current;
      if (current.images.length >= limit)
        throw new Error("图片数量已达到上限，请先移除一张。");
      current.onChange([...current.images, { assetId: a.id, purpose: "" }]);
      setRetry(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((r, i) => (
          <div
            key={r.assetId}
            className="w-32 overflow-hidden rounded-xl border border-line bg-white"
          >
            <div className="relative h-24 bg-paper">
              {urls[r.assetId] ? (
                <img
                  src={urls[r.assetId]}
                  className="h-full w-full object-cover"
                  alt={`参考图片${i + 1}`}
                />
              ) : (
                <span className="p-2 text-xs text-muted">读取图片…</span>
              )}
              <button
                type="button"
                aria-label={`移除图片${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-white p-1"
                onClick={() =>
                  onChange(images.filter((x) => x.assetId !== r.assetId))
                }
              >
                <X size={13} />
              </button>
            </div>
            <input
              aria-label={`图片${i + 1}用途`}
              className="rounded-none border-0 text-xs"
              maxLength={200}
              placeholder="图片用途 / 参考部分"
              value={r.purpose}
              onChange={(e) =>
                onChange(
                  images.map((x) =>
                    x.assetId === r.assetId
                      ? { ...x, purpose: e.target.value }
                      : x,
                  ),
                )
              }
            />
          </div>
        ))}
        {images.length < limit && (
          <button
            type="button"
            disabled={busy || !token}
            onClick={() => input.current?.click()}
            className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted/40 bg-paper/40 text-xs text-muted"
          >
            <ImagePlus size={22} />
            {busy ? "正在上传…" : "添加参考图片"}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <p className="text-xs leading-5 text-muted">
        PNG / JPEG · 单张≤2MB · 最长边≤4096px · 最多{limit}
        张。仅保存参考，不理解图片。
      </p>
      {error && (
        <div role="alert" className="text-xs text-red-700">
          {error}
          {retry && (
            <button
              type="button"
              disabled={busy || images.length >= limit}
              className="ml-2 underline"
              onClick={() => retry && void upload(retry)}
            >
              重试
            </button>
          )}
        </div>
      )}
    </div>
  );
}
