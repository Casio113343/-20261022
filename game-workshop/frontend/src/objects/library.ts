import type { World, Character, ArtworkRevision } from "./workshop";
export type ResourceKind =
  | "character"
  | "world"
  | "skill"
  | "asset"
  | "edit"
  | "promo";
export type ResourceData = Readonly<{
  kind: ResourceKind;
  title: string;
  description: string;
  content: string;
  world: World | null;
  character: Character | null;
  source: Readonly<{ projectId: string; revisionId: string }> | null;
}>;
export type ResourceVersion = Readonly<{
  version: number;
  data: ResourceData;
  artwork: ArtworkRevision | null;
  artworkKind: string | null;
  createdAt: string;
}>;
export type CreativeResource = Readonly<{
  id: string;
  version: number;
  history: readonly ResourceVersion[];
}>;
export type ResourceLink = Readonly<{
  resourceId: string;
  version: number;
  target: string;
  title: string;
}>;
export const resourceKinds: readonly Readonly<{
  id: ResourceKind;
  name: string;
  intro: string;
  output: string;
}>[] = [
  {
    id: "character",
    name: "角色设计",
    intro: "独立整理名字、性格、经历、技能和视觉要求。",
    output: "接入人物区域；图片需生成后单独选用。",
  },
  {
    id: "world",
    name: "世界观工坊",
    intro: "编写地域、阵营、冲突、世界规则和视觉氛围。",
    output: "接入世界观区域，替换前先确认。",
  },
  {
    id: "skill",
    name: "技能与卡牌设计",
    intro: "记录效果、目标、代价、冷却及参考玩法。",
    output: "接入玩法要求，当前不自动执行自由技能。",
  },
  {
    id: "asset",
    name: "游戏素材制作",
    intro: "保存场景、卡面、道具或图标的制作要求。",
    output: "制作要求可接入游戏；已有生成素材可按用途复用。",
  },
  {
    id: "edit",
    name: "美术修改",
    intro: "记录指定图片的局部改动和必须保留的部分。",
    output: "要求可保存；实际改图仍须在制作页明确选图提交。",
  },
  {
    id: "promo",
    name: "游戏宣传物料",
    intro: "保存封面、宣传海报或展示文案及视觉要求。",
    output: "接入展示资料，不进入游戏战斗规则。",
  },
];
