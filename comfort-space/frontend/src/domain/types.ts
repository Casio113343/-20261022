import { z } from 'zod';

export const messageSchema = z
  .object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string().max(6000),
    createdAt: z.string(),
  })
  .readonly();
export const directionSchema = z.enum([
  'study',
  'relationships',
  'self',
  'loneliness',
  'change',
]);
export const conversationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    messages: z.array(messageSchema).readonly(),
    direction: directionSchema.nullable(),
  })
  .readonly();
export const moodSchema = z
  .object({
    id: z.string(),
    feeling: z.string(),
    note: z.string().max(1000),
    createdAt: z.string(),
  })
  .readonly();
export const preferenceSchema = z
  .object({
    nickname: z.string().max(20),
    remember: z.boolean(),
    reducedMotion: z.boolean(),
  })
  .readonly();
export const savedSchema = z
  .object({
    version: z.literal(1),
    conversations: z.array(conversationSchema).readonly(),
    favourites: z.array(z.string()).readonly(),
    moods: z.array(moodSchema).readonly(),
    preferences: preferenceSchema,
  })
  .readonly();
export type Message = z.infer<typeof messageSchema>;
export type Direction = z.infer<typeof directionSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Mood = z.infer<typeof moodSchema>;
export type Preferences = z.infer<typeof preferenceSchema>;
export type SavedState = z.infer<typeof savedSchema>;
export type Pending = Readonly<{ conversationId: string; requestId: string }>;
export type AppState = SavedState &
  Readonly<{ ready: boolean; pending: Pending | null }>;
export type Action =
  | Readonly<{ type: 'hydrate'; saved: SavedState | null }>
  | Readonly<{
      type: 'send';
      conversationId: string;
      message: Message;
      requestId: string;
    }>
  | Readonly<{
      type: 'receive';
      conversationId: string;
      requestId: string;
      message: Message;
    }>
  | Readonly<{ type: 'delete'; id: string }>
  | Readonly<{ type: 'favourite'; id: string }>
  | Readonly<{ type: 'mood'; mood: Mood }>
  | Readonly<{ type: 'deleteMood'; id: string }>
  | Readonly<{ type: 'preferences'; preferences: Preferences }>
  | Readonly<{ type: 'clear' }>;
