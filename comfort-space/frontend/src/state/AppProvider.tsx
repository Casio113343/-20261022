import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { appReducer, initialState, savedPart } from '../domain/reducer';
import { demoReply } from '../domain/companionship';
import type { Action, AppState } from '../domain/types';
import { readSaved, writeSaved } from '../system/storage';

type AppContext = Readonly<{
  state: AppState;
  setApp: React.Dispatch<Action>;
  storageError: boolean;
  send: (text: string, conversationId?: string) => string | null;
}>;
const StateContext = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Store 随 Provider 装配和销毁；纯 reducer 不读取 Store。
  const [store] = useState(() => createStore<AppState>(() => initialState()));
  const state = useStore(store);
  const getAppSnap = (): AppState => store.getState();
  const setApp = (action: Action): void => {
    store.setState((current) => appReducer(current, action), true);
  };
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    setApp({ type: 'hydrate', saved: readSaved() });
  }, []);
  useEffect(() => {
    if (state.ready) setStorageError(!writeSaved(savedPart(state)));
  }, [state]);
  useEffect(() => {
    const pending = state.pending;
    if (!pending) return;
    const conversation = state.conversations.find(
      (c) => c.id === pending.conversationId,
    );
    if (!conversation) return;
    const timer = setTimeout(
      () =>
        setApp({
          type: 'receive',
          conversationId: pending.conversationId,
          requestId: pending.requestId,
          message: {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: demoReply(conversation),
            createdAt: new Date().toISOString(),
          },
        }),
      850,
    );
    return () => clearTimeout(timer);
  }, [state.pending, state.conversations]);
  const send = (text: string, conversationId?: string): string | null => {
    const content = text.trim();
    const snapshot = getAppSnap();
    if (
      !snapshot.ready ||
      snapshot.pending ||
      !content ||
      content.length > 2000
    )
      return null;
    const id = conversationId ?? crypto.randomUUID();
    setApp({
      type: 'send',
      conversationId: id,
      requestId: crypto.randomUUID(),
      message: {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      },
    });
    return id;
  };
  return (
    <StateContext.Provider value={{ state, setApp, storageError, send }}>
      {children}
    </StateContext.Provider>
  );
}
export function useApp(): AppContext {
  const context = useContext(StateContext);
  if (!context) throw new Error('useApp requires AppProvider');
  return context;
}
