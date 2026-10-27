import type { Action, AppState, Conversation, SavedState } from './types';
import { assessDirection } from './companionship';

export function initialState(): AppState {
  return {
    version: 1,
    conversations: [],
    favourites: [],
    moods: [],
    preferences: { nickname: '', remember: false, reducedMotion: false },
    ready: false,
    pending: null,
  };
}
export function savedPart(state: AppState): SavedState {
  return {
    version: 1,
    conversations: state.conversations,
    favourites: state.favourites,
    moods: state.moods,
    preferences: state.preferences,
  };
}
export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...initialState(), ...(action.saved ?? {}), ready: true };
    case 'send': {
      if (state.pending) return state;
      const existing = state.conversations.find(
        (c) => c.id === action.conversationId,
      );
      const conversation: Conversation = existing
        ? {
            ...existing,
            messages: [...existing.messages, action.message],
            updatedAt: action.message.createdAt,
          }
        : {
            id: action.conversationId,
            title: action.message.content.slice(0, 22),
            createdAt: action.message.createdAt,
            updatedAt: action.message.createdAt,
            messages: [action.message],
            direction: null,
          };
      return {
        ...state,
        conversations: [
          conversation,
          ...state.conversations.filter((c) => c.id !== conversation.id),
        ],
        pending: {
          conversationId: conversation.id,
          requestId: action.requestId,
        },
      };
    }
    case 'receive': {
      if (
        state.pending?.requestId !== action.requestId ||
        state.pending.conversationId !== action.conversationId
      )
        return state;
      return {
        ...state,
        pending: null,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.conversationId) return c;
          const next = {
            ...c,
            messages: [...c.messages, action.message],
            updatedAt: action.message.createdAt,
          };
          return { ...next, direction: assessDirection(next, 3) };
        }),
      };
    }
    case 'delete':
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.id),
        pending:
          state.pending?.conversationId === action.id ? null : state.pending,
      };
    case 'favourite':
      return {
        ...state,
        favourites: state.favourites.includes(action.id)
          ? state.favourites.filter((id) => id !== action.id)
          : [...state.favourites, action.id],
      };
    case 'mood':
      return { ...state, moods: [action.mood, ...state.moods] };
    case 'deleteMood':
      return { ...state, moods: state.moods.filter((m) => m.id !== action.id) };
    case 'preferences':
      return { ...state, preferences: action.preferences };
    case 'clear':
      return { ...initialState(), ready: true };
  }
}
