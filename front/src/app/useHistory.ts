"use client";

import { StoredMessage } from "@langchain/core/messages";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "history";

const historyForHydration: History = {
  version: "1",
  sessions: {},
  isHydrating: true,
};
const initialHistory: History = {
  version: "1",
  sessions: {},
  isHydrating: false,
};

export function useHistory() {
  const json = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? JSON.stringify(initialHistory),
    () => JSON.stringify(historyForHydration),
  );
  const history = useMemo<History>(() => JSON.parse(json), [json]);
  const saveSession = useCallback(
    (id: string, messages: StoredMessage[]) => {
      const updatedHistory = {
        ...history,
        sessions: { ...history.sessions, [id]: messages },
      };
      localStorage.setItem(KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event("storage"));
    },
    [history],
  );
  const deleteSession = useCallback(
    (id: string) => {
      const updatedSessions = { ...history.sessions };
      delete updatedSessions[id];
      const updatedHistory = {
        ...history,
        sessions: updatedSessions,
      };
      localStorage.setItem(KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event("storage"));
    },
    [history],
  );
  return {
    sessions: history.sessions,
    saveSession,
    deleteSession,
    isLoading: history.isHydrating,
  };
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
};
export type History = {
  version: "1";
  isHydrating: boolean;
  sessions: {
    [key: string]: StoredMessage[];
  };
};
