import { Globe2 } from "lucide-react";
import { Field } from "../../../components/ui/Field";
import type { World } from "../../../objects/workshop";
import { ImagePicker } from "../../../components/ui/ImagePicker";
export function WorldPanel({
  world,
  onChange,
  token,
}: {
  world: World;
  onChange: (v: World) => void;
  token?: string;
}) {
  const fields = [
    ["conflict", "阵营与冲突", "谁与谁，因为什么而对立？"],
    ["rules", "特殊规则", "例如：魔法会消耗自己的记忆"],
    ["visual", "场景与视觉", "地点、色调、画风与氛围"],
    ["preserve", "必须保留的设定", "系统不能改变的内容"],
    ["freedom", "允许补充的范围", "例如：地名、普通敌人与支线背景"],
  ] as const;
  return (
    <section
      id="world"
      className="scroll-mt-6 space-y-5 border-t border-line pt-9"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-xs font-semibold tracking-widest text-accent">
            02 / WORLD BUILDING
          </div>
          <h2 className="text-xl font-semibold">这个世界，由你定义</h2>
          <p className="mt-2 text-sm text-muted">
            一段背景、一条规则，或一张地图，都可以成为起点。
          </p>
        </div>
        <Globe2 className="text-mint/40" size={32} />
      </div>
      <Field label="世界背景" hint="可以直接粘贴已有设定，也可以只写一个想法">
        <textarea
          rows={4}
          maxLength={6000}
          placeholder="例如：一座漂浮在云海上的城市，居民用记忆交换能源……"
          value={world.background}
          onChange={(e) => onChange({ ...world, background: e.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([key, label, hint]) => (
          <Field key={key} label={label}>
            <textarea
              rows={2}
              maxLength={6000}
              placeholder={hint}
              value={world[key]}
              onChange={(e) => onChange({ ...world, [key]: e.target.value })}
            />
          </Field>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">世界参考图片</h3>
        <ImagePicker
          images={world.images}
          onChange={(images) => onChange({ ...world, images })}
          token={token}
          limit={6}
        />
      </div>
    </section>
  );
}
