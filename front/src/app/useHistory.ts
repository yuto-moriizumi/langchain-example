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
