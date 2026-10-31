import { saveCharacterDesign } from "../../../apis/characters/SaveCharacterDesignMessage";
import { listCharacterDesigns } from "../../../apis/characters/ListCharacterDesignsMessage";
import { saveWorldDesign } from "../../../apis/worldbuilding/SaveWorldDesignMessage";
import { listWorldDesigns } from "../../../apis/worldbuilding/ListWorldDesignsMessage";
import { saveSkillDesign } from "../../../apis/skills/SaveSkillDesignMessage";
import { listSkillDesigns } from "../../../apis/skills/ListSkillDesignsMessage";
import { saveGameMaterial } from "../../../apis/materials/SaveGameMaterialMessage";
import { listGameMaterials } from "../../../apis/materials/ListGameMaterialsMessage";
import { saveImageEdit } from "../../../apis/imageediting/SaveImageEditMessage";
import { listImageEdits } from "../../../apis/imageediting/ListImageEditsMessage";
import { savePromotion } from "../../../apis/promotion/SavePromotionMessage";
import { listPromotions } from "../../../apis/promotion/ListPromotionsMessage";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { resourceKinds } from "../../../objects/library";
import type {
  CreativeResource,
  ResourceData,
  ResourceKind,
} from "../../../objects/library";
import type { Session } from "../../../objects/workshop";
import { openSession } from "../../../system/api/client";
import { listResources } from "../../../apis/library/ListResourcesMessage";

import { emptyResource, validateResource } from "../functions/resources";
const savers = {
  character: saveCharacterDesign,
  world: saveWorldDesign,
  skill: saveSkillDesign,
  asset: saveGameMaterial,
  edit: saveImageEdit,
  promo: savePromotion,
};
const loaders = {
  character: listCharacterDesigns,
  world: listWorldDesigns,
  skill: listSkillDesigns,
  asset: listGameMaterials,
  edit: listImageEdits,
  promo: listPromotions,
};
export function useLibrary(service?: ResourceKind) {
  const [params, setParams] = useSearchParams();
  const [resources, setResources] = useState<readonly CreativeResource[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [draft, setDraft] = useState<ResourceData>(emptyResource("character"));
  const [current, setCurrent] = useState<CreativeResource | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);
  const newId = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    setReady(false);
    setError("");
    openSession()
      .then(async (s) => {
        const rs = await (service ? loaders[service] : listResources)(
          {},
          s.token,
        );
        if (active) {
          setSession(s);
          setResources(rs);
          const selected = rs.find((r) => r.id === params.get("id"));
          setCurrent(selected ?? null);
          setDraft(
            selected?.history.at(-1)?.data ?? {
              ...emptyResource(
                service ??
                  resourceKinds.find((k) => k.id === params.get("kind"))?.id ??
                  "character",
              ),
              ...(params.get("sourceProject") && params.get("revision")
                ? {
                    kind: "asset" as const,
                    source: {
                      projectId: params.get("sourceProject")!,
                      revisionId: params.get("revision")!,
                    },
                    title: params.get("title") ?? "生成美术素材",
                  }
                : {}),
            },
          );
          newId.current = null;
          setReady(true);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "资源加载失败");
      });
    return () => {
      active = false;
    };
  }, [params, attempt, service]);
  function begin(kind: ResourceKind) {
    if (!window.confirm("打开新创作？未保存的编辑内容将不保留。")) return;
    setParams({ kind });
    setCurrent(null);
    setDraft(emptyResource(kind));
    newId.current = null;
    setNotice("");
  }
  function select(r: CreativeResource) {
    if (!window.confirm("打开这项资源？未保存的编辑内容将不保留。")) return;
    setParams({ id: r.id });
    setNotice("");
  }
  async function save() {
    if (!session || lock.current) return;
    const invalid = validateResource(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!newId.current) newId.current = crypto.randomUUID();
      const saved = await savers[draft.kind](
        {
          resourceId: current?.id ?? newId.current,
          expectedVersion: current?.version ?? 0,
          data: draft,
        },
        session.token,
      );
      setCurrent(saved);
      setResources((old) => [saved, ...old.filter((r) => r.id !== saved.id)]);
      setNotice(`已保存版本 ${saved.version}，已有游戏不会自动更新。`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    resources,
    session,
    draft,
    setDraft,
    current,
    ready,
    busy,
    error,
    notice,
    begin,
    select,
    save,
    reload: () => setAttempt((v) => v + 1),
  };
}
