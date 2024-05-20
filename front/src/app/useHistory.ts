"use client";

import { StoredMessage } from "langchain/schema";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "history";

const initialHistory: History = {
  version: "1",
  sessions: {},
};
const initialHistoryJson = JSON.stringify(initialHistory);

export function useHistory() {
  const json = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? initialHistoryJson,
    () => initialHistoryJson,
  );
  const history = useMemo<History>(() => JSON.parse(json), [json]);
  const saveSession = useCallback(
    (id: string, messages: StoredMessage[]) => {
      history.sessions[id] = messages;
      localStorage.setItem(KEY, JSON.stringify(history));
      window.dispatchEvent(new Event("storage"));
    },
    [history],
  );
  const deleteSession = useCallback(
    (id: string) => {
      delete history.sessions[id];
      localStorage.setItem(KEY, JSON.stringify(history));
      window.dispatchEvent(new Event("storage"));
    },
    [history],
  );
  return { sessions: history.sessions, saveSession, deleteSession };
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
};
export type History = {
  version: "1";
  sessions: {
    [key: string]: StoredMessage[];
  };
};
