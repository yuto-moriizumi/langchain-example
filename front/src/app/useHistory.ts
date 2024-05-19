"use client";

import { StoredMessage } from "langchain/schema";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "history";

export function useHistory() {
  const json = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem(KEY) ?? "[]",
    () => "[]",
  );
  const history = useMemo<StoredMessage[]>(() => JSON.parse(json), [json]);
  const saveHistory = useCallback((history: StoredMessage[]) => {
    localStorage.setItem(KEY, JSON.stringify(history));
  }, []);
  return { history, saveHistory };
}
