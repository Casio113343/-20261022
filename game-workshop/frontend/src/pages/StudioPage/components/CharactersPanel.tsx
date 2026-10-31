import { Plus, Trash2, UserRound } from "lucide-react";
import type { Character } from "../../../objects/workshop";
import { Field, secondary } from "../../../components/ui/Field";
import { newCharacter } from "../functions/draft";
import { ImagePicker } from "./ImagePicker";
export function CharactersPanel({
  characters,
  onChange,
  token,
}: {
  characters: readonly Character[];
  onChange: (v: readonly Character[]) => void;
  token?: string;
}) {
  function patch(id: string, changes: Partial<Character>) {
    onChange(characters.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }
  const fields = [
    ["name", "名字", "角色名称"],
    ["identity", "身份", "职业或身份"],
    ["faction", "所属阵营", "属于哪一方"],
    ["role", "玩法定位", "输出、辅助、防守等"],
    ["personality", "已知性格", "性格特点与行为习惯"],
    ["catchphrase", "口头禅 / 说话方式", "“这一次，交给我。”"],
    ["skills", "想要的技能 / 武器", "用日常语言描述希望的能力"],
    ["background", "背景经历", "人物的过去"],
    ["relationships", "人物关系", "与其他人物有什么联系"],
    ["preserve", "必须保留的特点", "哪些设定不能改变"],
    ["freedom", "允许系统补充", "哪些内容可以自由设计"],
  ] as const;
  return (
    <section
      id="characters"
      className="scroll-mt-6 space-y-5 border-t border-line pt-9"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 text-xs font-semibold tracking-widest text-accent">
            03 / CHARACTERS
          </div>
          <h2 className="text-xl font-semibold">让角色走进你的世界</h2>
          <p className="mt-2 text-sm text-muted">
            填写已知信息就好，不需要先写完一份人物传记。
          </p>
        </div>
        <button
          type="button"
          disabled={characters.length >= 12}
          className={secondary}
          onClick={() =>
            onChange([...characters, newCharacter(crypto.randomUUID())])
          }
        >
          <Plus size={16} />
          添加人物
        </button>
      </div>
      {characters.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-10 text-center">
          <UserRound className="mx-auto mb-3 text-muted/50" size={30} />
          <p className="text-sm text-muted">第一位英雄，会是谁？</p>
          <p className="mt-2 text-xs text-muted">
            人物可暂时留空，最多添加12位。
          </p>
        </div>
      )}
      {characters.map((c, i) => (
        <details
          open
          key={c.id}
          className="rounded-2xl border border-line bg-white p-5"
        >
          <summary className="cursor-pointer text-sm font-semibold">
            {String(i + 1).padStart(2, "0")} / {c.name || `未命名人物 ${i + 1}`}
          </summary>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {fields.map(([key, label, hint]) => (
              <Field key={key} label={label}>
                {[
                  "name",
                  "identity",
                  "faction",
                  "role",
                  "catchphrase",
                ].includes(key) ? (
                  <input
                    maxLength={6000}
                    value={c[key]}
                    placeholder={hint}
                    onChange={(e) => patch(c.id, { [key]: e.target.value })}
                  />
                ) : (
                  <textarea
                    rows={2}
                    maxLength={6000}
                    value={c[key]}
                    placeholder={hint}
                    onChange={(e) => patch(c.id, { [key]: e.target.value })}
                  />
                )}
              </Field>
            ))}
          </div>
          <div className="mt-5">
            <ImagePicker
              images={c.images}
              token={token}
              onChange={(images) => patch(c.id, { images })}
            />
          </div>
          <button
            type="button"
            className="mt-4 flex items-center gap-1 text-xs text-red-700"
            onClick={() => {
              if (
                window.confirm(`删除「${c.name || `人物${i + 1}`}」及其资料？`)
              )
                onChange(characters.filter((x) => x.id !== c.id));
            }}
          >
            <Trash2 size={14} />
            删除人物
          </button>
        </details>
      ))}
    </section>
  );
}
