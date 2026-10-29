import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { appReducer, initialState } from '../domain/reducer';
import type {
  Action,
  AppState,
  FailedSend,
  SavedState,
  UserCommand,
} from '../domain/types';
import { BackendError } from '../system/api/send';
import { StartSessionMessage } from '../apis/identity/StartSessionMessage';
import { GetStateMessage } from '../apis/identity/GetStateMessage';
import { ClearDataMessage } from '../apis/identity/ClearDataMessage';
import { UpdatePreferencesMessage } from '../apis/identity/UpdatePreferencesMessage';
import { CreateConversationMessage } from '../apis/conversations/CreateConversationMessage';
import { SendMessageMessage } from '../apis/conversations/SendMessageMessage';
import { DeleteConversationMessage } from '../apis/conversations/DeleteConversationMessage';
import { SetFavouriteMessage } from '../apis/collection/SetFavouriteMessage';
import { AddMoodMessage } from '../apis/journal/AddMoodMessage';
import { DeleteMoodMessage } from '../apis/journal/DeleteMoodMessage';

type AppContext = Readonly<{
  state: AppState;
  setApp: (action: UserCommand) => void;
  retry: () => void;
  send: (text: string, conversationId?: string) => string | null;
}>;
const StateContext = createContext<AppContext | null>(null);
const ignoreMissing = async (operation: Promise<unknown>): Promise<void> => {
  try {
    await operation;
  } catch (error) {
    if (!(error instanceof BackendError && error.status === 404)) throw error;
  }
};
const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : '操作未完成，请重试。';

export function AppProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createStore<AppState>(() => initialState()));
  const state = useStore(store);
  const [generation, setGeneration] = useState(0);
  const [failedMutation, setFailedMutation] = useState<UserCommand | null>(
    null,
  );
  const getAppSnap = (): AppState => store.getState();
  const setLocal = (action: Action): void => {
    store.setState((current) => appReducer(current, action), true);
  };
  // 仅持有当前连接请求的生命周期句柄，防止 StrictMode 重复创建访客身份。
  const connectionAttempt = useRef<Readonly<{
    generation: number;
    result: Promise<SavedState>;
  }> | null>(null);
  useEffect(() => {
    let active = true;
    if (
      !connectionAttempt.current ||
      connectionAttempt.current.generation !== generation
    ) {
      connectionAttempt.current = {
        generation,
        result: new StartSessionMessage()
          .send()
          .then(() => new GetStateMessage().send()),
      };
    }
    void connectionAttempt.current.result
      .then((saved) => {
        if (active) setLocal({ type: 'hydrate', saved });
      })
      .catch((error) => {
        if (active) setLocal({ type: 'error', error: errorText(error) });
      });
    return () => {
      active = false;
    };
  }, [generation]);
  const sendToServer = async (request: FailedSend): Promise<void> => {
    try {
      if (request.isNew)
        await new CreateConversationMessage(request.conversationId).send();
      const conversation = await new SendMessageMessage(
        request.conversationId,
        request.requestId,
        request.content,
      ).send();
      setLocal({
        type: 'serverConversation',
        requestId: request.requestId,
        conversation,
      });
    } catch (error) {
      setLocal({ type: 'sendFailed', request, error: errorText(error) });
    }
  };
  const send = (text: string, conversationId?: string): string | null => {
    const content = text.trim();
    const snapshot = getAppSnap();
    if (
      !snapshot.ready ||
      snapshot.pending ||
      snapshot.failedSend ||
      snapshot.saving ||
      !content ||
      content.length > 2000
    )
      return null;
    const id = conversationId ?? crypto.randomUUID();
    const request: FailedSend = {
      conversationId: id,
      requestId: crypto.randomUUID(),
      content,
      isNew: !snapshot.conversations.some((c) => c.id === id),
    };
    setLocal({
      type: 'send',
      conversationId: id,
      requestId: request.requestId,
      message: {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      },
    });
    void sendToServer(request);
    return id;
  };
  const mutate = async (action: UserCommand): Promise<void> => {
    const snapshot = getAppSnap();
    if (
      !snapshot.ready ||
      snapshot.pending ||
      snapshot.failedSend ||
      snapshot.saving
    ) {
      if (snapshot.ready)
        setLocal({
          type: 'error',
          error: '请先等待当前操作完成，或重试未完成的消息。',
        });
      return;
    }
    setLocal({ type: 'saving', value: true });
    setLocal({ type: 'error', error: null });
    try {
      switch (action.type) {
        case 'delete':
          await ignoreMissing(new DeleteConversationMessage(action.id).send());
          break;
        case 'favourite':
          await new SetFavouriteMessage(
            action.id,
            !snapshot.favourites.includes(action.id),
          ).send();
          break;
        case 'mood':
          await new AddMoodMessage(
            action.mood.id,
            action.mood.feeling,
            action.mood.note,
          ).send();
          break;
        case 'deleteMood':
          await ignoreMissing(new DeleteMoodMessage(action.id).send());
          break;
        case 'preferences':
          await new UpdatePreferencesMessage(action.preferences).send();
          break;
        case 'clear':
          await new ClearDataMessage().send();
          break;
        default:
          return;
      }
      const saved = await new GetStateMessage().send();
      setLocal({ type: 'serverSnapshot', saved });
      setFailedMutation(null);
    } catch (error) {
      setFailedMutation(action);
      setLocal({ type: 'error', error: errorText(error) });
    } finally {
      setLocal({ type: 'saving', value: false });
    }
  };
  const setApp = (action: UserCommand): void => {
    void mutate(action);
  };
  const retry = (): void => {
    const snapshot = getAppSnap();
    if (snapshot.pending || snapshot.saving) return;
    if (snapshot.failedSend) {
      setLocal({ type: 'retry', request: snapshot.failedSend });
      void sendToServer(snapshot.failedSend);
    } else if (failedMutation) {
      void mutate(failedMutation);
    } else {
      setLocal({ type: 'error', error: null });
      setGeneration((n) => n + 1);
    }
  };
  return (
    <StateContext.Provider value={{ state, setApp, retry, send }}>
      {children}
    </StateContext.Provider>
  );
}
export function useApp(): AppContext {
  const context = useContext(StateContext);
  if (!context) throw new Error('useApp requires AppProvider');
  return context;
}
