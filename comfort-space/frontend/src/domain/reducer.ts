import type { Action, AppState, Conversation, SavedState } from './types';

export function initialState(): AppState {
  return {
    version: 1,
    conversations: [],
    favourites: [],
    moods: [],
    preferences: { nickname: '', remember: false, reducedMotion: false },
    ready: false,
    pending: null,
    failedSend: null,
    saving: false,
    error: null,
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
    case 'serverSnapshot':
      return { ...state, ...action.saved, ready: true };
    case 'serverConversation':
      if (
        state.pending?.requestId !== action.requestId ||
        state.pending.conversationId !== action.conversation.id
      )
        return state;
      return {
        ...state,
        pending: null,
        failedSend: null,
        error: null,
        conversations: [
          action.conversation,
          ...state.conversations.filter((c) => c.id !== action.conversation.id),
        ],
      };
    case 'sendFailed':
      if (state.pending?.requestId !== action.request.requestId) return state;
      return {
        ...state,
        pending: null,
        failedSend: action.request,
        error: action.error,
      };
    case 'retry':
      return {
        ...state,
        pending: {
          conversationId: action.request.conversationId,
          requestId: action.request.requestId,
        },
        error: null,
      };
    case 'saving':
      return { ...state, saving: action.value };
    case 'error':
      return { ...state, error: action.error };

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
  }
}
