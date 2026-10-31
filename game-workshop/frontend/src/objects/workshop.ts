export type ImageRef = Readonly<{ assetId: string; purpose: string }>;
export type World = Readonly<{
  background: string;
  conflict: string;
  rules: string;
  visual: string;
  preserve: string;
  freedom: string;
  images: readonly ImageRef[];
}>;
export type Character = Readonly<{
  id: string;
  name: string;
  identity: string;
  faction: string;
  background: string;
  personality: string;
  catchphrase: string;
  relationships: string;
  skills: string;
  role: string;
  preserve: string;
  freedom: string;
  images: readonly ImageRef[];
}>;
export type GameInput = Readonly<{
  title: string;
  genreId: string;
  reference: string;
  mechanics: string;
  requirements: string;
  world: World;
  characters: readonly Character[];
}>;
export type Genre = Readonly<{
  id: string;
  family: string;
  name: string;
  description: string;
  controls: string;
  loop: string;
  victory: string;
  mechanics: readonly string[];
  prompt: string;
  support: string;
  scope: string;
}>;
export type PlanSection = Readonly<{ title: string; content: string }>;
export type RuntimeSettings = Readonly<{ difficulty: number; rounds: number }>;
export type DesignPlan = Readonly<{
  inputVersion: number;
  source: GameInput;
  additions: readonly PlanSection[];
  unresolved: readonly string[];
  settings: RuntimeSettings;
  confirmed: boolean;
  engine: string;
}>;
export type ArtworkBinding = Readonly<{
  slotId: string;
  revisionId: string;
  originalAssetId: string;
  processedAssetId: string;
  originalHash: string;
  processedHash: string;
}>;
export type GameArtifact = Readonly<{
  id: string;
  projectId: string;
  version: number;
  genreId: string;
  title: string;
  characters: readonly Character[];
  world: World;
  settings: RuntimeSettings;
  engine: string;
  artworkBindings?: readonly ArtworkBinding[];
}>;
export type Project = Readonly<{
  id: string;
  ownerId: string;
  version: number;
  input: GameInput;
  plan: DesignPlan | null;
  artifact: GameArtifact | null;
  updatedAt: string;
}>;
export type Asset = Readonly<{ id: string; mime: string; base64: string }>;
export type Session = Readonly<{ ownerId: string; token: string }>;
export type TaskStatus =
  | "pending"
  | "running"
  | "blocked"
  | "failed"
  | "succeeded"
  | "obsolete";
export type ArtworkBrief = Readonly<{
  slotId: string;
  kind: string;
  subject: string;
  prompt: string;
  referenceAssetIds: readonly string[];
  aspectRatio: string;
  projectVersion: number;
}>;
export type ArtworkSlot = Readonly<{
  id: string;
  kind: string;
  subject: string;
  brief: ArtworkBrief;
  currentRevisionId: string | null;
  active: boolean;
}>;
export type ArtworkTask = Readonly<{
  id: string;
  slotId: string;
  operation: string;
  instruction: string;
  brief: ArtworkBrief;
  baseRevisionId: string | null;
  requestId: string;
  status: TaskStatus;
  attempts: number;
  leaseToken: string | null;
  leaseUntil: number;
  error: string | null;
}>;
export type ArtworkRevision = Readonly<{
  id: string;
  slotId: string;
  originalAssetId: string;
  processedAssetId: string;
  originalHash: string;
  processedHash: string;
  parentRevisionId: string | null;
  sourceProjectVersion: number;
  provider: string;
  instruction: string;
  createdAt: string;
}>;
export type ArtworkManifest = Readonly<{
  projectId: string;
  revision: number;
  slots: readonly ArtworkSlot[];
  tasks: readonly ArtworkTask[];
  history: readonly ArtworkRevision[];
}>;
export type BuildStatus =
  | "waiting_for_provider"
  | "artwork_pending"
  | "artwork_failed"
  | "prototype_ready";
export type GameBuildResult = Readonly<{
  status: BuildStatus;
  project: Project;
  artwork: ArtworkManifest;
  message: string;
}>;
export type GameAssets = Readonly<Record<string, string>>;
